import { openDays } from "@/lib/booking";
import { businessFor, isUuid, json, serviceBelongs } from "@/lib/public-api";

// GET ?service=<id>  ->  which of the next 3 weeks have any free time
export async function GET(req: Request, ctx: { params: Promise<{ site: string }> }) {
  const biz = await businessFor((await ctx.params).site);
  if (!biz || biz.bookingMode !== "internal") return json({ error: "not found" }, 404);
  const service = new URL(req.url).searchParams.get("service");
  if (!isUuid(service) || !(await serviceBelongs(biz.id, service))) return json({ error: "bad request" }, 400);
  return json({ days: await openDays(biz, service) });
}
