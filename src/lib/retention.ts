import "server-only";

import { RETENTION_YEARS } from "@/lib/legal";
import { createAdminClient } from "@/lib/supabase/admin";

const BATCH = 500;

// Deletes patients (and, by cascade, their appointments) with no activity in
// the last RETENTION_YEARS years. Dry run unless RETENTION_ENFORCE=true, so
// the first runs only report what would be deleted. Returns counts only:
// never log or return patient data.
export async function enforceRetention() {
  const enforce = process.env.RETENTION_ENFORCE === "true";
  const admin = createAdminClient();

  const cutoff = new Date();
  cutoff.setFullYear(cutoff.getFullYear() - RETENTION_YEARS);
  const cutoffIso = cutoff.toISOString();

  const { data: candidates, error } = await admin
    .from("patients")
    .select("id")
    .lt("created_at", cutoffIso)
    .limit(BATCH);
  if (error) throw new Error("Could not load retention candidates");

  const ids = candidates.map((p) => p.id);
  if (ids.length === 0) {
    return { enforce, candidates: 0, expired: 0, deleted: 0 };
  }

  const { data: active, error: activeError } = await admin
    .from("appointments")
    .select("patient_id")
    .in("patient_id", ids)
    .gte("starts_at", cutoffIso);
  if (activeError) throw new Error("Could not check recent appointments");

  const stillActive = new Set(active.map((a) => a.patient_id));
  const expired = ids.filter((id) => !stillActive.has(id));

  let deleted = 0;
  if (enforce && expired.length > 0) {
    const { error: deleteError } = await admin
      .from("patients")
      .delete()
      .in("id", expired);
    if (deleteError) throw new Error("Could not delete expired patients");
    deleted = expired.length;
  }

  return {
    enforce,
    candidates: ids.length,
    expired: expired.length,
    deleted,
  };
}
