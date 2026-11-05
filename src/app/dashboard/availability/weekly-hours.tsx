"use client";

import { useState } from "react";
import type { WeeklyRule } from "../_lib/types";
import { btnPrimary, card, errorClass, focus, inputClass, labelClass } from "../_components/ui";
import { useRun } from "../_components/use-run";
import { addAvailabilityRule, deleteAvailabilityRule } from "./actions";

// Monday first. `day` is the stored weekday (0 = Sunday).
const DAYS = [
  { day: 1, label: "Lunes", short: "Lun" },
  { day: 2, label: "Martes", short: "Mar" },
  { day: 3, label: "Miércoles", short: "Mié" },
  { day: 4, label: "Jueves", short: "Jue" },
  { day: 5, label: "Viernes", short: "Vie" },
  { day: 6, label: "Sábado", short: "Sáb" },
  { day: 0, label: "Domingo", short: "Dom" },
];

export function WeeklyHours({ rules }: { rules: WeeklyRule[] }) {
  const [selected, setSelected] = useState<number[]>([1, 2, 3, 4, 5]);
  const { run, error, pending } = useRun();

  function toggle(day: number) {
    setSelected((list) => (list.includes(day) ? list.filter((d) => d !== day) : [...list, day]));
  }

  function add(formData: FormData) {
    const start = String(formData.get("start_time"));
    const end = String(formData.get("end_time"));
    if (selected.length === 0) return;

    run(async () => {
      for (const day of DAYS.filter((d) => selected.includes(d.day))) {
        const data = new FormData();
        data.set("weekday", String(day.day));
        data.set("start_time", start);
        data.set("end_time", end);
        const result = await addAvailabilityRule(data);
        if (!result.ok) return { ok: false, error: `${day.label}: ${result.error}` };
      }
      return { ok: true };
    });
  }

  return (
    <section className={`${card} flex flex-col gap-5`}>
      <div>
        <h2 className="text-lg font-semibold">Días y horarios de atención</h2>
        <p className="mt-1 text-sm text-muted">
          Tus pacientes solo pueden reservar dentro de estos horarios. Podés tener más de un
          horario por día, por ejemplo mañana y tarde.
        </p>
      </div>

      <ul className="flex flex-col divide-y divide-line rounded-2xl border border-line">
        {DAYS.map(({ day, label }) => {
          const ranges = rules.filter((r) => r.weekday === day);
          return (
            <li key={day} className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3">
              <span className="w-24 shrink-0 text-[15px] font-semibold">{label}</span>
              {ranges.length === 0 ? (
                <span className="text-sm text-faint">No atendés</span>
              ) : (
                <ul className="flex flex-wrap gap-2">
                  {ranges.map((r) => (
                    <li
                      key={r.id}
                      className="inline-flex items-center gap-1.5 rounded-full bg-primary-soft py-1 pl-3 pr-1.5 text-sm font-medium text-primary"
                    >
                      {r.start_time} a {r.end_time} hs
                      <button
                        type="button"
                        disabled={pending}
                        onClick={() => run(() => deleteAvailabilityRule(r.id))}
                        aria-label={`Quitar el horario de ${r.start_time} a ${r.end_time} del ${label.toLowerCase()}`}
                        className={`flex size-6 items-center justify-center rounded-full text-primary hover:bg-primary/10 disabled:opacity-50 ${focus}`}
                      >
                        ×
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          );
        })}
      </ul>

      <form action={add} className="flex flex-col gap-4 rounded-2xl bg-canvas p-4">
        <h3 className="text-[15px] font-semibold">Agregar un horario</h3>

        <fieldset className="flex flex-col gap-2">
          <legend className={labelClass}>Días</legend>
          <div className="flex flex-wrap gap-2">
            {DAYS.map(({ day, short, label }) => {
              const on = selected.includes(day);
              return (
                <button
                  key={day}
                  type="button"
                  aria-pressed={on}
                  aria-label={label}
                  onClick={() => toggle(day)}
                  className={`h-9 min-w-12 rounded-full px-3 text-sm font-semibold transition-colors ${focus} ${
                    on
                      ? "bg-primary text-white"
                      : "border border-line bg-surface text-ink hover:border-primary"
                  }`}
                >
                  {short}
                </button>
              );
            })}
          </div>
        </fieldset>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="flex flex-col gap-1.5">
            <span className={labelClass}>Desde</span>
            <input name="start_time" type="time" defaultValue="09:00" required className={inputClass} />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className={labelClass}>Hasta</span>
            <input name="end_time" type="time" defaultValue="13:00" required className={inputClass} />
          </label>
        </div>

        {error && (
          <p role="alert" className={errorClass}>
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={pending || selected.length === 0}
          className={`${btnPrimary} self-start`}
        >
          {pending ? "Guardando..." : "Agregar"}
        </button>
      </form>
    </section>
  );
}
