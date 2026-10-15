"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { TablesInsert } from "@/types/database";

export type PatientResult =
  | { ok: true; id: string }
  | { ok: false; error: string };

const PATH = "/dashboard/patients";
const UNIQUE_VIOLATION = "23505";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

type PatientFields = Omit<TablesInsert<"patients">, "nutritionist_id" | "id">;

function text(formData: FormData, name: string, max: number) {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function optionalNumber(formData: FormData, name: string) {
  const raw = text(formData, name, 12).replace(",", ".");
  if (!raw) return null;
  const value = Number(raw);
  return Number.isFinite(value) ? value : NaN;
}

function parse(
  formData: FormData,
): { fields: PatientFields } | { error: string } {
  const firstName = text(formData, "first_name", 80);
  const lastName = text(formData, "last_name", 80);
  const email = text(formData, "email", 200).toLowerCase();
  const phone = text(formData, "phone", 40);
  const birthDate = text(formData, "birth_date", 10);
  const dni = text(formData, "dni", 20).replace(/[.\s]/g, "");
  const notes = text(formData, "notes", 5000);
  const weight = optionalNumber(formData, "weight_kg");
  const height = optionalNumber(formData, "height_cm");

  if (!firstName || !lastName) {
    return { error: "Completá nombre y apellido." };
  }
  if (email && !EMAIL_RE.test(email)) {
    return { error: "El email no es válido." };
  }
  if (birthDate) {
    const date = new Date(`${birthDate}T00:00:00Z`);
    if (!DATE_RE.test(birthDate) || Number.isNaN(date.getTime()) || date > new Date()) {
      return { error: "La fecha de nacimiento no es válida." };
    }
  }
  if (dni && !/^\d{6,10}$/.test(dni)) {
    return { error: "El DNI no es válido." };
  }
  if (weight !== null && !(weight > 0 && weight < 500)) {
    return { error: "El peso no es válido." };
  }
  if (height !== null && !(height > 0 && height < 300)) {
    return { error: "La altura no es válida." };
  }

  return {
    fields: {
      first_name: firstName,
      last_name: lastName,
      email: email || null,
      phone: phone || null,
      birth_date: birthDate || null,
      dni: dni || null,
      notes: notes || null,
      weight_kg: weight,
      height_cm: height,
    },
  };
}

async function context() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { supabase, userId: user?.id ?? null };
}

const unauthenticated: PatientResult = {
  ok: false,
  error: "Tu sesión expiró. Volvé a ingresar.",
};

function failure(code?: string): PatientResult {
  if (code === UNIQUE_VIOLATION) {
    return { ok: false, error: "Ya tenés un paciente con ese email." };
  }
  return { ok: false, error: "No pudimos guardar el paciente." };
}

export async function createPatient(formData: FormData): Promise<PatientResult> {
  const parsed = parse(formData);
  if ("error" in parsed) return { ok: false, error: parsed.error };

  const { supabase, userId } = await context();
  if (!userId) return unauthenticated;

  const { data, error } = await supabase
    .from("patients")
    .insert({ ...parsed.fields, nutritionist_id: userId })
    .select("id")
    .single();

  if (error) return failure(error.code);

  revalidatePath(PATH);
  return { ok: true, id: data.id };
}

export async function updatePatient(
  id: string,
  formData: FormData,
): Promise<PatientResult> {
  const parsed = parse(formData);
  if ("error" in parsed) return { ok: false, error: parsed.error };

  const { supabase, userId } = await context();
  if (!userId) return unauthenticated;

  const { data, error } = await supabase
    .from("patients")
    .update(parsed.fields)
    .eq("id", id)
    .select("id")
    .maybeSingle();

  if (error) return failure(error.code);
  if (!data) return { ok: false, error: "No encontramos al paciente." };

  revalidatePath(PATH);
  revalidatePath(`${PATH}/${id}`);
  return { ok: true, id: data.id };
}

// Also deletes the patient's appointments (on delete cascade): the UI must
// ask for confirmation first.
export async function deletePatient(id: string): Promise<PatientResult> {
  const { supabase, userId } = await context();
  if (!userId) return unauthenticated;

  const { data, error } = await supabase
    .from("patients")
    .delete()
    .eq("id", id)
    .select("id")
    .maybeSingle();

  if (error) return failure(error.code);
  if (!data) return { ok: false, error: "No encontramos al paciente." };

  revalidatePath(PATH);
  return { ok: true, id: data.id };
}
