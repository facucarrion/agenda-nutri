import "server-only";

import { cache } from "react";
import { notFound, redirect } from "next/navigation";
import { connection } from "next/server";
import type { Json } from "@/types/database";
import { adminEmails, isAdminEmail } from "@/lib/admin-emails";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export type AdminCheck =
  | { status: "none" }
  // An admin, but the session has not passed the second factor yet.
  | { status: "needs_mfa"; email: string }
  | { status: "ok"; email: string };

// The email comes from `getUser()`, which the auth server verifies, and has to
// be confirmed. `user_metadata` is editable by the user and is never used.
// Besides being on the list, the session needs a verified TOTP (aal2): the
// password alone (or a hijacked email inbox) is not enough.
export const checkAdmin = cache(async (): Promise<AdminCheck> => {
  // Always a per-request check. Without this, an empty ADMIN_EMAILS at build
  // time would return before reading any request data, and the page would be
  // prerendered as a 404 for everyone.
  await connection();

  if (adminEmails().length === 0) return { status: "none" };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const email = user?.email?.toLowerCase();
  if (!user || !email || !user.email_confirmed_at || !isAdminEmail(email)) {
    return { status: "none" };
  }

  const { data, error } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  if (error || data?.currentLevel !== "aal2") {
    return { status: "needs_mfa", email };
  }
  return { status: "ok", email };
});

// For pages: anyone who is not an admin sees a plain 404, and an admin
// without the second factor is sent to set it up.
export async function requireAdmin(): Promise<{ email: string }> {
  const check = await checkAdmin();
  if (check.status === "none") notFound();
  if (check.status === "needs_mfa") redirect("/admin/mfa");
  return { email: check.email };
}

// For Server Actions, which are public POST endpoints: every action checks on
// its own, the page check does not cover them.
export async function adminContext(): Promise<
  { ok: true; email: string } | { ok: false; error: string }
> {
  const check = await checkAdmin();
  if (check.status !== "ok") return { ok: false, error: "No autorizado." };
  return { ok: true, email: check.email };
}

// Append-only record of what an admin did (the table allows no update/delete).
// Returns false when it could not be written.
export async function logAdmin(
  email: string,
  action: string,
  target: string | null,
  detail?: Json,
): Promise<boolean> {
  const { error } = await createAdminClient()
    .from("admin_log")
    .insert({ admin_email: email, action, target, detail: detail ?? null });
  return !error;
}
