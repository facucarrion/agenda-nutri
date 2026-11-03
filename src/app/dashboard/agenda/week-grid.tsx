import { Fragment } from "react";
import type { Schedule } from "../_lib/types";
import { addDays, longDay, timeOf } from "../_lib/dates";
import { STATUS, focus, shortName, shortType } from "../_components/ui";
import type { DayInfo } from "./agenda-view";

const WEEKDAYS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

function countLabel(day: DayInfo) {
  if (day.blocked) return "Bloqueado";
  if (!day.works) return "No atiende";
  const n = day.appointments.length;
  const text = n === 1 ? "1 turno" : `${n} turnos`;
  return day.today ? `Hoy · ${text}` : text;
}

export function WeekGrid({
  monday,
  info,
  schedule,
  selected,
  onSelect,
}: {
  monday: string;
  info: (key: string) => DayInfo;
  schedule: Schedule;
  selected: string;
  onSelect: (key: string) => void;
}) {
  const days = Array.from({ length: 7 }, (_, i) => info(addDays(monday, i)));

  return (
    <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
      <div className="grid min-w-[720px] grid-cols-[56px_repeat(7,minmax(0,1fr))] gap-1.5">
        <span />
        {days.map((day, i) => {
          const isSelected = day.key === selected;
          const muted = day.past || !day.works || day.blocked;
          return (
            <button
              key={day.key}
              type="button"
              onClick={() => onSelect(day.key)}
              aria-label={`${longDay(day.key)}: ${countLabel(day)}`}
              aria-pressed={isSelected}
              className={`flex flex-col items-center rounded-xl py-2 ${focus} ${
                isSelected
                  ? "border-2 border-primary bg-primary-soft/70"
                  : day.today
                    ? "border border-line bg-surface"
                    : "border border-transparent hover:border-line"
              }`}
            >
              <span className={`text-[11px] font-medium uppercase ${muted ? "text-faint" : "text-muted"}`}>
                {WEEKDAYS[i]}
              </span>
              <span className={`text-xl font-bold leading-tight ${muted && !isSelected ? "text-faint" : "text-ink"}`}>
                {Number(day.key.slice(8))}
              </span>
              <span className={`text-[11px] ${day.today ? "font-semibold text-primary" : muted ? "text-faint" : "text-muted"}`}>
                {countLabel(day)}
              </span>
            </button>
          );
        })}

        {schedule.slotTimes.map((time, row) => (
          <Fragment key={time}>
            <span className="flex h-11 items-center text-sm text-muted">{time}</span>
            {days.map((day) => {
              const a = day.appointments.find((x) => timeOf(x.starts_at) === time);
              const select = () => onSelect(day.key);

              if (a) {
                const status = STATUS[a.status];
                return (
                  <button
                    key={day.key}
                    type="button"
                    onClick={select}
                    title={`${a.patients.first_name} ${a.patients.last_name} · ${a.appointment_types.name}`}
                    className={`flex h-11 min-w-0 flex-col justify-center rounded-lg px-2 text-left ${focus} ${status.chip}`}
                  >
                    <span className="flex min-w-0 items-center gap-1.5 text-xs font-semibold text-ink">
                      <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${status.dot}`} />
                      <span className={`truncate ${a.status === "no_show" ? "line-through" : ""}`}>{shortName(a)}</span>
                    </span>
                    <span className="truncate text-[11px] text-muted">{shortType(a.appointment_types.name)}</span>
                  </button>
                );
              }

              if (!day.works || day.blocked) {
                return (
                  <span key={day.key} className="flex h-11 items-center justify-center text-[11px] text-faint">
                    {row === 0 ? (day.blocked ? "Bloqueado" : "No atiende") : ""}
                  </span>
                );
              }

              if (day.past) return <span key={day.key} className="h-11" />;

              return (
                <button
                  key={day.key}
                  type="button"
                  onClick={select}
                  aria-label={`${longDay(day.key)} ${time}: libre`}
                  className={`flex h-11 items-center justify-center rounded-lg border border-line bg-surface text-[11px] text-faint hover:border-primary/60 ${focus}`}
                >
                  Libre
                </button>
              );
            })}

            {time === schedule.breakAfter && (
              <span className="col-span-8 py-1 text-center text-[11px] text-faint">
                {schedule.breakLabel}
              </span>
            )}
          </Fragment>
        ))}
      </div>
    </div>
  );
}
