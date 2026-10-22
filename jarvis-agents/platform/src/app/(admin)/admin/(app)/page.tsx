import Link from "next/link";
import { DateTime } from "luxon";
import { currentBusiness } from "@/lib/auth";
import { bookingsBetween, recentEnquiries } from "@/lib/admin-data";
import { dateTime, dayBounds, longDay, todayISO } from "@/lib/fmt";
import { BookingRow } from "@/components/admin/booking-row";
import { Card, Empty, Page, Stat, btn } from "@/components/admin/ui";

export default async function Today() {
  const { biz, user } = await currentBusiness();
  const { start, end, dt } = dayBounds(todayISO(biz), biz);
  const weekEnd = dt.plus({ days: 7 }).toJSDate();
  const [today, week, messages] = await Promise.all([
    bookingsBetween(biz, start, end),
    bookingsBetween(biz, start, weekEnd),
    recentEnquiries(biz, 5),
  ]);
  const live = today.filter((b) => b.row.status !== "cancelled");
  const unread = messages.filter((m) => m.status === "new").length;
  const hour = DateTime.now().setZone(biz.timezone).hour;
  const hello = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <Page
      title={`${hello}, ${user.name.split(" ")[0]}`}
      sub={longDay(new Date(), biz)}
      action={<Link className={btn} href="/admin/calendar#add">+ Add a booking</Link>}
    >
      {biz.status === "demo" && (
        <div className="rounded-2xl bg-amber-50 px-5 py-4 text-amber-900">
          <strong>This is a demo.</strong> Everything works, and your website shows a &ldquo;demo preview&rdquo; bar until you go live.
        </div>
      )}
      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        <Stat label="Bookings today" value={live.length} href="/admin/calendar" />
        <Stat label="Next 7 days" value={week.filter((b) => b.row.status === "confirmed").length} href="/admin/calendar" />
        <Stat label="New messages" value={unread} href="/admin/messages" />
      </div>

      <Card title="Today's bookings">
        {today.length ? <ul className="divide-y divide-stone-100">{today.map((b) => <BookingRow key={b.row.id} r={b.row} />)}</ul>
          : <Empty>No bookings today yet. Share your booking link and they&apos;ll appear here.</Empty>}
      </Card>

      <Card title="Latest messages" action={<Link href="/admin/messages" className="text-sm font-semibold underline-offset-2 hover:underline">See all</Link>}>
        {messages.length ? (
          <ul className="divide-y divide-stone-100">
            {messages.map((m) => (
              <li key={m.id} className="flex items-start justify-between gap-4 py-3">
                <div className="min-w-0">
                  <div className="font-semibold">{m.name}{m.service && <span className="font-normal text-stone-500"> · {m.service}</span>}</div>
                  <p className="truncate text-sm text-stone-600">{m.message || "No message"}</p>
                </div>
                <div className="shrink-0 text-right text-xs text-stone-500">
                  {dateTime(m.createdAt, biz)}
                  {m.status === "new" && <div className="mt-1 font-bold text-amber-600">NEW</div>}
                </div>
              </li>
            ))}
          </ul>
        ) : <Empty>No messages yet.</Empty>}
      </Card>
    </Page>
  );
}
