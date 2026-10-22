"""
Run MARK from the command line.

    python -m agents.mark demo --lead lead.json
    python -m agents.mark demo --name "Bright Smile Dental" --niche dental --country GB --city Leeds --phone "+44 113 555 0101"
    python -m agents.mark demo --lead lead.json --dry-run          (show what would be created)
    python -m agents.mark demo --lead lead.json --brains codex     (pick the brain)
    python -m agents.mark demo --lead lead.json --template salon-noir  (pick the design yourself)
    python -m agents.mark templates --niche salon                  (list the designs)

Needs INTERNAL_API_TOKEN (same as the platform's) and PLATFORM_URL if the
platform isn't on localhost:3000. Brains need their own keys, see brains.py.
"""

import argparse
import json
import sys
from pathlib import Path

from pydantic import ValidationError

from . import templates
from .brains import BrainError
from .mark import make_demo
from .plan import NICHES, Lead


def main():
    p = argparse.ArgumentParser(prog="mark", description="MARK builds demo websites from leads")
    sub = p.add_subparsers(dest="cmd", required=True)
    d = sub.add_parser("demo", help="build a demo for one lead")
    d.add_argument("--lead", help="JSON file with the lead")
    d.add_argument("--name"); d.add_argument("--niche", choices=NICHES)
    d.add_argument("--country"); d.add_argument("--city"); d.add_argument("--phone")
    d.add_argument("--email"); d.add_argument("--address"); d.add_argument("--instagram")
    d.add_argument("--services", help="what they offer, free text")
    d.add_argument("--hours", help="opening hours, free text")
    d.add_argument("--language")
    d.add_argument("--template", "--theme", dest="theme", help="force a template instead of letting MARK pick, e.g. salon-noir")
    d.add_argument("--brains", help="e.g. haiku,deepseek,codex  or  file:plan.json")
    d.add_argument("--label-brains", help="brains for translating the site's buttons, defaults to --brains")
    d.add_argument("--dry-run", action="store_true", help="print the business instead of creating it")
    ls = sub.add_parser("templates", help="list the website templates")
    ls.add_argument("--niche", choices=NICHES)
    a = p.parse_args()

    if a.cmd == "templates":
        for t in templates.LIBRARY:
            if not a.niche or a.niche in t["niches"]:
                print(f"{t['id']:20} {t['label']:22} {', '.join(t['niches'])}{'  (needs a photo)' if t.get('needsPhoto') else ''}")
        return

    raw = json.loads(Path(a.lead).read_text(encoding="utf-8")) if a.lead else {}
    for k in ("name", "niche", "country", "city", "phone", "email", "address", "instagram", "services", "hours", "language"):
        if getattr(a, k):
            raw[k] = getattr(a, k)
    try:
        lead = Lead.model_validate(raw)
    except ValidationError as e:
        sys.exit(f"the lead is missing something:\n{e}")

    try:
        result = make_demo(lead, brains=a.brains, theme=a.theme, dry_run=a.dry_run, label_brains=a.label_brains,
                           log=lambda m: print(m, file=sys.stderr))
    except (BrainError, RuntimeError) as e:
        sys.exit(str(e))
    print(json.dumps(result, indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()
