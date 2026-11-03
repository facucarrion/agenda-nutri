import type { Metadata } from "next";
import Link from "next/link";
import { Inter } from "next/font/google";
import { logout } from "@/app/(auth)/actions";
import { FruitLogo } from "@/app/(paciente)/_components/fruit-logo";
import { DashboardNav } from "./_components/dashboard-nav";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Gestión · NutriSol",
};

// TODO(backend): read the name from the nutritionists table.
const MOCK_NAME = "Sol Oyola";

// Shell for the nutritionist's private pages. Same palette and warm
// background as the patient pages, always light on purpose.
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className={`${inter.className} min-h-screen bg-canvas text-ink`}
      style={{
        backgroundImage: [
          "radial-gradient(900px 520px at 6% -4%, rgba(47,107,79,0.12), transparent 65%)",
          "radial-gradient(760px 480px at 100% 28%, rgba(46,158,91,0.08), transparent 65%)",
          "radial-gradient(520px 360px at 92% 100%, rgba(227,168,28,0.07), transparent 65%)",
        ].join(", "),
        backgroundAttachment: "fixed",
      }}
    >
      <header className="border-b border-line bg-surface/80 backdrop-blur">
        <div className="mx-auto flex w-full max-w-[1280px] items-center justify-between gap-4 px-4 py-4 sm:px-12">
          <Link
            href="/dashboard/turnos"
            className="group inline-flex items-center gap-2.5 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          >
            <FruitLogo />
            <span className="bg-[linear-gradient(90deg,#2f6b4f,#47996f)] bg-clip-text text-[22px] font-bold text-transparent">
              NutriSol
            </span>
            <span className="rounded-full bg-primary-soft px-2.5 py-0.5 text-xs font-semibold text-primary">
              Gestión
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm font-medium sm:inline">
              {MOCK_NAME}
            </span>
            <form action={logout}>
              <button
                type="submit"
                className="rounded-full border border-primary px-4 py-1.5 text-sm font-semibold text-primary transition-colors hover:bg-primary-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
              >
                Salir
              </button>
            </form>
          </div>
        </div>
        <div className="mx-auto w-full max-w-[1280px] px-4 sm:px-12">
          <DashboardNav />
        </div>
      </header>
      {children}
    </div>
  );
}
