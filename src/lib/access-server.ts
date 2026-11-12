import "server-only";

import { cache } from "react";
import { accessState, type Access } from "@/lib/access";
import { createClient } from "@/lib/supabase/server";

type Supabase = Awaited<ReturnType<typeof createClient>>;

// Same switch as the proxy: no Supabase, no trial, in UI preview.
const UI_PREVIEW =
  process.env.NODE_ENV === "development" && process.env.UI_PREVIEW === "1";

export const TRIAL_ENDED_MESSAGE =
  "Tu prueba gratuita terminó. Escribinos para activar tu cuenta y seguir cargando y editando turnos.";

export async function getAccess(supabase: Supabase, userId: string): Promise<Access> {
  const { data } = await supabase
    .from("nutritionists")
    .select("plan, trial_ends_at, active_until")
    .eq("id", userId)
    .maybeSingle();

  // No row: fail closed.
  return data ? accessState(data) : accessState({ plan: "", trial_ends_at: null, active_until: null });
}

// Access of the signed-in nutritionist, once per request (the banner and the
// pages may both ask).
export const getCurrentAccess = cache(async (): Promise<Access | null> => {
  if (UI_PREVIEW) return { status: "active", endsAt: null, daysLeft: null };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user ? getAccess(supabase, user.id) : null;
});

export type DeniedReason = "session" | "expired";

// The error every blocked action returns, in the shape their results share.
export function denied(reason: DeniedReason | null): { ok: false; error: string } {
  return {
    ok: false,
    error: reason === "expired" ? TRIAL_ENDED_MESSAGE : "Tu sesión expiró. Volvé a ingresar.",
  };
}

// Signed-in user only. For actions that must keep working after the trial
// (reading and exporting data, deleting a patient who asks for it).
export async function sessionContext() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { supabase, userId: user?.id ?? null, reason: (user ? null : "session") as DeniedReason | null };
}

// For every action that creates or changes data: it also requires an account
// whose trial or plan has not ended. `userId` comes back null when blocked,
// with the reason to show.
export async function writeContext() {
  const { supabase, userId } = await sessionContext();
  if (!userId) return { supabase, userId: null, reason: "session" as DeniedReason | null };

  const access = await getAccess(supabase, userId);
  if (access.status === "expired") {
    return { supabase, userId: null, reason: "expired" as DeniedReason | null };
  }
  return { supabase, userId, reason: null as DeniedReason | null };
}
