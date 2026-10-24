"""
Run MARK from the command line.

    python -m agents.mark demo --lead lead.json
    python -m agents.mark demo --name "Bright Smile Dental" --niche dental --country GB --city Leeds --phone "+44 113 555 0101"
    python -m agents.mark demo --lead lead.json --dry-run          (show what would be created)
    python -m agents.mark demo --lead lead.json --brains codex     (pick the brain)
    python -m agents.mark demo --lead lead.json --template salon-noir  (pick the design yourself)
    python -m agents.mark templates --niche salon                  (list the designs)

Working the pipeline (see agents/pipeline.py):
    python -m agents.mark research glow-lab-nails-dubai            (1-leads -> 2-researched)
    python -m agents.mark research --all --source chrome           (real research in your Chrome)
    python -m agents.mark build glow-lab-nails-dubai               (2-researched -> 3-demo-built)
    python -m agents.mark work                                     (every new lead, start to finish)

Needs INTERNAL_API_TOKEN (same as the platform's) and PLATFORM_URL if the
platform isn't on localhost:3000. Brains need their own keys, see brains.py.
"""

import argparse
import json
import sys
from pathlib import Path

from pydantic import ValidationError

from .. import pipeline
from . import research as rs, templates, work
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
    r = sub.add_parser("research", help="pull a lead's brand from social media (1-leads -> 2-researched)")
    r.add_argument("key", nargs="?")
    r.add_argument("--all", action="store_true")
    r.add_argument("--source", choices=list(rs.SOURCES), help="default: MARK_RESEARCH, or sample")
    b = sub.add_parser("build", help="build a researched business's website (2-researched -> 3-demo-built)")
    b.add_argument("key", nargs="?")
    b.add_argument("--all", action="store_true")
    b.add_argument("--template")
    b.add_argument("--brains")
    b.add_argument("--label-brains")
    w = sub.add_parser("work", help="research and build every new lead")
    w.add_argument("--source", choices=list(rs.SOURCES))
    w.add_argument("--brains")
    w.add_argument("--label-brains")
    a = p.parse_args()
    say = lambda m: print(m, file=sys.stderr)       # noqa: E731

    if a.cmd in ("research", "build", "work"):
        try:
            if a.cmd == "work":
                work.run_all(a.source, a.brains, a.label_brains, log=say)
            else:
                stage = "leads" if a.cmd == "research" else "researched"
                todo = pipeline.in_stage(stage) if a.all else [pipeline.find(a.key)] if a.key else []
                if not todo:
                    sys.exit(f"name a business, or use --all. Nothing waiting in {stage}" if a.all else "name a business, or use --all")
                failed = 0
                for biz in todo:
                    try:
                        done = work.research_stage(biz, a.source, log=say) if a.cmd == "research"                             else work.build_stage(biz, a.brains, a.label_brains, a.template, log=say)
                        print(f"{done.key} -> {done.stage}")
                    except (rs.ResearchError, BrainError, RuntimeError) as e:
                        failed += 1
                        say(f"MARK: {biz.key} failed: {e}")
                        biz.log("MARK", f"{a.cmd} failed: {str(e).splitlines()[0][:200]}")
                pipeline.board()
                if failed:
                    sys.exit(f"{failed} of {len(todo)} failed, see above")
        except (pipeline.PipelineError, rs.ResearchError, BrainError, RuntimeError) as e:
            sys.exit(str(e))
        print(f"board: {pipeline.ROOT / 'index.html'}")
        return

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
