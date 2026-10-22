import { currentBusiness } from "@/lib/auth";
import { recentEnquiries } from "@/lib/admin-data";
import { dateTime } from "@/lib/fmt";
import { Badge, Card, Empty, Page, btnLight } from "@/components/admin/ui";
import { markAllRead, setEnquiryStatus } from "../actions";

function Set({ id, status, children }: { id: string; status: string; children: React.ReactNode }) {
  return (
    <form action={setEnquiryStatus}>
      <input type="hidden" name="id" value={id} /><input type="hidden" name="status" value={status} />
      <button className="rounded-lg border border-stone-200 px-2.5 py-1 text-xs font-semibold hover:border-stone-900">{children}</button>
    </form>
  );
}

export default async function Messages() {
  const { biz } = await currentBusiness();
  const all = await recentEnquiries(biz, 200);
  const open = all.filter((m) => m.status !== "done");
  const closed = all.filter((m) => m.status === "done");

  return (
    <Page title="Messages" sub="Everything sent through your website's contact and quote forms."
      action={open.some((m) => m.status === "new") ? <form action={markAllRead}><button className={btnLight}>Mark all read</button></form> : null}>
      <Card title={`To deal with (${open.length})`}>
        {open.length ? (
          <ul className="divide-y divide-stone-100">
            {open.map((m) => (
              <li key={m.id} className="grid gap-2 py-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="font-semibold">
                    {m.name}{m.service && <span className="font-normal text-stone-500"> · {m.service}</span>}{" "}
                    {m.status === "new" && <Badge tone="amber">New</Badge>}
                  </div>
                  <div className="text-sm text-stone-500">{dateTime(m.createdAt, biz)}</div>
                </div>
                {m.message && <p className="whitespace-pre-wrap text-stone-700">{m.message}</p>}
                <div className="flex flex-wrap items-center gap-3 text-sm">
                  {m.phone && <a className="font-semibold underline underline-offset-2" href={`tel:${m.phone.replace(/[^\d+]/g, "")}`}>Call {m.phone}</a>}
                  {m.phone && <a className="font-semibold underline underline-offset-2" href={`https://wa.me/${m.phone.replace(/[^\d]/g, "")}`} target="_blank">WhatsApp</a>}
                  {m.email && <a className="font-semibold underline underline-offset-2" href={`mailto:${m.email}`}>Email</a>}
                  <div className="ml-auto flex gap-1.5">
                    {m.status === "new" && <Set id={m.id} status="read">Mark read</Set>}
                    <Set id={m.id} status="done">Done</Set>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : <Empty>All caught up.</Empty>}
      </Card>
      {closed.length > 0 && (
        <Card title="Done">
          <ul className="divide-y divide-stone-100">
            {closed.slice(0, 30).map((m) => (
              <li key={m.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                <span><strong>{m.name}</strong> <span className="text-stone-500">{m.message?.slice(0, 80)}</span></span>
                <Set id={m.id} status="read">Reopen</Set>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </Page>
  );
}
