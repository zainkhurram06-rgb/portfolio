"""
Each agent's personality and training.

    agents/<agent>/persona.md     who they are, how they work, what they never do.
                                  Edit it like a document. The "## Brief" section is
                                  what goes into every AI prompt that agent sends.
    training/<agent>/*.json       research Cowork gathered (see COWORK-PROMPTS.md).
                                  Optional: everything works without it, and gets
                                  better when it's there.
"""

import json
import re
from pathlib import Path
from typing import Any, Optional

AGENTS = Path(__file__).resolve().parent
TRAINING = AGENTS.parent / "training"


def persona(agent: str) -> str:
    f = AGENTS / agent / "persona.md"
    return f.read_text(encoding="utf-8") if f.exists() else ""


def section(text: str, title: str) -> str:
    """The text under '## <title>' up to the next '## ' heading."""
    m = re.search(rf"^## {re.escape(title)}\s*\n(.*?)(?=^## |\Z)", text, re.S | re.M)
    return m.group(1).strip() if m else ""


def brief(agent: str) -> str:
    return section(persona(agent), "Brief")


def training(agent: str, name: str) -> Optional[Any]:
    """training/<agent>/<name>.json, or None if Cowork hasn't made it yet (or it's broken)."""
    f = TRAINING / agent / f"{name}.json"
    if not f.exists():
        return None
    try:
        return json.loads(f.read_text(encoding="utf-8-sig"))
    except json.JSONDecodeError:
        return None
