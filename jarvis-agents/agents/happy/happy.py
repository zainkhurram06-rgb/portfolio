"""
HAPPY, quality check. Checks every website MARK builds against the rules in
rules.json before it reaches you. Plain code, no AI, so the same site always
gets the same answer.

    3-demo-built/<business>  --pass-->  4-checked/<business>
                             --fail-->  stays in 3-demo-built, problems on the card

Writes check.html (readable) and check.json into the business folder.
"""

import html
import json
import re
import shutil
import subprocess
from datetime import datetime
from html.parser import HTMLParser
from pathlib import Path
from typing import Callable, List, Optional

import requests

from .. import pipeline
from ..pipeline import Business

RULES_FILE = Path(__file__).resolve().parent / "rules.json"
PLATFORM_DIR = Path(__file__).resolve().parents[2] / "platform"


def rules() -> dict:
    return {k: v for k, v in json.loads(RULES_FILE.read_text(encoding="utf-8")).items() if not k.startswith("_")}


# ---------------------------------------------------------------- reading the page

class Page(HTMLParser):
    """The visible words, the media it points at, its links and its reviews."""

    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.text: List[str] = []
        self.media: List[str] = []
        self.links: List[str] = []
        self.meta: dict = {}
        self.reviews: List[str] = []
        self.headline = ""
        self._skip = 0
        self._in = None
        self._review = False      # inside a review card

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag in ("style", "script"):
            self._skip += 1
        if tag in ("img", "video") and a.get("src"):
            self.media.append(a["src"])
        if tag == "video" and a.get("poster"):
            self.media.append(a["poster"])
        if tag == "a" and a.get("href"):
            self.links.append(a["href"])
        if tag == "meta" and a.get("name"):
            self.meta[a["name"]] = a.get("content", "")
        if tag == "h1" and not self.headline:
            self._in = "h1"
        if tag == "figure" and "review" in (a.get("class") or ""):
            self._review = True
        if (tag == "figcaption" and self._review) or tag == "cite":
            self._in = "author"

    def handle_endtag(self, tag):
        if tag in ("style", "script"):
            self._skip -= 1
        if tag in ("h1", "figcaption", "cite"):
            self._in = None
        if tag == "figure":
            self._review = False

    def handle_data(self, data):
        if self._skip:
            return
        self.text.append(data)
        if self._in == "h1":
            self.headline += data
        elif self._in == "author" and data.strip():
            self.reviews.append(data.strip())

    @property
    def words(self) -> str:
        return re.sub(r"\s+", " ", " ".join(self.text))


def digits(s: Optional[str]) -> str:
    return re.sub(r"\D", "", s or "")


# ---------------------------------------------------------------- the checks

def _browser(file: Path) -> dict:
    npx = shutil.which("npx")
    if not npx:
        raise RuntimeError("Node.js isn't installed")
    done = subprocess.run([npx, "tsx", "scripts/check-site.ts", str(file)], cwd=PLATFORM_DIR,
                          capture_output=True, text=True, encoding="utf-8", timeout=240)
    if done.returncode != 0:
        raise RuntimeError(done.stderr.strip()[:300] or "the browser check failed")
    return json.loads(done.stdout)


def _url_ok(url: str) -> bool:
    try:
        return requests.get(url, timeout=20).status_code == 200
    except requests.RequestException:
        return False


def check(b: Business, browser: Callable[[Path], dict] = _browser, url_ok: Callable[[str], bool] = _url_ok) -> dict:
    r = rules()
    lead, build = b.lead(), b.build() or {}
    site = b.file("site", "index.html")
    results = []

    def add(rule: str, ok: bool, detail: str = ""):
        if rule in r and r[rule].get("on", True):
            results.append({"rule": rule, "what": r[rule]["what"], "level": r[rule]["level"], "ok": bool(ok), "detail": detail})

    raw = site.read_text(encoding="utf-8") if site.exists() else ""
    add("file_exists", "<html" in raw and "</html>" in raw, "" if raw else "no site/index.html")
    if not raw:
        return _verdict(b, results)

    page = Page()
    page.feed(raw)
    words = page.words
    local = [m for m in page.media if not m.startswith(("http:", "https:", "data:"))]
    missing = sorted({m for m in local if not (site.parent / m).exists()})
    add("no_broken_media", not missing, f"missing: {', '.join(missing)}" if missing else f"{len(set(local))} files, all there")

    name = lead.get("name", "")
    add("business_name", name.lower() in words.lower(), "" if name.lower() in words.lower() else f"can't find {name!r}")

    research_file = b.file("research", "research.json")
    research = json.loads(research_file.read_text(encoding="utf-8")) if research_file.exists() else {}
    want = digits(build.get("phone") or lead.get("phone") or (research.get("google") or {}).get("phone"))
    shown = {digits(l[4:]) for l in page.links if l.startswith("tel:")}
    if want:
        add("phone_matches", want in shown or any(s.endswith(want[-9:]) for s in shown),
            f"page has {', '.join(sorted(shown)) or 'no phone'}, lead has {want}")
    else:
        add("phone_matches", True, "no phone on the lead")

    bad = [w for w in ("undefined", "NaN", "lorem ipsum", "{{", "}}", "[object Object]", "null") if re.search(rf"(?<!\w){re.escape(w)}(?!\w)", words, re.I)]
    add("no_placeholders", not bad, f"found: {', '.join(bad)}" if bad else "")

    dashes = len(re.findall("—", words))
    add("no_em_dashes", dashes == 0, f"{dashes} em dashes" if dashes else "")

    real = {(x.get("author") or "").strip().lower() for x in lead.get("reviews", [])}
    real |= {(x.get("author") or "").strip().lower() for x in (research.get("google") or {}).get("reviews", [])}
    # review cards end with the author's initials in a circle, then their name
    authors = [a for a in page.reviews if len(a) > 2 and not a.isupper()]
    fake = [a for a in authors if a.lower() not in real]
    add("reviews_are_real", not fake, f"not in their real reviews: {', '.join(fake)}" if fake else f"{len(authors)} reviews, all real")

    demo_bar = "Demo preview" in words or "demo" in (page.meta.get("robots") or "")
    add("demo_is_hidden", "noindex" in page.meta.get("robots", "") and demo_bar,
        "" if "noindex" in page.meta.get("robots", "") else "no noindex tag")

    book = next((l for l in page.links if l.rstrip("/").endswith("/book")), None)
    add("booking_link_works", bool(book) and url_ok(book), book or "no Book link")

    add("has_logo", any("logo" in m for m in local), "")
    photos = {m for m in local if "logo" not in m and not m.endswith((".mp4", ".webm"))}
    add("min_photos", len(photos) >= r.get("min_photos", {}).get("min", 3), f"{len(photos)} photos")
    add("min_services", (build.get("services") or 0) >= r.get("min_services", {}).get("min", 3), f"{build.get('services', '?')} services")
    add("some_prices", (build.get("priced") or 0) >= r.get("some_prices", {}).get("min", 1), f"{build.get('priced', '?')} with a price")
    n = len((page.headline or build.get("headline", "")).split())
    add("short_headline", n <= r.get("short_headline", {}).get("max", 10), f"{n} words: {page.headline.strip()}")

    if r.get("browser_check", {}).get("on", True):
        try:
            seen = browser(site)
            problems = []
            for size, v in seen.items():
                if v.get("broken_images"):
                    problems.append(f"{size}: broken images {v['broken_images']}")
                if v.get("broken_videos"):
                    problems.append(f"{size}: video won't play")
                if v.get("overflow_px", 0) > 2:
                    problems.append(f"{size}: {v['overflow_px']}px sticks out sideways")
                if v.get("errors"):
                    problems.append(f"{size}: errors {v['errors'][:2]}")
            add("browser_check", not problems, "; ".join(problems) or "computer and phone both clean")
        except (RuntimeError, subprocess.TimeoutExpired, json.JSONDecodeError) as e:
            add("browser_check", False, f"couldn't run: {e}")
    return _verdict(b, results)


def _verdict(b: Business, results: List[dict]) -> dict:
    blocking = [x for x in results if not x["ok"] and x["level"] == "block"]
    warnings = [x for x in results if not x["ok"] and x["level"] == "warn"]
    out = {"checked": datetime.now().isoformat(timespec="seconds"), "passed": not blocking,
           "blocking": len(blocking), "warnings": len(warnings), "results": results}
    b.file("check.json").write_text(json.dumps(out, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    b.file("check.html").write_text(report(b, out), encoding="utf-8")
    return out


def report(b: Business, out: dict) -> str:
    lead = b.lead()
    row = lambda x: (f'<tr class="{"ok" if x["ok"] else x["level"]}"><td>{"pass" if x["ok"] else ("FAIL" if x["level"] == "block" else "warning")}</td>'  # noqa: E731
                     f'<td>{html.escape(x["what"])}</td><td>{html.escape(x["detail"])}</td></tr>')
    verdict = "Passed" if out["passed"] else f"Failed: {out['blocking']} problem{'s' if out['blocking'] != 1 else ''}"
    return f"""<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>HAPPY: {html.escape(lead['name'])}</title>
<style>
body {{ font: 15px/1.5 system-ui, -apple-system, "Segoe UI", sans-serif; color: #1c1917; background: #f6f4f1; margin: 0; padding: 24px; max-width: 980px; }}
h1 {{ font-size: 1.5rem; margin-bottom: 4px; }} .v {{ font-size: 1.2rem; font-weight: 700; margin: 12px 0 20px; }}
.v.pass {{ color: #15803d; }} .v.fail {{ color: #b91c1c; }}
table {{ width: 100%; border-collapse: collapse; background: #fff; border-radius: 12px; overflow: hidden; }}
td {{ padding: 10px 14px; border-bottom: 1px solid #eee; vertical-align: top; }}
td:first-child {{ font-weight: 700; width: 90px; }}
tr.ok td:first-child {{ color: #15803d; }} tr.block td:first-child {{ color: #b91c1c; }} tr.warn td:first-child {{ color: #b45309; }}
tr.block {{ background: #fef2f2; }} tr.warn {{ background: #fffbeb; }}
a {{ color: #1d4ed8; }}
</style></head><body>
<h1>HAPPY checked {html.escape(lead['name'])}</h1>
<p>{html.escape(out['checked'].replace('T', ' '))} · <a href="site/index.html">open the website</a> · rules in agents/happy/rules.json</p>
<p class="v {'pass' if out['passed'] else 'fail'}">{verdict}{f", {out['warnings']} warning{'s' if out['warnings'] != 1 else ''}" if out['warnings'] else ""}</p>
<table>{"".join(row(x) for x in sorted(out['results'], key=lambda x: (x['ok'], x['level'] != 'block')))}</table>
</body></html>
"""


def check_stage(b: Business, log=print, **kw) -> Business:
    if b.stage != "3-demo-built":
        raise pipeline.PipelineError(f"{b.key} is in {b.stage}, HAPPY checks websites in Demo built")
    out = check(b, **kw)
    if out["passed"]:
        note = "passed every check" + (f", {out['warnings']} warning{'s' if out['warnings'] != 1 else ''}" if out["warnings"] else "")
        log(f"HAPPY: {b.key} {note}")
        return pipeline.move(b.key, "checked", by="HAPPY", note=note)
    fails = [x["what"] for x in out["results"] if not x["ok"] and x["level"] == "block"]
    b.log("HAPPY", f"failed {len(fails)}: {'; '.join(fails)}")
    pipeline.board()
    log(f"HAPPY: {b.key} failed: {'; '.join(fails)}")
    return b
