"""The pipeline folders. Run:  python -m unittest agents.test_pipeline"""

import tempfile
import unittest
from pathlib import Path
from unittest import mock

from agents import pipeline


class Pipeline(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.patch = mock.patch.object(pipeline, "ROOT", Path(self.tmp.name))
        self.patch.start()

    def tearDown(self):
        self.patch.stop()
        self.tmp.cleanup()

    def test_a_new_lead_lands_in_leads_with_its_history(self):
        b = pipeline.add({"name": "Glow Lab Nails", "niche": "salon", "city": "Dubai"}, by="EDITH")
        self.assertEqual((b.stage, b.key), ("1-leads", "glow-lab-nails-dubai"))
        self.assertEqual(b.lead()["name"], "Glow Lab Nails")
        self.assertIn("EDITH · new lead", b.history()[0])
        for folder in pipeline.STAGE_DIRS:
            self.assertTrue((pipeline.ROOT / folder).is_dir())

    def test_the_same_business_twice_is_refused(self):
        pipeline.add({"name": "Fadi Plumbing", "niche": "homeservices", "city": "Sydney"})
        with self.assertRaises(pipeline.PipelineError):
            pipeline.add({"name": "Fadi Plumbing", "niche": "homeservices", "city": "Sydney"})

    def test_moving_keeps_the_files_and_logs_who_did_it(self):
        b = pipeline.add({"name": "Fadi Plumbing", "niche": "homeservices", "city": "Sydney"})
        b.file("notes.txt").write_text("keep me")
        b = pipeline.move(b.key, "qualified", by="FRIDAY", note="wants a call back Monday")
        self.assertEqual(b.stage, "7-qualified")
        self.assertEqual(b.file("notes.txt").read_text(), "keep me")
        self.assertIn("FRIDAY · moved to Qualified: wants a call back Monday", b.history()[-1])
        self.assertFalse((pipeline.ROOT / "1-leads" / b.key).exists())

    def test_stages_can_be_named_loosely(self):
        for name in ("qualified", "7", "7-qualified", "Qualified"):
            self.assertEqual(pipeline.stage_dir(name), "7-qualified")
        self.assertEqual(pipeline.stage_dir("demo built"), "3-demo-built")
        with self.assertRaises(pipeline.PipelineError):
            pipeline.stage_dir("maybe")

    def test_the_board_shows_every_business_in_its_column(self):
        pipeline.add({"name": "Glow Lab Nails", "niche": "salon", "city": "Dubai"})
        b = pipeline.add({"name": "Fadi Plumbing", "niche": "homeservices", "city": "Sydney"})
        pipeline.move(b.key, "won")
        html = (pipeline.ROOT / "index.html").read_text(encoding="utf-8")
        self.assertIn("Glow Lab Nails", html)
        self.assertLess(html.index("Leads"), html.index("Glow Lab Nails"))
        self.assertLess(html.index("Won"), html.index("Fadi Plumbing"))

    def test_html_in_a_lead_cant_break_the_board(self):
        pipeline.add({"name": "<script>alert(1)</script>", "niche": "salon"})
        self.assertNotIn("<script>alert", (pipeline.ROOT / "index.html").read_text(encoding="utf-8"))


if __name__ == "__main__":
    unittest.main()
