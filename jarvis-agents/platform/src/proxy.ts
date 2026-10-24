// Sends each request to the right business.
//   luna.<ROOT_DOMAIN>/...      -> /s/luna/...
//   www.lunahair.com/...        -> /s/www.lunahair.com/...  (custom domain, looked up in the database)
//   <ROOT_DOMAIN>/admin, /api   -> left alone (the dashboard and APIs), and /media everywhere

import { NextResponse, type NextRequest } from "next/server";

const ROOT = (process.env.ROOT_DOMAIN ?? "localhost:3000").toLowerCase();
const APP_HOSTS = new Set([ROOT, `www.${ROOT}`, `app.${ROOT}`]);

export function proxy(req: NextRequest) {
  const host = (req.headers.get("host") ?? "").toLowerCase();
  const url = req.nextUrl;

  if (APP_HOSTS.has(host) || url.pathname.startsWith("/api/") || url.pathname.startsWith("/s/") || url.pathname.startsWith("/media/")) {
    // only this proxy may set x-site-host, never the visitor
    if (!req.headers.has("x-site-host")) return NextResponse.next();
    const clean = new Headers(req.headers);
    clean.delete("x-site-host");
    return NextResponse.next({ request: { headers: clean } });
  }

  const site = host.endsWith(`.${ROOT}`) ? host.slice(0, -(ROOT.length + 1)) : host;
  if (!site) return NextResponse.next();

  const target = url.clone();
  target.pathname = `/s/${site}${url.pathname === "/" ? "" : url.pathname}`;
  const headers = new Headers(req.headers);
  headers.set("x-site-host", host);   // tells pages to build links without the /s/<slug> prefix
  return NextResponse.rewrite(target, { request: { headers } });
}

export const config = {
  matcher: ["/((?!_next/|favicon.ico|robots.txt|sitemap.xml).*)"],
};
