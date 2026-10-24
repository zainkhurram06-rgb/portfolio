"""
The pipeline: every business is one folder, and the stage folder it sits in is
its place in the funnel. Arranged like a CRM, but it's just folders and files,
so you can open, read and move everything yourself.

    pipeline/
      1-leads/          EDITH drops new businesses here
      2-researched/     MARK pulled their brand from social media
      3-demo-built/     MARK built their website
      4-checked/        HAPPY passed it against your rules
      5-approved/       you looked at it, ready for FRIDAY
      6-pitched/        FRIDAY called them
      7-qualified/      they're interested
      8-won/  9-lost/
      index.html        the board: every business in its column

    one business folder:
      lead.json         what we know about them
      research/         research.json + their downloaded logo, photos and videos
      site/             their website as a real HTML file, with its media
      build.json        template, live demo link, demo login
      history.md        who did what, when

Run:
    python -m agents.pipeline init
    python -m agents.pipeline add samples/leads/glow-lab-nails.json
    python -m agents.pipeline move glow-lab-nails approved --note "looks great"
    python -m agents.pipeline list
    python -m agents.pipeline board
"""

import argparse
import html
import json
import os
import re
import shutil
import sys
from dataclasses import dataclass
from datetime import datetime
from pathlib import Path
from typing import List, Optional

ROOT = Path(os.environ.get("PIPELINE_DIR", Path(__file__).resolve().parents[1] / "pipeline"))

# folder, name on the board, who moves things into it
STAGES = [
    ("1-leads", "Leads", "EDITH"),
    ("2-researched", "Researched", "MARK"),
    ("3-demo-built", "Demo built", "MARK"),
    ("4-checked", "Checked", "HAPPY"),
    ("5-approved", "Approved", "You"),
    ("6-pitched", "Pitched", "FRIDAY"),
    ("7-qualified", "Qualified", "FRIDAY"),
    ("8-won", "Won", "You"),
    ("9-lost", "Lost", ""),
]
STAGE_DIRS = [s[0] for s in STAGES]


class PipelineError(Exception):
    pass


def slug(text: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")[:60] or "business"


def stage_dir(name: str) -> str:
    """'qualified', '7', '7-qualified' and 'Qualified' all mean 7-qualified."""
    n = name.strip().lower()
    for folder, label, _ in STAGES:
        number, word = folder.split("-", 1)
        if n in (folder, number, word, label.lower(), word.replace("-", " ")):
            return folder
    raise PipelineError(f"no stage called {name}. Stages: {', '.join(STAGE_DIRS)}")


@dataclass
class Business:
    path: Path

    @property
    def key(self) -> str:
        return self.path.name

    @property
    def stage(self) -> str:
        return self.path.parent.name

    def file(self, *parts: str) -> Path:
        return self.path.joinpath(*parts)

    def lead(self) -> dict:
        return json.loads(self.file("lead.json").read_text(encoding="utf-8"))

    def save_lead(self, lead: dict):
        self.file("lead.json").write_text(json.dumps(lead, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")

    def build(self) -> Optional[dict]:
        f = self.file("build.json")
        return json.loads(f.read_text(encoding="utf-8")) if f.exists() else None

    def log(self, by: str, text: str):
        line = f"- {datetime.now():%Y-%m-%d %H:%M} · {by} · {text}\n"
        with self.file("history.md").open("a", encoding="utf-8") as f:
            f.write(line)

    def history(self) -> List[str]:
        f = self.file("history.md")
        if not f.exists():
            return []
        return [l[2:].strip() for l in f.read_text(encoding="utf-8").splitlines() if l.startswith("- ")]


def init():
    for folder in STAGE_DIRS:
        (ROOT / folder).mkdir(parents=True, exist_ok=True)
    board()


def everyone() -> List[Business]:
    out = []
    for folder in STAGE_DIRS:
        d = ROOT / folder
        if d.exists():
            out += [Business(p) for p in sorted(d.iterdir()) if p.is_dir() and (p / "lead.json").exists()]
    return out


def find(key: str) -> Business:
    k = slug(key)
    matches = [b for b in everyone() if b.key == k]
    if not matches:
        raise PipelineError(f"no business called {key} in the pipeline")
    return matches[0]


def in_stage(name: str) -> List[Business]:
    return [b for b in everyone() if b.stage == stage_dir(name)]


def add(lead: dict, by: str = "EDITH", note: str = "new lead") -> Business:
    """A new business goes into 1-leads. Same name and city twice is refused."""
    init()
    if not lead.get("name") or not lead.get("niche"):
        raise PipelineError("a lead needs at least a name and a niche")
    key = slug(f"{lead['name']} {lead.get('city') or ''}")
    if any(b.key == key for b in everyone()):
        raise PipelineError(f"{key} is already in the pipeline")
    b = Business(ROOT / STAGE_DIRS[0] / key)
    b.path.mkdir(parents=True)
    b.save_lead(lead)
    b.log(by, note)
    board()
    return b


def move(key: str, to: str, by: str = "You", note: str = "") -> Business:
    b = find(key)
    dest = ROOT / stage_dir(to) / b.key
    if dest == b.path:
        return b
    dest.parent.mkdir(parents=True, exist_ok=True)
    shutil.move(str(b.path), str(dest))
    b = Business(dest)
    label = next(l for f, l, _ in STAGES if f == b.stage)
    b.log(by, f"moved to {label}" + (f": {note}" if note else ""))
    board()
    return b


def remove(key: str) -> Business:
    """Deletes a business's folder for good. For test data and mistakes."""
    b = find(key)
    shutil.rmtree(b.path)
    board()
    return b


def samples() -> List[Business]:
    return [b for b in everyone() if b.lead().get("sample")]


# ------------------------------------------------------------------ the board

def _rel(p: Path) -> str:
    return p.relative_to(ROOT).as_posix()


def _card(b: Business) -> str:
    lead = b.lead()
    build = b.build() or {}
    logo = next(iter(sorted(b.file("research", "media").glob("logo.*"))), None) if b.file("research", "media").exists() else None
    links = [f'<a href="{_rel(b.file("lead.json"))}">lead</a>']
    if b.file("research", "research.json").exists():
        n = len(list(b.file("research", "media").glob("*"))) if b.file("research", "media").exists() else 0
        links.append(f'<a href="{_rel(b.file("research"))}/">research ({n} files)</a>')
    if b.file("site", "index.html").exists():
        links.insert(0, f'<a class="main" href="{_rel(b.file("site", "index.html"))}">open website</a>')
    if build.get("site"):
        links.append(f'<a href="{html.escape(build["site"])}">live demo</a>')
    links.append(f'<a href="{_rel(b.file("history.md"))}">history</a>')
    last = b.history()[-1] if b.history() else ""
    socials = " ".join(f'<span>{k}</span>' for k in ("instagram", "facebook", "tiktok", "google_maps_url") if lead.get(k))
    if lead.get("sample"):
        socials += ' <span class="sample">sample</span>'
    return f"""
      <article>
        <div class="who">{f'<img src="{_rel(logo)}" alt="">' if logo else f'<i>{html.escape(lead["name"][:1])}</i>'}
          <div><b>{html.escape(lead["name"])}</b><small>{html.escape(lead.get("niche", ""))} · {html.escape(lead.get("city") or lead.get("country", ""))}</small></div></div>
        {f'<p class="tpl">template: {html.escape(build["template_label"])}</p>' if build.get("template_label") else ""}
        {f'<p class="tpl" title="{html.escape("; ".join(lead["edith"].get("why", [])))}">EDITH score {lead["edith"]["score"]}: {html.escape("; ".join(lead["edith"].get("why", [])))}</p>' if (lead.get("edith") or {}).get("score") is not None else ""}
        <p class="socials">{socials.replace("google_maps_url", "google")}</p>
        <nav>{" ".join(links)}</nav>
        <p class="last">{html.escape(last)}</p>
      </article>"""


def _reports() -> str:
    folder = ROOT / "edith-reports"
    files = sorted(folder.glob("*.html"), reverse=True)[:6] if folder.exists() else []
    return ("<p>EDITH's reports: " + " · ".join(f'<a href="{_rel(f)}">{html.escape(f.stem)}</a>' for f in files) + "</p>") if files else ""


def board() -> Path:
    ROOT.mkdir(parents=True, exist_ok=True)
    people = everyone()
    cols = []
    for folder, label, who in STAGES:
        # best EDITH score first, so the strongest leads are at the top
        mine = sorted((b for b in people if b.stage == folder), key=lambda b: -((b.lead().get("edith") or {}).get("score") or 0))
        cols.append(f"""
    <section>
      <h2>{label} <span>{len(mine)}</span></h2>
      <p class="who-moves">{f"moved here by {who}" if who else ""}</p>
      {"".join(_card(b) for b in mine) or '<p class="empty">nothing here</p>'}
    </section>""")
    page = f"""<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Pipeline</title>
<style>
* {{ box-sizing: border-box; margin: 0; padding: 0; }}
body {{ font: 14px/1.45 system-ui, -apple-system, "Segoe UI", sans-serif; color: #1c1917; background: #f1efeb; }}
header {{ padding: 18px 20px 6px; display: flex; gap: 16px; align-items: baseline; flex-wrap: wrap; }}
header h1 {{ font-size: 1.4rem; }}
header p {{ color: #78716c; }}
.board {{ display: grid; grid-auto-flow: column; grid-auto-columns: minmax(250px, 1fr); gap: 12px; padding: 14px 20px 40px; overflow-x: auto; min-height: 80vh; }}
section {{ background: #e7e4df; border-radius: 14px; padding: 12px; align-self: start; }}
h2 {{ font-size: .95rem; display: flex; justify-content: space-between; }}
h2 span {{ background: #fff; border-radius: 999px; padding: 0 9px; font-size: .8rem; }}
.who-moves {{ color: #78716c; font-size: .78rem; margin-bottom: 10px; min-height: 1em; }}
.empty {{ color: #a8a29e; font-size: .85rem; padding: 8px 2px; }}
article {{ background: #fff; border-radius: 12px; padding: 12px; margin-bottom: 10px; box-shadow: 0 1px 0 rgba(0,0,0,.06); display: grid; gap: 8px; }}
.who {{ display: flex; gap: 10px; align-items: center; }}
.who img, .who i {{ width: 38px; height: 38px; border-radius: 50%; object-fit: cover; flex: none; background: #1c1917; color: #fff; display: grid; place-items: center; font-style: normal; font-weight: 700; }}
.who b {{ display: block; }}
.who small {{ color: #78716c; }}
.tpl {{ font-size: .82rem; color: #57534e; }}
.socials {{ display: flex; gap: 5px; flex-wrap: wrap; }}
.socials span {{ font-size: .72rem; background: #f1efeb; border-radius: 999px; padding: 2px 8px; }}
.socials .sample {{ background: #fef3c7; }}
nav {{ display: flex; flex-wrap: wrap; gap: 6px 10px; font-size: .84rem; }}
nav a {{ color: #1d4ed8; text-decoration: none; }}
nav a.main {{ font-weight: 700; }}
.last {{ font-size: .76rem; color: #78716c; border-top: 1px solid #f1efeb; padding-top: 6px; }}
</style></head><body>
<header><h1>Pipeline</h1><p>{len(people)} businesses · updated {datetime.now():%d %b %Y, %H:%M} · each card is a folder in {html.escape(str(ROOT))}</p>{_reports()}</header>
<main class="board">{"".join(cols)}
</main>
</body></html>
"""
    out = ROOT / "index.html"
    out.write_text(page, encoding="utf-8")
    return out


# ------------------------------------------------------------------ command line

def main(argv=None):
    p = argparse.ArgumentParser(prog="pipeline", description="the business pipeline")
    sub = p.add_subparsers(dest="cmd", required=True)
    sub.add_parser("init", help="create the stage folders and the board")
    a = sub.add_parser("add", help="add a lead from a JSON file")
    a.add_argument("lead")
    a.add_argument("--by", default="You")
    m = sub.add_parser("move", help="move a business to another stage")
    m.add_argument("key")
    m.add_argument("stage")
    m.add_argument("--note", default="")
    m.add_argument("--by", default="You")
    r = sub.add_parser("remove", help="delete a business's folder, or every sample with --samples")
    r.add_argument("key", nargs="?")
    r.add_argument("--samples", action="store_true")
    sub.add_parser("list", help="every business and its stage")
    sub.add_parser("board", help="redraw pipeline/index.html")
    args = p.parse_args(argv)
    try:
        if args.cmd == "init":
            init()
            print(f"pipeline ready: {ROOT}")
        elif args.cmd == "add":
            b = add(json.loads(Path(args.lead).read_text(encoding="utf-8")), by=args.by)
            print(f"added {b.key} to {b.stage}")
        elif args.cmd == "move":
            b = move(args.key, args.stage, by=args.by, note=args.note)
            print(f"{b.key} is now in {b.stage}")
        elif args.cmd == "remove":
            gone = samples() if args.samples else [find(args.key)] if args.key else []
            for b in gone:
                remove(b.key)
                print(f"removed {b.key}")
            if not gone:
                print("nothing to remove")
        elif args.cmd == "list":
            for b in everyone():
                print(f"{b.stage:14} {b.key}")
        elif args.cmd == "board":
            print(board())
    except PipelineError as e:
        sys.exit(str(e))


if __name__ == "__main__":
    main()
