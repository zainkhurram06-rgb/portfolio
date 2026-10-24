// Everything a public website needs, loaded once per page and handed to the template.

import { and, asc, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { cache } from "react";
import { db, t } from "@/db";
import { buildSiteData, type SiteData } from "./site-data";

export type { SiteData, SiteService } from "./site-data";
export { formatPrice, summariseHours } from "./site-data";

// a business and everything its website shows, by slug or by its own domain
export async function siteRows(site: string) {
  const key = decodeURIComponent(site).toLowerCase();
  const [biz] = await db.select().from(t.businesses).where(
    key.includes(".") ? eq(t.businesses.customDomain, key) : eq(t.businesses.slug, key),
  );
  if (!biz || biz.status === "paused") return null;

  const [services, staff, hours] = await Promise.all([
    db.select().from(t.services).where(and(eq(t.services.businessId, biz.id), eq(t.services.active, true))).orderBy(asc(t.services.sort)),
    db.select().from(t.staff).where(and(eq(t.staff.businessId, biz.id), eq(t.staff.active, true))).orderBy(asc(t.staff.sort)),
    db.select().from(t.hours).where(eq(t.hours.businessId, biz.id)),
  ]);
  return { biz, services, staff, hours };
}

export const loadSite = cache(async (site: string): Promise<SiteData | null> => {
  const rows = await siteRows(site);
  if (!rows) return null;
  // the proxy tells us whether this request came in on the business's own host
  const h = await headers();
  return buildSiteData({ ...rows, onOwnDomain: !!h.get("x-site-host") });
});
