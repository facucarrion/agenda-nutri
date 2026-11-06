import { BRAND_NAME } from "@/lib/brand";
import type { Metadata } from "next";
import Link from "next/link";
import { Inter } from "next/font/google";
import { FruitLogo } from "@/app/(paciente)/_components/fruit-logo";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: BRAND_NAME,
};

// Shell for login, sign-up and password recovery. Always light, like the
// rest of the app, with the same warm glows as the patient pages.
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className={`${inter.className} flex min-h-screen flex-col bg-canvas text-ink`}
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
        <div className="flex items-center px-4 py-[18px] sm:px-12">
          <Link
            href="/login"
            className="group inline-flex items-center gap-2.5 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          >
            <FruitLogo />
            <span className="bg-[linear-gradient(90deg,#2f6b4f,#47996f)] bg-clip-text text-[22px] font-bold text-transparent transition-transform duration-300 ease-out group-hover:translate-x-0.5 motion-reduce:transition-none">
              {BRAND_NAME}
            </span>
          </Link>
        </div>
      </header>
      <main className="flex flex-1 items-center justify-center px-4 py-10 sm:py-20">
        {children}
      </main>
    </div>
  );
}
