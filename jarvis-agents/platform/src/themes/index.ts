// Every theme a business can use. Adding a theme = a folder with index.tsx and
// css.ts, plus one line here. MARK picks from these by niche.

import type { ComponentType } from "react";
import type { SiteData } from "@/lib/site";
import Clinic from "./clinic";
import { css as clinicCss } from "./clinic/css";
import HomeServices from "./homeservices";
import { css as homeCss } from "./homeservices/css";
import Salon from "./salon";
import { css as salonCss } from "./salon/css";

export type Theme = {
  name: string;
  niche: "salon" | "clinic" | "homeservices";
  label: string;
  Component: ComponentType<{ d: SiteData }>;
  css: string;
};

export const THEMES: Record<string, Theme> = {
  clinic: { name: "clinic", niche: "clinic", label: "Calm clinic", Component: Clinic, css: clinicCss },
  homeservices: { name: "homeservices", niche: "homeservices", label: "Bold trades", Component: HomeServices, css: homeCss },
  salon: { name: "salon", niche: "salon", label: "Editorial salon", Component: Salon, css: salonCss },
};

export function themeFor(name: string, niche: string): Theme {
  return THEMES[name] ?? Object.values(THEMES).find((t) => t.niche === niche) ?? THEMES.clinic;
}
