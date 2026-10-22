import { currentBusiness } from "@/lib/auth";
import { servicesAndStaff } from "@/lib/admin-data";
import { ICONS } from "@/lib/content";
import { money } from "@/lib/fmt";
import { Badge, Card, Field, Page, btn, btnLight, input } from "@/components/admin/ui";
import { addService, saveService, toggleService } from "../actions";

type S = { id?: string; name?: string; description?: string; icon?: string; durationMin?: number; priceCents?: number | null; priceFrom?: boolean };

function ServiceFields({ s, currency }: { s: S; currency: string }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Field name="Name"><input className={input} name="name" defaultValue={s.name} required maxLength={80} /></Field>
      <Field name="Icon">
        <select className={input} name="icon" defaultValue={s.icon ?? "sparkle"}>{ICONS.map((i) => <option key={i}>{i}</option>)}</select>
      </Field>
      <div className="sm:col-span-2">
        <Field name="Description"><textarea className={input} name="description" rows={2} defaultValue={s.description} maxLength={400} /></Field>
      </div>
      <Field name="How long (minutes)"><input className={input} name="durationMin" type="number" min={5} max={600} step={5} defaultValue={s.durationMin ?? 60} required /></Field>
      <Field name={`Price (${currency})`} hint="Leave empty to show &ldquo;Quote&rdquo;. 0 shows &ldquo;Free&rdquo;.">
        <input className={input} name="price" inputMode="decimal" defaultValue={s.priceCents == null ? "" : String(s.priceCents / 100)} />
      </Field>
      <label className="flex items-center gap-2 text-sm font-medium">
        <input type="checkbox" name="priceFrom" defaultChecked={s.priceFrom} className="size-4" /> Show as &ldquo;from&rdquo; price
      </label>
    </div>
  );
}

export default async function Services() {
  const { biz } = await currentBusiness();
  const { services } = await servicesAndStaff(biz);
  return (
    <Page title="Services" sub="What customers can book. Changes show on your website straight away.">
      {services.map((s) => (
        <Card key={s.id}>
          <details>
            <summary className="flex cursor-pointer list-none flex-wrap items-center justify-between gap-3">
              <div>
                <div className="font-semibold">{s.name} {!s.active && <Badge>Hidden</Badge>}</div>
                <div className="text-sm text-stone-500">{s.durationMin} min · {s.priceFrom && s.priceCents ? "from " : ""}{money(s.priceCents, biz)}</div>
              </div>
              <span className={btnLight}>Edit</span>
            </summary>
            <form action={saveService} className="mt-5 grid gap-4 border-t border-stone-100 pt-5">
              <input type="hidden" name="id" value={s.id} />
              <ServiceFields s={s} currency={biz.currency} />
              <div className="flex gap-2"><button className={btn}>Save</button></div>
            </form>
            <form action={toggleService} className="mt-3">
              <input type="hidden" name="id" value={s.id} /><input type="hidden" name="active" value={s.active ? "0" : "1"} />
              <button className={btnLight}>{s.active ? "Hide from website" : "Show on website"}</button>
            </form>
          </details>
        </Card>
      ))}
      <Card title="Add a service">
        <form action={addService} className="grid gap-4">
          <ServiceFields s={{}} currency={biz.currency} />
          <div><button className={btn}>Add service</button></div>
        </form>
      </Card>
    </Page>
  );
}
