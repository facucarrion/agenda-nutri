"use client";

import { useActionState, useState } from "react";
import { register, type AuthState } from "../actions";
import {
  ButtonLink,
  Card,
  ErrorBox,
  Field,
  FooterLink,
  Heading,
  MailBadge,
  NewPasswordGroup,
  PasswordField,
  SubmitButton,
} from "../_components/ui";

const initial: AuthState = {};

export function RegisterForm() {
  const [state, action, pending] = useActionState(register, initial);
  // Controlled so the strength meter and the match check update live, and
  // so the values survive a server-side error (React resets uncontrolled
  // inputs after a form action).
  const [fullName, setFullName] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const mismatch = confirm.length > 0 && confirm !== password;

  if (state.message === "confirm-email") {
    return (
      <Card centered>
        <MailBadge />
        <div className="flex flex-col gap-2">
          <h1 className="text-[26px] font-bold text-ink">Confirmá tu email</h1>
          <p className="text-[15px] leading-[22px] text-muted">
            Te enviamos un enlace a {state.email} para activar tu cuenta. Después
            vas a poder ingresar a tu agenda.
          </p>
        </div>
        <ButtonLink href="/login">Ir a ingresar</ButtonLink>
        <p className="text-[13px] text-muted">¿No te llegó? Revisá spam o promociones.</p>
      </Card>
    );
  }

  return (
    <Card>
      <Heading title="Crear cuenta">
        Acceso exclusivo para el consultorio. Necesitás el código de invitación que
        te pasó tu equipo.
      </Heading>

      {state.error && <ErrorBox>{state.error}</ErrorBox>}

      <form action={action} className="flex w-full flex-col gap-5">
        <Field
          label="Nombre y apellido"
          name="full_name"
          autoComplete="name"
          required
          maxLength={120}
          placeholder="Tu nombre"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
        />
        <Field
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="tu@email.com"
          defaultValue={state.email}
          key={`email-${state.email ?? ""}`}
        />
        <NewPasswordGroup
          label="Contraseña"
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
        <Field
          label="Código de invitación"
          name="invite_code"
          autoComplete="off"
          autoCapitalize="characters"
          spellCheck={false}
          required
          maxLength={32}
          placeholder="NS-XXXX-XXXX"
          value={inviteCode}
          onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
          hint="Te lo pasan quienes desarrollaron el sistema."
        />

        <SubmitButton pending={pending}>{pending ? "Creando..." : "Crear cuenta"}</SubmitButton>
      </form>

      <FooterLink question="¿Ya tenés cuenta?" href="/login">
        Ingresá
      </FooterLink>
    </Card>
  );
}
