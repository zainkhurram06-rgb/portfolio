"""
MARK's research step: pull a business's brand from their social media into
their pipeline folder. Our leads have no website, so this is where their
logo, photos, videos, prices and reviews come from.

    research/research.json   what was found (bio, posts, Google listing)
    research/media/          the downloaded logo, photos and videos

Sources, picked with MARK_RESEARCH (default: sample):
    sample   saved research from samples/research/, matched by social handle.
             free, no internet, for testing
    chrome   Claude Code CLI on Sonnet, driving your own logged-in Chrome
             through the Claude in Chrome extension. No login walls. Browses at
             a human pace, and stops after RESEARCH_DAILY_CAP businesses a day
             (default 25) so Instagram doesn't flag your account
"""

import json
import os
import re
import shutil
import subprocess
from datetime import date
from pathlib import Path
from typing import List, Literal, Optional
from urllib.parse import urlparse

import requests
from pydantic import BaseModel, Field

from ..pipeline import ROOT as PIPELINE_ROOT, Business

SAMPLES = Path(__file__).resolve().parents[2] / "samples" / "research"
DAILY_CAP = int(os.environ.get("RESEARCH_DAILY_CAP", "25"))
CLAUDE_MODEL = os.environ.get("MARK_RESEARCH_MODEL", "sonnet")
CLAUDE_TIMEOUT = 900


class ResearchError(Exception):
    pass


# ---------------------------------------------------------------- what research finds

class Post(BaseModel):
    kind: Literal["photo", "video"]
    file: Optional[str] = Field(None, description="path inside research/, once downloaded")
    media_url: Optional[str] = Field(None, description="where it was downloaded from")
    caption: str = ""
    likes: Optional[int] = None
    url: Optional[str] = None


class Profile(BaseModel):
    platform: str
    handle: Optional[str] = None
    url: Optional[str] = None
    name: Optional[str] = None
    bio: str = ""
    followers: Optional[int] = None
    category: Optional[str] = None
    profile_pic: Optional[str] = Field(None, description="path inside research/")
    profile_pic_url: Optional[str] = None


class GoogleReview(BaseModel):
    author: str
    rating: int = Field(ge=1, le=5)
    text: str


class Google(BaseModel):
    name: Optional[str] = None
    rating: Optional[float] = None
    review_count: Optional[int] = None
    reviews: List[GoogleReview] = Field(default_factory=list)
    phone: Optional[str] = None
    address: Optional[str] = None
    hours: Optional[str] = None
    category: Optional[str] = None


class Research(BaseModel):
    source: str
    profile: Optional[Profile] = None
    posts: List[Post] = Field(default_factory=list)
    google: Optional[Google] = None


def load(b: Business) -> Research:
    return Research.model_validate_json(b.file("research", "research.json").read_text(encoding="utf-8"))


def _save(b: Business, r: Research):
    b.file("research").mkdir(exist_ok=True)
    b.file("research", "research.json").write_text(r.model_dump_json(indent=2, exclude_none=True) + "\n", encoding="utf-8")


def handles(lead: dict) -> List[str]:
    """instagram.com/glowlab.nails -> glowlab.nails, for every social link on the lead."""
    out = []
    for k in ("instagram", "facebook", "tiktok"):
        u = lead.get(k)
        if u:
            part = urlparse(u if "//" in u else f"https://{u}").path.strip("/").split("/")[0].lstrip("@")
            if part:
                out.append(part.lower())
    return out


# ---------------------------------------------------------------- sample source

def from_sample(b: Business, log=print) -> Research:
    lead = b.lead()
    for h in handles(lead):
        src = SAMPLES / h
        if (src / "research.json").exists():
            dest = b.file("research")
            if dest.exists():
                shutil.rmtree(dest)
            shutil.copytree(src, dest)
            log(f"MARK: research from the saved sample for @{h}")
            return load(b)
    raise ResearchError(f"no sample research for {lead['name']} (looked for {', '.join(handles(lead)) or 'a social link'})")


# ---------------------------------------------------------------- Claude in Chrome source

RESEARCH_PROMPT = """You are researching a small local business that has NO website, to build them a demo
website. Use the Chrome browser tools. You are logged in as the user, so be gentle: open one
page at a time, scroll like a person, wait a few seconds between pages, never like, follow,
comment or message anyone, and never change anything on any account.

Business: {name} ({niche}) in {city}
Social links: {links}

1. Open each social profile. Record the display name, bio (full text, it often has prices and
   hours), follower count, category, and the profile picture's image address.
2. On the main profile (Instagram first), open up to 12 of the most recent posts one by one.
   For each record: photo or video, the caption, likes if shown, the post's own link, and the
   direct address of the full-size image (or the video file if it has a normal https address,
   not a blob: one). Skip posts that are mostly text or adverts.
3. If there's a Google Maps link, or you can find their Google listing by searching
   "{name} {city}" on Google Maps, record rating, number of reviews, up to 5 recent reviews
   (author, stars, text), phone, address, opening hours and category.
4. Never invent anything. Leave out what you couldn't see.

Answer with only the JSON object described by the schema."""

CLAUDE_SCHEMA = {
    "type": "object",
    "properties": {
        "profile": {"type": "object", "properties": {
            "platform": {"type": "string"}, "handle": {"type": "string"}, "url": {"type": "string"},
            "name": {"type": "string"}, "bio": {"type": "string"}, "followers": {"type": "integer"},
            "category": {"type": "string"}, "profile_pic_url": {"type": "string"}}, "required": ["platform"]},
        "posts": {"type": "array", "items": {"type": "object", "properties": {
            "kind": {"enum": ["photo", "video"]}, "media_url": {"type": "string"}, "caption": {"type": "string"},
            "likes": {"type": "integer"}, "url": {"type": "string"}}, "required": ["kind"]}},
        "google": {"type": "object", "properties": {
            "name": {"type": "string"}, "rating": {"type": "number"}, "review_count": {"type": "integer"},
            "reviews": {"type": "array", "items": {"type": "object", "properties": {
                "author": {"type": "string"}, "rating": {"type": "integer"}, "text": {"type": "string"}},
                "required": ["author", "rating", "text"]}},
            "phone": {"type": "string"}, "address": {"type": "string"}, "hours": {"type": "string"}, "category": {"type": "string"}}},
    },
    "required": ["posts"],
}


def _cap_file() -> Path:
    return PIPELINE_ROOT / ".research-count.json"


def _count_today(add: int = 0) -> int:
    f = _cap_file()
    data = json.loads(f.read_text(encoding="utf-8")) if f.exists() else {}
    today = date.today().isoformat()
    n = data.get(today, 0) + add
    if add:
        f.parent.mkdir(parents=True, exist_ok=True)
        f.write_text(json.dumps({today: n}), encoding="utf-8")
    return n


def _ext(url: str, content_type: str) -> str:
    if "video" in content_type or re.search(r"\.mp4(\?|$)", url):
        return ".mp4"
    if "png" in content_type:
        return ".png"
    if "webp" in content_type:
        return ".webp"
    return ".jpg"


def _download(url: str, dest_stem: Path) -> Optional[str]:
    try:
        r = requests.get(url, timeout=60, headers={"User-Agent": "Mozilla/5.0"})
        r.raise_for_status()
    except requests.RequestException:
        return None
    ctype = r.headers.get("content-type", "")
    if not (ctype.startswith("image/") or ctype.startswith("video/")):
        return None
    path = dest_stem.with_suffix(_ext(url, ctype))
    path.write_bytes(r.content)
    return path.name


def from_chrome(b: Business, log=print, runner=subprocess.run) -> Research:
    if _count_today() >= DAILY_CAP:
        raise ResearchError(f"daily research cap of {DAILY_CAP} reached, so Instagram doesn't flag your account. Set RESEARCH_DAILY_CAP to change it")
    exe = shutil.which("claude")
    if not exe:
        raise ResearchError("Claude Code CLI not found. Install it and log in, and install the Claude in Chrome extension")
    lead = b.lead()
    links = ", ".join(f"{k}: {lead[k]}" for k in ("instagram", "facebook", "tiktok", "google_maps_url") if lead.get(k)) or "none, search for them"
    prompt = RESEARCH_PROMPT.format(name=lead["name"], niche=lead["niche"], city=lead.get("city") or lead.get("country"), links=links)
    log(f"MARK: researching {lead['name']} in your Chrome (Claude {CLAUDE_MODEL}), this takes a few minutes")
    cmd = [exe, "-p", "--chrome", "--model", CLAUDE_MODEL, "--output-format", "json",
           "--json-schema", json.dumps(CLAUDE_SCHEMA), "--allowedTools", "mcp__claude-in-chrome__*"]
    try:
        done = runner(cmd, input=prompt, capture_output=True, text=True, encoding="utf-8", timeout=CLAUDE_TIMEOUT)
    except subprocess.TimeoutExpired:
        raise ResearchError("research took longer than 15 minutes and was stopped")
    _count_today(add=1)
    if done.returncode != 0:
        raise ResearchError(f"Claude CLI failed: {(done.stderr or done.stdout)[:400]}")
    found = _parse_cli(done.stdout)

    media = b.file("research", "media")
    if media.exists():
        shutil.rmtree(media)
    media.mkdir(parents=True)
    r = Research(source=f"chrome ({CLAUDE_MODEL})", profile=Profile(**found["profile"]) if found.get("profile") else None,
                 google=Google(**found["google"]) if found.get("google") else None)
    if r.profile and r.profile.profile_pic_url:
        name = _download(r.profile.profile_pic_url, media / "logo")
        r.profile.profile_pic = f"media/{name}" if name else None
    for i, p in enumerate(found.get("posts", [])[:12]):
        post = Post(**p)
        if post.media_url:
            name = _download(post.media_url, media / f"{'reel' if post.kind == 'video' else 'post'}-{i + 1}")
            post.file = f"media/{name}" if name else None
        r.posts.append(post)
    got = sum(1 for p in r.posts if p.file)
    log(f"MARK: found {len(r.posts)} posts, downloaded {got}" + (", plus their Google listing" if r.google else ""))
    _save(b, r)
    return r


def _parse_cli(stdout: str) -> dict:
    """claude -p --output-format json wraps the answer: {"result": "...", "structured_output": {...}}."""
    try:
        outer = json.loads(stdout)
    except json.JSONDecodeError:
        raise ResearchError("Claude CLI didn't answer in JSON")
    if isinstance(outer, dict) and outer.get("is_error"):
        # e.g. "OAuth session expired": run `claude` in a terminal and /login
        raise ResearchError(f"Claude CLI: {str(outer.get('result'))[:300]}")
    if isinstance(outer, dict) and isinstance(outer.get("structured_output"), dict):
        return outer["structured_output"]
    text = outer.get("result", "") if isinstance(outer, dict) else ""
    m = re.search(r"\{.*\}", text, re.S)
    if not m:
        raise ResearchError("Claude CLI answered without the research JSON")
    return json.loads(m.group(0))


SOURCES = {"sample": from_sample, "chrome": from_chrome}


def research(b: Business, source: Optional[str] = None, log=print) -> Research:
    name = source or os.environ.get("MARK_RESEARCH", "sample")
    if name not in SOURCES:
        raise ResearchError(f"unknown research source {name}. Use: {', '.join(SOURCES)}")
    return SOURCES[name](b, log=log)
