"use client";

import { useState } from "react";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@/app/(paciente)/_components/icons";
import { TIMEZONE, type AppointmentStatus, type MockAppointment } from "./mock-data";
import { WhatsAppDialog, WhatsAppIcon } from "./whatsapp-dialog";

type Tab = "all" | "pending" | "confirmed";

const TABS: { id: Tab; label: string }[] = [
  { id: "all", label: "Todos" },
  { id: "pending", label: "Pendientes" },
  { id: "confirmed", label: "Confirmados" },
];

const STATUS: Record<AppointmentStatus, { label: string; className: string; dot: string }> = {
  pending: { label: "Pendiente", className: "bg-warn-soft text-ink", dot: "bg-warn" },
  confirmed: { label: "Confirmado", className: "bg-ok-soft text-primary", dot: "bg-ok" },
  completed: { label: "Atendido", className: "bg-primary-soft text-primary", dot: "bg-primary" },
  no_show: { label: "Ausente", className: "bg-line/60 text-muted", dot: "bg-faint" },
  cancelled: { label: "Cancelado", className: "bg-bad-soft text-bad", dot: "bg-bad" },
};

const focus = "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40";
const btn = `inline-flex h-9 items-center justify-center gap-2 rounded-full px-4 text-sm font-semibold transition-colors ${focus}`;
const btnPrimary = `${btn} bg-primary text-white hover:bg-primary/90`;
const btnDanger = `${btn} border border-bad text-bad hover:bg-bad-soft`;
const btnSecondary = `${btn} border border-line bg-surface text-ink hover:border-primary hover:text-primary`;
const btnWhatsApp = `${btn} bg-ok text-white hover:bg-ok/90`;

const monthKeyFmt = new Intl.DateTimeFormat("en-CA", {
  timeZone: TIMEZONE,
  year: "numeric",
  month: "2-digit",
});
const dayFmt = new Intl.DateTimeFormat("es-AR", {
  timeZone: TIMEZONE,
  weekday: "short",
  day: "numeric",
  month: "short",
});
const timeFmt = new Intl.DateTimeFormat("es-AR", {
  timeZone: TIMEZONE,
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

const monthKey = (iso: string) => monthKeyFmt.format(new Date(iso)); // "2026-11"

function shiftMonth(key: string, delta: number) {
  const [y, m] = key.split("-").map(Number);
  const d = new Date(Date.UTC(y, m - 1 + delta, 1));
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

function monthLabel(key: string) {
  const [y, m] = key.split("-").map(Number);
  const label = new Intl.DateTimeFormat("es-AR", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(y, m - 1, 15)));
  return label.charAt(0).toUpperCase() + label.slice(1).replace(" de ", " ");
}

// "jue, 5 nov" -> "Jue 5 nov"
function dayLabel(iso: string) {
  const text = dayFmt.format(new Date(iso)).replace(",", "").replace(".", "");
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function initials(a: MockAppointment) {
  return `${a.patients.first_name[0] ?? ""}${a.patients.last_name[0] ?? ""}`;
}

export function AppointmentsBoard({
  initialAppointments,
  now,
}: {
  initialAppointments: MockAppointment[];
  now: string;
}) {
  const [appointments, setAppointments] = useState(initialAppointments);
  const [month, setMonth] = useState(() => monthKey(now));
  const [tab, setTab] = useState<Tab>("all");
  const [rejecting, setRejecting] = useState<string | null>(null);
  const [notify, setNotify] = useState<MockAppointment | null>(null);

  const inMonth = appointments.filter((a) => monthKey(a.starts_at) === month);
  const counts: Record<Tab, number> = {
    all: inMonth.length,
    pending: inMonth.filter((a) => a.status === "pending").length,
    confirmed: inMonth.filter((a) => a.status === "confirmed").length,
  };
  const visible = tab === "all" ? inMonth : inMonth.filter((a) => a.status === tab);

  // TODO(backend): call the matching server action and refresh.
  function setStatus(id: string, status: AppointmentStatus) {
    setAppointments((list) =>
      list.map((a) => (a.id === id ? { ...a, status } : a)),
    );
  }

  function confirm(appointment: MockAppointment) {
    setStatus(appointment.id, "confirmed");
    // Same flow as the Figma: right after confirming, offer the message.
    setNotify({ ...appointment, status: "confirmed" });
  }

  return (
    <>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-[34px] font-bold leading-tight tracking-tight sm:text-[40px]">
            Turnos
          </h1>
          <p className="mt-1 text-muted">
            Confirmá los pedidos y avisá a cada paciente por WhatsApp.
          </p>
        </div>
        <div className="flex items-center gap-1 self-start rounded-full border border-line bg-surface p-1 sm:self-auto">
          <button
            type="button"
            onClick={() => setMonth((m) => shiftMonth(m, -1))}
            aria-label="Mes anterior"
            className={`flex h-8 w-8 items-center justify-center rounded-full text-muted hover:bg-primary-soft hover:text-primary ${focus}`}
          >
            <ChevronLeftIcon className="h-4 w-4" />
          </button>
          <span className="min-w-32 text-center text-sm font-semibold" aria-live="polite">
            {monthLabel(month)}
          </span>
          <button
            type="button"
            onClick={() => setMonth((m) => shiftMonth(m, 1))}
            aria-label="Mes siguiente"
            className={`flex h-8 w-8 items-center justify-center rounded-full text-muted hover:bg-primary-soft hover:text-primary ${focus}`}
          >
            <ChevronRightIcon className="h-4 w-4" />
          </button>
        </div>
      </div>

      {counts.pending > 0 && (
        <p className="mt-6 flex items-center gap-2 rounded-2xl border border-warn/40 bg-warn-soft px-4 py-3 text-sm">
          <span className="h-2 w-2 shrink-0 rounded-full bg-warn" />
          {counts.pending === 1
            ? "Tenés 1 pedido de turno sin responder este mes."
            : `Tenés ${counts.pending} pedidos de turno sin responder este mes.`}{" "}
          Los pedidos online vencen a los 30 minutos si no se confirman.
        </p>
      )}

      <div role="tablist" aria-label="Filtrar turnos" className="mt-6 flex flex-wrap gap-2">
        {TABS.map((t) => {
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setTab(t.id)}
              className={`inline-flex h-9 items-center gap-2 rounded-full px-4 text-sm font-semibold transition-colors ${focus} ${
                active
                  ? "bg-primary text-white"
                  : "border border-line bg-surface text-ink hover:border-primary"
              }`}
            >
              {t.label}
              <span
                className={`min-w-6 rounded-full px-1.5 py-px text-xs ${
                  active ? "bg-white/20 text-white" : "bg-canvas text-muted"
                }`}
              >
                {counts[t.id]}
              </span>
            </button>
          );
        })}
      </div>

      <ul className="mt-5 flex flex-col gap-3">
        {visible.length === 0 && (
          <li className="rounded-[20px] border border-dashed border-line bg-surface/60 px-6 py-12 text-center text-muted">
            {tab === "pending"
              ? "No hay pedidos pendientes este mes."
              : "No hay turnos para mostrar este mes."}
          </li>
        )}

        {visible.map((a) => {
          const status = STATUS[a.status];
          const past = a.starts_at < now;
          const name = `${a.patients.first_name} ${a.patients.last_name}`;

          return (
            <li
              key={a.id}
              className={`grid gap-4 rounded-[20px] border bg-surface p-4 sm:p-5 lg:grid-cols-[minmax(0,1.6fr)_110px_170px_130px_minmax(0,1.4fr)] lg:items-center ${
                a.status === "pending" ? "border-warn/50" : "border-line"
              } ${a.status === "cancelled" || a.status === "no_show" ? "opacity-70" : ""}`}
            >
              <div className="flex min-w-0 items-center gap-3">
                <span
                  aria-hidden
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-soft text-sm font-semibold text-primary"
                >
                  {initials(a)}
                </span>
                <div className="min-w-0">
                  <p className="truncate font-semibold">{name}</p>
                  <p className="truncate text-sm text-muted">
                    {a.appointment_types.name}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 lg:contents">
              <div className="flex gap-2 text-sm lg:block">
                <p className="font-semibold">{dayLabel(a.starts_at)}</p>
                <p className="text-muted">{timeFmt.format(new Date(a.starts_at))} hs</p>
              </div>

              <p className="text-sm text-muted">{a.patients.phone ?? "Sin teléfono"}</p>

              <div>
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${status.className}`}
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />
                  {status.label}
                </span>
              </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 lg:justify-end">
                {a.status === "pending" &&
                  (rejecting === a.id ? (
                    <>
                      <span className="text-sm text-muted">¿Rechazar?</span>
                      <button type="button" className={btnSecondary} onClick={() => setRejecting(null)}>
                        No
                      </button>
                      <button
                        type="button"
                        className={`${btn} bg-bad text-white hover:bg-bad/90`}
                        onClick={() => {
                          setStatus(a.id, "cancelled");
                          setRejecting(null);
                        }}
                      >
                        Sí, rechazar
                      </button>
                    </>
                  ) : (
                    <>
                      <button type="button" className={btnDanger} onClick={() => setRejecting(a.id)}>
                        Rechazar
                      </button>
                      <button type="button" className={btnPrimary} onClick={() => confirm(a)}>
                        Confirmar
                      </button>
                    </>
                  ))}

                {a.status === "confirmed" && past && (
                  <>
                    <button type="button" className={btnSecondary} onClick={() => setStatus(a.id, "no_show")}>
                      Ausente
                    </button>
                    <button type="button" className={btnPrimary} onClick={() => setStatus(a.id, "completed")}>
                      Atendido
                    </button>
                  </>
                )}

                {a.status === "confirmed" && !past && a.patients.phone && (
                  <button type="button" className={btnWhatsApp} onClick={() => setNotify(a)}>
                    <WhatsAppIcon className="h-4 w-4" />
                    Avisar por WhatsApp
                  </button>
                )}
              </div>
            </li>
          );
        })}
      </ul>

      <p className="mt-5 text-sm text-muted">
        Al confirmar, el horario se bloquea en la agenda pública. &quot;Avisar por
        WhatsApp&quot; abre el chat con el mensaje del turno ya escrito.
      </p>

      {notify && <WhatsAppDialog appointment={notify} onClose={() => setNotify(null)} />}
    </>
  );
}
