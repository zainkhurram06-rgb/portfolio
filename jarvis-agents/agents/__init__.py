"""The agents: EDITH, MARK, HAPPY and FRIDAY, run by JARVIS."""

import os
from pathlib import Path

# keys live in jarvis-agents/.env (never committed), one NAME=value per line.
# anything already set in the shell wins.
_ENV = Path(__file__).resolve().parents[1] / ".env"
if _ENV.exists():
    for _line in _ENV.read_text(encoding="utf-8-sig").splitlines():
        _name, _eq, _value = _line.strip().partition("=")
        if _eq and _name and not _name.startswith("#"):
            os.environ.setdefault(_name.strip(), _value.strip().strip('"').strip("'"))
