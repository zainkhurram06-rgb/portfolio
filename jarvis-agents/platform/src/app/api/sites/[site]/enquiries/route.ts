import { z } from "zod";
import { db, t } from "@/db";
import { businessFor, json } from "@/lib/public-api";

const body = z.object({
  name: z.string().trim().min(1).max(80),
  phone: z.string().trim().max(40).optional(),
  email: z.string().trim().max(120).optional(),
  service: z.string().trim().max(80).optional(),
  message: z.string().trim().max(1000).optional(),
  website: z.string().optional(),   // honeypot: real people leave it empty
});

// saved website files (opened from disk) send the form here too, so it answers any origin
const CORS = { "access-control-allow-origin": "*", "access-control-allow-methods": "POST, OPTIONS", "access-control-allow-headers": "content-type" };

export function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS });
}

export async function POST(req: Request, ctx: { params: Promise<{ site: string }> }) {
  const res = await handle(req, ctx);
  for (const [k, v] of Object.entries(CORS)) res.headers.set(k, v);
  return res;
}

async function handle(req: Request, ctx: { params: Promise<{ site: string }> }) {
  const biz = await businessFor((await ctx.params).site);
  if (!biz) return json({ error: "not found" }, 404);
  const parsed = body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return json({ error: "check the form" }, 400);
  const f = parsed.data;
  if (f.website) return json({ ok: true });              // a bot. pretend it worked
  if (!f.phone && !f.email) return json({ error: "phone or email needed" }, 400);

  await db.insert(t.enquiries).values({
    businessId: biz.id,
    name: f.name,
    phone: f.phone || null,
    email: f.email || null,
    service: f.service || null,
    message: f.message || null,
  });
  return json({ ok: true });
}
