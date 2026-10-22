// The fixed words on every site (buttons, headings, form fields) in English.
// A business in another language stores its own translation in content.labels,
// which MARK writes when he builds the demo. Anything missing falls back to English.

import EN from "./labels.en.json";
import NICHE_EN from "./labels.niches.en.json";

export type LabelKey = keyof typeof EN;
export type Labels = Record<LabelKey, string>;
export const LABEL_KEYS = Object.keys(EN) as LabelKey[];

// English for one niche: the shared words, then that trade's own wording on top
export function englishFor(niche?: string): Labels {
  const extra = (NICHE_EN as Record<string, Partial<Labels>>)[niche ?? ""] ?? {};
  return { ...EN, ...extra } as Labels;
}

export function labelsFor(custom: Record<string, string> | undefined, niche?: string): Labels {
  const out = englishFor(niche);
  for (const k of LABEL_KEYS) {
    const v = custom?.[k];
    if (typeof v === "string" && v.trim()) out[k] = v;
  }
  return out;
}

// "Serving {areas}" + { areas: "Manly" } -> "Serving Manly"
export function fill(text: string, vars: Record<string, string | number>) {
  return text.replace(/\{(\w+)\}/g, (_, k) => (k in vars ? String(vars[k]) : ""));
}
