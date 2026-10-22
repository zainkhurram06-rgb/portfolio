"""
Pours a SiteConfig into a template and writes a finished, self-contained site.

No AI in here. Given the same config it always produces the same site, so a
demo can be rebuilt or moved to a different template in a second, for free.
"""

import json
import random
import re
import time
from pathlib import Path

from jinja2 import Environment, FileSystemLoader, StrictUndefined, select_autoescape

from .brand import SiteConfig

HERE = Path(__file__).resolve().parent
TEMPLATES = HERE / "templates"
ROOT = HERE.parent.parent
OUT = ROOT / "out" / "sites"


def env():
    return Environment(
        loader=FileSystemLoader(str(TEMPLATES)),
        autoescape=select_autoescape(["html", "j2"]),
        undefined=StrictUndefined,
        trim_blocks=True,
        lstrip_blocks=True,
    )


def templates_for(niche):
    """Every template folder for a niche: clinic, clinic-modern, clinic-bold ..."""
    return sorted(
        p.name for p in TEMPLATES.iterdir()
        if p.is_dir() and (p.name == niche or p.name.startswith(niche + "-"))
        and (p / "index.html.j2").exists()
    )


def all_templates():
    return sorted(p.name for p in TEMPLATES.iterdir()
                  if p.is_dir() and not p.name.startswith("_")
                  and (p / "index.html.j2").exists())


def pick_template(niche, wanted=None):
    options = templates_for(niche)
    if not options:
        raise ValueError(f"no templates for niche '{niche}' in {TEMPLATES}")
    if wanted:
        if wanted not in options:
            raise ValueError(f"template '{wanted}' not found. {niche} has: {options}")
        return wanted
    return random.choice(options)


def slugify(text):
    return re.sub(r"[^a-z0-9]+", "-", (text or "").lower()).strip("-")[:48] or "site"


def render(config: SiteConfig, template=None):
    template = template or config.template or pick_template(config.niche)
    html = env().get_template(f"{template}/index.html.j2").render(
        c=config, year=time.strftime("%Y"))
    return template, html


def build(config: SiteConfig, template=None, out_dir=None):
    """Writes out/sites/<slug>/index.html plus the config used. Returns the folder."""
    template, html = render(config, template)
    config.template = template
    out_dir = Path(out_dir) if out_dir else OUT / slugify(config.business_name)
    out_dir.mkdir(parents=True, exist_ok=True)
    (out_dir / "index.html").write_text(html, encoding="utf-8")
    (out_dir / "site.json").write_text(config.model_dump_json(indent=2), encoding="utf-8")
    return out_dir


def load_config(path):
    return SiteConfig.model_validate(json.loads(Path(path).read_text(encoding="utf-8")))
