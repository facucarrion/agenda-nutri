// Simulated data for the nutritionist's screens while the backend is not
// wired. Appointment shape mirrors AgendaAppointment (src/lib/appointments.ts)
// and the schedule mirrors availability_rules / availability_blocks, so the
// UI should not change when the real queries replace these functions.

import { addDays, dayKey, instant, isoWeekday } from "./dates";

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

export type MockSchedule = {
  workdays: number[]; // 1 = Monday ... 7 = Sunday
  slotTimes: string[]; // start of every bookable slot, local time
  breakAfter: string; // the break goes after this slot in the week grid
  breakLabel: string;
  blockedDays: string[]; // YYYY-MM-DD (vacations, days off)
};

// Mon–Fri, a slot every 45 minutes, break from 12:45 to 15:00.
export function getMockSchedule(now: Date): MockSchedule {
  const today = dayKey(now);
  return {
    workdays: [1, 2, 3, 4, 5],
    slotTimes: ["09:00", "09:45", "10:30", "11:15", "12:00", "15:00", "15:45", "16:30"],
    breakAfter: "12:00",
    breakLabel: "Pausa · 12:45 a 15:00",
    blockedDays: [nextWorkday(addDays(today, 10))],
  };
}

const TYPES = [
  { id: "type-first", name: "Primera asesoría · Presencial", duration_minutes: 45 },
  { id: "type-first-virtual", name: "Primera asesoría · Telemedicina", duration_minutes: 45 },
  { id: "type-follow", name: "Seguimiento · Presencial", duration_minutes: 30 },
  { id: "type-follow-virtual", name: "Seguimiento · Telemedicina", duration_minutes: 30 },
  { id: "type-sport", name: "Nutrición deportiva · Valoración", duration_minutes: 45 },
  { id: "type-labs", name: "Interpretación de análisis clínicos", duration_minutes: 30 },
];

const FIRST_NAMES = [
  "Agustina", "Martín", "Lucía", "Carlos", "Camila", "Paula", "Julián", "Sofía",
  "Diego", "Mariano", "Elena", "Tomás", "Julia", "Pablo", "Rocío", "Bruno",
  "Marta", "Hugo", "Iván", "Verónica", "Luis", "Nadia", "Gonzalo", "Eva",
  "Sergio", "Clara", "Leo", "Micaela", "Raúl", "Florencia", "Valentina", "Joaquín",
];
const LAST_NAMES = [
  "Ríos", "Gómez", "Fernández", "Pérez", "Sosa", "Ledesma", "Castro", "Romero",
  "Molina", "Herrera", "Acosta", "Torres", "Suárez", "Medina", "Ruiz", "Benítez",
  "Díaz", "Álvarez", "Giménez", "Ortiz", "Rojas", "Vera", "Luna", "Ibarra",
];

// Hand-picked appointments around today, so every state is always visible.
const SEEDS: { day: number; time: string; first: string; last: string; type: number; status: AppointmentStatus }[] = [
  { day: 0, time: "15:00", first: "Paula", last: "Ledesma", type: 2, status: "confirmed" },
  { day: 1, time: "09:45", first: "Agustina", last: "Ríos", type: 0, status: "pending" },
  { day: 1, time: "11:15", first: "Martín", last: "Gómez", type: 3, status: "pending" },
  { day: 1, time: "12:00", first: "Julián", last: "Castro", type: 4, status: "confirmed" },
  { day: 2, time: "15:00", first: "Lucía", last: "Fernández", type: 4, status: "confirmed" },
  { day: 2, time: "15:45", first: "Carlos", last: "Pérez", type: 5, status: "confirmed" },
  { day: 3, time: "10:30", first: "Micaela", last: "Torres", type: 1, status: "pending" },
];

// Deterministic pseudo-random, so the same day always looks the same.
function hash(text: string) {
  let value = 7;
  for (const char of text) value = (value * 31 + char.charCodeAt(0)) | 0;
  return Math.abs(value);
}

function nextWorkday(key: string) {
  let day = key;
  while (isoWeekday(day) > 5) day = addDays(day, 1);
  return day;
}

// How busy a day is, in percent. Some days come out completely full.
const LOAD = [15, 30, 40, 55, 25, 100, 45];

// Mirrors listAppointments(): every appointment from ~6 weeks back to
// ~6 weeks ahead, sorted by start. `now` comes from the caller so server
// and client agree on "today".
export function getMockAppointments(now: Date): MockAppointment[] {
  const today = dayKey(now);
  const schedule = getMockSchedule(now);
  const taken = new Map<string, MockAppointment>();
  let count = 0;

  function add(
    day: string,
    time: string,
    first: string,
    last: string,
    type: (typeof TYPES)[number],
    status: AppointmentStatus,
  ) {
    count += 1;
    const start = instant(day, time);
    taken.set(`${day} ${time}`, {
      id: `appt-${count}`,
      starts_at: start,
      ends_at: new Date(new Date(start).getTime() + type.duration_minutes * 60_000).toISOString(),
      status,
      source: status === "pending" ? "public" : "manual",
      notes: null,
      patient_id: `patient-${first}-${last}`,
      appointment_type_id: type.id,
      patients: {
        first_name: first,
        last_name: last,
        phone: `+54 9 351 555 ${String(100 + (hash(first + last) % 900)).padStart(4, "0")}`,
      },
      appointment_types: { name: type.name, duration_minutes: type.duration_minutes },
    });
  }

  for (const seed of SEEDS) {
    const day = nextWorkday(addDays(today, seed.day));
    let index = schedule.slotTimes.indexOf(seed.time);
    while (taken.has(`${day} ${schedule.slotTimes[index]}`)) index += 1;
    add(day, schedule.slotTimes[index], seed.first, seed.last, TYPES[seed.type], seed.status);
  }

  for (let offset = -42; offset <= 42; offset += 1) {
    const day = addDays(today, offset);
    if (!schedule.workdays.includes(isoWeekday(day))) continue;
    if (schedule.blockedDays.includes(day)) continue;

    // Fewer bookings the further ahead, like a real agenda.
    const load = LOAD[hash(day) % LOAD.length] * (offset > 21 ? 0.5 : 1);

    for (const time of schedule.slotTimes) {
      if (taken.has(`${day} ${time}`)) continue;
      const roll = hash(`${day}${time}`);
      if (roll % 100 >= load) continue;

      const first = FIRST_NAMES[roll % FIRST_NAMES.length];
      const last = LAST_NAMES[(roll >> 5) % LAST_NAMES.length];
      const type = TYPES[(roll >> 3) % TYPES.length];
      const r = (roll >> 7) % 20;
      let status: AppointmentStatus;
      if (offset < -2) status = r < 17 ? "completed" : "no_show";
      else if (offset < 0) status = r < 12 ? "completed" : "confirmed"; // not marked yet
      else if (offset === 0) status = "confirmed";
      else if (r === 0) status = "cancelled";
      else if (offset <= 7 && r < 3) status = "pending";
      else status = "confirmed";

      add(day, time, first, last, type, status);
    }
  }

  return [...taken.values()].sort((a, b) => a.starts_at.localeCompare(b.starts_at));
}
