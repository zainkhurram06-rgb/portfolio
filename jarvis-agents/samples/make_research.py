"""
Makes the sample research MARK uses until real research runs: three made-up
businesses with no website, their leads, and fake "downloaded" social media
(logo, post photos, a reel). Some photos are deliberately bad (tiny, blurry,
too dark) so MARK's photo picking gets tested.

    .venv\\Scripts\\python samples\\make_research.py
"""

import json
import random
import re
import shutil
import subprocess
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter

HERE = Path(__file__).resolve().parent
RESEARCH = HERE / "research"
LEADS = HERE / "leads"


def slug(text):
    return re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")


def gradient(size, a, b, seed):
    rnd = random.Random(seed)
    w, h = size
    img = Image.new("RGB", size, a)
    d = ImageDraw.Draw(img)
    for y in range(h):
        t = y / h
        d.line([(0, y), (w, y)], fill=tuple(int(a[i] + (b[i] - a[i]) * t) for i in range(3)))
    for _ in range(5):
        r = rnd.randint(w // 10, w // 3)
        x, y = rnd.randint(0, w), rnd.randint(0, h)
        tint = tuple(min(255, c + rnd.randint(-40, 60)) for c in rnd.choice([a, b]))
        d.ellipse([x - r, y - r, x + r, y + r], fill=tint)
    return img.filter(ImageFilter.GaussianBlur(2))


def logo(path, colour, letters):
    img = Image.new("RGB", (320, 320), (255, 255, 255))
    d = ImageDraw.Draw(img)
    d.ellipse([10, 10, 310, 310], fill=colour)
    d.text((160, 160), letters, fill=(255, 255, 255), anchor="mm", font_size=110)
    img.save(path, quality=90)


def reel(path, colour):
    hexc = "0x%02x%02x%02x" % colour
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-f", "lavfi", "-i", f"color=c={hexc}:s=540x960:d=4",
                    "-vf", "drawbox=x='t*80':y=300:w=200:h=200:color=white@0.5:t=fill,format=yuv420p",
                    "-c:v", "libx264", "-preset", "veryfast", "-crf", "32", str(path)], check=True)


BUSINESSES = [
    {
        "key": "glowlab.nails",
        "lead": {"name": "Glow Lab Nails", "niche": "salon", "country": "AE", "city": "Dubai",
                 "instagram": "https://instagram.com/glowlab.nails", "notes": "found on Instagram, no website"},
        "brand": ((231, 84, 128), (252, 214, 222)), "letters": "GL", "photos": 9, "reel": True,
        "profile": {"platform": "instagram", "handle": "glowlab.nails", "name": "Glow Lab Nails | Dubai",
                    "bio": "Gel, BIAB & nail art in JLT ✨ Gel mani 120 AED · BIAB 180 AED · Pedi 140 AED · Open daily 10am to 10pm · Book via WhatsApp +971 50 555 0199",
                    "followers": 8400, "category": "Nail salon"},
        "captions": ["Chrome French for a bride this weekend", "BIAB refill, natural and strong", "Spring nail art drop",
                     "Gel pedi + mani combo, 240 AED", "Our cosy studio in JLT", "Ombre pink for Sara", "Nail art Thursday", "Blurry test shot", "Late night set"],
        "google": None,
    },
    {
        "key": "shinekings.detailing",
        "lead": {"name": "Shine Kings Detailing", "niche": "carwash", "country": "US", "city": "Houston",
                 "instagram": "https://instagram.com/shinekings.detailing", "google_maps_url": "https://maps.google.com/?cid=1234567890",
                 "notes": "mobile detailing, no website"},
        "brand": ((20, 20, 24), (212, 175, 55)), "letters": "SK", "photos": 8, "reel": True,
        "profile": {"platform": "instagram", "handle": "shinekings.detailing", "name": "Shine Kings Mobile Detailing",
                    "bio": "Mobile detailing across Houston 🚗 We come to you. Interior $120 · Full detail from $220 · Ceramic coating DM for quote",
                    "followers": 3100, "category": "Car wash"},
        "captions": ["Before and after on this Tahoe", "Ceramic coating on a black Model 3", "Interior reset, dog hair gone",
                     "Wheels and tyres done right", "Full detail at a client's driveway", "Foam party", "Too dark shot", "Paint correction"],
        "google": {"name": "Shine Kings Mobile Detailing", "rating": 4.9, "review_count": 37, "phone": "+1 832 555 0177",
                   "address": "Houston, TX (mobile, we come to you)", "category": "Car detailing service",
                   "hours": "Monday to Saturday 8am to 7pm, Sunday closed",
                   "reviews": [{"author": "Derek M.", "rating": 5, "text": "Came to my office and my truck looked brand new by lunch."},
                               {"author": "Alicia R.", "rating": 5, "text": "Got every bit of sand out of my SUV. On time and friendly."},
                               {"author": "Tom P.", "rating": 4, "text": "Great job on the interior, fair price."}]},
    },
    {
        "key": "fadiplumbing",
        "lead": {"name": "Fadi Plumbing", "niche": "homeservices", "country": "AU", "city": "Sydney",
                 "facebook": "https://facebook.com/fadiplumbing", "google_maps_url": "https://maps.google.com/?cid=9876543210",
                 "notes": "Facebook page and Google listing only, no website"},
        "brand": ((30, 90, 160), (240, 245, 250)), "letters": "FP", "photos": 1, "reel": False,
        "profile": {"platform": "facebook", "handle": "fadiplumbing", "name": "Fadi Plumbing",
                    "bio": "Licensed plumber in Western Sydney. Blocked drains, hot water, leaks. Same day service. Call Fadi.",
                    "followers": 420, "category": "Plumbing service"},
        "captions": ["New hot water system in Parramatta"],
        "google": {"name": "Fadi Plumbing", "rating": 4.8, "review_count": 64, "phone": "+61 2 5550 3344",
                   "address": "Parramatta NSW 2150", "category": "Plumber", "hours": "Monday to Saturday 7am to 6pm",
                   "reviews": [{"author": "Jenny K.", "rating": 5, "text": "Fadi fixed our hot water the same afternoon. Honest price."},
                               {"author": "Raj P.", "rating": 5, "text": "Cleared a blocked drain nobody else could. Highly recommend."}]},
    },
]


def make(b):
    out = RESEARCH / b["key"]
    if out.exists():
        shutil.rmtree(out)
    media = out / "media"
    media.mkdir(parents=True)
    a, c = b["brand"]
    logo(media / "logo.jpg", a, b["letters"])
    posts = []
    for i in range(b["photos"]):
        name = f"post-{i + 1}.jpg"
        caption = b["captions"][i]
        if "Blurry" in caption:       # small and soft: should never be picked
            gradient((240, 240), a, c, i).filter(ImageFilter.GaussianBlur(12)).save(media / name, quality=60)
        elif "dark" in caption:       # nearly black: should never be picked
            gradient((1080, 1080), (8, 8, 10), (20, 18, 16), i).save(media / name, quality=80)
        else:
            size = (1440, 1080) if i % 3 == 0 else (1080, 1350)
            gradient(size, a, c, i).save(media / name, quality=85)
        posts.append({"kind": "photo", "file": f"media/{name}", "caption": caption, "likes": 40 + i * 13, "url": f"https://instagram.com/p/sample{i}"})
    if b["reel"]:
        reel(media / "reel-1.mp4", a)
        posts.insert(1, {"kind": "video", "file": "media/reel-1.mp4", "caption": "Watch this one come together", "likes": 310, "url": "https://instagram.com/reel/sample"})
    research = {
        "source": "sample",
        "profile": {**b["profile"], "url": b["lead"].get("instagram") or b["lead"].get("facebook"), "profile_pic": "media/logo.jpg"},
        "posts": posts,
        "google": b["google"],
    }
    (out / "research.json").write_text(json.dumps(research, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    LEADS.mkdir(exist_ok=True)
    (LEADS / f"{slug(b['lead']['name'])}.json").write_text(json.dumps(b["lead"], indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"{b['key']}: {len(posts)} posts")


if __name__ == "__main__":
    for b in BUSINESSES:
        make(b)
