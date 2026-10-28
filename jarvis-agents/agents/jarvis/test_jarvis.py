"""JARVIS's numbers and runs. Run:  python -m unittest agents.jarvis.test_jarvis"""

import tempfile
import unittest
from datetime import date
from pathlib import Path
from unittest import mock

from agents import pipeline
from agents.jarvis import jarvis


class Numbers(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.patch = mock.patch.object(pipeline, "ROOT", Path(self.tmp.name))
        self.patch.start()
        pipeline.init()

    def tearDown(self):
        self.patch.stop()
        self.tmp.cleanup()

    def test_the_target_is_worked_backwards_into_daily_numbers(self):
        t = {**jarvis.targets(), "sales_per_day_from": "2026-11-28", "sales_per_day": 1, "sales_per_week": 1}
        with mock.patch.object(jarvis, "targets", return_value=t):
            later = jarvis.needed(t, date(2026, 12, 1))
            now = jarvis.needed(t, date(2026, 11, 2))
        self.assertEqual(later["won"], 1)
        self.assertAlmostEqual(later["interested"], 1 / t["rates"]["interested_to_won"], places=1)
        self.assertGreater(later["leads"], later["demos"])
        self.assertGreater(later["calls"], later["reached"])
        self.assertAlmostEqual(now["won"], 0.2)                # one a week is a fifth of a working day

    def test_activity_is_counted_from_the_business_histories(self):
        b = pipeline.add({"name": "Glow Lab", "niche": "salon", "country": "AE", "city": "Dubai", "phone": "+971 4 555 0000"}, by="EDITH", note="new lead")
        for stage in ("researched", "demo-built", "checked", "approved"):
            b = pipeline.move(b.key, stage, by="MARK")
        b.log("FRIDAY", "called +971 4 555 0000")
        b.log("FRIDAY", "called your phone (test)")
        pipeline.move(b.key, "qualified", by="FRIDAY", note="interested")
        week = jarvis.events(date.today())
        self.assertEqual(week["leads"], 1)
        self.assertEqual(week["demos"], 1)
        self.assertEqual(week["approved"], 1)
        self.assertEqual(week["calls"], 1)                     # the test call doesn't count
        self.assertEqual(week["interested"], 1)

    def test_demos_waiting_for_zain_show_as_the_bottleneck(self):
        for i in range(12):
            b = pipeline.add({"name": f"Shop {i}", "niche": "salon", "country": "AE", "city": "Dubai", "phone": f"+971 4 555 00{i:02d}"}, by="EDITH")
            for stage in ("researched", "demo-built", "checked"):
                pipeline.move(b.key, stage, by="HAPPY")
        s = jarvis.status()
        self.assertEqual(s["waiting"]["to approve"], 12)
        self.assertIn("12 demos are waiting for your approval", jarvis.summary(s))

    def test_the_morning_report_is_a_real_page(self):
        page = jarvis.report().read_text(encoding="utf-8")
        self.assertIn("sold this week", page)
        self.assertIn("Needed per day", page)
        self.assertNotRegex(page, "[" + chr(0x2013) + chr(0x2014) + "]")

    def test_run_goes_through_every_step_even_when_one_fails(self):
        calls = []

        def fake(cmd, **kw):
            calls.append(cmd[2:])
            return mock.Mock(returncode=1 if "mark" in cmd[2] else 0, stdout="ok", stderr="")

        done = jarvis.run(log=lambda m: None, runner=fake)
        self.assertEqual([c[0] for c in calls], ["agents.edith", "agents.mark", "agents.happy", "agents.friday", "agents.friday"])
        self.assertEqual([d["ok"] for d in done], [True, False, True, True, True])
        self.assertIn("MARK researches and builds", (pipeline.ROOT / "jarvis.html").read_text(encoding="utf-8"))


if __name__ == "__main__":
    unittest.main()
