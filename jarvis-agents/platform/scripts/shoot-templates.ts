// Screenshots of every template, desktop and phone, into screenshots/templates/.
// Uses the Chrome or Edge already on your computer, nothing to download.
//
//   npm run dev                      (in one window)
//   npm run shoot                    (in another)
//   npm run shoot -- salon-noir      (just one template)

import { mkdirSync } from "node:fs";
import { join } from "node:path";
import type { Browser } from "playwright-core";
import LIBRARY from "../src/templates/library.json";
import { SITE_URL, SIZES, fullShot, launch } from "./browser";

export const TEMPLATE_SHOTS = join(__dirname, "..", "..", "screenshots", "templates");

export async function shootTemplates(browser: Browser, only: string[] = []) {
  mkdirSync(TEMPLATE_SHOTS, { recursive: true });
  for (const t of LIBRARY.templates.filter((x) => !only.length || only.includes(x.id))) {
    for (const s of SIZES) {
      const page = await browser.newPage({ viewport: { width: s.width, height: s.height }, deviceScaleFactor: 1 });
      await page.goto(`${SITE_URL}/templates/${t.id}?niche=${t.niches[0]}`, { waitUntil: "networkidle", timeout: 120_000 });
      await fullShot(page, join(TEMPLATE_SHOTS, `${t.id}-${s.name}.jpg`));
      await page.close();
    }
    console.log(`template ${t.id}`);
  }
}

if (require.main === module) {
  (async () => {
    const browser = await launch();
    await shootTemplates(browser, process.argv.slice(2));
    await browser.close();
    console.log(`saved to ${TEMPLATE_SHOTS}`);
  })().catch((e) => { console.error(e); process.exit(1); });
}
