"""MARK's safety rules. Run:  python -m unittest agents.mark.test_mark"""

import json
import unittest
from pathlib import Path
from unittest import mock

from agents.mark import mark
from agents.mark.brains import BrainError, _json_from_text, think
from agents.mark.plan import Lead, Plan

HERE = Path(__file__).resolve().parents[2] / "samples"
LEAD = Lead.model_validate_json((HERE / "lead-madrid-salon.json").read_text(encoding="utf-8"))
PLAN = Plan.model_validate_json((HERE / "plan-madrid-salon.json").read_text(encoding="utf-8"))


class Facts(unittest.TestCase):
    def test_facts_come_from_the_lead_not_the_model(self):
        p = mark.build_payload(LEAD, PLAN)
        self.assertEqual(p["name"], "Estudio Alba")
        self.assertEqual(p["phone"], LEAD.phone)
        self.assertEqual(p["content"]["rating"], 4.8)
        self.assertEqual(p["content"]["reviews"], [r.model_dump() for r in LEAD.reviews])

    def test_no_lead_reviews_means_no_reviews(self):
        lead = LEAD.model_copy(update={"reviews": []})
        self.assertEqual(mark.build_payload(lead, PLAN)["content"]["reviews"], [])

    def test_demo_login_is_never_the_business_email(self):
        lead = LEAD.model_copy(update={"email": "owner@realbusiness.com"})
        owner = mark.build_payload(lead, PLAN)["owner"]
        self.assertNotIn("realbusiness", owner["email"])
        self.assertGreaterEqual(len(owner["password"]), 10)

    def test_bad_colours_are_replaced(self):
        plan = PLAN.model_copy(deep=True)
        plan.content.palette.primary = "red; } body { display:none"
        self.assertRegex(mark.build_payload(LEAD, plan)["content"]["palette"]["primary"], r"^#[0-9a-fA-F]{6}$")

    def test_whatsapp_outside_north_america(self):
        self.assertEqual(mark.build_payload(LEAD, PLAN)["reminderChannel"], "whatsapp")
        us = LEAD.model_copy(update={"country": "US"})
        self.assertEqual(mark.build_payload(us, PLAN)["reminderChannel"], "sms")


class Labels(unittest.TestCase):
    def test_english_needs_no_translation(self):
        self.assertEqual(mark.translate_labels("en", "file:x", log=lambda m: None), {})

    def test_broken_placeholder_falls_back_to_english(self):
        es = json.loads((HERE / "labels-es.json").read_text(encoding="utf-8"))
        es["bk_back_to"] = "Volver"                       # lost {name}
        with mock.patch.object(mark, "think", return_value=mark.Labels(**es)):
            out = mark.translate_labels("es", "x", log=lambda m: None)
        self.assertEqual(out["bk_back_to"], mark.LABELS_EN["bk_back_to"])
        self.assertEqual(out["closed"], "Cerrado")

    def test_translation_failure_keeps_english(self):
        with mock.patch.object(mark, "think", side_effect=BrainError("all down")):
            self.assertEqual(mark.translate_labels("es", "x", log=lambda m: None), {})


class Niches(unittest.TestCase):
    def test_every_trade_has_a_design(self):
        from agents.mark.plan import NICHES
        self.assertEqual(set(mark.THEME_FOR), set(NICHES))

    def test_trade_wording_reaches_the_translator(self):
        self.assertIn("Car need a clean", mark.english_for("carwash")["hs_cta_title"])
        self.assertEqual(mark.english_for("salon")["hs_cta_title"], mark.LABELS_EN["hs_cta_title"])

    def test_platform_and_mark_agree_on_niches(self):
        ts = (Path(__file__).resolve().parents[2] / "platform/src/lib/niches.ts").read_text(encoding="utf-8")
        from agents.mark.plan import NICHES
        for n in NICHES:
            self.assertIn(f'"{n}"', ts)


class Brains(unittest.TestCase):
    def test_pulls_json_out_of_chatter(self):
        self.assertEqual(json.loads(_json_from_text('Sure! ```json\n{"a": 1}\n``` hope that helps')), {"a": 1})

    def test_falls_through_to_a_working_brain(self):
        seen = []
        think("s", "p", Plan, order=f"haiku,deepseek,file:{HERE / 'plan-madrid-salon.json'}", log=seen.append)
        self.assertTrue(any("haiku unavailable" in s for s in seen) or any("brain: file" in s for s in seen))

    def test_all_brains_down_says_why(self):
        with self.assertRaises(BrainError) as e:
            think("s", "p", Plan, order="nonsense", log=lambda m: None)
        self.assertIn("nonsense", str(e.exception))


if __name__ == "__main__":
    unittest.main()
