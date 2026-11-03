"use client";

import { useState } from "react";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@/app/(paciente)/_components/icons";
import type { MockAppointment, MockSchedule } from "../_lib/mock-data";
import { addDays, dayKey, mondayOf, monthTitle, weekTitle } from "../_lib/dates";
import { useAppointments } from "../_components/use-appointments";
import { WhatsAppDialog } from "../_components/whatsapp-dialog";
import { focus, iconButton, isActive } from "../_components/ui";
import { DayPanel } from "./day-panel";
import { MonthGrid } from "./month-grid";
import { WeekGrid } from "./week-grid";

type View = "month" | "week";

export type DayInfo = {
  key: string;
  appointments: MockAppointment[]; // active ones, sorted
  works: boolean; // a workday by the weekly schedule
  blocked: boolean;
  full: boolean;
  past: boolean;
  today: boolean;
};

const LEGEND: Record<View, { label: string; mark: string }[]> = {
  month: [
    { label: "Confirmado", mark: "h-2.5 w-2.5 rounded-full bg-ok" },
    { label: "Pendiente", mark: "h-2.5 w-2.5 rounded-full bg-warn" },
    { label: "Día completo", mark: "h-2.5 w-2.5 rounded-full bg-bad" },
    { label: "Bloqueado", mark: "h-2.5 w-2.5 rounded-full bg-faint" },
  ],
  week: [
    { label: "Confirmado", mark: "h-2.5 w-2.5 rounded-full bg-ok" },
    { label: "Pendiente", mark: "h-2.5 w-2.5 rounded-full bg-warn" },
    { label: "Libre", mark: "h-3 w-3 rounded-[3px] border border-line bg-surface" },
    { label: "Atendido", mark: "h-2.5 w-2.5 rounded-full bg-faint" },
  ],
};

function shiftMonth(key: string, delta: number) {
  const [y, m] = key.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1 + delta, 1)).toISOString().slice(0, 10);
}

export function AgendaView({
  initialAppointments,
  schedule,
  now,
}: {
  initialAppointments: MockAppointment[];
  schedule: MockSchedule;
  now: string;
}) {
  const today = dayKey(now);
  const { appointments, setStatus, notify, setNotify } = useAppointments(initialAppointments);
  const [view, setView] = useState<View>("month");
  const [anchor, setAnchor] = useState(today); // any day inside the visible period
  const [selected, setSelected] = useState(today);

  const byDay = new Map<string, MockAppointment[]>();
  for (const a of appointments) {
    if (!isActive(a)) continue;
    const key = dayKey(a.starts_at);
    byDay.set(key, [...(byDay.get(key) ?? []), a]);
  }

  function info(key: string): DayInfo {
    const list = byDay.get(key) ?? [];
    const works = schedule.workdays.includes(
      new Date(`${key}T12:00:00Z`).getUTCDay() || 7,
    );
    return {
      key,
      appointments: list,
      works,
      blocked: schedule.blockedDays.includes(key),
      full: works && list.length >= schedule.slotTimes.length,
      past: key < today,
      today: key === today,
    };
  }

  function move(delta: number) {
    setAnchor((a) => (view === "month" ? shiftMonth(a, delta) : addDays(a, 7 * delta)));
  }

  function changeView(next: View) {
    setView(next);
    setAnchor(selected);
  }

  const title = view === "month" ? monthTitle(anchor) : weekTitle(mondayOf(anchor));
  const subtitle =
    view === "month"
      ? "Todos los turnos del mes de un vistazo. Elegí un día para ver el detalle."
      : "Todos los turnos de la semana de un vistazo. Elegí un día para ver el detalle.";

  return (
    <>
      <h1 className="text-[34px] font-bold leading-tight tracking-tight sm:text-[40px]">
        Agenda
      </h1>
      <p className="mt-1 text-muted">{subtitle}</p>

      <div className="mt-6 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_270px]">
        <section className="min-w-0 rounded-[24px] border border-line bg-surface p-4 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 sm:gap-3">
              <button type="button" className={iconButton} onClick={() => move(-1)} aria-label={view === "month" ? "Mes anterior" : "Semana anterior"}>
                <ChevronLeftIcon className="h-4 w-4" />
              </button>
              <h2 className="min-w-0 text-lg font-bold sm:text-xl" aria-live="polite">
                {title}
              </h2>
              <button type="button" className={iconButton} onClick={() => move(1)} aria-label={view === "month" ? "Mes siguiente" : "Semana siguiente"}>
                <ChevronRightIcon className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => {
                  setAnchor(today);
                  setSelected(today);
                }}
                className={`h-9 rounded-full border border-line px-4 text-sm font-semibold text-primary hover:border-primary ${focus}`}
              >
                Hoy
              </button>
            </div>

            <div className="relative grid grid-cols-2 rounded-full bg-canvas p-1" role="group" aria-label="Vista">
              <span
                aria-hidden
                className={`absolute inset-y-1 left-1 w-[calc(50%-4px)] rounded-full bg-primary shadow-sm transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] motion-reduce:transition-none ${
                  view === "week" ? "translate-x-full" : ""
                }`}
              />
              {(["month", "week"] as const).map((v) => (
                <button
                  key={v}
                  type="button"
                  aria-pressed={view === v}
                  onClick={() => changeView(v)}
                  className={`relative z-10 h-9 rounded-full px-5 text-sm font-semibold transition-colors duration-300 ${focus} ${
                    view === v ? "text-white" : "text-muted hover:text-ink"
                  }`}
                >
                  {v === "month" ? "Mes" : "Semana"}
                </button>
              ))}
            </div>
          </div>

          <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-1 text-sm text-muted">
            {LEGEND[view].map((item) => (
              <li key={item.label} className="flex items-center gap-2">
                <span className={item.mark} />
                {item.label}
              </li>
            ))}
          </ul>

          <div className="mt-5">
            {view === "month" ? (
              <MonthGrid month={anchor.slice(0, 7)} info={info} selected={selected} onSelect={setSelected} />
            ) : (
              <WeekGrid
                monday={mondayOf(anchor)}
                info={info}
                schedule={schedule}
                selected={selected}
                onSelect={setSelected}
              />
            )}
          </div>
        </section>

        <DayPanel day={info(selected)} now={now} onStatus={setStatus} onNotify={setNotify} />
      </div>

      {notify && <WhatsAppDialog appointment={notify} onClose={() => setNotify(null)} />}
    </>
  );
}
