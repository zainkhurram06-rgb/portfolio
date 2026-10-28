"""EDITH's rules, with saved samples. Run:  python -m unittest agents.edith.test_edith"""

import json
import tempfile
import unittest
from pathlib import Path
from unittest import mock

from agents import pipeline
from agents.edith import edith, places, social

quiet = lambda m: None      # noqa: E731


class Links(unittest.TestCase):
    def test_social_and_booking_links_are_not_websites(self):
        r = edith.rules()
        for url in ("https://www.instagram.com/glow/", "https://linktr.ee/x", "https://www.fresha.com/a/x", "https://wa.me/97150",
                    "https://m.facebook.com/x", "https://x.square.site", None, "", "not a link"):
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

    def test_handles_from_whatever_codex_says(self):
        for given in ("@Glow.Lab", "glow.lab", "https://www.instagram.com/glow.lab/", " glow.lab "):
            self.assertEqual(edith._handle(given), "glow.lab", given)
        for given in (None, "", "Glow Lab Salon", "https://lunahair.ae"):
            self.assertIsNone(edith._handle(given), given)

    def test_street_address_comes_from_the_address_parts(self):
        with_street = places.tidy({"addressComponents": [{"longText": "Shop 4", "types": ["subpremise"]}, {"longText": "Al Wasl Rd", "types": ["route"]}]})
        self.assertEqual(with_street["street"], "Shop 4, Al Wasl Rd")
        self.assertIsNone(places.tidy({"addressComponents": [{"longText": "Dubai", "types": ["locality"]}]})["street"])


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
            return edith.find("salon", "Dubai", "AE", maps_api=places.SamplePlaces(log=quiet), social_api=social.SampleSocial(log=quiet), log=quiet)

    def next_day(self):
        u = places.usage()
        u.pop("days", None)
        places._save_usage(u)

    def test_only_businesses_that_pass_every_rule_become_leads(self):
        out = self.run_edith()
        self.assertEqual(out["qualified"], 20)
        self.assertTrue(out["done"])
        names = {b.lead()["name"] for b in pipeline.in_stage("leads")}
        for good in ("Velvet Nail Lounge", "Al Noor Ladies Salon", "Twin Search Beauty", "Ladies Touch Salon", "Hair by Hana"):
            self.assertIn(good, names)
        for bad in ("Luna Hair Studio", "New Nails Studio", "Mystery Nails", "Home Glam by Sara", "Old Town Barbers", "Sleepy Salon",
                    "Hidden Site Beauty", "Gone Nails", "Corner Barber", "Bliss Nails Mirdif", "Quick Nails"):
            self.assertNotIn(bad, names)

    def test_profiles_google_doesnt_list_are_found_by_name(self):
        self.run_edith()
        lead = next(b.lead() for b in pipeline.in_stage("leads") if b.lead()["name"] == "Ladies Touch Salon")
        self.assertEqual(lead["instagram"], "https://instagram.com/ladiestouch.dxb")

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
        for reason in ("has a website: 7", "too few Google reviews: 4", "last post too long ago: 3", "no street address: 1",
                       "website in bio: 1", "no social media found: 2", "doesn&#x27;t exist any more: 1", "closed: 1"):
            self.assertIn(reason, page)

    def test_running_the_same_city_again_adds_nobody_twice(self):
        self.run_edith()
        again = self.run_edith()
        self.assertEqual(again["kept"], [])
        self.assertEqual(len(pipeline.in_stage("leads")), 20)

    def test_daily_caps_pause_the_city_and_the_next_day_carries_on(self):
        first = self.run_edith(max_profile_checks_per_day=8)
        self.assertFalse(first["done"])
        self.assertGreater(first["pending"], 0)
        self.assertLessEqual(len(first["kept"]), 8)
        self.assertFalse(edith.load_run("salon", "Dubai", "AE", sample=True)["done"])
        self.assertEqual(edith.open_runs(), [])        # sample runs never get carried on by "today"
        total = len(first["kept"])
        for _ in range(5):
            self.next_day()
            out = self.run_edith(max_profile_checks_per_day=8)
            total += len(out["kept"])
            if out["done"]:
                break
        self.assertTrue(out["done"])
        self.assertEqual(total, 20)
        self.assertEqual(edith.open_runs(), [])

    def test_never_more_than_the_city_number_and_the_best_go_first(self):
        out = self.run_edith(leads_per_city=5)
        self.assertEqual(len(out["kept"]), 5)
        self.assertIn("over the number of leads for this city: 15", Path(out["report"]).read_text(encoding="utf-8"))

    def test_the_rules_are_read_from_the_file(self):
        out = self.run_edith(min_reviews=500)
        self.assertLess(out["qualified"], 20)
        for b in pipeline.in_stage("leads"):
            self.assertGreaterEqual(b.lead()["review_count"], 500)

    def test_samples_can_be_cleared_out(self):
        self.run_edith()
        for b in pipeline.samples():
            pipeline.remove(b.key)
        self.assertEqual(pipeline.everyone(), [])


def google(places_list=None, token=None, status=200):
    return mock.Mock(status_code=status, text="err", json=lambda: {"places": places_list or [], **({"nextPageToken": token} if token else {})})


class LiveGoogle(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.patch = mock.patch.object(pipeline, "ROOT", Path(self.tmp.name))
        self.patch.start()

    def tearDown(self):
        self.patch.stop()
        self.tmp.cleanup()

    def test_no_key_no_run(self):
        with mock.patch.dict("os.environ", {"GOOGLE_PLACES_KEY": ""}):
            with self.assertRaises(places.PlacesError):
                places.LivePlaces()

    def test_each_search_asks_for_the_right_fields_inside_the_map_tile(self):
        api = places.LivePlaces(key="k", log=quiet)
        with mock.patch.object(places.requests, "post", side_effect=[google([{"id": "a"}] * 20, token="t2"), google([{"id": "b"}])]) as post:
            found = api.sweep("nail salon", (25.0, 55.0, 25.4, 55.5), "ae")
        self.assertEqual(len(found), 21)
        first, second = post.call_args_list
        self.assertEqual(first.kwargs["headers"]["X-Goog-Api-Key"], "k")
        for f in ("places.websiteUri", "places.userRatingCount", "places.internationalPhoneNumber", "nextPageToken"):
            self.assertIn(f, first.kwargs["headers"]["X-Goog-FieldMask"])
        body = first.kwargs["json"]
        self.assertEqual(body["textQuery"], "nail salon")
        self.assertEqual(body["regionCode"], "AE")
        self.assertEqual(body["locationRestriction"]["rectangle"]["low"], {"latitude": 25.0, "longitude": 55.0})
        self.assertEqual(second.kwargs["json"]["pageToken"], "t2")
        self.assertEqual(places.this_month("search"), 2)

    def test_a_full_answer_splits_the_map_in_four(self):
        api = places.LivePlaces(key="k", max_depth=1, log=quiet)
        full = [google([{"id": f"x{i}"} for i in range(20)], token="more")] * 2 + [google([{"id": "last"}] * 20)]
        small = [google([{"id": "s"}])] * 4
        with mock.patch.object(places.requests, "post", side_effect=full + small) as post:
            api.sweep("barber shop", (0, 0, 1, 1), "AE")
        self.assertEqual(post.call_count, 7)

    def test_the_free_allowance_is_never_passed_unless_allowed(self):
        places._save_usage({places.datetime.now().strftime("%Y-%m"): {"search": 1000}})
        with mock.patch.object(places.requests, "post") as post:
            with self.assertRaises(places.OverBudget):
                places.LivePlaces(key="k", free_only=True, log=quiet)._query("x", (0, 0, 1, 1), "AE")
            post.assert_not_called()

    def test_paid_searches_stop_at_the_cap(self):
        places._save_usage({places.datetime.now().strftime("%Y-%m"): {"search": 1000}})
        api = places.LivePlaces(key="k", free_only=False, max_usd=0.08, log=quiet)
        with mock.patch.object(places.requests, "post", return_value=google([{"id": "a"}], token="more")) as post:
            with self.assertRaises(places.OverBudget):
                api._query("x", (0, 0, 1, 1), "AE")
        self.assertEqual(post.call_count, 2)            # 2 x $0.035 fits under $0.08, a third doesn't
        self.assertAlmostEqual(api.spent, 0.07)
        self.assertAlmostEqual(places.month_cost(), 0.07)


class LiveSocial(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.patch = mock.patch.object(pipeline, "ROOT", Path(self.tmp.name))
        self.patch.start()

    def tearDown(self):
        self.patch.stop()
        self.tmp.cleanup()

    def test_codex_searches_the_web_and_answers_in_the_schema(self):
        seen = {}

        def fake(cmd, input, **kw):
            seen["cmd"], seen["prompt"] = cmd, input
            Path(cmd[cmd.index("-o") + 1]).write_text(json.dumps({"results": [{"id": "p1", "instagram": "@glow", "facebook": None,
                                                                                "tiktok": None, "website": None}]}), encoding="utf-8")
            return mock.Mock(returncode=0, stdout="", stderr="")

        with mock.patch.object(social.shutil, "which", return_value="codex"):
            out = social.LiveSocial(log=quiet, runner=fake).find([{"id": "p1", "name": "Glow", "address": "Dubai"}])
        self.assertEqual(out["p1"]["instagram"], "@glow")
        self.assertIn("--search", seen["cmd"])
        self.assertIn("--output-schema", seen["cmd"])
        self.assertIn("id p1: Glow, Dubai", seen["prompt"])
        self.assertEqual(social.used_today("name_searches"), 1)

    def test_claude_reads_profiles_in_chrome_read_only(self):
        seen = {}

        def fake(cmd, input, **kw):
            seen["cmd"], seen["prompt"] = cmd, input
            answer = {"profiles": [{"platform": "instagram", "handle": "Glow", "exists": True, "last_post": "2026-10-20", "followers": 900, "bio_url": None}]}
            return mock.Mock(returncode=0, stdout=json.dumps({"result": "", "structured_output": answer}), stderr="")

        with mock.patch.object(social.shutil, "which", return_value="claude"):
            out = social.LiveSocial(log=quiet, runner=fake).check([("instagram", "glow")])
        self.assertEqual(out[("instagram", "glow")]["followers"], 900)
        self.assertIn("--chrome", seen["cmd"])
        self.assertIn("mcp__claude-in-chrome__*", seen["cmd"])
        self.assertIn("never log", seen["prompt"])
        self.assertIn("https://www.instagram.com/glow/", seen["prompt"])

    def test_an_expired_login_says_how_to_fix_it(self):
        fake = lambda cmd, input, **kw: mock.Mock(returncode=0, stdout=json.dumps({"is_error": True, "result": "OAuth session expired"}), stderr="")  # noqa: E731
        with mock.patch.object(social.shutil, "which", return_value="claude"):
            with self.assertRaisesRegex(social.SocialError, "/login"):
                social.LiveSocial(log=quiet, runner=fake).check([("instagram", "glow")])


if __name__ == "__main__":
    unittest.main()
