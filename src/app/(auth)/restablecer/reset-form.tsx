"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { updatePassword, type AuthState } from "../actions";
import {
  Card,
  ErrorBox,
  Heading,
  NewPasswordGroup,
  PasswordField,
  SubmitButton,
} from "../_components/ui";

const initial: AuthState = {};

export function ResetForm() {
  const [state, action, pending] = useActionState(updatePassword, initial);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const mismatch = confirm.length > 0 && confirm !== password;

  return (
    <Card>
      <Heading title="Nueva contraseña">
        Elegí una contraseña nueva para tu cuenta. No uses una que ya hayas usado antes.
      </Heading>

      {state.error === "expired" ? (
        <ErrorBox>
          El enlace venció o ya se usó.{" "}
          <Link href="/recuperar" className="underline">
            Pedí uno nuevo
          </Link>
          .
        </ErrorBox>
      ) : (
        state.error && <ErrorBox>{state.error}</ErrorBox>
      )}

      <form action={action} className="flex w-full flex-col gap-5">
        <NewPasswordGroup
          label="Nueva contraseña"
          name="password"
          value={password}
          onChange={setPassword}
        />
        <div className="flex flex-col gap-1.5">
          <PasswordField
            label="Repetir contraseña"
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
          {pending ? "Guardando..." : "Guardar contraseña"}
        </SubmitButton>
      </form>
    </Card>
  );
}
