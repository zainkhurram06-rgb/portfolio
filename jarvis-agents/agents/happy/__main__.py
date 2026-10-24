"""
Run HAPPY from the command line.

    python -m agents.happy check glow-lab-nails-dubai     (one website)
    python -m agents.happy check --all                    (everything in Demo built)
    python -m agents.happy rules                          (what he checks)

Passed sites move to Checked. Failed ones stay in Demo built with the problems
on their card and in check.html. Then you look and approve:
    python -m agents.pipeline move glow-lab-nails-dubai approved
"""

import argparse
import sys

from .. import pipeline
from . import happy


def main(argv=None):
    p = argparse.ArgumentParser(prog="happy", description="HAPPY checks every website before you see it")
    sub = p.add_subparsers(dest="cmd", required=True)
    c = sub.add_parser("check")
    c.add_argument("key", nargs="?")
    c.add_argument("--all", action="store_true")
    sub.add_parser("rules")
    a = p.parse_args(argv)
    say = lambda m: print(m, file=sys.stderr)       # noqa: E731
    if a.cmd == "rules":
        for k, v in happy.rules().items():
            extra = f" ({v['min']}+)" if "min" in v else f" (max {v['max']})" if "max" in v else ""
            print(f"{'on ' if v.get('on', True) else 'off'}  {v['level']:5}  {v['what']}{extra}")
        return
    try:
        todo = pipeline.in_stage("demo-built") if a.all else [pipeline.find(a.key)] if a.key else []
        if not todo:
            sys.exit("name a business, or use --all" if not a.all else "nothing waiting in Demo built")
        for b in todo:
            done = happy.check_stage(b, log=say)
            print(f"{done.key} -> {done.stage}   report: {done.file('check.html')}")
    except pipeline.PipelineError as e:
        sys.exit(str(e))


if __name__ == "__main__":
    main()
