import Link from "next/link";
import { BRAND_NAME } from "@/lib/brand";

// Only rendered after the admin check passed.
export function AdminHeader() {
  return (
    <header className="border-b border-line bg-surface/80 backdrop-blur">
      <div className="mx-auto flex w-full max-w-[1280px] items-center justify-between gap-4 px-4 py-4 sm:px-12">
        <p className="text-[20px] font-bold text-primary">
          {BRAND_NAME}{" "}
          <span className="rounded-full bg-primary-soft px-2.5 py-0.5 align-middle text-xs font-semibold">
            Administración
          </span>
        </p>
        <Link href="/dashboard" className="text-sm font-semibold text-primary hover:underline">
          Ir al panel
        </Link>
      </div>
    </header>
  );
}
