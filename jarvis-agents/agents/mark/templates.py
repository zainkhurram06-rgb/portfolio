"""
How MARK picks a website template for a lead. Plain code, no AI.

The templates live in platform/src/templates/library.json, the same file the
platform renders from. For each lead MARK:

  1. keeps the templates made for the lead's trade
  2. drops the ones that need a real photo when the lead has none
  3. scores the rest by how much of each page the lead's facts will fill
     (reviews, prices, team, insurers, packages, before and after photos...)
  4. among the best, prefers the one used least in the same city, so two shops
     on one street don't get the same site, then a stable per-lead choice so
     the same lead always gets the same answer
"""

import hashlib
import json
import re
from dataclasses import dataclass, field
from pathlib import Path
from typing import Dict, List, Optional

LIBRARY_FILE = Path(__file__).resolve().parents[2] / "platform" / "src" / "templates" / "library.json"
LIBRARY: List[dict] = json.loads(LIBRARY_FILE.read_text(encoding="utf-8"))["templates"]
BY_ID: Dict[str, dict] = {t["id"]: t for t in LIBRARY}

# a template within this many points of the best still counts as "best", which
# keeps some variety instead of every rich lead getting the same design
NEAR_BEST = 1


@dataclass
class Choice:
    template: dict
    score: int
    reasons: List[str] = field(default_factory=list)

    @property
    def id(self) -> str:
        return self.template["id"]


def for_niche(niche: str) -> List[dict]:
    return [t for t in LIBRARY if niche in t["niches"]]


def fits(template_id: str, niche: str) -> bool:
    return template_id in BY_ID and niche in BY_ID[template_id]["niches"]


def _steps(t: dict) -> List[tuple]:
    return [tuple(s.split(":")[:2]) for s in t["sections"]]


def _facts(lead) -> Dict[str, bool]:
    return {
        "photo": len(lead.photos) >= 1,
        "gallery": len(lead.photos) >= 4,
        "reviews": len(lead.reviews) > 0,
        "rating": lead.rating is not None,
        "prices": bool(lead.services and re.search(r"\d", lead.services)) or bool(lead.packages),
        "team": len([s for s in lead.staff if s.strip()]) >= 2,
        "insurers": bool(lead.insurers),
        "packages": bool(lead.packages),
        "guarantee": bool(lead.warranty or lead.credentials),
        "before_after": bool(lead.before_after),
    }


def score(t: dict, lead) -> Choice:
    """Points for every part of the page the lead's own facts will fill."""
    f = _facts(lead)
    points, why = 0, []

    def add(n: int, reason: str):
        nonlocal points
        points += n
        why.append(reason)

    for kind, version in _steps(t):
        if kind == "hero" and version in ("photo", "collage") and f["photo"]:
            add(2, "their photo leads the page")
        elif kind == "gallery" and version == "beforeafter" and f["before_after"]:
            add(2, "shows their before and after photos")
        elif kind == "gallery" and version != "beforeafter" and f["gallery"]:
            add(1, "has a gallery for their photos")
        elif kind == "reviews" and f["reviews"]:
            add(1, "shows their reviews")
        elif kind == "reviews" and version == "rating" and f["rating"]:
            add(1, "shows their Google rating")
        elif kind == "services" and version == "packages" and f["packages"]:
            add(2, "shows their wash packages")
        elif (kind, version) in (("services", "menu"), ("hero", "card")) and f["prices"]:
            add(1, "puts their prices up front")
        elif kind == "team" and f["team"]:
            add(1, "introduces their team")
        elif kind == "insurance" and f["insurers"]:
            add(1, "lists the insurance they take")
        elif kind == "guarantee" and f["guarantee"]:
            add(1, "shows their guarantee")
    return Choice(t, points, why)


def _stable(lead_name: str, template_id: str) -> str:
    return hashlib.sha1(f"{lead_name.lower()}|{template_id}".encode()).hexdigest()


def pick(lead, used_nearby: Optional[Dict[str, int]] = None) -> Choice:
    """The best template for this lead. used_nearby: template id -> how many
    businesses in the same trade and city already use it."""
    candidates = for_niche(lead.niche)
    if not candidates:
        raise ValueError(f"no templates for {lead.niche}")
    has_photo = len(lead.photos) > 0
    usable = [t for t in candidates if has_photo or not t.get("needsPhoto")] or candidates
    scored = [score(t, lead) for t in usable]
    best = max(c.score for c in scored)
    near = [c for c in scored if c.score >= best - NEAR_BEST]
    used = used_nearby or {}
    near.sort(key=lambda c: (used.get(c.id, 0), -c.score, _stable(lead.name, c.id)))
    choice = near[0]
    if used.get(choice.id, 0) == 0 and any(used.values()):
        choice.reasons.append("nobody nearby uses it yet")
    return choice
