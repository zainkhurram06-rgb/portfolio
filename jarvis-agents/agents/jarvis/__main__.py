"""
Run JARVIS from the command line.

    python -m agents.jarvis status     (where we stand against the sales target)
    python -m agents.jarvis run        (the whole team, in order, then the morning report)
    python -m agents.jarvis report     (just rewrite pipeline/jarvis.html)

Targets and the funnel rates are in agents/jarvis/targets.json.
"""

import argparse
import sys

from . import jarvis


def main(argv=None):
    p = argparse.ArgumentParser(prog="jarvis", description="JARVIS runs the team and reports to Zain")
    sub = p.add_subparsers(dest="cmd", required=True)
    sub.add_parser("status")
    sub.add_parser("run")
    sub.add_parser("report")
    a = p.parse_args(argv)
    say = lambda m: print(m, file=sys.stderr)       # noqa: E731
    if a.cmd == "status":
        print(jarvis.summary(jarvis.status()))
    elif a.cmd == "run":
        jarvis.run(log=say)
        print(jarvis.summary(jarvis.status()))
        print(f"Report: {jarvis.report()}")
    elif a.cmd == "report":
        print(jarvis.report())


if __name__ == "__main__":
    main()
