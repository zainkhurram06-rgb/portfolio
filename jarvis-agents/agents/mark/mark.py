"""
MARK, the developer. Turns a lead into a live demo: website, booking page and a
dashboard login, on the platform.

    lead  ->  code picks a template  ->  brain writes a Plan  ->  code adds the hard facts
          ->  platform creates it
"""

import json
import os
import re
import secrets
from pathlib import Path
from typing import Optional

import requests
from pydantic import create_model

from . import templates
from .brains import BrainError, think
from .plan import ICONS, Lead, Plan

PLATFORM_URL = os.environ.get("PLATFORM_URL", "http://localhost:3000").rstrip("/")
PLATFORM_TOKEN = os.environ.get("INTERNAL_API_TOKEN", "")
DEMO_EMAIL_DOMAIN = os.environ.get("DEMO_EMAIL_DOMAIN", "demo.local")

LOCAL_TRADES = {"homeservices", "carwash", "autorepair"}

# the platform's fixed website words (buttons, headings, form fields), in English
_LIB = Path(__file__).resolve().parents[2] / "platform" / "src" / "lib"
LABELS_EN = json.loads((_LIB / "labels.en.json").read_text(encoding="utf-8"))
LABELS_NICHE_EN = json.loads((_LIB / "labels.niches.en.json").read_text(encoding="utf-8"))


def english_for(niche: str) -> dict:
    """The shared site words with that trade's own wording on top, as the platform does."""
    return {**LABELS_EN, **LABELS_NICHE_EN.get(niche, {})}
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
- social_text is their own Instagram or Facebook bio and captions. Use it for
  their services, prices, hours and the way they talk. Never quote it as a
  review and never copy captions word for word.
- Services: use the ones the lead lists. If none are listed, choose the 5 or 6
  services almost every business of this kind offers. Durations realistic for the trade.
- Hours: use the lead's hours if given (convert to 24h HH:MM, weekday 1 = Monday).
  If not given, use typical hours for this trade in that country, and set
  hours_are_guessed to true.
- Colours: only if brand colours are given, build the palette from them (dark
  must be readable text, light a very pale background). Otherwise palette is
  null: the design brings its own colours.
- Icons: pick each service's icon from this list only: {", ".join(ICONS)}.
- Currency and timezone must be correct for the country and city.
- dental, medical, dermatology: calm and reassuring. Never promise medical
  outcomes or mention specific conditions being cured.
- salon: aspirational and personal.
- carwash: quick, clean, proud of the finish. Services are wash packages and
  details, priced by vehicle size if the lead gives sizes.
- autorepair: honest and plain spoken. Stress quotes before work, no surprises.
- homeservices: fast, honest, local.
- For homeservices, carwash and autorepair, list 4 to 8 nearby areas in areasServed."""


def _prompt(lead: Lead) -> str:
    facts = lead.model_dump(exclude_none=True, exclude={"reviews", "photos", "logo_url", "before_after", "palette", "hero_video"})
    if lead.reviews:
        facts["what_customers_say"] = [r.text for r in lead.reviews[:5]]   # tone only, not to quote
    return "Write the demo website plan for this business:\n" + json.dumps(facts, indent=2, ensure_ascii=False)


def _slug(name: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-")[:40] or "business"


def _valid_hex(c: str) -> bool:
    return bool(re.fullmatch(r"#[0-9a-fA-F]{6}", c or ""))


def translate_labels(language: str, brains: Optional[str], log=print, niche: str = "") -> dict:
    """The site's fixed words in the lead's language. English needs nothing.
    If every brain fails the demo still ships, just with English buttons."""
    if (language or "en").split("-")[0].lower() == "en":
        return {}
    system = ("You translate the interface text of a small business website. Natural, short, "
              "the way a local business would say it. Keep every {placeholder} exactly as written. "
              "Never use em dashes.")
    prompt = (f"Translate every value into the language with code '{language}'. Keep the keys.\n"
              + json.dumps(english_for(niche), ensure_ascii=False, indent=1))
    try:
        out = think(system, prompt, Labels, order=brains, log=log).model_dump()
    except BrainError as e:
        log(f"MARK: could not translate the site's buttons, they stay in English ({str(e).splitlines()[0]})")
        return {}
    # a translation that lost a {placeholder} would show broken text. use English there.
    for k, v in out.items():
        source = english_for(niche)[k]
        if set(PLACEHOLDER.findall(v)) != set(PLACEHOLDER.findall(source)) or not v.strip():
            out[k] = source
    return {k: v[:300] for k, v in out.items()}


def build_payload(lead: Lead, plan: Plan, template: Optional[str] = None, labels: Optional[dict] = None) -> dict:
    """The model's creative work plus the lead's facts. Facts always win."""
    c = plan.content
    t = templates.BY_ID[template] if template else templates.pick(lead).template
    # colours: taken from their own logo and photos if research found them,
    # else built by the AI from brand colours, else the template's own
    palette = dict(t["palette"])
    if lead.palette and all(_valid_hex(lead.palette.get(k, "")) for k in palette):
        palette = {k: lead.palette[k] for k in palette}
    elif lead.brand_colours and c.palette:
        for k, v in c.palette.model_dump().items():
            if _valid_hex(v):
                palette[k] = v

    reviews = [r.model_dump() for r in lead.reviews[:6]]          # real ones only
    slug = _slug(lead.name)
    staff = [{"name": n[:80], "title": ""} for n in lead.staff[:10]] or [{"name": "Team", "title": ""}]

    return {
        "slug": None,                                              # platform picks a free one
        "name": lead.name,
        "niche": lead.niche,
        "theme": t["id"],
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
            "areasServed": c.areasServed[:12] if lead.niche in LOCAL_TRADES else [],
            "palette": palette,
            "headingFont": t["fonts"][0],
            "bodyFont": t["fonts"][1],
            "logoUrl": lead.logo_url,
            "heroImage": lead.photos[0] if lead.photos else None,
            "heroVideo": lead.hero_video,
            "gallery": lead.photos[1:12],
            "instagram": lead.instagram,
            "facebook": lead.facebook,
            "rating": lead.rating,
            "reviewCount": lead.review_count,
            "labels": labels or {},
            # trade details, straight from the lead
            "credentials": [x[:80] for x in lead.credentials[:6]],
            "warranty": lead.warranty[:200] if lead.warranty else None,
            "insurers": [x[:60] for x in lead.insurers[:20]],
            "packages": [p.model_dump() for p in lead.packages[:4]] if lead.niche == "carwash" else [],
            "beforeAfter": [b.model_dump() for b in lead.before_after[:6]],
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


def used_nearby(lead: Lead) -> dict:
    """How many businesses in the same trade and city already use each template.
    Empty if the platform can't be asked, which only costs a little variety."""
    if not PLATFORM_TOKEN or not lead.city:
        return {}
    try:
        r = requests.get(f"{PLATFORM_URL}/api/internal/themes", params={"niche": lead.niche, "city": lead.city},
                         headers={"Authorization": f"Bearer {PLATFORM_TOKEN}"}, timeout=15)
        r.raise_for_status()
        return {t["id"]: t.get("usedNearby", 0) for t in r.json()}
    except (requests.RequestException, ValueError, KeyError, TypeError):
        return {}


def choose_template(lead: Lead, forced: Optional[str] = None, dry_run: bool = False, log=print) -> str:
    if forced:
        if not templates.fits(forced, lead.niche):
            raise RuntimeError(f"template {forced} doesn't exist for {lead.niche}. "
                               f"Pick one of: {', '.join(t['id'] for t in templates.for_niche(lead.niche))}")
        log(f"MARK: using the template you asked for, {forced}")
        return forced
    choice = templates.pick(lead, {} if dry_run else used_nearby(lead))
    why = "; ".join(dict.fromkeys(choice.reasons)) or "a clean fit for the trade"
    log(f"MARK: picked the {choice.template['label']} template ({choice.id}): {why}")
    return choice.id


def make_demo(lead: Lead, brains: Optional[str] = None, theme: Optional[str] = None,
              dry_run: bool = False, label_brains: Optional[str] = None, log=print) -> dict:
    log(f"MARK: writing a demo for {lead.name} ({lead.niche}, {lead.city or lead.country})")
    template = choose_template(lead, theme, dry_run, log)
    plan = think(SYSTEM, _prompt(lead), Plan, order=brains, log=log)
    if plan.hours_are_guessed:
        log("MARK: no hours on the lead, used typical hours for the trade")
    labels = translate_labels(plan.language or lead.language or "en", label_brains or brains, log, niche=lead.niche)
    payload = build_payload(lead, plan, template, labels)
    if dry_run:
        return {"payload": payload}
    result = create_on_platform(payload)
    log(f"MARK: done. {result['site']}")
    return result
