import "server-only";

import { createHash, randomBytes } from "node:crypto";
import { accessState } from "@/lib/access";
import { POLICY_VERSION } from "@/lib/legal";
import { createAdminClient } from "@/lib/supabase/admin";
import { computeSlots, parseDate } from "@/lib/slots";

// Everything here runs with the service_role key (RLS bypassed), so each
// function returns only what a stranger on the public link may see.

const PENDING_MINUTES = 30;
const MAX_RANGE_DAYS = 31;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

async function loadProfile(slug: string) {
  const admin = createAdminClient();
  const { data } = await admin
    .from("nutritionists")
    .select(
      "id, full_name, slug, slot_minutes, min_notice_hours, timezone, plan, trial_ends_at, active_until",
    )
    .eq("slug", slug)
    .maybeSingle();
  if (!data) return null;
  // An account whose trial or plan ended keeps its data but takes no new
  // bookings: the public link is paused until it is activated.
  return { ...data, paused: accessState(data).status === "expired" };
}

const PAUSED_ERROR = "Este profesional no está recibiendo reservas online por ahora.";

// Unconfirmed bookings that expired must not keep blocking the slot.
async function releaseExpired(nutritionistId: string) {
  const admin = createAdminClient();
  await admin
    .from("appointments")
    .update({ status: "cancelled" })
    .eq("nutritionist_id", nutritionistId)
    .eq("status", "pending")
    .lt("pending_expires_at", new Date().toISOString());
}

export async function getPublicProfile(slug: string) {
  const profile = await loadProfile(slug);
  if (!profile) return null;

  const admin = createAdminClient();
  const { data: types } = await admin
    .from("appointment_types")
    .select("id, name, duration_minutes")
    .eq("nutritionist_id", profile.id)
    .eq("is_active", true)
    .order("duration_minutes");

  return {
    fullName: profile.full_name,
    slug: profile.slug,
    timezone: profile.timezone,
    paused: profile.paused,
    types: profile.paused ? [] : (types ?? []),
  };
}

type SlotsResult =
  | { ok: true; slots: string[]; timezone: string }
  | { ok: false; error: string };

export async function getPublicSlots(
  slug: string,
  typeId: string,
  fromDate: string,
  toDate: string,
): Promise<SlotsResult> {
  const from = parseDate(fromDate);
  const to = parseDate(toDate);
  if (!from || !to) return { ok: false, error: "Fechas inválidas." };

  const fromMs = Date.UTC(from.y, from.mo - 1, from.d);
  const toMs = Date.UTC(to.y, to.mo - 1, to.d);
  if (toMs < fromMs || (toMs - fromMs) / 86_400_000 > MAX_RANGE_DAYS) {
    return { ok: false, error: "Rango de fechas inválido." };
  }

  const profile = await loadProfile(slug);
  if (!profile) return { ok: false, error: "No encontramos al profesional." };
  if (profile.paused) return { ok: false, error: PAUSED_ERROR };

  const admin = createAdminClient();
  const { data: type } = await admin
    .from("appointment_types")
    .select("duration_minutes")
    .eq("id", typeId)
    .eq("nutritionist_id", profile.id)
    .eq("is_active", true)
    .maybeSingle();
  if (!type) return { ok: false, error: "Tipo de consulta inválido." };

  await releaseExpired(profile.id);

  // Pad the query window so timezone offsets never cut a day short.
  const windowStart = new Date(fromMs - 86_400_000).toISOString();
  const windowEnd = new Date(toMs + 2 * 86_400_000).toISOString();

  const [rules, blocks, appointments] = await Promise.all([
    admin
      .from("availability_rules")
      .select("weekday, start_time, end_time")
      .eq("nutritionist_id", profile.id),
    admin
      .from("availability_blocks")
      .select("starts_at, ends_at")
      .eq("nutritionist_id", profile.id)
      .lt("starts_at", windowEnd)
      .gt("ends_at", windowStart),
    admin
      .from("appointments")
      .select("starts_at, ends_at")
      .eq("nutritionist_id", profile.id)
      .in("status", ["pending", "confirmed"])
      .lt("starts_at", windowEnd)
      .gt("ends_at", windowStart),
  ]);

  if (rules.error || blocks.error || appointments.error) {
    return { ok: false, error: "No pudimos cargar los horarios." };
  }

  const busy = [...(blocks.data ?? []), ...(appointments.data ?? [])].map(
    (b) => ({ start: new Date(b.starts_at), end: new Date(b.ends_at) }),
  );

  const slots = computeSlots({
    rules: rules.data ?? [],
    busy,
    timezone: profile.timezone,
    fromDate,
    toDate,
    slotMinutes: profile.slot_minutes,
    durationMinutes: type.duration_minutes,
    minNoticeHours: profile.min_notice_hours,
    now: new Date(),
  });

  return { ok: true, slots, timezone: profile.timezone };
}

export type BookingInput = {
  slug: string;
  typeId: string;
  startsAt: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  /** The patient accepted the privacy notice. */
  consent: boolean;
};

export type BookingResult =
  | {
      ok: true;
      /** Plain token: send it by email, never store or log it. */
      confirmationToken: string;
      appointmentId: string;
      email: string;
      patientName: string;
      startsAt: string;
      timezone: string;
      nutritionistName: string;
      pendingMinutes: number;
    }
  | { ok: false; error: string };

export async function createPublicBooking(
  input: BookingInput,
): Promise<BookingResult> {
  const firstName = input.firstName.trim().slice(0, 80);
  const lastName = input.lastName.trim().slice(0, 80);
  const email = input.email.trim().toLowerCase().slice(0, 200);
  const phone = input.phone.trim().slice(0, 40);

  if (!firstName || !lastName) {
    return { ok: false, error: "Completá tu nombre y apellido." };
  }
  if (!EMAIL_RE.test(email)) {
    return { ok: false, error: "El email no es válido." };
  }
  if (!phone) {
    return { ok: false, error: "Completá tu teléfono." };
  }
  if (!input.consent) {
    return {
      ok: false,
      error: "Tenés que aceptar la política de privacidad para reservar.",
    };
  }

  const startsAt = new Date(input.startsAt);
  if (Number.isNaN(startsAt.getTime())) {
    return { ok: false, error: "Horario inválido." };
  }

  const profile = await loadProfile(input.slug);
  if (!profile) return { ok: false, error: "No encontramos al profesional." };
  if (profile.paused) return { ok: false, error: PAUSED_ERROR };

  const admin = createAdminClient();
  const { data: type } = await admin
    .from("appointment_types")
    .select("id, duration_minutes")
    .eq("id", input.typeId)
    .eq("nutritionist_id", profile.id)
    .eq("is_active", true)
    .maybeSingle();
  if (!type) return { ok: false, error: "Tipo de consulta inválido." };

  // The slot must be one the server would have offered (rules, blocks,
  // notice and existing turnos), not just any time the client sends.
  const localDate = new Intl.DateTimeFormat("en-CA", {
    timeZone: profile.timezone,
  }).format(startsAt);
  const offered = await getPublicSlots(
    input.slug,
    type.id,
    localDate,
    localDate,
  );
  if (!offered.ok || !offered.slots.includes(startsAt.toISOString())) {
    return { ok: false, error: "Ese horario ya no está disponible." };
  }

  // Reuse the patient by email; never overwrite an existing ficha from the
  // public form.
  let patientId: string | null = null;
  const existing = await admin
    .from("patients")
    .select("id")
    .eq("nutritionist_id", profile.id)
    .eq("email", email)
    .maybeSingle();
  patientId = existing.data?.id ?? null;

  const consent = {
    consent_at: new Date().toISOString(),
    consent_version: POLICY_VERSION,
  };

  if (patientId) {
    // Only record consent; the rest of the ficha is left untouched.
    await admin
      .from("patients")
      .update(consent)
      .eq("id", patientId)
      .is("consent_at", null);
  } else {
    const created = await admin
      .from("patients")
      .insert({
        nutritionist_id: profile.id,
        first_name: firstName,
        last_name: lastName,
        email,
        phone,
        ...consent,
      })
      .select("id")
      .single();

    if (created.error) {
      const retry = await admin
        .from("patients")
        .select("id")
        .eq("nutritionist_id", profile.id)
        .eq("email", email)
        .maybeSingle();
      patientId = retry.data?.id ?? null;
    } else {
      patientId = created.data.id;
    }
  }
  if (!patientId) return { ok: false, error: "No pudimos registrar tus datos." };

  const token = randomBytes(32).toString("base64url");
  const endsAt = new Date(startsAt.getTime() + type.duration_minutes * 60_000);

  const { data, error } = await admin
    .from("appointments")
    .insert({
      nutritionist_id: profile.id,
      patient_id: patientId,
      appointment_type_id: type.id,
      starts_at: startsAt.toISOString(),
      ends_at: endsAt.toISOString(),
      status: "pending",
      source: "public",
      confirmation_token_hash: hashToken(token),
      pending_expires_at: new Date(
        Date.now() + PENDING_MINUTES * 60_000,
      ).toISOString(),
    })
    .select("id")
    .single();

  if (error) {
    // 23P01: someone took the slot between the check and the insert.
    return { ok: false, error: "Ese horario ya no está disponible." };
  }

  return {
    ok: true,
    confirmationToken: token,
    appointmentId: data.id,
    email,
    patientName: firstName,
    startsAt: startsAt.toISOString(),
    timezone: profile.timezone,
    nutritionistName: profile.full_name,
    pendingMinutes: PENDING_MINUTES,
  };
}

// Frees the slot when the confirmation email could not be sent.
export async function cancelPendingBooking(appointmentId: string) {
  const admin = createAdminClient();
  await admin
    .from("appointments")
    .update({
      status: "cancelled",
      confirmation_token_hash: null,
      pending_expires_at: null,
    })
    .eq("id", appointmentId)
    .eq("status", "pending");
}

export async function confirmPublicBooking(token: string) {
  if (!token || token.length > 200) return false;

  const admin = createAdminClient();
  const { data } = await admin
    .from("appointments")
    .update({
      status: "confirmed",
      confirmation_token_hash: null,
      pending_expires_at: null,
    })
    .eq("confirmation_token_hash", hashToken(token))
    .eq("status", "pending")
    .gt("pending_expires_at", new Date().toISOString())
    .select("id")
    .maybeSingle();

  return Boolean(data);
}
