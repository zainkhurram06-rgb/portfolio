// Creating a whole business in one go: the website content, services, team,
// opening hours and an owner login. This is what MARK calls for every demo, and
// what onboarding calls for every paying client.

import { randomBytes } from "node:crypto";
import { hash } from "@node-rs/argon2";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db, t } from "@/db";
import { ICONS, siteContentSchema } from "./content";

const minutes = z.string().regex(/^\d{2}:\d{2}$/, "use HH:MM").transform((s) => {
  const [h, m] = s.split(":").map(Number);
  return h * 60 + m;
});

export const newBusinessSchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]{3,48}$/).optional(),
  name: z.string().min(1).max(120),
  niche: z.enum(["salon", "clinic", "homeservices"]),
  theme: z.string().min(1).max(60),
  country: z.string().length(2).transform((s) => s.toUpperCase()),
  language: z.string().min(2).max(10).default("en"),
  currency: z.string().length(3).transform((s) => s.toUpperCase()),
  timezone: z.string().refine((tz) => {
    try { new Intl.DateTimeFormat("en", { timeZone: tz }); return true; } catch { return false; }
  }, "unknown timezone"),
  phone: z.string().max(40).nullish(),
  email: z.string().email().nullish(),
  address: z.string().max(300).nullish(),
  city: z.string().max(80).nullish(),
  bookingMode: z.enum(["internal", "external", "off"]).default("internal"),
  externalBookingUrl: z.string().url().nullish(),
  reminderChannel: z.enum(["whatsapp", "sms", "email"]).default("whatsapp"),
  content: siteContentSchema,
  services: z.array(z.object({
    name: z.string().min(1).max(80),
    description: z.string().max(400).default(""),
    icon: z.enum(ICONS).default("sparkle"),
    durationMin: z.number().int().min(5).max(600),
    price: z.number().min(0).nullish(),           // in the currency's main unit, e.g. 45.5
    priceFrom: z.boolean().default(false),
  })).min(1).max(40),
  staff: z.array(z.object({
    name: z.string().min(1).max(80),
    title: z.string().max(80).default(""),
    // same weekly hours for everyone unless given per person
    hours: z.array(z.object({ weekday: z.number().int().min(1).max(7), start: minutes, end: minutes })).optional(),
  })).min(1).max(30).default([{ name: "Team", title: "" }]),
  hours: z.array(z.object({ weekday: z.number().int().min(1).max(7), start: minutes, end: minutes }))
    .min(1).max(30),
  owner: z.object({
    name: z.string().min(1).max(80),
    email: z.string().email(),
    password: z.string().min(8).optional(),        // made up if not given, returned once
  }),
  status: z.enum(["demo", "active", "paused"]).default("demo"),
});

export type NewBusiness = z.input<typeof newBusinessSchema>;

function slugify(s: string) {
  return s.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40) || "business";
}

async function freeSlug(base: string) {
  let slug = base;
  for (let i = 2; ; i++) {
    const [taken] = await db.select({ id: t.businesses.id }).from(t.businesses).where(eq(t.businesses.slug, slug));
    if (!taken) return slug;
    slug = `${base}-${i}`;
  }
}

export async function createBusiness(raw: NewBusiness) {
  const input = newBusinessSchema.parse(raw);
  const slug = await freeSlug(input.slug ?? slugify(input.name));
  const password = input.owner.password ?? randomBytes(9).toString("base64url");
  const passwordHash = await hash(password);

  return db.transaction(async (tx) => {
    const [biz] = await tx.insert(t.businesses).values({
      slug,
      name: input.name,
      niche: input.niche,
      theme: input.theme,
      status: input.status,
      country: input.country,
      language: input.language,
      currency: input.currency,
      timezone: input.timezone,
      phone: input.phone ?? null,
      email: input.email ?? null,
      address: input.address ?? null,
      city: input.city ?? null,
      bookingMode: input.bookingMode,
      externalBookingUrl: input.externalBookingUrl ?? null,
      reminderChannel: input.reminderChannel,
      content: input.content,
    }).returning();

    await tx.insert(t.services).values(input.services.map((s, i) => ({
      businessId: biz.id,
      name: s.name,
      description: s.description,
      icon: s.icon,
      durationMin: s.durationMin,
      priceCents: s.price == null ? null : Math.round(s.price * 100),
      priceFrom: s.priceFrom,
      sort: i,
    })));

    for (const [i, person] of input.staff.entries()) {
      const [row] = await tx.insert(t.staff)
        .values({ businessId: biz.id, name: person.name, title: person.title, sort: i }).returning();
      const pattern = person.hours ?? input.hours;
      await tx.insert(t.hours).values(pattern.map((h) => ({
        businessId: biz.id, staffId: row.id, weekday: h.weekday, startMin: h.start, endMin: h.end,
      })));
    }

    const email = input.owner.email.toLowerCase();
    let [user] = await tx.select().from(t.users).where(eq(t.users.email, email));
    let newPassword: string | null = null;
    if (!user) {
      [user] = await tx.insert(t.users).values({ email, name: input.owner.name, passwordHash }).returning();
      newPassword = password;
    }
    await tx.insert(t.memberships).values({ userId: user.id, businessId: biz.id, role: "owner" });

    // the password only comes back when we just made the account
    return { business: biz, owner: { email, password: newPassword } };
  });
}
