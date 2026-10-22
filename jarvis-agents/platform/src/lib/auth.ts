// Owner logins. Email + password, a session cookie, and every dashboard query
// scoped to a business the logged-in person belongs to. Nothing else.

import { createHash, randomBytes } from "node:crypto";
import { hash, verify } from "@node-rs/argon2";
import { and, eq, gt } from "drizzle-orm";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { db, t } from "@/db";

const SESSION_COOKIE = "sid";
const BUSINESS_COOKIE = "biz";
const SESSION_DAYS = 30;

let dummy: Promise<string> | null = null;
const dummyHash = () => (dummy ??= hash("timing-equaliser-not-a-password"));

const sha = (s: string) => createHash("sha256").update(s).digest("hex");

export async function login(email: string, password: string) {
  const [user] = await db.select().from(t.users).where(eq(t.users.email, email.trim().toLowerCase()));
  // always run a hash check so a wrong email takes as long as a wrong password
  let ok = false;
  if (user) ok = await verify(user.passwordHash, password).catch(() => false);
  else await verify(await dummyHash(), password).catch(() => false);
  if (!user || !ok) return false;

  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 864e5);
  await db.insert(t.sessions).values({ id: sha(token), userId: user.id, expiresAt });
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production",
    path: "/", expires: expiresAt,
  });
  return true;
}

export async function logout() {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token) await db.delete(t.sessions).where(eq(t.sessions.id, sha(token)));
  jar.delete(SESSION_COOKIE);
  jar.delete(BUSINESS_COOKIE);
}

export const currentUser = cache(async () => {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const [row] = await db.select({ user: t.users }).from(t.sessions)
    .innerJoin(t.users, eq(t.users.id, t.sessions.userId))
    .where(and(eq(t.sessions.id, sha(token)), gt(t.sessions.expiresAt, new Date())));
  return row?.user ?? null;
});

// the business being managed right now. people with several businesses switch
// with the "biz" cookie, which is only honoured if they really belong to it.
export const currentBusiness = cache(async () => {
  const user = await currentUser();
  if (!user) redirect("/admin/login");
  const mine = await db.select({ biz: t.businesses, role: t.memberships.role })
    .from(t.memberships)
    .innerJoin(t.businesses, eq(t.businesses.id, t.memberships.businessId))
    .where(eq(t.memberships.userId, user.id));
  if (!mine.length) redirect("/admin/login?e=nobusiness");
  const wanted = (await cookies()).get(BUSINESS_COOKIE)?.value;
  const pick = mine.find((m) => m.biz.id === wanted) ?? mine[0];
  return { user, biz: pick.biz, role: pick.role, all: mine.map((m) => m.biz) };
});

export async function switchBusiness(id: string) {
  const { all } = await currentBusiness();
  if (all.some((b) => b.id === id)) (await cookies()).set(BUSINESS_COOKIE, id, { httpOnly: true, sameSite: "lax", path: "/" });
}
