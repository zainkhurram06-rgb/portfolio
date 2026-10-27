import type { SiteContent } from "./content";

// the business's colours and fonts, as CSS variables every theme reads
export function brandVars(c: SiteContent) {
  return `:root{--primary:${c.palette.primary};--accent:${c.palette.accent};--dark:${c.palette.dark};--light:${c.palette.light};` +
    `--heading:"${c.headingFont}",Georgia,serif;--body:"${c.bodyFont}",system-ui,-apple-system,"Segoe UI",sans-serif;}`;
}

export function fontsHref(c: SiteContent) {
  // real italics too (several designs set words in italic). Google skips the
  // styles a font doesn't have, so asking is always safe
  const fam = (f: string) => `family=${f.replace(/ /g, "+")}:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500`;
  const fonts = [...new Set([c.headingFont, c.bodyFont])];
  return `https://fonts.googleapis.com/css2?${fonts.map(fam).join("&")}&display=swap`;
}
