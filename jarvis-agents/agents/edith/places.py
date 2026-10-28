"""
Google Places API (New) for EDITH: finds businesses on Google Maps, with a hard
spending cap and a running count against Google's free monthly allowance.

    GOOGLE_PLACES_KEY   an API key with "Places API (New)" switched on
    EDITH_PLACES        "live" to really search, anything else uses saved samples (default)

Prices (checked 28 Oct 2026). EDITH needs phone, website and reviews, which puts
every search in Google's "Text Search Enterprise" tier: the first 1,000 searches a
month are free, then $35 per 1,000. One search is one page of up to 20 places,
and one query never gives more than 60, so a city is split into map tiles. Finding
a city's outline is a "Text Search Pro" search: 5,000 a month free.

Usage is counted in pipeline/edith-usage.json, month by month.
"""

import json
import os
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional, Tuple

import requests

from .. import pipeline

URL = "https://places.googleapis.com/v1/places:searchText"
SAMPLES = Path(__file__).resolve().parents[2] / "samples" / "edith"

FIELDS = ",".join([
    "places.id", "places.displayName", "places.formattedAddress", "places.addressComponents", "places.businessStatus",
    "places.primaryTypeDisplayName", "places.nationalPhoneNumber", "places.internationalPhoneNumber", "places.websiteUri",
    "places.rating", "places.userRatingCount", "places.googleMapsUri", "nextPageToken",
])
BOX_FIELDS = "places.displayName,places.viewport"

FREE = {"search": 1000, "box": 5000}
USD = {"search": 0.035, "box": 0.032}
PAGES_PER_QUERY = 3                            # 3 pages of 20 is all Google gives for one query

Box = Tuple[float, float, float, float]        # south, west, north, east


class PlacesError(Exception):
    pass


class OverBudget(PlacesError):
    pass


# ---------------------------------------------------------------- usage

def usage_file() -> Path:
    return pipeline.ROOT / "edith-usage.json"


def usage() -> dict:
    f = usage_file()
    return json.loads(f.read_text(encoding="utf-8")) if f.exists() else {}


def _save_usage(u: dict):
    f = usage_file()
    f.parent.mkdir(parents=True, exist_ok=True)
    f.write_text(json.dumps(u, indent=2) + "\n", encoding="utf-8")


def this_month(kind: str, month: Optional[str] = None) -> int:
    return usage().get(month or datetime.now().strftime("%Y-%m"), {}).get(kind, 0)


def month_cost(month: Optional[str] = None) -> float:
    """What Google charges this month, after the free allowance."""
    return round(sum(max(0, this_month(k, month) - FREE[k]) * USD[k] for k in FREE), 2)


def _count(kind: str, n: int = 1):
    u = usage()
    m = u.setdefault(datetime.now().strftime("%Y-%m"), {})
    m[kind] = m.get(kind, 0) + n
    _save_usage(u)


# ---------------------------------------------------------------- one place, in EDITH's words

def _street(components: List[dict]) -> Optional[str]:
    parts = {t: c.get("longText") for c in components for t in c.get("types", [])}
    bits = [parts.get(k) for k in ("subpremise", "premise", "street_number", "route") if parts.get(k)]
    return ", ".join(bits) if bits else None


def tidy(p: dict) -> dict:
    """A Places API result as the plain record EDITH works with."""
    return {
        "id": p.get("id"),
        "name": (p.get("displayName") or {}).get("text") or "?",
        "category": (p.get("primaryTypeDisplayName") or {}).get("text") or "",
        "address": p.get("formattedAddress"),
        "street": _street(p.get("addressComponents") or []),
        "phone": p.get("internationalPhoneNumber") or p.get("nationalPhoneNumber"),
        "website": p.get("websiteUri"),
        "rating": p.get("rating"),
        "reviews": p.get("userRatingCount") or 0,
        "maps_url": p.get("googleMapsUri"),
        "closed": p.get("businessStatus") in ("CLOSED_PERMANENTLY", "CLOSED_TEMPORARILY"),
    }


def split(b: Box) -> List[Box]:
    s, w, n, e = b
    mx, my = (w + e) / 2, (s + n) / 2
    return [(s, w, my, mx), (s, mx, my, e), (my, w, n, mx), (my, mx, n, e)]


# ---------------------------------------------------------------- the real thing

class LivePlaces:
    def __init__(self, key: Optional[str] = None, max_usd: float = 5.0, free_only: bool = True, max_depth: int = 2,
                 language: str = "en", log=print):
        self.key = key or os.environ.get("GOOGLE_PLACES_KEY", "")
        if not self.key:
            raise PlacesError("GOOGLE_PLACES_KEY is not set. Make one in Google Cloud: APIs & Services, Credentials, "
                              "with Places API (New) switched on")
        self.max_usd, self.free_only, self.max_depth, self.language, self.log = max_usd, free_only, max_depth, language, log
        self.spent = 0.0
        self.searches = 0

    def _post(self, kind: str, body: dict, fields: str) -> dict:
        used = this_month(kind)
        paid = used >= FREE[kind]
        if paid and self.free_only:
            raise OverBudget(f"this month's free Google allowance is used up ({FREE[kind]} searches). "
                             "Set stay_in_free_allowance to false in rules.json to keep going (about $0.035 a search)")
        if paid and self.spent + USD[kind] > self.max_usd:
            raise OverBudget(f"spending cap for this run reached (${self.max_usd:.2f})")
        r = requests.post(URL, json=body, timeout=30,
                          headers={"X-Goog-Api-Key": self.key, "X-Goog-FieldMask": fields, "Content-Type": "application/json"})
        _count(kind)
        if paid:
            self.spent = round(self.spent + USD[kind], 3)
        if kind == "search":
            self.searches += 1
        if r.status_code >= 400:
            raise PlacesError(f"Google said {r.status_code}: {r.text[:300]}")
        return r.json()

    def city_box(self, city: str, country: str) -> Box:
        found = self._post("box", {"textQuery": f"{city}, {country}", "pageSize": 1, "languageCode": self.language}, BOX_FIELDS)
        places = found.get("places") or []
        v = places[0].get("viewport") if places else None
        if not v:
            raise PlacesError(f"Google doesn't know a city called {city}, {country}")
        return (v["low"]["latitude"], v["low"]["longitude"], v["high"]["latitude"], v["high"]["longitude"])

    def _query(self, term: str, box: Box, region: str) -> List[dict]:
        s, w, n, e = box
        body = {"textQuery": term, "pageSize": 20, "languageCode": self.language, "regionCode": region.upper(),
                "locationRestriction": {"rectangle": {"low": {"latitude": s, "longitude": w}, "high": {"latitude": n, "longitude": e}}}}
        out = []
        for _ in range(PAGES_PER_QUERY):
            page = self._post("search", body, FIELDS)
            out += page.get("places") or []
            token = page.get("nextPageToken")
            if not token:
                break
            body = {**body, "pageToken": token}
        return out

    def sweep(self, term: str, box: Box, region: str, depth: int = 0) -> List[dict]:
        """Every place for one search term in the box. A full answer (60) means
        Google stopped early, so the box is split in four and searched again."""
        raw = self._query(term, box, region)
        if len(raw) >= 20 * PAGES_PER_QUERY and depth < self.max_depth:
            self.log(f"EDITH: '{term}' has more than {len(raw)} results here, splitting the map")
            for b in split(box):
                raw += self.sweep(term, b, region, depth + 1)
        return raw if depth else [tidy(p) for p in raw]


# ---------------------------------------------------------------- saved samples

class SamplePlaces:
    """Saved results, so EDITH can be built and tested with no key and no cost."""

    def __init__(self, folder: Path = SAMPLES, log=print, **_):
        self.folder, self.log = folder, log
        self.spent = 0.0
        self.searches = 0

    def city_box(self, city: str, country: str) -> Box:
        return (25.0, 55.0, 25.4, 55.5)

    def sweep(self, term: str, box: Box, region: str, depth: int = 0) -> List[dict]:
        data: Dict[str, list] = json.loads((self.folder / "places.json").read_text(encoding="utf-8"))
        self.searches += 1
        found = data.get(term, [])
        self.log(f"EDITH: '{term}' from saved samples, {len(found)} places")
        return [tidy(p) for p in found]


def client(r: dict, log=print):
    opts = dict(max_usd=float(r["max_usd_per_run"]), free_only=bool(r["stay_in_free_allowance"]),
                max_depth=int(r["max_map_splits"]), language=r.get("search_language", "en"), log=log)
    return LivePlaces(**opts) if os.environ.get("EDITH_PLACES", "sample") == "live" else SamplePlaces(log=log)
