import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { BookingFlow } from "@/components/site/booking-flow";
import { DemoRibbon } from "@/components/site/bits";
import { loadSite } from "@/lib/site";
import { fill } from "@/lib/labels";
import { css } from "./css";

type Props = { params: Promise<{ site: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const d = await loadSite((await params).site);
  return d ? { title: `Book | ${d.biz.name}`, robots: d.isDemo ? { index: false, follow: false } : undefined } : {};
}

export default async function BookPage({ params }: Props) {
  const d = await loadSite((await params).site);
  if (!d) notFound();
  if (d.biz.bookingMode === "external" && d.biz.externalBookingUrl) redirect(d.biz.externalBookingUrl);
  if (d.biz.bookingMode !== "internal") redirect(`${d.base}/#contact`);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <DemoRibbon text={fill(d.L.demo_ribbon, { name: d.biz.name })} show={d.isDemo} />
      <header className="bk-top">
        <a href={`${d.base}/`}>← {d.biz.name}</a>
        {d.biz.phone && <a href={`tel:${d.biz.phone.replace(/[^\d+]/g, "")}`}>{d.biz.phone}</a>}
      </header>
      <main className="bk-wrap">
        <h1>{d.c.ctaLabel}</h1>
        <p className="bk-muted">{fill(d.L.bk_title_times, { place: d.biz.city ?? d.biz.timezone })}</p>
        <BookingFlow
          slug={d.biz.slug}
          name={d.biz.name}
          homeHref={`${d.base}/`}
          locale={`${d.biz.language}-${d.biz.country}`}
          timezone={d.biz.timezone}
          phone={d.biz.phone}
          isClinic={d.biz.niche === "clinic"}
          services={d.services}
          staff={d.staff}
          L={d.L}
        />
      </main>
    </>
  );
}
