// Queries the dashboard pages share. Every one takes the business id.

import { and, asc, desc, eq, gte, lt } from "drizzle-orm";
import { db, t } from "@/db";
import { time } from "./fmt";
import { englishFor } from "./labels";
import { describeDetails } from "./niches";
import type { Row } from "@/components/admin/booking-row";

type Biz = typeof t.businesses.$inferSelect;

export async function bookingsBetween(biz: Biz, from: Date, to: Date) {
  const rows = await db.select({
    b: t.bookings, customer: t.customers.name, phone: t.customers.phone,
    service: t.services.name, staff: t.staff.name,
  }).from(t.bookings)
    .innerJoin(t.customers, eq(t.customers.id, t.bookings.customerId))
    .innerJoin(t.services, eq(t.services.id, t.bookings.serviceId))
    .innerJoin(t.staff, eq(t.staff.id, t.bookings.staffId))
    .where(and(eq(t.bookings.businessId, biz.id), gte(t.bookings.startsAt, from), lt(t.bookings.startsAt, to)))
    .orderBy(asc(t.bookings.startsAt));
  const words = englishFor(biz.niche);
  return rows.map((r) => ({
    startsAt: r.b.startsAt,
    row: {
      id: r.b.id, when: time(r.b.startsAt, biz), customer: r.customer, phone: r.phone,
      service: r.service, staff: r.staff, status: r.b.status, source: r.b.source,
      details: describeDetails(biz.niche, r.b.details, words),
    } satisfies Row,
  }));
}

export async function recentEnquiries(biz: Biz, limit = 50) {
  return db.select().from(t.enquiries).where(eq(t.enquiries.businessId, biz.id))
    .orderBy(desc(t.enquiries.createdAt)).limit(limit);
}

export async function servicesAndStaff(biz: Biz) {
  const [services, staff] = await Promise.all([
    db.select().from(t.services).where(eq(t.services.businessId, biz.id)).orderBy(asc(t.services.sort), asc(t.services.name)),
    db.select().from(t.staff).where(eq(t.staff.businessId, biz.id)).orderBy(asc(t.staff.sort), asc(t.staff.name)),
  ]);
  return { services, staff };
}
