// Hand-built designs. A template in library.json with "design": "<name>" is
// drawn by that design's own page and styles instead of the section library.

import type { ComponentType } from "react";
import { Atelier, css as atelierCss } from "./atelier";
import { Noir, css as noirCss } from "./noir";
import { Glow, css as glowCss } from "./glow";
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
};

export const designCss = (name: string) => SHARED_CSS + (DESIGNS[name]?.css ?? "");
