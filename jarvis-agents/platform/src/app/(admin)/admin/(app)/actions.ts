"use server";

// Everything the owner can change. Each action looks up the logged-in person's
// business first and only ever touches rows that belong to it.

import { and, eq, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { DateTime } from "luxon";
import { z } from "zod";
import { db, t } from "@/db";
import { currentBusiness } from "@/lib/auth";
import { createBooking } from "@/lib/booking";
import { ICONS, siteContentSchema } from "@/lib/content";
import { hhmmToMin } from "@/lib/fmt";
import { THEMES } from "@/themes";
import { isHealth } from "@/lib/niches";

const str = (f: FormData, k: string) => String(f.get(k) ?? "").trim();
const done = (path = "/admin") => revalidatePath(path, "layout");

// ---------- bookings ----------

export async function setBookingStatus(form: FormData) {
  const { biz } = await currentBusiness();
  const status = z.enum(["confirmed", "cancelled", "completed", "no_show"]).parse(str(form, "status"));
  await db.update(t.bookings).set({ status })
    .where(and(eq(t.bookings.id, str(form, "id")), eq(t.bookings.businessId, biz.id)));
  done();
}

export async function addBooking(form: FormData) {
  const { biz } = await currentBusiness();
  const date = str(form, "date"), time = str(form, "time");
  const start = DateTime.fromISO(`${date}T${time}`, { zone: biz.timezone });
  if (!start.isValid) redirect("/admin/calendar?e=time");
  const res = await createBooking(biz, {
    serviceId: str(form, "serviceId"),
    staffId: str(form, "staffId"),
    start: start.toISO()!,
    name: str(form, "name") || "Walk-in",
    phone: str(form, "phone") || undefined,
    source: "owner",
  });
  done();
  redirect(res.ok ? `/admin/calendar?w=${date}&ok=1` : `/admin/calendar?w=${date}&e=${res.reason}`);
}

// ---------- customers ----------

export async function saveCustomer(form: FormData) {
  const { biz } = await currentBusiness();
  await db.update(t.customers).set({
    name: str(form, "name"),
    phone: str(form, "phone") || null,
    email: str(form, "email") || null,
    // healthcare never keeps notes, so no health details get stored by accident
    notes: isHealth(biz.niche) ? null : str(form, "notes").slice(0, 2000) || null,
  }).where(and(eq(t.customers.id, str(form, "id")), eq(t.customers.businessId, biz.id)));
  done();
}

// ---------- services ----------

const serviceForm = z.object({
  name: z.string().min(1).max(80),
  description: z.string().max(400),
  icon: z.enum(ICONS),
  durationMin: z.coerce.number().int().min(5).max(600),
  price: z.string().max(20),
  priceFrom: z.string().optional(),
});

function serviceValues(form: FormData) {
  const f = serviceForm.parse(Object.fromEntries(form));
  const price = f.price.replace(",", ".").trim();
  return {
    name: f.name, description: f.description, icon: f.icon, durationMin: f.durationMin,
    priceCents: price === "" || !Number.isFinite(Number(price)) ? null : Math.max(0, Math.round(Number(price) * 100)),
    priceFrom: f.priceFrom === "on",
  };
}

export async function saveService(form: FormData) {
  const { biz } = await currentBusiness();
  await db.update(t.services).set(serviceValues(form))
    .where(and(eq(t.services.id, str(form, "id")), eq(t.services.businessId, biz.id)));
  done();
}

export async function addService(form: FormData) {
  const { biz } = await currentBusiness();
  await db.insert(t.services).values({ businessId: biz.id, sort: 999, ...serviceValues(form) });
  done();
}

export async function toggleService(form: FormData) {
  const { biz } = await currentBusiness();
  await db.update(t.services).set({ active: str(form, "active") === "1" })
    .where(and(eq(t.services.id, str(form, "id")), eq(t.services.businessId, biz.id)));
  done();
}

// ---------- team & hours ----------

export async function addStaff(form: FormData) {
  const { biz } = await currentBusiness();
  const [person] = await db.insert(t.staff)
    .values({ businessId: biz.id, name: str(form, "name") || "New team member", title: str(form, "title"), sort: 999 })
    .returning();
  // start them on the same hours as the first person, the owner adjusts after
  const [first] = await db.select().from(t.staff).where(eq(t.staff.businessId, biz.id)).limit(1);
  const copy = await db.select().from(t.hours).where(eq(t.hours.staffId, first.id));
  if (copy.length && first.id !== person.id) {
    await db.insert(t.hours).values(copy.map((h) => ({
      businessId: biz.id, staffId: person.id, weekday: h.weekday, startMin: h.startMin, endMin: h.endMin,
    })));
  }
  done();
}

export async function saveStaff(form: FormData) {
  const { biz } = await currentBusiness();
  const id = str(form, "id");
  const [person] = await db.select().from(t.staff).where(and(eq(t.staff.id, id), eq(t.staff.businessId, biz.id)));
  if (!person) return;

  // hours come in as day1_open=on, day1_start=09:00, day1_end=17:00 ...
  const rows: { weekday: number; startMin: number; endMin: number }[] = [];
  for (let d = 1; d <= 7; d++) {
    if (form.get(`day${d}_open`) !== "on") continue;
    const s = hhmmToMin(str(form, `day${d}_start`) || "09:00");
    const e = hhmmToMin(str(form, `day${d}_end`) || "17:00");
    if (e > s) rows.push({ weekday: d, startMin: s, endMin: e });
  }
  const serviceIds = form.getAll("services").map(String);

  await db.transaction(async (tx) => {
    await tx.update(t.staff).set({
      name: str(form, "name") || person.name,
      title: str(form, "title"),
      active: form.get("active") === "on",
    }).where(eq(t.staff.id, id));
    await tx.delete(t.hours).where(eq(t.hours.staffId, id));
    if (rows.length) await tx.insert(t.hours).values(rows.map((r) => ({ ...r, businessId: biz.id, staffId: id })));

    // which services they do. all ticked = no rows = "does everything"
    await tx.delete(t.staffServices).where(eq(t.staffServices.staffId, id));
    const all = await tx.select({ id: t.services.id }).from(t.services).where(eq(t.services.businessId, biz.id));
    const valid = serviceIds.filter((s) => all.some((a) => a.id === s));
    if (valid.length && valid.length < all.length) {
      await tx.insert(t.staffServices).values(valid.map((serviceId) => ({ staffId: id, serviceId })));
    }
  });
  done();
}

export async function addTimeOff(form: FormData) {
  const { biz } = await currentBusiness();
  const from = DateTime.fromISO(str(form, "from"), { zone: biz.timezone }).startOf("day");
  const to = DateTime.fromISO(str(form, "to") || str(form, "from"), { zone: biz.timezone }).endOf("day");
  if (!from.isValid || !to.isValid || to < from) return;
  const staffId = str(form, "staffId");
  if (staffId) {
    const [p] = await db.select({ id: t.staff.id }).from(t.staff).where(and(eq(t.staff.id, staffId), eq(t.staff.businessId, biz.id)));
    if (!p) return;
  }
  await db.insert(t.timeOff).values({
    businessId: biz.id, staffId: staffId || null,
    startsAt: from.toJSDate(), endsAt: to.toJSDate(), reason: str(form, "reason") || null,
  });
  done();
}

export async function removeTimeOff(form: FormData) {
  const { biz } = await currentBusiness();
  await db.delete(t.timeOff).where(and(eq(t.timeOff.id, str(form, "id")), eq(t.timeOff.businessId, biz.id)));
  done();
}

// ---------- website ----------

export type WebsiteState = { ok?: boolean; error?: string };

export async function saveWebsite(_: WebsiteState, form: FormData): Promise<WebsiteState> {
  const { biz } = await currentBusiness();
  const lines = (k: string) => str(form, k).split("\n").map((s) => s.trim()).filter(Boolean);
  const urlOrNull = (k: string) => str(form, k) || null;

  const faqs = lines("faqs").map((l) => {
    const [q, ...a] = l.split("|");
    return { q: q.trim(), a: a.join("|").trim() };
  }).filter((f) => f.q && f.a);
  const reviews = lines("reviews").map((l) => {
    const [author, rating, ...text] = l.split("|");
    return { author: author?.trim(), rating: Number(rating), text: text.join("|").trim() };
  }).filter((r) => r.author && r.text);

  const parsed = siteContentSchema.safeParse({
    ...biz.content,
    tagline: str(form, "tagline"),
    headline: str(form, "headline"),
    subheadline: str(form, "subheadline"),
    ctaLabel: str(form, "ctaLabel"),
    aboutTitle: str(form, "aboutTitle"),
    about: str(form, "about"),
    highlights: lines("highlights"),
    areasServed: lines("areasServed"),
    faqs,
    reviews,
    palette: { primary: str(form, "primary"), accent: str(form, "accent"), dark: str(form, "dark"), light: str(form, "light") },
    headingFont: str(form, "headingFont"),
    bodyFont: str(form, "bodyFont"),
    logoUrl: urlOrNull("logoUrl"),
    heroImage: urlOrNull("heroImage"),
    gallery: lines("gallery"),
    instagram: urlOrNull("instagram"),
    facebook: urlOrNull("facebook"),
  });
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return { error: `${first.path.join(" ")}: ${first.message}` };
  }
  const theme = str(form, "theme");
  await db.update(t.businesses).set({
    content: parsed.data,
    theme: THEMES[theme] ? theme : biz.theme,
    updatedAt: new Date(),
  }).where(eq(t.businesses.id, biz.id));
  done();
  return { ok: true };
}

// ---------- messages ----------

export async function setEnquiryStatus(form: FormData) {
  const { biz } = await currentBusiness();
  const status = z.enum(["new", "read", "done"]).parse(str(form, "status"));
  await db.update(t.enquiries).set({ status })
    .where(and(eq(t.enquiries.id, str(form, "id")), eq(t.enquiries.businessId, biz.id)));
  done();
}

export async function markAllRead() {
  const { biz } = await currentBusiness();
  await db.update(t.enquiries).set({ status: "read" })
    .where(and(eq(t.enquiries.businessId, biz.id), inArray(t.enquiries.status, ["new"])));
  done();
}

// ---------- settings ----------

export async function saveSettings(form: FormData) {
  const { biz } = await currentBusiness();
  const tz = str(form, "timezone");
  let validTz = biz.timezone;
  try { new Intl.DateTimeFormat("en", { timeZone: tz }); validTz = tz; } catch { /* keep the old one */ }
  const mode = z.enum(["internal", "external", "off"]).catch(biz.bookingMode).parse(str(form, "bookingMode"));
  const channel = z.enum(["whatsapp", "sms", "email"]).catch(biz.reminderChannel).parse(str(form, "reminderChannel"));
  const ext = str(form, "externalBookingUrl");
  const num = (k: string, min: number, max: number, dflt: number) => {
    const n = Number(str(form, k));
    return Number.isFinite(n) ? Math.min(max, Math.max(min, Math.round(n))) : dflt;
  };

  await db.update(t.businesses).set({
    name: str(form, "name") || biz.name,
    phone: str(form, "phone") || null,
    email: str(form, "email") || null,
    address: str(form, "address") || null,
    city: str(form, "city") || null,
    timezone: validTz,
    bookingMode: mode,
    externalBookingUrl: /^https?:\/\//.test(ext) ? ext : null,
    reminderChannel: channel,
    slotStepMin: num("slotStepMin", 5, 120, biz.slotStepMin),
    minNoticeMin: num("minNoticeMin", 0, 10080, biz.minNoticeMin),
    maxDaysAhead: num("maxDaysAhead", 1, 365, biz.maxDaysAhead),
    updatedAt: new Date(),
  }).where(eq(t.businesses.id, biz.id));
  done();
  redirect("/admin/settings?saved=1");
}
