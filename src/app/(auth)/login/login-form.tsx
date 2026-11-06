"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useActionState } from "react";
import { CheckIcon } from "@/app/(paciente)/_components/icons";
import { INVITE_REQUEST_HREF } from "@/lib/legal";
import { login, type AuthState } from "../actions";
import {
  Card,
  ErrorBox,
  Field,
  FooterLink,
  Heading,
  linkClass,
  PasswordField,
  SubmitButton,
} from "../_components/ui";

const initial: AuthState = {};

// Errors that arrive in the URL from /auth/callback.
const URL_ERRORS: Record<string, string> = {
  confirmation: "El enlace de confirmación no es válido o ya venció. Probá ingresar o pedí uno nuevo.",
  recovery: "El enlace para cambiar la contraseña venció o ya se usó. Pedí uno nuevo.",
};

export function LoginForm() {
  const [state, action, pending] = useActionState(login, initial);
  const urlError = URL_ERRORS[useSearchParams().get("error") ?? ""];
  const error = state.error ?? urlError;
  const invalid = Boolean(state.error);

  return (
    <Card>
      <Heading title="Ingresá a tu agenda">
        Gestioná tus turnos y tus pacientes desde un solo lugar.
      </Heading>

      {error && <ErrorBox>{error}</ErrorBox>}

      <form action={action} className="flex w-full flex-col gap-5">
        <Field
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="tu@email.com"
          defaultValue={state.email}
          key={`email-${state.email ?? ""}`}
          invalid={invalid}
        />
        <PasswordField
          label="Contraseña"
          name="password"
          autoComplete="current-password"
          required
          placeholder="••••••••"
          invalid={invalid}
        />

        <div className="flex items-center justify-between gap-3">
          <label className="flex cursor-pointer items-center gap-2 text-[13px] text-muted">
            <span className="relative flex size-[18px] shrink-0">
              <input
                type="checkbox"
                name="remember"
                className="peer size-[18px] cursor-pointer appearance-none rounded-[5px] border-[1.5px] border-line bg-surface checked:border-primary checked:bg-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
              />
              <CheckIcon className="pointer-events-none absolute inset-0.5 hidden size-3.5 text-white peer-checked:block" />
            </span>
            Mantener sesión iniciada
          </label>
          <Link href="/recuperar" className={linkClass}>
            Olvidé mi contraseña
          </Link>
        </div>

        <SubmitButton pending={pending}>{pending ? "Ingresando..." : "Ingresar"}</SubmitButton>
      </form>

      <FooterLink question="¿Tenés un código de invitación?" href="/register">
        Crear cuenta
      </FooterLink>
      <FooterLink question="¿Todavía no tenés código?" href={INVITE_REQUEST_HREF}>
        Pedilo acá
      </FooterLink>
    </Card>
  );
}
