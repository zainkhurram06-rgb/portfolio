// Three made-up businesses, one per niche, in three countries. Used to see and
// test everything locally. Run:  npm run seed
// Running it again adds them again with -2 slugs, so reset first if you want a clean slate.

import { createBusiness, type NewBusiness } from "../src/lib/business";
import { sql } from "../src/db";

const weekdays = (start: string, end: string, days = [1, 2, 3, 4, 5]) =>
  days.map((weekday) => ({ weekday, start, end }));

const demos: NewBusiness[] = [
  {
    slug: "luna-hair-studio",
    name: "Luna Hair Studio",
    niche: "salon",
    theme: "salon",
    country: "AE", currency: "AED", timezone: "Asia/Dubai", language: "en",
    phone: "+971 4 555 0142", email: "hello@lunahair.example",
    address: "Shop 12, Al Wasl Road, Jumeirah 1, Dubai", city: "Dubai",
    reminderChannel: "whatsapp",
    content: {
      tagline: "Hair and colour studio",
      headline: "Hair that feels like you, only better",
      subheadline: "Cuts, colour and blow-dries by stylists who listen first. Book online in under a minute.",
      ctaLabel: "Book an appointment",
      aboutTitle: "A small studio with big attention to detail",
      about: "We keep the studio small on purpose. Fewer chairs means more time with every client, from the first consultation to the final mirror check.\n\nWe use colour brands we trust, explain every step, and never rush a finish.",
      highlights: ["Online booking", "Free consultation", "Colour specialists", "Open late Thursdays"],
      reviews: [
        { author: "Sample review", text: "This is where real Google reviews appear once the studio is live.", rating: 5 },
      ],
      faqs: [{ q: "Do I need a consultation before colour?", a: "For big changes, yes. It's free and takes about 15 minutes." }],
      areasServed: [],
      palette: { primary: "#9c4a3c", accent: "#d9a46c", dark: "#2a1f1c", light: "#f6efe8" },
      headingFont: "Playfair Display", bodyFont: "DM Sans",
      logoUrl: null, heroImage: null, gallery: [], instagram: null, facebook: null,
      rating: 4.9, reviewCount: 212,
    },
    services: [
      { name: "Cut and blow-dry", description: "Wash, consultation, precision cut and a smooth finish.", icon: "scissors", durationMin: 60, price: 180, priceFrom: true },
      { name: "Full colour", description: "Root to tip colour with gloss and blow-dry.", icon: "brush", durationMin: 120, price: 420, priceFrom: true },
      { name: "Balayage", description: "Hand-painted, soft, natural-looking lightness.", icon: "sparkle", durationMin: 180, price: 750, priceFrom: true },
      { name: "Blow-dry", description: "Bouncy, sleek or waves. Wash included.", icon: "mirror", durationMin: 45, price: 120 },
      { name: "Keratin treatment", description: "Smooth, frizz-free hair for up to three months.", icon: "spa", durationMin: 150, price: 900, priceFrom: true },
    ],
    staff: [{ name: "Sara", title: "Senior stylist" }, { name: "Maya", title: "Colourist" }],
    hours: [...weekdays("10:00", "20:00", [1, 2, 3, 5, 6, 7]), { weekday: 4, start: "10:00", end: "22:00" }],
    owner: { name: "Luna Owner", email: "owner@luna.example", password: "demo-password" },
  },
  {
    slug: "harbour-dental",
    name: "Harbour Dental",
    niche: "clinic",
    theme: "clinic",
    country: "GB", currency: "GBP", timezone: "Europe/London", language: "en",
    phone: "+44 20 7946 0321", email: "reception@harbourdental.example",
    address: "8 Wharf Street, London SE8 3QR", city: "London",
    reminderChannel: "sms",
    content: {
      tagline: "Family and cosmetic dentistry",
      headline: "Calm, careful dentistry for the whole family",
      subheadline: "Check-ups, hygiene and whitening by a gentle team. Choose a time online that suits you.",
      ctaLabel: "Book a visit",
      aboutTitle: "Dentistry without the dread",
      about: "We know a lot of people put off the dentist. So we explain everything before we start, go at your pace, and keep the waiting room actually calm.\n\nFrom first check-ups for children to whitening before a big day, we look after the whole family.",
      highlights: ["Online booking", "Children welcome", "Evening appointments", "Clear prices upfront"],
      reviews: [],
      faqs: [
        { q: "Are you taking new patients?", a: "Yes. Book a new patient check-up online and we'll take it from there." },
        { q: "What if I'm nervous?", a: "Tell us when you arrive. We'll go slowly and you can stop at any time." },
      ],
      areasServed: [],
      palette: { primary: "#1f6f8b", accent: "#5cc2b5", dark: "#13232b", light: "#f1f7f8" },
      headingFont: "Fraunces", bodyFont: "Inter",
      logoUrl: null, heroImage: null, gallery: [], instagram: null, facebook: null,
      rating: 4.8, reviewCount: 96,
    },
    services: [
      { name: "New patient check-up", description: "A full check, X-rays if needed, and a clear plan.", icon: "tooth", durationMin: 45, price: 75 },
      { name: "Hygiene appointment", description: "Scale and polish to keep gums healthy.", icon: "sparkle", durationMin: 30, price: 65 },
      { name: "Teeth whitening", description: "Professional whitening with custom trays.", icon: "star", durationMin: 60, price: 299, priceFrom: true },
      { name: "Children's check-up", description: "Friendly first visits for little ones.", icon: "baby", durationMin: 20, price: 0 },
      { name: "Emergency appointment", description: "Same-day help for pain or a broken tooth.", icon: "heart", durationMin: 30, price: 95 },
    ],
    staff: [{ name: "Dr. Patel", title: "Dentist" }, { name: "Emma", title: "Hygienist" }],
    hours: [...weekdays("08:30", "17:30", [1, 2, 3, 5]), { weekday: 4, start: "08:30", end: "20:00" }],
    owner: { name: "Harbour Owner", email: "owner@harbour.example", password: "demo-password" },
  },
  {
    slug: "coastline-plumbing",
    name: "Coastline Plumbing & Gas",
    niche: "homeservices",
    theme: "homeservices",
    country: "AU", currency: "AUD", timezone: "Australia/Sydney", language: "en",
    phone: "+61 2 5550 1987", email: "jobs@coastline.example",
    address: "Unit 4, 22 Pittwater Rd, Manly NSW 2095", city: "Sydney",
    reminderChannel: "sms",
    content: {
      tagline: "Licensed plumbers and gasfitters",
      headline: "Leaks, blockages and hot water, sorted today",
      subheadline: "Upfront prices, on-time arrivals and a tidy job. Book a visit or call us now.",
      ctaLabel: "Book a plumber",
      aboutTitle: "Local plumbers who turn up when we say",
      about: "We're a small local team, so the person you speak to is the person who shows up. We tell you the price before we start and clean up before we leave.\n\nBlocked drain at 7am or a new hot water system, we treat every job the same way.",
      highlights: ["Upfront pricing", "Same-day visits", "Licensed and insured", "Tidy, no-mess work"],
      reviews: [],
      faqs: [{ q: "Do you charge a call-out fee?", a: "We quote the full price before any work starts, so there are no surprises." }],
      areasServed: ["Manly", "Dee Why", "Mosman", "Brookvale", "Collaroy", "Freshwater"],
      palette: { primary: "#1d4ed8", accent: "#facc15", dark: "#0f172a", light: "#f8fafc" },
      headingFont: "Archivo", bodyFont: "Inter",
      logoUrl: null, heroImage: null, gallery: [], instagram: null, facebook: null,
      rating: 4.9, reviewCount: 158,
    },
    services: [
      { name: "Blocked drains", description: "Cleared fast with jetters and cameras, no guesswork.", icon: "droplet", durationMin: 90, price: 220, priceFrom: true },
      { name: "Hot water systems", description: "Repairs and same-day replacements, gas or electric.", icon: "flame", durationMin: 120, price: null },
      { name: "Leak detection", description: "Find hidden leaks before they become big bills.", icon: "wrench", durationMin: 60, price: 180, priceFrom: true },
      { name: "Gas fitting", description: "Cooktops, heaters and safety checks, fully certified.", icon: "bolt", durationMin: 90, price: null },
      { name: "Bathroom renovations", description: "Plumbing for new bathrooms, start to finish.", icon: "home", durationMin: 60, price: null },
    ],
    staff: [{ name: "Jack", title: "Plumber" }, { name: "Liam", title: "Gasfitter" }],
    hours: weekdays("07:00", "17:00", [1, 2, 3, 4, 5, 6]),
    owner: { name: "Coastline Owner", email: "owner@coastline.example", password: "demo-password" },
  },
];

async function main() {
  for (const d of demos) {
    const { business, owner } = await createBusiness(d);
    console.log(`${business.name}  /s/${business.slug}  login ${owner.email}${owner.password ? ` / ${owner.password}` : ""}`);
  }
  await sql.end();
}

main().catch(async (e) => { console.error(e); await sql.end(); process.exit(1); });
