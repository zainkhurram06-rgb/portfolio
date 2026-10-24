// Every client website, served as one finished HTML page: the same page MARK
// saves as their website file. No React runs in the visitor's browser, so pages
// are light and the designs' small scripts work untouched.

import { siteRows } from "@/lib/site";
import { buildSiteData } from "@/lib/site-data";
import { templateFor } from "@/templates";
import { standaloneHtml } from "@/templates/standalone";

export async function GET(req: Request, { params }: { params: Promise<{ site: string }> }) {
  const rows = await siteRows((await params).site);
  if (!rows) return new Response("<!doctype html><title>Not found</title><p>This website doesn't exist.</p>", { status: 404, headers: { "content-type": "text/html; charset=utf-8" } });
  // the proxy tells us when the visitor came in on the business's own domain
  const d = buildSiteData({ ...rows, onOwnDomain: !!req.headers.get("x-site-host") });
  const { renderToStaticMarkup } = await import("react-dom/server.edge");
  const html = standaloneHtml(templateFor(d.biz.theme, d.biz.niche), d, {
    render: renderToStaticMarkup,
    title: `${d.biz.name} | ${d.c.tagline}`,
    description: d.c.subheadline,
    book: d.bookHref,
    noindex: d.isDemo,                       // demos must never show up in Google
  });
  return new Response(html, { headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" } });
}
