"""
Run EDITH from the command line.

    python -m agents.edith find --niche salon --city Dubai --country AE
    python -m agents.edith plan add 2026-10-27 salon Dubai AE      (one city a day)
    python -m agents.edith plan list
    python -m agents.edith today                                   (run today's city from the plan)
    python -m agents.edith rules                                   (show the rules she uses)

Without EDITH_APIFY=live she uses saved sample results: free, for testing.
Live needs APIFY_TOKEN. Rules and search terms are in agents/edith/rules.json.
"""

import argparse
import json
import sys
from datetime import date

from .. import pipeline
from . import apify, edith

PLAN = pipeline.ROOT / "edith-plan.json"


def load_plan() -> list:
    return json.loads(PLAN.read_text(encoding="utf-8")) if PLAN.exists() else []


def save_plan(plan: list):
    PLAN.parent.mkdir(parents=True, exist_ok=True)
    PLAN.write_text(json.dumps(sorted(plan, key=lambda x: x["date"]), indent=2) + "\n", encoding="utf-8")


def main(argv=None):
    p = argparse.ArgumentParser(prog="edith", description="EDITH finds leads with no website")
    sub = p.add_subparsers(dest="cmd", required=True)
    f = sub.add_parser("find", help="find leads in one city now")
    f.add_argument("--niche", required=True)
    f.add_argument("--city", required=True)
    f.add_argument("--country", required=True, help="2-letter code, e.g. AE")
    pl = sub.add_parser("plan", help="the one-city-a-day plan")
    pls = pl.add_subparsers(dest="action", required=True)
    pa = pls.add_parser("add")
    pa.add_argument("date", help="YYYY-MM-DD")
    pa.add_argument("niche")
    pa.add_argument("city")
    pa.add_argument("country")
    pls.add_parser("list")
    sub.add_parser("today", help="run today's city from the plan")
    sub.add_parser("rules", help="show the rules")
    a = p.parse_args(argv)
    say = lambda m: print(m, file=sys.stderr)       # noqa: E731

    try:
        if a.cmd == "find":
            out = edith.find(a.niche, a.city, a.country, log=say)
            print(json.dumps({k: v for k, v in out.items() if k != "kept"} | {"kept": len(out["kept"])}, indent=2))
        elif a.cmd == "plan" and a.action == "add":
            date.fromisoformat(a.date)
            plan = [x for x in load_plan() if x["date"] != a.date]
            save_plan(plan + [{"date": a.date, "niche": a.niche, "city": a.city, "country": a.country.upper(), "done": False}])
            print(f"{a.date}: {a.niche} in {a.city}, {a.country.upper()}")
        elif a.cmd == "plan":
            for x in load_plan():
                print(f"{x['date']}  {x['niche']:12} {x['city']}, {x['country']}{'   done' if x.get('done') else ''}")
        elif a.cmd == "today":
            plan = load_plan()
            todo = [x for x in plan if x["date"] == date.today().isoformat() and not x.get("done")]
            if not todo:
                sys.exit("nothing planned for today. Add one: python -m agents.edith plan add YYYY-MM-DD salon Dubai AE")
            for x in todo:
                out = edith.find(x["niche"], x["city"], x["country"], log=say)
                x.update(done=True, kept=len(out["kept"]), spent=round(out["spent"], 2), report=out["report"])
            save_plan(plan)
        elif a.cmd == "rules":
            print(json.dumps({k: v for k, v in edith.rules().items() if k != "not_a_website"}, indent=2))
    except (apify.ApifyError, ValueError) as e:
        sys.exit(str(e))


if __name__ == "__main__":
    main()
