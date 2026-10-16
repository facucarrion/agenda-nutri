// Simulated data for the public booking page while the backend is not wired.
// Shapes mirror src/lib/public-booking.ts and /api/public/<slug>/*, so
// swapping these functions for real calls should not touch the UI.

export type PublicAppointmentType = {
  id: string;
  name: string;
  duration_minutes: number;
};

export type PublicProfile = {
  fullName: string;
  slug: string;
  timezone: string;
  types: PublicAppointmentType[];
};

export type BookingRequest = {
  type: string;
  starts_at: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  consent: true;
  website: string;
};

export type BookingResponse = { ok: true } | { ok: false; error: string };

const SLUG_RE = /^[a-z0-9-]{3,60}$/;
const MIN_NOTICE_HOURS = 2;
// Argentina has no DST, so a fixed offset is enough for fake data.
const AR_OFFSET = "-03:00";

const TYPES: PublicAppointmentType[] = [
  { id: "type-first-pres", name: "Primera asesoría · Presencial", duration_minutes: 60 },
  { id: "type-first-virt", name: "Primera asesoría · Telemedicina", duration_minutes: 60 },
  { id: "type-follow-pres", name: "Seguimiento · Presencial", duration_minutes: 30 },
  { id: "type-follow-virt", name: "Seguimiento · Telemedicina", duration_minutes: 30 },
  { id: "type-sport", name: "Nutrición deportiva · Valoración", duration_minutes: 60 },
  { id: "type-labs", name: "Interpretación de análisis clínicos", duration_minutes: 30 },
];

// Mirrors getPublicProfile(slug): null when the slug does not exist.
export function getMockProfile(slug: string): PublicProfile | null {
  if (!SLUG_RE.test(slug) || slug === "no-existe") return null;

  return {
    fullName: "Sol",
    slug,
    timezone: "America/Argentina/Buenos_Aires",
    types: TYPES,
  };
}

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Deterministic pseudo-random, so the same slot is always taken or free.
function hash(text: string) {
  let value = 0;
  for (const char of text) value = (value * 31 + char.charCodeAt(0)) | 0;
  return Math.abs(value);
}

// Some days are almost full or full, to exercise every calendar state.
const BUSY_RATE = [20, 40, 85, 100];

function addDays(date: string, days: number) {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

// Mirrors GET /api/public/<slug>/slots: UTC ISO start times, sorted.
// Mon–Fri 9–13 and 15–18, with some slots already taken.
export async function getMockSlots(
  typeId: string,
  fromDate: string,
  toDate: string,
): Promise<string[]> {
  await wait(400);

  const duration =
    TYPES.find((t) => t.id === typeId)?.duration_minutes ?? 30;
  const earliest = Date.now() + MIN_NOTICE_HOURS * 3_600_000;
  const ranges: [number, number][] = [
    [9 * 60, 13 * 60],
    [15 * 60, 18 * 60],
  ];
  const slots: string[] = [];

  for (let date = fromDate; date <= toDate; date = addDays(date, 1)) {
    const weekday = new Date(`${date}T12:00:00Z`).getUTCDay();
    if (weekday === 0 || weekday === 6) continue;

    const busyRate = BUSY_RATE[hash(date) % BUSY_RATE.length];

    for (const [start, end] of ranges) {
      for (let m = start; m + duration <= end; m += 30) {
        const hh = String(Math.floor(m / 60)).padStart(2, "0");
        const mm = String(m % 60).padStart(2, "0");
        const instant = new Date(`${date}T${hh}:${mm}:00${AR_OFFSET}`);
        const taken = hash(`${date}${hh}${mm}`) % 100 < busyRate;
        if (instant.getTime() < earliest || taken) continue;
        slots.push(instant.toISOString());
      }
    }
  }
  return slots;
}

// Mirrors POST /api/public/<slug>/book. Use an email containing "ocupado"
// to see the "slot taken" error.
export async function mockBook(body: BookingRequest): Promise<BookingResponse> {
  await wait(700);
  if (body.email.includes("ocupado")) {
    return { ok: false, error: "Ese horario ya no está disponible." };
  }
  return { ok: true };
}
