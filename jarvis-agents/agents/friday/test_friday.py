"""FRIDAY's guardrails and call flow, with no phone line. Run:  python -m unittest agents.friday.test_friday"""

import json
import os
import tempfile
import unittest
from datetime import datetime, timezone
from pathlib import Path
from unittest import mock

from agents import pipeline
from agents.friday import friday, guard, voice as voices

# Tuesday 07:00 UTC is 11:00 in Dubai, inside calling hours
TUESDAY_11_DUBAI = datetime(2026, 10, 27, 7, 0, tzinfo=timezone.utc)
RULES = {**guard.rules(), "company_name": "Test Co",
         "countries": {"AE": {"on": True, "call_mobiles": False}, "US": {"on": False, "call_mobiles": False}}}
SALON = {"name": "Velvet Nails", "niche": "salon", "country": "AE", "city": "Dubai", "phone": "+971 4 555 1001"}
quiet = lambda m: None      # noqa: E731


class Guard(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.patches = [mock.patch.object(pipeline, "ROOT", Path(self.tmp.name)),
                        mock.patch.dict(os.environ, {"FRIDAY_LIVE": "yes", "FRIDAY_TEST_NUMBER": ""})]
        for p in self.patches:
            p.start()

    def tearDown(self):
        for p in self.patches:
            p.stop()
        self.tmp.cleanup()

    def can(self, lead=SALON, past=(), today=0, now=TUESDAY_11_DUBAI, r=RULES):
        return guard.can_call(lead, list(past), today, now, r)

    def test_a_landline_in_an_allowed_country_during_hours_is_ok(self):
        d = self.can()
        self.assertTrue(d.ok, d.reason)
        self.assertEqual(d.to, "+97145551001")

    def test_country_switched_off(self):
        self.assertIn("switched off", self.can({**SALON, "country": "US", "phone": "+1 832 555 0177"}).reason)

    def test_mobiles_need_permission(self):
        self.assertIn("mobile", self.can({**SALON, "phone": "+971 50 555 0199"}).reason)

    def test_outside_hours_and_weekends(self):
        self.assertIn("outside calling hours", self.can(now=datetime(2026, 10, 27, 15, 0, tzinfo=timezone.utc)).reason)   # 19:00 Dubai
        self.assertIn("outside calling hours", self.can(now=datetime(2026, 10, 25, 7, 0, tzinfo=timezone.utc)).reason)    # Sunday

    def test_do_not_call_list(self):
        guard.add_dnc("+97145551001", "test")
        self.assertIn("do-not-call", self.can().reason)

    def test_attempts_and_spacing(self):
        yesterday = {"placed": "2026-10-26T07:00:00+00:00"}
        self.assertIn("waiting", self.can(past=[yesterday]).reason)
        self.assertIn("already called 2", self.can(past=[yesterday, yesterday]).reason)
        self.assertIn("used up", self.can(today=RULES["calls_per_day"]).reason)

    def test_test_mode_calls_your_phone_instead(self):
        with mock.patch.dict(os.environ, {"FRIDAY_LIVE": "", "FRIDAY_TEST_NUMBER": "+971 50 111 2222"}):
            d = self.can({**SALON, "country": "US", "phone": "+1 832 555 0177"})     # country off doesn't matter in test mode
        self.assertTrue(d.ok)
        self.assertEqual(d.to, "+971501112222")
        self.assertEqual(d.number, "+18325550177")

    def test_no_test_number_no_calls(self):
        with mock.patch.dict(os.environ, {"FRIDAY_LIVE": "", "FRIDAY_TEST_NUMBER": ""}):
            self.assertFalse(self.can().ok)


class Calls(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.patches = [mock.patch.object(pipeline, "ROOT", Path(self.tmp.name)),
                        mock.patch.dict(os.environ, {"FRIDAY_LIVE": "yes", "FRIDAY_TEST_NUMBER": ""}),
                        mock.patch.object(guard, "rules", return_value=RULES)]
        for p in self.patches:
            p.start()
        b = pipeline.add(SALON)
        b.file("build.json").write_text(json.dumps({"site": "http://localhost:3000/s/velvet", "subdomain": "https://velvet.example"}), encoding="utf-8")
        self.b = pipeline.move(b.key, "approved")

    def tearDown(self):
        for p in self.patches:
            p.stop()
        self.tmp.cleanup()

    def call_with(self, outcome, **data):
        class Voice:
            sent = {}

            def call(self, to, variables):
                Voice.sent = variables
                return "conv-1"

            def result(self, cid):
                return {"status": "done", "summary": "talked", "data": {"outcome": outcome, **data}, "transcript": [{"who": "agent", "said": "Hi"}]}

        v = Voice()
        friday.call(self.b, voice=v, now=TUESDAY_11_DUBAI, log=quiet, r=RULES)
        friday.collect(pipeline.find(self.b.key), voice=v, log=quiet)
        return pipeline.find(self.b.key), Voice.sent

    def test_interested_goes_to_qualified_with_where_to_send_the_link(self):
        b, sent = self.call_with("interested", send_link_to="+971 50 555 0199")
        self.assertEqual(b.stage, "7-qualified")
        self.assertIn("send the link to +971 50 555 0199", b.history()[-1])
        self.assertEqual(sent["demo_link"], "https://velvet.example")
        self.assertEqual(sent["company"], "Test Co")
        self.assertTrue(b.file("calls", "index.html").exists())

    def test_do_not_call_is_remembered_for_good(self):
        b, _ = self.call_with("do_not_call")
        self.assertEqual(b.stage, "9-lost")
        self.assertIn("+97145551001", guard.dnc_numbers())

    def test_call_back_and_not_interested(self):
        b, _ = self.call_with("call_back", callback_time="Thursday 3pm")
        self.assertEqual(b.stage, "6-pitched")
        self.assertIn("Thursday 3pm", b.history()[-1])

    def test_no_answer_stays_until_out_of_attempts(self):
        b, _ = self.call_with("no_answer")
        self.assertEqual(b.stage, "5-approved")

    def test_test_calls_never_move_a_business(self):
        with mock.patch.dict(os.environ, {"FRIDAY_LIVE": "", "FRIDAY_TEST_NUMBER": "+971 50 111 2222"}):
            b, _ = self.call_with("interested")
        self.assertEqual(b.stage, "5-approved")
        self.assertIn("test call", b.file("calls", "index.html").read_text(encoding="utf-8"))

    def test_only_approved_businesses_get_called(self):
        b = pipeline.move(self.b.key, "checked")
        with self.assertRaises(pipeline.PipelineError):
            friday.call(b, voice=voices.SampleVoice(), now=TUESDAY_11_DUBAI, log=quiet, r=RULES)

    def test_she_has_to_say_who_shes_calling_for(self):
        with self.assertRaises(pipeline.PipelineError):
            friday.call(self.b, voice=voices.SampleVoice(), now=TUESDAY_11_DUBAI, log=quiet, r={**RULES, "company_name": ""})

    def test_the_pitch_says_she_is_an_ai_and_respects_do_not_call(self):
        p = friday.prompt()
        self.assertTrue(p.startswith("You are FRIDAY"))
        self.assertIn("AI assistant", friday.FIRST_MESSAGE)
        self.assertIn("not to be called again", p)
        self.assertNotIn("—", p + friday.FIRST_MESSAGE)


if __name__ == "__main__":
    unittest.main()
