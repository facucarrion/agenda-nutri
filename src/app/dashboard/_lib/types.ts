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
