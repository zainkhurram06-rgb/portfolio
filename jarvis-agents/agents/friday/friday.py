"""
FRIDAY, the sales caller. Calls businesses you approved and tells them about
the free demo MARK built them. Her brief is pitch.md, her limits are guard.py.

    5-approved  --call-->  (waiting for the result)
                --interested-->        7-qualified
                --call back later-->   6-pitched
                --not interested-->    9-lost
                --don't call me-->     9-lost, and on the do-not-call list
                --no answer-->         stays in Approved; after max attempts, 9-lost

Every call is kept in the business folder: calls/calls.json and calls/index.html
(summary and transcript). Test calls go to your own phone and never move anything.
"""

import html
import json
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import List, Optional

from .. import pipeline
from ..persona import persona, section, training
from ..pipeline import Business
from . import guard, voice as voices

PITCH = Path(__file__).resolve().parent / "pitch.md"
FIRST_MESSAGE = ("Hi, this is FRIDAY, an AI assistant calling from {{company}}. "
                 "Am I speaking with the owner or manager of {{business_name}}?")
TRADE_WORDS = {"salon": "beauty salon", "carwash": "car wash", "autorepair": "garage", "homeservices": "home services business",
               "dental": "dental clinic", "medical": "medical clinic", "dermatology": "skin clinic"}


PERSONA_PARTS = ("Who you are", "How you sound", "The shape of every call", "Reaching the owner",
                 "Handling what owners say", "Buying signals to listen for", "You never")
PLAYBOOK_LIMIT = 9000                          # characters of Cowork research that fit in her prompt


def playbook() -> str:
    """What Cowork learned from real cold calls (training/friday/), in a form she can use."""
    parts = []
    tech = training("friday", "techniques") or []
    if tech:
        parts.append("Techniques that work:\n" + "\n".join(
            f"- {t.get('name')}: {t.get('how_friday_uses_it') or t.get('what')} For example: \"{t.get('example_line')}\""
            for t in tech if t.get("name")))
    objections = training("friday", "objections") or []
    if objections:
        parts.append("More answers to what owners say (trade in brackets when it only fits one trade):\n" + "\n".join(
            f"- \"{o.get('objection')}\"{'' if o.get('trade') in (None, 'any') else ' [' + o['trade'] + ']'}: {o.get('response')}"
            for o in objections if o.get("objection") and o.get("response")))
    pains = training("friday", "trade-pains") or []
    if pains:
        parts.append("What owners in each trade struggle with:\n" + "\n".join(
            f"- [{p.get('trade')}] {p.get('pain')} {p.get('how_a_website_helps')}" for p in pains if p.get("pain")))
    avoid = training("friday", "do-not") or []
    if avoid:
        parts.append("Tactics you never use:\n" + "\n".join(f"- {d.get('tactic')}: {d.get('why_not')}" for d in avoid if d.get("tactic")))
    text = "\n\n".join(parts)
    return text[:PLAYBOOK_LIMIT].rsplit("\n", 1)[0] if len(text) > PLAYBOOK_LIMIT else text


def prompt() -> str:
    """Her whole ElevenLabs prompt: the call brief (pitch.md), her personality and
    playbook (persona.md), and Cowork's research if there is any."""
    text = PITCH.read_text(encoding="utf-8")
    start = text.find("You are FRIDAY")
    out = [text[start:] if start >= 0 else text]
    me = persona("friday")
    for title in PERSONA_PARTS:
        body = section(me, title)
        if body:
            out.append(f"## {title}\n\n{body}")
    extra = playbook()
    if extra:
        out.append(f"## Your playbook from real calls\n\n{extra}")
    return "\n\n".join(out).strip() + "\n"


def follow_up_day(now: datetime, working_days: int = 2) -> str:
    d = now
    while working_days:
        d = d + timedelta(days=1)
        if d.weekday() < 5:
            working_days -= 1
    return d.strftime("%A")


def calls(b: Business) -> List[dict]:
    f = b.file("calls", "calls.json")
    return json.loads(f.read_text(encoding="utf-8")) if f.exists() else []


def _save(b: Business, items: List[dict]):
    b.file("calls").mkdir(exist_ok=True)
    b.file("calls", "calls.json").write_text(json.dumps(items, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    b.file("calls", "index.html").write_text(_page(b, items), encoding="utf-8")


def variables(b: Business, r: dict) -> dict:
    lead, build = b.lead(), b.build() or {}
    social = " and ".join(n for n, k in (("Instagram", "instagram"), ("Facebook", "facebook"), ("TikTok", "tiktok")) if lead.get(k)) or "social media"
    return {
        "business_key": b.key, "business_name": lead["name"], "trade": TRADE_WORDS.get(lead.get("niche"), "business"),
        "city": lead.get("city") or "", "company": r["company_name"], "price": r.get("price_text") or "",
        "language": lead.get("language") or "English", "review_count": str(lead.get("review_count") or "lots of"),
        "rating": str(lead.get("rating") or ""), "social": social,
        "demo_link": build.get("subdomain") or build.get("site") or "",
        "day": follow_up_day(datetime.now(timezone.utc)),
    }


def everyone_called_today(now: datetime) -> int:
    return sum(guard.calls_today([c for c in calls(b) if not c.get("test")], now) for b in pipeline.everyone())


def call(b: Business, voice=None, now: Optional[datetime] = None, log=print, r: Optional[dict] = None) -> Optional[dict]:
    """Places one call if every guardrail allows it. Returns the call record, or None."""
    r = r or guard.rules()
    now = now or datetime.now(timezone.utc)
    if b.stage != "5-approved":
        raise pipeline.PipelineError(f"{b.key} is in {b.stage}. FRIDAY only calls businesses you approved")
    if not r.get("company_name"):
        raise pipeline.PipelineError("set company_name in agents/friday/rules.json first, FRIDAY has to say who she's calling for")
    if not (b.build() or {}).get("site"):
        raise pipeline.PipelineError(f"{b.key} has no live demo link to send them")
    past = [c for c in calls(b) if not c.get("test")]
    d = guard.can_call(b.lead(), past, everyone_called_today(now), now, r)
    if not d.ok:
        log(f"FRIDAY: not calling {b.key}: {d.reason}")
        b.log("FRIDAY", f"didn't call: {d.reason}")
        return None
    voice = voice or voices.client()
    cid = voice.call(d.to, variables(b, r))
    record = {"placed": now.isoformat(timespec="seconds"), "to": d.to, "number": d.number, "test": not guard.live(),
              "conversation_id": cid, "status": "pending"}
    _save(b, calls(b) + [record])
    b.log("FRIDAY", f"called {'your phone (test)' if record['test'] else d.number}")
    log(f"FRIDAY: {d.reason if record['test'] else 'calling ' + d.number} for {b.key}")
    pipeline.board()
    return record


def collect(b: Business, voice=None, log=print, move_test_calls: bool = False) -> List[dict]:
    """Fetches the results of calls still waiting, and moves the business on."""
    voice = voice or voices.client()
    items = calls(b)
    done = []
    for c in items:
        if c["status"] != "pending":
            continue
        res = voice.result(c["conversation_id"])
        if res is None:
            continue
        c.update(status="done", result=res)
        done.append(c)
    if not done:
        return []
    _save(b, items)
    for c in done:
        outcome = (c["result"].get("data") or {}).get("outcome") or "unknown"
        summary = c["result"].get("summary") or ""
        b.log("FRIDAY", f"call result: {outcome.replace('_', ' ')}. {summary}"[:300])
        log(f"FRIDAY: {b.key}: {outcome}")
        if c.get("test") and not move_test_calls:
            log("FRIDAY: that was a test call to your phone, so the business stays where it is")
            continue
        b = _move(b, c, outcome)
    pipeline.board()
    return done


def _move(b: Business, c: dict, outcome: str) -> Business:
    data = c["result"].get("data") or {}
    if outcome == "interested":
        note = "interested" + (f", send the link to {data['send_link_to']}" if data.get("send_link_to") else "")
        return pipeline.move(b.key, "qualified", by="FRIDAY", note=note)
    if outcome == "call_back":
        return pipeline.move(b.key, "pitched", by="FRIDAY", note=f"call back {data.get('callback_time') or 'later'}")
    if outcome == "not_interested":
        return pipeline.move(b.key, "lost", by="FRIDAY", note=f"not interested{': ' + data['objection'] if data.get('objection') else ''}")
    if outcome == "do_not_call":
        guard.add_dnc(c["number"], b.key)
        return pipeline.move(b.key, "lost", by="FRIDAY", note="asked not to be called again, added to the do-not-call list")
    attempts = len([x for x in calls(b) if not x.get("test")])
    if attempts >= guard.rules()["max_attempts"]:
        return pipeline.move(b.key, "lost", by="FRIDAY", note=f"couldn't reach them after {attempts} calls")
    return b


# ---------------------------------------------------------------- the calls page

def _page(b: Business, items: List[dict]) -> str:
    lead = b.lead()
    blocks = []
    for c in reversed(items):
        res = c.get("result") or {}
        data = res.get("data") or {}
        lines = "".join(f'<p class="{html.escape(t.get("who") or "")}"><b>{"FRIDAY" if t.get("who") == "agent" else "Them"}:</b> {html.escape(t.get("said") or "")}</p>'
                        for t in res.get("transcript") or [])
        facts = "".join(f"<li>{html.escape(k.replace('_', ' '))}: {html.escape(str(v))}</li>" for k, v in data.items() if v not in (None, ""))
        blocks.append(f"""
  <article>
    <h2>{html.escape(c['placed'].replace('T', ' ')[:16])} · {"test call to your phone" if c.get("test") else html.escape(c.get("number") or "")}
      · <span class="o">{html.escape((data.get("outcome") or c["status"]).replace("_", " "))}</span></h2>
    {f"<p>{html.escape(res.get('summary') or '')}</p>" if res.get("summary") else "<p>Waiting for the result.</p>"}
    {f"<ul>{facts}</ul>" if facts else ""}
    {f'<details><summary>Transcript</summary>{lines}</details>' if lines else ""}
  </article>""")
    return f"""<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>FRIDAY's calls: {html.escape(lead['name'])}</title>
<style>
body {{ font: 15px/1.55 system-ui, -apple-system, "Segoe UI", sans-serif; color: #1c1917; background: #f6f4f1; margin: 0; padding: 24px; max-width: 860px; }}
article {{ background: #fff; border-radius: 14px; padding: 18px 20px; margin: 14px 0; }}
h2 {{ font-size: 1rem; }} .o {{ color: #1d4ed8; }}
details p {{ margin: 6px 0; }} details p.agent b {{ color: #7c3aed; }}
summary {{ cursor: pointer; color: #1d4ed8; }}
</style></head><body>
<h1>FRIDAY's calls to {html.escape(lead['name'])}</h1>
<p><a href="../site/index.html">their demo website</a> · <a href="../history.md">history</a></p>
{"".join(blocks)}
</body></html>
"""
