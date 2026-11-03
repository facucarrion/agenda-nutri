import "server-only";

import { parseDate, zonedToUtc } from "@/lib/slots";
import { createClient } from "@/lib/supabase/server";
import { addDays, dayKey, instant } from "./dates";
import type { DashboardAppointment, Schedule } from "./types";

// The screens navigate month by month, so one window around today is loaded.
const DAYS_BACK = 60;
const DAYS_AHEAD = 120;
// PostgREST returns at most 1000 rows per request.
const PAGE = 1000;

const SELECT =
  "id, starts_at, ends_at, status, source, notes, patient_id, appointment_type_id, patients(first_name, last_name, phone), appointment_types(name, duration_minutes)";

// RLS limits the rows to the signed-in nutritionist. Unconfirmed public
// bookings that already expired are left out: they no longer hold the slot.
export async function getAppointments(now: Date): Promise<DashboardAppointment[]> {
  const supabase = await createClient();
  const today = dayKey(now);
  const from = instant(addDays(today, -DAYS_BACK), "00:00");
  const to = instant(addDays(today, DAYS_AHEAD + 1), "00:00");

  const rows = [];
  for (let offset = 0; ; offset += PAGE) {
    const { data, error } = await supabase
      .from("appointments")
      .select(SELECT)
      .gte("starts_at", from)
      .lt("starts_at", to)
      .or(
        `status.neq.pending,pending_expires_at.is.null,pending_expires_at.gt.${now.toISOString()}`,
      )
      .order("starts_at")
      .order("id")
      .range(offset, offset + PAGE - 1);

    if (error) throw new Error("Could not load appointments");
    rows.push(...data);
    if (data.length < PAGE) break;
  }

  return rows.map((row) => {
    const startsAt = new Date(row.starts_at);
    const endsAt = new Date(row.ends_at);
    return {
      id: row.id,
      // Normalized so string comparisons against `now` are reliable.
      starts_at: startsAt.toISOString(),
      ends_at: endsAt.toISOString(),
      status: row.status,
      source: row.source,
      notes: row.notes,
      patient_id: row.patient_id,
      appointment_type_id: row.appointment_type_id,
      patients: row.patients,
      // The type can be deleted later; the appointment keeps its time.
      appointment_types: row.appointment_types ?? {
        name: "Consulta",
        duration_minutes: Math.round((endsAt.getTime() - startsAt.getTime()) / 60_000),
      },
    };
  });
}

const pad = (n: number) => String(n).padStart(2, "0");
const toMinutes = (time: string) => Number(time.slice(0, 2)) * 60 + Number(time.slice(3, 5));
const toTime = (minutes: number) => `${pad(Math.floor(minutes / 60))}:${pad(minutes % 60)}`;
// availability_rules.weekday: 0 = Sunday ... 6 = Saturday -> 1 = Monday ... 7 = Sunday.
const isoWeekday = (weekday: number) => (weekday === 0 ? 7 : weekday);

// Weekly hours and days off of the signed-in nutritionist, in the shape the
// agenda needs. The week grid has one set of rows, so it shows every start
// time used on any day.
export async function getSchedule(now: Date): Promise<Schedule> {
  const supabase = await createClient();

  const [profile, rules, blocks] = await Promise.all([
    supabase.from("nutritionists").select("slot_minutes, timezone").single(),
    supabase.from("availability_rules").select("weekday, start_time, end_time"),
    supabase
      .from("availability_blocks")
      .select("starts_at, ends_at")
      .gte("ends_at", new Date(now.getTime() - DAYS_BACK * 86_400_000).toISOString()),
  ]);

  if (profile.error || rules.error || blocks.error) {
    throw new Error("Could not load the schedule");
  }

  const { slot_minutes: step, timezone } = profile.data;

  const workdays = [...new Set(rules.data.map((r) => isoWeekday(r.weekday)))].sort();

  const starts = new Set<number>();
  for (const rule of rules.data) {
    const end = toMinutes(rule.end_time);
    for (let t = toMinutes(rule.start_time); t + step <= end; t += step) starts.add(t);
  }
  const slots = [...starts].sort((a, b) => a - b);

  // The grid draws a single break: the first gap between two slots.
  let breakAfter = "";
  let breakLabel = "";
  for (let i = 0; i < slots.length - 1; i += 1) {
    if (slots[i + 1] - slots[i] > step) {
      breakAfter = toTime(slots[i]);
      breakLabel = `Pausa · ${toTime(slots[i] + step)} a ${toTime(slots[i + 1])}`;
      break;
    }
  }

  // A day counts as blocked when a block covers all of that day's hours.
  const dayFmt = new Intl.DateTimeFormat("en-CA", { timeZone: timezone });
  const blockedDays = new Set<string>();
  for (const block of blocks.data) {
    const start = new Date(block.starts_at);
    const end = new Date(block.ends_at);
    const last = dayFmt.format(end);

    let key = dayFmt.format(start);
    for (let guard = 0; guard < 400; guard += 1) {
      const date = parseDate(key);
      if (date) {
        const weekday = isoWeekday(new Date(Date.UTC(date.y, date.mo - 1, date.d)).getUTCDay());
        const dayRules = rules.data.filter((r) => isoWeekday(r.weekday) === weekday);
        if (dayRules.length > 0) {
          const open = Math.min(...dayRules.map((r) => toMinutes(r.start_time)));
          const close = Math.max(...dayRules.map((r) => toMinutes(r.end_time)));
          const opensAt = zonedToUtc(date.y, date.mo, date.d, open, timezone);
          const closesAt = zonedToUtc(date.y, date.mo, date.d, close, timezone);
          if (start <= opensAt && end >= closesAt) blockedDays.add(key);
        }
      }
      if (key >= last) break;
      key = addDays(key, 1);
    }
  }

  return {
    workdays,
    slotTimes: slots.map(toTime),
    breakAfter,
    breakLabel,
    blockedDays: [...blockedDays].sort(),
  };
}
