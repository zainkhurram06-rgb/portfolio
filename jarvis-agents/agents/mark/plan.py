"""
What MARK reads (a Lead) and what he writes (a Plan).

A Plan is the creative part only: words, services, hours, and colours when the
lead has brand colours. Facts about the business (name, phone, address, real
reviews, rating, guarantee, insurers, packages) never come from the model. They
are copied from the lead in code, so a model can't invent them. The design
(template, fonts) is picked in code too, see templates.py.
"""

from typing import Dict, List, Literal, Optional

from pydantic import BaseModel, Field

# keep in step with platform/src/lib/niches.ts
NICHES = ["salon", "dental", "medical", "dermatology", "carwash", "autorepair", "homeservices"]
Niche = Literal[tuple(NICHES)]  # type: ignore[valid-type]

ICONS = [
    "tooth", "heart", "stethoscope", "baby", "eye", "bone", "brain", "pill",
    "wrench", "snowflake", "flame", "droplet", "bolt", "home", "roof", "leaf",
    "scissors", "sparkle", "brush", "nail", "spa", "mirror",
    "shield", "clock", "star", "calendar", "phone", "check", "map", "award",
]
Icon = Literal[tuple(ICONS)]  # type: ignore[valid-type]


# ---------------------------------------------------------------- the input

class LeadReview(BaseModel):
    author: str
    rating: int = Field(ge=1, le=5)
    text: str


class LeadPackage(BaseModel):
    name: str
    includes: List[str] = Field(default_factory=list)
    prices: Dict[Literal["car", "suv", "van"], float] = Field(default_factory=dict)


class BeforeAfter(BaseModel):
    before: str
    after: str
    caption: str = ""


class Lead(BaseModel):
    """Everything known about a business. Only name, niche and country are required."""
    name: str
    niche: Niche
    country: str = Field(description="ISO 2-letter code, e.g. AE, GB, US")
    city: Optional[str] = None
    language: Optional[str] = Field(None, description="e.g. en, ar, es. guessed from country if empty")
    phone: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    instagram: Optional[str] = None
    facebook: Optional[str] = None
    google_maps_url: Optional[str] = None
    rating: Optional[float] = None
    review_count: Optional[int] = None
    reviews: List[LeadReview] = Field(default_factory=list)
    services: Optional[str] = Field(None, description="what they offer, free text, prices if known")
    hours: Optional[str] = Field(None, description="opening hours, free text")
    staff: List[str] = Field(default_factory=list, description="names of the team if known")
    brand_colours: List[str] = Field(default_factory=list, description="hex colours from their logo or Instagram")
    logo_url: Optional[str] = None
    photos: List[str] = Field(default_factory=list, description="links to their real photos")
    notes: Optional[str] = None

    # trade details. facts, copied onto the site as they are. empty = section hidden
    credentials: List[str] = Field(default_factory=list, description="licences, memberships")
    warranty: Optional[str] = Field(None, description="their guarantee, e.g. 12 months on parts and labour")
    insurers: List[str] = Field(default_factory=list, description="clinics: insurance they accept")
    packages: List[LeadPackage] = Field(default_factory=list, description="car wash: tiers priced by vehicle size")
    before_after: List[BeforeAfter] = Field(default_factory=list)


# ---------------------------------------------------------------- the output

class Palette(BaseModel):
    primary: str = Field(description="hex like #1f6f8b")
    accent: str = Field(description="hex")
    dark: str = Field(description="near-black hex for text")
    light: str = Field(description="very light background hex")


class PlanService(BaseModel):
    name: str
    description: str = Field(description="one plain sentence, max 20 words")
    icon: Icon
    durationMin: int = Field(ge=5, le=600)
    price: Optional[float] = Field(None, description="ONLY if the lead gives it. otherwise null")
    priceFrom: bool = False


class PlanHours(BaseModel):
    weekday: int = Field(ge=1, le=7, description="1 = Monday, 7 = Sunday")
    start: str = Field(description="HH:MM, 24 hour")
    end: str = Field(description="HH:MM, 24 hour")


class Faq(BaseModel):
    q: str
    a: str


class PlanContent(BaseModel):
    tagline: str = Field(description="3 to 6 words, what they are")
    headline: str = Field(description="under 10 words, a benefit, not their name")
    subheadline: str = Field(description="one sentence")
    ctaLabel: str = Field(description="2 to 4 words, e.g. Book a visit")
    aboutTitle: str
    about: str = Field(description="two short paragraphs separated by a blank line")
    highlights: List[str] = Field(min_length=3, max_length=4,
                                  description="short and true: features of booking with them, never invented awards or years")
    faqs: List[Faq] = Field(default_factory=list, max_length=4)
    areasServed: List[str] = Field(default_factory=list, description="home services, car wash and auto repair only: nearby areas")
    # fonts and layout come from the template. colours only when the lead has
    # brand colours to build them from, otherwise the template's own are used
    palette: Optional[Palette] = Field(None, description="ONLY if brand colours are given, built from them. otherwise null")


class Plan(BaseModel):
    language: str = Field(description="language code the site is written in")
    currency: str = Field(description="ISO 4217 code for the country")
    timezone: str = Field(description="IANA timezone for the city")
    content: PlanContent
    services: List[PlanService] = Field(min_length=3, max_length=10)
    hours: List[PlanHours] = Field(min_length=1, max_length=14)
    hours_are_guessed: bool = Field(description="true if the lead did not give opening hours")
