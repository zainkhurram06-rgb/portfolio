// Screenshots of every template, desktop and phone, into screenshots/templates/.
// Uses the Chrome or Edge already on your computer, nothing to download.
//
//   npm run dev                      (in one window)
//   npm run shoot                    (in another)
//   npm run shoot -- salon-noir      (just one template)

import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { chromium, type Browser } from "playwright-core";
import LIBRARY from "../src/templates/library.json";

const BASE = process.env.SITE_URL ?? "http://localhost:3000";
const OUT = join(__dirname, "..", "..", "screenshots", "templates");
const only = process.argv.slice(2);

async function launch(): Promise<Browser> {
  for (const channel of ["chrome", "msedge"]) {
    try { return await chromium.launch({ channel }); } catch { /* try the next one */ }
  }
  throw new Error("couldn't start Chrome or Edge. Install one, or set PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH");
}

async function main() {
  mkdirSync(OUT, { recursive: true });
  const browser = await launch();
  const sizes = [{ name: "desktop", width: 1440, height: 900 }, { name: "phone", width: 390, height: 844 }];
  for (const t of LIBRARY.templates.filter((x) => !only.length || only.includes(x.id))) {
    for (const s of sizes) {
      const page = await browser.newPage({ viewport: { width: s.width, height: s.height }, deviceScaleFactor: 1 });
      await page.goto(`${BASE}/templates/${t.id}?niche=${t.niches[0]}`, { waitUntil: "networkidle", timeout: 120_000 });
      // load every lazy photo now, so the full-page shot isn't full of gaps
      await page.evaluate(async () => {
        const imgs = [...document.images];
        imgs.forEach((i) => { i.loading = "eager"; });
        await Promise.all(imgs.map((i) => (i.complete ? null : new Promise((r) => { i.onload = i.onerror = r; }))));
        await document.fonts.ready;
      });
      await page.screenshot({ path: join(OUT, `${t.id}-${s.name}.jpg`), fullPage: true, type: "jpeg", quality: 62 });
      await page.close();
    }
    console.log(`${t.id}`);
  }
  await browser.close();
  console.log(`saved to ${OUT}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
