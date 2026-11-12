"use client";

import { useActionState, useState } from "react";
import { createInvitationCode, type CreateCodeResult } from "../actions";
import { BRAND_NAME } from "@/lib/brand";

const input =
  "w-full rounded-xl border border-line bg-surface px-3.5 py-2.5 text-[15px] outline-none focus:border-primary focus:ring-2 focus:ring-primary/20";

// Creates a code and hands over the message to send with it.
export function CodeForm() {
  const [result, action, pending] = useActionState<CreateCodeResult | null, FormData>(
    createInvitationCode,
    null,
  );
  const [copied, setCopied] = useState(false);

  const message =
    result?.ok
      ? [
          `¡Hola! Este es tu código para crear tu cuenta en ${BRAND_NAME}: ${result.code}`,
          `Creá tu cuenta acá: ${typeof window === "undefined" ? "" : window.location.origin}/register`,
          result.trialDays > 0
            ? `Tenés ${result.trialDays} días de prueba gratis.`
            : "Tu cuenta ya viene activa.",
          "El código sirve una sola vez.",
        ].join("\n")
      : "";

  async function copy() {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // The message is on screen: it can be selected by hand.
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <form action={action} className="grid gap-3 sm:grid-cols-[1fr_1fr_110px_auto] sm:items-end">
        <label className="flex flex-col gap-1.5 text-sm font-medium">
          Consultorio (opcional)
          <input name="business_name" maxLength={120} className={input} />
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-medium">
          Nota interna (opcional)
          <input name="note" maxLength={200} placeholder="Para quién es" className={input} />
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-medium">
          Días de prueba
          <input
            name="trial_days"
            type="number"
            min={0}
            max={365}
            defaultValue={14}
            required
            className={input}
          />
        </label>
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white transition-opacity disabled:opacity-60"
        >
          {pending ? "Creando…" : "Crear código"}
        </button>
      </form>

      {result && !result.ok && (
        <p role="alert" className="rounded-xl bg-[#fbe4e0] px-4 py-3 text-sm font-medium text-[#8a2a1c]">
          {result.error}
        </p>
      )}

      {result?.ok && (
        <div className="flex flex-col gap-3 rounded-2xl bg-primary-soft p-4">
          <p className="text-sm font-medium text-primary">
            Código creado. Copialo ahora o buscalo después en la lista.
          </p>
          <pre className="whitespace-pre-wrap rounded-xl bg-surface p-3 text-sm">{message}</pre>
          <button
            type="button"
            onClick={copy}
            className="self-start rounded-full border border-primary px-4 py-1.5 text-sm font-semibold text-primary hover:bg-surface"
          >
            {copied ? "¡Copiado!" : "Copiar mensaje"}
          </button>
        </div>
      )}
    </div>
  );
}
