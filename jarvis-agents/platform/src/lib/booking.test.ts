// Runs against the real database (DATABASE_URL). Creates its own throwaway
// businesses and deletes them afterwards.

import { after, test } from "node:test";
import assert from "node:assert/strict";
import { eq } from "drizzle-orm";
import { DateTime } from "luxon";
import { db, sql, t } from "@/db";
import { createBusiness } from "./business";
import { createBooking, getSlots } from "./booking";

const made: string[] = [];
after(async () => {
  for (const id of made) await db.delete(t.businesses).where(eq(t.businesses.id, id));
  await db.delete(t.users).where(eq(t.users.email, "booking-test@example.com"));
  await sql.end();
});

async function testBusiness(staffCount: number, niche: "salon" | "clinic" = "salon") {
  const { business } = await createBusiness({
    name: `Booking Test ${Math.random().toString(36).slice(2, 7)}`,
    niche, theme: niche, country: "AE", currency: "AED", timezone: "Asia/Dubai",
    content: {
      tagline: "t", headline: "h", subheadline: "s", ctaLabel: "Book", aboutTitle: "a", about: "a",
      highlights: ["a", "b", "c"], palette: { primary: "#111111", accent: "#222222", dark: "#000000", light: "#ffffff" },
      headingFont: "Fraunces", bodyFont: "Inter",
    },
    services: [{ name: "Cut", durationMin: 60, price: 100 }],
    staff: Array.from({ length: staffCount }, (_, i) => ({ name: `Staff ${i + 1}` })),
    hours: [1, 2, 3, 4, 5, 6, 7].map((weekday) => ({ weekday, start: "09:00", end: "18:00" })),
    owner: { name: "Test", email: "booking-test@example.com" },
  });
  made.push(business.id);
  const [service] = await db.select().from(t.services).where(eq(t.services.businessId, business.id));
  const date = DateTime.now().setZone("Asia/Dubai").plus({ days: 3 }).toISODate()!;
  return { business, service, date };
}

test("a booked slot disappears from availability", async () => {
  const { business, service, date } = await testBusiness(1);
  const before = await getSlots(business, service.id, date);
  assert.ok(before.length > 0);
  const res = await createBooking(business, { serviceId: service.id, start: before[0].start, name: "Ali", phone: "+971500000001" });
  assert.equal(res.ok, true);
  const afterSlots = await getSlots(business, service.id, date);
  assert.ok(!afterSlots.some((s) => s.start === before[0].start));
});

test("five people grabbing one slot with one staff member: exactly one wins", async () => {
  const { business, service, date } = await testBusiness(1);
  const [slot] = await getSlots(business, service.id, date);
  const results = await Promise.all(Array.from({ length: 5 }, (_, i) =>
    createBooking(business, { serviceId: service.id, start: slot.start, name: `P${i}`, phone: `+97150000010${i}` })));
  assert.equal(results.filter((r) => r.ok).length, 1);
});

test("with two staff, two people can take the same time", async () => {
  const { business, service, date } = await testBusiness(2);
  const [slot] = await getSlots(business, service.id, date);
  const results = await Promise.all(Array.from({ length: 4 }, (_, i) =>
    createBooking(business, { serviceId: service.id, start: slot.start, name: `P${i}`, phone: `+97150000020${i}` })));
  const wins = results.filter((r) => r.ok);
  assert.equal(wins.length, 2);
  assert.notEqual((wins[0] as { staffId: string }).staffId, (wins[1] as { staffId: string }).staffId);
});

test("a made-up time that was never offered is refused", async () => {
  const { business, service, date } = await testBusiness(1);
  const odd = DateTime.fromISO(`${date}T09:07`, { zone: "Asia/Dubai" }).toISO()!;
  const res = await createBooking(business, { serviceId: service.id, start: odd, name: "X", phone: "+971500000300" });
  assert.deepEqual(res, { ok: false, reason: "slot_taken" });
});

test("clinics never store booking notes", async () => {
  const { business, service, date } = await testBusiness(1, "clinic");
  const [slot] = await getSlots(business, service.id, date);
  const res = await createBooking(business, { serviceId: service.id, start: slot.start, name: "Y", phone: "+971500000400", note: "tooth pain" });
  assert.ok(res.ok);
  const [row] = await db.select().from(t.bookings).where(eq(t.bookings.id, (res as { bookingId: string }).bookingId));
  assert.equal(row.note, null);
});

test("the same customer double-tapping book gets one booking, no crash", async () => {
  const { business, service, date } = await testBusiness(1);
  const [slot] = await getSlots(business, service.id, date);
  const results = await Promise.all([0, 1, 2].map(() =>
    createBooking(business, { serviceId: service.id, start: slot.start, name: "Same", phone: "+971500000500" })));
  assert.equal(results.filter((r) => r.ok).length, 1);
  const people = await db.select().from(t.customers).where(eq(t.customers.businessId, business.id));
  assert.equal(people.length, 1);
});
