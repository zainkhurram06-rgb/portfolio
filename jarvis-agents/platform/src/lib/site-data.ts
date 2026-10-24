// Turns database rows into what a website template reads. No database in here,
// so the template gallery and the tests can build the same thing from samples.

import type { InferSelectModel } from "drizzle-orm";
import type { t } from "@/db";
import { VEHICLE_SIZES, type SiteContent } from "./content";
import { labelsFor, type Labels } from "./labels";

type Biz = InferSelectModel<typeof t.businesses>;
type Locale = { language: string; country: string };
type Money = Locale & { currency: string };

export type SiteService = {
  id: string; name: string; description: string; icon: string;
  durationMin: number; price: string | null;
};

export type SitePackage = { name: string; includes: string[]; prices: { size: string; price: string }[] };

export type SiteData = {
  biz: Biz;
  c: SiteContent;
  services: SiteService[];
  packages: SitePackage[];
  staff: { id: string; name: string; title: string }[];
  hours: { days: string; time: string }[];
  base: string;          // "" on a real domain, "/s/<slug>" on the shared one
  bookHref: string;
  mapsHref: string | null;
  isDemo: boolean;
  year: number;
  dir: "ltr" | "rtl";
  L: Labels;             // the fixed words, in the business's language
};

const RTL = new Set(["ar", "he", "fa", "ur"]);
export const dirFor = (language: string): "ltr" | "rtl" => (RTL.has(language.split("-")[0].toLowerCase()) ? "rtl" : "ltr");

const locale = (b: Locale) => `${b.language}-${b.country}`;

export function formatPrice(cents: number | null, from: boolean, b: Money, L?: Pick<Labels, "from" | "free">) {
  if (cents == null) return null;
  if (cents === 0) return L?.free ?? "Free";
  const money = new Intl.NumberFormat(locale(b), {
    style: "currency", currency: b.currency,
    maximumFractionDigits: cents % 100 === 0 ? 0 : 2,
  }).format(cents / 100);
  return from ? `${L?.from ?? "from"} ${money}` : money;
}

function clock(min: number, b: Locale) {
  const d = new Date(Date.UTC(2024, 0, 1, Math.floor(min / 60) % 24, min % 60));
  return new Intl.DateTimeFormat(locale(b), { hour: "numeric", minute: "2-digit", timeZone: "UTC" }).format(d);
}

function dayName(weekday: number, b: Locale) {
  // 2024-01-01 was a Monday
  const d = new Date(Date.UTC(2024, 0, weekday));
  return new Intl.DateTimeFormat(locale(b), { weekday: "short", timeZone: "UTC" }).format(d);
}

// opening hours = for each day, earliest start to latest finish across the team.
// consecutive days with the same hours are grouped: "Mon to Fri: 9:00 to 17:00"
export function summariseHours(rows: { weekday: number; startMin: number; endMin: number }[], b: Locale, L?: Pick<Labels, "closed" | "to">) {
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

// businesses saved before the trade details existed get empty ones
export const TRADE_DEFAULTS = { credentials: [], warranty: null, insurers: [], packages: [], beforeAfter: [], heroVideo: null } satisfies Partial<SiteContent>;

type Rows = {
  biz: Biz;
  services: { id: string; name: string; description: string; icon: string; durationMin: number; priceCents: number | null; priceFrom: boolean }[];
  staff: { id: string; name: string; title: string }[];
  hours: { weekday: number; startMin: number; endMin: number }[];
  onOwnDomain: boolean;
};

export function buildSiteData({ biz, services, staff, hours, onOwnDomain }: Rows): SiteData {
  const base = onOwnDomain ? "" : `/s/${biz.slug}`;
  const bookHref = biz.bookingMode === "internal" ? `${base}/book`
    : biz.bookingMode === "external" && biz.externalBookingUrl ? biz.externalBookingUrl
    : `${base}/#contact`;
  const c: SiteContent = { ...TRADE_DEFAULTS, ...biz.content };
  const L = labelsFor(c.labels, biz.niche);
  const sizeWord: Record<string, string> = { car: L.bfo_car, suv: L.bfo_suv, van: L.bfo_van };

  return {
    biz,
    c,
    L,
    services: services.map((s) => ({
      id: s.id, name: s.name, description: s.description, icon: s.icon, durationMin: s.durationMin,
      price: formatPrice(s.priceCents, s.priceFrom, biz, L),
    })),
    packages: c.packages.map((p) => ({
      name: p.name,
      includes: p.includes,
      prices: VEHICLE_SIZES.filter((k) => p.prices[k] != null)
        .map((k) => ({ size: sizeWord[k], price: formatPrice(Math.round(p.prices[k]! * 100), false, biz, L)! })),
    })),
    staff,
    hours: summariseHours(hours, biz, L),
    base,
    bookHref,
    mapsHref: biz.address ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${biz.name}, ${biz.address}`)}` : null,
    isDemo: biz.status === "demo",
    year: new Date().getFullYear(),
    dir: dirFor(biz.language),
  };
}
