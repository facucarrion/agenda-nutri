import { Suspense } from "react";
import { headers } from "next/headers";
import { connection } from "next/server";
import { getAvailability } from "../_lib/data";
import { BookingLink } from "./booking-link";
import { BookingSettings } from "./booking-settings";
import { ConsultationTypes } from "./consultation-types";
import { DaysOff } from "./days-off";
import { WeeklyHours } from "./weekly-hours";

// Public address for the booking link: the configured site URL, or the host
// the nutritionist is using right now.
async function siteOrigin() {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  if (configured) return configured;

  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

function Check({ done, children }: { done: boolean; children: string }) {
  return (
    <li className="flex items-center gap-2 text-sm">
      <span
        aria-hidden
        className={`flex size-5 items-center justify-center rounded-full text-xs font-bold ${
          done ? "bg-ok-soft text-primary" : "bg-warn-soft text-ink"
        }`}
      >
        {done ? "✓" : "!"}
      </span>
      <span className={done ? "text-ink" : "font-medium text-ink"}>{children}</span>
    </li>
  );
}

async function Availability() {
  await connection(); // "now" must be computed per request
  const now = new Date();
  const [data, origin] = await Promise.all([getAvailability(now), siteOrigin()]);

  const hasHours = data.rules.length > 0;
  const hasTypes = data.types.some((t) => t.is_active);

  return (
    <>
      <h1 className="text-[34px] font-bold leading-tight tracking-tight sm:text-[40px]">
        Disponibilidad
      </h1>
      <p className="mt-1 text-muted">
        Configurá cuándo atendés y qué pueden reservar tus pacientes.
      </p>

      <ul
        className={`mt-5 flex flex-col gap-2 rounded-2xl border p-4 ${
          hasHours && hasTypes ? "border-line bg-surface" : "border-warn/50 bg-warn-soft/40"
        }`}
        aria-label="Estado de tu agenda online"
      >
        <Check done={hasHours}>Cargaste tus horarios de atención</Check>
        <Check done={hasTypes}>Tenés al menos un tipo de consulta activo</Check>
      </ul>

      <div className="mt-6 grid items-start gap-6 lg:grid-cols-2">
        <div className="flex flex-col gap-6">
          <BookingLink slug={data.slug} origin={origin} />
          <WeeklyHours rules={data.rules} />
        </div>
        <div className="flex flex-col gap-6">
          <ConsultationTypes types={data.types} />
          <DaysOff blocks={data.blocks} />
          <BookingSettings slotMinutes={data.slotMinutes} minNoticeHours={data.minNoticeHours} />
        </div>
      </div>
    </>
  );
}

export default function AvailabilityPage() {
  return (
    <main className="mx-auto w-full max-w-[1280px] px-4 pb-16 pt-8 sm:px-12 sm:pt-10">
      <Suspense fallback={<p className="text-muted">Cargando disponibilidad...</p>}>
        <Availability />
      </Suspense>
    </main>
  );
}
