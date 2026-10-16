import type { Metadata } from "next";
import Link from "next/link";
import { Inter } from "next/font/google";
import { FruitLogo } from "./_components/fruit-logo";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Reservá tu turno",
};

// Shell for the public pages a patient sees. Always light, on purpose: the
// booking palette comes from the Figma and does not follow the OS theme.
export default function PatientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className={`${inter.className} min-h-screen bg-canvas text-ink`}
      style={{
        // Soft green glows over the warm canvas.
        backgroundImage: [
          "radial-gradient(900px 520px at 6% -4%, rgba(47,107,79,0.14), transparent 65%)",
          "radial-gradient(760px 480px at 100% 28%, rgba(46,158,91,0.10), transparent 65%)",
          "radial-gradient(820px 520px at 14% 100%, rgba(47,107,79,0.10), transparent 65%)",
          "radial-gradient(520px 360px at 92% 100%, rgba(227,168,28,0.08), transparent 65%)",
        ].join(", "),
        backgroundAttachment: "fixed",
      }}
    >
      <header className="border-b border-line bg-surface/80 px-4 py-4 backdrop-blur sm:px-12">
        <Link href="/" className="group inline-flex items-center gap-2.5">
          <FruitLogo />
          <span className="bg-[linear-gradient(90deg,#2f6b4f,#47996f)] bg-clip-text text-[22px] font-bold text-transparent transition-transform duration-300 ease-out group-hover:translate-x-0.5 motion-reduce:transition-none">
            NutriSol
          </span>
        </Link>
      </header>
      {children}
    </div>
  );
}
