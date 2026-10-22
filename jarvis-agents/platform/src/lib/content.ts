// What a business's website says and looks like. Stored as JSON on the business
// row. MARK writes the first version, the owner edits it in "My website".
// Services, hours and contact details are NOT in here: they live in their own
// tables, so the site and the booking system can never disagree.

import { z } from "zod";

export const ICONS = [
  "tooth", "heart", "stethoscope", "baby", "eye", "bone", "brain", "pill",
  "wrench", "snowflake", "flame", "droplet", "bolt", "home", "roof", "leaf",
  "scissors", "sparkle", "brush", "nail", "spa", "mirror",
  "shield", "clock", "star", "calendar", "phone", "check", "map", "award",
] as const;
export type IconName = (typeof ICONS)[number];

export const HEADING_FONTS = [
  "Fraunces", "Playfair Display", "DM Serif Display",
  "Outfit", "Sora", "Archivo", "Bricolage Grotesque",
] as const;
export const BODY_FONTS = ["Inter", "DM Sans", "Manrope", "Nunito Sans", "Work Sans"] as const;

const hex = z.string().regex(/^#[0-9a-fA-F]{6}$/, "use a colour like #1f6f8b");
const url = z.string().url().max(2000);

export const siteContentSchema = z.object({
  tagline: z.string().min(1).max(80),
  headline: z.string().min(1).max(120),
  subheadline: z.string().min(1).max(280),
  ctaLabel: z.string().min(1).max(40),
  aboutTitle: z.string().min(1).max(120),
  about: z.string().min(1).max(2000),
  highlights: z.array(z.string().min(1).max(60)).min(3).max(4),
  reviews: z.array(z.object({
    author: z.string().min(1).max(60),
    text: z.string().min(1).max(600),
    rating: z.number().int().min(1).max(5),
  })).max(6).default([]),
  faqs: z.array(z.object({ q: z.string().max(200), a: z.string().max(800) })).max(6).default([]),
  areasServed: z.array(z.string().max(60)).max(12).default([]),
  palette: z.object({ primary: hex, accent: hex, dark: hex, light: hex }),
  headingFont: z.enum(HEADING_FONTS),
  bodyFont: z.enum(BODY_FONTS),
  logoUrl: url.nullable().default(null),
  heroImage: url.nullable().default(null),
  gallery: z.array(url).max(12).default([]),
  instagram: url.nullable().default(null),
  facebook: url.nullable().default(null),
  rating: z.number().min(0).max(5).nullable().default(null),
  reviewCount: z.number().int().min(0).nullable().default(null),
});

export type SiteContent = z.infer<typeof siteContentSchema>;
