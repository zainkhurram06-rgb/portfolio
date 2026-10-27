// Hand-built designs. A template in library.json with "design": "<name>" is
// drawn by that design's own page and styles instead of the section library.

import type { ComponentType } from "react";
import { Atelier, css as atelierCss } from "./atelier";
import { Aurelle, css as aurelleCss } from "./aurelle";
import { Celesta, css as celestaCss } from "./celesta";
import { Forma, css as formaCss } from "./forma";
import { Monolith, css as monolithCss } from "./monolith";
import { Noir, css as noirCss } from "./noir";
import { Serum, css as serumCss } from "./serum";
import { Showroom, css as showroomCss } from "./showroom";
import { Verda, css as verdaCss } from "./verda";
import { Workshop, css as workshopCss } from "./workshop";
import { Glow, css as glowCss } from "./glow";
import { House, css as houseCss } from "./house";
import { Liquid, css as liquidCss } from "./liquid";
import { Lumex, css as lumexCss } from "./lumex";
import { Pop, css as popCss } from "./pop";
import { Strange, css as strangeCss } from "./strange";
import type { DesignProps } from "./shared";
import { SHARED_CSS } from "./shared";

export type Design = { Component: ComponentType<DesignProps>; css: string };

export const DESIGNS: Record<string, Design> = {
  atelier: { Component: Atelier, css: atelierCss },
  noir: { Component: Noir, css: noirCss },
  strange: { Component: Strange, css: strangeCss },
  pop: { Component: Pop, css: popCss },
  glow: { Component: Glow, css: glowCss },
  lumex: { Component: Lumex, css: lumexCss },
  celesta: { Component: Celesta, css: celestaCss },
  monolith: { Component: Monolith, css: monolithCss },
  aurelle: { Component: Aurelle, css: aurelleCss },
  verda: { Component: Verda, css: verdaCss },
  serum: { Component: Serum, css: serumCss },
  forma: { Component: Forma, css: formaCss },
  liquid: { Component: Liquid, css: liquidCss },
  showroom: { Component: Showroom, css: showroomCss },
  workshop: { Component: Workshop, css: workshopCss },
  house: { Component: House, css: houseCss },
};

export const designCss = (name: string) => SHARED_CSS + (DESIGNS[name]?.css ?? "");
