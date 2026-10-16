import type { Metadata } from "next";
import Link from "next/link";
import { Inter } from "next/font/google";

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
    <div className={`${inter.className} min-h-screen bg-canvas text-ink`}>
      <header className="border-b border-line bg-surface px-4 py-5 sm:px-12">
        <Link href="/" className="inline-flex items-center gap-2.5">
          <span className="h-7 w-7 rounded-full bg-primary" aria-hidden />
          <span className="text-[22px] font-bold text-primary">NutriSol</span>
        </Link>
      </header>
      {children}
    </div>
  );
}
