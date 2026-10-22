import { and, sql } from "drizzle-orm";
import { db, t } from "@/db";
import { internalAllowed } from "@/lib/internal-auth";
import { TEMPLATE_LIST } from "@/templates";

// which templates exist for which niche, so MARK never asks for one that doesn't.
// with ?niche=&city= it also says how many businesses there already use each one,
// so two shops on the same street don't get the same website.
export async function GET(req: Request) {
  if (!internalAllowed(req)) return Response.json({ error: "unauthorised" }, { status: 401 });
  const q = new URL(req.url).searchParams;
  const niche = q.get("niche");
  const city = q.get("city");
  const used = new Map<string, number>();
  if (niche && city) {
    const rows = await db.select({ theme: t.businesses.theme, n: sql<number>`count(*)::int` }).from(t.businesses)
      .where(and(sql`${t.businesses.niche}::text = ${niche}`, sql`lower(${t.businesses.city}) = lower(${city})`))
      .groupBy(t.businesses.theme);
    for (const r of rows) used.set(r.theme, r.n);
  }
  return Response.json(TEMPLATE_LIST
    .filter((x) => !niche || x.niches.includes(niche as never))
    .map(({ id, label, niches, needsPhoto }) => ({ id, label, niches, needsPhoto, usedNearby: used.get(id) ?? 0 })));
}
