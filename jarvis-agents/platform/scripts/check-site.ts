// HAPPY's browser check: opens a website file in the Chrome or Edge on this
// computer, at computer and phone size, and prints what it found as JSON.
//
//   npx tsx scripts/check-site.ts C:\path\to\site\index.html

import { pathToFileURL } from "node:url";
import { SIZES, launch } from "./browser";

async function main() {
  const file = process.argv[2];
  if (!file) throw new Error("which website file?");
  const browser = await launch();
  const out: Record<string, unknown> = {};
  for (const s of SIZES) {
    const page = await browser.newPage({ viewport: { width: s.width, height: s.height } });
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    page.on("console", (m) => { if (m.type() === "error" && !/fonts\.(googleapis|gstatic)/.test(m.text())) errors.push(m.text()); });
    await page.goto(pathToFileURL(file).href, { waitUntil: "load", timeout: 60_000 });
    out[s.name] = await page.evaluate(async () => {
      const imgs = [...document.images];
      imgs.forEach((i) => { i.loading = "eager"; });
      await Promise.all(imgs.map((i) => (i.complete ? null : new Promise((r) => { i.onload = i.onerror = r; }))));
      const videos = [...document.querySelectorAll("video")];
      await Promise.all(videos.map((v) => (v.readyState >= 2 ? null : new Promise((r) => {
        v.onloadeddata = v.onerror = r;
        setTimeout(r, 4000);
      }))));
      const doc = document.documentElement;
      return {
        broken_images: imgs.filter((i) => i.naturalWidth === 0).map((i) => i.getAttribute("src")),
        broken_videos: videos.filter((v) => v.readyState < 2).map((v) => v.getAttribute("src")),
        overflow_px: Math.max(0, doc.scrollWidth - window.innerWidth),
        height: doc.scrollHeight,
      };
    });
    (out[s.name] as Record<string, unknown>).errors = errors;
    await page.close();
  }
  await browser.close();
  process.stdout.write(JSON.stringify(out));
}

main().catch((e) => { process.stderr.write(String(e?.message ?? e)); process.exit(1); });
