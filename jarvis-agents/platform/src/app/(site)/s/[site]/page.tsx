import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { loadSite } from "@/lib/site";
import { TemplatePage, templateFor } from "@/templates";

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
  return <TemplatePage t={templateFor(d.biz.theme, d.biz.niche)} d={d} />;
}
