"""
FRIDAY's voice: an ElevenLabs agent on a phone line (Twilio number imported into
ElevenLabs). Or, without keys, a stand-in that plays back sample call results.

    ELEVENLABS_API_KEY      your ElevenLabs key
    FRIDAY_PHONE_NUMBER_ID  the phone number's id in ElevenLabs (Agents, Phone numbers)
    FRIDAY_VOICE_ID         optional, an ElevenLabs voice id
    FRIDAY_VOICE            "live" to use ElevenLabs, anything else uses samples

API: https://elevenlabs.io/docs/api-reference/twilio/outbound-call
"""

import json
import os
from pathlib import Path
from typing import Optional

import requests

from .. import pipeline

API = "https://api.elevenlabs.io/v1/convai"
SAMPLES = Path(__file__).resolve().parents[2] / "samples" / "calls"

# what FRIDAY writes down after every call, so the pipeline can move on its own
DATA_COLLECTION = {
    "outcome": {"type": "string", "description": "One of: interested, not_interested, call_back, do_not_call, voicemail, no_answer, wrong_person. interested means they want the link, a follow up or to talk pricing."},
    "spoke_to_owner": {"type": "boolean", "description": "True if the person was the owner or manager."},
    "callback_time": {"type": "string", "description": "When to call back, if they gave a time. Empty otherwise."},
    "send_link_to": {"type": "string", "description": "The WhatsApp number or email they asked us to send the demo link to. Empty if none."},
    "objection": {"type": "string", "description": "Their main reason for hesitating, in a few words. Empty if none."},
}


class VoiceError(Exception):
    pass


def agent_file() -> Path:
    return pipeline.ROOT / "friday-agent.json"


class ElevenLabs:
    def __init__(self, key: Optional[str] = None):
        self.key = key or os.environ.get("ELEVENLABS_API_KEY", "")
        if not self.key:
            raise VoiceError("ELEVENLABS_API_KEY is not set")

    def _call(self, method: str, path: str, body: Optional[dict] = None) -> dict:
        r = requests.request(method, f"{API}{path}", json=body, headers={"xi-api-key": self.key}, timeout=60)
        if r.status_code >= 400:
            raise VoiceError(f"ElevenLabs said {r.status_code}: {r.text[:400]}")
        return r.json() if r.text else {}

    def setup(self, prompt: str, first_message: str, language: str = "en") -> str:
        """Creates FRIDAY on ElevenLabs, or updates her if she exists. Returns her agent id."""
        config = {
            "name": "FRIDAY",
            "conversation_config": {
                "agent": {"first_message": first_message, "language": language, "prompt": {"prompt": prompt}},
                **({"tts": {"voice_id": os.environ["FRIDAY_VOICE_ID"]}} if os.environ.get("FRIDAY_VOICE_ID") else {}),
            },
            "platform_settings": {"data_collection": DATA_COLLECTION},
        }
        saved = json.loads(agent_file().read_text(encoding="utf-8")) if agent_file().exists() else {}
        if saved.get("agent_id"):
            self._call("PATCH", f"/agents/{saved['agent_id']}", config)
            return saved["agent_id"]
        agent_id = self._call("POST", "/agents/create", config)["agent_id"]
        agent_file().parent.mkdir(parents=True, exist_ok=True)
        agent_file().write_text(json.dumps({"agent_id": agent_id}, indent=2) + "\n", encoding="utf-8")
        return agent_id

    def call(self, to: str, variables: dict) -> str:
        saved = json.loads(agent_file().read_text(encoding="utf-8")) if agent_file().exists() else {}
        phone_id = os.environ.get("FRIDAY_PHONE_NUMBER_ID", "")
        if not saved.get("agent_id"):
            raise VoiceError("FRIDAY isn't set up on ElevenLabs yet: python -m agents.friday setup")
        if not phone_id:
            raise VoiceError("FRIDAY_PHONE_NUMBER_ID is not set (ElevenLabs, Agents, Phone numbers)")
        out = self._call("POST", "/twilio/outbound-call", {
            "agent_id": saved["agent_id"], "agent_phone_number_id": phone_id, "to_number": to,
            "conversation_initiation_client_data": {"dynamic_variables": variables},
        })
        if not out.get("conversation_id"):
            raise VoiceError(f"the call didn't start: {out.get('message', out)}")
        return out["conversation_id"]

    def result(self, conversation_id: str) -> Optional[dict]:
        """None while the call is still going, else what happened."""
        c = self._call("GET", f"/conversations/{conversation_id}")
        if c.get("status") in ("initiated", "in-progress", "processing"):
            return None
        a = c.get("analysis") or {}
        data = {k: (v or {}).get("value") for k, v in (a.get("data_collection_results") or {}).items()}
        return {
            "status": c.get("status"),
            "summary": a.get("transcript_summary") or "",
            "data": data,
            "seconds": (c.get("metadata") or {}).get("call_duration_secs"),
            "transcript": [{"who": t.get("role"), "said": t.get("message")} for t in c.get("transcript") or [] if t.get("message")],
        }


class SampleVoice:
    """Plays back samples/calls/<business key>.json, or a polite no-answer."""

    def __init__(self):
        self.calls = {}

    def setup(self, prompt: str, first_message: str, language: str = "en") -> str:
        return "sample-agent"

    def call(self, to: str, variables: dict) -> str:
        cid = f"sample-{variables.get('business_key')}-{len(self.calls) + 1}"
        self.calls[cid] = variables.get("business_key")
        return cid

    def result(self, conversation_id: str) -> Optional[dict]:
        key = self.calls.get(conversation_id) or conversation_id.removeprefix("sample-").rsplit("-", 1)[0]
        f = SAMPLES / f"{key}.json"
        if f.exists():
            return json.loads(f.read_text(encoding="utf-8"))
        return {"status": "done", "summary": "Nobody picked up.", "data": {"outcome": "no_answer"}, "seconds": 0, "transcript": []}


def client():
    return ElevenLabs() if os.environ.get("FRIDAY_VOICE", "sample") == "live" else SampleVoice()
