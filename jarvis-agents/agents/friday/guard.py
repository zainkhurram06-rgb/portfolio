"""
FRIDAY's guardrails. Every call has to pass all of these, in code, before the
phone line is touched. Any one failing means no call, and the reason is logged.

    test mode       until FRIDAY_LIVE=yes, every call goes to FRIDAY_TEST_NUMBER
    country         the business's country has to be switched on in rules.json
    number          a real number, and a mobile only if that country allows it
    do not call     not on our do-not-call list
    hours           inside calling days and hours in the business's own timezone
                    (real calls only: test calls ring your phone, any time)
    attempts        no more than max_attempts, with days between them
    daily cap       no more than calls_per_day in one day
"""

import json
import os
from dataclasses import dataclass
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import List, Optional
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError

import phonenumbers
from phonenumbers import PhoneNumberType, timezone as ptz

from .. import pipeline

RULES_FILE = Path(__file__).resolve().parent / "rules.json"
MOBILE_TYPES = {PhoneNumberType.MOBILE, PhoneNumberType.FIXED_LINE_OR_MOBILE, PhoneNumberType.PAGER}


def rules() -> dict:
    return {k: v for k, v in json.loads(RULES_FILE.read_text(encoding="utf-8")).items() if not k.startswith("_")}


def dnc_file() -> Path:
    return pipeline.ROOT / "do-not-call.txt"


def dnc_numbers() -> set:
    f = dnc_file()
    return {line.split("#")[0].strip() for line in f.read_text(encoding="utf-8").splitlines() if line.strip()} if f.exists() else set()


def add_dnc(number: str, why: str):
    f = dnc_file()
    f.parent.mkdir(parents=True, exist_ok=True)
    with f.open("a", encoding="utf-8") as out:
        out.write(f"{number}  # {why}, {datetime.now():%Y-%m-%d}\n")


def live() -> bool:
    return os.environ.get("FRIDAY_LIVE", "").lower() == "yes"


@dataclass
class Decision:
    ok: bool
    reason: str
    to: Optional[str] = None          # who actually gets called (your phone in test mode)
    number: Optional[str] = None      # the business's number, E.164
    tz: Optional[str] = None


def _e164(raw: Optional[str], country: str) -> Optional[phonenumbers.PhoneNumber]:
    try:
        n = phonenumbers.parse(raw or "", country)
    except phonenumbers.NumberParseException:
        return None
    return n if phonenumbers.is_valid_number(n) else None


def _in_hours(now_local: datetime, r: dict) -> bool:
    if now_local.isoweekday() not in r["calling_days"]:
        return False
    hm = now_local.strftime("%H:%M")
    return any(start <= hm < end for start, end in r["calling_hours"])


def calls_today(calls: List[dict], now: datetime) -> int:
    return sum(1 for c in calls if c.get("placed", "")[:10] == now.date().isoformat())


def can_call(lead: dict, past_calls: List[dict], all_calls_today: int, now: Optional[datetime] = None, r: Optional[dict] = None) -> Decision:
    r = r or rules()
    now = now or datetime.now(timezone.utc)
    test_number = os.environ.get("FRIDAY_TEST_NUMBER", "")
    if not live() and not test_number:
        return Decision(False, "test mode is on and FRIDAY_TEST_NUMBER isn't set (set it to your own phone)")

    country = (lead.get("country") or "").upper()
    rule = r["countries"].get(country, {"on": False})
    if live() and not rule.get("on"):
        return Decision(False, f"calling businesses in {country or 'this country'} is switched off in rules.json")

    n = _e164(lead.get("phone"), country)
    if not n:
        return Decision(False, f"not a valid phone number: {lead.get('phone')!r}")
    number = phonenumbers.format_number(n, phonenumbers.PhoneNumberFormat.E164)
    if live() and phonenumbers.number_type(n) in MOBILE_TYPES and not rule.get("call_mobiles"):
        return Decision(False, f"{number} may be a mobile, and mobiles are switched off for {country}")
    if number in dnc_numbers():
        return Decision(False, f"{number} is on the do-not-call list")

    zones = ptz.time_zones_for_number(n)
    tz = lead.get("timezone") or (zones[0] if zones and zones[0] != "Etc/Unknown" else None)
    if not tz:
        return Decision(False, "can't tell what time it is there")
    try:
        local = now.astimezone(ZoneInfo(tz))
    except (ZoneInfoNotFoundError, ValueError):
        return Decision(False, f"unknown timezone {tz!r}")
    # test calls ring your own phone, so the business's opening hours don't apply
    if live() and not _in_hours(local, r):
        return Decision(False, f"outside calling hours there ({local:%a %H:%M} in {tz})", number=number, tz=tz)

    if len(past_calls) >= r["max_attempts"]:
        return Decision(False, f"already called {len(past_calls)} times", number=number, tz=tz)
    if past_calls:
        last = datetime.fromisoformat(past_calls[-1]["placed"])
        if now - last < timedelta(days=r["days_between_attempts"]):
            return Decision(False, f"called on {last:%d %b}, waiting {r['days_between_attempts']} days", number=number, tz=tz)
    if all_calls_today >= r["calls_per_day"]:
        return Decision(False, f"today's {r['calls_per_day']} calls are used up", number=number, tz=tz)

    to = number if live() else phonenumbers.format_number(_e164(test_number, country) or n, phonenumbers.PhoneNumberFormat.E164)
    return Decision(True, "ok" if live() else f"test mode: calling your phone {to} instead of {number}", to=to, number=number, tz=tz)
