// One template, filled with a sample business, as a finished page.
//   /templates/carwash-gloss?niche=carwash&photos=0&lang=ar

import { NICHE_KEYS, type Niche } from "@/lib/niches";
import { TEMPLATES } from "@/templates";
import { sampleSite } from "@/templates/samples";
import { standaloneHtml } from "@/templates/standalone";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const t = TEMPLATES[(await params).id];
  if (!t) return new Response("no such template", { status: 404 });
  const q = new URL(req.url).searchParams;
  const want = q.get("niche") as Niche;
  const niche: Niche = NICHE_KEYS.includes(want) && t.niches.includes(want) ? want : t.niches[0];
  const d = sampleSite(niche, { photos: q.get("photos") !== "0", lang: q.get("lang") ?? undefined, palette: t.palette, fonts: t.fonts });
  const { renderToStaticMarkup } = await import("react-dom/server.edge");
  const html = standaloneHtml(t, d, { render: renderToStaticMarkup, title: `${t.label} template`, book: "#visit", noindex: true });
  return new Response(html, { headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" } });
}
