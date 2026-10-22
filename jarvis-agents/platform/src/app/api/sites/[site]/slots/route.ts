import { getSlots } from "@/lib/booking";
import { businessFor, isDate, isUuid, json, serviceBelongs } from "@/lib/public-api";

// GET ?service=<id>&date=YYYY-MM-DD[&staff=<id>]  ->  free times that day
export async function GET(req: Request, ctx: { params: Promise<{ site: string }> }) {
  const biz = await businessFor((await ctx.params).site);
  if (!biz || biz.bookingMode !== "internal") return json({ error: "not found" }, 404);
  const q = new URL(req.url).searchParams;
  const service = q.get("service"), date = q.get("date"), staff = q.get("staff");
  if (!isUuid(service) || !isDate(date) || (staff && !isUuid(staff))) return json({ error: "bad request" }, 400);
  if (!(await serviceBelongs(biz.id, service))) return json({ error: "not found" }, 404);
  const slots = await getSlots(biz, service, date, staff ?? undefined);
  return json({ timezone: biz.timezone, slots });
}
