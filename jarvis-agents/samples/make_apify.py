"""
Makes sample Apify results for EDITH: made-up Dubai salons covering every case
she has to handle. Dates are written as {days_ago:N} so they never go stale.

    .venv\\Scripts\\python samples\\make_apify.py
"""

import json
import random
from pathlib import Path

OUT = Path(__file__).resolve().parent / "apify"
rnd = random.Random(7)

AREAS = ["Jumeirah 1", "JLT Cluster D", "Al Barsha 1", "Business Bay", "Dubai Marina", "Al Wasl Road", "Karama", "Mirdif", "Deira", "JVC"]
TERMS = ["hair salon", "nail salon", "beauty salon", "barber shop", "lash and brow studio"]
CATEGORY = {"hair salon": "Hair salon", "nail salon": "Nail salon", "beauty salon": "Beauty salon",
            "barber shop": "Barber shop", "lash and brow studio": "Eyelash salon"}

places, insta, fb = [], [], []
n = 0


def place(name, term, website=None, reviews=120, stars=4.6, phone=True, street=True, closed=False, pid=None):
    global n
    n += 1
    area = AREAS[n % len(AREAS)]
    p = {
        "searchString": term, "title": name, "categoryName": CATEGORY[term], "placeId": pid or f"ChIJsample{n:04d}",
        "url": f"https://www.google.com/maps/place/?q=place_id:ChIJsample{n:04d}",
        "address": f"Shop {n}, {area}, Dubai, United Arab Emirates" if street else "Dubai, United Arab Emirates",
        "street": f"Shop {n}, {area}" if street else None, "city": "Dubai", "countryCode": "AE",
        "phone": f"+971 4 555 {1000 + n:04d}" if phone else None, "website": website,
        "totalScore": stars, "reviewsCount": reviews, "permanentlyClosed": closed, "temporarilyClosed": False,
    }
    places.append(p)
    return p


def ig(user, days_ago, followers=2500, external=None, posts=6):
    insta.append({
        "username": user, "fullName": user.replace(".", " ").title(), "followersCount": followers, "externalUrl": external,
        "biography": "Book via WhatsApp", "isBusinessAccount": True,
        "latestPosts": [{"timestamp": f"{{days_ago:{days_ago + i * 3}}}", "type": "Image"} for i in range(posts)],
    })


def fbpost(page, days_ago):
    fb.append({"facebookUrl": f"https://www.facebook.com/{page}", "pageName": page, "time": f"{{days_ago:{days_ago}}}", "text": "New look today"})


# good leads: Instagram given as their "website" on Google, posting recently
good = [("Velvet Nail Lounge", "nail salon"), ("Amber Hair Studio", "hair salon"), ("Fade Kings Barbers", "barber shop"),
        ("Lush Lash Bar", "lash and brow studio"), ("Rose and Gold Beauty", "beauty salon"), ("Nailed It JLT", "nail salon"),
        ("Studio Mira Hair", "hair salon"), ("The Gent's Chair", "barber shop"), ("Brow Theory", "lash and brow studio"),
        ("Glow Up Beauty Lounge", "beauty salon"), ("Polished Nail Bar", "nail salon"), ("Curl Club Dubai", "hair salon"),
        ("Sharp Line Barbers", "barber shop"), ("Silk Beauty Spa", "beauty salon")]
for i, (name, term) in enumerate(good):
    user = name.lower().replace("'", "").replace(" ", ".")[:28]
    place(name, term, website=f"https://www.instagram.com/{user}/", reviews=rnd.randint(55, 900), stars=round(rnd.uniform(4.2, 4.9), 1))
    ig(user, days_ago=rnd.randint(0, 12), followers=rnd.randint(800, 25000))

# good leads found through their Facebook page
for name, term in [("Al Noor Ladies Salon", "beauty salon"), ("Classic Cuts Karama", "barber shop"), ("Pearl Hair and Beauty", "hair salon")]:
    page = name.replace(" ", "")
    place(name, term, website=f"https://www.facebook.com/{page}", reviews=rnd.randint(60, 400))
    fbpost(page, days_ago=rnd.randint(1, 10))

# a booking page or link-in-bio is not a website, but with no social link they can't be checked
place("Bliss Nails Mirdif", "nail salon", website="https://www.fresha.com/a/bliss-nails-dubai")
place("Hair by Hana", "hair salon", website="https://linktr.ee/hairbyhana")

# real websites: out
for name, term, site in [("Luna Hair Studio", "hair salon", "https://lunahair.ae"), ("The Nail Spa", "nail salon", "https://thenailspa.com"),
                         ("Blade and Co", "barber shop", "https://bladeandco.ae"), ("Lash Atelier", "lash and brow studio", "https://lashatelier.com"),
                         ("Serene Beauty", "beauty salon", "https://serenebeauty.ae"), ("Trim Barbers", "barber shop", "http://www.trimbarbers.com")]:
    place(name, term, website=site, reviews=rnd.randint(80, 1500))

# too few reviews
for name, term in [("New Nails Studio", "nail salon"), ("Hair Lab Deira", "hair salon"), ("Brow Bar JVC", "lash and brow studio"), ("Fresh Fade", "barber shop")]:
    user = name.lower().replace(" ", ".")
    place(name, term, website=f"https://instagram.com/{user}", reviews=rnd.randint(3, 45))
    ig(user, days_ago=2)

# no phone, no street address (home-based), closed
place("Mystery Nails", "nail salon", website="https://instagram.com/mystery.nails", phone=False)
ig("mystery.nails", 1)
place("Home Glam by Sara", "beauty salon", website="https://instagram.com/homeglam.sara", street=False)
ig("homeglam.sara", 1)
place("Old Town Barbers", "barber shop", website="https://instagram.com/oldtown.barbers", closed=True)
ig("oldtown.barbers", 1)

# quiet on social media: last post weeks ago
for name, term, days in [("Sleepy Salon", "hair salon", 40), ("Faded Nails", "nail salon", 25), ("Quiet Cuts", "barber shop", 90)]:
    user = name.lower().replace(" ", ".")
    place(name, term, website=f"https://instagram.com/{user}", reviews=rnd.randint(60, 300))
    ig(user, days_ago=days)

# a website hidden in their Instagram bio, and an Instagram that doesn't exist any more
place("Hidden Site Beauty", "beauty salon", website="https://instagram.com/hiddensite.beauty", reviews=210)
ig("hiddensite.beauty", 2, external="https://hiddensitebeauty.com")
place("Gone Nails", "nail salon", website="https://instagram.com/gone.nails", reviews=150)

# no website and no social link at all on Google
for name, term in [("Corner Barber", "barber shop"), ("Ladies Touch Salon", "beauty salon"), ("Quick Nails", "nail salon")]:
    place(name, term, reviews=rnd.randint(60, 500))

# the same salon found by two searches
dup = place("Twin Search Beauty", "beauty salon", website="https://instagram.com/twin.search", reviews=320, pid="ChIJsampleDUP1")
ig("twin.search", 3, followers=5400)
places.append({**dup, "searchString": "hair salon"})

OUT.mkdir(exist_ok=True)
for name, data in [("crawler-google-places", places), ("instagram-profile-scraper", insta), ("facebook-posts-scraper", fb)]:
    (OUT / f"{name}.json").write_text(json.dumps(data, indent=1, ensure_ascii=False) + "\n", encoding="utf-8")
print(f"{len(places)} places, {len(insta)} Instagram profiles, {len(fb)} Facebook posts")
