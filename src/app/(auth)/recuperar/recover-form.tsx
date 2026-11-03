"use client";

import { useActionState, useEffect, useState } from "react";
import { requestPasswordReset, type ResetState } from "../actions";
import {
  BackLink,
  ButtonLink,
  Card,
  ErrorBox,
  Field,
  Heading,
  MailBadge,
  SubmitButton,
} from "../_components/ui";

const initial: ResetState = {};
const RESEND_SECONDS = 45;

export function RecoverForm() {
  const [state, action, pending] = useActionState(requestPasswordReset, initial);

  if (state.sentTo) {
    // key: restart the countdown every time a link is sent.
    return (
      <CheckEmail key={state.sentAt} email={state.sentTo} action={action} pending={pending} />
    );
  }

  return (
    <Card>
      <BackLink href="/login">Volver a ingresar</BackLink>
      <Heading title="Recuperar contraseña">
        Ingresá el email de tu cuenta y te enviamos un enlace para crear una nueva
        contraseña.
      </Heading>

      {state.error && <ErrorBox>{state.error}</ErrorBox>}

      <form action={action} className="flex w-full flex-col gap-5">
        <Field
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="tu@email.com"
        />
        <SubmitButton pending={pending}>
          {pending ? "Enviando..." : "Enviar enlace"}
        </SubmitButton>
      </form>
    </Card>
  );
}

function CheckEmail({
  email,
  action,
  pending,
}: {
  email: string;
  action: (formData: FormData) => void;
  pending: boolean;
}) {
  const [left, setLeft] = useState(RESEND_SECONDS);

  useEffect(() => {
    if (left <= 0) return;
    const t = setTimeout(() => setLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [left]);

  const clock = `0:${String(left).padStart(2, "0")}`;

  return (
    <Card centered>
      <MailBadge />
      <div className="flex flex-col gap-2">
        <h1 className="text-[26px] font-bold text-ink">Revisá tu email</h1>
        <p className="text-[15px] leading-[22px] text-muted">
          Si hay una cuenta con {email}, te enviamos un enlace para restablecer la
          contraseña. El enlace vence en 30 minutos.
        </p>
      </div>
      <ButtonLink href="/login">Volver a ingresar</ButtonLink>
      <form action={action} className="flex flex-col items-center gap-1 text-[13px]">
        <input type="hidden" name="email" value={email} />
        <p className="text-muted">¿No te llegó? Revisá spam o promociones.</p>
        <button
          type="submit"
          disabled={left > 0 || pending}
          className="rounded font-semibold text-primary hover:underline disabled:text-faint disabled:no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
        >
          {pending
            ? "Reenviando..."
            : left > 0
              ? `Reenviar enlace (podés pedirlo en ${clock})`
              : "Reenviar enlace"}
        </button>
      </form>
    </Card>
  );
}
