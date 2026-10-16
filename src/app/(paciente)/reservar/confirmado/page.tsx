import type { Metadata } from "next";
import { CheckIcon } from "../../_components/icons";

export const metadata: Metadata = {
  title: "Turno confirmado",
};

// /api/public/confirm redirects here when the token is valid.
export default function ConfirmedPage() {
  return (
    <main className="mx-auto flex w-full max-w-[640px] px-4 py-12 sm:py-16">
      <div className="flex w-full flex-col items-center gap-[18px] rounded-3xl border border-line bg-surface p-8 text-center sm:p-10">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-ok-soft text-ok">
          <CheckIcon className="h-8 w-8" />
        </span>
        <h1 className="text-[28px] font-bold">¡Turno confirmado!</h1>
        <span className="inline-flex items-center gap-2 rounded-full bg-ok-soft px-3 py-1.5 text-[13px] font-semibold text-ok">
          <span className="h-2 w-2 rounded-full bg-ok" aria-hidden />
          Confirmado
        </span>
        <p className="text-[15px] text-muted">
          Ya quedó agendado. Si necesitás cancelarlo o cambiarlo, comunicate
          directamente con tu nutricionista.
        </p>
      </div>
    </main>
  );
}
