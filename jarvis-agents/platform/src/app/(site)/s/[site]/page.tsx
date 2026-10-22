import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { loadSite } from "@/lib/site";
import { themeFor } from "@/themes";

type Props = { params: Promise<{ site: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const d = await loadSite((await params).site);
  if (!d) return {};
  return {
    title: `${d.biz.name} | ${d.c.tagline}`,
    description: d.c.subheadline,
    // demos must never show up in Google
    robots: d.isDemo ? { index: false, follow: false } : undefined,
  };
}

export default async function SitePage({ params }: Props) {
  const d = await loadSite((await params).site);
  if (!d) notFound();
  const theme = themeFor(d.biz.theme, d.biz.niche);
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: theme.css }} />
      <theme.Component d={d} />
    </>
  );
}
