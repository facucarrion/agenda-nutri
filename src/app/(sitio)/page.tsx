import Link from "next/link";
import { INVITE_REQUEST_HREF } from "@/lib/legal";

const focus =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40";

const FEATURES: { title: string; text: string; icon: React.ReactNode }[] = [
  {
    title: "Reserva online",
    text: "Tus pacientes eligen día y horario desde tu link, sin mensajes de ida y vuelta.",
    icon: (
      <path d="M10 14a3.5 3.5 0 0 0 5 0l3-3a3.5 3.5 0 0 0-5-5l-1 1M14 10a3.5 3.5 0 0 0-5 0l-3 3a3.5 3.5 0 0 0 5 5l1-1" />
    ),
  },
  {
    title: "Tu agenda, ordenada",
    text: "Vistas de mes y semana, turnos a mano, días bloqueados y tus propios tipos de consulta.",
    icon: (
      <>
        <rect x="4" y="5" width="16" height="15" rx="2.5" />
        <path d="M4 10h16M9 3v4M15 3v4" />
      </>
    ),
  },
  {
    title: "Menos ausencias",
    text: "Confirmación y recordatorio por email, y el aviso de WhatsApp listo para enviar.",
    icon: (
      <>
        <path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15L6 16Z" />
        <path d="M10 20.5a2.2 2.2 0 0 0 4 0" />
      </>
    ),
  },
];

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-[1120px] flex-1 flex-col justify-center gap-14 px-4 py-14 sm:px-8 sm:py-20">
      <section className="flex max-w-[640px] flex-col gap-6">
        <span className="w-fit rounded-full bg-primary-soft px-3 py-1 text-[13px] font-semibold text-primary">
          Para profesionales de la nutrición
        </span>
        <h1 className="text-[36px] font-bold leading-[1.1] tracking-tight sm:text-[48px]">
          Tus turnos en un solo lugar, sin idas y vueltas.
        </h1>
        <p className="text-[17px] leading-[27px] text-muted">
          Compartí tu link de reserva, mirá tu agenda del día y dejá que los
          recordatorios hagan el resto.
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <a
            href={INVITE_REQUEST_HREF}
            className={`rounded-full bg-primary px-6 py-3 text-[15px] font-semibold text-white transition-colors hover:bg-[#265a42] ${focus}`}
          >
            Pedí tu código
          </a>
          <Link
            href="/login"
            className={`rounded-full border border-line bg-surface px-6 py-3 text-[15px] font-semibold text-ink transition-colors hover:border-primary hover:text-primary ${focus}`}
          >
            Ingresar
          </Link>
        </div>
        <p className="text-[13px] text-muted">
          Durante el piloto, el registro es con código de invitación. ¿Ya
          tenés uno?{" "}
          <Link
            href="/register"
            className={`rounded font-semibold text-primary hover:underline ${focus}`}
          >
            Creá tu cuenta
          </Link>
          .
        </p>
      </section>

      <ul className="grid gap-4 sm:grid-cols-3">
        {FEATURES.map((f) => (
          <li
            key={f.title}
            className="flex flex-col gap-3 rounded-3xl border border-line bg-surface p-6"
          >
            <span className="grid size-11 place-items-center rounded-2xl bg-primary-soft text-primary">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="size-[22px]"
                aria-hidden
              >
                {f.icon}
              </svg>
            </span>
            <h2 className="text-[17px] font-semibold">{f.title}</h2>
            <p className="text-[15px] leading-[22px] text-muted">{f.text}</p>
          </li>
        ))}
      </ul>
    </main>
  );
}
