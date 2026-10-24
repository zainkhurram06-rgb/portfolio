"""
MARK working the pipeline.

    1-leads/<business>       --research-->   2-researched/<business>
    2-researched/<business>  --build----->   3-demo-built/<business>

research: pulls their social media into research/ (see research.py)
build:    branding from their own media, picks a template from the library,
          writes the words, uploads their photos and reel, creates the live demo
          (booking page and dashboard), and saves the website as a real file:
          site/index.html with its photos in site/media/. The template library
          itself is never changed.
"""

import json
import re
import shutil
import subprocess
from datetime import datetime
from pathlib import Path
from typing import Callable, Optional

import requests

from .. import pipeline
from ..pipeline import Business
from . import mark, research as rs, templates
from .branding import Branding, brand
from .plan import Lead, LeadReview


def research_stage(b: Business, source: Optional[str] = None, log=print) -> Business:
    if b.stage != "1-leads":
        raise pipeline.PipelineError(f"{b.key} is in {b.stage}, research works on new leads")
    r = rs.research(b, source, log=log)
    photos = sum(1 for p in r.posts if p.kind == "photo" and p.file)
    videos = sum(1 for p in r.posts if p.kind == "video" and p.file)
    bits = [f"{photos} photos", f"{videos} videos"] + (["Google listing"] if r.google else [])
    return pipeline.move(b.key, "researched", by="MARK", note=f"researched ({r.source}): {', '.join(bits)}")


# ---------------------------------------------------------------- research -> lead

PHONE = re.compile(r"\+?\d[\d\s().-]{7,}\d")


def lead_from_research(raw: dict, r: "rs.Research", br: Branding) -> Lead:
    """Everything MARK knows: EDITH's lead, plus what research found. Facts only."""
    data = dict(raw)
    p, g = r.profile, r.google
    bio = (p.bio if p else "") or ""
    captions = [x.caption for x in r.posts if x.caption][:12]
    data["social_text"] = "\n".join(filter(None, [f"Bio: {bio}" if bio else "", *[f"Post: {c}" for c in captions]]))[:3000] or None
    if g:
        data.setdefault("phone", g.phone)
        data.setdefault("address", g.address)
        data.setdefault("hours", g.hours)
        if g.rating is not None:
            data.setdefault("rating", g.rating)
            data.setdefault("review_count", g.review_count)
        if g.reviews and not data.get("reviews"):
            data["reviews"] = [LeadReview(**x.model_dump()).model_dump() for x in g.reviews[:6]]
    if not data.get("phone"):
        m = PHONE.search(bio)
        if m:
            data["phone"] = m.group(0).strip()
    services = data.get("services") or ""
    if p and p.category and p.category.lower() not in services.lower():
        data["services"] = ", ".join(filter(None, [p.category, services])) or None
    data = {k: v for k, v in data.items() if v is not None}
    lead = Lead.model_validate(data)
    lead.palette = br.palette
    return lead


# ---------------------------------------------------------------- media

def _upload(folder: str, file: Path) -> str:
    with file.open("rb") as f:
        r = requests.post(f"{mark.PLATFORM_URL}/api/internal/media", data={"folder": folder},
                          files={"file": (file.name, f)}, headers={"Authorization": f"Bearer {mark.PLATFORM_TOKEN}"}, timeout=120)
    if r.status_code != 201:
        raise RuntimeError(f"platform refused {file.name}: {r.status_code} {r.text[:300]}")
    return r.json()["url"]


def stage_media(b: Business, br: Branding, upload: Callable[[str, Path], str] = _upload) -> dict:
    """Copies the chosen media into site/media/ under plain names, uploads each
    one, and returns their addresses on the platform."""
    site_media = b.file("site", "media")
    if site_media.exists():
        shutil.rmtree(site_media)
    site_media.mkdir(parents=True)
    folder = b.key

    def put(src: Optional[Path], name: str) -> Optional[str]:
        if not src:
            return None
        dest = site_media / f"{name}{src.suffix.lower()}"
        shutil.copyfile(src, dest)
        return upload(folder, dest)

    return {
        "logo": put(br.logo, "logo"),
        "photos": [u for u in [put(br.hero, "hero")] + [put(p, f"photo-{i + 1}") for i, p in enumerate(br.gallery)] if u],
        "video": put(br.video, "hero-video"),
    }


# ---------------------------------------------------------------- the website file

PLATFORM_DIR = Path(__file__).resolve().parents[2] / "platform"


def _export(slug: str) -> str:
    """The platform's export script renders the website as one standalone file."""
    npx = shutil.which("npx")
    if not npx:
        raise RuntimeError("Node.js isn't installed, so the website file can't be saved")
    done = subprocess.run([npx, "tsx", "--env-file=.env.local", "scripts/export-site.ts", slug, "--origin", mark.PLATFORM_URL],
                          cwd=PLATFORM_DIR, capture_output=True, text=True, encoding="utf-8", timeout=180)
    if done.returncode != 0 or "<html" not in done.stdout:
        raise RuntimeError(f"couldn't save the website for {slug}: {(done.stderr or done.stdout)[:300]}")
    return done.stdout


def save_site(b: Business, html: str, media_prefix: str) -> Path:
    """The platform's page, with its photo addresses pointed at site/media/ so the
    file works on its own. Book buttons still go to the live booking page."""
    out = b.file("site", "index.html")
    out.parent.mkdir(exist_ok=True)
    out.write_text(html.replace(media_prefix, "media/"), encoding="utf-8")
    return out


# ---------------------------------------------------------------- build

def build_stage(b: Business, brains: Optional[str] = None, label_brains: Optional[str] = None,
                template: Optional[str] = None, log=print,
                upload: Callable[[str, Path], str] = _upload, export: Callable[[str], str] = _export,
                create: Optional[Callable[[dict], dict]] = None) -> Business:
    if b.stage != "2-researched":
        raise pipeline.PipelineError(f"{b.key} is in {b.stage}, build works on researched businesses")
    r = rs.load(b)
    br = brand(b.file("research"), r)
    if br.skipped:
        log(f"MARK: left out {len(br.skipped)} photos: {'; '.join(br.skipped)}")
    urls = stage_media(b, br, upload)
    lead = lead_from_research(b.lead(), r, br)
    lead.logo_url = urls["logo"]
    lead.photos = urls["photos"]
    lead.hero_video = urls["video"]

    chosen = mark.choose_template(lead, template, log=log)
    plan = mark.think(mark.SYSTEM, mark._prompt(lead), mark.Plan, order=brains, log=log)
    labels = mark.translate_labels(plan.language or lead.language or "en", label_brains or brains, log, niche=lead.niche)
    payload = mark.build_payload(lead, plan, chosen, labels)
    result = (create or mark.create_on_platform)(payload)

    # what research found goes back on the lead, so HAPPY and FRIDAY see the same facts
    raw = b.lead()
    for k in ("phone", "address", "rating", "review_count", "hours"):
        if not raw.get(k) and getattr(lead, k, None) is not None:
            raw[k] = getattr(lead, k)
    raw.setdefault("timezone", plan.timezone)
    raw.setdefault("language", plan.language)
    b.save_lead(raw)

    save_site(b, export(result["slug"]), f"{mark.PLATFORM_URL}/media/{b.key}/")
    t = templates.BY_ID[chosen]
    build = {
        "built_at": datetime.now().isoformat(timespec="seconds"),
        "template": chosen, "template_label": t["label"],
        "site": result["site"], "subdomain": result.get("subdomain"), "dashboard": result.get("dashboard"),
        "login": result.get("login"),
        "palette": payload["content"]["palette"], "fonts": t["fonts"],
        "headline": payload["content"]["headline"],
        "services": len(payload["services"]), "priced": sum(1 for x in payload["services"] if x.get("price") is not None),
        "phone": payload.get("phone"),
        "research_source": r.source,
        "media": {"logo": bool(urls["logo"]), "photos": len(urls["photos"]), "video": bool(urls["video"])},
        "left_out": br.skipped,
    }
    b.file("build.json").write_text(json.dumps(build, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    done = pipeline.move(b.key, "demo-built", by="MARK",
                         note=f"built with the {t['label']} template, {len(urls['photos'])} photos{', their reel' if urls['video'] else ''}")
    log(f"MARK: saved the website to {done.file('site', 'index.html')}")
    return done


def run_all(source: Optional[str] = None, brains: Optional[str] = None, label_brains: Optional[str] = None, log=print):
    """Every new lead: research, then build. One failure doesn't stop the rest."""
    for b in pipeline.in_stage("leads"):
        try:
            research_stage(b, source, log)
        except (rs.ResearchError, pipeline.PipelineError) as e:
            log(f"MARK: couldn't research {b.key}: {e}")
            pipeline.find(b.key).log("MARK", f"research failed: {e}")
    for b in pipeline.in_stage("researched"):
        try:
            build_stage(b, brains, label_brains, log=log)
        except Exception as e:                   # noqa: BLE001  log it on the card and carry on
            log(f"MARK: couldn't build {b.key}: {e}")
            b.log("MARK", f"build failed: {str(e).splitlines()[0][:200]}")
    pipeline.board()
