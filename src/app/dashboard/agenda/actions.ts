"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { Enums } from "@/types/database";

export type AppointmentResult =
  | { ok: true; id: string }
  | {
      ok: false;
      error: string;
      // createAppointmentWithPatient only: the email belongs to a patient
      // with another name, and the nutritionist has to say who this is.
      conflict?: { patientName: string };
    };

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
  keepTypeId: string | null = null,
): Promise<{ error: string } | { endsAt: Date }> {
  const { data } = await supabase
    .from("appointment_types")
    .select("duration_minutes, is_active")
    .eq("id", typeId)
    .maybeSingle();

  // A paused type is still valid for the turno that already uses it.
  if (!data || (!data.is_active && typeId !== keepTypeId)) {
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

// "José  Pérez" and "jose perez" are the same name.
const normalizeName = (first: string, last: string) =>
  `${first} ${last}`
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();

// Books a turno for someone who is not loaded yet (a phone call, a walk-in).
// Only the basic contact data is stored, the same as the public form:
// name, last name, phone and an optional email. An existing patient is
// reused and never overwritten:
// - same email and same name: that patient.
// - same email, another name: nothing is saved and `conflict` is returned,
//   so a turno never lands silently in someone else's file (a shared family
//   email, a typo). The dialog asks and sends `patient_choice` again:
//   "existing" books it for the patient that has the email; "new" creates
//   this person without email (the email is unique per nutritionist).
// - no email: a patient with the same phone and name, if there is one.
export async function createAppointmentWithPatient(
  formData: FormData,
): Promise<AppointmentResult> {
  const firstName = text(formData, "first_name", 80);
  const lastName = text(formData, "last_name", 80);
  const phone = text(formData, "phone", 40);
  const typedEmail = text(formData, "email", 200).toLowerCase();
  const typeId = text(formData, "appointment_type_id");
  const startsAt = new Date(text(formData, "starts_at"));
  const choice = text(formData, "patient_choice");

  if (!firstName || !lastName) return { ok: false, error: "Completá nombre y apellido." };
  if (!PHONE_RE.test(phone)) return { ok: false, error: "Completá un teléfono válido." };
  if (typedEmail && !EMAIL_RE.test(typedEmail)) return { ok: false, error: "El email no es válido." };
  if (!UUID_RE.test(typeId)) return { ok: false, error: "Elegí un tipo de consulta." };
  if (Number.isNaN(startsAt.getTime())) return { ok: false, error: "Fecha u hora inválida." };
  if (choice && choice !== "existing" && choice !== "new") {
    return { ok: false, error: "Opción inválida." };
  }

  const { supabase, userId } = await context();
  if (!userId) return unauthenticated;

  const lookupFailed: AppointmentResult = {
    ok: false,
    error: "No pudimos buscar al paciente. Intentá de nuevo.",
  };
  const typedName = normalizeName(firstName, lastName);
  let email = typedEmail;
  let patientId: string | null = null;
  let created = false;

  if (email) {
    const { data: match, error } = await supabase
      .from("patients")
      .select("id, first_name, last_name")
      .eq("email", email)
      .maybeSingle();
    if (error) return lookupFailed;

    if (match) {
      const sameName = normalizeName(match.first_name, match.last_name) === typedName;
      if (sameName || choice === "existing") {
        patientId = match.id;
      } else if (choice === "new") {
        email = "";
      } else {
        const patientName = `${match.first_name} ${match.last_name}`.trim();
        return {
          ok: false,
          error: `Ese email ya es de ${patientName}.`,
          conflict: { patientName },
        };
      }
    }
  }

  if (!patientId && !email) {
    const { data: samePhone, error } = await supabase
      .from("patients")
      .select("id, first_name, last_name")
      .eq("phone", phone);
    if (error) return lookupFailed;
    patientId =
      samePhone.find((p) => normalizeName(p.first_name, p.last_name) === typedName)?.id ??
      null;
  }

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

  const { data: current } = await supabase
    .from("appointments")
    .select("appointment_type_id")
    .eq("id", id)
    .in("status", ["pending", "confirmed"])
    .maybeSingle();
  if (!current) {
    return { ok: false, error: "No encontramos un turno activo para editar." };
  }

  const end = await endsAtFor(
    supabase,
    parsed.typeId,
    parsed.startsAt,
    current.appointment_type_id,
  );
  if ("error" in end) return { ok: false, error: end.error };

  const { data, error } = await supabase
    .from("appointments")
    .update({
      patient_id: parsed.patientId,
      appointment_type_id: parsed.typeId,
      starts_at: parsed.startsAt.toISOString(),
      ends_at: end.endsAt.toISOString(),
      // Notes change only when the form sends them, so a form without the
      // field (like the edit dialog) does not erase them.
      ...(formData.has("notes") ? { notes: parsed.notes } : {}),
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

// The nutritionist opened the WhatsApp reminder for this turno. WhatsApp is
// sent by hand, so this is only a note to avoid messaging someone twice.
export async function markWhatsappReminded(id: string): Promise<AppointmentResult> {
  const { supabase, userId } = await context();
  if (!userId) return unauthenticated;

  const { data, error } = await supabase
    .from("appointments")
    .update({ whatsapp_reminded_at: new Date().toISOString() })
    .eq("id", id)
    .in("status", ["pending", "confirmed"])
    .select("id")
    .maybeSingle();

  if (error) return failure(error);
  if (!data) return { ok: false, error: "El turno ya no está activo." };

  refresh();
  return { ok: true, id: data.id };
}
