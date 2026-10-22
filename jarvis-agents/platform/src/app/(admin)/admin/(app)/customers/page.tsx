import Link from "next/link";
import { and, count, desc, eq, ilike, max, or } from "drizzle-orm";
import { db, t } from "@/db";
import { currentBusiness } from "@/lib/auth";
import { day } from "@/lib/fmt";
import { Card, Empty, Page, btnLight, input } from "@/components/admin/ui";

export default async function Customers({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { biz } = await currentBusiness();
  const q = ((await searchParams).q ?? "").trim().slice(0, 60);
  const like = `%${q.replace(/[%_\\]/g, (c) => `\\${c}`)}%`;
  const rows = await db.select({
    c: t.customers, visits: count(t.bookings.id), last: max(t.bookings.startsAt),
  }).from(t.customers)
    .leftJoin(t.bookings, eq(t.bookings.customerId, t.customers.id))
    .where(and(
      eq(t.customers.businessId, biz.id),
      q ? or(ilike(t.customers.name, like), ilike(t.customers.phone, like), ilike(t.customers.email, like)) : undefined,
    ))
    .groupBy(t.customers.id)
    .orderBy(desc(max(t.bookings.startsAt)))
    .limit(200);

  return (
    <Page title="Customers" sub="Everyone who has booked with you.">
      <form className="flex gap-2">
        <input className={input} name="q" defaultValue={q} placeholder="Search by name, phone or email" />
        <button className={btnLight}>Search</button>
      </form>
      <Card>
        {rows.length ? (
          <ul className="divide-y divide-stone-100">
            {rows.map(({ c, visits, last }) => (
              <li key={c.id}>
                <Link href={`/admin/customers/${c.id}`} className="flex flex-wrap items-center justify-between gap-3 py-3 hover:bg-stone-50">
                  <div>
                    <div className="font-semibold">{c.name}</div>
                    <div className="text-sm text-stone-500">{[c.phone, c.email].filter(Boolean).join(" · ") || "No contact details"}</div>
                  </div>
                  <div className="text-right text-sm text-stone-500">
                    <div>{visits} booking{visits === 1 ? "" : "s"}</div>
                    {last && <div>Last: {day(last, biz)}</div>}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        ) : <Empty>{q ? "Nobody matches that search." : "No customers yet. They appear here after their first booking."}</Empty>}
      </Card>
    </Page>
  );
}
