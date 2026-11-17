import "server-only";

import type { createClient } from "@/lib/supabase/server";

type Supabase = Awaited<ReturnType<typeof createClient>>;

// Shape shared by the password forms: `needsMfa` tells the form to show the
// 6-digit code field.
export type MfaResult = { ok: true } | { ok: false; error: string; needsMfa: true };

export const MFA_CODE_FIELD = "mfa_code";

// Supabase only lets an account with two-step verification change its
// password from a session that passed the second factor (aal2). A recovery
// link, or re-checking the current password, leaves the session at aal1.
// This verifies the code from the form when the account needs it.
export async function ensureAal2(supabase: Supabase, formData: FormData): Promise<MfaResult> {
  const { data: level, error } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  if (error) return { ok: false, error: "No pudimos verificar tu sesión. Intentá de nuevo.", needsMfa: true };
  if (level.nextLevel !== "aal2" || level.currentLevel === "aal2") return { ok: true };

  const raw = formData.get(MFA_CODE_FIELD);
  const code = typeof raw === "string" ? raw.replace(/\s/g, "") : "";
  if (!code) {
    return {
      ok: false,
      error: "Tu cuenta tiene verificación en dos pasos. Ingresá el código de 6 dígitos de tu app de autenticación.",
      needsMfa: true,
    };
  }
  if (!/^\d{6}$/.test(code)) {
    return { ok: false, error: "El código tiene que tener 6 dígitos.", needsMfa: true };
  }

  const factors = await supabase.auth.mfa.listFactors();
  const factor = factors.data?.totp[0];
  if (!factor) {
    return { ok: false, error: "No pudimos verificar tu sesión. Intentá de nuevo.", needsMfa: true };
  }

  const verified = await supabase.auth.mfa.challengeAndVerify({ factorId: factor.id, code });
  if (verified.error) {
    return {
      ok: false,
      error: "El código no es válido. Probá con el que muestra ahora tu app.",
      needsMfa: true,
    };
  }
  return { ok: true };
}
