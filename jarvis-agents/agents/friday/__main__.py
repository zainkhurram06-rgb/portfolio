"""
Run FRIDAY from the command line.

    python -m agents.friday setup                      (create or update her on ElevenLabs from pitch.md)
    python -m agents.friday call glow-lab-nails-dubai  (one approved business)
    python -m agents.friday call --all                 (every approved business she's allowed to call now)
    python -m agents.friday collect --all              (fetch call results, move businesses on)
    python -m agents.friday dnc +971501234567          (never call this number)
    python -m agents.friday check glow-lab-nails-dubai (would she call them right now, and if not, why)

Without FRIDAY_VOICE=live she plays back sample calls: free, no phone line.
Until FRIDAY_LIVE=yes, every call goes to FRIDAY_TEST_NUMBER (your phone).
"""

import argparse
import os
import sys
from datetime import datetime, timezone

from .. import pipeline
from . import friday, guard, voice as voices


def main(argv=None):
    p = argparse.ArgumentParser(prog="friday", description="FRIDAY calls approved businesses about their demo")
    sub = p.add_subparsers(dest="cmd", required=True)
    sub.add_parser("setup")
    c = sub.add_parser("call")
    c.add_argument("key", nargs="?")
    c.add_argument("--all", action="store_true")
    c.add_argument("--any-time", action="store_true", help="sample mode only: ignore calling hours")
    co = sub.add_parser("collect")
    co.add_argument("key", nargs="?")
    co.add_argument("--all", action="store_true")
    d = sub.add_parser("dnc")
    d.add_argument("number")
    k = sub.add_parser("check")
    k.add_argument("key")
    a = p.parse_args(argv)
    say = lambda m: print(m, file=sys.stderr)       # noqa: E731
    sample = os.environ.get("FRIDAY_VOICE", "sample") != "live"
    if sample:
        os.environ.setdefault("FRIDAY_TEST_NUMBER", "+12025550100")
        say("FRIDAY: sample mode, no real calls (set FRIDAY_VOICE=live for ElevenLabs)")

    try:
        if a.cmd == "setup":
            agent = voices.client().setup(friday.prompt(), friday.FIRST_MESSAGE)
            print(f"FRIDAY is ready on ElevenLabs: agent {agent}")
        elif a.cmd == "dnc":
            guard.add_dnc(a.number, "added by you")
            print(f"{a.number} will never be called")
        elif a.cmd == "check":
            b = pipeline.find(a.key)
            past = [x for x in friday.calls(b) if not x.get("test")]
            now = datetime.now(timezone.utc)
            dec = guard.can_call(b.lead(), past, friday.everyone_called_today(now), now)
            print(("yes: " if dec.ok else "no: ") + dec.reason)
        elif a.cmd == "call":
            if a.any_time and not sample:
                sys.exit("--any-time only works in sample mode. Real calls always respect calling hours")
            todo = pipeline.in_stage("approved") if a.all else [pipeline.find(a.key)] if a.key else []
            if not todo:
                sys.exit("nothing approved to call" if a.all else "name a business, or use --all")
            r = guard.rules()
            if sample and not r.get("company_name"):
                r = {**r, "company_name": "your company"}       # stand-in until you set yours in rules.json
            if a.any_time:
                r = {**r, "calling_days": [1, 2, 3, 4, 5, 6, 7], "calling_hours": [["00:00", "24:00"]]}
            v = voices.client()
            for b in todo:
                friday.call(b, voice=v, log=say, r=r)
            if sample:
                for b in todo:
                    friday.collect(pipeline.find(b.key), voice=v, log=say, move_test_calls=True)
        elif a.cmd == "collect":
            todo = pipeline.everyone() if a.all else [pipeline.find(a.key)] if a.key else []
            v = voices.client()
            for b in todo:
                if any(x["status"] == "pending" for x in friday.calls(b)):
                    friday.collect(b, voice=v, log=say, move_test_calls=sample)
        print(f"board: {pipeline.ROOT / 'index.html'}")
    except (pipeline.PipelineError, voices.VoiceError) as e:
        sys.exit(str(e))


if __name__ == "__main__":
    main()
