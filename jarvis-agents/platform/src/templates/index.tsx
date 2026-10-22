// The template library. A template is a recipe from library.json: which sections,
// in which order, which version of each, and a few style settings. MARK (python)
// reads the same JSON file to pick one for each lead.

import { Fragment } from "react";
import { DemoRibbon } from "@/components/site/bits";
import { BODY_FONTS, HEADING_FONTS } from "@/lib/content";
import { fill } from "@/lib/labels";
import type { Niche } from "@/lib/niches";
import type { SiteData } from "@/lib/site-data";
import LIBRARY from "./library.json";
import { BASE, SECTION_CSS } from "./css";
import { SECTIONS, type SectionType } from "./sections";

export type Style = {
  radius: "sharp" | "soft" | "round";
  buttons: "square" | "soft" | "pill";
  density: "compact" | "regular" | "airy";
  mood: "light" | "tinted" | "dark";
  heads: "normal" | "upper" | "light";
};

export type Step = { type: SectionType; variant: string; tone: "" | "alt" | "inv" | "brand" };

export type Template = {
  id: string;
  label: string;
  niches: Niche[];
  needsPhoto: boolean;
  fonts: [(typeof HEADING_FONTS)[number], (typeof BODY_FONTS)[number]];
  style: Style;
  palette: { primary: string; accent: string; dark: string; light: string };
  sections: Step[];
};

export function parseStep(s: string): Step {
  const [type, variant, tone = ""] = s.split(":");
  return { type: type as SectionType, variant, tone: tone as Step["tone"] };
}

export const TEMPLATE_LIST: Template[] = LIBRARY.templates.map((t) => ({
  ...t,
  niches: t.niches as Niche[],
  needsPhoto: "needsPhoto" in t ? !!t.needsPhoto : false,
  fonts: t.fonts as Template["fonts"],
  style: t.style as Style,
  sections: t.sections.map(parseStep),
}));

export const TEMPLATES: Record<string, Template> = Object.fromEntries(TEMPLATE_LIST.map((t) => [t.id, t]));

export function templatesFor(niche: string) {
  return TEMPLATE_LIST.filter((t) => t.niches.includes(niche as Niche));
}

export const fitsNiche = (id: string, niche: string) => !!TEMPLATES[id]?.niches.includes(niche as Niche);

// unknown or retired names (the old "clinic", "salon", "homeservices") fall back
// to the trade's first template, so an old business never shows a blank page
export function templateFor(id: string, niche: string): Template {
  return fitsNiche(id, niche) ? TEMPLATES[id] : templatesFor(niche)[0] ?? TEMPLATE_LIST[0];
}

// which sections actually show for this business. a section whose facts are
// missing (no reviews, no insurers...) is left out, and the menu skips it too
export function visibleSteps(t: Template, d: SiteData) {
  return t.sections.filter((s) => {
    const shows = SECTIONS[s.type].shows;
    return !shows || shows(d, s.variant);
  });
}

export function cssFor(t: Template) {
  return BASE + [...new Set(t.sections.map((s) => s.type))].map((type) => SECTION_CSS[type]).join("");
}

export function TemplatePage({ t, d }: { t: Template; d: SiteData }) {
  const steps = visibleSteps(t, d);
  const present = new Set<string>(steps.map((s) => s.type));
  return (
    <div className="site" dir={d.dir} data-template={t.id} data-radius={t.style.radius} data-buttons={t.style.buttons}
      data-density={t.style.density} data-mood={t.style.mood} data-heads={t.style.heads}>
      <style dangerouslySetInnerHTML={{ __html: cssFor(t) }} />
      <DemoRibbon text={fill(d.L.demo_ribbon, { name: d.biz.name })} show={d.isDemo} />
      {steps.map((s, i) => {
        const { Component } = SECTIONS[s.type];
        return (
          <Fragment key={i}>
            <Component d={d} v={s.variant} tone={s.tone ? `tone-${s.tone}` : ""} present={present} />
          </Fragment>
        );
      })}
    </div>
  );
}
