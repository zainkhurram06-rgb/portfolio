// Every trade the platform supports, and what makes each one different:
// which design it starts with, whether it's healthcare, and the extra questions
// its booking form asks. Adding a niche = one entry here plus labels.

export const NICHE_KEYS = [
  "salon", "dental", "medical", "dermatology", "carwash", "autorepair", "homeservices",
] as const;
export type Niche = (typeof NICHE_KEYS)[number];

export type BookingField =
  | { key: string; kind: "select"; required: boolean; options: string[] }
  | { key: string; kind: "text"; required: boolean; max: number };

type NicheConfig = {
  label: string;
  // healthcare: no free-text notes on bookings or customers, booking questions
  // never ask about symptoms. keeps patient health data out of the database.
  health: boolean;
  defaultTheme: string;
  bookingFields: BookingField[];
};

const patient: BookingField = { key: "patient_type", kind: "select", required: true, options: ["new", "returning"] };
const insurance: BookingField = { key: "insurance", kind: "text", required: false, max: 80 };

export const NICHES: Record<Niche, NicheConfig> = {
  salon: {
    label: "Beauty & hair salon", health: false, defaultTheme: "salon",
    bookingFields: [{ key: "client_type", kind: "select", required: true, options: ["new", "returning"] }],
  },
  dental: { label: "Dental clinic", health: true, defaultTheme: "clinic", bookingFields: [patient, insurance] },
  medical: { label: "Medical clinic", health: true, defaultTheme: "clinic", bookingFields: [patient, insurance] },
  dermatology: {
    label: "Dermatology & skin clinic", health: true, defaultTheme: "clinic",
    bookingFields: [patient, { key: "visit_kind", kind: "select", required: true, options: ["medical", "cosmetic"] }, insurance],
  },
  carwash: {
    label: "Car wash & detailing", health: false, defaultTheme: "homeservices",
    bookingFields: [
      { key: "vehicle_size", kind: "select", required: true, options: ["car", "suv", "van"] },
      { key: "vehicle", kind: "text", required: false, max: 80 },
    ],
  },
  autorepair: {
    label: "Mechanic & auto repair", health: false, defaultTheme: "homeservices",
    bookingFields: [
      { key: "vehicle", kind: "text", required: true, max: 80 },
      { key: "mileage", kind: "text", required: false, max: 20 },
      { key: "drop_off", kind: "select", required: true, options: ["wait", "drop_off"] },
    ],
  },
  homeservices: {
    label: "Home services & trades", health: false, defaultTheme: "homeservices",
    bookingFields: [{ key: "job_address", kind: "text", required: true, max: 200 }],
  },
};

// "SUV / 4x4 · 2019 Toyota Corolla" for the dashboard, in the given words
export function describeDetails(niche: string, details: Record<string, string> | null | undefined, words: Record<string, string>) {
  if (!details) return "";
  return fieldsFor(niche)
    .filter((f) => details[f.key])
    .map((f) => (f.kind === "select" ? words[`bfo_${details[f.key]}`] ?? details[f.key] : details[f.key]))
    .join(" · ");
}

export const isHealth = (niche: string) => NICHES[niche as Niche]?.health ?? false;
export const fieldsFor = (niche: string) => NICHES[niche as Niche]?.bookingFields ?? [];

// Checks the extra booking answers against the niche's questions. Unknown keys
// are dropped, so nothing outside the agreed questions can ever be stored.
export function cleanDetails(niche: string, raw: unknown): { ok: true; details: Record<string, string> } | { ok: false; field: string } {
  const input = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const details: Record<string, string> = {};
  for (const f of fieldsFor(niche)) {
    const v = typeof input[f.key] === "string" ? (input[f.key] as string).trim() : "";
    if (!v) {
      if (f.required) return { ok: false, field: f.key };
      continue;
    }
    if (f.kind === "select" && !f.options.includes(v)) return { ok: false, field: f.key };
    details[f.key] = f.kind === "text" ? v.slice(0, f.max) : v;
  }
  return { ok: true, details };
}
