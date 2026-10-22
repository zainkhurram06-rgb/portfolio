// Everything a public website needs, loaded once per page and handed to the theme.

import { and, asc, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { cache } from "react";
import { db, t } from "@/db";
import type { SiteContent } from "./content";
import { labelsFor, type Labels } from "./labels";

export type SiteService = {
  id: string; name: string; description: string; icon: string;
  durationMin: number; price: string | null;
};

export type SiteData = {
  biz: typeof t.businesses.$inferSelect;
  c: SiteContent;
  services: SiteService[];
  staff: { id: string; name: string; title: string }[];
  hours: { days: string; time: string }[];
  base: string;          // "" on a real domain, "/s/<slug>" on the shared one
  bookHref: string;
  isDemo: boolean;
  year: number;
  L: Labels;             // the fixed words, in the business's language
};

const locale = (b: { language: string; country: string }) => `${b.language}-${b.country}`;

export function formatPrice(cents: number | null, from: boolean, b: { language: string; country: string; currency: string }, L?: Pick<Labels, "from" | "free">) {
  if (cents == null) return null;
  if (cents === 0) return L?.free ?? "Free";
  const money = new Intl.NumberFormat(locale(b), {
    style: "currency", currency: b.currency,
    maximumFractionDigits: cents % 100 === 0 ? 0 : 2,
  }).format(cents / 100);
  return from ? `${L?.from ?? "from"} ${money}` : money;
}

function clock(min: number, b: { language: string; country: string }) {
  const d = new Date(Date.UTC(2024, 0, 1, Math.floor(min / 60) % 24, min % 60));
  return new Intl.DateTimeFormat(locale(b), { hour: "numeric", minute: "2-digit", timeZone: "UTC" }).format(d);
}

function dayName(weekday: number, b: { language: string; country: string }) {
  // 2024-01-01 was a Monday
  const d = new Date(Date.UTC(2024, 0, weekday));
  return new Intl.DateTimeFormat(locale(b), { weekday: "short", timeZone: "UTC" }).format(d);
}

// opening hours = for each day, earliest start to latest finish across the team.
// consecutive days with the same hours are grouped: "Mon to Fri: 9:00 to 17:00"
export function summariseHours(rows: { weekday: number; startMin: number; endMin: number }[], b: { language: string; country: string }, L?: Pick<Labels, "closed" | "to">) {
  const to = L?.to ?? "to";
  const byDay = new Map<number, string>();
  for (let d = 1; d <= 7; d++) {
    const today = rows.filter((r) => r.weekday === d);
    byDay.set(d, today.length
      ? `${clock(Math.min(...today.map((r) => r.startMin)), b)} ${to} ${clock(Math.max(...today.map((r) => r.endMin)), b)}`
      : L?.closed ?? "Closed");
  }
  const out: { days: string; time: string }[] = [];
  let start = 1;
  for (let d = 2; d <= 8; d++) {
    if (d === 8 || byDay.get(d) !== byDay.get(start)) {
      const end = d - 1;
      out.push({
        days: start === end ? dayName(start, b) : `${dayName(start, b)} ${to} ${dayName(end, b)}`,
        time: byDay.get(start)!,
      });
      start = d;
    }
  }
  return out;
}

export const loadSite = cache(async (site: string): Promise<SiteData | null> => {
  const key = decodeURIComponent(site).toLowerCase();
  const [biz] = await db.select().from(t.businesses).where(
    key.includes(".") ? eq(t.businesses.customDomain, key) : eq(t.businesses.slug, key),
  );
  if (!biz || biz.status === "paused") return null;

  const [svc, people, hourRows] = await Promise.all([
    db.select().from(t.services).where(and(eq(t.services.businessId, biz.id), eq(t.services.active, true))).orderBy(asc(t.services.sort)),
    db.select().from(t.staff).where(and(eq(t.staff.businessId, biz.id), eq(t.staff.active, true))).orderBy(asc(t.staff.sort)),
    db.select().from(t.hours).where(eq(t.hours.businessId, biz.id)),
  ]);

  // the proxy tells us whether this request came in on the business's own host
  const h = await headers();
  const base = h.get("x-site-host") ? "" : `/s/${biz.slug}`;
  const bookHref = biz.bookingMode === "internal" ? `${base}/book`
    : biz.bookingMode === "external" && biz.externalBookingUrl ? biz.externalBookingUrl
    : `${base}/#contact`;

  const L = labelsFor(biz.content.labels);
  return {
    biz,
    c: biz.content,
    L,
    services: svc.map((s) => ({
      id: s.id, name: s.name, description: s.description, icon: s.icon, durationMin: s.durationMin,
      price: formatPrice(s.priceCents, s.priceFrom, biz, L),
    })),
    staff: people.map((p) => ({ id: p.id, name: p.name, title: p.title })),
    hours: summariseHours(hourRows, biz, L),
    base,
    bookHref,
    isDemo: biz.status === "demo",
    year: new Date().getFullYear(),
  };
});
