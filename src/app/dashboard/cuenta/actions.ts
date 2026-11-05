"use server";

import { passwordError } from "@/lib/password";
import { createClient } from "@/lib/supabase/server";

export type PasswordState = { error?: string; done?: boolean };

// Changing the password from inside the session asks for the current one, so
// someone using an unlocked screen cannot take over the account.
export async function changePassword(
  _prev: PasswordState,
  formData: FormData,
): Promise<PasswordState> {
  const current = String(formData.get("current_password") ?? "");
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("password_confirm") ?? "");

  if (!current) return { error: "Ingresá tu contraseña actual." };
  const weak = passwordError(password);
  if (weak) return { error: weak };
  if (password !== confirm) return { error: "Las contraseñas no coinciden." };
  if (password === current) {
    return { error: "Elegí una contraseña distinta de la actual." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) return { error: "Tu sesión expiró. Volvé a ingresar." };

  const check = await supabase.auth.signInWithPassword({
    email: user.email,
    password: current,
  });
  if (check.error) return { error: "La contraseña actual no es correcta." };

  const { error } = await supabase.auth.updateUser({ password });
  if (error) {
    if (error.code === "same_password") {
      return { error: "Elegí una contraseña distinta de la actual." };
    }
    if (error.code === "weak_password") {
      return { error: "Elegí una contraseña más segura." };
    }
    return { error: "No pudimos guardar la contraseña. Intentá de nuevo." };
  }

  return { done: true };
}
