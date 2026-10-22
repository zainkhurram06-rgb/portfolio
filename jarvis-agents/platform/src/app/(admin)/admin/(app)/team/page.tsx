import { and, asc, eq, gte } from "drizzle-orm";
import { db, t } from "@/db";
import { currentBusiness } from "@/lib/auth";
import { servicesAndStaff } from "@/lib/admin-data";
import { day, minToHHMM, todayISO } from "@/lib/fmt";
import { Badge, Card, Empty, Field, Page, btn, btnDanger, btnLight, input } from "@/components/admin/ui";
import { addStaff, addTimeOff, removeTimeOff, saveStaff } from "../actions";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export default async function Team() {
  const { biz } = await currentBusiness();
  const { services, staff } = await servicesAndStaff(biz);
  const [hours, links, off] = await Promise.all([
    db.select().from(t.hours).where(eq(t.hours.businessId, biz.id)),
    db.select().from(t.staffServices).innerJoin(t.staff, eq(t.staff.id, t.staffServices.staffId)).where(eq(t.staff.businessId, biz.id)),
    db.select().from(t.timeOff).where(and(eq(t.timeOff.businessId, biz.id), gte(t.timeOff.endsAt, new Date()))).orderBy(asc(t.timeOff.startsAt)),
  ]);

  return (
    <Page title="Team & hours" sub="Who works when, and what they do. Online booking follows these hours.">
      {staff.map((p) => {
        const mine = hours.filter((h) => h.staffId === p.id);
        const does = links.filter((l) => l.staff_services.staffId === p.id).map((l) => l.staff_services.serviceId);
        return (
          <Card key={p.id}>
            <details>
              <summary className="flex cursor-pointer list-none flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="font-semibold">{p.name} {!p.active && <Badge>Not taking bookings</Badge>}</div>
                  <div className="text-sm text-stone-500">{p.title || "Team member"} · works {new Set(mine.map((h) => h.weekday)).size} days a week</div>
                </div>
                <span className={btnLight}>Edit</span>
              </summary>
              <form action={saveStaff} className="mt-5 grid gap-5 border-t border-stone-100 pt-5">
                <input type="hidden" name="id" value={p.id} />
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field name="Name"><input className={input} name="name" defaultValue={p.name} required maxLength={80} /></Field>
                  <Field name="Job title"><input className={input} name="title" defaultValue={p.title} maxLength={80} /></Field>
                </div>
                <label className="flex items-center gap-2 text-sm font-medium">
                  <input type="checkbox" name="active" defaultChecked={p.active} className="size-4" /> Taking bookings
                </label>
                <div>
                  <div className="mb-2 text-sm font-medium text-stone-700">Working hours</div>
                  <div className="grid gap-2">
                    {DAYS.map((name, i) => {
                      const d = i + 1;
                      const h = mine.find((x) => x.weekday === d);
                      return (
                        <div key={d} className="grid grid-cols-[1fr_auto_auto] items-center gap-2 sm:grid-cols-[160px_auto_auto_1fr]">
                          <label className="flex items-center gap-2 font-medium">
                            <input type="checkbox" name={`day${d}_open`} defaultChecked={!!h} className="size-4" /> {name}
                          </label>
                          <input className={input + " w-28"} type="time" name={`day${d}_start`} defaultValue={h ? minToHHMM(h.startMin) : "09:00"} />
                          <input className={input + " w-28"} type="time" name={`day${d}_end`} defaultValue={h ? minToHHMM(h.endMin) : "17:00"} />
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div>
                  <div className="mb-2 text-sm font-medium text-stone-700">Services they do</div>
                  <div className="flex flex-wrap gap-x-5 gap-y-2">
                    {services.filter((s) => s.active).map((s) => (
                      <label key={s.id} className="flex items-center gap-2 text-sm">
                        <input type="checkbox" name="services" value={s.id} defaultChecked={!does.length || does.includes(s.id)} className="size-4" /> {s.name}
                      </label>
                    ))}
                  </div>
                </div>
                <div><button className={btn}>Save {p.name}</button></div>
              </form>
            </details>
          </Card>
        );
      })}

      <Card title="Add a team member">
        <form action={addStaff} className="grid gap-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
          <Field name="Name"><input className={input} name="name" required maxLength={80} /></Field>
          <Field name="Job title"><input className={input} name="title" maxLength={80} /></Field>
          <button className={btn}>Add</button>
        </form>
      </Card>

      <Card title="Holidays and time off">
        {off.length ? (
          <ul className="mb-5 divide-y divide-stone-100">
            {off.map((o) => (
              <li key={o.id} className="flex flex-wrap items-center justify-between gap-2 py-2.5">
                <span><strong>{day(o.startsAt, biz)}{" to "}{day(o.endsAt, biz)}</strong> · {o.staffId ? staff.find((s) => s.id === o.staffId)?.name : "Whole business closed"}{o.reason && <span className="text-stone-500"> · {o.reason}</span>}</span>
                <form action={removeTimeOff}><input type="hidden" name="id" value={o.id} /><button className={btnDanger}>Remove</button></form>
              </li>
            ))}
          </ul>
        ) : <div className="mb-5"><Empty>No time off coming up.</Empty></div>}
        <form action={addTimeOff} className="grid gap-4 sm:grid-cols-2">
          <Field name="Who">
            <select className={input} name="staffId">
              <option value="">Whole business closed</option>
              {staff.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </Field>
          <Field name="Reason (optional)"><input className={input} name="reason" placeholder="Public holiday" maxLength={80} /></Field>
          <Field name="From"><input className={input} type="date" name="from" required min={todayISO(biz)} /></Field>
          <Field name="To"><input className={input} type="date" name="to" min={todayISO(biz)} /></Field>
          <div><button className={btn}>Add time off</button></div>
        </form>
      </Card>
    </Page>
  );
}
