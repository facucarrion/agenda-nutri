"use client";

import { useState } from "react";
import type { DayOff } from "../_lib/types";
import { addDays, dayKey, instant, shortDay, timeOf } from "../_lib/dates";
import { btnPrimary, card, errorClass, focus, inputClass, labelClass } from "../_components/ui";
import { useRun } from "../_components/use-run";
import { addAvailabilityBlock, deleteAvailabilityBlock } from "./actions";

// "Vie 13 nov", "Lun 2 nov al Vie 6 nov" or "Jue 12 nov · 10:00 a 11:00 hs".
function describe(block: DayOff) {
  const first = dayKey(block.starts_at);
  const last = dayKey(new Date(new Date(block.ends_at).getTime() - 1));
  const wholeDays = timeOf(block.starts_at) === "00:00" && timeOf(block.ends_at) === "00:00";

  if (!wholeDays) {
    return `${shortDay(first)} · ${timeOf(block.starts_at)} a ${timeOf(block.ends_at)} hs`;
  }
  return first === last ? shortDay(first) : `${shortDay(first)} al ${shortDay(last)}`;
}

export function DaysOff({ blocks }: { blocks: DayOff[] }) {
  const [from, setFrom] = useState(() => dayKey(new Date()));
  const [to, setTo] = useState(from);
  const [allDay, setAllDay] = useState(true);
  const [localError, setLocalError] = useState<string | null>(null);
  const { run, error, pending } = useRun();

  function add(formData: FormData) {
    setLocalError(null);
    const reason = String(formData.get("reason") ?? "");
    let startsAt: string;
    let endsAt: string;

    if (allDay) {
      if (to < from) {
        setLocalError("La fecha de fin no puede ser anterior a la de inicio.");
        return;
      }
      startsAt = instant(from, "00:00");
      endsAt = instant(addDays(to, 1), "00:00");
    } else {
      const start = String(formData.get("start_time"));
      const end = String(formData.get("end_time"));
      if (end <= start) {
        setLocalError("La hora de fin debe ser posterior al inicio.");
        return;
      }
      startsAt = instant(from, start);
      endsAt = instant(from, end);
    }

    const data = new FormData();
    data.set("starts_at", startsAt);
    data.set("ends_at", endsAt);
    data.set("reason", reason);
    run(() => addAvailabilityBlock(data));
  }

  return (
    <section className={`${card} flex flex-col gap-5`}>
      <div>
        <h2 className="text-lg font-semibold">Días libres y bloqueos</h2>
        <p className="mt-1 text-sm text-muted">
          Vacaciones, feriados o un trámite. En esos días y horarios nadie puede reservar.
        </p>
      </div>

      {blocks.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-line px-4 py-6 text-center text-sm text-muted">
          No tenés bloqueos cargados.
        </p>
      ) : (
        <ul className="flex flex-col divide-y divide-line rounded-2xl border border-line">
          {blocks.map((block) => (
            <li key={block.id} className="flex items-center justify-between gap-3 px-4 py-3">
              <div className="min-w-0">
                <p className="text-[15px] font-semibold">{describe(block)}</p>
                {block.reason && <p className="truncate text-sm text-muted">{block.reason}</p>}
              </div>
              <button
                type="button"
                disabled={pending}
                onClick={() => run(() => deleteAvailabilityBlock(block.id))}
                className={`shrink-0 rounded-full px-3 py-1.5 text-sm font-semibold text-bad hover:bg-bad-soft disabled:opacity-50 ${focus}`}
              >
                Quitar
              </button>
            </li>
          ))}
        </ul>
      )}

      <form action={add} className="flex flex-col gap-4 rounded-2xl bg-canvas p-4">
        <h3 className="text-[15px] font-semibold">Agregar un bloqueo</h3>

        <label className="flex items-center gap-2.5 text-sm">
          <input
            type="checkbox"
            checked={allDay}
            onChange={(e) => setAllDay(e.target.checked)}
            className="size-5 rounded-md accent-primary"
          />
          Todo el día
        </label>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="flex flex-col gap-1.5">
            <span className={labelClass}>{allDay ? "Desde el" : "Día"}</span>
            <input
              type="date"
              value={from}
              required
              onChange={(e) => {
                setFrom(e.target.value);
                if (to < e.target.value) setTo(e.target.value);
              }}
              className={inputClass}
            />
          </label>
          {allDay ? (
            <label className="flex flex-col gap-1.5">
              <span className={labelClass}>Hasta el (inclusive)</span>
              <input
                type="date"
                value={to}
                min={from}
                required
                onChange={(e) => setTo(e.target.value)}
                className={inputClass}
              />
            </label>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <label className="flex flex-col gap-1.5">
                <span className={labelClass}>Desde</span>
                <input name="start_time" type="time" defaultValue="09:00" required className={inputClass} />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className={labelClass}>Hasta</span>
                <input name="end_time" type="time" defaultValue="10:00" required className={inputClass} />
              </label>
            </div>
          )}
        </div>

        <label className="flex flex-col gap-1.5">
          <span className={labelClass}>Motivo (opcional, solo lo ves vos)</span>
          <input name="reason" maxLength={200} placeholder="Vacaciones" className={inputClass} />
        </label>

        {(localError || error) && (
          <p role="alert" className={errorClass}>
            {localError ?? error}
          </p>
        )}

        <button type="submit" disabled={pending} className={`${btnPrimary} self-start`}>
          {pending ? "Guardando..." : "Agregar"}
        </button>
      </form>
    </section>
  );
}
