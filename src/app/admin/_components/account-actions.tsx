"use client";

import { useState, useTransition } from "react";
import {
  activateAccount,
  extendTrial,
  suspendAccount,
  type AccountResult,
} from "../actions";

const button =
  "rounded-full border border-line px-3 py-1 text-xs font-semibold hover:bg-primary-soft disabled:opacity-50";

// Row actions. Each one asks first; the server checks the admin again.
export function AccountActions({
  id,
  name,
  plan,
  expired,
}: {
  id: string;
  name: string;
  plan: string;
  expired: boolean;
}) {
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [months, setMonths] = useState(1);

  function run(question: string, task: () => Promise<AccountResult>) {
    if (!window.confirm(question)) return;
    setError(null);
    start(async () => {
      const result = await task();
      if (!result.ok) setError(result.error);
    });
  }

  const period = months === 0 ? "sin vencimiento" : `${months} ${months === 1 ? "mes" : "meses"}`;

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex flex-wrap items-center gap-1.5">
        <select
          aria-label="Período"
          value={months}
          onChange={(e) => setMonths(Number(e.target.value))}
          className="rounded-full border border-line bg-surface px-2 py-1 text-xs"
        >
          <option value={1}>1 mes</option>
          <option value={3}>3 meses</option>
          <option value={12}>12 meses</option>
          <option value={0}>Sin vencimiento</option>
        </select>
        <button
          type="button"
          disabled={pending}
          className={button}
          onClick={() =>
            run(`¿Activar la cuenta de ${name} (${period})?`, () => activateAccount(id, months))
          }
        >
          Activar
        </button>
        {plan === "trial" && (
          <button
            type="button"
            disabled={pending}
            className={button}
            onClick={() =>
              run(`¿Extender 7 días la prueba de ${name}?`, () => extendTrial(id, 7))
            }
          >
            +7 días
          </button>
        )}
        {!expired && (
          <button
            type="button"
            disabled={pending}
            className={`${button} text-[#8a2a1c]`}
            onClick={() =>
              run(
                `¿Pasar a solo lectura la cuenta de ${name}? No se borra nada y se pausa su link de reserva.`,
                () => suspendAccount(id),
              )
            }
          >
            Solo lectura
          </button>
        )}
      </div>
      {error && (
        <p role="alert" className="text-xs font-medium text-[#8a2a1c]">
          {error}
        </p>
      )}
    </div>
  );
}
