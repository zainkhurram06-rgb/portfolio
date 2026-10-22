// One template, filled with a sample business.
//   /templates/carwash-gloss?niche=carwash&photos=0&lang=ar

import { notFound } from "next/navigation";
import { brandVars } from "@/lib/brand-css";
import { NICHE_KEYS, type Niche } from "@/lib/niches";
import { TEMPLATES, TemplatePage } from "@/templates";
import { sampleSite } from "@/templates/samples";

type Props = { params: Promise<{ id: string }>; searchParams: Promise<Record<string, string | undefined>> };

export default async function TemplatePreview({ params, searchParams }: Props) {
  const t = TEMPLATES[(await params).id];
  if (!t) notFound();
  const q = await searchParams;
  const niche: Niche = NICHE_KEYS.includes(q.niche as Niche) && t.niches.includes(q.niche as Niche) ? (q.niche as Niche) : t.niches[0];
  const d = sampleSite(niche, { photos: q.photos !== "0", lang: q.lang, palette: t.palette, fonts: t.fonts });
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: brandVars(d.c) }} />
      <TemplatePage t={t} d={d} />
    </>
  );
}
