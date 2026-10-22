// The fixed words on every site (buttons, headings, form fields) in English.
// A business in another language stores its own translation in content.labels,
// which MARK writes when he builds the demo. Anything missing falls back to English.

import EN from "./labels.en.json";

export type LabelKey = keyof typeof EN;
export type Labels = Record<LabelKey, string>;
export const LABEL_KEYS = Object.keys(EN) as LabelKey[];

export function labelsFor(custom: Record<string, string> | undefined): Labels {
  const out = { ...EN } as Labels;
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
