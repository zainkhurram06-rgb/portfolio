// Made-up businesses, one per trade, for the template gallery and the tests.
// Built with the same buildSiteData() a real website uses, minus the database.

import type { SiteContent } from "@/lib/content";
import type { Niche } from "@/lib/niches";
import { buildSiteData, type SiteData } from "@/lib/site-data";

type Sample = {
  name: string; city: string; country: string; currency: string; phone: string; email: string; address: string;
  content: Omit<SiteContent, "palette" | "headingFont" | "bodyFont" | "logoUrl" | "heroImage" | "gallery" | "labels" | "instagram" | "facebook">;
  services: [name: string, description: string, icon: string, minutes: number, price: number | null][];
  staff: [string, string][];
  hours: [days: number[], start: string, end: string][];
};

const none = { credentials: [], warranty: null, insurers: [], packages: [], beforeAfter: [], areasServed: [] };
const review = (author: string, text: string, rating = 5) => ({ author, text, rating });

export const SAMPLES: Record<Niche, Sample> = {
  salon: {
    name: "Luna Hair Studio", city: "Dubai", country: "AE", currency: "AED", phone: "+971 4 555 0142", email: "hello@luna.example", address: "Shop 12, Al Wasl Road, Jumeirah 1, Dubai",
    content: {
      ...none,
      tagline: "Hair and colour studio", headline: "Hair that feels like you, only better",
      subheadline: "Cuts, colour and blow-dries by stylists who listen first. Book online in under a minute.",
      ctaLabel: "Book an appointment", aboutTitle: "A small studio with big attention to detail",
      about: "We keep the studio small on purpose. Fewer chairs means more time with every client, from the first consultation to the final mirror check.\n\nWe use colour brands we trust, explain every step, and never rush a finish.",
      highlights: ["Online booking", "Free consultation", "Colour specialists", "Open late Thursdays"],
      reviews: [review("Amira K.", "Best balayage I've had in Dubai. Sara actually listened to what I wanted."), review("Jess T.", "Calm, friendly and my cut still looks great six weeks later."), review("Noor A.", "Booked online at midnight, in the chair the next morning. Lovely team.")],
      faqs: [{ q: "Do I need a consultation before colour?", a: "For big changes, yes. It's free and takes about 15 minutes." }, { q: "Can I bring a reference photo?", a: "Please do. It's the fastest way to get exactly what you want." }],
      rating: 4.9, reviewCount: 212,
      beforeAfter: [{ before: "/samples/photo-1.svg", after: "/samples/photo-6.svg", caption: "Brunette to soft caramel balayage" }, { before: "/samples/photo-5.svg", after: "/samples/photo-8.svg", caption: "Restyle and gloss" }],
    },
    services: [["Cut and blow-dry", "Wash, consultation, precision cut and a smooth finish.", "scissors", 60, 180], ["Full colour", "Root to tip colour with gloss and blow-dry.", "brush", 120, 420], ["Balayage", "Hand-painted, soft, natural-looking lightness.", "sparkle", 180, 750], ["Blow-dry", "Bouncy, sleek or waves. Wash included.", "mirror", 45, 120], ["Keratin treatment", "Smooth, frizz-free hair for up to three months.", "spa", 150, 900]],
    staff: [["Sara", "Senior stylist"], ["Maya", "Colourist"], ["Lina", "Stylist"]],
    hours: [[[1, 2, 3, 5, 6, 7], "10:00", "20:00"], [[4], "10:00", "22:00"]],
  },
  dental: {
    name: "Harbour Dental", city: "London", country: "GB", currency: "GBP", phone: "+44 20 7946 0321", email: "reception@harbour.example", address: "8 Wharf Street, London SE8 3QR",
    content: {
      ...none,
      tagline: "Family and cosmetic dentistry", headline: "Calm, careful dentistry for the whole family",
      subheadline: "Check-ups, hygiene and whitening by a gentle team. Choose a time online that suits you.",
      ctaLabel: "Book a visit", aboutTitle: "Dentistry without the dread",
      about: "We know a lot of people put off the dentist. So we explain everything before we start, go at your pace, and keep the waiting room actually calm.\n\nFrom first check-ups for children to whitening before a big day, we look after the whole family.",
      highlights: ["Online booking", "Children welcome", "Evening appointments", "Clear prices upfront"],
      reviews: [review("Tom R.", "I've avoided dentists for years. They were patient and explained everything."), review("Priya S.", "Booked my whole family in one evening. Kids actually enjoyed it."), review("Mark L.", "Whitening results were great and the price was exactly what they said.")],
      faqs: [{ q: "Are you taking new patients?", a: "Yes. Book a new patient check-up online and we'll take it from there." }, { q: "What if I'm nervous?", a: "Tell us when you arrive. We'll go slowly and you can stop at any time." }],
      rating: 4.8, reviewCount: 96,
      insurers: ["Bupa", "Denplan", "Simplyhealth", "AXA Health", "Vitality"], credentials: ["GDC registered"],
      beforeAfter: [{ before: "/samples/photo-3.svg", after: "/samples/photo-2.svg", caption: "Whitening, two sessions" }],
    },
    services: [["New patient check-up", "A full check, X-rays if needed, and a clear plan.", "tooth", 45, 75], ["Hygiene appointment", "Scale and polish to keep gums healthy.", "sparkle", 30, 65], ["Teeth whitening", "Professional whitening with custom trays.", "star", 60, 299], ["Children's check-up", "Friendly first visits for little ones.", "baby", 20, 0], ["Emergency appointment", "Same-day help for pain or a broken tooth.", "heart", 30, 95]],
    staff: [["Dr. Patel", "Dentist"], ["Dr. Okafor", "Dentist"], ["Emma", "Hygienist"]],
    hours: [[[1, 2, 3, 5], "08:30", "17:30"], [[4], "08:30", "20:00"]],
  },
  medical: {
    name: "Riverside Family Clinic", city: "Toronto", country: "CA", currency: "CAD", phone: "+1 416 555 0127", email: "front@riverside.example", address: "410 Queen St E, Toronto, ON M5A 1T3",
    content: {
      ...none,
      tagline: "Family doctors and walk-in care", headline: "Unhurried care from doctors who listen",
      subheadline: "Same-week appointments for the whole family. Book online in a minute.",
      ctaLabel: "Book an appointment", aboutTitle: "A clinic that runs on time",
      about: "We book fewer patients per hour so appointments start on time and nobody feels rushed.\n\nFrom check-ups to travel vaccines, we look after you and your family.",
      highlights: ["Online booking", "Same-week appointments", "Evening clinics", "Children welcome"],
      reviews: [review("Daniel W.", "Seen on time, listened to properly. Rare these days."), review("Aisha M.", "The online booking is so easy and the doctors are kind.")],
      faqs: [{ q: "Are you accepting new patients?", a: "Yes, book a new patient visit online." }],
      rating: 4.7, reviewCount: 143, insurers: ["OHIP", "Sun Life", "Manulife", "Canada Life"],
    },
    services: [["General check-up", "A full check and time for your questions.", "stethoscope", 20, null], ["Children's health", "Check-ups and vaccines for kids.", "baby", 20, null], ["Travel clinic", "Vaccines and advice before you go.", "map", 30, 60], ["Physicals", "Work, school and sports forms.", "check", 30, 80], ["Women's health", "Screening and contraception advice.", "heart", 20, null]],
    staff: [["Dr. Nguyen", "Family physician"], ["Dr. Brooks", "Family physician"], ["Sam", "Nurse practitioner"]],
    hours: [[[1, 2, 3, 4], "08:00", "19:00"], [[5], "08:00", "16:00"], [[6], "09:00", "13:00"]],
  },
  dermatology: {
    name: "ClearSkin Dermatology", city: "Melbourne", country: "AU", currency: "AUD", phone: "+61 3 5550 2210", email: "hello@clearskin.example", address: "Level 2, 120 Collins St, Melbourne VIC 3000",
    content: {
      ...none,
      tagline: "Medical and cosmetic dermatology", headline: "Skin care that starts with listening",
      subheadline: "Skin checks, acne and eczema care, and cosmetic treatments. Book online in a minute.",
      ctaLabel: "Book an appointment", aboutTitle: "Expert skin care, without the rush",
      about: "Longer appointments mean time to understand your skin and explain every option.\n\nMedical and cosmetic care in one place, with clear prices before you commit.",
      highlights: ["Online booking", "Medical and cosmetic", "Clear prices upfront"],
      reviews: [review("Hannah P.", "Thorough skin check and no rush at all. Highly recommend."), review("Chris D.", "Finally a plan for my acne that I understand.")],
      faqs: [{ q: "Do I need a referral?", a: "Not for cosmetic treatments. For medical visits a GP referral can help with rebates." }],
      rating: 4.9, reviewCount: 175, insurers: ["Medibank", "Bupa", "HCF", "nib"],
      beforeAfter: [{ before: "/samples/photo-8.svg", after: "/samples/photo-6.svg", caption: "Laser, three sessions" }],
    },
    services: [["Full skin check", "Head-to-toe check of moles and spots.", "eye", 30, 150], ["Acne consultation", "A plan that fits your skin and your life.", "sparkle", 30, 180], ["Eczema and rashes", "Diagnosis and a treatment plan you understand.", "leaf", 30, 180], ["Cosmetic injectables", "Subtle, natural-looking results.", "star", 45, null], ["Laser treatments", "For pigmentation, redness and texture.", "bolt", 60, null]],
    staff: [["Dr. Chen", "Dermatologist"], ["Dr. Walsh", "Dermatologist"]],
    hours: [[[1, 2, 3, 4, 5], "08:30", "17:00"]],
  },
  carwash: {
    name: "Gleam Car Spa", city: "Houston", country: "US", currency: "USD", phone: "+1 713 555 0148", email: "hello@gleam.example", address: "2410 Westheimer Rd, Houston, TX 77098",
    content: {
      ...none,
      tagline: "Hand wash and detailing", headline: "A showroom shine, without the wait",
      subheadline: "Hand washes, interior cleans and full details. Book a detail online or just drive in.",
      ctaLabel: "Book a detail", aboutTitle: "Washed by hand, checked by eye",
      about: "Every car is washed by hand with pH-neutral soap and fresh microfibre, so there are no swirl marks from old brushes.\n\nWe tell you the price before we start and walk round the car with you when it's done.",
      highlights: ["Hand wash only", "Prices by vehicle size", "Online booking for details", "Done while you wait"],
      reviews: [review("Ray G.", "My truck hasn't looked this good since I bought it."), review("Kim L.", "Fast, friendly, and they got the dog hair out. Magic."), review("Omar F.", "Booked a full detail online, done on time, worth every dollar.")],
      faqs: [{ q: "Do I need to book a wash?", a: "No, washes are drive-in. Book online for details so we can hold a bay for you." }],
      areasServed: ["Montrose", "River Oaks", "Midtown", "Rice Village", "Upper Kirby"],
      rating: 4.8, reviewCount: 412,
      packages: [
        { name: "Express", includes: ["Hand wash", "Wheels and tyres", "Spot-free dry"], prices: { car: 25, suv: 30, van: 35 } },
        { name: "Inside and out", includes: ["Everything in Express", "Vacuum", "Windows inside", "Dash and console wipe"], prices: { car: 55, suv: 65, van: 75 } },
        { name: "Full detail", includes: ["Everything in Inside and out", "Clay bar", "Machine polish", "Wax", "Interior shampoo"], prices: { car: 249, suv: 289, van: 329 } },
      ],
      beforeAfter: [{ before: "/samples/photo-3.svg", after: "/samples/photo-7.svg", caption: "Full detail on a 2016 F-150" }, { before: "/samples/photo-4.svg", after: "/samples/photo-2.svg", caption: "Interior shampoo" }],
    },
    services: [["Express", "Hand wash, wheels and a spot-free dry.", "droplet", 30, 25], ["Inside and out", "Exterior wash plus vacuum, windows and dash wipe.", "sparkle", 60, 55], ["Full detail", "Deep interior clean, clay bar, polish and wax.", "star", 240, 249], ["Ceramic coating", "Long-lasting gloss and protection, applied by hand.", "shield", 480, null], ["Interior shampoo", "Seats and carpets shampooed and extracted.", "home", 120, 129], ["Headlight restore", "Cloudy lights made clear again.", "sparkle", 45, 59]],
    staff: [["Bay 1", ""], ["Bay 2", ""]],
    hours: [[[1, 2, 3, 4, 5, 6], "08:00", "18:00"]],
  },
  autorepair: {
    name: "Northline Auto Repair", city: "Toronto", country: "CA", currency: "CAD", phone: "+1 416 555 0193", email: "service@northline.example", address: "88 Dupont St, Toronto, ON M5R 1V2",
    content: {
      ...none,
      tagline: "Independent mechanics", headline: "Honest repairs, explained before we start",
      subheadline: "Servicing, brakes, diagnostics and more. Book a slot online and we'll call you with a price first.",
      ctaLabel: "Book a service", aboutTitle: "The garage you don't have to second-guess",
      about: "We find the fault, call you with the price, and only then start work. No surprise bills.\n\nKeep your old parts if you want them, and ask us anything about your car.",
      highlights: ["Quote before any work", "Online booking", "Keep your old parts", "Wait or drop off"],
      reviews: [review("Steve P.", "Called me with the price before touching anything. Fair and fast."), review("Grace H.", "Other shops quoted double. These guys found the real problem.")],
      faqs: [{ q: "Can I wait while you work?", a: "For servicing and small jobs, yes. Pick 'I'll wait' when you book." }],
      areasServed: ["The Annex", "Yorkville", "Midtown", "Seaton Village"],
      rating: 4.9, reviewCount: 287,
      warranty: "12 months or 20,000 km on parts and labour for every repair.",
      credentials: ["Licensed technicians", "Member of the local auto repair association"],
    },
    services: [["Full service", "Oil, filters, fluids and a full safety check.", "wrench", 90, 189], ["Brakes", "Pads, discs and brake fluid, checked and replaced.", "shield", 120, null], ["Diagnostics", "Warning light on? We'll find out why.", "bolt", 60, 99], ["Tyres and alignment", "Fitting, balancing and four-wheel alignment.", "check", 60, null], ["Air conditioning", "Re-gas and leak check so it blows cold again.", "snowflake", 60, 129]],
    staff: [["Marco", "Lead mechanic"], ["Priya", "Mechanic"]],
    hours: [[[1, 2, 3, 4, 5], "07:30", "17:30"]],
  },
  homeservices: {
    name: "Coastline Plumbing & Gas", city: "Sydney", country: "AU", currency: "AUD", phone: "+61 2 5550 1987", email: "jobs@coastline.example", address: "Unit 4, 22 Pittwater Rd, Manly NSW 2095",
    content: {
      ...none,
      tagline: "Licensed plumbers and gasfitters", headline: "Leaks, blockages and hot water, sorted today",
      subheadline: "Upfront prices, on-time arrivals and a tidy job. Book a visit or call us now.",
      ctaLabel: "Book a plumber", aboutTitle: "Local plumbers who turn up when we say",
      about: "We're a small local team, so the person you speak to is the person who shows up. We tell you the price before we start and clean up before we leave.\n\nBlocked drain at 7am or a new hot water system, we treat every job the same way.",
      highlights: ["Upfront pricing", "Same-day visits", "Licensed and insured", "Tidy, no-mess work"],
      reviews: [review("Belinda C.", "Turned up in an hour, fixed the leak and cleaned up after."), review("Matt O.", "Price was exactly what they quoted. Will use again.")],
      faqs: [{ q: "Do you charge a call-out fee?", a: "We quote the full price before any work starts, so there are no surprises." }],
      areasServed: ["Manly", "Dee Why", "Mosman", "Brookvale", "Collaroy", "Freshwater"],
      rating: 4.9, reviewCount: 158,
      warranty: "Every job guaranteed for 2 years.", credentials: ["Licensed plumber and gasfitter", "Fully insured"],
    },
    services: [["Blocked drains", "Cleared fast with jetters and cameras, no guesswork.", "droplet", 90, 220], ["Hot water systems", "Repairs and same-day replacements, gas or electric.", "flame", 120, null], ["Leak detection", "Find hidden leaks before they become big bills.", "wrench", 60, 180], ["Gas fitting", "Cooktops, heaters and safety checks, fully certified.", "bolt", 90, null], ["Bathroom renovations", "Plumbing for new bathrooms, start to finish.", "home", 60, null]],
    staff: [["Jack", "Plumber"], ["Liam", "Gasfitter"]],
    hours: [[[1, 2, 3, 4, 5, 6], "07:00", "17:00"]],
  },
};

// words that stress a layout: long German compounds, and Arabic for right-to-left
const LANG: Record<string, { language: string; content: Partial<SiteContent>; labels?: Record<string, string> }> = {
  de: {
    language: "de",
    content: {
      tagline: "Kraftfahrzeugaufbereitung und Innenraumreinigung",
      headline: "Fahrzeugpflegedienstleistungen mit Qualitätsversprechen",
      subheadline: "Unverbindliche Terminvereinbarung, Kostenvoranschläge vor Arbeitsbeginn und Abholservice.",
      ctaLabel: "Termin vereinbaren", aboutTitle: "Handwerksqualität ohne Überraschungen",
    },
    labels: { nav_services: "Leistungen", nav_about: "Über uns", nav_reviews: "Bewertungen", nav_contact: "Kontakt", call: "Anrufen", sec_services_title: "Unsere Dienstleistungsübersicht" },
  },
  ar: {
    language: "ar",
    content: {
      tagline: "صالون شعر وتلوين", headline: "شعر يشبهك، لكن أجمل",
      subheadline: "قص وتلوين وتصفيف مع فريق يستمع إليك أولاً. احجز موعدك أونلاين في أقل من دقيقة.",
      ctaLabel: "احجز موعدك", aboutTitle: "استوديو صغير باهتمام كبير بالتفاصيل",
      about: "نحافظ على صغر الاستوديو عن قصد، حتى نمنح كل عميلة وقتاً أطول.\n\nنشرح كل خطوة ولا نستعجل النتيجة أبداً.",
      highlights: ["حجز أونلاين", "استشارة مجانية", "خبراء تلوين"],
    },
    labels: { nav_services: "الخدمات", nav_about: "من نحن", nav_reviews: "التقييمات", nav_contact: "تواصل", call: "اتصل", call_now: "اتصل الآن", sec_services_title: "خدماتنا", sec_reviews_title: "ماذا يقول عملاؤنا", sec_contact_title: "زورونا", sec_hours: "ساعات العمل", sec_faq_title: "أسئلة وأجوبة", form_send: "أرسل", sec_message_title: "أرسل لنا رسالة" },
  },
};

const hm = (s: string) => { const [h, m] = s.split(":").map(Number); return h * 60 + m; };

export function sampleSite(niche: Niche, opts: { photos?: boolean; lang?: string; palette?: SiteContent["palette"]; fonts?: [string, string] } = {}): SiteData {
  const s = SAMPLES[niche];
  const photos = opts.photos ?? true;
  const lang = LANG[opts.lang ?? ""];
  const content: SiteContent = {
    ...s.content,
    ...lang?.content,
    palette: opts.palette ?? { primary: "#1f6f8b", accent: "#5cc2b5", dark: "#13232b", light: "#f1f7f8" },
    headingFont: (opts.fonts?.[0] ?? "Fraunces") as SiteContent["headingFont"],
    bodyFont: (opts.fonts?.[1] ?? "Inter") as SiteContent["bodyFont"],
    logoUrl: null,
    heroImage: photos ? "/samples/photo-1.svg" : null,
    gallery: photos ? [2, 3, 4, 5, 6, 7, 8].map((n) => `/samples/photo-${n}.svg`) : [],
    beforeAfter: photos ? s.content.beforeAfter : [],
    instagram: "https://instagram.com/example",
    facebook: null,
    labels: lang?.labels ?? {},
  };
  const now = new Date();
  return buildSiteData({
    biz: {
      id: `sample-${niche}`, slug: `sample-${niche}`, customDomain: null, name: s.name, niche, theme: "", status: "demo",
      country: s.country, language: lang?.language ?? "en", currency: s.currency, timezone: "UTC",
      phone: s.phone, email: s.email, address: s.address, city: s.city,
      bookingMode: "internal", externalBookingUrl: null, reminderChannel: "whatsapp",
      slotStepMin: 15, minNoticeMin: 60, maxDaysAhead: 60, content, createdAt: now, updatedAt: now,
    },
    services: s.services.map(([name, description, icon, durationMin, price], i) => ({
      id: `svc-${i}`, name, description, icon, durationMin, priceCents: price == null ? null : price * 100, priceFrom: price != null && price > 100,
    })),
    staff: s.staff.map(([name, title], i) => ({ id: `staff-${i}`, name, title })),
    hours: s.hours.flatMap(([days, start, end]) => days.map((weekday) => ({ weekday, startMin: hm(start), endMin: hm(end) }))),
    onOwnDomain: false,
  });
}
