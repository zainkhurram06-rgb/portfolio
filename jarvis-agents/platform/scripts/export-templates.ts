// Writes every template as a real, standalone HTML file you can open in any
// browser, no server needed:
//
//   jarvis-agents/templates/index.html            every template, by trade
//   jarvis-agents/templates/<trade>/<id>.html     one page per template per trade
//
// Run:  cd platform; npm run export
// The files are filled with an example business and placeholder photos.

import { copyFileSync, mkdirSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { NICHES, NICHE_KEYS, type Niche } from "../src/lib/niches";
import { TEMPLATE_LIST, type Template } from "../src/templates";
import { standaloneHtml } from "../src/templates/standalone";
import { sampleSite } from "../src/templates/samples";

const OUT = join(__dirname, "..", "..", "templates");
const PHOTOS = join(__dirname, "..", "public", "samples");

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

function page(t: Template, niche: Niche) {
  const d = sampleSite(niche, { palette: t.palette, fonts: t.fonts });
  return standaloneHtml(t, d, {
    render: renderToStaticMarkup,
    title: `${t.label} | ${NICHES[niche].label} template`,
    book: "#contact",
    rewrite: (html) => html.replaceAll('"/samples/', '"../_photos/'),
  });
}

function index(files: { niche: Niche; t: Template; path: string }[]) {
  const card = (f: (typeof files)[number]) => `
      <article>
        <a class="frame" href="${f.path}" target="_blank"><iframe src="${f.path}" loading="lazy" tabindex="-1" title="${esc(f.t.label)}"></iframe></a>
        <div class="meta">
          <a href="${f.path}" target="_blank"><b>${esc(f.t.label)}</b></a>
          <code>${f.path}</code>
          <span>${f.t.style.mood}, ${f.t.style.radius} corners, ${f.t.style.density} spacing · ${f.t.fonts.join(" + ")}${f.t.needsPhoto ? " · needs a photo" : ""}</span>
        </div>
      </article>`;
  const groups = NICHE_KEYS.map((n) => {
    const mine = files.filter((f) => f.niche === n);
    return `
    <section id="${n}">
      <h2>${esc(NICHES[n].label)} <small>${mine.length} templates</small></h2>
      <div class="grid">${mine.map(card).join("")}
      </div>
    </section>`;
  }).join("");
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Template library</title>
<style>
* { box-sizing: border-box; margin: 0; padding: 0; }
body { font: 15px/1.5 system-ui, -apple-system, "Segoe UI", sans-serif; color: #1c1917; background: #f4f3f0; }
header { position: sticky; top: 0; z-index: 5; background: rgba(244,243,240,.94); backdrop-filter: blur(8px); border-bottom: 1px solid #e2dfda; }
header div { width: min(1400px, 100% - 32px); margin: 0 auto; padding: 14px 0; display: flex; flex-wrap: wrap; gap: 8px 18px; align-items: center; }
header b { font-size: 1.1rem; margin-inline-end: 10px; }
header a { color: inherit; text-decoration: none; font-size: .92rem; padding: 5px 11px; border-radius: 999px; background: #fff; border: 1px solid #e2dfda; }
main { width: min(1400px, 100% - 32px); margin: 0 auto; padding: 24px 0 80px; }
main > p { color: #57534e; max-width: 85ch; }
section { margin-top: 40px; scroll-margin-top: 70px; }
h2 { font-size: 1.5rem; margin-bottom: 14px; }
h2 small { font-size: .9rem; color: #78716c; font-weight: 400; }
.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 18px; }
article { background: #fff; border: 1px solid #e2dfda; border-radius: 14px; overflow: hidden; }
.frame { display: block; height: 290px; overflow: hidden; position: relative; background: #eee; }
.frame iframe { width: 1360px; height: 1300px; border: 0; transform: scale(.25); transform-origin: 0 0; pointer-events: none; }
.meta { padding: 12px 14px; display: grid; gap: 4px; }
.meta a { color: #1d4ed8; text-decoration: none; }
.meta code { font-size: .8rem; color: #78716c; }
.meta span { font-size: .85rem; color: #57534e; }
</style>
</head>
<body>
<header><div><b>Template library</b>${NICHE_KEYS.map((n) => `<a href="#${n}">${esc(NICHES[n].label)}</a>`).join("")}</div></header>
<main>
  <p>Every website template as a real HTML file in this folder, filled with an example business and placeholder photos. Click one to open it full size. ${TEMPLATE_LIST.length} templates, ${files.length} files (templates that suit several trades have one file per trade). Skeleton designs, to be restyled from the reference sites later.</p>
  ${groups}
</main>
</body>
</html>
`;
}

function main() {
  // start clean, so a removed template never leaves a stale file behind
  for (const name of readdirSync(OUT, { withFileTypes: true })) {
    if (name.isDirectory() || name.name === "index.html") rmSync(join(OUT, name.name), { recursive: true, force: true });
  }
  mkdirSync(join(OUT, "_photos"), { recursive: true });
  for (const f of readdirSync(PHOTOS)) copyFileSync(join(PHOTOS, f), join(OUT, "_photos", f));

  const files: { niche: Niche; t: Template; path: string }[] = [];
  for (const t of TEMPLATE_LIST) {
    for (const niche of t.niches) {
      mkdirSync(join(OUT, niche), { recursive: true });
      const path = `${niche}/${t.id}.html`;
      writeFileSync(join(OUT, path), page(t, niche));
      files.push({ niche, t, path });
    }
  }
  writeFileSync(join(OUT, "index.html"), index(files));
  console.log(`${files.length} template files written to ${OUT}`);
  console.log(`open ${join(OUT, "index.html")}`);
}

mkdirSync(OUT, { recursive: true });
main();
