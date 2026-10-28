"""Each agent's personality and Cowork's training reach the right prompts. Run:  python -m unittest agents.test_persona"""

import json
import tempfile
import unittest
from pathlib import Path
from unittest import mock

from agents import persona
from agents.friday import friday
from agents.mark import mark

LONG_DASHES = "[" + chr(0x2013) + chr(0x2014) + "]"


class Personas(unittest.TestCase):
    def test_every_agent_has_a_brief(self):
        for agent in ("edith", "mark", "happy", "friday", "jarvis"):
            self.assertGreater(len(persona.brief(agent)), 200, agent)

    def test_no_long_dashes_anywhere(self):
        for agent in ("edith", "mark", "happy", "friday", "jarvis"):
            self.assertNotRegex(persona.persona(agent), LONG_DASHES, agent)
        self.assertNotRegex(friday.prompt(), LONG_DASHES)

    def test_friday_says_she_is_an_ai_and_stops_when_asked(self):
        p = friday.prompt()
        self.assertIn("AI assistant", p)
        self.assertIn("Don't call me again", p)
        self.assertIn("{{business_name}}", p)
        for part in friday.PERSONA_PARTS:
            self.assertIn(f"## {part}", p)


class Training(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.patch = mock.patch.object(persona, "TRAINING", Path(self.tmp.name))
        self.patch.start()

    def tearDown(self):
        self.patch.stop()
        self.tmp.cleanup()

    def put(self, agent, name, data):
        f = Path(self.tmp.name) / agent / f"{name}.json"
        f.parent.mkdir(parents=True, exist_ok=True)
        f.write_text(data if isinstance(data, str) else json.dumps(data), encoding="utf-8")

    def test_nothing_there_is_fine(self):
        self.assertIsNone(persona.training("friday", "objections"))
        self.assertNotIn("playbook from real calls", friday.prompt())

    def test_a_broken_file_is_ignored_not_fatal(self):
        self.put("friday", "objections", "{not json")
        self.assertIsNone(persona.training("friday", "objections"))
        friday.prompt()

    def test_coworks_sales_research_reaches_fridays_prompt(self):
        self.put("friday", "objections", [{"objection": "I only take walk-ins", "trade": "salon", "response": "Walk-ins love seeing the prices first."}])
        self.put("friday", "techniques", [{"name": "Ask permission", "how_friday_uses_it": "Ask for 30 seconds.", "example_line": "Got 30 seconds?"}])
        self.put("friday", "do-not", [{"tactic": "Fake deadlines", "why_not": "It's a lie."}])
        p = friday.prompt()
        self.assertIn("I only take walk-ins\" [salon]: Walk-ins love seeing the prices first.", p)
        self.assertIn("Ask permission: Ask for 30 seconds.", p)
        self.assertIn("Fake deadlines", p)

    def test_the_playbook_never_overflows_her_prompt(self):
        self.put("friday", "objections", [{"objection": f"objection {i}", "trade": "any", "response": "x" * 200} for i in range(200)])
        self.assertLessEqual(len(friday.playbook()), friday.PLAYBOOK_LIMIT)

    def test_coworks_trade_research_reaches_marks_prompt(self):
        self.put("mark", "dental", {"headline_patterns": ["promise + place"], "mistakes": ["stock photos of smiling models"]})
        s = mark.system_for("dental")
        self.assertIn("promise + place", s)
        self.assertIn("stock photos of smiling models", s)
        self.assertIn(persona.brief("mark")[:40], s)
        self.assertNotIn("promise + place", mark.system_for("salon"))


if __name__ == "__main__":
    unittest.main()
