"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type ActionResult = { ok: true } | { ok: false; error: string };

// The agenda draws the weekly hours and days off, so it is refreshed too.
function refresh() {
  revalidatePath("/dashboard/availability");
  revalidatePath("/dashboard/agenda");
}
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;
const OVERLAP_CODE = "23P01"; // exclusion_violation

function text(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

function int(formData: FormData, name: string) {
  const value = Number(text(formData, name));
  return Number.isInteger(value) ? value : NaN;
}

async function context() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { supabase, userId: user?.id ?? null };
}

const unauthenticated: ActionResult = {
  ok: false,
  error: "Tu sesión expiró. Volvé a ingresar.",
};

function done(error: { code?: string } | null, overlapMessage?: string): ActionResult {
  if (error) {
    if (error.code === OVERLAP_CODE && overlapMessage) {
      return { ok: false, error: overlapMessage };
    }
    return { ok: false, error: "No pudimos guardar los cambios." };
  }
  refresh();
  return { ok: true };
}

// ------------------------------------------------------------ weekly rules

export async function addAvailabilityRule(
  formData: FormData,
): Promise<ActionResult> {
  const weekday = int(formData, "weekday");
  const start = text(formData, "start_time");
  const end = text(formData, "end_time");

  if (!(weekday >= 0 && weekday <= 6)) {
    return { ok: false, error: "Día inválido." };
  }
  if (!TIME_RE.test(start) || !TIME_RE.test(end)) {
    return { ok: false, error: "Horario inválido." };
  }
  if (end <= start) {
    return { ok: false, error: "La hora de fin debe ser posterior al inicio." };
  }

  const { supabase, userId } = await context();
  if (!userId) return unauthenticated;

  const { error } = await supabase.from("availability_rules").insert({
    nutritionist_id: userId,
    weekday,
    start_time: start,
    end_time: end,
  });

  return done(error, "Ese horario se superpone con otro del mismo día.");
}

export async function deleteAvailabilityRule(id: string): Promise<ActionResult> {
  const { supabase, userId } = await context();
  if (!userId) return unauthenticated;

  const { error } = await supabase
    .from("availability_rules")
    .delete()
    .eq("id", id);

  return done(error);
}

// ------------------------------------------------------------ one-off blocks

export async function addAvailabilityBlock(
  formData: FormData,
): Promise<ActionResult> {
  const startsAt = new Date(text(formData, "starts_at"));
  const endsAt = new Date(text(formData, "ends_at"));
  const reason = text(formData, "reason").slice(0, 200);

  if (Number.isNaN(startsAt.getTime()) || Number.isNaN(endsAt.getTime())) {
    return { ok: false, error: "Fechas inválidas." };
  }
  if (endsAt <= startsAt) {
    return { ok: false, error: "El fin debe ser posterior al inicio." };
  }

  const { supabase, userId } = await context();
  if (!userId) return unauthenticated;

  const { error } = await supabase.from("availability_blocks").insert({
    nutritionist_id: userId,
    starts_at: startsAt.toISOString(),
    ends_at: endsAt.toISOString(),
    reason: reason || null,
  });

  return done(error);
}

export async function deleteAvailabilityBlock(id: string): Promise<ActionResult> {
  const { supabase, userId } = await context();
  if (!userId) return unauthenticated;

  const { error } = await supabase
    .from("availability_blocks")
    .delete()
    .eq("id", id);

  return done(error);
}

// ------------------------------------------------------------ consultation types

type ParsedType = { error: string } | { name: string; duration: number };

function parseType(formData: FormData): ParsedType {
  const name = text(formData, "name").slice(0, 80);
  const duration = int(formData, "duration_minutes");

  if (!name) return { error: "Poné un nombre para el tipo de consulta." };
  if (!(duration >= 10 && duration <= 240)) {
    return { error: "La duración debe estar entre 10 y 240 minutos." };
  }
  return { name, duration };
}

export async function createAppointmentType(
  formData: FormData,
): Promise<ActionResult> {
  const parsed = parseType(formData);
  if ("error" in parsed) return { ok: false, error: parsed.error };

  const { supabase, userId } = await context();
  if (!userId) return unauthenticated;

  const { error } = await supabase.from("appointment_types").insert({
    nutritionist_id: userId,
    name: parsed.name,
    duration_minutes: parsed.duration,
  });

  return done(error);
}

export async function updateAppointmentType(
  id: string,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = parseType(formData);
  if ("error" in parsed) return { ok: false, error: parsed.error };

  const { supabase, userId } = await context();
  if (!userId) return unauthenticated;

  const { error } = await supabase
    .from("appointment_types")
    .update({
      name: parsed.name,
      duration_minutes: parsed.duration,
      is_active: formData.get("is_active") !== "false",
    })
    .eq("id", id);

  return done(error);
}

// Deleting keeps past appointments: their type reference is set to null.
export async function deleteAppointmentType(id: string): Promise<ActionResult> {
  const { supabase, userId } = await context();
  if (!userId) return unauthenticated;

  const { error } = await supabase
    .from("appointment_types")
    .delete()
    .eq("id", id);

  return done(error);
}

// ------------------------------------------------------------ booking settings

export async function updateBookingSettings(
  formData: FormData,
): Promise<ActionResult> {
  const slotMinutes = int(formData, "slot_minutes");
  const minNoticeHours = int(formData, "min_notice_hours");

  if (!(slotMinutes >= 10 && slotMinutes <= 240)) {
    return { ok: false, error: "El intervalo debe estar entre 10 y 240 minutos." };
  }
  if (!(minNoticeHours >= 0 && minNoticeHours <= 720)) {
    return { ok: false, error: "La anticipación debe estar entre 0 y 720 horas." };
  }

  const { supabase, userId } = await context();
  if (!userId) return unauthenticated;

  const { error } = await supabase
    .from("nutritionists")
    .update({ slot_minutes: slotMinutes, min_notice_hours: minNoticeHours })
    .eq("id", userId);

  return done(error);
}

// ------------------------------------------------------------ booking link

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const UNIQUE_VIOLATION = "23505";
// Fixed pages under /reservar/ win over /reservar/[slug], so these slugs would
// open those pages instead of the booking form. Keep in sync with the folders
// in src/app/(paciente)/reservar/.
const RESERVED_SLUGS = new Set(["confirmado", "error"]);

// The public link is /reservar/<slug>. Changing it breaks the old link.
export async function updateBookingSlug(formData: FormData): Promise<ActionResult> {
  const slug = text(formData, "slug").toLowerCase();

  if (slug.length < 3 || slug.length > 40 || !SLUG_RE.test(slug)) {
    return {
      ok: false,
      error:
        "Usá entre 3 y 40 letras minúsculas, números o guiones, sin espacios ni tildes.",
    };
  }
  if (RESERVED_SLUGS.has(slug)) {
    return { ok: false, error: "Ese link está reservado. Probá con otro." };
  }

  const { supabase, userId } = await context();
  if (!userId) return unauthenticated;

  const { error } = await supabase
    .from("nutritionists")
    .update({ slug })
    .eq("id", userId);

  if (error?.code === UNIQUE_VIOLATION) {
    return { ok: false, error: "Ese link ya está en uso. Probá con otro." };
  }
  return done(error);
}
