"""MARK's research, branding and build steps, with no internet and no platform.
Run:  python -m unittest agents.mark.test_work"""

import json
import subprocess
import tempfile
import unittest
from pathlib import Path
from unittest import mock

from PIL import Image

from agents import pipeline
from agents.mark import branding, research as rs, work

SAMPLES = Path(__file__).resolve().parents[2] / "samples"
GLOW = json.loads((SAMPLES / "leads" / "glow-lab-nails.json").read_text(encoding="utf-8"))
SHINE = json.loads((SAMPLES / "leads" / "shine-kings-detailing.json").read_text(encoding="utf-8"))
FADI = json.loads((SAMPLES / "leads" / "fadi-plumbing.json").read_text(encoding="utf-8"))


class InTempPipeline(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        root = Path(self.tmp.name)
        self.patches = [mock.patch.object(pipeline, "ROOT", root), mock.patch.object(rs, "PIPELINE_ROOT", root)]
        for p in self.patches:
            p.start()

    def tearDown(self):
        for p in self.patches:
            p.stop()
        self.tmp.cleanup()


class Research(InTempPipeline):
    def test_sample_research_is_matched_by_social_handle(self):
        b = pipeline.add(GLOW)
        b = work.research_stage(b, "sample", log=lambda m: None)
        self.assertEqual(b.stage, "2-researched")
        r = rs.load(b)
        self.assertIn("Gel mani 120 AED", r.profile.bio)
        self.assertTrue(b.file("research", "media", "logo.jpg").exists())
        self.assertIn("researched (sample)", b.history()[-1])

    def test_handles_come_from_any_social_link(self):
        self.assertEqual(rs.handles({"instagram": "https://www.instagram.com/glowlab.nails/", "facebook": "facebook.com/fadiplumbing"}),
                         ["glowlab.nails", "fadiplumbing"])
        self.assertEqual(rs.handles({"tiktok": "https://tiktok.com/@shinekings"}), ["shinekings"])

    def test_research_only_works_on_new_leads(self):
        b = pipeline.move(pipeline.add(GLOW).key, "approved")
        with self.assertRaises(pipeline.PipelineError):
            work.research_stage(b, "sample", log=lambda m: None)

    def test_chrome_research_downloads_what_it_found(self):
        answer = {"structured_output": {
            "profile": {"platform": "instagram", "handle": "glowlab.nails", "bio": "Gel 120 AED", "profile_pic_url": "https://cdn.example/pic.jpg"},
            "posts": [{"kind": "photo", "media_url": "https://cdn.example/1.jpg", "caption": "chrome french"},
                      {"kind": "video", "caption": "blob only, can't download"}],
        }}
        ran = {}

        def fake_cli(cmd, **kw):
            ran["cmd"] = cmd
            return subprocess.CompletedProcess(cmd, 0, stdout=json.dumps(answer), stderr="")

        jpg = mock.Mock(status_code=200, headers={"content-type": "image/jpeg"}, content=b"\xff\xd8\xff fake", raise_for_status=lambda: None)
        b = pipeline.add(GLOW)
        with mock.patch.object(rs.shutil, "which", return_value="claude"), mock.patch.object(rs.requests, "get", return_value=jpg):
            r = rs.from_chrome(b, log=lambda m: None, runner=fake_cli)
        self.assertIn("--chrome", ran["cmd"])
        self.assertEqual(ran["cmd"][ran["cmd"].index("--model") + 1], rs.CLAUDE_MODEL)
        self.assertEqual(r.profile.profile_pic, "media/logo.jpg")
        self.assertEqual([p.file for p in r.posts], ["media/post-1.jpg", None])

    def test_a_logged_out_cli_says_so(self):
        out = json.dumps({"is_error": True, "subtype": "success", "result": "Failed to authenticate: OAuth session expired"})
        with self.assertRaises(rs.ResearchError) as e:
            rs._parse_cli(out)
        self.assertIn("OAuth session expired", str(e.exception))

    def test_chrome_research_stops_at_the_daily_cap(self):
        b = pipeline.add(GLOW)
        with mock.patch.object(rs, "DAILY_CAP", 0):
            with self.assertRaises(rs.ResearchError) as e:
                rs.from_chrome(b, log=lambda m: None)
        self.assertIn("daily research cap", str(e.exception))


class Branding(unittest.TestCase):
    def brand(self, handle):
        d = SAMPLES / "research" / handle
        return branding.brand(d, rs.Research.model_validate_json((d / "research.json").read_text(encoding="utf-8")))

    def test_bad_photos_are_left_out(self):
        self.assertTrue(any("too small" in s for s in self.brand("glowlab.nails").skipped))
        self.assertTrue(any("too dark" in s for s in self.brand("shinekings.detailing").skipped))

    def test_the_lead_photo_is_wide_and_the_reel_is_found(self):
        b = self.brand("glowlab.nails")
        w, h = branding._size(b.hero)
        self.assertGreaterEqual(w, h)
        self.assertEqual(b.video.name, "reel-1.mp4")
        self.assertEqual(b.logo.name, "logo.jpg")

    def test_colours_come_from_the_brand_and_stay_readable(self):
        glow = self.brand("glowlab.nails").palette
        self.assertGreater(int(glow["primary"][1:3], 16), 180)            # their pink, red channel high
        shine = self.brand("shinekings.detailing").palette
        self.assertLess(branding._lum(tuple(int(shine["primary"][i:i + 2], 16) for i in (1, 3, 5))), 0.03)   # black leads
        for p in (glow, shine, self.brand("fadiplumbing").palette):
            rgb = {k: tuple(int(v[i:i + 2], 16) for i in (1, 3, 5)) for k, v in p.items()}
            self.assertGreaterEqual(branding.contrast(rgb["primary"], (255, 255, 255)), 3)   # white button text
            self.assertGreaterEqual(branding.contrast(rgb["dark"], rgb["light"]), 7)         # body text

    def test_duplicate_photos_count_once(self):
        with tempfile.TemporaryDirectory() as d:
            src = SAMPLES / "research" / "glowlab.nails" / "media" / "post-1.jpg"
            a, b = Path(d) / "a.jpg", Path(d) / "b.jpg"
            Image.open(src).save(a)
            Image.open(src).save(b, quality=70)
            hero, gallery, skipped = branding.pick_photos([a, b])
            self.assertEqual(len([x for x in [hero, *gallery] if x]), 1)
            self.assertIn("same as another photo", skipped[0])


class Build(InTempPipeline):
    def build(self, lead, plan):
        b = work.research_stage(pipeline.add(lead), "sample", log=lambda m: None)
        uploads, created = [], {}

        def upload(folder, f):
            uploads.append(f.name)
            return f"http://localhost:3000/media/{folder}/{f.name}"

        def create(payload):
            created.update(payload)
            return {"slug": "x", "site": "http://localhost:3000/s/x", "login": {"email": "demo+x@demo.local", "password": "p"}}

        def export(slug):
            c = created["content"]
            return f'<html><img src="{c["logoUrl"]}"><img src="{c["heroImage"]}"><a href="http://localhost:3000/s/x/book">Book</a></html>'

        done = work.build_stage(b, brains=f"file:{SAMPLES / 'plans' / plan}", label_brains="file:x",
                                log=lambda m: None, upload=upload, export=export, create=create)
        return done, uploads, created

    def test_a_researched_business_becomes_a_website_file(self):
        b, uploads, payload = self.build(GLOW, "glow-lab-nails.json")
        self.assertEqual(b.stage, "3-demo-built")
        html = b.file("site", "index.html").read_text(encoding="utf-8")
        self.assertIn('src="media/logo.jpg"', html)
        self.assertIn("http://localhost:3000/s/x/book", html)                 # booking stays live
        for name in uploads:
            self.assertTrue(b.file("site", "media", name).exists(), name)
        self.assertIn("hero-video.mp4", uploads)
        build = b.build()
        self.assertEqual(build["template"], payload["theme"])
        self.assertTrue(build["media"]["video"])
        self.assertIn("built with the", b.history()[-1])

    def test_facts_come_from_research_not_the_ai(self):
        _, _, payload = self.build(SHINE, "shine-kings-detailing.json")
        self.assertEqual(payload["phone"], "+1 832 555 0177")                 # from their Google listing
        self.assertEqual(payload["content"]["rating"], 4.9)
        self.assertEqual(payload["content"]["reviews"][0]["author"], "Derek M.")
        self.assertEqual(payload["content"]["palette"]["primary"], branding.brand(
            SAMPLES / "research" / "shinekings.detailing",
            rs.Research.model_validate_json((SAMPLES / "research" / "shinekings.detailing" / "research.json").read_text(encoding="utf-8"))).palette["primary"])

    def test_phone_is_taken_from_the_bio_when_there_is_no_listing(self):
        _, _, payload = self.build(GLOW, "glow-lab-nails.json")
        self.assertEqual(payload["phone"], "+971 50 555 0199")

    def test_no_photos_means_no_photo_led_design(self):
        b = work.research_stage(pipeline.add(FADI), "sample", log=lambda m: None)
        # take away their one photo
        r = rs.load(b)
        r.posts = []
        rs._save(b, r)
        _, _, payload = self._build_existing()
        from agents.mark import templates
        self.assertFalse(templates.BY_ID[payload["theme"]].get("needsPhoto"))
        self.assertIsNone(payload["content"]["heroImage"])

    def _build_existing(self):
        b = pipeline.in_stage("researched")[0]
        uploads, created = [], {}
        done = work.build_stage(b, brains=f"file:{SAMPLES / 'plans' / 'fadi-plumbing.json'}", label_brains="file:x", log=lambda m: None,
                                upload=lambda folder, f: uploads.append(f.name) or f"http://h/media/{folder}/{f.name}",
                                export=lambda slug: "<html></html>",
                                create=lambda p: created.update(p) or {"slug": "x", "site": "http://h/s/x"})
        return done, uploads, created


if __name__ == "__main__":
    unittest.main()
