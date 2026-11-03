// Simulated appointments for the agenda while the backend is not wired.
// The shape mirrors AgendaAppointment from src/lib/appointments.ts, so the
// UI should not change when listAppointments() replaces this.

export type AppointmentStatus =
  | "pending"
  | "confirmed"
  | "cancelled"
  | "completed"
  | "no_show";

export type MockAppointment = {
  id: string;
  starts_at: string;
  ends_at: string;
  status: AppointmentStatus;
  source: "manual" | "public";
  notes: string | null;
  patient_id: string;
  appointment_type_id: string;
  patients: { first_name: string; last_name: string; phone: string | null };
  appointment_types: { name: string; duration_minutes: number };
};

export const TIMEZONE = "America/Argentina/Buenos_Aires";
// Argentina has no DST, so a fixed offset is enough for fake data.
const AR_OFFSET = "-03:00";

const TYPES = {
  first: { name: "Primera asesoría · Presencial", duration_minutes: 60 },
  firstVirtual: { name: "Primera asesoría · Telemedicina", duration_minutes: 60 },
  follow: { name: "Seguimiento · Presencial", duration_minutes: 30 },
  followVirtual: { name: "Seguimiento · Telemedicina", duration_minutes: 30 },
  sport: { name: "Nutrición deportiva · Valoración", duration_minutes: 60 },
  labs: { name: "Interpretación de análisis clínicos", duration_minutes: 30 },
};

type Seed = {
  day: number; // days from today
  time: string;
  first: string;
  last: string;
  type: keyof typeof TYPES;
  status: AppointmentStatus;
  source?: "manual" | "public";
};

// Spread around today so every state shows up: past visits to close,
// pending requests to answer and confirmed ones to remind.
const SEEDS: Seed[] = [
  { day: -9, time: "10:00", first: "Valentina", last: "Molina", type: "follow", status: "completed" },
  { day: -6, time: "16:30", first: "Joaquín", last: "Herrera", type: "followVirtual", status: "no_show" },
  { day: -2, time: "09:00", first: "Florencia", last: "Castro", type: "first", status: "completed" },
  { day: -1, time: "11:30", first: "Tomás", last: "Acosta", type: "labs", status: "confirmed" },
  { day: 0, time: "15:00", first: "Paula", last: "Romero", type: "follow", status: "confirmed" },
  { day: 1, time: "09:45", first: "Agustina", last: "Ríos", type: "first", status: "pending", source: "public" },
  { day: 1, time: "11:15", first: "Martín", last: "Gómez", type: "followVirtual", status: "pending", source: "public" },
  { day: 2, time: "15:00", first: "Lucía", last: "Fernández", type: "sport", status: "confirmed" },
  { day: 2, time: "15:45", first: "Carlos", last: "Pérez", type: "labs", status: "confirmed" },
  { day: 3, time: "10:30", first: "Micaela", last: "Torres", type: "firstVirtual", status: "pending", source: "public" },
  { day: 6, time: "09:00", first: "Camila", last: "Sosa", type: "follow", status: "confirmed" },
  { day: 8, time: "17:00", first: "Nicolás", last: "Suárez", type: "sport", status: "cancelled", source: "public" },
  { day: 13, time: "10:00", first: "Julieta", last: "Medina", type: "follow", status: "confirmed" },
  { day: 27, time: "16:00", first: "Santiago", last: "Ruiz", type: "first", status: "confirmed" },
  { day: 34, time: "09:30", first: "Rocío", last: "Benítez", type: "followVirtual", status: "pending", source: "public" },
];

function addDays(date: string, days: number) {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

// Mirrors listAppointments(): every appointment, sorted by start.
// `now` comes from the caller so server and client agree on "today".
export function getMockAppointments(now: Date): MockAppointment[] {
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: TIMEZONE }).format(now);

  return SEEDS.map((seed, index) => {
    const type = TYPES[seed.type];
    const start = new Date(`${addDays(today, seed.day)}T${seed.time}:00${AR_OFFSET}`);
    const end = new Date(start.getTime() + type.duration_minutes * 60_000);
    const phoneTail = String(101 + index).padStart(4, "0");

    return {
      id: `appt-${index + 1}`,
      starts_at: start.toISOString(),
      ends_at: end.toISOString(),
      status: seed.status,
      source: seed.source ?? "manual",
      notes: null,
      patient_id: `patient-${index + 1}`,
      appointment_type_id: `type-${seed.type}`,
      patients: {
        first_name: seed.first,
        last_name: seed.last,
        phone: `+54 9 351 555 ${phoneTail}`,
      },
      appointment_types: type,
    };
  }).sort((a, b) => a.starts_at.localeCompare(b.starts_at));
}
