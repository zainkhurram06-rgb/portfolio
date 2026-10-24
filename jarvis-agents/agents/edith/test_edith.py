"""EDITH's rules, with saved Apify samples. Run:  python -m unittest agents.edith.test_edith"""

import json
import tempfile
import unittest
from pathlib import Path
from unittest import mock

from agents import pipeline
from agents.edith import apify, edith

quiet = lambda m: None      # noqa: E731


class Links(unittest.TestCase):
    def test_social_and_booking_links_are_not_websites(self):
        r = edith.rules()
        for url in ("https://www.instagram.com/glow/", "https://linktr.ee/x", "https://www.fresha.com/a/x", "https://wa.me/97150",
                    "https://m.facebook.com/x", "https://x.square.site", None, ""):
            self.assertFalse(edith.is_real_website(url, r), url)
        for url in ("https://lunahair.ae", "http://www.trimbarbers.com", "salonx.co.uk"):
            self.assertTrue(edith.is_real_website(url, r), url)

    def test_profiles_are_read_from_links(self):
        self.assertEqual(edith.social("https://www.instagram.com/glowlab.nails/"), ("instagram", "glowlab.nails"))
        self.assertEqual(edith.social("instagram.com/Glow.Lab?igsh=abc"), ("instagram", "glow.lab"))
        self.assertEqual(edith.social("https://www.facebook.com/AlNoorSalon"), ("facebook", "AlNoorSalon"))
        self.assertEqual(edith.social("https://www.tiktok.com/@fadekings"), ("tiktok", "fadekings"))
        self.assertIsNone(edith.social("https://www.instagram.com/p/Cxyz123/"))       # a post, not a profile
        self.assertIsNone(edith.social("https://lunahair.ae"))


class Run(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.patch = mock.patch.object(pipeline, "ROOT", Path(self.tmp.name))
        self.patch.start()

    def tearDown(self):
        self.patch.stop()
        self.tmp.cleanup()

    def run_edith(self, **rule_changes):
        r = {**edith.rules(), **rule_changes}
        with mock.patch.object(edith, "rules", return_value=r):
            return edith.find("salon", "Dubai", "AE", api=apify.SampleApify(log=quiet), log=quiet)

    def test_only_businesses_that_pass_every_rule_become_leads(self):
        out = self.run_edith()
        self.assertEqual(out["qualified"], 18)
        self.assertEqual(len(out["kept"]), 18)
        names = {b.lead()["name"] for b in pipeline.in_stage("leads")}
        for good in ("Velvet Nail Lounge", "Al Noor Ladies Salon", "Twin Search Beauty"):
            self.assertIn(good, names)
        for bad in ("Luna Hair Studio", "New Nails Studio", "Mystery Nails", "Home Glam by Sara", "Old Town Barbers",
                    "Sleepy Salon", "Hidden Site Beauty", "Gone Nails", "Corner Barber", "Bliss Nails Mirdif"):
            self.assertNotIn(bad, names)

    def test_every_lead_has_what_mark_and_friday_need(self):
        self.run_edith()
        for b in pipeline.in_stage("leads"):
            lead = b.lead()
            self.assertGreaterEqual(lead["review_count"], 50)
            self.assertTrue(lead["phone"])
            self.assertIn("Shop", lead["address"])
            self.assertTrue(lead.get("instagram") or lead.get("facebook"))
            self.assertTrue(lead["sample"])
            self.assertRegex(" ".join(lead["edith"]["why"]), r"posted on \w+ (today|yesterday|\d+ days ago)")

    def test_the_report_says_why_each_one_was_left_out(self):
        out = self.run_edith()
        page = Path(out["report"]).read_text(encoding="utf-8")
        for reason in ("has a website: 6", "too few Google reviews: 4", "last post too long ago: 3", "no street address: 1",
                       "website in Instagram bio: 1", "no social media link on Google: 5"):
            self.assertIn(reason, page)

    def test_running_the_same_city_again_adds_nobody_twice(self):
        self.run_edith()
        again = self.run_edith()
        self.assertEqual(again["kept"], [])
        self.assertEqual(len(pipeline.in_stage("leads")), 18)

    def test_never_more_than_the_daily_number_and_the_best_go_first(self):
        out = self.run_edith(leads_per_city=5)
        self.assertEqual(len(out["kept"]), 5)
        scores = [b.lead()["edith"]["score"] for b in pipeline.in_stage("leads")]
        self.assertTrue(all(s >= 0 for s in scores))
        self.assertIn("over today&#x27;s number for this city: 13", Path(out["report"]).read_text(encoding="utf-8"))

    def test_the_rules_are_read_from_the_file(self):
        out = self.run_edith(min_reviews=500)
        self.assertLess(out["qualified"], 18)
        for b in pipeline.in_stage("leads"):
            self.assertGreaterEqual(b.lead()["review_count"], 500)

    def test_samples_can_be_cleared_out(self):
        self.run_edith()
        for b in pipeline.samples():
            pipeline.remove(b.key)
        self.assertEqual(pipeline.everyone(), [])


class Live(unittest.TestCase):
    def test_no_token_no_run(self):
        with mock.patch.dict("os.environ", {"APIFY_TOKEN": ""}):
            with self.assertRaises(apify.ApifyError):
                apify.LiveApify()

    def test_every_run_carries_a_spending_cap(self):
        started = mock.Mock(status_code=201, json=lambda: {"data": {"id": "r1", "status": "SUCCEEDED", "defaultDatasetId": "d1", "usageTotalUsd": 0.42}})
        items = mock.Mock(status_code=200, json=lambda: [{"title": "x"}])
        with mock.patch.object(apify.requests, "post", return_value=started) as post, \
                mock.patch.object(apify.requests, "get", return_value=items):
            api = apify.LiveApify(token="t", log=quiet)
            self.assertEqual(api.run(apify.GOOGLE_MAPS, {"searchStringsArray": ["nail salon"]}, max_usd=3.5), [{"title": "x"}])
        self.assertEqual(post.call_args.kwargs["params"]["maxTotalChargeUsd"], "3.50")
        self.assertIn("compass~crawler-google-places", post.call_args.args[0])
        self.assertAlmostEqual(api.spent, 0.42)


if __name__ == "__main__":
    unittest.main()
