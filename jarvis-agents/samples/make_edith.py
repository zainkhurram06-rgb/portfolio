"""
Makes EDITH's sample data: made-up Dubai salons covering every case she has to
handle, in the shapes the real tools give back.

    samples/edith/places.json     Google Places API answers, by search term
    samples/edith/found.json      what Codex finds when it searches a business by name
    samples/edith/profiles.json   what Claude reads off each social profile in Chrome

Dates are written as {days_ago:N} so they never go stale.

    .venv\\Scripts\\python samples\\make_edith.py
"""

import json
import random
from pathlib import Path

OUT = Path(__file__).resolve().parent / "edith"
rnd = random.Random(7)

AREAS = ["Jumeirah 1", "JLT Cluster D", "Al Barsha 1", "Business Bay", "Dubai Marina", "Al Wasl Road", "Karama", "Mirdif", "Deira", "JVC"]
TERMS = ["hair salon", "nail salon", "beauty salon", "barber shop", "lash and brow studio"]
CATEGORY = {"hair salon": "Hair salon", "nail salon": "Nail salon", "beauty salon": "Beauty salon",
            "barber shop": "Barber shop", "lash and brow studio": "Eyelash salon"}

places = {t: [] for t in TERMS}
found, profiles = {}, {}
n = 0


def place(name, term, website=None, reviews=120, stars=4.6, phone=True, street=True, closed=False, pid=None):
    global n
    n += 1
    area = AREAS[n % len(AREAS)]
    comps = [{"longText": area, "shortText": area, "types": ["sublocality", "political"]},
             {"longText": "Dubai", "shortText": "Dubai", "types": ["locality", "political"]},
             {"longText": "United Arab Emirates", "shortText": "AE", "types": ["country", "political"]}]
    if street:
        comps = [{"longText": f"Shop {n}", "shortText": f"Shop {n}", "types": ["subpremise"]},
                 {"longText": f"{area} Street", "shortText": f"{area} St", "types": ["route"]}] + comps
    p = {
        "id": pid or f"ChIJsample{n:04d}",
        "displayName": {"text": name, "languageCode": "en"},
        "primaryTypeDisplayName": {"text": CATEGORY[term], "languageCode": "en"},
        "formattedAddress": (f"Shop {n}, {area} Street, {area}, Dubai, United Arab Emirates" if street else "Dubai, United Arab Emirates"),
        "addressComponents": comps,
        "businessStatus": "CLOSED_PERMANENTLY" if closed else "OPERATIONAL",
        "rating": stars, "userRatingCount": reviews,
        "googleMapsUri": f"https://maps.google.com/?cid={1000 + n}",
    }
    if phone:
        p["internationalPhoneNumber"] = f"+971 4 555 {1000 + n:04d}"
        p["nationalPhoneNumber"] = f"04 555 {1000 + n:04d}"
    if website:
        p["websiteUri"] = website
    places[term].append(p)
    return p


def ig(user, days_ago, followers=2500, bio=None, exists=True):
    profiles[f"instagram:{user}"] = {"exists": exists, "last_post": f"{{days_ago:{days_ago}}}" if exists and days_ago is not None else None,
                                     "followers": followers if exists else None, "bio_url": bio}


def fb(page, days_ago):
    profiles[f"facebook:{page.lower()}"] = {"exists": True, "last_post": f"{{days_ago:{days_ago}}}", "followers": None, "bio_url": None}


# good leads: their Instagram is the "website" on Google, and they post often
good = [("Velvet Nail Lounge", "nail salon"), ("Amber Hair Studio", "hair salon"), ("Fade Kings Barbers", "barber shop"),
        ("Lush Lash Bar", "lash and brow studio"), ("Rose and Gold Beauty", "beauty salon"), ("Nailed It JLT", "nail salon"),
        ("Studio Mira Hair", "hair salon"), ("The Gent's Chair", "barber shop"), ("Brow Theory", "lash and brow studio"),
        ("Glow Up Beauty Lounge", "beauty salon"), ("Polished Nail Bar", "nail salon"), ("Curl Club Dubai", "hair salon"),
        ("Sharp Line Barbers", "barber shop"), ("Silk Beauty Spa", "beauty salon")]
for name, term in good:
    user = name.lower().replace("'", "").replace(" ", ".")[:28]
    place(name, term, website=f"https://www.instagram.com/{user}/", reviews=rnd.randint(55, 900), stars=round(rnd.uniform(4.2, 4.9), 1))
    ig(user, days_ago=rnd.randint(0, 12), followers=rnd.randint(800, 25000))

# good leads found through their Facebook page
for name, term in [("Al Noor Ladies Salon", "beauty salon"), ("Classic Cuts Karama", "barber shop"), ("Pearl Hair and Beauty", "hair salon")]:
    page = name.replace(" ", "")
    place(name, term, website=f"https://www.facebook.com/{page}", reviews=rnd.randint(60, 400))
    fb(page, days_ago=rnd.randint(1, 10))

# no social link on Google at all: most real ones look like this, so Codex searches by name
place("Ladies Touch Salon", "beauty salon", reviews=240)
found["Ladies Touch Salon"] = {"instagram": "@ladiestouch.dxb", "facebook": None, "tiktok": None, "website": None}
ig("ladiestouch.dxb", 4, followers=3100)
place("Hair by Hana", "hair salon", website="https://linktr.ee/hairbyhana", reviews=130)        # a link page is not a website
found["Hair by Hana"] = {"instagram": "https://www.instagram.com/hairbyhana/", "facebook": None, "tiktok": None, "website": None}
ig("hairbyhana", 2, followers=9800)
place("Corner Barber", "barber shop", reviews=88)                                               # nothing anywhere
place("Bliss Nails Mirdif", "nail salon", website="https://www.fresha.com/a/bliss-nails-dubai", reviews=97)
place("Quick Nails", "nail salon", reviews=310)                                                  # search finds a website
found["Quick Nails"] = {"instagram": "quicknails", "facebook": None, "tiktok": None, "website": "https://quicknails.ae"}

# real websites on Google: out
for name, term, site in [("Luna Hair Studio", "hair salon", "https://lunahair.ae"), ("The Nail Spa", "nail salon", "https://thenailspa.com"),
                         ("Blade and Co", "barber shop", "https://bladeandco.ae"), ("Lash Atelier", "lash and brow studio", "https://lashatelier.com"),
                         ("Serene Beauty", "beauty salon", "https://serenebeauty.ae"), ("Trim Barbers", "barber shop", "http://www.trimbarbers.com")]:
    place(name, term, website=site, reviews=rnd.randint(80, 1500))

# too few reviews
for name, term in [("New Nails Studio", "nail salon"), ("Hair Lab Deira", "hair salon"), ("Brow Bar JVC", "lash and brow studio"), ("Fresh Fade", "barber shop")]:
    user = name.lower().replace(" ", ".")
    place(name, term, website=f"https://instagram.com/{user}", reviews=rnd.randint(3, 45))

# no phone, no street address (home-based), closed
place("Mystery Nails", "nail salon", website="https://instagram.com/mystery.nails", phone=False)
place("Home Glam by Sara", "beauty salon", website="https://instagram.com/homeglam.sara", street=False)
place("Old Town Barbers", "barber shop", website="https://instagram.com/oldtown.barbers", closed=True)

# quiet on social media: last post weeks ago
for name, term, days in [("Sleepy Salon", "hair salon", 40), ("Faded Nails", "nail salon", 25), ("Quiet Cuts", "barber shop", 90)]:
    user = name.lower().replace(" ", ".")
    place(name, term, website=f"https://instagram.com/{user}", reviews=rnd.randint(60, 300))
    ig(user, days_ago=days)

# a website hidden in their Instagram bio, and an Instagram that doesn't exist any more
place("Hidden Site Beauty", "beauty salon", website="https://instagram.com/hiddensite.beauty", reviews=210)
ig("hiddensite.beauty", 2, bio="https://hiddensitebeauty.com")
place("Gone Nails", "nail salon", website="https://instagram.com/gone.nails", reviews=150)
ig("gone.nails", None, exists=False)

# the same salon found by two searches
dup = place("Twin Search Beauty", "beauty salon", website="https://instagram.com/twin.search", reviews=320, pid="ChIJsampleDUP1")
ig("twin.search", 3, followers=5400)
places["hair salon"].append(dup)

OUT.mkdir(exist_ok=True)
for name, data in [("places", places), ("found", found), ("profiles", profiles)]:
    (OUT / f"{name}.json").write_text(json.dumps(data, indent=1, ensure_ascii=False) + "\n", encoding="utf-8")
print(f"{sum(len(v) for v in places.values())} places, {len(found)} name searches, {len(profiles)} profiles")
