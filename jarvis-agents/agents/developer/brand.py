"""
The site config: everything a template needs to become one business's website.

Templates never hard-code a business. They only read this. So the agent's whole
job is to fill one of these in well, and the same config can be poured into any
template for that niche, which is where the variety comes from.
"""

from typing import List, Literal, Optional

from pydantic import BaseModel, Field

# every icon a template can draw, see templates/_shared/icons.j2
Icon = Literal[
    "tooth", "heart", "stethoscope", "baby", "eye", "bone", "brain", "pill",
    "wrench", "snowflake", "flame", "droplet", "bolt", "home", "roof", "leaf",
    "scissors", "sparkle", "brush", "nail", "spa", "mirror",
    "shield", "clock", "star", "calendar", "phone", "check", "map", "award",
]

# fonts the templates know how to load from Google Fonts
HeadingFont = Literal["Fraunces", "Playfair Display", "DM Serif Display",
                      "Outfit", "Sora", "Archivo", "Bricolage Grotesque"]
BodyFont = Literal["Inter", "DM Sans", "Manrope", "Nunito Sans", "Work Sans"]


class Palette(BaseModel):
    primary: str = Field(description="main brand colour, hex like #1f6f8b")
    accent: str = Field(description="second colour for buttons and highlights, hex")
    dark: str = Field(description="near-black for text and dark sections, hex")
    light: str = Field(description="very light background tint, hex")


class Service(BaseModel):
    name: str
    description: str = Field(description="one or two plain sentences")
    icon: Icon


class Review(BaseModel):
    author: str
    text: str
    rating: int = Field(ge=1, le=5)


class Hours(BaseModel):
    days: str = Field(description="e.g. Mon to Fri")
    time: str = Field(description="e.g. 8am to 6pm, or Closed")


class Faq(BaseModel):
    q: str
    a: str


class SiteConfig(BaseModel):
    business_name: str
    niche: Literal["clinic", "homeservices", "salon"]
    template: Optional[str] = Field(
        default=None, description="leave empty, the builder picks the template")

    tagline: str = Field(description="3 to 6 words under the name")
    headline: str = Field(description="hero headline, under 10 words")
    subheadline: str = Field(description="one sentence under the headline")
    cta_label: str = Field(description="main button text, e.g. Book a visit")
    about_title: str
    about: str = Field(description="two short paragraphs separated by a blank line")

    services: List[Service] = Field(min_length=3, max_length=8)
    highlights: List[str] = Field(
        min_length=3, max_length=4,
        description="short trust points that are true or are features of the site "
                    "itself, e.g. 'Online booking' or 'Family owned'. never invent "
                    "awards, years in business or credentials")
    reviews: List[Review] = Field(
        default_factory=list,
        description="ONLY real reviews given in the lead data, quoted as written. "
                    "empty if none were given")
    faqs: List[Faq] = Field(default_factory=list, max_length=5)
    areas_served: List[str] = Field(default_factory=list,
                                    description="towns or neighbourhoods, if known")

    phone: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    hours: List[Hours] = Field(default_factory=list)
    instagram: Optional[str] = None
    facebook: Optional[str] = None

    rating: Optional[float] = None
    review_count: Optional[int] = None

    palette: Palette
    heading_font: HeadingFont
    body_font: BodyFont
    logo_url: Optional[str] = None
    hero_image: Optional[str] = None
    gallery: List[str] = Field(default_factory=list,
                               description="image URLs of their real work or premises")
