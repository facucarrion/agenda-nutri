"use client";

import { useRef, useState } from "react";
import { PickerInput } from "@/components/picker-input";
import { MODALITY_LABEL, ModalityIcon } from "@/components/modality";
import type { RuleModality, WeeklyRule } from "../_lib/types";
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

const MODALITIES: { value: RuleModality; label: string }[] = [
  { value: "in_person", label: "Presencial" },
  { value: "virtual", label: "Virtual" },
  { value: "both", label: "Ambas" },
];

const pill = (on: boolean) =>
  `h-9 min-w-12 rounded-full px-3 text-sm font-semibold transition-colors ${focus} ${
    on ? "bg-primary text-white" : "border border-line bg-surface text-ink hover:border-primary"
  }`;

export function WeeklyHours({ rules }: { rules: WeeklyRule[] }) {
  const [selected, setSelected] = useState<number[]>([1, 2, 3, 4, 5]);
  const [modality, setModality] = useState<RuleModality>("both");
  // Swipe on the modality toggle: start point, and whether the swipe already
  // picked an option (the click that follows it is then ignored).
  const swipeX = useRef<number | null>(null);
  const swiped = useRef(false);
  const modalityIndex = MODALITIES.findIndex((m) => m.value === modality);

  function stepModality(delta: number) {
    const next = MODALITIES[modalityIndex + delta];
    if (next) setModality(next.value);
  }
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
        data.set("modality", modality);
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
                      <span className="sr-only">{MODALITY_LABEL[r.modality]}: </span>
                      <span title={MODALITY_LABEL[r.modality]} className="inline-flex">
                        <ModalityIcon modality={r.modality} className="h-3.5 w-3.5" />
                      </span>
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
                  className={pill(on)}
                >
                  {short}
                </button>
              );
            })}
          </div>
        </fieldset>

        <fieldset className="flex flex-col gap-2">
          <legend className={labelClass}>Modalidad</legend>
          {/* Sliding toggle, same look as Mes | Semana in the agenda: tap an
              option, swipe left or right, or use the arrow keys. */}
          <div
            role="radiogroup"
            aria-label="Modalidad"
            onPointerDown={(e) => {
              swipeX.current = e.clientX;
              swiped.current = false;
            }}
            onPointerUp={(e) => {
              if (swipeX.current === null) return;
              const dx = e.clientX - swipeX.current;
              swipeX.current = null;
              if (Math.abs(dx) <= 24) return;
              swiped.current = true;
              stepModality(dx > 0 ? 1 : -1);
            }}
            onPointerCancel={() => {
              swipeX.current = null;
            }}
            onKeyDown={(e) => {
              if (e.key === "ArrowRight") stepModality(1);
              if (e.key === "ArrowLeft") stepModality(-1);
            }}
            className="relative grid w-full max-w-md touch-pan-y select-none grid-cols-3 rounded-full border border-line bg-surface p-1"
          >
            <span
              aria-hidden
              style={{ transform: `translateX(${modalityIndex * 100}%)` }}
              className="absolute inset-y-1 left-1 w-[calc((100%-8px)/3)] rounded-full bg-primary shadow-sm transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] motion-reduce:transition-none"
            />
            {MODALITIES.map((m) => {
              const on = modality === m.value;
              return (
                <button
                  key={m.value}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  tabIndex={on ? 0 : -1}
                  onClick={() => {
                    if (swiped.current) swiped.current = false;
                    else setModality(m.value);
                  }}
                  className={`relative z-10 inline-flex h-9 items-center justify-center gap-1.5 rounded-full px-2 text-sm font-semibold transition-colors duration-300 motion-reduce:transition-none ${focus} ${
                    on ? "text-white" : "text-muted hover:text-ink"
                  }`}
                >
                  <ModalityIcon modality={m.value} className="hidden h-4 w-4 shrink-0 min-[400px]:block" />
                  {m.label}
                </button>
              );
            })}
          </div>
        </fieldset>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="flex flex-col gap-1.5">
            <span className={labelClass}>Desde</span>
            <PickerInput name="start_time" type="time" defaultValue="09:00" required className={inputClass} />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className={labelClass}>Hasta</span>
            <PickerInput name="end_time" type="time" defaultValue="13:00" required className={inputClass} />
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
