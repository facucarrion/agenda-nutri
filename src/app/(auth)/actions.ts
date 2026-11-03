"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { passwordError } from "@/lib/password";
import { createClient } from "@/lib/supabase/server";
import { SESSION_ONLY_COOKIE } from "@/lib/supabase/session-cookie";

export type AuthState = {
  error?: string;
  message?: string;
  // Echoed back so the form keeps what the user typed.
  email?: string;
};

export type ResetState = { error?: string; sentTo?: string; sentAt?: number };

function field(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function origin() {
  return (await headers()).get("origin") ?? "";
}

export async function login(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const email = field(formData, "email");
  const password = String(formData.get("password") ?? "");
  const remember = formData.get("remember") === "on";

  if (!email || !password) {
    return { error: "Completá email y contraseña.", email };
  }

  // "Mantener sesión iniciada" off: the auth cookies become browser-session
  // cookies (see lib/supabase/server.ts and proxy.ts).
  const cookieStore = await cookies();
  if (remember) {
    cookieStore.delete(SESSION_ONLY_COOKIE);
  } else {
    cookieStore.set(SESSION_ONLY_COOKIE, "1", {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
    });
  }

  const supabase = await createClient({ sessionOnly: !remember });
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    if (error.code === "email_not_confirmed") {
      return {
        error: "Todavía no confirmaste tu email. Revisá tu bandeja de entrada.",
        email,
      };
    }
    return {
      error: "Email o contraseña incorrectos. Revisá los datos e intentá de nuevo.",
      email,
    };
  }

  redirect("/dashboard");
}

export async function register(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const fullName = field(formData, "full_name");
  const email = field(formData, "email");
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("password_confirm") ?? "");
  const inviteCode = field(formData, "invite_code").toUpperCase();

  if (!fullName || !email) {
    return { error: "Completá tu nombre y tu email.", email };
  }
  if (fullName.length > 120) {
    return { error: "El nombre es demasiado largo.", email };
  }
  if (!EMAIL_RE.test(email)) {
    return { error: "Revisá el email: no parece válido.", email };
  }
  const weak = passwordError(password);
  if (weak) return { error: weak, email };
  if (password !== confirm) {
    return { error: "Las contraseñas no coinciden.", email };
  }
  if (!/^[A-Z0-9-]{6,32}$/.test(inviteCode)) {
    return { error: "Ingresá el código de invitación que te pasaron.", email };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      // The sign-up trigger consumes the invitation code (see migrations).
      data: { full_name: fullName, invite_code: inviteCode },
      emailRedirectTo: `${await origin()}/auth/callback`,
    },
  });

  if (error) {
    // The trigger rejects unknown or used codes, which Supabase reports as
    // a generic database error.
    if (error.code === "unexpected_failure" || /database error/i.test(error.message)) {
      return { error: "El código de invitación no es válido o ya se usó.", email };
    }
    if (error.code === "user_already_exists") {
      return { error: "Ya hay una cuenta con ese email. Probá ingresar.", email };
    }
    if (error.code === "weak_password") {
      return { error: "Elegí una contraseña más segura.", email };
    }
    return { error: "No pudimos crear la cuenta. Intentá de nuevo en un rato.", email };
  }

  // With email confirmation enabled there is no session yet.
  if (!data.session) {
    return { message: "confirm-email", email };
  }

  redirect("/dashboard");
}

// Always answers the same way, so the form does not reveal which emails
// have an account.
export async function requestPasswordReset(
  _prev: ResetState,
  formData: FormData,
): Promise<ResetState> {
  const email = field(formData, "email");
  if (!EMAIL_RE.test(email)) {
    return { error: "Ingresá un email válido." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${await origin()}/auth/callback?next=/restablecer`,
  });

  if (error?.status === 429) {
    return { error: "Pediste muchos enlaces seguidos. Esperá un minuto y volvé a probar." };
  }

  return { sentTo: email, sentAt: Date.now() };
}

export async function updatePassword(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("password_confirm") ?? "");

  const weak = passwordError(password);
  if (weak) return { error: weak };
  if (password !== confirm) return { error: "Las contraseñas no coinciden." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "expired" };
  }

  const { error } = await supabase.auth.updateUser({ password });
  if (error) {
    if (error.code === "same_password") {
      return { error: "Elegí una contraseña distinta de la anterior." };
    }
    return { error: "No pudimos guardar la contraseña. Intentá de nuevo." };
  }

  redirect("/dashboard");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  (await cookies()).delete(SESSION_ONLY_COOKIE);
  redirect("/login");
}
