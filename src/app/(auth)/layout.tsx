import type { Metadata } from "next";
import Link from "next/link";
import { Inter } from "next/font/google";
import { FruitLogo } from "@/app/(paciente)/_components/fruit-logo";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Agenda Nutri",
};

// Shell for login, sign-up and password recovery. Always light, like the
// rest of the app.
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`${inter.className} flex min-h-screen flex-col bg-canvas text-ink`}>
      <header className="border-b border-line bg-surface">
        <div className="flex items-center px-4 py-[18px] sm:px-12">
          <Link
            href="/login"
            className="inline-flex items-center gap-2.5 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          >
            <FruitLogo />
            <span className="text-[22px] font-bold text-primary">Agenda Nutri</span>
          </Link>
        </div>
      </header>
      <main className="flex flex-1 items-center justify-center px-4 py-10 sm:py-20">
        {children}
      </main>
    </div>
  );
}
