"""
MARK, the developer. Turns a lead into a live demo: website, booking page and a
dashboard login, on the platform.

    lead  ->  brain writes a Plan  ->  code adds the hard facts  ->  platform creates it
"""

import json
import os
import re
import secrets
from pathlib import Path
from typing import Optional

import requests
from pydantic import create_model

from .brains import BrainError, think
from .plan import ICONS, Lead, Plan

PLATFORM_URL = os.environ.get("PLATFORM_URL", "http://localhost:3000").rstrip("/")
PLATFORM_TOKEN = os.environ.get("INTERNAL_API_TOKEN", "")
DEMO_EMAIL_DOMAIN = os.environ.get("DEMO_EMAIL_DOMAIN", "demo.local")

THEME_FOR = {"salon": "salon", "clinic": "clinic", "homeservices": "homeservices"}

# the platform's fixed website words (buttons, headings, form fields), in English
LABELS_EN = json.loads((Path(__file__).resolve().parents[2] / "platform" / "src" / "lib" / "labels.en.json")
                       .read_text(encoding="utf-8"))
Labels = create_model("Labels", **{k: (str, ...) for k in LABELS_EN})
PLACEHOLDER = re.compile(r"\{\w+\}")

SYSTEM = f"""You are MARK, a senior web designer and copywriter. You write the content for a
demo website for one small local business, so its owner sees a polished site
built just for them.

Rules you never break:
- Write every word in the site's language (the "language" field). Plain, warm,
  confident. Short sentences. No buzzwords. Never use em dashes.
- Never invent facts. No awards, no "years of experience", no qualifications,
  no claims about the owner, no review quotes. Highlights must be things that are
  true of booking with them or of the site itself (e.g. "Online booking").
- Prices: only use prices the lead states. Otherwise price is null.
- Services: use the ones the lead lists. If none are listed, choose the 5 or 6
  services almost every business of this kind offers. Durations realistic for the trade.
- Hours: use the lead's hours if given (convert to 24h HH:MM, weekday 1 = Monday).
  If not given, use typical hours for this trade in that country, and set
  hours_are_guessed to true.
- Colours: if brand colours are given, build the palette from them. Otherwise
  pick a palette that suits the trade and feels premium. dark must be readable
  text, light a very pale background.
- Icons: pick each service's icon from this list only: {", ".join(ICONS)}.
- Currency and timezone must be correct for the country and city.
- clinic: calm and reassuring, never mention specific medical outcomes.
  salon: aspirational and personal. homeservices: fast, honest, local, and list
  4 to 8 nearby areas in areasServed."""


def _prompt(lead: Lead) -> str:
    facts = lead.model_dump(exclude_none=True, exclude={"reviews", "photos", "logo_url"})
    if lead.reviews:
        facts["what_customers_say"] = [r.text for r in lead.reviews[:5]]   # tone only, not to quote
    return "Write the demo website plan for this business:\n" + json.dumps(facts, indent=2, ensure_ascii=False)


def _slug(name: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-")[:40] or "business"


def _valid_hex(c: str) -> bool:
    return bool(re.fullmatch(r"#[0-9a-fA-F]{6}", c or ""))


def translate_labels(language: str, brains: Optional[str], log=print) -> dict:
    """The site's fixed words in the lead's language. English needs nothing.
    If every brain fails the demo still ships, just with English buttons."""
    if (language or "en").split("-")[0].lower() == "en":
        return {}
    system = ("You translate the interface text of a small business website. Natural, short, "
              "the way a local business would say it. Keep every {placeholder} exactly as written. "
              "Never use em dashes.")
    prompt = (f"Translate every value into the language with code '{language}'. Keep the keys.\n"
              + json.dumps(LABELS_EN, ensure_ascii=False, indent=1))
    try:
        out = think(system, prompt, Labels, order=brains, log=log).model_dump()
    except BrainError as e:
        log(f"MARK: could not translate the site's buttons, they stay in English ({str(e).splitlines()[0]})")
        return {}
    # a translation that lost a {placeholder} would show broken text. use English there.
    for k, v in out.items():
        if set(PLACEHOLDER.findall(v)) != set(PLACEHOLDER.findall(LABELS_EN[k])) or not v.strip():
            out[k] = LABELS_EN[k]
    return {k: v[:300] for k, v in out.items()}


def build_payload(lead: Lead, plan: Plan, theme: Optional[str] = None, labels: Optional[dict] = None) -> dict:
    """The model's creative work plus the lead's facts. Facts always win."""
    c = plan.content
    palette = c.palette.model_dump()
    for k, v in palette.items():
        if not _valid_hex(v):
            palette[k] = {"primary": "#1f2937", "accent": "#d97706", "dark": "#111827", "light": "#f9fafb"}[k]

    reviews = [r.model_dump() for r in lead.reviews[:6]]          # real ones only
    slug = _slug(lead.name)
    staff = [{"name": n[:80], "title": ""} for n in lead.staff[:10]] or [{"name": "Team", "title": ""}]

    return {
        "slug": None,                                              # platform picks a free one
        "name": lead.name,
        "niche": lead.niche,
        "theme": theme or THEME_FOR[lead.niche],
        "country": lead.country.upper(),
        "language": plan.language or lead.language or "en",
        "currency": plan.currency.upper(),
        "timezone": plan.timezone,
        "phone": lead.phone,
        "email": lead.email,
        "address": lead.address,
        "city": lead.city,
        "reminderChannel": "sms" if lead.country.upper() in {"US", "CA"} else "whatsapp",
        "content": {
            "tagline": c.tagline[:80],
            "headline": c.headline[:120],
            "subheadline": c.subheadline[:280],
            "ctaLabel": c.ctaLabel[:40],
            "aboutTitle": c.aboutTitle[:120],
            "about": c.about[:2000],
            "highlights": [h[:60] for h in c.highlights[:4]],
            "reviews": reviews,
            "faqs": [f.model_dump() for f in c.faqs[:6]],
            "areasServed": c.areasServed[:12] if lead.niche == "homeservices" else [],
            "palette": palette,
            "headingFont": c.headingFont,
            "bodyFont": c.bodyFont,
            "logoUrl": lead.logo_url,
            "heroImage": lead.photos[0] if lead.photos else None,
            "gallery": lead.photos[1:12],
            "instagram": lead.instagram,
            "facebook": lead.facebook,
            "rating": lead.rating,
            "reviewCount": lead.review_count,
            "labels": labels or {},
        },
        "services": [s.model_dump() for s in plan.services],
        "staff": staff,
        "hours": [h.model_dump() for h in plan.hours],
        # a demo login that belongs to you, never the business's real email.
        # they get their own when they sign up.
        "owner": {
            "name": f"{lead.name} (demo)",
            "email": f"demo+{slug}-{secrets.token_hex(3)}@{DEMO_EMAIL_DOMAIN}",
            "password": secrets.token_urlsafe(9),
        },
        "status": "demo",
    }


def create_on_platform(payload: dict) -> dict:
    if not PLATFORM_TOKEN:
        raise RuntimeError("INTERNAL_API_TOKEN is not set, MARK can't reach the platform")
    body = {k: v for k, v in payload.items() if v is not None}
    r = requests.post(f"{PLATFORM_URL}/api/internal/businesses", json=body,
                      headers={"Authorization": f"Bearer {PLATFORM_TOKEN}"}, timeout=60)
    if r.status_code != 201:
        raise RuntimeError(f"platform said {r.status_code}: {r.text[:600]}")
    out = r.json()
    out["login"]["password"] = out["login"].get("password") or payload["owner"]["password"]
    return out


def make_demo(lead: Lead, brains: Optional[str] = None, theme: Optional[str] = None,
              dry_run: bool = False, label_brains: Optional[str] = None, log=print) -> dict:
    log(f"MARK: writing a demo for {lead.name} ({lead.niche}, {lead.city or lead.country})")
    plan = think(SYSTEM, _prompt(lead), Plan, order=brains, log=log)
    if plan.hours_are_guessed:
        log("MARK: no hours on the lead, used typical hours for the trade")
    labels = translate_labels(plan.language or lead.language or "en", label_brains or brains, log)
    payload = build_payload(lead, plan, theme, labels)
    if dry_run:
        return {"payload": payload}
    result = create_on_platform(payload)
    log(f"MARK: done. {result['site']}")
    return result
