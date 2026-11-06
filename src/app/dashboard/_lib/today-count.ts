"use server";

import { createClient } from "@/lib/supabase/server";
import { addDays, dayKey, instant } from "./dates";

// Appointments of the signed-in nutritionist that start today (Argentina),
// for the live favicon. Leaves out cancelled ones and public bookings that
// expired unconfirmed. RLS limits the rows to the nutritionist.
export async function getTodayAppointmentCount(): Promise<number> {
  try {
    const now = new Date();
    const today = dayKey(now);
    const supabase = await createClient();
    const { count, error } = await supabase
      .from("appointments")
      .select("id", { count: "exact", head: true })
      .gte("starts_at", instant(today, "00:00"))
      .lt("starts_at", instant(addDays(today, 1), "00:00"))
      .neq("status", "cancelled")
      .or(
        `status.neq.pending,pending_expires_at.is.null,pending_expires_at.gt.${now.toISOString()}`,
      );
    if (error) return 0;
    return count ?? 0;
  } catch {
    // No session or no database (e.g. UI preview): just no badge.
    return 0;
  }
}
