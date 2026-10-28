"""
EDITH, the lead tracker. Finds local businesses with no website that are alive
on social media, and drops the good ones into pipeline/1-leads for MARK.

    1. search Google Maps through the Places API, one search term at a time, the
       city split into map tiles (places.py). Free allowance and spending cap enforced
    2. throw out, in code, anything that breaks the rules in rules.json:
       closed, a real website, too few reviews, no phone, no street address
       for a shopfront trade
    3. find the social profiles Google doesn't list: Codex searches each business
       by name (social.py). A website found that way = out
    4. read each profile in Zain's Chrome with Claude: last post, followers, bio link.
       too quiet = out, a real website in the bio = out
    5. score what's left, add the best to the pipeline (up to leads_per_city).
       never lowers the bar to hit a number
    6. write a report: every business checked, kept or not, and why

A city can take more than a day: the daily caps on name searches and profile
checks keep the accounts safe. Progress is saved in pipeline/edith-runs/, and
the next run of the same city carries on where it stopped.
"""

import html
import json
import math
from dataclasses import asdict, dataclass, field
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict, List, Optional
from urllib.parse import urlparse

from .. import pipeline
from . import places as maps
from . import social as socials

RULES_FILE = Path(__file__).resolve().parent / "rules.json"
PLATFORMS = ("instagram", "facebook", "tiktok")


def rules() -> dict:
    return json.loads(RULES_FILE.read_text(encoding="utf-8"))


@dataclass
class Candidate:
    place: dict                               # places.tidy() record
    niche: str
    instagram: Optional[str] = None
    facebook: Optional[str] = None
    tiktok: Optional[str] = None
    looked_up: bool = False                   # Codex searched for their profiles
    checked: bool = False                     # their profiles were read
    last_post: Optional[str] = None           # ISO date
    last_post_on: Optional[str] = None
    followers: Optional[int] = None
    out: Optional[str] = None                 # why it was thrown out
    score: float = 0
    why: List[str] = field(default_factory=list)
    added: Optional[str] = None               # pipeline key once it's a lead

    @property
    def name(self) -> str:
        return self.place.get("name") or "?"

    def socials(self) -> List[tuple]:
        return [(p, getattr(self, p)) for p in PLATFORMS if getattr(self, p)]


# ---------------------------------------------------------------- links

def domain(url: str) -> str:
    u = url if "//" in url else f"https://{url}"
    return (urlparse(u).hostname or "").lower().removeprefix("www.")


def is_real_website(url: Optional[str], r: dict) -> bool:
    if not url:
        return False
    d = domain(url)
    return bool(d) and "." in d and not any(d == x or d.endswith("." + x) for x in r["not_a_website"])


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


def _handle(value: Optional[str]) -> Optional[str]:
    """A username from whatever Codex gave back: '@glow', 'instagram.com/glow/', 'glow'."""
    if not value:
        return None
    v = value.strip()
    if "/" in v:
        found = social(v)
        return found[1] if found else None
    v = v.lstrip("@").strip()
    return v.lower() if v and " " not in v else None


def _days(iso: Optional[str], now: datetime) -> Optional[int]:
    if not iso:
        return None
    try:
        d = datetime.fromisoformat(iso.replace("Z", "+00:00"))
    except ValueError:
        return None
    d = d if d.tzinfo else d.replace(tzinfo=timezone.utc)
    return max(0, (now - d).days)


# ---------------------------------------------------------------- the steps

def first_pass(c: Candidate, r: dict) -> Optional[str]:
    p = c.place
    if p.get("closed"):
        return "closed"
    if is_real_website(p.get("website"), r):
        return f"has a website ({domain(p['website'])})"
    if (p.get("reviews") or 0) < r["min_reviews"]:
        return f"only {p.get('reviews') or 0} Google reviews"
    if r["need_phone"] and not p.get("phone"):
        return "no phone number"
    if c.niche in r["need_street_address_for"] and not p.get("street"):
        return "no street address"
    found = social(p.get("website"))
    if found:
        setattr(c, found[0], found[1])
        c.looked_up = True                    # Google already gave us their profile
    return None


def look_up(cands: List[Candidate], api, r: dict, log) -> int:
    """Codex finds the profiles of businesses Google gave no social link for."""
    todo = [c for c in cands if not c.out and not c.looked_up]
    room = socials.room_today("name_searches", int(r["max_name_searches_per_day"]))
    if not todo or not room:
        return len(todo)
    batch = todo[:room]
    found = api.find([{"id": c.place["id"], "name": c.name, "address": c.place.get("address")} for c in batch])
    for c in batch:
        f = found.get(c.place["id"]) or {}
        c.looked_up = True
        if is_real_website(f.get("website"), r):
            c.out = f"has a website ({domain(f['website'])}, found by search)"
            continue
        for p in PLATFORMS:
            setattr(c, p, getattr(c, p) or _handle(f.get(p)))
        if not c.socials():
            c.out = "no social media found"
    return len(todo) - len(batch)


def read_profiles(cands: List[Candidate], api, r: dict, now: datetime, log) -> int:
    """Claude in Chrome reads each profile: last post, followers, bio link."""
    todo = [c for c in cands if not c.out and c.looked_up and not c.checked and c.socials()]
    room = socials.room_today("profile_checks", int(r["max_profile_checks_per_day"]))
    batch, used = [], 0
    for c in todo:
        n = len(c.socials())
        if used + n > room:
            break
        batch.append(c)
        used += n
    if not batch:
        return len(todo)
    seen = api.check([s for c in batch for s in c.socials()])
    for c in batch:
        c.checked = True
        alive = False
        for p, h in c.socials():
            info = seen.get((p, h.lower())) or {}
            if not info.get("exists"):
                continue
            alive = True
            if p == "instagram" and info.get("followers") is not None:
                c.followers = info["followers"]
            if is_real_website(info.get("bio_url"), r):
                c.out = f"website in {p.title()} bio ({domain(info['bio_url'])})"
                break
            when = info.get("last_post")
            if when and (not c.last_post or when > c.last_post):
                c.last_post, c.last_post_on = when, p.title()
        if c.out:
            continue
        if not alive:
            c.out = "social profile doesn't exist any more"
        elif not c.last_post:
            c.out = "couldn't see any posts"
        elif _days(c.last_post, now) > r["max_days_since_post"]:
            c.out = f"last post {_days(c.last_post, now)} days ago"
        else:
            c.score = score(c, now)
    return len(todo) - len(batch)


def score(c: Candidate, now: datetime) -> float:
    """Higher = better lead: lots of reviews, well rated, active, a real following."""
    p = c.place
    days = _days(c.last_post, now)
    days = 99 if days is None else days
    s = math.log10(max(p.get("reviews") or 1, 1)) * 2
    s += max(0.0, (p.get("rating") or 0) - 3.5) * 2
    s += max(0.0, 15 - days) / 5
    s += math.log10(max(c.followers or 1, 1))
    c.why = [f"{p.get('reviews')} reviews, {p.get('rating')} stars",
             (f"posted on {c.last_post_on} " + ("today" if days == 0 else "yesterday" if days == 1 else f"{days} days ago")) if c.last_post else "",
             f"{c.followers} Instagram followers" if c.followers else ""]
    c.why = [w for w in c.why if w]
    return round(s, 2)


def lead_for(c: Candidate, city: str, country: str, sample: bool = False) -> dict:
    p = c.place
    lead = {
        "name": p.get("name"), "niche": c.niche, "country": country.upper(), "city": city,
        "phone": p.get("phone"), "address": p.get("address"), "google_maps_url": p.get("maps_url"),
        "rating": p.get("rating"), "review_count": p.get("reviews"),
        "instagram": f"https://instagram.com/{c.instagram}" if c.instagram else None,
        "facebook": f"https://www.facebook.com/{c.facebook}" if c.facebook else None,
        "tiktok": f"https://www.tiktok.com/@{c.tiktok}" if c.tiktok else None,
        "notes": f"found by EDITH: {p.get('category') or c.niche}, no website",
        "edith": {"place_id": p.get("id"), "score": c.score, "why": c.why, "last_post": c.last_post,
                  "found": datetime.now().isoformat(timespec="seconds")},
    }
    if sample:
        lead["sample"] = True                 # made-up test data: python -m agents.pipeline remove --samples
    return {k: v for k, v in lead.items() if v is not None}


# ---------------------------------------------------------------- saved progress

def run_file(niche: str, city: str, sample: bool = False) -> Path:
    # sample runs keep their own progress, so a real run of the same city starts fresh
    return pipeline.ROOT / "edith-runs" / f"{pipeline.slug(city)}-{niche}{'-sample' if sample else ''}.json"


def load_run(niche: str, city: str, country: str, sample: bool = False) -> dict:
    f = run_file(niche, city, sample)
    if f.exists():
        run = json.loads(f.read_text(encoding="utf-8"))
        run["cands"] = [Candidate(**c) for c in run["cands"]]
        return run
    return {"niche": niche, "city": city, "country": country.upper(), "sample": sample, "started": datetime.now().isoformat(timespec="seconds"),
            "terms_done": [], "found": 0, "spent": 0.0, "searches": 0, "stopped": None, "done": False, "cands": []}


def save_run(run: dict):
    f = run_file(run["niche"], run["city"], run.get("sample", False))
    f.parent.mkdir(parents=True, exist_ok=True)
    f.write_text(json.dumps({**run, "cands": [asdict(c) for c in run["cands"]]}, indent=1, ensure_ascii=False) + "\n", encoding="utf-8")


def open_runs() -> List[dict]:
    folder = pipeline.ROOT / "edith-runs"
    runs = [json.loads(f.read_text(encoding="utf-8")) for f in sorted(folder.glob("*.json"))] if folder.exists() else []
    return [{k: r[k] for k in ("niche", "city", "country")} for r in runs if not r.get("done") and not r.get("sample")]


def known_places() -> set:
    out = set()
    for b in pipeline.everyone():
        pid = (b.lead().get("edith") or {}).get("place_id")
        if pid:
            out.add(pid)
    return out


# ---------------------------------------------------------------- the run

def find(niche: str, city: str, country: str, maps_api=None, social_api=None, now: Optional[datetime] = None,
         log=print, add: bool = True) -> dict:
    r = rules()
    terms = r["search_terms"].get(niche)
    if not terms:
        raise ValueError(f"no search terms for {niche} in rules.json")
    maps_api = maps_api or maps.client(r, log)
    social_api = social_api or socials.client(log)
    now = now or datetime.now(timezone.utc)
    run = load_run(niche, city, country, sample=isinstance(maps_api, maps.SamplePlaces))
    cands: List[Candidate] = run["cands"]

    # 1 and 2: Google Maps, then the rules that need no browsing
    todo_terms = [t for t in terms if t not in run["terms_done"]]
    if todo_terms:
        log(f"EDITH: searching Google Maps for {niche} in {city} ({', '.join(todo_terms)})")
        seen = known_places() | {c.place["id"] for c in cands}
        try:
            box = maps_api.city_box(city, country)
            for t in todo_terms:
                for p in maps_api.sweep(t, box, country):
                    run["found"] += 1
                    if p["id"] in seen:
                        continue
                    seen.add(p["id"])
                    c = Candidate(p, niche)
                    c.out = first_pass(c, r)
                    cands.append(c)
                run["terms_done"].append(t)
                save_run(run)
        except maps.OverBudget as e:
            run["stopped"] = str(e)
            log(f"EDITH: stopped searching: {e}")
        finally:
            run["spent"] = round(run["spent"] + maps_api.spent, 3)
            run["searches"] += maps_api.searches
            save_run(run)
    log(f"EDITH: {len(cands)} businesses, {sum(1 for c in cands if not c.out)} still in the running")

    # 3 and 4: social media, under the daily caps
    waiting_lookup = look_up(cands, social_api, r, log)
    save_run(run)
    waiting_check = read_profiles(cands, social_api, r, now, log)
    save_run(run)

    # 5: the best become leads, never more than the city's number
    already = sum(1 for c in cands if c.added)
    fresh = sorted((c for c in cands if not c.out and c.checked and not c.added), key=lambda c: c.score, reverse=True)
    added = []
    for c in fresh:
        if already + len(added) >= r["leads_per_city"]:
            c.out = "over the number of leads for this city"
            continue
        if not add:
            continue
        try:
            c.added = pipeline.add(lead_for(c, city, country, sample=isinstance(maps_api, maps.SamplePlaces)), by="EDITH",
                                   note=f"new lead, score {c.score}: {'; '.join(c.why)}").key
            added.append(c.added)
        except pipeline.PipelineError as e:
            c.out = str(e)

    pending = waiting_lookup + waiting_check
    run["done"] = not pending and len(run["terms_done"]) == len(terms)
    save_run(run)
    report = write_report(run, pending, now)
    log(f"EDITH: {len(added)} new leads today, {already + len(added)} for {city} so far. "
        + (f"{pending} still to check, carrying on next run (daily caps). " if pending else "")
        + f"Report: {report}")
    pipeline.board()
    return {"found": run["found"], "checked": len(cands), "qualified": sum(1 for c in cands if c.added), "kept": added,
            "pending": pending, "done": run["done"], "spent": run["spent"], "report": str(report)}


# ---------------------------------------------------------------- the report

def write_report(run: dict, pending: int, now: datetime) -> Path:
    niche, city, country, cands = run["niche"], run["city"], run["country"], run["cands"]
    folder = pipeline.ROOT / "edith-reports"
    folder.mkdir(parents=True, exist_ok=True)
    out = folder / f"{pipeline.slug(city)}-{niche}{'-sample' if run.get('sample') else ''}.html"
    reasons: Dict[str, int] = {}
    for c in cands:
        if c.out:
            key = c.out.split(" (")[0]
            key = "last post too long ago" if key.startswith("last post") else key
            key = "too few Google reviews" if key.startswith("only ") else key
            key = "website in bio" if key.startswith("website in") else key
            reasons[key] = reasons.get(key, 0) + 1
    kept = sorted((c for c in cands if c.added), key=lambda c: c.score, reverse=True)
    waiting = [c for c in cands if not c.out and not c.added]
    r = rules()
    month = now.strftime("%Y-%m")

    def row(c: Candidate) -> str:
        s = ", ".join(f"{p} @{html.escape(h)}" for p, h in c.socials())
        note = c.out or (f"score {c.score}: " + "; ".join(c.why) if c.added else "waiting for its social check")
        return (f"<tr><td>{html.escape(c.name)}</td><td>{html.escape(c.place.get('category') or '')}</td>"
                f"<td>{c.place.get('reviews') or 0}</td><td>{c.place.get('rating') or ''}</td><td>{s}</td><td>{html.escape(note)}</td></tr>")

    head = "<tr><th>Business</th><th>Category</th><th>Reviews</th><th>Stars</th><th>Social</th><th>{}</th></tr>"
    page = f"""<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>EDITH: {html.escape(niche)} in {html.escape(city)}</title>
<style>
body {{ font: 14px/1.5 system-ui, -apple-system, "Segoe UI", sans-serif; color: #1c1917; background: #f6f4f1; margin: 0; padding: 24px; }}
h1 {{ font-size: 1.5rem; }} h2 {{ font-size: 1.1rem; margin-top: 28px; }}
.stats {{ display: flex; flex-wrap: wrap; gap: 10px; margin: 16px 0; }}
.stats div {{ background: #fff; border: 1px solid #e7e3df; border-radius: 12px; padding: 12px 16px; }}
.stats b {{ display: block; font-size: 1.5rem; }}
.note {{ background: #fff8e6; border: 1px solid #f3dca2; border-radius: 12px; padding: 12px 16px; }}
table {{ width: 100%; border-collapse: collapse; background: #fff; border-radius: 12px; overflow: hidden; }}
th, td {{ text-align: start; padding: 8px 12px; border-bottom: 1px solid #eee; vertical-align: top; }}
th {{ background: #faf9f7; color: #78716c; font-size: .85rem; }}
ul {{ background: #fff; border-radius: 12px; padding: 12px 32px; }}
</style></head><body>
<h1>EDITH: {html.escape(niche)} businesses in {html.escape(city)}, {html.escape(country)}</h1>
<p>Updated {now:%d %b %Y, %H:%M}. Rules: no website, posted in the last {r['max_days_since_post']} days, {r['min_reviews']}+ Google reviews,
a phone number, a street address for shopfront trades.</p>
{f'<p class="note">Still {pending} to check. The daily caps keep your accounts safe, so EDITH carries on with the next run.</p>' if pending else ''}
{f'<p class="note">Searching stopped early: {html.escape(run["stopped"])}</p>' if run.get("stopped") else ''}
<div class="stats">
  <div><b>{run['found']}</b>found on Google Maps</div><div><b>{len(cands)}</b>new to the pipeline</div>
  <div><b>{len(kept)}</b>added as leads</div><div><b>{len(waiting)}</b>waiting to be checked</div>
  <div><b>{run['searches']}</b>Google searches (this city)</div>
  <div><b>{maps.this_month('search', month)} / {maps.FREE['search']}</b>free searches used this month</div>
  <div><b>${maps.month_cost(month):.2f}</b>Google cost this month</div>
</div>
<h2>Why the rest were left out</h2>
<ul>{"".join(f"<li>{html.escape(k)}: {v}</li>" for k, v in sorted(reasons.items(), key=lambda x: -x[1])) or "<li>nothing left out</li>"}</ul>
<h2>Leads ({len(kept)})</h2>
<table>{head.format("Why")}{"".join(row(c) for c in kept)}</table>
{f'<h2>Waiting ({len(waiting)})</h2><table>{head.format("Status")}{"".join(row(c) for c in waiting)}</table>' if waiting else ''}
<h2>Left out ({sum(1 for c in cands if c.out)})</h2>
<table>{head.format("Reason")}{"".join(row(c) for c in cands if c.out)}</table>
</body></html>
"""
    out.write_text(page, encoding="utf-8")
    return out
