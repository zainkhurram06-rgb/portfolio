import { currentBusiness } from "@/lib/auth";
import { Card, Field, Page, btn, input } from "@/components/admin/ui";
import { saveSettings } from "../actions";

export default async function Settings({ searchParams }: { searchParams: Promise<{ saved?: string }> }) {
  const { biz } = await currentBusiness();
  const { saved } = await searchParams;
  const zones = Intl.supportedValuesOf("timeZone");
  return (
    <Page title="Settings" sub="Your business details and how online booking works.">
      {saved && <div className="rounded-2xl bg-emerald-50 px-5 py-3 font-medium text-emerald-800">Saved.</div>}
      <form action={saveSettings} className="grid gap-5">
        <Card title="Business details">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field name="Business name"><input className={input} name="name" defaultValue={biz.name} required maxLength={120} /></Field>
            <Field name="Phone"><input className={input} name="phone" defaultValue={biz.phone ?? ""} maxLength={40} /></Field>
            <Field name="Email"><input className={input} name="email" type="email" defaultValue={biz.email ?? ""} /></Field>
            <Field name="City"><input className={input} name="city" defaultValue={biz.city ?? ""} maxLength={80} /></Field>
            <div className="sm:col-span-2"><Field name="Address"><input className={input} name="address" defaultValue={biz.address ?? ""} maxLength={300} /></Field></div>
            <Field name="Timezone">
              <select className={input} name="timezone" defaultValue={biz.timezone}>{zones.map((z) => <option key={z}>{z}</option>)}</select>
            </Field>
          </div>
        </Card>
        <Card title="Online booking">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Field name="How customers book">
                <select className={input} name="bookingMode" defaultValue={biz.bookingMode}>
                  <option value="internal">Book online here (recommended)</option>
                  <option value="external">Send them to another booking system</option>
                  <option value="off">No online booking, contact form only</option>
                </select>
              </Field>
            </div>
            <div className="sm:col-span-2">
              <Field name="Other booking system link" hint="Only used if you send customers elsewhere.">
                <input className={input} name="externalBookingUrl" type="url" defaultValue={biz.externalBookingUrl ?? ""} />
              </Field>
            </div>
            <Field name="Offer a time every (minutes)"><input className={input} name="slotStepMin" type="number" min={5} max={120} defaultValue={biz.slotStepMin} /></Field>
            <Field name="Minimum notice (minutes)" hint="No bookings sooner than this."><input className={input} name="minNoticeMin" type="number" min={0} defaultValue={biz.minNoticeMin} /></Field>
            <Field name="How far ahead (days)"><input className={input} name="maxDaysAhead" type="number" min={1} max={365} defaultValue={biz.maxDaysAhead} /></Field>
            <Field name="Send reminders by">
              <select className={input} name="reminderChannel" defaultValue={biz.reminderChannel}>
                <option value="whatsapp">WhatsApp</option><option value="sms">Text message</option><option value="email">Email</option>
              </select>
            </Field>
          </div>
        </Card>
        <div><button className={btn}>Save settings</button></div>
      </form>
    </Page>
  );
}
