"use client";

import { useState } from "react";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@/app/(paciente)/_components/icons";
import type { DashboardAppointment, TypeOption } from "../_lib/types";
import { dayKey, monthTitle, shortDay, timeOf } from "../_lib/dates";
import { AppointmentActions } from "../_components/appointment-actions";
import { AppointmentDialog, type DialogState } from "../_components/appointment-dialog";
import { useAppointments } from "../_components/use-appointments";
import { WhatsAppDialog } from "../_components/whatsapp-dialog";
import { ReminderList } from "./reminder-list";
import { STATUS, btnPrimary, focus, fullName, initials } from "../_components/ui";

type Tab = "all" | "pending" | "confirmed";

const TABS: { id: Tab; label: string }[] = [
  { id: "all", label: "Todos" },
  { id: "pending", label: "Pendientes" },
  { id: "confirmed", label: "Confirmados" },
];

function shiftMonth(month: string, delta: number) {
  const [y, m] = month.split("-").map(Number);
  const d = new Date(Date.UTC(y, m - 1 + delta, 1));
  return d.toISOString().slice(0, 7);
}

export function AppointmentsBoard({
  initialAppointments,
  types,
  senderName,
  now,
}: {
  initialAppointments: DashboardAppointment[];
  types: TypeOption[];
  senderName: string;
  now: string;
}) {
  const { appointments, setStatus, markReminded, notify, setNotify, error } =
    useAppointments(initialAppointments);
  const [reminder, setReminder] = useState<DashboardAppointment | null>(null);
  const [month, setMonth] = useState(() => dayKey(now).slice(0, 7));
  const [tab, setTab] = useState<Tab>("all");
  const [dialog, setDialog] = useState<DialogState>(null);

  const inMonth = appointments.filter((a) => dayKey(a.starts_at).startsWith(month));
  const counts: Record<Tab, number> = {
    all: inMonth.length,
    pending: inMonth.filter((a) => a.status === "pending").length,
    confirmed: inMonth.filter((a) => a.status === "confirmed").length,
  };
  const visible = tab === "all" ? inMonth : inMonth.filter((a) => a.status === tab);

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
        <div className="flex flex-wrap items-center gap-3 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setDialog({ mode: "create", day: dayKey(now) })}
            className={btnPrimary}
          >
            + Nuevo turno
          </button>
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
            {monthTitle(`${month}-01`)}
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
      </div>

      {error && (
        <p role="alert" className="mt-4 rounded-xl bg-bad-soft px-4 py-3 text-sm text-bad">
          {error}
        </p>
      )}

      <ReminderList appointments={appointments} now={now} onRemind={setReminder} />

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
                  <p className="truncate font-semibold">{fullName(a)}</p>
                  <p className="truncate text-sm text-muted">{a.appointment_types.name}</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 lg:contents">
                <div className="flex gap-2 text-sm lg:block">
                  <p className="font-semibold">{shortDay(dayKey(a.starts_at))}</p>
                  <p className="text-muted">{timeOf(a.starts_at)} hs</p>
                </div>

                <p className="text-sm text-muted">{a.patients.phone ?? "Sin teléfono"}</p>

                <div>
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${status.badge}`}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />
                    {status.label}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 lg:justify-end">
                <AppointmentActions
                  appointment={a}
                  now={now}
                  onStatus={setStatus}
                  onNotify={setNotify}
                  onEdit={(appointment) => setDialog({ mode: "edit", appointment })}
                />
              </div>
            </li>
          );
        })}
      </ul>

      <p className="mt-5 text-sm text-muted">
        Al confirmar, el horario se bloquea en la agenda pública. &quot;Avisar por
        WhatsApp&quot; abre el chat con el mensaje del turno ya escrito.
      </p>

      {notify && (
        <WhatsAppDialog
          appointment={notify}
          senderName={senderName}
          onClose={() => setNotify(null)}
        />
      )}
      {reminder && (
        <WhatsAppDialog
          appointment={reminder}
          senderName={senderName}
          kind="reminder"
          onSent={(a) => markReminded(a.id)}
          onClose={() => setReminder(null)}
        />
      )}
      {dialog && (
        <AppointmentDialog state={dialog} types={types} onClose={() => setDialog(null)} />
      )}
    </>
  );
}
