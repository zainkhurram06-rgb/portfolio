import Link from "next/link";
import { notFound } from "next/navigation";
import { and, desc, eq } from "drizzle-orm";
import { db, t } from "@/db";
import { currentBusiness } from "@/lib/auth";
import { dateTime } from "@/lib/fmt";
import { Badge, Card, Field, Page, btn, btnLight, input } from "@/components/admin/ui";
import { saveCustomer } from "../../actions";

export default async function Customer({ params }: { params: Promise<{ id: string }> }) {
  const { biz } = await currentBusiness();
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const [c] = await db.select().from(t.customers).where(and(eq(t.customers.id, id), eq(t.customers.businessId, biz.id)));
  if (!c) notFound();
  const history = await db.select({ b: t.bookings, service: t.services.name, staff: t.staff.name })
    .from(t.bookings)
    .innerJoin(t.services, eq(t.services.id, t.bookings.serviceId))
    .innerJoin(t.staff, eq(t.staff.id, t.bookings.staffId))
    .where(and(eq(t.bookings.customerId, c.id), eq(t.bookings.businessId, biz.id)))
    .orderBy(desc(t.bookings.startsAt));

  return (
    <Page title={c.name} sub={[c.phone, c.email].filter(Boolean).join(" · ")} action={<Link className={btnLight} href="/admin/customers">← All customers</Link>}>
      <Card title="Details">
        <form action={saveCustomer} className="grid gap-4 sm:grid-cols-2">
          <input type="hidden" name="id" value={c.id} />
          <Field name="Name"><input className={input} name="name" defaultValue={c.name} required maxLength={80} /></Field>
          <Field name="Phone"><input className={input} name="phone" defaultValue={c.phone ?? ""} maxLength={40} /></Field>
          <Field name="Email"><input className={input} name="email" type="email" defaultValue={c.email ?? ""} maxLength={120} /></Field>
          {biz.niche !== "clinic" ? (
            <div className="sm:col-span-2">
              <Field name="Notes" hint="Only you see these. Preferences, allergies to products, anything useful.">
                <textarea className={input} name="notes" rows={3} defaultValue={c.notes ?? ""} maxLength={2000} />
              </Field>
            </div>
          ) : (
            <p className="text-sm text-stone-500 sm:col-span-2">Clinic accounts don&apos;t store notes, so no patient health details are kept here.</p>
          )}
          <div className="sm:col-span-2"><button className={btn}>Save</button></div>
        </form>
      </Card>
      <Card title={`Bookings (${history.length})`}>
        <ul className="divide-y divide-stone-100">
          {history.map(({ b, service, staff }) => (
            <li key={b.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
              <div><strong>{dateTime(b.startsAt, biz)}</strong> · {service} <span className="text-stone-500">with {staff}</span></div>
              <Badge tone={b.status === "completed" ? "green" : b.status === "no_show" ? "red" : b.status === "cancelled" ? "stone" : "blue"}>
                {{ confirmed: "Booked", completed: "Done", cancelled: "Cancelled", no_show: "No-show" }[b.status]}
              </Badge>
            </li>
          ))}
        </ul>
      </Card>
    </Page>
  );
}
