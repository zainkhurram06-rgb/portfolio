"""
Running Apify scrapers for EDITH, with a hard spending cap on every run.

    APIFY_TOKEN   your Apify API token (Apify console, Settings, API & Integrations)
    EDITH_APIFY   "live" to really run, anything else uses saved samples (default)

Samples live in samples/apify/<scraper>.json. Dates written as "{days_ago:N}"
become real dates N days before today, so the samples never go stale.
"""

import json
import os
import re
import time
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import List, Optional

import requests

API = "https://api.apify.com/v2"
SAMPLES = Path(__file__).resolve().parents[2] / "samples" / "apify"

GOOGLE_MAPS = "compass/crawler-google-places"
INSTAGRAM = "apify/instagram-profile-scraper"
FACEBOOK = "apify/facebook-posts-scraper"

# free-tier prices, used for the estimate EDITH prints before spending anything
PRICE = {GOOGLE_MAPS: 0.004, INSTAGRAM: 0.0026, FACEBOOK: 0.005}


class ApifyError(Exception):
    pass


def estimate(actor: str, items: int) -> float:
    return round(PRICE.get(actor, 0.005) * items + 0.01, 2)


class LiveApify:
    """The real thing. Starts a run, waits for it, returns its results."""

    def __init__(self, token: Optional[str] = None, poll: float = 5.0, log=print):
        self.token = token or os.environ.get("APIFY_TOKEN", "")
        if not self.token:
            raise ApifyError("APIFY_TOKEN is not set. Get it from the Apify console: Settings, API & Integrations")
        self.poll = poll
        self.log = log
        self.spent = 0.0

    def _get(self, path: str, **params):
        r = requests.get(f"{API}{path}", params=params, headers={"Authorization": f"Bearer {self.token}"}, timeout=60)
        if r.status_code >= 400:
            raise ApifyError(f"Apify said {r.status_code}: {r.text[:300]}")
        return r.json()

    def run(self, actor: str, payload: dict, max_usd: float, timeout_min: int = 90) -> List[dict]:
        # Apify itself stops the run once it has charged max_usd, whatever happens here
        r = requests.post(f"{API}/acts/{actor.replace('/', '~')}/runs", json=payload,
                          params={"maxTotalChargeUsd": f"{max_usd:.2f}"},
                          headers={"Authorization": f"Bearer {self.token}"}, timeout=60)
        if r.status_code >= 400:
            raise ApifyError(f"couldn't start {actor}: {r.status_code} {r.text[:300]}")
        run = r.json()["data"]
        deadline = time.time() + timeout_min * 60
        while run["status"] in ("READY", "RUNNING"):
            if time.time() > deadline:
                raise ApifyError(f"{actor} is still running after {timeout_min} minutes")
            time.sleep(self.poll)
            run = self._get(f"/actor-runs/{run['id']}")["data"]
        cost = float(run.get("usageTotalUsd") or 0)
        self.spent += cost
        self.log(f"EDITH: {actor} finished ({run['status'].lower()}), cost ${cost:.2f}")
        if run["status"] not in ("SUCCEEDED", "ABORTED", "TIMED-OUT"):
            raise ApifyError(f"{actor} {run['status'].lower()}")
        items = self._get(f"/datasets/{run['defaultDatasetId']}/items", clean="true", format="json")
        return items if isinstance(items, list) else []


DAYS_AGO = re.compile(r"\{days_ago:(\d+)\}")


def _fill_dates(text: str) -> str:
    now = datetime.now(timezone.utc)
    return DAYS_AGO.sub(lambda m: (now - timedelta(days=int(m.group(1)))).strftime("%Y-%m-%dT%H:%M:%S.000Z"), text)


class SampleApify:
    """Saved results, so EDITH can be built and tested with no token and no cost."""

    def __init__(self, folder: Path = SAMPLES, log=print):
        self.folder = folder
        self.log = log
        self.spent = 0.0

    def run(self, actor: str, payload: dict, max_usd: float, timeout_min: int = 0) -> List[dict]:
        f = self.folder / f"{actor.split('/')[-1]}.json"
        if not f.exists():
            raise ApifyError(f"no sample for {actor} ({f.name})")
        items = json.loads(_fill_dates(f.read_text(encoding="utf-8")))
        if actor == INSTAGRAM:
            wanted = {u.lower() for u in payload.get("usernames", [])}
            items = [i for i in items if i.get("username", "").lower() in wanted]
        elif actor == FACEBOOK:
            wanted = {u["url"].rstrip("/").lower() for u in payload.get("startUrls", [])}
            items = [i for i in items if i.get("facebookUrl", "").rstrip("/").lower() in wanted]
        elif actor == GOOGLE_MAPS:
            terms = {t.lower() for t in payload.get("searchStringsArray", [])}
            items = [i for i in items if i.get("searchString", "").lower() in terms]
        self.log(f"EDITH: {actor} from saved samples, {len(items)} results")
        return items


def client(log=print):
    return LiveApify(log=log) if os.environ.get("EDITH_APIFY", "sample") == "live" else SampleApify(log=log)
