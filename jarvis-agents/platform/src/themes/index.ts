// Every theme a business can use. Adding a theme = a folder with index.tsx and
// css.ts, plus one line here. MARK picks from these by niche.

import type { ComponentType } from "react";
import type { SiteData } from "@/lib/site";
import type { Niche } from "@/lib/niches";
import Clinic from "./clinic";
import { css as clinicCss } from "./clinic/css";
import HomeServices from "./homeservices";
import { css as homeCss } from "./homeservices/css";
import Salon from "./salon";
import { css as salonCss } from "./salon/css";

export type Theme = {
  name: string;
  niches: Niche[];          // trades this design suits
  label: string;
  Component: ComponentType<{ d: SiteData }>;
  css: string;
};

export const THEMES: Record<string, Theme> = {
  clinic: { name: "clinic", niches: ["dental", "medical", "dermatology"], label: "Calm clinic", Component: Clinic, css: clinicCss },
  homeservices: { name: "homeservices", niches: ["homeservices", "carwash", "autorepair"], label: "Bold and direct", Component: HomeServices, css: homeCss },
  salon: { name: "salon", niches: ["salon"], label: "Editorial salon", Component: Salon, css: salonCss },
};

export function themeFor(name: string, niche: string): Theme {
  return THEMES[name] ?? Object.values(THEMES).find((t) => t.niches.includes(niche as Niche)) ?? THEMES.clinic;
}

export function themesFor(niche: string) {
  return Object.values(THEMES).filter((t) => t.niches.includes(niche as Niche));
}
