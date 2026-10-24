"""
EDITH, the lead tracker. Finds local businesses with no website that are alive
on social media, and drops the good ones into pipeline/1-leads for MARK.

    1. search Google Maps for the trade in the city (several search terms)
    2. throw out, in code, anything that breaks the rules in rules.json:
       closed, a real website, too few reviews, no phone, no street address
       for a shopfront trade, no social link to check
    3. check when they last posted on Instagram and Facebook. too quiet = out,
       and a real website in their Instagram bio = out
    4. score what's left, keep the best (up to leads_per_city), add them to
       the pipeline. never lowers the bar to hit a number
    5. write a report: every business checked, kept or not, and why
"""

import html
import json
import math
from dataclasses import dataclass, field
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict, List, Optional
from urllib.parse import urlparse

from .. import pipeline
from . import apify

RULES_FILE = Path(__file__).resolve().parent / "rules.json"


def rules() -> dict:
    return json.loads(RULES_FILE.read_text(encoding="utf-8"))


@dataclass
class Candidate:
    place: dict
    niche: str
    instagram: Optional[str] = None
    facebook: Optional[str] = None
    tiktok: Optional[str] = None
    last_post: Optional[datetime] = None
    last_post_on: Optional[str] = None
    followers: Optional[int] = None
    out: Optional[str] = None                 # why it was thrown out
    score: float = 0
    why: List[str] = field(default_factory=list)

    @property
    def name(self) -> str:
        return self.place.get("title") or "?"


# ---------------------------------------------------------------- links

def domain(url: str) -> str:
    u = url if "//" in url else f"https://{url}"
    return (urlparse(u).hostname or "").lower().removeprefix("www.")


def is_real_website(url: Optional[str], r: dict) -> bool:
    if not url:
        return False
    d = domain(url)
    return bool(d) and not any(d == x or d.endswith("." + x) for x in r["not_a_website"])


def social(url: Optional[str]) -> Optional[tuple]:
    """('instagram', 'glowlab.nails') for a link to their profile, else None."""
    if not url:
        return None
    d = domain(url)
    path = urlparse(url if "//" in url else f"https://{url}").path.strip("/").split("/")
    first = path[0].lstrip("@") if path and path[0] else ""
    if not first or first in ("p", "reel", "explore", "pages", "profile.php", "share", "sharer"):
        return None
    if d.endswith("instagram.com"):
        return "instagram", first.lower()
    if d.endswith("facebook.com") or d in ("fb.com", "fb.me"):
        return "facebook", first
    if d.endswith("tiktok.com"):
        return "tiktok", first.lower()
    return None


def _when(value) -> Optional[datetime]:
    if not value:
        return None
    if isinstance(value, (int, float)):
        return datetime.fromtimestamp(value, timezone.utc)
    try:
        return datetime.fromisoformat(str(value).replace("Z", "+00:00"))
    except ValueError:
        return None


# ---------------------------------------------------------------- the steps

def first_pass(c: Candidate, r: dict) -> Optional[str]:
    p = c.place
    if p.get("permanentlyClosed") or p.get("temporarilyClosed"):
        return "closed"
    if is_real_website(p.get("website"), r):
        return f"has a website ({domain(p['website'])})"
    if (p.get("reviewsCount") or 0) < r["min_reviews"]:
        return f"only {p.get('reviewsCount') or 0} Google reviews"
    if r["need_phone"] and not (p.get("phone") or p.get("phoneUnformatted")):
        return "no phone number"
    if c.niche in r["need_street_address_for"] and not p.get("street"):
        return "no street address"
    found = social(p.get("website"))
    if found:
        setattr(c, found[0], found[1])
    if not (c.instagram or c.facebook or c.tiktok):
        return "no social media link on Google"
    return None


def check_instagram(cands: List[Candidate], api, r: dict, max_usd: float, log):
    todo = [c for c in cands if not c.out and c.instagram]
    if not todo:
        return
    found = {i.get("username", "").lower(): i for i in api.run(apify.INSTAGRAM, {"usernames": [c.instagram for c in todo]}, max_usd)}
    for c in todo:
        p = found.get(c.instagram)
        if not p:
            continue
        c.followers = p.get("followersCount")
        if is_real_website(p.get("externalUrl"), r):
            c.out = f"website in Instagram bio ({domain(p['externalUrl'])})"
            continue
        dates = [d for d in (_when(x.get("timestamp")) for x in p.get("latestPosts") or []) if d]
        if dates and (not c.last_post or max(dates) > c.last_post):
            c.last_post, c.last_post_on = max(dates), "Instagram"


def check_facebook(cands: List[Candidate], api, max_usd: float, log):
    todo = [c for c in cands if not c.out and c.facebook]
    if not todo:
        return
    urls = {f"https://www.facebook.com/{c.facebook}".lower(): c for c in todo}
    items = api.run(apify.FACEBOOK, {"startUrls": [{"url": u} for u in urls], "resultsLimit": 1}, max_usd)
    for post in items:
        c = urls.get((post.get("facebookUrl") or "").rstrip("/").lower())
        d = _when(post.get("time") or post.get("timestamp"))
        if c and d and (not c.last_post or d > c.last_post):
            c.last_post, c.last_post_on = d, "Facebook"


def score(c: Candidate, now: datetime) -> float:
    """Higher = better lead: lots of reviews, well rated, active, a real following."""
    p = c.place
    days = (now - c.last_post).days if c.last_post else 99
    s = math.log10(max(p.get("reviewsCount") or 1, 1)) * 2
    s += max(0.0, (p.get("totalScore") or 0) - 3.5) * 2
    s += max(0.0, 15 - days) / 5
    s += math.log10(max(c.followers or 1, 1))
    c.why = [f"{p.get('reviewsCount')} reviews, {p.get('totalScore')} stars",
             (f"posted on {c.last_post_on} " + ("today" if days == 0 else "yesterday" if days == 1 else f"{days} days ago")) if c.last_post else "",
             f"{c.followers} Instagram followers" if c.followers else ""]
    c.why = [w for w in c.why if w]
    return round(s, 2)


def lead_for(c: Candidate, city: str, country: str, sample: bool = False) -> dict:
    p = c.place
    lead = {
        "name": p.get("title"), "niche": c.niche, "country": country.upper(), "city": city,
        "phone": p.get("phone") or p.get("phoneUnformatted"),
        "address": p.get("address"),
        "google_maps_url": p.get("url"),
        "rating": p.get("totalScore"), "review_count": p.get("reviewsCount"),
        "instagram": f"https://instagram.com/{c.instagram}" if c.instagram else None,
        "facebook": f"https://www.facebook.com/{c.facebook}" if c.facebook else None,
        "tiktok": f"https://www.tiktok.com/@{c.tiktok}" if c.tiktok else None,
        "notes": f"found by EDITH: {p.get('categoryName') or c.niche}, no website",
        "edith": {"place_id": p.get("placeId"), "score": c.score, "why": c.why,
                  "last_post": c.last_post.isoformat() if c.last_post else None,
                  "found": datetime.now().isoformat(timespec="seconds")},
    }
    if sample:
        lead["sample"] = True                 # made-up test data: python -m agents.pipeline remove --samples
    return {k: v for k, v in lead.items() if v is not None}


# ---------------------------------------------------------------- the run

def known_places() -> set:
    out = set()
    for b in pipeline.everyone():
        pid = (b.lead().get("edith") or {}).get("place_id")
        if pid:
            out.add(pid)
    return out


def find(niche: str, city: str, country: str, api=None, now: Optional[datetime] = None, log=print, add=True) -> dict:
    r = rules()
    api = api or apify.client(log)
    now = now or datetime.now(timezone.utc)
    terms = r["search_terms"].get(niche)
    if not terms:
        raise ValueError(f"no search terms for {niche} in rules.json")
    budget = float(r["max_usd_per_run"])

    log(f"EDITH: looking for {niche} businesses in {city} ({', '.join(terms)})")
    log(f"EDITH: Google Maps costs about ${apify.PRICE[apify.GOOGLE_MAPS]} a place. Hard cap for this whole run: ${budget:.2f}")
    places = api.run(apify.GOOGLE_MAPS, {
        "searchStringsArray": terms, "locationQuery": f"{city}, {country}", "language": "en",
        "maxCrawledPlacesPerSearch": 400, "skipClosedPlaces": False,
    }, budget * 0.7)

    seen, cands = set(known_places()), []
    for p in places:
        pid = p.get("placeId") or p.get("url")
        if pid in seen:
            continue
        seen.add(pid)
        cands.append(Candidate(p, niche))
    for c in cands:
        c.out = first_pass(c, r)
    passing = [c for c in cands if not c.out]
    log(f"EDITH: {len(places)} found, {len(cands)} new, {len(passing)} pass the first checks. Checking their social media")

    left = max(0.5, budget - api.spent)
    check_instagram(cands, api, r, left * 0.6, log)
    check_facebook(cands, api, max(0.5, budget - api.spent), log)
    for c in passing:
        if c.out:
            continue
        if not c.last_post:
            c.out = "couldn't see any posts"
        elif (now - c.last_post).days > r["max_days_since_post"]:
            c.out = f"last post {(now - c.last_post).days} days ago"
        else:
            c.score = score(c, now)

    good = sorted((c for c in cands if not c.out), key=lambda c: c.score, reverse=True)
    keep = good[: r["leads_per_city"]]
    for c in good[r["leads_per_city"]:]:
        c.out = "over today's number for this city"
    added = []
    if add:
        for c in keep:
            try:
                added.append(pipeline.add(lead_for(c, city, country, sample=isinstance(api, apify.SampleApify)), by="EDITH",
                                          note=f"new lead, score {c.score}: {'; '.join(c.why)}").key)
            except pipeline.PipelineError as e:
                c.out = str(e)
    report = write_report(niche, city, country, cands, places, api.spent, added, now)
    log(f"EDITH: kept {len(added)} of {len(cands)}. Spent ${api.spent:.2f}. Report: {report}")
    pipeline.board()
    return {"found": len(places), "checked": len(cands), "qualified": len(keep), "kept": added, "spent": api.spent, "report": str(report)}


# ---------------------------------------------------------------- the report

def write_report(niche, city, country, cands: List[Candidate], places, spent, added, now) -> Path:
    folder = pipeline.ROOT / "edith-reports"
    folder.mkdir(parents=True, exist_ok=True)
    out = folder / f"{now:%Y-%m-%d}-{pipeline.slug(city)}-{niche}.html"
    reasons: Dict[str, int] = {}
    for c in cands:
        if c.out:
            key = c.out.split(" (")[0]
            key = "last post too long ago" if key.startswith("last post") else key
            key = "too few Google reviews" if key.startswith("only ") else key
            reasons[key] = reasons.get(key, 0) + 1
    kept = sorted((c for c in cands if not c.out), key=lambda c: c.score, reverse=True)
    row = lambda c: (f"<tr><td>{html.escape(c.name)}</td><td>{html.escape(c.place.get('categoryName') or '')}</td>"  # noqa: E731
                     f"<td>{c.place.get('reviewsCount') or 0}</td><td>{c.place.get('totalScore') or ''}</td>"
                     f"<td>{'@' + html.escape(c.instagram) if c.instagram else ''}{' fb' if c.facebook else ''}</td>"
                     f"<td>{html.escape(c.out or ('score ' + str(c.score) + ': ' + '; '.join(c.why)))}</td></tr>")
    page = f"""<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>EDITH: {html.escape(niche)} in {html.escape(city)}</title>
<style>
body {{ font: 14px/1.5 system-ui, -apple-system, "Segoe UI", sans-serif; color: #1c1917; background: #f6f4f1; margin: 0; padding: 24px; }}
h1 {{ font-size: 1.5rem; }} h2 {{ font-size: 1.1rem; margin-top: 28px; }}
.stats {{ display: flex; flex-wrap: wrap; gap: 10px; margin: 16px 0; }}
.stats div {{ background: #fff; border: 1px solid #e7e3df; border-radius: 12px; padding: 12px 16px; }}
.stats b {{ display: block; font-size: 1.5rem; }}
table {{ width: 100%; border-collapse: collapse; background: #fff; border-radius: 12px; overflow: hidden; }}
th, td {{ text-align: start; padding: 8px 12px; border-bottom: 1px solid #eee; vertical-align: top; }}
th {{ background: #faf9f7; color: #78716c; font-size: .85rem; }}
ul {{ background: #fff; border-radius: 12px; padding: 12px 32px; }}
</style></head><body>
<h1>EDITH: {html.escape(niche)} businesses in {html.escape(city)}, {html.escape(country.upper())}</h1>
<p>{now:%d %b %Y, %H:%M}. Rules: no website, posted in the last {rules()['max_days_since_post']} days, {rules()['min_reviews']}+ Google reviews, a phone number, a street address for shopfront trades.</p>
<div class="stats">
  <div><b>{len(places)}</b>found on Google Maps</div><div><b>{len(cands)}</b>new to the pipeline</div>
  <div><b>{len(added)}</b>added as leads</div><div><b>${spent:.2f}</b>spent on Apify</div>
</div>
<h2>Why the rest were left out</h2>
<ul>{"".join(f"<li>{html.escape(k)}: {v}</li>" for k, v in sorted(reasons.items(), key=lambda x: -x[1])) or "<li>nothing left out</li>"}</ul>
<h2>Kept ({len(kept)})</h2>
<table><tr><th>Business</th><th>Category</th><th>Reviews</th><th>Stars</th><th>Social</th><th>Why</th></tr>{"".join(row(c) for c in kept)}</table>
<h2>Left out ({len(cands) - len(kept)})</h2>
<table><tr><th>Business</th><th>Category</th><th>Reviews</th><th>Stars</th><th>Social</th><th>Reason</th></tr>{"".join(row(c) for c in cands if c.out)}</table>
</body></html>
"""
    out.write_text(page, encoding="utf-8")
    return out
