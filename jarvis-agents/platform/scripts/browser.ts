// Shared bits for the screenshot scripts: start the Chrome or Edge already on
// this computer, and take a full-page shot with every photo loaded.

import { chromium, type Browser, type Page } from "playwright-core";

export const SITE_URL = process.env.SITE_URL ?? "http://localhost:3000";

export async function launch(): Promise<Browser> {
  for (const channel of ["chrome", "msedge"]) {
    try { return await chromium.launch({ channel }); } catch { /* try the next one */ }
  }
  throw new Error("couldn't start Chrome or Edge. Install one, or set PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH");
}

export async function fullShot(page: Page, path: string) {
  // load every lazy photo now, so the full-page shot isn't full of gaps
  await page.evaluate(async () => {
    const imgs = [...document.images];
    imgs.forEach((i) => { i.loading = "eager"; });
    await Promise.all(imgs.map((i) => (i.complete ? null : new Promise((r) => { i.onload = i.onerror = r; }))));
    await document.fonts.ready;
  });
  await page.screenshot({ path, fullPage: true, type: "jpeg", quality: 62 });
}

export const SIZES = [{ name: "desktop", width: 1440, height: 900 }, { name: "phone", width: 390, height: 844 }] as const;
