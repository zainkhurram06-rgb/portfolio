import { setBookingStatus } from "@/app/(admin)/admin/(app)/actions";
import { Badge } from "./ui";

export type Row = {
  id: string; when: string; customer: string; phone: string | null;
  service: string; staff: string; status: "confirmed" | "cancelled" | "completed" | "no_show"; source: string;
};

const STATUS = {
  confirmed: { label: "Booked", tone: "blue" as const },
  completed: { label: "Done", tone: "green" as const },
  cancelled: { label: "Cancelled", tone: "stone" as const },
  no_show: { label: "No-show", tone: "red" as const },
};

function Act({ id, status, children }: { id: string; status: string; children: React.ReactNode }) {
  return (
    <form action={setBookingStatus}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="status" value={status} />
      <button className="rounded-lg border border-stone-200 px-2.5 py-1 text-xs font-semibold text-stone-700 hover:border-stone-900">{children}</button>
    </form>
  );
}

export function BookingRow({ r }: { r: Row }) {
  const s = STATUS[r.status];
  return (
    <li className={`flex flex-wrap items-center gap-x-4 gap-y-2 py-3 ${r.status === "cancelled" ? "opacity-50" : ""}`}>
      <div className="w-20 shrink-0 text-lg font-semibold tabular-nums">{r.when}</div>
      <div className="min-w-0 flex-1">
        <div className="font-semibold">{r.customer} <span className="font-normal text-stone-500">· {r.service}</span></div>
        <div className="text-sm text-stone-500">
          with {r.staff}
          {r.phone && <> · <a className="underline-offset-2 hover:underline" href={`tel:${r.phone.replace(/[^\d+]/g, "")}`}>{r.phone}</a></>}
          {r.source !== "online" && " · added by you"}
        </div>
      </div>
      <Badge tone={s.tone}>{s.label}</Badge>
      {r.status === "confirmed" && (
        <div className="flex gap-1.5">
          <Act id={r.id} status="completed">Done</Act>
          <Act id={r.id} status="no_show">No-show</Act>
          <Act id={r.id} status="cancelled">Cancel</Act>
        </div>
      )}
      {r.status !== "confirmed" && <Act id={r.id} status="confirmed">Undo</Act>}
    </li>
  );
}
