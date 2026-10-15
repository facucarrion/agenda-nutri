import "server-only";

import { createClient } from "@/lib/supabase/server";

// Appointment with the data the agenda needs to render a card.
export async function listAppointments(from: Date, to: Date) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("appointments")
    .select(
      "id, starts_at, ends_at, status, source, notes, patient_id, appointment_type_id, patients(first_name, last_name, phone), appointment_types(name, duration_minutes)",
    )
    .gte("starts_at", from.toISOString())
    .lt("starts_at", to.toISOString())
    .order("starts_at");

  if (error) throw new Error("Could not load appointments");
  return data;
}

export type AgendaAppointment = Awaited<
  ReturnType<typeof listAppointments>
>[number];
