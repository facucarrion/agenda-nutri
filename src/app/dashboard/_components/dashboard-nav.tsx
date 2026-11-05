"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// Pages without a screen yet are shown but not linked.
const ITEMS = [
  { href: "/dashboard/turnos", label: "Turnos", ready: true },
  { href: "/dashboard/agenda", label: "Agenda", ready: true },
  { href: "/dashboard/patients", label: "Pacientes", ready: false },
  { href: "/dashboard/availability", label: "Disponibilidad", ready: true },
  { href: "/dashboard/cuenta", label: "Mi cuenta", ready: true },
];

export function DashboardNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Secciones" className="-mb-px flex gap-6 overflow-x-auto">
      {ITEMS.map((item) => {
        const active = pathname.startsWith(item.href);

        if (!item.ready) {
          return (
            <span
              key={item.href}
              className="flex shrink-0 items-center gap-1.5 border-b-2 border-transparent py-3 text-sm font-medium text-faint"
            >
              {item.label}
              <span className="rounded-full bg-line/60 px-1.5 py-px text-[10px] font-semibold uppercase tracking-wide text-muted">
                Pronto
              </span>
            </span>
          );
        }

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={`shrink-0 border-b-2 py-3 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
              active
                ? "border-primary text-primary"
                : "border-transparent text-muted hover:text-ink"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
