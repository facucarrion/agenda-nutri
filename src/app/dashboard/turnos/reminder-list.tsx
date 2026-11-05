"use client";

import { useState } from "react";
import type { DashboardAppointment } from "../_lib/types";
import { addDays, dayKey, longDay, timeOf } from "../_lib/dates";
import { WhatsAppIcon } from "../_components/whatsapp-dialog";
import { btnSecondary, btnWhatsApp, card, focus, fullName } from "../_components/ui";

type Which = "today" | "tomorrow";

const OPTIONS: { id: Which; label: string }[] = [
  { id: "tomorrow", label: "Mañana" },
  { id: "today", label: "Hoy" },
];

// The confirmed turnos of one day with a WhatsApp button each, so the
// nutritionist can remind everyone in a minute. WhatsApp is sent by hand:
// "Avisado" means she already opened the message for that turno.
export function ReminderList({
  appointments,
  now,
  onRemind,
}: {
  appointments: DashboardAppointment[];
  now: string;
  onRemind: (appointment: DashboardAppointment) => void;
}) {
  const [which, setWhich] = useState<Which>("tomorrow");
  const today = dayKey(now);
  const day = which === "today" ? today : addDays(today, 1);

  const list = appointments.filter(
    (a) =>
      a.status === "confirmed" &&
      dayKey(a.starts_at) === day &&
      // Today only what has not started yet.
      (which === "tomorrow" || a.starts_at > now),
  );
  const reminded = list.filter((a) => a.whatsapp_reminded_at).length;

  return (
    <section className={`${card} mt-6 flex flex-col gap-4 !p-5`} aria-labelledby="reminders-title">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 id="reminders-title" className="text-lg font-bold">
            Recordatorios por WhatsApp
          </h2>
          <p className="text-sm text-muted">
            {longDay(day)}
            {list.length > 0 && ` · ${list.length === 1 ? "1 turno" : `${list.length} turnos`}`}
            {reminded > 0 && ` · ${reminded} ya ${reminded === 1 ? "avisado" : "avisados"}`}
          </p>
        </div>

        <div role="group" aria-label="Día a recordar" className="flex gap-1 rounded-full bg-canvas p-1">
          {OPTIONS.map((option) => (
            <button
              key={option.id}
              type="button"
              aria-pressed={which === option.id}
              onClick={() => setWhich(option.id)}
              className={`h-8 rounded-full px-4 text-sm font-semibold transition-colors ${focus} ${
                which === option.id ? "bg-primary text-white" : "text-muted hover:text-ink"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {list.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-line px-4 py-6 text-center text-sm text-muted">
          {which === "today"
            ? "No quedan turnos confirmados para hoy."
            : "No tenés turnos confirmados para mañana."}
        </p>
      ) : (
        <ul className="flex flex-col divide-y divide-line">
          {list.map((a) => (
            <li key={a.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 py-3">
              <span className="w-[4.5rem] shrink-0 whitespace-nowrap text-[15px] font-bold">
                {timeOf(a.starts_at)} hs
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold">{fullName(a)}</p>
                <p className="truncate text-sm text-muted">
                  {a.appointment_types.name}
                  {" · "}
                  {a.patients.phone ?? "Sin teléfono"}
                </p>
              </div>
              <div className="flex items-center gap-3">
                {a.whatsapp_reminded_at && (
                  <span className="text-sm font-medium text-primary">
                    ✓ Avisado {timeOf(a.whatsapp_reminded_at)} hs
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => onRemind(a)}
                  disabled={!a.patients.phone}
                  className={`${a.whatsapp_reminded_at ? btnSecondary : btnWhatsApp} disabled:opacity-50`}
                >
                  <WhatsAppIcon className="h-4 w-4" />
                  {a.whatsapp_reminded_at ? "Avisar de nuevo" : "Recordar"}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
