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


def _load(f: Path) -> Optional[Any]:
    try:
        return json.loads(f.read_text(encoding="utf-8-sig"))
    except (OSError, json.JSONDecodeError):
        return None


def training(agent: str, name: str) -> Optional[Any]:
    """training/<agent>/<name>.json plus any <name>-<source>.json beside it (one file per
    source, e.g. techniques-saad.json from a transcript, techniques.json from Cowork), so
    sources never overwrite each other. Lists are joined, named sources first. None if
    there's nothing yet; broken files are skipped."""
    folder = TRAINING / agent
    files = sorted(folder.glob(f"{name}-*.json")) + [folder / f"{name}.json"]
    found = [x for x in (_load(f) for f in files if f.exists()) if x is not None]
    if not found:
        return None
    if all(isinstance(x, list) for x in found):
        return [item for x in found for item in x]
    return next((x for x in reversed(found) if isinstance(x, dict)), found[-1])
