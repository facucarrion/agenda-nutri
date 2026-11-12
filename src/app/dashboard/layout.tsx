import { BRAND_NAME } from "@/lib/brand";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Inter } from "next/font/google";
import { logout } from "@/app/(auth)/actions";
import { FruitLogo } from "@/app/(paciente)/_components/fruit-logo";
import { AccessBanner } from "./_components/access-banner";
import { AccountPerson, AccountTitle } from "./_components/account-names";
import { DashboardNav } from "./_components/dashboard-nav";
import { LiveFavicon } from "./_components/live-favicon";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: `Gestión · ${BRAND_NAME}`,
};

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
            {/* The account's business name, or the nutritionist's name. */}
            <span className="max-w-[45vw] truncate bg-[linear-gradient(90deg,#2f6b4f,#47996f)] bg-clip-text text-[22px] font-bold text-transparent sm:max-w-[420px]">
              <Suspense fallback={BRAND_NAME}>
                <AccountTitle />
              </Suspense>
            </span>
            <span className="rounded-full bg-primary-soft px-2.5 py-0.5 text-xs font-semibold text-primary">
              Gestión
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <Suspense>
              <AccountPerson />
            </Suspense>
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
      <Suspense>
        <AccessBanner />
      </Suspense>
      {children}
      <LiveFavicon />
    </div>
  );
}
