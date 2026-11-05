"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { Enums } from "@/types/database";

export type AppointmentResult =
  | { ok: true; id: string }
  | { ok: false; error: string };

// Both screens list appointments, so both are refreshed after a change.
function refresh() {
  revalidatePath("/dashboard/agenda");
  revalidatePath("/dashboard/turnos");
}
const OVERLAP = "23P01"; // exclusion_violation
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function text(formData: FormData, name: string, max = 200) {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

const unauthenticated: AppointmentResult = {
  ok: false,
  error: "Tu sesión expiró. Volvé a ingresar.",
};

function failure(error: { code?: string; message?: string }): AppointmentResult {
  if (error.code === OVERLAP) {
    return { ok: false, error: "Ya hay un turno en ese horario." };
  }
  return { ok: false, error: "No pudimos guardar el turno." };
}

async function context() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { supabase, userId: user?.id ?? null };
}

type Parsed =
  | {
      patientId: string;
      typeId: string;
      startsAt: Date;
      notes: string | null;
    }
  | { error: string };

function parse(formData: FormData): Parsed {
  const patientId = text(formData, "patient_id");
  const typeId = text(formData, "appointment_type_id");
  const startsAt = new Date(text(formData, "starts_at"));
  const notes = text(formData, "notes", 2000);

  if (!UUID_RE.test(patientId)) return { error: "Elegí un paciente." };
  if (!UUID_RE.test(typeId)) return { error: "Elegí un tipo de consulta." };
  if (Number.isNaN(startsAt.getTime())) return { error: "Fecha u hora inválida." };

  return { patientId, typeId, startsAt, notes: notes || null };
}

// The end time comes from the consultation type, never from the client.
async function endsAtFor(
  supabase: Awaited<ReturnType<typeof createClient>>,
  typeId: string,
  startsAt: Date,
): Promise<{ error: string } | { endsAt: Date }> {
  const { data } = await supabase
    .from("appointment_types")
    .select("duration_minutes, is_active")
    .eq("id", typeId)
    .maybeSingle();

  if (!data || !data.is_active) {
    return { error: "El tipo de consulta no está disponible." };
  }
  return {
    endsAt: new Date(startsAt.getTime() + data.duration_minutes * 60_000),
  };
}

type Supabase = Awaited<ReturnType<typeof createClient>>;

async function insertManualAppointment(
  supabase: Supabase,
  userId: string,
  input: { patientId: string; typeId: string; startsAt: Date; notes: string | null },
): Promise<AppointmentResult> {
  const end = await endsAtFor(supabase, input.typeId, input.startsAt);
  if ("error" in end) return { ok: false, error: end.error };

  const { data, error } = await supabase
    .from("appointments")
    .insert({
      nutritionist_id: userId,
      patient_id: input.patientId,
      appointment_type_id: input.typeId,
      starts_at: input.startsAt.toISOString(),
      ends_at: end.endsAt.toISOString(),
      status: "confirmed",
      source: "manual",
      notes: input.notes,
    })
    .select("id")
    .single();

  if (error) return failure(error);

  refresh();
  return { ok: true, id: data.id };
}

export async function createAppointment(
  formData: FormData,
): Promise<AppointmentResult> {
  const parsed = parse(formData);
  if ("error" in parsed) return { ok: false, error: parsed.error };

  const { supabase, userId } = await context();
  if (!userId) return unauthenticated;

  return insertManualAppointment(supabase, userId, parsed);
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^\+?[\d\s().-]{6,30}$/;

// Books a turno for someone who is not loaded yet (a phone call, a walk-in).
// Only the basic contact data is stored, the same as the public form:
// name, last name, phone and an optional email. An existing patient is
// reused (same email, or same name and phone) and never overwritten.
export async function createAppointmentWithPatient(
  formData: FormData,
): Promise<AppointmentResult> {
  const firstName = text(formData, "first_name", 80);
  const lastName = text(formData, "last_name", 80);
  const phone = text(formData, "phone", 40);
  const email = text(formData, "email", 200).toLowerCase();
  const typeId = text(formData, "appointment_type_id");
  const startsAt = new Date(text(formData, "starts_at"));

  if (!firstName || !lastName) return { ok: false, error: "Completá nombre y apellido." };
  if (!PHONE_RE.test(phone)) return { ok: false, error: "Completá un teléfono válido." };
  if (email && !EMAIL_RE.test(email)) return { ok: false, error: "El email no es válido." };
  if (!UUID_RE.test(typeId)) return { ok: false, error: "Elegí un tipo de consulta." };
  if (Number.isNaN(startsAt.getTime())) return { ok: false, error: "Fecha u hora inválida." };

  const { supabase, userId } = await context();
  if (!userId) return unauthenticated;

  let patientId: string | null = null;
  let created = false;

  const existing = email
    ? await supabase.from("patients").select("id").eq("email", email).maybeSingle()
    : await supabase
        .from("patients")
        .select("id")
        .eq("first_name", firstName)
        .eq("last_name", lastName)
        .eq("phone", phone)
        .limit(1)
        .maybeSingle();
  patientId = existing.data?.id ?? null;

  if (!patientId) {
    const { data, error } = await supabase
      .from("patients")
      .insert({
        nutritionist_id: userId,
        first_name: firstName,
        last_name: lastName,
        phone,
        email: email || null,
      })
      .select("id")
      .single();
    if (error) return { ok: false, error: "No pudimos guardar los datos del paciente." };
    patientId = data.id;
    created = true;
  }

  const result = await insertManualAppointment(supabase, userId, {
    patientId,
    typeId,
    startsAt,
    notes: null,
  });

  // Do not leave a contact without turno behind when the booking fails.
  if (!result.ok && created) {
    await supabase.from("patients").delete().eq("id", patientId);
  }
  return result;
}

export async function updateAppointment(
  id: string,
  formData: FormData,
): Promise<AppointmentResult> {
  const parsed = parse(formData);
  if ("error" in parsed) return { ok: false, error: parsed.error };

  const { supabase, userId } = await context();
  if (!userId) return unauthenticated;

  const end = await endsAtFor(supabase, parsed.typeId, parsed.startsAt);
  if ("error" in end) return { ok: false, error: end.error };

  const { data, error } = await supabase
    .from("appointments")
    .update({
      patient_id: parsed.patientId,
      appointment_type_id: parsed.typeId,
      starts_at: parsed.startsAt.toISOString(),
      ends_at: end.endsAt.toISOString(),
      notes: parsed.notes,
    })
    .eq("id", id)
    .in("status", ["pending", "confirmed"])
    .select("id")
    .maybeSingle();

  if (error) return failure(error);
  if (!data) {
    return { ok: false, error: "No encontramos un turno activo para editar." };
  }

  refresh();
  return { ok: true, id: data.id };
}

type FinalStatus = Extract<
  Enums<"appointment_status">,
  "cancelled" | "completed" | "no_show"
>;

async function setStatus(
  id: string,
  status: FinalStatus,
): Promise<AppointmentResult> {
  const { supabase, userId } = await context();
  if (!userId) return unauthenticated;

  const { data, error } = await supabase
    .from("appointments")
    .update({ status })
    .eq("id", id)
    .in("status", ["pending", "confirmed"])
    .select("id")
    .maybeSingle();

  if (error) return failure(error);
  if (!data) {
    return { ok: false, error: "El turno ya no está activo." };
  }

  refresh();
  return { ok: true, id: data.id };
}

// Cancelling frees the slot (the overlap rule only applies to active turnos).
export async function cancelAppointment(id: string) {
  return setStatus(id, "cancelled");
}

export async function completeAppointment(id: string) {
  return setStatus(id, "completed");
}

export async function markNoShow(id: string) {
  return setStatus(id, "no_show");
}

// A pending booking is waiting for the patient's email link. The nutritionist
// can confirm it by hand (for example after a phone call) while it has not
// expired; expired ones already released the slot.
export async function confirmAppointment(id: string): Promise<AppointmentResult> {
  const { supabase, userId } = await context();
  if (!userId) return unauthenticated;

  const { data, error } = await supabase
    .from("appointments")
    .update({
      status: "confirmed",
      confirmation_token_hash: null,
      pending_expires_at: null,
    })
    .eq("id", id)
    .eq("status", "pending")
    .or(`pending_expires_at.is.null,pending_expires_at.gt.${new Date().toISOString()}`)
    .select("id")
    .maybeSingle();

  if (error) return failure(error);
  if (!data) {
    return { ok: false, error: "El pedido ya no está pendiente o venció." };
  }

  refresh();
  return { ok: true, id: data.id };
}
