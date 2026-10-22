// Helpers for the public endpoints the websites call.

import { and, eq } from "drizzle-orm";
import { db, t } from "@/db";

export async function businessFor(site: string) {
  const key = decodeURIComponent(site).toLowerCase();
  const [biz] = await db.select().from(t.businesses).where(
    key.includes(".") ? eq(t.businesses.customDomain, key) : eq(t.businesses.slug, key),
  );
  return biz && biz.status !== "paused" ? biz : null;
}

export async function serviceBelongs(businessId: string, serviceId: string) {
  const [row] = await db.select({ id: t.services.id }).from(t.services)
    .where(and(eq(t.services.id, serviceId), eq(t.services.businessId, businessId), eq(t.services.active, true)));
  return !!row;
}

export const json = (data: unknown, status = 200) => Response.json(data, { status });

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const isUuid = (s: string | null | undefined): s is string => !!s && UUID.test(s);
export const isDate = (s: string | null | undefined): s is string => !!s && /^\d{4}-\d{2}-\d{2}$/.test(s);
