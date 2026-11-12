import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { BRAND_NAME } from "@/lib/brand";

const inter = Inter({ subsets: ["latin"] });

// This shell is served before anyone is checked, so it says nothing about what
// lives here: no title, no header. The checked pages draw those themselves.
export const metadata: Metadata = {
  title: BRAND_NAME,
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <div className={`${inter.className} min-h-screen bg-canvas text-ink`}>{children}</div>;
}
