import Image from "next/image";
import Link from "next/link";
import { BRAND_NAME } from "@/lib/brand";
import { CONTACT_EMAIL, INVITE_REQUEST_HREF } from "@/lib/legal";
import { PlanCard, type Plan } from "./_components/plan-card";

const focus =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tangerine/70 focus-visible:ring-offset-2 focus-visible:ring-offset-forest";

const btnPrimary = `inline-flex items-center justify-center rounded-full bg-tangerine px-7 py-3.5 text-[16px] font-semibold leading-6 text-forest transition-colors hover:bg-[#f59d55] ${focus}`;
const btnGhost = `inline-flex items-center justify-center rounded-full border border-cream/50 px-7 py-3.5 text-[16px] font-semibold leading-6 text-cream transition-colors hover:border-cream hover:bg-cream/10 ${focus}`;

const NOTIFY_CENTRO_HREF =
  `mailto:${CONTACT_EMAIL}` +
  `?subject=${encodeURIComponent(`Avisame cuando esté el plan Centro de ${BRAND_NAME}`)}`;

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

// Prices and limits are still being validated with the team (see
// analisis/precios-competencia.md): change them here.
const PLANS: Plan[] = [
  {
    name: "Semilla",
    tagline: "Para empezar a ordenar tus turnos.",
    price: "Gratis",
    cta: { label: "Empezar gratis", href: "/register" },
    features: [
      "1 profesional",
      "Hasta 20 turnos por mes",
      "Link de reserva online",
      "Agenda de mes y semana",
      "Confirmación por email",
    ],
    fruits: { top: "/landing/frutas/semilla-arriba.webp", bottom: "/landing/frutas/semilla-abajo.webp" },
  },
  {
    name: "Consultorio",
    tagline: "Para atender todas las semanas.",
    price: "$9.900",
    period: "/mes",
    badge: "Más elegido",
    featured: true,
    cta: { label: "Pedí tu código", href: INVITE_REQUEST_HREF },
    features: [
      "Todo lo de Semilla",
      "Turnos ilimitados",
      "Tipos de consulta propios",
      "Días y horarios bloqueados",
      "Recordatorios automáticos por email",
      "Aviso de WhatsApp listo para enviar",
    ],
    fruits: { top: "/landing/frutas/consultorio-arriba.webp", bottom: "/landing/frutas/consultorio-abajo.webp" },
  },
  {
    name: "Centro",
    tagline: "Para centros con más de un profesional.",
    price: "$24.900",
    period: "/mes",
    badge: "Próximamente",
    cta: { label: "Avisame cuando esté", href: NOTIFY_CENTRO_HREF },
    features: [
      "Todo lo de Consultorio",
      "Hasta 5 profesionales",
      "Agenda compartida del equipo",
      "Soporte prioritario",
    ],
    fruits: { top: "/landing/frutas/centro-arriba.webp", bottom: "/landing/frutas/centro-abajo.webp" },
  },
];

function Logo({ size }: { size: number }) {
  return (
    <Image
      src="/landing/logo.png"
      alt=""
      width={size}
      height={size}
      className="shrink-0 rounded-full"
    />
  );
}

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-cream text-forest">
      {/* Hero */}
      <header className="relative isolate overflow-hidden rounded-b-[32px] bg-forest sm:rounded-b-[48px]">
        <Image
          src="/landing/hero-frutas.webp"
          alt=""
          fill
          priority
          quality={90}
          sizes="100vw"
          className="-z-10 object-cover object-[78%_center] lg:object-right"
        />
        {/* Desktop: green on the left, photo on the right. Mobile: the photo
            sits behind the text, so it gets a stronger, even veil. */}
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(20,53,42,0.82)_0%,rgba(20,53,42,0.9)_100%)] lg:bg-[linear-gradient(90deg,#14352a_0%,rgba(20,53,42,0.95)_40%,rgba(20,53,42,0)_62%)]" />
        <div className="absolute inset-x-0 top-0 -z-10 h-[240px] bg-[linear-gradient(180deg,#14352a_0%,rgba(20,53,42,0.9)_45%,rgba(20,53,42,0)_100%)]" />

        <nav className="mx-auto flex w-full max-w-[1120px] items-center justify-between gap-4 px-4 py-6 sm:px-8 xl:px-0">
          <Link href="/" className={`flex items-center gap-3 rounded-lg ${focus}`}>
            <Logo size={40} />
            <span className="text-[20px] font-bold tracking-[-0.005em] text-cream sm:text-[22px]">
              {BRAND_NAME}
            </span>
          </Link>
          <div className="flex items-center gap-9">
            <a
              href="#funciones"
              className={`hidden rounded text-[15px] font-medium text-sage-light transition-colors hover:text-cream sm:block ${focus}`}
            >
              Funciones
            </a>
            <a
              href="#planes"
              className={`hidden rounded text-[15px] font-medium text-sage-light transition-colors hover:text-cream sm:block ${focus}`}
            >
              Planes
            </a>
            <Link
              href="/login"
              className={`rounded-full border border-cream/50 px-[22px] py-2.5 text-[16px] font-semibold leading-6 text-cream transition-colors hover:border-cream hover:bg-cream/10 ${focus}`}
            >
              Ingresar
            </Link>
          </div>
        </nav>

        <div className="mx-auto w-full max-w-[1120px] px-4 pb-24 pt-12 sm:px-8 sm:pt-[88px] lg:min-h-[726px] lg:pb-0 xl:px-0">
          <div className="flex max-w-[780px] flex-col gap-7">
            <h1 className="text-[40px] font-bold leading-[1.1] tracking-[-0.02em] text-cream sm:text-[52px] lg:text-[60px]">
              Tus turnos en un solo lugar,
              <br className="hidden sm:block" /> sin idas y vueltas.
            </h1>
            <p className="max-w-[560px] text-[18px] leading-[30px] text-sage sm:text-[20px] sm:leading-8">
              Compartí tu link de reserva, mirá tu agenda del día y dejá que los
              recordatorios hagan el resto.
            </p>
            <div className="flex flex-wrap gap-3.5">
              <a href={INVITE_REQUEST_HREF} className={btnPrimary}>
                Pedí tu código
              </a>
              <Link href="/login" className={btnGhost}>
                Ingresar
              </Link>
            </div>
            <p className="max-w-[660px] text-[14px] leading-[22px] text-moss">
              Durante el piloto, el registro es con código de invitación. ¿Ya
              tenés uno?{" "}
              <Link
                href="/register"
                className={`rounded font-semibold text-cream hover:underline ${focus}`}
              >
                Creá tu cuenta
              </Link>
              .
            </p>
          </div>
        </div>
      </header>

      <main className="flex flex-col">
        {/* Funciones */}
        <section
          id="funciones"
          aria-labelledby="funciones-titulo"
          className="mx-auto flex w-full max-w-[1120px] scroll-mt-6 flex-col gap-12 px-4 py-20 sm:px-8 sm:py-[104px] xl:px-0"
        >
          <div className="flex flex-col gap-3">
            <p className="text-[13px] font-bold tracking-[0.08em] text-tangerine-ink">
              FUNCIONES
            </p>
            <h2
              id="funciones-titulo"
              className="text-[32px] font-bold leading-[1.2] tracking-[-0.015em] sm:text-[40px]"
            >
              Lo esencial para tener tu agenda en orden
            </h2>
          </div>
          <ul className="grid gap-6 md:grid-cols-3">
            {FEATURES.map((f) => (
              <li
                key={f.title}
                className="flex flex-col gap-3.5 rounded-3xl border border-sand bg-white px-8 pb-9 pt-8"
              >
                <span className="grid size-14 place-items-center rounded-2xl bg-mint-soft text-forest">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="size-7"
                    aria-hidden
                  >
                    {f.icon}
                  </svg>
                </span>
                <h3 className="text-[22px] font-semibold leading-[30px]">{f.title}</h3>
                <p className="text-[16px] leading-[26px] text-slate-green">{f.text}</p>
              </li>
            ))}
          </ul>
        </section>

        {/* Planes */}
        <section
          id="planes"
          aria-labelledby="planes-titulo"
          className="scroll-mt-0 rounded-t-[32px] bg-forest px-4 pb-[120px] pt-24 sm:rounded-t-[48px] sm:px-8 sm:pt-28"
        >
          <div className="mx-auto flex w-full max-w-[1120px] flex-col items-center gap-20">
            <div className="flex max-w-[980px] flex-col items-center gap-4 text-center">
              <p className="text-[13px] font-bold tracking-[0.08em] text-tangerine">PLANES</p>
              <h2
                id="planes-titulo"
                className="text-[34px] font-bold leading-[1.18] tracking-[-0.015em] text-cream sm:text-[44px]"
              >
                Elegí el plan que acompaña tu consultorio
              </h2>
              <p className="max-w-[700px] text-[18px] leading-7 text-sage">
                Empezá gratis y pasá a un plan pago cuando tu agenda lo necesite.
              </p>
            </div>
            <ul className="grid w-full gap-20 lg:grid-cols-3 lg:gap-6">
              {PLANS.map((plan) => (
                <PlanCard key={plan.name} plan={plan} />
              ))}
            </ul>
            <p className="max-w-[760px] text-center text-[14px] leading-[22px] text-moss">
              Precios en pesos argentinos, por mes. Durante el piloto, el acceso
              es con código de invitación.
            </p>
          </div>
        </section>

        {/* CTA final */}
        <section
          aria-labelledby="cta-titulo"
          className="relative isolate flex min-h-[440px] flex-col items-center gap-4 overflow-hidden bg-forest-deep px-4 pt-24 text-center sm:min-h-[520px]"
        >
          <Image
            src="/landing/cta-citricos.webp"
            alt=""
            fill
            quality={90}
            sizes="100vw"
            className="-z-10 object-cover object-bottom"
          />
          <div className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,#0f2a21_0%,rgba(15,42,33,0.92)_50%,rgba(15,42,33,0)_75%)]" />
          <h2
            id="cta-titulo"
            className="text-[34px] font-bold leading-[1.18] tracking-[-0.015em] text-cream sm:text-[44px]"
          >
            Sumate al piloto
          </h2>
          <p className="max-w-[560px] text-[18px] leading-7 text-sage">
            Pedí tu código y empezá a recibir turnos desde tu propio link.
          </p>
          <a href={INVITE_REQUEST_HREF} className={`mt-3 ${btnPrimary} py-3.5`}>
            Pedí tu código
          </a>
        </section>
      </main>

      <footer className="bg-forest-night">
        <div className="mx-auto flex w-full max-w-[1120px] flex-col gap-4 px-4 py-7 sm:flex-row sm:items-center sm:justify-between sm:px-8 xl:px-0">
          <div className="flex items-center gap-2.5">
            <Logo size={28} />
            <p className="text-[14px] text-moss">
              © 2026 {BRAND_NAME}
            </p>
          </div>
          <nav aria-label="Pie de página" className="flex flex-wrap gap-x-7 gap-y-2 text-[14px] font-medium text-moss">
            <Link href="/terminos" className={`rounded hover:text-cream ${focus}`}>Términos</Link>
            <Link href="/privacidad" className={`rounded hover:text-cream ${focus}`}>Privacidad</Link>
            <a href="#funciones" className={`rounded hover:text-cream ${focus}`}>Funciones</a>
            <a href="#planes" className={`rounded hover:text-cream ${focus}`}>Planes</a>
            <Link href="/login" className={`rounded hover:text-cream ${focus}`}>Ingresar</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
