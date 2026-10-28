"""
EDITH's social media checks, run through the CLIs on Zain's own subscriptions.

    find   Codex with web search finds each business's own Instagram, Facebook or
           TikTok by name and address, and notices when they do have a website.
           Nothing opens in Zain's browser, so his accounts are never involved.
    check  Claude in Chrome opens each profile in Zain's Chrome and reads the newest
           post date (pinned posts skipped), the followers and the link in the bio.
           Read only, at a human pace, under a daily cap.

    EDITH_SOCIAL   "live" to use the CLIs, anything else uses saved samples (default)

Both caps are in rules.json and counted per day in pipeline/edith-usage.json.
"""

import json
import os
import re
import shutil
import subprocess
import tempfile
from datetime import date
from pathlib import Path
from typing import Dict, List

from . import places
from ..persona import brief as persona_brief

SAMPLES = Path(__file__).resolve().parent.parent.parent / "samples" / "edith"
FIND_BATCH = 10
CHECK_BATCH = 8
CLAUDE_MODEL = os.environ.get("EDITH_CLAUDE_MODEL", "sonnet")


class SocialError(Exception):
    pass


# ---------------------------------------------------------------- daily caps

def used_today(kind: str) -> int:
    return places.usage().get("days", {}).get(date.today().isoformat(), {}).get(kind, 0)


def _count_today(kind: str, n: int):
    u = places.usage()
    day = u.setdefault("days", {}).setdefault(date.today().isoformat(), {})
    day[kind] = day.get(kind, 0) + n
    places._save_usage(u)


def room_today(kind: str, cap: int) -> int:
    return max(0, cap - used_today(kind))


# ---------------------------------------------------------------- what the CLIs are asked

FIND_SCHEMA = {
    "type": "object", "additionalProperties": False, "required": ["results"],
    "properties": {"results": {"type": "array", "items": {
        "type": "object", "additionalProperties": False,
        "required": ["id", "instagram", "facebook", "tiktok", "website"],
        "properties": {"id": {"type": "string"}, "instagram": {"type": ["string", "null"]}, "facebook": {"type": ["string", "null"]},
                       "tiktok": {"type": ["string", "null"]}, "website": {"type": ["string", "null"]}}}}},
}

FIND_PROMPT = """{brief}

Job: for each business below, search the web and find its OWN official profiles.
- instagram: the username only (no @, no link), or null
- facebook: the page name from facebook.com/<page>, or null
- tiktok: the username only, or null
- website: their own website address if they have one, or null. Instagram, Facebook,
  TikTok, WhatsApp, Linktree, Google pages and booking pages (Fresha, Booksy, Treatwell,
  Vagaro, Square, Setmore) do NOT count as a website.
Only give a profile when you're sure it's this exact business: same name and the same
city or area. A business with a similar name somewhere else is not it. When unsure, null.
Answer with the JSON only, one result per business, using its id.

Businesses:
{rows}
"""

CHECK_SCHEMA = {
    "type": "object", "additionalProperties": False, "required": ["profiles"],
    "properties": {"profiles": {"type": "array", "items": {
        "type": "object", "additionalProperties": False,
        "required": ["platform", "handle", "exists", "last_post", "followers", "bio_url"],
        "properties": {"platform": {"enum": ["instagram", "facebook", "tiktok"]}, "handle": {"type": "string"},
                       "exists": {"type": "boolean"}, "last_post": {"type": ["string", "null"]},
                       "followers": {"type": ["integer", "null"]}, "bio_url": {"type": ["string", "null"]}}}}},
}

CHECK_PROMPT = """{brief}

Job: open each profile below in Chrome, one at a time, and read it. Read only: never log
in, follow, like, comment, message or click anything else. Wait a few seconds between
profiles, like a person would.
For each one report:
- exists: false if the page says it isn't available or doesn't exist
- last_post: the date of their NEWEST post as YYYY-MM-DD. Skip pinned posts (Instagram
  shows a pin icon on them at the top of the grid): open the first post that isn't
  pinned and read its date. null if there are no posts or you can't see dates.
- followers: the follower count as a whole number (12.4k is 12400), or null
- bio_url: the link shown in their bio or intro, or null
Answer with the JSON only.

Profiles:
{rows}
"""


def _rows(items: List[str]) -> str:
    return "\n".join(f"- {x}" for x in items)


def profile_url(platform: str, handle: str) -> str:
    return {"instagram": f"https://www.instagram.com/{handle}/", "facebook": f"https://www.facebook.com/{handle}",
            "tiktok": f"https://www.tiktok.com/@{handle}"}[platform]


def _parse_claude(stdout: str) -> dict:
    """claude -p --output-format json wraps the answer: {"result": "...", "structured_output": {...}}."""
    try:
        outer = json.loads(stdout)
    except json.JSONDecodeError:
        raise SocialError("Claude CLI didn't answer in JSON")
    if isinstance(outer, dict) and outer.get("is_error"):
        raise SocialError(f"Claude CLI: {str(outer.get('result'))[:300]}. If it says the login expired: run claude, then /login")
    if isinstance(outer, dict) and isinstance(outer.get("structured_output"), dict):
        return outer["structured_output"]
    m = re.search(r"\{.*\}", outer.get("result", "") if isinstance(outer, dict) else "", re.S)
    if not m:
        raise SocialError("Claude CLI answered without the JSON")
    return json.loads(m.group(0))


# ---------------------------------------------------------------- live

class LiveSocial:
    def __init__(self, log=print, runner=subprocess.run):
        self.log, self.run = log, runner

    def find(self, businesses: List[dict]) -> Dict[str, dict]:
        """businesses: [{"id", "name", "address"}] -> {id: {"instagram", "facebook", "tiktok", "website"}}"""
        exe = shutil.which("codex")
        if not exe:
            raise SocialError("Codex CLI not found. Install it and log in with your ChatGPT account")
        out: Dict[str, dict] = {}
        for i in range(0, len(businesses), FIND_BATCH):
            batch = businesses[i:i + FIND_BATCH]
            rows = _rows([f"id {b['id']}: {b['name']}, {b.get('address') or ''}" for b in batch])
            with tempfile.TemporaryDirectory() as tmp:
                schema, answer = Path(tmp) / "schema.json", Path(tmp) / "answer.json"
                schema.write_text(json.dumps(FIND_SCHEMA), encoding="utf-8")
                cmd = [exe, "--search", "--skip-git-repo-check", "exec", "--output-schema", str(schema), "-o", str(answer), "-"]
                self.log(f"EDITH: asking Codex to find {len(batch)} businesses on social media")
                try:
                    done = self.run(cmd, input=FIND_PROMPT.format(brief=persona_brief("edith"), rows=rows), capture_output=True, text=True,
                                    encoding="utf-8", timeout=900)
                except subprocess.TimeoutExpired:
                    raise SocialError("Codex took longer than 15 minutes and was stopped")
                if done.returncode != 0 or not answer.exists():
                    raise SocialError(f"Codex failed: {(done.stderr or done.stdout or '')[-400:]}")
                found = json.loads(answer.read_text(encoding="utf-8"))
            _count_today("name_searches", len(batch))
            for r in found.get("results", []):
                out[str(r.get("id"))] = r
        return out

    def check(self, profiles: List[tuple]) -> Dict[tuple, dict]:
        """profiles: [(platform, handle)] -> {(platform, handle): {"exists", "last_post", "followers", "bio_url"}}"""
        exe = shutil.which("claude")
        if not exe:
            raise SocialError("Claude Code CLI not found. Install it, log in, and turn on the Claude in Chrome extension")
        out: Dict[tuple, dict] = {}
        for i in range(0, len(profiles), CHECK_BATCH):
            batch = profiles[i:i + CHECK_BATCH]
            rows = _rows([f"{p}: {h}  {profile_url(p, h)}" for p, h in batch])
            cmd = [exe, "-p", "--chrome", "--model", CLAUDE_MODEL, "--output-format", "json",
                   "--json-schema", json.dumps(CHECK_SCHEMA), "--allowedTools", "mcp__claude-in-chrome__*"]
            self.log(f"EDITH: reading {len(batch)} profiles in your Chrome")
            try:
                done = self.run(cmd, input=CHECK_PROMPT.format(brief=persona_brief("edith"), rows=rows), capture_output=True, text=True,
                                encoding="utf-8", timeout=1200)
            except subprocess.TimeoutExpired:
                raise SocialError("reading profiles took longer than 20 minutes and was stopped")
            _count_today("profile_checks", len(batch))
            if done.returncode != 0:
                raise SocialError(f"Claude CLI failed: {(done.stderr or done.stdout or '')[:400]}")
            for p in _parse_claude(done.stdout).get("profiles", []):
                out[(p["platform"], str(p["handle"]).lower().lstrip("@"))] = p
        return out


# ---------------------------------------------------------------- saved samples

class SampleSocial:
    """Saved answers, so EDITH can be built and tested with no CLI and no cost.
    Dates written as {days_ago:N} become real dates N days before today."""

    def __init__(self, folder: Path = SAMPLES, log=print):
        self.folder, self.log = folder, log

    def _load(self, name: str):
        text = (self.folder / name).read_text(encoding="utf-8")
        today = date.today()
        text = re.sub(r"\{days_ago:(\d+)\}", lambda m: date.fromordinal(today.toordinal() - int(m.group(1))).isoformat(), text)
        return json.loads(text)

    def find(self, businesses: List[dict]) -> Dict[str, dict]:
        known = self._load("found.json")
        _count_today("name_searches", len(businesses))
        return {b["id"]: known.get(b["name"], {"instagram": None, "facebook": None, "tiktok": None, "website": None}) for b in businesses}

    def check(self, profiles: List[tuple]) -> Dict[tuple, dict]:
        known = self._load("profiles.json")
        _count_today("profile_checks", len(profiles))
        out = {}
        for p, h in profiles:
            found = known.get(f"{p}:{h.lower()}")
            out[(p, h.lower())] = {"platform": p, "handle": h, **(found or {"exists": False, "last_post": None, "followers": None, "bio_url": None})}
        return out


def client(log=print):
    return LiveSocial(log=log) if os.environ.get("EDITH_SOCIAL", "sample") == "live" else SampleSocial(log=log)
