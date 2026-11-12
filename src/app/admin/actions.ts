"use server";

import { randomInt } from "node:crypto";
import { revalidatePath } from "next/cache";
import { adminContext, logAdmin } from "@/lib/admin";
import { createAdminClient } from "@/lib/supabase/admin";

export type CreateCodeResult =
  | { ok: true; code: string; trialDays: number }
  | { ok: false; error: string };

export type AccountResult = { ok: true } | { ok: false; error: string };

const UNIQUE_VIOLATION = "23505";
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
// No I, O, 0 or 1: a code read out loud or typed by hand is hard to mix up.
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const DAY_MS = 86_400_000;
const LOG_FAILED =
  "El cambio se aplicó pero no se pudo registrar en el historial. Avisale a quien administra la base.";

// 3 groups of 4 from a 32-letter alphabet: 60 bits, from a secure generator.
function newCode() {
  const group = () =>
    Array.from({ length: 4 }, () => ALPHABET[randomInt(ALPHABET.length)]).join("");
  return `NS-${group()}-${group()}-${group()}`;
}

function text(formData: FormData, name: string, max: number) {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

export async function createInvitationCode(
  _previous: CreateCodeResult | null,
  formData: FormData,
): Promise<CreateCodeResult> {
  const admin = await adminContext();
  if (!admin.ok) return admin;

  const businessName = text(formData, "business_name", 120);
  const note = text(formData, "note", 200);
  const trialDays = Number(text(formData, "trial_days", 4));

  if (!Number.isInteger(trialDays) || trialDays < 0 || trialDays > 365) {
    return { ok: false, error: "Los días de prueba tienen que ser de 0 a 365." };
  }

  const db = createAdminClient();
  for (let attempt = 0; attempt < 5; attempt++) {
    const code = newCode();
    const { error } = await db.from("invitation_codes").insert({
      code,
      business_name: businessName || null,
      note: note || null,
      trial_days: trialDays,
    });

    if (error?.code === UNIQUE_VIOLATION) continue;
    if (error) return { ok: false, error: "No pudimos crear el código." };

    const logged = await logAdmin(admin.email, "create_code", code, {
      trial_days: trialDays,
      business_name: businessName || null,
    });
    revalidatePath("/admin");
    if (!logged) return { ok: false, error: `${LOG_FAILED} Código: ${code}` };
    return { ok: true, code, trialDays };
  }
  return { ok: false, error: "No pudimos generar un código único. Probá de nuevo." };
}

async function loadAccount(id: string) {
  if (!UUID_RE.test(id)) return null;
  const { data } = await createAdminClient()
    .from("nutritionists")
    .select("id, plan, trial_ends_at, active_until")
    .eq("id", id)
    .maybeSingle();
  return data;
}

type Plan = { plan: string; trial_ends_at: string | null; active_until: string | null };

async function applyPlan(
  email: string,
  action: string,
  id: string,
  before: Plan,
  after: Plan,
): Promise<AccountResult> {
  const { error } = await createAdminClient()
    .from("nutritionists")
    .update(after)
    .eq("id", id);
  if (error) return { ok: false, error: "No pudimos guardar el cambio." };

  const logged = await logAdmin(email, action, id, { before, after });
  revalidatePath("/admin");
  return logged ? { ok: true } : { ok: false, error: LOG_FAILED };
}

const pick = (a: Plan): Plan => ({
  plan: a.plan,
  trial_ends_at: a.trial_ends_at,
  active_until: a.active_until,
});

// months 0 = no end date. A renewal adds to what is left of the current
// period instead of overwriting it.
export async function activateAccount(id: string, months: number): Promise<AccountResult> {
  const admin = await adminContext();
  if (!admin.ok) return admin;
  if (![0, 1, 3, 12].includes(months)) return { ok: false, error: "Período inválido." };

  const account = await loadAccount(id);
  if (!account) return { ok: false, error: "No encontramos la cuenta." };

  let activeUntil: string | null = null;
  if (months > 0) {
    const now = Date.now();
    const current = account.active_until ? Date.parse(account.active_until) : 0;
    const base = new Date(Math.max(now, current));
    base.setUTCMonth(base.getUTCMonth() + months);
    activeUntil = base.toISOString();
  }

  return applyPlan(admin.email, "activate_account", id, pick(account), {
    plan: "active",
    trial_ends_at: account.trial_ends_at,
    active_until: activeUntil,
  });
}

export async function extendTrial(id: string, days: number): Promise<AccountResult> {
  const admin = await adminContext();
  if (!admin.ok) return admin;
  if (!Number.isInteger(days) || days < 1 || days > 90) {
    return { ok: false, error: "Los días tienen que ser de 1 a 90." };
  }

  const account = await loadAccount(id);
  if (!account) return { ok: false, error: "No encontramos la cuenta." };
  if (account.plan !== "trial") {
    return { ok: false, error: "Solo se puede extender una cuenta en prueba." };
  }

  const current = account.trial_ends_at ? Date.parse(account.trial_ends_at) : 0;
  const end = new Date(Math.max(Date.now(), current) + days * DAY_MS);

  return applyPlan(admin.email, "extend_trial", id, pick(account), {
    plan: "trial",
    trial_ends_at: end.toISOString(),
    active_until: null,
  });
}

// Back to read-only: same state as a trial that ran out. Nothing is deleted.
export async function suspendAccount(id: string): Promise<AccountResult> {
  const admin = await adminContext();
  if (!admin.ok) return admin;

  const account = await loadAccount(id);
  if (!account) return { ok: false, error: "No encontramos la cuenta." };

  return applyPlan(admin.email, "suspend_account", id, pick(account), {
    plan: "trial",
    trial_ends_at: new Date().toISOString(),
    active_until: null,
  });
}
