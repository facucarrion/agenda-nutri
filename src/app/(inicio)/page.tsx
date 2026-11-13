import Image from "next/image";
import Link from "next/link";
import { Fraunces } from "next/font/google";
import { DEFAULT_TRIAL_DAYS } from "@/lib/access";
import { BRAND_NAME } from "@/lib/brand";
import { CONTACT_EMAIL, PILOT_WHATSAPP_HREF } from "@/lib/legal";
import {
  ClosingCta,
  SiteFooter,
  SiteNav,
  btnGhost,
  btnPrimary,
  focus,
} from "./_components/landing-ui";
import { PlanCard, type Plan } from "./_components/plan-card";
import { PlansCarousel } from "./_components/plans-carousel";
import { PilotWhatsappLink } from "./_components/pilot-whatsapp-link";

// Serif italic for one accent phrase per title.
const accentFont = Fraunces({ subsets: ["latin"], style: "italic", display: "swap" });

function Accent({ children }: { children: React.ReactNode }) {
  return (
    <em className={`${accentFont.className} font-medium tracking-[-0.01em]`}>{children}</em>
  );
}

const NOTIFY_CENTRO_HREF =
  `mailto:${CONTACT_EMAIL}` +
  `?subject=${encodeURIComponent(`Avisame cuando esté el plan Centro de ${BRAND_NAME}`)}`;

// Prices and limits are still being validated with the team (see
// analisis/precios-competencia.md): change them here.
const PLANS: Plan[] = [
  {
    name: "Consultorio",
    tagline: "Para atender todas las semanas.",
    listPrice: "$9.900",
    price: "$0",
    period: `por ${DEFAULT_TRIAL_DAYS} días`,
    badge: `${DEFAULT_TRIAL_DAYS} días gratis`,
    featured: true,
    cta: { label: `Probalo ${DEFAULT_TRIAL_DAYS} días gratis`, href: PILOT_WHATSAPP_HREF },
    features: [
      `Probalo ${DEFAULT_TRIAL_DAYS} días gratis, sin tarjeta`,
      "1 profesional",
      "Turnos ilimitados",
      "Link de reserva online",
      "Agenda de mes y semana",
      "Confirmación por email",
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

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-cream text-forest">
      {/* Hero */}
      {/* Hero, Planes and the closing CTA read as one continuous green panel:
          square edges, no gaps, and gradients where the photos darken it. */}
      <header className="grain relative isolate z-10 flex min-h-svh flex-col overflow-x-clip bg-forest lg:block lg:min-h-0">
        {/* The photo runs 80px past the bottom of the hero, over the top of
            Planes, and fades out there: there is no hard edge where the two
            sections meet, and the fruits above it stay untouched. */}
        <div
          aria-hidden
          className="absolute inset-x-0 top-0 -bottom-20 -z-10 [mask-image:linear-gradient(180deg,#000_calc(100%-80px),transparent_100%)]"
        >
          <Image
            src="/landing/hero-frutas-verde-2.webp"
            alt=""
            fill
            priority
            // Served as-is: the photo's background was regraded to exactly
            // bg-forest, and re-encoding shifts those dark greens.
            unoptimized
            sizes="100vw"
            className="object-cover object-[78%_bottom] lg:object-right"
          />
          {/* Desktop: green on the left, photo on the right. Mobile: the photo
              sits behind the text, so it gets a stronger, even veil. */}
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(20,53,42,0.94)_0%,rgba(20,53,42,0.82)_45%,rgba(20,53,42,0.2)_100%)] lg:bg-[linear-gradient(90deg,#14352a_0%,rgba(20,53,42,0.95)_40%,rgba(20,53,42,0)_62%)]" />
        </div>
        <div className="absolute inset-x-0 top-0 -z-10 h-[240px] bg-[linear-gradient(180deg,#14352a_0%,rgba(20,53,42,0.9)_45%,rgba(20,53,42,0)_100%)]" />

        <SiteNav />

        <div className="mx-auto flex w-full max-w-[1120px] flex-1 flex-col justify-center px-4 pb-24 pt-8 sm:px-8 sm:pt-[88px] lg:block lg:min-h-[726px] lg:flex-none lg:pb-0 xl:px-0">
          <div className="hero-in flex max-w-[780px] flex-col gap-7">
            <h1 className="text-[40px] font-bold leading-[1.1] tracking-[-0.02em] text-cream sm:text-[52px] lg:text-[60px]">
              Tus turnos en un solo lugar,
              <br className="hidden sm:block" />{" "}
              <Accent>
                <span className="text-tangerine">sin idas y vueltas.</span>
              </Accent>
            </h1>
            <p className="max-w-[560px] text-[18px] leading-[30px] text-sage sm:text-[20px] sm:leading-8">
              Compartí tu link de reserva, mirá tu agenda del día y dejá que los
              recordatorios hagan el resto.
            </p>
            <div className="flex flex-wrap gap-3.5">
              <PilotWhatsappLink className={btnPrimary}>Pedí tu código</PilotWhatsappLink>
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
        {/* Planes */}
        <section
          id="planes"
          aria-labelledby="planes-titulo"
          className="grain relative isolate overflow-x-clip bg-forest px-3 pb-20 pt-20 sm:px-8 sm:pb-28 sm:pt-28"
        >
          <div className="mx-auto flex w-full max-w-[1120px] flex-col items-center gap-4 sm:gap-20">
            <div className="reveal flex max-w-[980px] flex-col items-center gap-4 text-center">
              <p className="text-[13px] font-bold tracking-[0.08em] text-tangerine">PLANES</p>
              <h2
                id="planes-titulo"
                className="text-[34px] font-bold leading-[1.18] tracking-[-0.015em] text-cream sm:text-[44px]"
              >
                Elegí el plan que acompaña tu consultorio
              </h2>
              <p className="max-w-[700px] text-[18px] leading-7 text-sage">
                Probá Consultorio {DEFAULT_TRIAL_DAYS} días gratis, sin tarjeta. Si te sirve, lo activás; si no, no pasa nada.
              </p>
            </div>
            <PlansCarousel>
              {PLANS.map((plan) => (
                <PlanCard key={plan.name} plan={plan} />
              ))}
            </PlansCarousel>
            <p className="reveal max-w-[760px] text-center text-[14px] leading-[22px] text-moss">
              Precios en pesos argentinos, por mes. Al terminar la prueba tu agenda queda
              en modo lectura hasta que actives tu cuenta; tus datos no se borran.
              Durante el piloto, el acceso es con código de invitación.
            </p>
          </div>
        </section>

        <ClosingCta joined />
      </main>

      <SiteFooter />
    </div>
  );
}
