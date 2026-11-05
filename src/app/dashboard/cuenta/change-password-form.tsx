"use client";

import { useActionState, useState } from "react";
import {
  ErrorBox,
  NewPasswordGroup,
  PasswordField,
  SubmitButton,
} from "@/app/(auth)/_components/ui";
import { card } from "../_components/ui";
import { changePassword, type PasswordState } from "./actions";

const initial: PasswordState = {};

export function ChangePasswordForm({ email }: { email: string }) {
  const [state, action, pending] = useActionState(changePassword, initial);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const mismatch = confirm.length > 0 && confirm !== password;

  return (
    <section className={`${card} flex w-full max-w-[520px] flex-col gap-5`}>
      <div>
        <h2 className="text-lg font-semibold">Cambiar contraseña</h2>
        <p className="mt-1 text-sm text-muted">
          Sesión iniciada como <strong className="text-ink">{email}</strong>.
        </p>
      </div>

      {state.done && (
        <p role="status" className="rounded-xl bg-ok-soft px-4 py-3 text-sm font-medium text-primary">
          Listo, cambiaste tu contraseña.
        </p>
      )}
      {state.error && <ErrorBox>{state.error}</ErrorBox>}

      {/* Remounting the form on success clears the fields. */}
      <form
        key={state.done ? "done" : "form"}
        action={(formData) => {
          action(formData);
          setPassword("");
          setConfirm("");
        }}
        className="flex flex-col gap-5"
      >
        <PasswordField
          label="Contraseña actual"
          name="current_password"
          autoComplete="current-password"
          required
          placeholder="••••••••••"
        />
        <NewPasswordGroup
          label="Contraseña nueva"
          name="password"
          value={password}
          onChange={setPassword}
        />
        <div className="flex flex-col gap-1.5">
          <PasswordField
            label="Repetir contraseña nueva"
            name="password_confirm"
            autoComplete="new-password"
            required
            placeholder="••••••••••"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            invalid={mismatch}
          />
          {mismatch && (
            <p className="text-xs font-medium text-bad">Las contraseñas no coinciden.</p>
          )}
        </div>
        <SubmitButton pending={pending}>
          {pending ? "Guardando..." : "Cambiar contraseña"}
        </SubmitButton>
      </form>
    </section>
  );
}
