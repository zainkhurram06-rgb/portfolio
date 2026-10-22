// The whole platform's data. One database, every business is a row in
// `businesses`, and everything else hangs off business_id. That is what lets one
// app serve every client, the way Shopify serves every store.

import {
  boolean,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import type { SiteContent } from "@/lib/content";

export const niche = pgEnum("niche", ["salon", "clinic", "homeservices"]);
export const businessStatus = pgEnum("business_status", ["demo", "active", "paused"]);
// internal: we take bookings. external: we send people to their own system
// (clinics that must keep patient data elsewhere). off: enquiry form only.
export const bookingMode = pgEnum("booking_mode", ["internal", "external", "off"]);
export const channel = pgEnum("channel", ["whatsapp", "sms", "email"]);
export const role = pgEnum("role", ["owner", "staff"]);
export const bookingStatus = pgEnum("booking_status", [
  "confirmed", "cancelled", "completed", "no_show",
]);
export const bookingSource = pgEnum("booking_source", ["online", "owner", "phone"]);
export const enquiryStatus = pgEnum("enquiry_status", ["new", "read", "done"]);

const created = () => timestamp("created_at", { withTimezone: true }).defaultNow().notNull();
const updated = () => timestamp("updated_at", { withTimezone: true }).defaultNow().notNull();

export const businesses = pgTable("businesses", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(),
  customDomain: text("custom_domain").unique(),
  name: text("name").notNull(),
  niche: niche("niche").notNull(),
  theme: text("theme").notNull(),
  status: businessStatus("status").notNull().default("demo"),

  // local settings, so the same platform works in any country
  country: text("country").notNull(),            // ISO 3166 alpha-2, e.g. AE
  language: text("language").notNull().default("en"),
  currency: text("currency").notNull(),          // ISO 4217, e.g. AED
  timezone: text("timezone").notNull(),          // IANA, e.g. Asia/Dubai

  phone: text("phone"),
  email: text("email"),
  address: text("address"),
  city: text("city"),

  bookingMode: bookingMode("booking_mode").notNull().default("internal"),
  externalBookingUrl: text("external_booking_url"),
  reminderChannel: channel("reminder_channel").notNull().default("whatsapp"),
  slotStepMin: integer("slot_step_min").notNull().default(15),
  minNoticeMin: integer("min_notice_min").notNull().default(60),
  maxDaysAhead: integer("max_days_ahead").notNull().default(60),

  // everything the website shows: words, colours, fonts, photos, reviews
  content: jsonb("content").$type<SiteContent>().notNull(),

  createdAt: created(),
  updatedAt: updated(),
});

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  passwordHash: text("password_hash").notNull(),
  isPlatformAdmin: boolean("is_platform_admin").notNull().default(false),
  createdAt: created(),
});

export const memberships = pgTable("memberships", {
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  businessId: uuid("business_id").notNull().references(() => businesses.id, { onDelete: "cascade" }),
  role: role("role").notNull().default("owner"),
}, (t) => [primaryKey({ columns: [t.userId, t.businessId] })]);

export const sessions = pgTable("sessions", {
  id: text("id").primaryKey(),                  // sha256 of the cookie token
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
});

export const services = pgTable("services", {
  id: uuid("id").primaryKey().defaultRandom(),
  businessId: uuid("business_id").notNull().references(() => businesses.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description").notNull().default(""),
  icon: text("icon").notNull().default("sparkle"),
  durationMin: integer("duration_min").notNull(),
  priceCents: integer("price_cents"),           // null = "ask for a quote"
  priceFrom: boolean("price_from").notNull().default(false), // shows "from 40"
  active: boolean("active").notNull().default(true),
  sort: integer("sort").notNull().default(0),
}, (t) => [index("services_business").on(t.businessId)]);

export const staff = pgTable("staff", {
  id: uuid("id").primaryKey().defaultRandom(),
  businessId: uuid("business_id").notNull().references(() => businesses.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  title: text("title").notNull().default(""),
  photoUrl: text("photo_url"),
  active: boolean("active").notNull().default(true),
  sort: integer("sort").notNull().default(0),
}, (t) => [index("staff_business").on(t.businessId)]);

// which staff can do which service. no rows for a staff member = they do everything
export const staffServices = pgTable("staff_services", {
  staffId: uuid("staff_id").notNull().references(() => staff.id, { onDelete: "cascade" }),
  serviceId: uuid("service_id").notNull().references(() => services.id, { onDelete: "cascade" }),
}, (t) => [primaryKey({ columns: [t.staffId, t.serviceId] })]);

// weekly working hours. weekday 1 = Monday ... 7 = Sunday. minutes from midnight,
// local time. several rows on one day = split shift. one row per staff member.
export const hours = pgTable("hours", {
  id: uuid("id").primaryKey().defaultRandom(),
  businessId: uuid("business_id").notNull().references(() => businesses.id, { onDelete: "cascade" }),
  staffId: uuid("staff_id").notNull().references(() => staff.id, { onDelete: "cascade" }),
  weekday: integer("weekday").notNull(),
  startMin: integer("start_min").notNull(),
  endMin: integer("end_min").notNull(),
}, (t) => [index("hours_staff").on(t.staffId)]);

export const timeOff = pgTable("time_off", {
  id: uuid("id").primaryKey().defaultRandom(),
  businessId: uuid("business_id").notNull().references(() => businesses.id, { onDelete: "cascade" }),
  staffId: uuid("staff_id").references(() => staff.id, { onDelete: "cascade" }), // null = whole business closed
  startsAt: timestamp("starts_at", { withTimezone: true }).notNull(),
  endsAt: timestamp("ends_at", { withTimezone: true }).notNull(),
  reason: text("reason"),
}, (t) => [index("time_off_business").on(t.businessId)]);

export const customers = pgTable("customers", {
  id: uuid("id").primaryKey().defaultRandom(),
  businessId: uuid("business_id").notNull().references(() => businesses.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  phone: text("phone"),
  email: text("email"),
  notes: text("notes"),                          // owner's own notes. never shown for clinics
  createdAt: created(),
}, (t) => [
  index("customers_business").on(t.businessId),
  uniqueIndex("customers_business_phone").on(t.businessId, t.phone),
]);

export const bookings = pgTable("bookings", {
  id: uuid("id").primaryKey().defaultRandom(),
  businessId: uuid("business_id").notNull().references(() => businesses.id, { onDelete: "cascade" }),
  serviceId: uuid("service_id").notNull().references(() => services.id),
  staffId: uuid("staff_id").notNull().references(() => staff.id),
  customerId: uuid("customer_id").notNull().references(() => customers.id),
  startsAt: timestamp("starts_at", { withTimezone: true }).notNull(),
  endsAt: timestamp("ends_at", { withTimezone: true }).notNull(),
  status: bookingStatus("status").notNull().default("confirmed"),
  source: bookingSource("source").notNull().default("online"),
  note: text("note"),
  createdAt: created(),
}, (t) => [
  index("bookings_business_time").on(t.businessId, t.startsAt),
  index("bookings_staff_time").on(t.staffId, t.startsAt),
]);

export const enquiries = pgTable("enquiries", {
  id: uuid("id").primaryKey().defaultRandom(),
  businessId: uuid("business_id").notNull().references(() => businesses.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  phone: text("phone"),
  email: text("email"),
  service: text("service"),
  message: text("message"),
  status: enquiryStatus("status").notNull().default("new"),
  createdAt: created(),
}, (t) => [index("enquiries_business").on(t.businessId, t.createdAt)]);

export type Business = typeof businesses.$inferSelect;
export type Service = typeof services.$inferSelect;
export type Staff = typeof staff.$inferSelect;
export type Hour = typeof hours.$inferSelect;
export type Booking = typeof bookings.$inferSelect;
export type Customer = typeof customers.$inferSelect;
export type Enquiry = typeof enquiries.$inferSelect;
