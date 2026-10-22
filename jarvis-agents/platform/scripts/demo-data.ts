// Fills one business with a realistic week: bookings, customers and messages.
// Handy for showing the dashboard to a prospect. Run:
//   npx tsx --env-file=.env.local scripts/demo-data.ts luna-hair-studio
// It clears that business's existing bookings, customers and messages first.

import { and, eq } from "drizzle-orm";
import { DateTime } from "luxon";
import { db, sql, t } from "../src/db";
import { createBooking } from "../src/lib/booking";

const PEOPLE = [
  ["Aisha Rahman", "+971 50 412 7731"], ["Sofia Marino", "+971 55 208 1194"], ["Hannah Clarke", "+971 52 664 0187"],
  ["Noor Al Mansoori", "+971 50 993 4420"], ["Chloe Bennett", "+971 56 310 7752"], ["Fatima Hassan", "+971 54 771 0936"],
  ["Elena Petrova", "+971 58 145 6623"], ["Priya Nair", "+971 50 387 2219"], ["Layla Haddad", "+971 55 902 4471"],
  ["Grace Okafor", "+971 52 418 3360"], ["Mariam Saeed", "+971 56 236 9014"], ["Julia Novak", "+971 54 670 2285"],
];

async function main() {
  const slug = process.argv[2] ?? "luna-hair-studio";
  const [biz] = await db.select().from(t.businesses).where(eq(t.businesses.slug, slug));
  if (!biz) throw new Error(`no business ${slug}`);

  await db.delete(t.bookings).where(eq(t.bookings.businessId, biz.id));
  await db.delete(t.customers).where(eq(t.customers.businessId, biz.id));
  await db.delete(t.enquiries).where(eq(t.enquiries.businessId, biz.id));

  const services = await db.select().from(t.services).where(and(eq(t.services.businessId, biz.id), eq(t.services.active, true)));
  const staff = await db.select().from(t.staff).where(eq(t.staff.businessId, biz.id));
  const today = DateTime.now().setZone(biz.timezone).startOf("day");

  // a spread of bookings over the next week, placed by the owner so any hour works
  const plan: [number, string, number, number][] = [
    // [day offset, time, service index, staff index]
    [0, "10:00", 0, 0], [0, "11:30", 3, 1], [0, "13:00", 1, 1], [0, "15:30", 0, 0], [0, "18:00", 3, 0],
    [1, "10:30", 2, 1], [1, "12:00", 0, 0], [1, "16:00", 4, 0],
    [2, "11:00", 1, 1], [2, "14:00", 0, 0], [3, "18:30", 3, 1], [4, "10:00", 2, 0], [5, "12:30", 0, 1],
  ];
  let i = 0;
  for (const [offset, hhmm, si, pi] of plan) {
    const [name, phone] = PEOPLE[i++ % PEOPLE.length];
    const start = DateTime.fromISO(`${today.plus({ days: offset }).toISODate()}T${hhmm}`, { zone: biz.timezone });
    const res = await createBooking(biz, {
      serviceId: services[si % services.length].id, staffId: staff[pi % staff.length].id,
      start: start.toISO()!, name, phone, source: i % 3 === 0 ? "phone" : "owner",
    });
    // earlier today: mark as done, like a real afternoon
    if (res.ok && offset === 0 && start < DateTime.now()) {
      await db.update(t.bookings).set({ status: "completed" }).where(eq(t.bookings.id, res.bookingId));
    }
  }
  // bookings that came in online should say so
  await db.update(t.bookings).set({ source: "online" }).where(and(eq(t.bookings.businessId, biz.id), eq(t.bookings.source, "owner")));

  await db.insert(t.enquiries).values([
    { businessId: biz.id, name: "Rania Youssef", phone: "+971 50 118 2290", service: "Balayage", message: "Hi! Do you have anything this Saturday for balayage? My hair is quite long, shoulder blades.", status: "new" },
    { businessId: biz.id, name: "Kate Morrison", email: "kate.m@example.com", phone: "+971 55 640 7713", service: "Cut and blow-dry", message: "Do you do bridal hair? Wedding is on 14 December, party of 4.", status: "new" },
    { businessId: biz.id, name: "Dana Kim", phone: "+971 52 903 4418", service: "Keratin treatment", message: "How long does the keratin last on curly hair?", status: "read" },
  ]);
  console.log(`filled ${biz.name}`);
  await sql.end();
}

main().catch(async (e) => { console.error(e); await sql.end(); process.exit(1); });
