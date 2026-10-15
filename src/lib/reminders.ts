import "server-only";

import { sendEmail } from "@/lib/email";
import { reminderEmail } from "@/lib/email-templates";
import { createAdminClient } from "@/lib/supabase/admin";

const FROM_HOURS = 1;
const TO_HOURS = 36;

// Sends one reminder per confirmed turno starting in the next ~36 hours that
// was not reminded yet. Meant to run once a day from a cron.
export async function sendDueReminders() {
  const admin = createAdminClient();
  const now = Date.now();

  const { data, error } = await admin
    .from("appointments")
    .select(
      "id, starts_at, patients(first_name, email), nutritionists(full_name, timezone)",
    )
    .eq("status", "confirmed")
    .is("reminder_sent_at", null)
    .gte("starts_at", new Date(now + FROM_HOURS * 3_600_000).toISOString())
    .lt("starts_at", new Date(now + TO_HOURS * 3_600_000).toISOString())
    .order("starts_at");

  if (error) throw new Error("Could not load appointments to remind");

  let sent = 0;
  let skipped = 0;
  let failed = 0;

  for (const appointment of data) {
    const patient = appointment.patients;
    const nutritionist = appointment.nutritionists;

    if (!patient?.email || !nutritionist) {
      skipped += 1;
      continue;
    }

    const message = reminderEmail({
      patientName: patient.first_name,
      nutritionistName: nutritionist.full_name || "tu nutricionista",
      startsAt: appointment.starts_at,
      timezone: nutritionist.timezone,
    });

    const ok = await sendEmail({ to: patient.email, ...message });
    if (!ok) {
      failed += 1;
      continue;
    }

    await admin
      .from("appointments")
      .update({ reminder_sent_at: new Date().toISOString() })
      .eq("id", appointment.id);
    sent += 1;
  }

  return { sent, skipped, failed };
}
