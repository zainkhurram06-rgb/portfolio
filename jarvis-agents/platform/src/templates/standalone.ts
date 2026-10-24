// A template as one real HTML file that opens in any browser with no server:
// fonts, colours and styles all inside. Used for the template library files
// and for every finished demo MARK saves into the pipeline.

import { createElement, type ReactElement } from "react";
import { brandVars, fontsHref } from "@/lib/brand-css";
import type { SiteData } from "@/lib/site-data";
import { TemplatePage, type Template } from "./index";

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

type Options = {
  // react-dom/server's renderToStaticMarkup. passed in because Next.js won't let
  // an app route import it directly
  render: (el: ReactElement) => string;
  title: string;
  description?: string;
  book: string;                 // where the book buttons go
  origin?: string;              // the platform, for files opened from disk: the contact form sends there
  rewrite?: (html: string) => string;
  noindex?: boolean;
};

export function standaloneHtml(t: Template, d: SiteData, o: Options) {
  let body = o.render(createElement(TemplatePage, { t, d }))
    .replaceAll(`href="${d.bookHref}"`, `href="${esc(o.book)}"`)
    .replaceAll(`href="${d.base}/"`, 'href="#top"');
  if (o.origin) body = body.replaceAll('data-enquiry="/api/', `data-enquiry="${o.origin}/api/`);
  if (o.rewrite) body = o.rewrite(body);
  return `<!doctype html>
<html lang="${d.biz.language}" dir="${d.dir}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(o.title)}</title>${o.description ? `\n<meta name="description" content="${esc(o.description)}">` : ""}${o.noindex ? '\n<meta name="robots" content="noindex, nofollow">' : ""}
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="${fontsHref(d.c)}">
<style>body{margin:0}${brandVars(d.c)}</style>
</head>
<body>
${body}
</body>
</html>
`;
}
