import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "No pudimos confirmar el turno",
};

// /api/public/confirm redirects here when the token is invalid, already used
// or expired (pending bookings last 30 minutes).
export default function ConfirmErrorPage() {
  return (
    <main className="mx-auto flex w-full max-w-[640px] px-4 py-12 sm:py-16">
      <div className="flex w-full flex-col items-center gap-[18px] rounded-3xl border border-line bg-surface p-8 text-center sm:p-10">
        <span
          className="flex h-16 w-16 items-center justify-center rounded-full bg-bad-soft text-3xl font-bold text-bad"
          aria-hidden
        >
          !
        </span>
        <h1 className="text-[28px] font-bold">No pudimos confirmar tu turno</h1>
        <p className="text-[15px] text-muted">
          El link venció, ya se usó o no es válido. Los turnos sin confirmar se
          liberan a los 30 minutos.
        </p>
        <p className="text-[15px] text-muted">
          Volvé a abrir el link de reserva de tu nutricionista y pedí el turno
          de nuevo.
        </p>
      </div>
    </main>
  );
}
