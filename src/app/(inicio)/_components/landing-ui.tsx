import Image from "next/image";
import Link from "next/link";
import { BRAND_NAME } from "@/lib/brand";
import { CONTACT_EMAIL, PILOT_WHATSAPP_HREF } from "@/lib/legal";
import { PilotWhatsappLink } from "./pilot-whatsapp-link";

// Pieces shared by the home page and /funciones: nav, closing call to
// action and footer.

export const focus =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tangerine/70 focus-visible:ring-offset-2 focus-visible:ring-offset-forest";

export const btnPrimary = `inline-flex items-center justify-center rounded-full bg-tangerine px-7 py-3.5 text-[16px] font-semibold leading-6 text-forest transition-colors hover:bg-[#f59d55] ${focus}`;
export const btnGhost = `inline-flex items-center justify-center rounded-full border border-cream/50 px-7 py-3.5 text-[16px] font-semibold leading-6 text-cream transition-colors hover:border-cream hover:bg-cream/10 ${focus}`;

export function Logo({ size }: { size: number }) {
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

const navLink = `hidden rounded text-[15px] font-medium text-sage-light transition-colors hover:text-cream sm:block ${focus}`;

export function SiteNav() {
  return (
    <nav className="mx-auto flex w-full max-w-[1120px] items-center justify-between gap-4 px-4 py-6 sm:px-8 xl:px-0">
      <Link href="/" className={`flex items-center gap-3 rounded-lg ${focus}`}>
        <Logo size={40} />
        <span className="text-[20px] font-bold tracking-[-0.005em] text-cream sm:text-[22px]">
          {BRAND_NAME}
        </span>
      </Link>
      <div className="flex items-center gap-9">
        <Link href="/funciones" className={navLink}>
          Funciones
        </Link>
        <Link href="/#planes" className={navLink}>
          Planes
        </Link>
        <Link
          href="/login"
          className={`rounded-full border border-cream/50 px-[22px] py-2.5 text-[16px] font-semibold leading-6 text-cream transition-colors hover:border-cream hover:bg-cream/10 ${focus}`}
        >
          Ingresar
        </Link>
      </div>
    </nav>
  );
}

// `joined`: the section continues the green panel above it (home page), so it
// has no gap or rounded top and fades in from bg-forest. Otherwise it has a
// rounded top that overlaps the section above by the corner radius, so that
// section's background shows around the corners: give it matching bottom
// padding (pb-8 sm:pb-12).
export function ClosingCta({ joined = false }: { joined?: boolean }) {
  return (
    <section
      aria-labelledby="cta-titulo"
      className={`grain relative isolate flex min-h-[440px] flex-col items-center gap-4 overflow-hidden bg-forest-deep px-4 pt-24 text-center sm:min-h-[520px] ${
        joined ? "" : "-mt-8 rounded-t-[32px] sm:-mt-12 sm:rounded-t-[48px]"
      }`}
    >
      <Image
        src="/landing/cta-citricos.webp"
        alt=""
        fill
        quality={95}
        sizes="100vw"
        className="-z-10 object-cover object-bottom"
      />
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,#0f2a21_0%,rgba(15,42,33,0.92)_50%,rgba(15,42,33,0)_75%)]" />
      {joined && (
        <div className="absolute inset-x-0 top-0 -z-10 h-[160px] bg-[linear-gradient(180deg,#14352a_0%,rgba(20,53,42,0)_100%)]" />
      )}
      <h2
        id="cta-titulo"
        className="reveal text-[34px] font-bold leading-[1.18] tracking-[-0.015em] text-cream sm:text-[44px]"
      >
        Sumate al piloto
      </h2>
      <p className="reveal max-w-[560px] text-[18px] leading-7 text-sage">
        Pedí tu código y empezá a recibir turnos desde tu propio link.
      </p>
      <PilotWhatsappLink className={`reveal mt-3 ${btnPrimary} py-3.5`}>
        Pedí tu código
      </PilotWhatsappLink>
    </section>
  );
}

const FOOTER_COLUMNS: { title: string; links: { label: string; href: string }[] }[] = [
  {
    title: "Producto",
    links: [
      { label: "Funciones", href: "/funciones" },
      { label: "Planes", href: "/#planes" },
      { label: "Ingresar", href: "/login" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Términos", href: "/terminos" },
      { label: "Privacidad", href: "/privacidad" },
    ],
  },
  {
    title: "Contacto",
    links: [
      { label: "Pedí tu código", href: PILOT_WHATSAPP_HREF },
      { label: CONTACT_EMAIL, href: `mailto:${CONTACT_EMAIL}` },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="bg-forest-night text-moss">
      <div className="mx-auto grid w-full max-w-[1120px] gap-10 px-4 pb-12 pt-16 sm:grid-cols-2 sm:px-8 lg:grid-cols-[1.6fr_1fr_1fr_1.2fr] xl:px-0">
        <div className="flex flex-col gap-4">
          <Link href="/" className={`flex items-center gap-3 self-start rounded-lg ${focus}`}>
            <Logo size={36} />
            <span className="text-[19px] font-bold tracking-[-0.005em] text-cream">
              {BRAND_NAME}
            </span>
          </Link>
          <p className="max-w-[300px] text-[14px] leading-[22px]">
            Agenda de turnos para profesionales de la nutrición: reserva
            online, recordatorios y tu consulta en orden.
          </p>
        </div>
        {FOOTER_COLUMNS.map((col) => (
          <nav key={col.title} aria-label={col.title} className="flex flex-col gap-3.5 text-[14px]">
            <p className="text-[12px] font-bold tracking-[0.08em] text-sage-light">
              {col.title.toUpperCase()}
            </p>
            {col.links.map((l) =>
              l.href.startsWith("/") ? (
                <Link key={l.label} href={l.href} className={`self-start rounded transition-colors hover:text-cream ${focus}`}>
                  {l.label}
                </Link>
              ) : l.href === PILOT_WHATSAPP_HREF ? (
                <PilotWhatsappLink key={l.label} className={`self-start rounded transition-colors hover:text-cream ${focus}`}>
                  {l.label}
                </PilotWhatsappLink>
              ) : (
                <a key={l.label} href={l.href} className={`self-start break-all rounded transition-colors hover:text-cream ${focus}`}>
                  {l.label}
                </a>
              ),
            )}
          </nav>
        ))}
      </div>
      <div className="border-t border-cream/10">
        <p className="mx-auto w-full max-w-[1120px] px-4 py-6 text-[13px] sm:px-8 xl:px-0">
          © 2026 {BRAND_NAME}
        </p>
      </div>
    </footer>
  );
}
