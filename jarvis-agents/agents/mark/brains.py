"""
MARK's brains, cheapest sensible first. Same idea as Jarvis's BACKENDS: try one,
if it's down or rate limited, fall through to the next without stopping.

    haiku     Claude Haiku 5.5 over the API. ANTHROPIC_API_KEY. about a fifth of
              a cent per demo, and it supports guaranteed-valid JSON output.
    deepseek  DeepSeek API. DEEPSEEK_API_KEY. similar cost.
    codex     Codex CLI on your ChatGPT subscription. free, slower.
    claude    Claude Code CLI on your Claude subscription. free, slower.
    file:X    read the answer from a JSON file. for testing, no AI at all.

Order comes from MARK_BRAINS, e.g.  MARK_BRAINS=haiku,deepseek,codex
"""

import json
import os
import re
import shutil
import subprocess
from pathlib import Path
from typing import Type, TypeVar

from pydantic import BaseModel, ValidationError

T = TypeVar("T", bound=BaseModel)

DEFAULT_ORDER = "haiku,deepseek,codex,claude"
HAIKU_MODEL = os.environ.get("MARK_HAIKU_MODEL", "claude-haiku-5-5")
DEEPSEEK_MODEL = os.environ.get("MARK_DEEPSEEK_MODEL", "deepseek-chat")
CLI_TIMEOUT = 600


class BrainError(Exception):
    pass


def _json_from_text(text: str) -> str:
    """CLIs wrap JSON in chatter or code fences. Pull out the outermost object."""
    fenced = re.search(r"```(?:json)?\s*(\{.*\})\s*```", text, re.S)
    if fenced:
        return fenced.group(1)
    start, end = text.find("{"), text.rfind("}")
    if start == -1 or end <= start:
        raise BrainError("no JSON object in the reply")
    return text[start:end + 1]


def _schema_hint(model: Type[BaseModel]) -> str:
    return json.dumps(model.model_json_schema(), separators=(",", ":"))


# ---------------------------------------------------------------- each brain

def _haiku(system: str, prompt: str, model: Type[T]) -> T:
    if not os.environ.get("ANTHROPIC_API_KEY"):
        raise BrainError("ANTHROPIC_API_KEY not set")
    import anthropic
    client = anthropic.Anthropic()
    try:
        response = client.messages.parse(
            model=HAIKU_MODEL,
            max_tokens=16000,
            system=system,
            messages=[{"role": "user", "content": prompt}],
            output_format=model,
            output_config={"effort": "low"},
        )
    except anthropic.RateLimitError as e:
        raise BrainError(f"rate limited: {e}") from e
    except anthropic.APIStatusError as e:
        raise BrainError(f"api error {e.status_code}: {e.message}") from e
    except anthropic.APIConnectionError as e:
        raise BrainError(f"could not reach the API: {e}") from e
    if response.stop_reason == "refusal":
        raise BrainError("the model declined this one")
    if response.parsed_output is None:
        raise BrainError(f"no structured output (stop reason {response.stop_reason})")
    return response.parsed_output


def _deepseek(system: str, prompt: str, model: Type[T]) -> T:
    key = os.environ.get("DEEPSEEK_API_KEY")
    if not key:
        raise BrainError("DEEPSEEK_API_KEY not set")
    import requests
    r = requests.post(
        "https://api.deepseek.com/chat/completions",
        headers={"Authorization": f"Bearer {key}"},
        json={
            "model": DEEPSEEK_MODEL,
            "messages": [
                {"role": "system", "content": system + "\n\nReply with ONE JSON object matching this schema:\n" + _schema_hint(model)},
                {"role": "user", "content": prompt},
            ],
            "response_format": {"type": "json_object"},
            "max_tokens": 8000,
        },
        timeout=180,
    )
    if r.status_code != 200:
        raise BrainError(f"http {r.status_code}: {r.text[:200]}")
    return model.model_validate_json(r.json()["choices"][0]["message"]["content"])


def _cli(cmd: list, system: str, prompt: str, model: Type[T], via_stdin: bool) -> T:
    if not shutil.which(cmd[0]):
        raise BrainError(f"{cmd[0]} is not installed")
    full = (f"{system}\n\n{prompt}\n\nReply with ONE JSON object and nothing else. "
            f"It must match this JSON schema:\n{_schema_hint(model)}")
    out = subprocess.run(
        cmd + ([] if via_stdin else [full]),
        input=full if via_stdin else None,
        capture_output=True, text=True, timeout=CLI_TIMEOUT,
        encoding="utf-8", errors="replace", shell=(os.name == "nt"),
    )
    if out.returncode != 0:
        tail = (out.stderr or "non-zero exit").strip().splitlines()
        raise BrainError(tail[-1] if tail else "non-zero exit")
    return model.model_validate_json(_json_from_text(out.stdout))


def _codex(system, prompt, model):
    return _cli(["codex", "--skip-git-repo-check", "exec", "-"], system, prompt, model, via_stdin=True)


def _claude(system, prompt, model):
    return _cli(["claude", "-p", "--output-format", "text"], system, prompt, model, via_stdin=True)


def _file(path: str, model: Type[T]) -> T:
    return model.model_validate_json(Path(path).read_text(encoding="utf-8"))


BRAINS = {"haiku": _haiku, "deepseek": _deepseek, "codex": _codex, "claude": _claude}


# ---------------------------------------------------------------- the one call

def think(system: str, prompt: str, model: Type[T], order: str = None, log=print) -> T:
    """Ask each brain in turn until one returns valid output. One retry per brain
    when the output is the wrong shape, with the error fed back so it can fix it."""
    order = order or os.environ.get("MARK_BRAINS", DEFAULT_ORDER)
    failures = []
    for name in [b.strip() for b in order.split(",") if b.strip()]:
        if name.startswith("file:"):
            log(f"[brain: {name}]")
            return _file(name[5:], model)
        fn = BRAINS.get(name)
        if not fn:
            failures.append(f"{name}: unknown brain")
            continue
        ask = prompt
        for attempt in (1, 2):
            try:
                result = fn(system, ask, model)
                log(f"[brain: {name}]")
                return result
            except ValidationError as e:
                if attempt == 2:
                    failures.append(f"{name}: wrong shape twice")
                    break
                ask = prompt + f"\n\nYour last answer was invalid:\n{str(e)[:1500]}\nFix those fields."
            except (BrainError, json.JSONDecodeError, subprocess.TimeoutExpired) as e:
                failures.append(f"{name}: {str(e)[:160]}")
                log(f"[{name} unavailable: {str(e)[:120]}]")
                break
    raise BrainError("every brain failed:\n  " + "\n  ".join(failures))
