// Dates, times and money, always in the business's own timezone and language.

import { DateTime } from "luxon";

type Biz = { timezone: string; language: string; country: string; currency: string };
const loc = (b: Biz) => `${b.language}-${b.country}`;

export const time = (d: Date, b: Biz) =>
  new Intl.DateTimeFormat(loc(b), { hour: "numeric", minute: "2-digit", timeZone: b.timezone }).format(d);
export const day = (d: Date, b: Biz) =>
  new Intl.DateTimeFormat(loc(b), { weekday: "short", day: "numeric", month: "short", timeZone: b.timezone }).format(d);
export const longDay = (d: Date, b: Biz) =>
  new Intl.DateTimeFormat(loc(b), { weekday: "long", day: "numeric", month: "long", timeZone: b.timezone }).format(d);
export const dateTime = (d: Date, b: Biz) =>
  new Intl.DateTimeFormat(loc(b), { day: "numeric", month: "short", hour: "numeric", minute: "2-digit", timeZone: b.timezone }).format(d);

export function money(cents: number | null, b: Biz) {
  if (cents == null) return "Quote";
  if (cents === 0) return "Free";
  return new Intl.NumberFormat(loc(b), { style: "currency", currency: b.currency, maximumFractionDigits: cents % 100 ? 2 : 0 }).format(cents / 100);
}

// the start and end of a local day, as real moments
export function dayBounds(isoDate: string, b: Biz) {
  const start = DateTime.fromISO(isoDate, { zone: b.timezone }).startOf("day");
  return { start: start.toJSDate(), end: start.plus({ days: 1 }).toJSDate(), dt: start };
}

export const todayISO = (b: Biz) => DateTime.now().setZone(b.timezone).toISODate()!;

export const minToHHMM = (m: number) => `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
export const hhmmToMin = (s: string) => { const [h, m] = s.split(":").map(Number); return h * 60 + m; };
