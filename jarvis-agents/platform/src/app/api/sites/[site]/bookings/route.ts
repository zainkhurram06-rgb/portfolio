import { z } from "zod";
import { createBooking } from "@/lib/booking";
import { businessFor, json, serviceBelongs } from "@/lib/public-api";
import { cleanDetails } from "@/lib/niches";

const body = z.object({
  serviceId: z.string().uuid(),
  staffId: z.string().uuid().optional(),
  start: z.string().datetime({ offset: true }),
  name: z.string().trim().min(1).max(80),
  phone: z.string().trim().min(5).max(40),
  email: z.string().trim().email().max(120).optional().or(z.literal("")),
  note: z.string().trim().max(500).optional(),
  details: z.record(z.string(), z.string().max(300)).optional(),
  website: z.string().optional(),   // honeypot
});

export async function POST(req: Request, ctx: { params: Promise<{ site: string }> }) {
  const biz = await businessFor((await ctx.params).site);
  if (!biz) return json({ error: "not found" }, 404);
  const parsed = body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return json({ error: "check your details" }, 400);
  const f = parsed.data;
  if (f.website) return json({ error: "check your details" }, 400);
  if (!(await serviceBelongs(biz.id, f.serviceId))) return json({ error: "not found" }, 404);
  const extra = cleanDetails(biz.niche, f.details);
  if (!extra.ok) return json({ error: "check your details", field: extra.field }, 400);

  const res = await createBooking(biz, {
    serviceId: f.serviceId, staffId: f.staffId, start: f.start,
    name: f.name, phone: f.phone, email: f.email || undefined, note: f.note, details: extra.details,
  });
  if (!res.ok) {
    const msg = res.reason === "slot_taken" ? "Sorry, that time was just taken. Please pick another." : "Online booking is not available.";
    return json({ error: msg, reason: res.reason }, res.reason === "slot_taken" ? 409 : 400);
  }
  return json({ ok: true, bookingId: res.bookingId, startsAt: res.startsAt });
}
