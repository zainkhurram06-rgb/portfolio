"""
Turns a business's own media into their website's look. Plain code, no AI:

    logo     their profile picture
    palette  colours taken from the logo first, then their photos, adjusted so
             white text on buttons and dark text on the page stay readable
    photos   the best of their posts: big enough, sharp, not too dark or washed
             out, no near-duplicates. the widest good one leads the page
    video    their best reel, played silently behind the headline
"""

from colorsys import rgb_to_hls
from dataclasses import dataclass, field
from pathlib import Path
from typing import Dict, List, Optional, Tuple

from PIL import Image, ImageFilter, ImageStat

RGB = Tuple[int, int, int]

MIN_SIDE = 600          # smaller than this looks soft on a website
MAX_PHOTOS = 9


@dataclass
class Branding:
    logo: Optional[Path] = None
    palette: Optional[Dict[str, str]] = None
    hero: Optional[Path] = None
    gallery: List[Path] = field(default_factory=list)
    video: Optional[Path] = None
    skipped: List[str] = field(default_factory=list)     # why photos were left out


# ---------------------------------------------------------------- colour

def hexc(c: RGB) -> str:
    return "#%02x%02x%02x" % tuple(max(0, min(255, int(round(v)))) for v in c)


def _lum(c: RGB) -> float:
    def ch(v):
        v /= 255
        return v / 12.92 if v <= 0.03928 else ((v + 0.055) / 1.055) ** 2.4
    r, g, b = c
    return 0.2126 * ch(r) + 0.7152 * ch(g) + 0.0722 * ch(b)


def contrast(a: RGB, b: RGB) -> float:
    la, lb = sorted((_lum(a), _lum(b)), reverse=True)
    return (la + 0.05) / (lb + 0.05)


def _mix(a: RGB, b: RGB, t: float) -> RGB:
    return tuple(a[i] + (b[i] - a[i]) * t for i in range(3))  # type: ignore[return-value]


def _darken_until(c: RGB, against: RGB, ratio: float) -> RGB:
    for _ in range(20):
        if contrast(c, against) >= ratio:
            break
        c = _mix(c, (0, 0, 0), 0.12)
    return c


def colours(path: Path, n: int = 8) -> List[Tuple[int, RGB]]:
    """The main colours in an image, most common first, with how many pixels each covers."""
    with Image.open(path) as src:
        img = src.convert("RGB")
    img.thumbnail((160, 160))
    q = img.quantize(colors=n, method=Image.Quantize.MEDIANCUT)
    pal = q.getpalette()[: n * 3]
    counts = sorted(q.getcolors(), reverse=True)
    return [(count, tuple(pal[i * 3: i * 3 + 3])) for count, i in counts]  # type: ignore[misc]


def _vivid(c: RGB) -> float:
    h, l, s = rgb_to_hls(*(v / 255 for v in c))
    return s * (1 - abs(l - 0.5) * 2)          # saturated and not too dark or light


def _hue(c: RGB) -> float:
    return rgb_to_hls(*(v / 255 for v in c))[0]


def palette(logo: Optional[Path], photos: List[Path]) -> Optional[Dict[str, str]]:
    found: List[Tuple[float, RGB]] = []
    for weight, p in [(3.0, logo)] + [(1.0, p) for p in photos[:6]]:
        if p:
            total = 160 * 160
            found += [(weight * count / total, c) for count, c in colours(p)]
    if not found:
        return None
    # the brand colour: common and vivid. black and white logos have none
    score = lambda x: x[0] * (0.15 + _vivid(x[1]))                     # noqa: E731
    ranked = sorted(found, key=score, reverse=True)
    vivid = [(score(x), x[1]) for x in ranked if _vivid(x[1]) > 0.18]
    logo_main = next((c for _, c in (colours(logo) if logo else []) if _lum(c) < 0.85), None)
    if logo_main and _lum(logo_main) < 0.03:
        # a black logo (black and gold, black and white): black leads, their
        # strongest colour becomes the accent
        primary = logo_main
        accent = vivid[0][1] if vivid else (200, 200, 200)
    elif vivid:
        primary = vivid[0][1]
        # a second colour only if it's really part of the brand, not a stray tint
        accent = next((c for s, c in vivid[1:] if abs(_hue(c) - _hue(primary)) > 0.06 and s >= vivid[0][0] * 0.25), None) \
            or _mix(primary, (255, 255, 255), 0.45)
    else:
        primary = min((c for _, c in found), key=_lum)
        accent = next((c for w, c in ranked if _lum(c) > 0.2), (200, 200, 200))
    white, near_black = (255, 255, 255), (17, 17, 17)
    primary = _darken_until(primary, white, 3.0)                     # white button text stays readable
    dark = _darken_until(_mix(primary, near_black, 0.82), white, 12)  # body text, a touch of brand
    light = _mix(primary, white, 0.94)
    return {"primary": hexc(primary), "accent": hexc(accent), "dark": hexc(dark), "light": hexc(light)}


# ---------------------------------------------------------------- photos

def _sharpness(img: Image.Image) -> float:
    g = img.convert("L")
    g.thumbnail((500, 500))
    return ImageStat.Stat(g.filter(ImageFilter.FIND_EDGES)).var[0]


def _ahash(img: Image.Image) -> int:
    g = img.convert("L").resize((8, 8))
    px = list(g.getdata())
    avg = sum(px) / 64
    return sum(1 << i for i, v in enumerate(px) if v > avg)


def photo_check(path: Path) -> Tuple[Optional[float], str]:
    """A score for how good a photo is on a website, or None and the reason it's out."""
    try:
        with Image.open(path) as src:
            img = src.copy()
    except Exception:
        return None, "not a readable image"
    w, h = img.size
    if min(w, h) < MIN_SIDE:
        return None, f"too small ({w}x{h})"
    bright = ImageStat.Stat(img.convert("L")).mean[0]
    if bright < 35:
        return None, "too dark"
    if bright > 235:
        return None, "washed out"
    sharp = _sharpness(img)
    if sharp < 4:
        return None, "blurry"
    return min(w, h) / 1000 + min(sharp, 60) / 30 + (0.3 if w > h else 0), ""


def _size(path: Path) -> Tuple[int, int]:
    with Image.open(path) as img:
        return img.size


def pick_photos(files: List[Path]) -> Tuple[Optional[Path], List[Path], List[str]]:
    good, skipped, seen = [], [], []
    for f in files:
        score, why = photo_check(f)
        if score is None:
            skipped.append(f"{f.name}: {why}")
            continue
        with Image.open(f) as img:
            h = _ahash(img)
        if any(bin(h ^ s).count("1") <= 4 for s in seen):
            skipped.append(f"{f.name}: same as another photo")
            continue
        seen.append(h)
        good.append((score, f))
    good.sort(key=lambda x: x[0], reverse=True)
    ordered = [f for _, f in good][:MAX_PHOTOS]
    wide = [f for f in ordered if _size(f)[0] >= _size(f)[1]]
    hero = wide[0] if wide else (ordered[0] if ordered else None)
    return hero, [f for f in ordered if f != hero], skipped


# ---------------------------------------------------------------- all of it

def brand(research_dir: Path, research) -> Branding:
    """research: a research.Research. Paths in it are relative to research_dir."""
    out = Branding()
    if research.profile and research.profile.profile_pic:
        p = research_dir / research.profile.profile_pic
        if p.exists():
            out.logo = p
    photos = [research_dir / p.file for p in research.posts if p.kind == "photo" and p.file and (research_dir / p.file).exists()]
    out.hero, out.gallery, out.skipped = pick_photos(photos)
    videos = sorted((p for p in research.posts if p.kind == "video" and p.file and (research_dir / p.file).exists()),
                    key=lambda p: p.likes or 0, reverse=True)
    out.video = research_dir / videos[0].file if videos else None
    out.palette = palette(out.logo, ([out.hero] if out.hero else []) + out.gallery)
    return out
