// One business's website as a standalone HTML file, printed to the screen or
// saved with --out. MARK runs this to save each demo into its pipeline folder.
//
//   npx tsx --env-file=.env.local scripts/export-site.ts glow-lab-nails --out site.html
//   --origin http://localhost:3000   where the live demo runs, for the book buttons

import { writeFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { sql } from "../src/db";
import { siteRows } from "../src/lib/site";
import { buildSiteData } from "../src/lib/site-data";
import { templateFor } from "../src/templates";
import { standaloneHtml } from "../src/templates/standalone";

async function main() {
  const args = process.argv.slice(2);
  const opt = (name: string) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : undefined; };
  const slug = args.find((a, i) => !a.startsWith("--") && !args[i - 1]?.startsWith("--"));
  if (!slug) throw new Error("which business? give its slug");
  const origin = (opt("--origin") ?? process.env.PLATFORM_URL ?? "http://localhost:3000").replace(/\/$/, "");

  const rows = await siteRows(slug);
  if (!rows) throw new Error(`no business called ${slug}`);
  const d = buildSiteData({ ...rows, onOwnDomain: false });
  const html = standaloneHtml(templateFor(d.biz.theme, d.biz.niche), d, {
    render: renderToStaticMarkup,
    title: `${d.biz.name} | ${d.c.tagline}`,
    book: d.bookHref.startsWith("http") ? d.bookHref : `${origin}${d.bookHref}`,
    noindex: d.isDemo,
  });
  const out = opt("--out");
  if (out) writeFileSync(out, html, "utf-8");
  else process.stdout.write(html);
}

main().then(() => sql.end()).catch(async (e) => { console.error(e.message ?? e); await sql.end(); process.exit(1); });
