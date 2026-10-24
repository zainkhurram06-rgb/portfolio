"""HAPPY's checks on a hand-made website. Run:  python -m unittest agents.happy.test_happy"""

import json
import shutil
import tempfile
import unittest
from pathlib import Path
from unittest import mock

from agents import pipeline
from agents.happy import happy

GOOD = """<!doctype html><html><head><meta name="robots" content="noindex, nofollow"></head><body>
<div>Demo preview built for Glow Lab Nails. Not live yet.</div>
<img src="media/logo.jpg"><h1>Nails that make you look twice</h1>
<img src="media/hero.jpg"><img src="media/photo-1.jpg"><img src="media/photo-2.jpg"><video src="media/hero-video.mp4"></video>
<a href="tel:+971505550199">Call</a><a href="http://localhost:3000/s/glow/book">Book</a>
<figure class="review card"><blockquote>Lovely</blockquote><figcaption><span>DM</span>Derek M.</figcaption></figure>
<figure><img src="media/photo-1.jpg"><figcaption>Chrome French for a bride</figcaption></figure>
</body></html>"""

CLEAN = {"desktop": {"broken_images": [], "broken_videos": [], "overflow_px": 0, "errors": []},
         "phone": {"broken_images": [], "broken_videos": [], "overflow_px": 0, "errors": []}}


class Happy(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.patch = mock.patch.object(pipeline, "ROOT", Path(self.tmp.name))
        self.patch.start()
        b = pipeline.add({"name": "Glow Lab Nails", "niche": "salon", "city": "Dubai", "phone": "+971 50 555 0199",
                          "reviews": [{"author": "Derek M.", "rating": 5, "text": "Lovely"}]})
        self.b = pipeline.move(b.key, "demo-built", by="MARK")
        self.b.file("build.json").write_text(json.dumps({"services": 5, "priced": 4, "headline": "x"}), encoding="utf-8")
        self.write(GOOD)

    def tearDown(self):
        self.patch.stop()
        self.tmp.cleanup()

    def write(self, page, media=("logo.jpg", "hero.jpg", "photo-1.jpg", "photo-2.jpg", "hero-video.mp4")):
        site = self.b.file("site")
        shutil.rmtree(site / "media", ignore_errors=True)
        (site / "media").mkdir(parents=True)
        for m in media:
            (site / "media" / m).write_bytes(b"x")
        (site / "index.html").write_text(page, encoding="utf-8")

    def check(self, browser=CLEAN, url_ok=True):
        return happy.check(self.b, browser=lambda f: browser, url_ok=lambda u: url_ok)

    def failed(self, out):
        return {x["rule"] for x in out["results"] if not x["ok"]}

    def test_a_good_site_passes_and_moves_on(self):
        b = happy.check_stage(self.b, log=lambda m: None, browser=lambda f: CLEAN, url_ok=lambda u: True)
        self.assertEqual(b.stage, "4-checked")
        self.assertTrue(b.file("check.html").exists())
        self.assertIn("passed every check", b.history()[-1])

    def test_photo_captions_are_not_mistaken_for_reviews(self):
        self.assertNotIn("reviews_are_real", self.failed(self.check()))

    def test_an_invented_review_fails(self):
        self.write(GOOD.replace("Derek M.", "Made Up Person"))
        self.assertIn("reviews_are_real", self.failed(self.check()))

    def test_an_em_dash_fails(self):
        self.write(GOOD.replace("look twice", "look twice — really"))
        self.assertIn("no_em_dashes", self.failed(self.check()))

    def test_a_missing_photo_fails(self):
        self.write(GOOD, media=("logo.jpg", "hero.jpg", "photo-1.jpg", "hero-video.mp4"))
        out = self.check()
        self.assertIn("no_broken_media", self.failed(out))
        self.assertFalse(out["passed"])

    def test_wrong_phone_and_broken_text_fail(self):
        self.write(GOOD.replace("tel:+971505550199", "tel:+971500000000").replace("Not live yet.", "Not live yet. undefined"))
        self.assertTrue({"phone_matches", "no_placeholders"} <= self.failed(self.check()))

    def test_a_dead_booking_link_and_a_phone_layout_problem_fail(self):
        bad = {**CLEAN, "phone": {**CLEAN["phone"], "overflow_px": 40}}
        self.assertTrue({"booking_link_works", "browser_check"} <= self.failed(self.check(browser=bad, url_ok=False)))

    def test_warnings_dont_stop_a_site(self):
        self.b.file("build.json").write_text(json.dumps({"services": 1, "priced": 0}), encoding="utf-8")
        out = self.check()
        self.assertTrue(out["passed"])
        self.assertGreaterEqual(out["warnings"], 2)

    def test_a_failed_site_stays_with_its_problems_logged(self):
        self.write(GOOD.replace("Derek M.", "Nobody Real"))
        b = happy.check_stage(self.b, log=lambda m: None, browser=lambda f: CLEAN, url_ok=lambda u: True)
        self.assertEqual(b.stage, "3-demo-built")
        self.assertIn("HAPPY · failed 1", b.history()[-1])

    def test_rules_can_be_switched_off(self):
        self.write(GOOD.replace("look twice", "look twice — really"))
        r = {**happy.rules(), "no_em_dashes": {**happy.rules()["no_em_dashes"], "on": False}}
        with mock.patch.object(happy, "rules", return_value=r):
            self.assertTrue(self.check()["passed"])


if __name__ == "__main__":
    unittest.main()
