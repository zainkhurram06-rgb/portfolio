import Link from "next/link";
import { DateTime } from "luxon";
import { currentBusiness } from "@/lib/auth";
import { bookingsBetween, servicesAndStaff } from "@/lib/admin-data";
import { longDay, todayISO } from "@/lib/fmt";
import { BookingRow } from "@/components/admin/booking-row";
import { Card, Empty, Field, Page, btn, btnLight, input } from "@/components/admin/ui";
import { addBooking } from "../actions";

const ERRORS: Record<string, string> = {
  slot_taken: "That person is already booked at that time.",
  not_found: "Pick a service and a team member.",
  time: "That date or time doesn't look right.",
};

export default async function Calendar({ searchParams }: { searchParams: Promise<{ w?: string; ok?: string; e?: string }> }) {
  const { biz } = await currentBusiness();
  const q = await searchParams;
  const anchor = DateTime.fromISO(q.w ?? todayISO(biz), { zone: biz.timezone });
  const monday = (anchor.isValid ? anchor : DateTime.now().setZone(biz.timezone)).startOf("week");
  const sunday = monday.plus({ days: 7 });
  const [rows, { services, staff }] = await Promise.all([
    bookingsBetween(biz, monday.toJSDate(), sunday.toJSDate()),
    servicesAndStaff(biz),
  ]);
  const days = Array.from({ length: 7 }, (_, i) => monday.plus({ days: i }));
  const label = `${monday.toFormat("d LLL")} to ${sunday.minus({ days: 1 }).toFormat("d LLL yyyy")}`;
  const nav = (d: DateTime) => `/admin/calendar?w=${d.toISODate()}`;

  return (
    <Page title="Calendar" sub={label} action={
      <div className="flex gap-2">
        <Link className={btnLight} href={nav(monday.minus({ weeks: 1 }))}>← Previous</Link>
        <Link className={btnLight} href="/admin/calendar">This week</Link>
        <Link className={btnLight} href={nav(monday.plus({ weeks: 1 }))}>Next →</Link>
      </div>
    }>
      {q.ok && <div className="rounded-2xl bg-emerald-50 px-5 py-3 font-medium text-emerald-800">Booking added.</div>}
      {q.e && <div className="rounded-2xl bg-red-50 px-5 py-3 font-medium text-red-800">{ERRORS[q.e] ?? "That booking couldn't be added."}</div>}

      {days.map((d) => {
        const mine = rows.filter((r) => DateTime.fromJSDate(r.startsAt).setZone(biz.timezone).hasSame(d, "day"));
        const isToday = d.hasSame(DateTime.now().setZone(biz.timezone), "day");
        return (
          <Card key={d.toISODate()} title={`${longDay(d.toJSDate(), biz)}${isToday ? " · Today" : ""}`}
            className={isToday ? "ring-2 ring-stone-900" : ""}>
            {mine.length ? <ul className="divide-y divide-stone-100">{mine.map((b) => <BookingRow key={b.row.id} r={b.row} />)}</ul>
              : <Empty>Nothing booked.</Empty>}
          </Card>
        );
      })}

      <Card title="Add a booking" className="scroll-mt-6">
        <form id="add" action={addBooking} className="grid gap-4 sm:grid-cols-2">
          <Field name="Service">
            <select className={input} name="serviceId" required>
              {services.filter((s) => s.active).map((s) => <option key={s.id} value={s.id}>{s.name} ({s.durationMin} min)</option>)}
            </select>
          </Field>
          <Field name="With">
            <select className={input} name="staffId" required>
              {staff.filter((s) => s.active).map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </Field>
          <Field name="Date"><input className={input} type="date" name="date" required defaultValue={todayISO(biz)} /></Field>
          <Field name="Time"><input className={input} type="time" name="time" required step={300} /></Field>
          <Field name="Customer name"><input className={input} name="name" placeholder="Walk-in" maxLength={80} /></Field>
          <Field name="Phone"><input className={input} name="phone" type="tel" maxLength={40} /></Field>
          <div className="sm:col-span-2"><button className={btn}>Add booking</button></div>
        </form>
      </Card>
    </Page>
  );
}
