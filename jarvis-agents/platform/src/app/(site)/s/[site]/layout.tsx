// Root layout for every client website. Separate from the dashboard's layout so
// a theme's styles can never leak into the dashboard, or the other way round.

import { notFound } from "next/navigation";
import { loadSite } from "@/lib/site";
import { brandVars, fontsHref } from "@/lib/brand-css";

export default async function SiteLayout({ children, params }: {
  children: React.ReactNode;
  params: Promise<{ site: string }>;
}) {
  const d = await loadSite((await params).site);
  if (!d) notFound();
  return (
    <html lang={d.biz.language}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="stylesheet" href={fontsHref(d.c)} />
        <style dangerouslySetInnerHTML={{ __html: brandVars(d.c) }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
