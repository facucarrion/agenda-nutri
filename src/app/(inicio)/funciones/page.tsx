import type { Metadata } from "next";
import Image from "next/image";
import { BRAND_NAME } from "@/lib/brand";
import { Journey } from "../_components/journey";
import {
  ClosingCta,
  SiteFooter,
  SiteNav,
} from "../_components/landing-ui";

export const metadata: Metadata = {
  title: `Funciones · ${BRAND_NAME}`,
  description:
    "Reserva online, agenda de mes y semana, y recordatorios por email y WhatsApp para profesionales de la nutrición.",
};

// The screenshots are the real app, filled with sample patients.
const FEATURES: {
  title: string;
  heading: string;
  text: string;
  points: string[];
  shot: { src: string; alt: string };
}[] = [
  {
    title: "Reserva online",
    heading: "Tus pacientes reservan solos",
    text: "Compartí tu link y cada paciente elige el servicio, el día y el horario. Solo ve los horarios libres, así que no hay mensajes de ida y vuelta.",
    points: [
      "Un link propio para compartir",
      "Solo horarios libres, en hora de Argentina",
      "Confirmación del turno por email",
    ],
    shot: {
      src: "/landing/app/reservar.webp",
      alt: "Página de reserva: el paciente eligió Primera consulta, el jueves 12 de noviembre a las 10:30.",
    },
  },
  {
    title: "Tu agenda, ordenada",
    heading: "Tu semana de un vistazo",
    text: "Mirá tus turnos por mes o por semana, con los confirmados y los pendientes a la vista. Cargá turnos a mano y bloqueá días de vacaciones o congresos.",
    points: [
      "Vista de mes y de semana",
      "Turnos cargados a mano",
      "Días y horarios bloqueados",
      "Tus tipos de consulta, con su duración",
    ],
    shot: {
      src: "/landing/app/semana.webp",
      alt: "Agenda semanal del 9 al 15 de noviembre con turnos confirmados y pendientes.",
    },
  },
  {
    title: "Menos ausencias",
    heading: "Recordatorios sin esfuerzo",
    text: "Confirmá los pedidos y recordale el turno a cada paciente por WhatsApp con un clic. Los recordatorios por email salen solos.",
    points: [
      "Recordatorio automático por email",
      "Aviso de WhatsApp listo para enviar",
      "Pendientes y confirmados separados",
    ],
    shot: {
      src: "/landing/app/turnos.webp",
      alt: "Pantalla de turnos con la lista de recordatorios por WhatsApp para mañana.",
    },
  },
];

function Check() {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="mt-0.5 size-5 shrink-0 text-tangerine-ink"
      aria-hidden
    >
      <path d="m4.5 10.5 3.5 3.5 7.5-8" />
    </svg>
  );
}

export default function FeaturesPage() {
  return (
    <div className="flex min-h-screen flex-col bg-cream text-forest">
      <header className="grain relative isolate overflow-hidden rounded-b-[32px] bg-forest sm:rounded-b-[48px]">
        <div className="absolute inset-x-0 bottom-0 -z-10 h-full bg-[radial-gradient(60%_80%_at_85%_120%,rgba(242,140,56,0.18),transparent_70%)]" />
        <SiteNav />
        <div className="hero-in mx-auto flex w-full max-w-[1120px] flex-col gap-5 px-4 pb-20 pt-10 sm:px-8 sm:pb-24 sm:pt-16 xl:px-0">
          <p className="text-[13px] font-bold tracking-[0.08em] text-tangerine">FUNCIONES</p>
          <h1 className="max-w-[760px] text-[38px] font-bold leading-[1.12] tracking-[-0.02em] text-cream sm:text-[52px]">
            Lo esencial para tener tu agenda en orden
          </h1>
          <p className="max-w-[600px] text-[18px] leading-[30px] text-sage">
            Así se ve {BRAND_NAME} por dentro: la reserva que usan tus
            pacientes y las pantallas con las que manejás tus turnos.
          </p>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1120px] overflow-x-clip px-4 py-20 sm:px-8 sm:py-28 xl:px-0">
        <Journey>
        {FEATURES.map((f, i) => (
          <section
            key={f.title}
            data-step
            aria-labelledby={`funcion-${i}`}
            className={`reveal relative grid items-center gap-10 lg:gap-16 ${
              i % 2
                ? "lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]"
                : "lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]"
            }`}
          >
            <span className="journey-node" data-node aria-hidden>
              {i + 1}
            </span>
            <div className={`flex flex-col gap-4 ${i % 2 ? "lg:order-2" : ""}`}>
              <p className="text-[13px] font-bold tracking-[0.08em] text-tangerine-ink">
                {String(i + 1).padStart(2, "0")} · {f.title.toUpperCase()}
              </p>
              <h2
                id={`funcion-${i}`}
                className="text-[30px] font-bold leading-[1.18] tracking-[-0.015em] sm:text-[38px]"
              >
                {f.heading}
              </h2>
              <p className="text-[17px] leading-7 text-slate-green">{f.text}</p>
              <ul className="mt-2 flex flex-col gap-3">
                {f.points.map((point) => (
                  <li key={point} className="flex gap-3 text-[16px] leading-6">
                    <Check />
                    {point}
                  </li>
                ))}
              </ul>
            </div>

            {/* Screenshot in a light browser frame */}
            <div className="relative">
            <div aria-hidden className="shot-glow" />
            <figure className="relative overflow-hidden rounded-[20px] border border-sand bg-white shadow-[0_30px_60px_-30px_rgba(20,53,42,0.35),0_12px_24px_-16px_rgba(20,53,42,0.2)]">
              <div className="flex items-center gap-1.5 border-b border-sand/70 bg-[#faf7ef] px-4 py-3" aria-hidden>
                <span className="size-2.5 rounded-full bg-[#e8a598]" />
                <span className="size-2.5 rounded-full bg-[#ecc98a]" />
                <span className="size-2.5 rounded-full bg-[#a9cdb3]" />
              </div>
              <Image
                src={f.shot.src}
                alt={f.shot.alt}
                width={1920}
                height={1200}
                quality={90}
                sizes="(min-width: 1120px) 640px, (min-width: 1024px) 58vw, 100vw"
                className="h-auto w-full"
              />
            </figure>
            </div>
          </section>
        ))}
        </Journey>
      </main>

      <ClosingCta />
      <SiteFooter />
    </div>
  );
}
