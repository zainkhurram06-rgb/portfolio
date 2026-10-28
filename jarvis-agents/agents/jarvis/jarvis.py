"""
JARVIS, the manager. Runs the team in order and tells Zain where things stand
against the sales target.

    run()      EDITH finds, MARK researches and builds, HAPPY checks, FRIDAY collects
               yesterday's call results and calls the businesses Zain approved.
               One step failing doesn't stop the rest; every step is in the report.
    status()   the numbers: what each stage did in the last 7 days, what each stage
               needs per day to hit the target (worked backwards from sales), what's
               waiting for Zain, and the bottleneck.
    report()   pipeline/jarvis.html, the morning report.
"""

import html
import json
import os
import re
import subprocess
import sys
from datetime import date, datetime, timedelta
from pathlib import Path
from typing import Dict, List, Optional

from .. import pipeline

HERE = Path(__file__).resolve().parent
TARGETS = HERE / "targets.json"
ROOT = HERE.parents[1]

# stage label in history.md -> the funnel step it counts as
MOVES = {"Researched": "researched", "Demo built": "demos", "Checked": "passed", "Approved": "approved",
         "Pitched": "reached", "Qualified": "interested", "Won": "won", "Lost": "lost"}
LINE = re.compile(r"^(\d{4}-\d{2}-\d{2}) \d{2}:\d{2} · (\w+) · (.*)$")

STEPS = [
    ("EDITH finds leads", ["-m", "agents.edith", "today"]),
    ("MARK researches and builds", ["-m", "agents.mark", "work"]),
    ("HAPPY checks the demos", ["-m", "agents.happy", "check", "--all"]),
    ("FRIDAY collects call results", ["-m", "agents.friday", "collect", "--all"]),
    ("FRIDAY calls approved businesses", ["-m", "agents.friday", "call", "--all"]),
]


def targets() -> dict:
    return json.loads(TARGETS.read_text(encoding="utf-8"))


# ---------------------------------------------------------------- what happened

def events(since: date) -> Dict[str, int]:
    """Counts of each funnel step since a date, read from every business's history."""
    out = {k: 0 for k in ("leads", "researched", "demos", "passed", "approved", "calls", "reached", "interested", "won", "lost")}
    for b in pipeline.everyone():
        if b.lead().get("sample"):                       # test data never counts
            continue
        lines = b.history()
        for i, line in enumerate(lines):
            m = LINE.match(line)
            if not m or date.fromisoformat(m.group(1)) < since:
                continue
            who, text = m.group(2), m.group(3)
            if i == 0:
                out["leads"] += 1
            if text.startswith("moved to "):
                label = text[len("moved to "):].split(":")[0]
                if label in MOVES:
                    out[MOVES[label]] += 1
            elif who == "FRIDAY" and text.startswith("called") and "(test)" not in text:
                out["calls"] += 1
    return out


def rates(t: dict) -> Dict[str, float]:
    """The guessed rates from targets.json, replaced by real ones once there's enough data."""
    r = dict(t["rates"])
    all_time = events(date(2000, 1, 1))
    real = {"lead_to_demo": ("leads", "demos"), "demo_to_passed": ("demos", "passed"), "passed_to_approved": ("passed", "approved"),
            "reached_to_interested": ("reached", "interested"), "interested_to_won": ("interested", "won")}
    for k, (a, b) in real.items():
        if all_time[a] >= 20:
            r[k] = round(min(1.0, all_time[b] / all_time[a]), 3) or r[k]
    return r


def sales_per_day(t: dict, today: date) -> float:
    if today >= date.fromisoformat(t["sales_per_day_from"]):
        return float(t["sales_per_day"])
    return float(t["sales_per_week"]) / 5                 # five working days


def needed(t: dict, today: date) -> Dict[str, float]:
    """Per working day, what each stage has to produce to hit the sales target."""
    r = rates(t)
    won = sales_per_day(t, today)
    interested = won / r["interested_to_won"]
    reached = interested / r["reached_to_interested"]
    calls = reached / r["approved_to_reached"]
    approved = calls                                        # each approved business gets called
    passed = approved / r["passed_to_approved"]
    demos = passed / r["demo_to_passed"]
    leads = demos / r["lead_to_demo"]
    return {k: round(v, 1) for k, v in dict(leads=leads, demos=demos, passed=passed, approved=approved, calls=calls,
                                             reached=reached, interested=interested, won=won).items()}


def limits() -> Dict[str, int]:
    """The daily caps that keep accounts safe. They set the most the machine can do."""
    edith = json.loads((ROOT / "agents" / "edith" / "rules.json").read_text(encoding="utf-8"))
    friday = json.loads((ROOT / "agents" / "friday" / "rules.json").read_text(encoding="utf-8"))
    return {"leads": int(edith["max_profile_checks_per_day"]), "demos": int(os.environ.get("RESEARCH_DAILY_CAP", "25")),
            "calls": int(friday["calls_per_day"])}


def status(today: Optional[date] = None) -> dict:
    t = targets()
    today = today or date.today()
    week = events(today - timedelta(days=6))
    per_day = {k: round(v / 5, 1) for k, v in week.items()}  # 7 days, 5 of them working days
    need = needed(t, today)
    caps = limits()
    real = lambda stage: len([b for b in pipeline.in_stage(stage) if not b.lead().get("sample")])  # noqa: E731
    waiting = {"to approve": real("checked"), "interested, follow up": real("qualified"), "failed HAPPY's check": real("demo-built")}
    gaps = []
    for k in ("leads", "demos", "calls"):
        if caps[k] < need[k]:
            gaps.append((need[k] / max(caps[k], 1), f"the daily cap on {k} is {caps[k]}, the target needs about {need[k]:g} a day"))
    for k in ("leads", "demos", "approved", "calls", "interested"):
        if need[k] and per_day[k] < need[k]:
            gaps.append((need[k] / max(per_day[k], 0.1), f"{k}: about {per_day[k]:g} a day last week, the target needs {need[k]:g}"))
    if waiting["to approve"]:
        # nothing gets called until Zain approves it, so this comes first
        gaps.append((1000 + waiting["to approve"], f"{waiting['to approve']} demos are waiting for your approval"))
    gaps.sort(reverse=True)
    sold = week["won"]
    goal = round(sales_per_day(t, today) * 5)
    return {"today": today.isoformat(), "week": week, "per_day": per_day, "needed": need, "limits": caps, "waiting": waiting,
            "sold_this_week": sold, "goal_this_week": goal, "on_track": sold >= goal,
            "revenue_this_week": sold * t["price_per_site"], "currency": t["currency"],
            "bottleneck": gaps[0][1] if gaps else None, "rates": rates(t)}


# ---------------------------------------------------------------- doing the work

def run(log=print, runner=subprocess.run) -> List[dict]:
    done = []
    for name, args in STEPS:
        log(f"JARVIS: {name}")
        try:
            r = runner([sys.executable, *args], cwd=str(ROOT), capture_output=True, text=True, encoding="utf-8", timeout=6 * 3600)
            out = ((r.stdout or "") + (r.stderr or "")).strip()
            done.append({"step": name, "ok": r.returncode == 0, "said": out[-1500:]})
        except subprocess.TimeoutExpired:
            done.append({"step": name, "ok": False, "said": "took longer than 6 hours and was stopped"})
        log(f"JARVIS: {name}: {'done' if done[-1]['ok'] else 'had a problem'}")
    f = pipeline.ROOT / "jarvis-runs.json"
    f.parent.mkdir(parents=True, exist_ok=True)
    past = json.loads(f.read_text(encoding="utf-8")) if f.exists() else []
    f.write_text(json.dumps((past + [{"at": datetime.now().isoformat(timespec="seconds"), "steps": done}])[-30:], indent=1,
                            ensure_ascii=False) + "\n", encoding="utf-8")
    report()
    return done


# ---------------------------------------------------------------- the morning report

def summary(s: dict) -> str:
    lines = [f"This week: {s['sold_this_week']} sold of {s['goal_this_week']} "
             f"({s['currency']} {s['revenue_this_week']}). {'On track.' if s['on_track'] else 'Behind.'}"]
    w = s["week"]
    lines.append(f"Last 7 days: {w['leads']} leads, {w['demos']} demos, {w['passed']} passed, {w['approved']} approved, "
                 f"{w['calls']} calls, {w['reached']} owners reached, {w['interested']} interested, {w['won']} won.")
    waiting = [f"{n} {k}" for k, n in s["waiting"].items() if n]
    if waiting:
        lines.append("Waiting for you: " + ", ".join(waiting) + ".")
    if s["bottleneck"]:
        lines.append(f"Bottleneck: {s['bottleneck']}.")
    return "\n".join(lines)


def report(today: Optional[date] = None) -> Path:
    s = status(today)
    runs_file = pipeline.ROOT / "jarvis-runs.json"
    last = (json.loads(runs_file.read_text(encoding="utf-8")) or [None])[-1] if runs_file.exists() else None
    rows = "".join(f"<tr><td>{k}</td><td>{s['week'].get(k, 0)}</td><td>{s['per_day'].get(k, 0):g}</td><td>{v:g}</td>"
                   f"<td>{s['limits'].get(k, '')}</td></tr>" for k, v in s["needed"].items())
    steps = "".join(f"<li class=\"{'ok' if x['ok'] else 'bad'}\"><b>{html.escape(x['step'])}</b>"
                    f"<pre>{html.escape(x['said'][-600:])}</pre></li>" for x in (last or {}).get("steps", []))
    page = f"""<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>JARVIS morning report</title>
<style>
body {{ font: 15px/1.55 system-ui, -apple-system, "Segoe UI", sans-serif; color: #16181c; background: #f4f5f7; margin: 0; padding: 28px; }}
main {{ max-width: 960px; margin: 0 auto; display: grid; gap: 18px; }}
section {{ background: #fff; border: 1px solid #e3e5e8; border-radius: 14px; padding: 20px 22px; }}
h1 {{ margin: 0; }} h2 {{ font-size: 1.05rem; margin: 0 0 10px; }}
.big {{ font-size: 2.4rem; font-weight: 700; }} .ok {{ color: #1f7a4d; }} .bad {{ color: #b42318; }}
.say {{ white-space: pre-line; font-size: 1.05rem; }}
table {{ width: 100%; border-collapse: collapse; }} th, td {{ text-align: start; padding: 7px 8px; border-bottom: 1px solid #eee; }}
th {{ font-size: .8rem; color: #646a73; text-transform: uppercase; letter-spacing: .06em; }}
pre {{ white-space: pre-wrap; font-size: .8rem; color: #555; background: #f7f7f8; padding: 8px; border-radius: 8px; }}
ul {{ padding-inline-start: 18px; }}
</style></head><body><main>
<h1>JARVIS, {html.escape(s['today'])}</h1>
<section><div class="big {'ok' if s['on_track'] else 'bad'}">{s['sold_this_week']} / {s['goal_this_week']} sold this week</div>
<p class="say">{html.escape(summary(s))}</p></section>
<section><h2>The funnel, against the target</h2>
<table><tr><th>Step</th><th>Last 7 days</th><th>Per working day</th><th>Needed per day</th><th>Daily cap</th></tr>{rows}</table>
<p style="color:#646a73;font-size:.9rem">Needed is worked backwards from the sales target with these rates: {html.escape(json.dumps(s['rates']))}.
Guesses until there's real data, then measured.</p></section>
<section><h2>Last run</h2>{f"<ul>{steps}</ul>" if steps else "<p>No run yet: python -m agents.jarvis run</p>"}</section>
</main></body></html>
"""
    out = pipeline.ROOT / "jarvis.html"
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(page, encoding="utf-8")
    return out
