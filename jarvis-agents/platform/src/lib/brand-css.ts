import type { SiteContent } from "./content";

// the business's colours and fonts, as CSS variables every theme reads
export function brandVars(c: SiteContent) {
  return `:root{--primary:${c.palette.primary};--accent:${c.palette.accent};--dark:${c.palette.dark};--light:${c.palette.light};` +
    `--heading:"${c.headingFont}",Georgia,serif;--body:"${c.bodyFont}",system-ui,-apple-system,"Segoe UI",sans-serif;}`;
}

export function fontsHref(c: SiteContent) {
  const fam = (f: string) => `family=${f.replace(/ /g, "+")}:wght@400;500;600;700`;
  const fonts = [...new Set([c.headingFont, c.bodyFont])];
  return `https://fonts.googleapis.com/css2?${fonts.map(fam).join("&")}&display=swap`;
}
