import "server-only";

import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/types/database";

export type Patient = Tables<"patients">;

// RLS already limits rows to the signed-in nutritionist.
export async function listPatients(search?: string): Promise<Patient[]> {
  const supabase = await createClient();
  let query = supabase
    .from("patients")
    .select("*")
    .order("last_name")
    .order("first_name");

  const term = search?.trim().replace(/[%,()]/g, "");
  if (term) {
    query = query.or(
      `first_name.ilike.%${term}%,last_name.ilike.%${term}%,email.ilike.%${term}%,phone.ilike.%${term}%`,
    );
  }

  const { data, error } = await query;
  if (error) throw new Error("Could not load patients");
  return data;
}

export async function getPatient(id: string): Promise<Patient | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("patients")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error("Could not load patient");
  return data;
}
