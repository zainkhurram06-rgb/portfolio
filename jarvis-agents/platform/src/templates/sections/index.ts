// Every building block a template can use, and the versions of each.
// Adding a version = handle it in the component, add it here, style it in css.ts.

import type { ComponentType } from "react";
import type { SiteData } from "@/lib/site-data";
import { About, Areas, Faq, Gallery, Guarantee, Insurance, Reviews, Services, Steps, Team, Trust } from "./body";
import { Contact, Cta, Fab, Footer } from "./foot";
import { Hero, Nav, Topbar } from "./head";
import type { SectionProps } from "./parts";

type Block = {
  variants: readonly string[];
  Component: ComponentType<SectionProps>;
  shows?: (d: SiteData, v: string) => boolean;   // hidden when the facts it needs are missing
};

const block = (variants: readonly string[], Component: ComponentType<SectionProps> & { shows?: Block["shows"] }): Block =>
  ({ variants, Component, shows: Component.shows });

export const SECTIONS = {
  topbar: block(["info", "contact"], Topbar),
  nav: block(["classic", "centered", "phone", "overlay"], Nav),
  hero: block(["split", "photo", "centered", "collage", "form", "card"], Hero),
  trust: block(["strip", "cards"], Trust),
  services: block(["cards", "menu", "numbered", "list", "packages"], Services),
  about: block(["split", "statement", "stats"], About),
  steps: block(["row", "line"], Steps),
  team: block(["cards"], Team),
  gallery: block(["grid", "strip", "beforeafter"], Gallery),
  reviews: block(["cards", "spotlight", "rating"], Reviews),
  faq: block(["accordion", "split"], Faq),
  areas: block(["chips"], Areas),
  insurance: block(["chips"], Insurance),
  guarantee: block(["panel"], Guarantee),
  cta: block(["band", "phone", "split"], Cta),
  contact: block(["panels", "map", "simple"], Contact),
  footer: block(["simple", "columns"], Footer),
  fab: block(["call"], Fab),
} satisfies Record<string, Block>;

export type SectionType = keyof typeof SECTIONS;
export const TONES = ["", "alt", "inv", "brand"] as const;
