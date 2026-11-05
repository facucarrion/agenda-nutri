// Shapes the nutritionist's screens work with. The appointment mirrors a
// row of listAppointments-style queries; the schedule is derived from
// availability_rules / availability_blocks (see ./data.ts).

export type AppointmentStatus =
  | "pending"
  | "confirmed"
  | "cancelled"
  | "completed"
  | "no_show";

export type DashboardAppointment = {
  id: string;
  starts_at: string; // UTC ISO
  ends_at: string; // UTC ISO
  status: AppointmentStatus;
  source: "manual" | "public";
  notes: string | null;
  patient_id: string;
  appointment_type_id: string | null;
  patients: { first_name: string; last_name: string; phone: string | null };
  appointment_types: { name: string; duration_minutes: number };
};

export type Schedule = {
  workdays: number[]; // 1 = Monday ... 7 = Sunday
  slotTimes: string[]; // start of every bookable slot, local time
  breakAfter: string; // the break goes after this slot in the week grid ("" = none)
  breakLabel: string;
  blockedDays: string[]; // YYYY-MM-DD (vacations, days off)
};

// A consultation type as the booking dialog and the availability screen use it.
export type TypeOption = {
  id: string;
  name: string;
  duration_minutes: number;
};

export type ConsultationType = TypeOption & { is_active: boolean };

export type WeeklyRule = {
  id: string;
  weekday: number; // 0 = Sunday ... 6 = Saturday (as stored)
  start_time: string; // HH:MM
  end_time: string; // HH:MM
};

export type DayOff = {
  id: string;
  starts_at: string; // UTC ISO
  ends_at: string; // UTC ISO
  reason: string | null;
};

export type AvailabilityData = {
  slug: string;
  slotMinutes: number;
  minNoticeHours: number;
  rules: WeeklyRule[];
  blocks: DayOff[];
  types: ConsultationType[];
};
