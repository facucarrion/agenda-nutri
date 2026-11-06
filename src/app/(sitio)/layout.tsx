import { BRAND_NAME } from "@/lib/brand";
import Link from "next/link";
import { FruitLogo } from "@/app/(paciente)/_components/fruit-logo";

const focus =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40";

// Shell for the public site: home page and legal pages. Same warm canvas
// and glows as the patient and auth screens, always light.
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="flex min-h-screen flex-col bg-canvas text-ink"
      style={{
        backgroundImage: [
          "radial-gradient(900px 520px at 6% -4%, rgba(47,107,79,0.14), transparent 65%)",
          "radial-gradient(760px 480px at 100% 28%, rgba(46,158,91,0.10), transparent 65%)",
          "radial-gradient(820px 520px at 14% 100%, rgba(47,107,79,0.10), transparent 65%)",
          "radial-gradient(520px 360px at 92% 100%, rgba(227,168,28,0.08), transparent 65%)",
        ].join(", "),
        backgroundAttachment: "fixed",
      }}
    >
      <header className="border-b border-line bg-surface/80 backdrop-blur">
        <div className="mx-auto flex w-full max-w-[1120px] items-center justify-between gap-4 px-4 py-4 sm:px-8">
          <Link
            href="/"
            className={`group inline-flex items-center gap-2.5 rounded-lg ${focus}`}
          >
            <FruitLogo />
            <span className="bg-[linear-gradient(90deg,#2f6b4f,#47996f)] bg-clip-text text-[22px] font-bold text-transparent transition-transform duration-300 ease-out group-hover:translate-x-0.5 motion-reduce:transition-none">
              {BRAND_NAME}
            </span>
          </Link>
          <Link
            href="/login"
            className={`rounded-full border border-primary px-4 py-1.5 text-sm font-semibold text-primary transition-colors hover:bg-primary-soft ${focus}`}
          >
            Ingresar
          </Link>
        </div>
      </header>

      <div className="flex flex-1 flex-col">{children}</div>

      <footer className="border-t border-line bg-surface/60">
        <div className="mx-auto flex w-full max-w-[1120px] flex-col gap-2 px-4 py-6 text-[13px] text-muted sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <p>{BRAND_NAME} · Turnos para profesionales de la nutrición</p>
          <nav aria-label="Legal" className="flex gap-5">
            <Link href="/privacidad" className={`rounded hover:text-primary ${focus}`}>
              Privacidad
            </Link>
            <Link href="/terminos" className={`rounded hover:text-primary ${focus}`}>
              Términos
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
