"""MARK's safety rules. Run:  python -m unittest agents.mark.test_mark"""

import json
import unittest
from pathlib import Path
from unittest import mock

from agents.mark import mark, templates
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
    def test_every_trade_has_designs(self):
        from agents.mark.plan import NICHES
        for n in NICHES:
            self.assertGreaterEqual(len(templates.for_niche(n)), 4, n)

    def test_trade_wording_reaches_the_translator(self):
        self.assertIn("Car need a clean", mark.english_for("carwash")["sec_cta_title"])
        self.assertEqual(mark.english_for("homeservices")["sec_faq_title"], mark.LABELS_EN["sec_faq_title"])

    def test_platform_and_mark_agree_on_niches(self):
        ts = (Path(__file__).resolve().parents[2] / "platform/src/lib/niches.ts").read_text(encoding="utf-8")
        from agents.mark.plan import NICHES
        for n in NICHES:
            self.assertIn(f'"{n}"', ts)


def lead(**kw) -> Lead:
    base = {"name": "Test Co", "niche": "salon", "country": "GB", "city": "Leeds"}
    return Lead.model_validate({**base, **kw})


class Templates(unittest.TestCase):
    def test_always_a_template_for_the_trade(self):
        from agents.mark.plan import NICHES
        for n in NICHES:
            self.assertIn(n, templates.pick(lead(niche=n)).template["niches"])

    def test_no_photo_means_no_photo_led_design(self):
        for n in ("salon", "carwash", "autorepair", "homeservices", "dental"):
            self.assertFalse(templates.pick(lead(niche=n)).template.get("needsPhoto"), n)

    def test_a_photo_lets_photo_designs_compete(self):
        with_photo = {templates.pick(lead(niche="salon", name=f"Salon {i}", photos=["https://x.example/a.jpg"])).id for i in range(30)}
        self.assertTrue(any(templates.BY_ID[t].get("needsPhoto") or "hero:collage" in templates.BY_ID[t]["sections"] for t in with_photo))

    def test_the_leads_facts_steer_the_choice(self):
        packages = [{"name": "Basic", "includes": ["Wash"], "prices": {"car": 20}}]
        self.assertIn("services:packages", " ".join(templates.pick(lead(niche="carwash", packages=packages)).template["sections"]))
        c = templates.pick(lead(niche="dental", insurers=["Bupa"]))
        self.assertTrue(any(s.startswith("insurance") for s in c.template["sections"]))

    def test_same_lead_same_answer(self):
        l = lead(niche="dental", name="Bright Smile")
        self.assertEqual(templates.pick(l).id, templates.pick(l).id)

    def test_neighbours_get_a_different_design(self):
        l = lead(niche="autorepair")
        first = templates.pick(l).id
        self.assertNotEqual(templates.pick(l, {first: 1}).id, first)

    def test_fonts_and_template_reach_the_platform(self):
        p = mark.build_payload(LEAD, PLAN, "salon-studio")
        self.assertEqual(p["theme"], "salon-studio")
        self.assertEqual([p["content"]["headingFont"], p["content"]["bodyFont"]], templates.BY_ID["salon-studio"]["fonts"])

    def test_brand_colours_beat_the_templates_colours(self):
        p = mark.build_payload(LEAD, PLAN, "salon-studio")        # the sample lead has a brand colour
        self.assertEqual(p["content"]["palette"]["primary"], PLAN.content.palette.primary)
        plain = LEAD.model_copy(update={"brand_colours": []})
        self.assertEqual(mark.build_payload(plain, PLAN, "salon-studio")["content"]["palette"], templates.BY_ID["salon-studio"]["palette"])

    def test_trade_details_are_copied_not_invented(self):
        p = mark.build_payload(lead(niche="autorepair", warranty="2 years", credentials=["Licensed"]), PLAN, "auto-honest")
        self.assertEqual(p["content"]["warranty"], "2 years")
        self.assertEqual(p["content"]["credentials"], ["Licensed"])
        self.assertEqual(mark.build_payload(lead(niche="autorepair"), PLAN, "auto-honest")["content"]["warranty"], None)

    def test_asking_for_a_wrong_template_says_which_exist(self):
        with self.assertRaises(RuntimeError) as e:
            mark.choose_template(lead(niche="dental"), "salon-noir", log=lambda m: None)
        self.assertIn("clinic-calm", str(e.exception))

    def test_headings_in_their_own_voice_reach_the_site(self):
        plan = Plan.model_validate_json((HERE / "plans" / "glow-lab-nails.json").read_text(encoding="utf-8"))
        labels = mark.build_payload(lead(), plan, "salon-glow", {"closed": "Closed"})["content"]["labels"]
        self.assertEqual(labels["sec_services_title"], "Pick your set")
        self.assertEqual(labels["pick_service"], "What are we doing today?")
        self.assertEqual(labels["closed"], "Closed")
        plan.titles.cta_title = "Book now " + chr(0x2014) + " today"
        self.assertEqual(mark.voice_labels(plan)["sec_cta_title"], "Book now, today")

    def test_platform_and_mark_read_the_same_library(self):
        ts = (Path(__file__).resolve().parents[2] / "platform/src/templates/index.tsx").read_text(encoding="utf-8")
        self.assertIn('import LIBRARY from "./library.json"', ts)


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
