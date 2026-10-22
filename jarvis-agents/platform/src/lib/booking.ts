// Booking against the real database: load what is needed for one day, ask the
// slot engine, and create bookings safely.

import { and, asc, eq, gt, inArray, lt, sql } from "drizzle-orm";
import { DateTime } from "luxon";
import { db, t } from "@/db";
import { availableSlots, type Busy, type Slot } from "./slots";
import { isHealth } from "./niches";

type Biz = typeof t.businesses.$inferSelect;

async function staffForService(businessId: string, serviceId: string) {
  const people = await db.select().from(t.staff)
    .where(and(eq(t.staff.businessId, businessId), eq(t.staff.active, true)))
    .orderBy(asc(t.staff.sort));
  if (!people.length) return [];
  const links = await db.select().from(t.staffServices)
    .where(inArray(t.staffServices.staffId, people.map((p) => p.id)));
  // someone with no links does every service
  return people.filter((p) => {
    const mine = links.filter((l) => l.staffId === p.id);
    return mine.length === 0 || mine.some((l) => l.serviceId === serviceId);
  });
}

export async function getSlots(biz: Biz, serviceId: string, date: string, staffId?: string): Promise<Slot[]> {
  const [service] = await db.select().from(t.services)
    .where(and(eq(t.services.id, serviceId), eq(t.services.businessId, biz.id), eq(t.services.active, true)));
  if (!service) return [];

  let people = await staffForService(biz.id, serviceId);
  if (staffId) people = people.filter((p) => p.id === staffId);
  if (!people.length) return [];
  const ids = people.map((p) => p.id);

  // a generous window around the day covers every timezone edge
  const day = DateTime.fromISO(date, { zone: biz.timezone });
  if (!day.isValid) return [];
  const from = day.startOf("day").minus({ hours: 2 }).toJSDate();
  const to = day.endOf("day").plus({ hours: 2 }).toJSDate();

  const [hourRows, bookingRows, offRows] = await Promise.all([
    db.select().from(t.hours).where(inArray(t.hours.staffId, ids)),
    db.select().from(t.bookings).where(and(
      inArray(t.bookings.staffId, ids),
      inArray(t.bookings.status, ["confirmed", "completed"]),
      lt(t.bookings.startsAt, to), gt(t.bookings.endsAt, from),
    )),
    db.select().from(t.timeOff).where(and(
      eq(t.timeOff.businessId, biz.id),
      lt(t.timeOff.startsAt, to), gt(t.timeOff.endsAt, from),
    )),
  ]);

  const toBusy = (r: { startsAt: Date; endsAt: Date }): Busy => ({ start: r.startsAt, end: r.endsAt });

  return availableSlots({
    date,
    timezone: biz.timezone,
    durationMin: service.durationMin,
    stepMin: biz.slotStepMin,
    minNoticeMin: biz.minNoticeMin,
    maxDaysAhead: biz.maxDaysAhead,
    now: new Date(),
    closed: offRows.filter((o) => o.staffId === null).map(toBusy),
    staff: people.map((p) => ({
      id: p.id,
      hours: hourRows.filter((h) => h.staffId === p.id),
      busy: [
        ...bookingRows.filter((b) => b.staffId === p.id).map(toBusy),
        ...offRows.filter((o) => o.staffId === p.id).map(toBusy),
      ],
    })),
  });
}

export type NewBooking = {
  serviceId: string;
  start: string;          // ISO, must be one of the offered slots
  staffId?: string;       // empty = anyone free
  name: string;
  phone?: string;
  email?: string;
  note?: string;
  details?: Record<string, string>;   // already checked with cleanDetails
  source?: "online" | "owner" | "phone";
};

export type BookingResult =
  | { ok: true; bookingId: string; startsAt: Date; staffId: string }
  | { ok: false; reason: "slot_taken" | "not_found" | "bookings_off" };

export async function createBooking(biz: Biz, input: NewBooking): Promise<BookingResult> {
  const byOwner = input.source === "owner" || input.source === "phone";
  if (biz.bookingMode !== "internal" && !byOwner) return { ok: false, reason: "bookings_off" };

  const start = DateTime.fromISO(input.start, { setZone: true });
  if (!start.isValid) return { ok: false, reason: "not_found" };
  const localDate = start.setZone(biz.timezone).toISODate()!;

  const [service] = await db.select().from(t.services)
    .where(and(eq(t.services.id, input.serviceId), eq(t.services.businessId, biz.id)));
  if (!service) return { ok: false, reason: "not_found" };

  let staffIds: string[];
  if (byOwner && input.staffId) {
    // the owner can squeeze someone in outside the online rules (walk-ins,
    // after hours). the database still refuses a real double booking.
    const [person] = await db.select({ id: t.staff.id }).from(t.staff)
      .where(and(eq(t.staff.id, input.staffId), eq(t.staff.businessId, biz.id)));
    if (!person) return { ok: false, reason: "not_found" };
    staffIds = [person.id];
  } else {
    // re-check against live data, never trust the slot the browser sent
    const slots = await getSlots(biz, input.serviceId, localDate, input.staffId);
    const slot = slots.find((s) => DateTime.fromISO(s.start).toMillis() === start.toMillis());
    if (!slot) return { ok: false, reason: "slot_taken" };
    staffIds = slot.staffIds;
  }
  const phone = input.phone?.trim() || null;
  const email = input.email?.trim().toLowerCase() || null;
  // healthcare never keeps free-text notes on bookings, so no health details end up stored
  const note = isHealth(biz.niche) ? null : input.note?.trim().slice(0, 500) || null;

  for (const staffId of staffIds) {
   for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const result = await db.transaction(async (tx) => {
        // bookings for the same person queue up here instead of racing. without
        // this, postgres's overlap guard can deadlock two simultaneous bookings.
        await tx.execute(sql`select pg_advisory_xact_lock(hashtextextended(${staffId}, 0))`);
        const match = phone
          ? and(eq(t.customers.businessId, biz.id), eq(t.customers.phone, phone))
          : email
            ? and(eq(t.customers.businessId, biz.id), eq(t.customers.email, email))
            : undefined;
        let [customer] = match ? await tx.select().from(t.customers).where(match) : [];
        if (!customer) {
          // same phone twice at once (a double tap) lands on one customer, not an error
          [customer] = await tx.insert(t.customers)
            .values({ businessId: biz.id, name: input.name.trim(), phone, email })
            .onConflictDoUpdate({
              target: [t.customers.businessId, t.customers.phone],
              set: { name: input.name.trim() },
            })
            .returning();
        }
        const [booking] = await tx.insert(t.bookings).values({
          businessId: biz.id,
          serviceId: service.id,
          staffId,
          customerId: customer.id,
          startsAt: start.toJSDate(),
          endsAt: start.plus({ minutes: service.durationMin }).toJSDate(),
          source: input.source ?? "online",
          note,
          details: input.details ?? {},
        }).returning();
        return booking;
      });
      return { ok: true, bookingId: result.id, startsAt: result.startsAt, staffId };
    } catch (e) {
      const code = pgCode(e);
      // the database's overlap guard fired: someone grabbed this person a moment
      // ago. try the next free person for the same slot.
      if (code === "23P01") break;
      // two people booking the same person at the same instant can make postgres
      // cancel one of them as a deadlock. that's not a "no", so wait a beat and retry.
      if ((code === "40P01" || code === "40001") && attempt < 3) {
        await new Promise((r) => setTimeout(r, 20 + Math.random() * 80));
        continue;
      }
      throw e;
    }
   }
  }
  return { ok: false, reason: "slot_taken" };
}

// the postgres error code, whether drizzle wrapped the error or not
function pgCode(e: unknown): string | undefined {
  const err = e as { code?: unknown; cause?: { code?: unknown } };
  const c = typeof err?.cause?.code === "string" ? err.cause.code : err?.code;
  return typeof c === "string" ? c : undefined;
}

// days in the next few weeks that have at least one opening, for the date picker
export async function openDays(biz: Biz, serviceId: string, days = 21) {
  const today = DateTime.now().setZone(biz.timezone).startOf("day");
  const out: string[] = [];
  for (let i = 0; i < Math.min(days, biz.maxDaysAhead); i++) {
    const d = today.plus({ days: i }).toISODate()!;
    if ((await getSlots(biz, serviceId, d)).length) out.push(d);
  }
  return out;
}
