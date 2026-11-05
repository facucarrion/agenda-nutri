"use client";

import { useState } from "react";
import { btnPrimary, card, errorClass, inputClass, labelClass } from "../_components/ui";
import { useRun } from "../_components/use-run";
import { updateBookingSettings } from "./actions";

const SLOT_OPTIONS = [15, 20, 30, 45, 60, 90];
const NOTICE_OPTIONS = [0, 1, 2, 4, 6, 12, 24, 48, 72, 168];

function noticeLabel(hours: number) {
  if (hours === 0) return "Sin anticipación mínima";
  if (hours < 24) return `${hours} ${hours === 1 ? "hora" : "horas"}`;
  const days = hours / 24;
  return Number.isInteger(days) ? `${days} ${days === 1 ? "día" : "días"}` : `${hours} horas`;
}

// Keeps a value that is not in the list (set earlier) selectable.
const withCurrent = (options: number[], current: number) =>
  options.includes(current) ? options : [...options, current].sort((a, b) => a - b);

export function BookingSettings({
  slotMinutes,
  minNoticeHours,
}: {
  slotMinutes: number;
  minNoticeHours: number;
}) {
  const { run, error, pending } = useRun();
  const [saved, setSaved] = useState(false);

  return (
    <section className={`${card} flex flex-col gap-5`}>
      <div>
        <h2 className="text-lg font-semibold">Reglas de reserva</h2>
        <p className="mt-1 text-sm text-muted">Cómo se ofrecen los horarios a tus pacientes.</p>
      </div>

      <form
        action={(formData) => {
          setSaved(false);
          run(
            () => updateBookingSettings(formData),
            () => setSaved(true),
          );
        }}
        className="flex flex-col gap-4"
      >
        <label className="flex flex-col gap-1.5">
          <span className={labelClass}>Un turno puede empezar cada</span>
          <select name="slot_minutes" defaultValue={slotMinutes} className={inputClass}>
            {withCurrent(SLOT_OPTIONS, slotMinutes).map((m) => (
              <option key={m} value={m}>
                {m} minutos
              </option>
            ))}
          </select>
          <span className="text-xs text-muted">
            Define los horarios que ve el paciente (por ejemplo 09:00, 09:45, 10:30). La duración
            de cada consulta sale de su tipo.
          </span>
        </label>

        <label className="flex flex-col gap-1.5">
          <span className={labelClass}>Anticipación mínima para reservar</span>
          <select name="min_notice_hours" defaultValue={minNoticeHours} className={inputClass}>
            {withCurrent(NOTICE_OPTIONS, minNoticeHours).map((h) => (
              <option key={h} value={h}>
                {noticeLabel(h)}
              </option>
            ))}
          </select>
          <span className="text-xs text-muted">
            Evita reservas de último momento. No aplica a los turnos que cargás vos.
          </span>
        </label>

        {error && (
          <p role="alert" className={errorClass}>
            {error}
          </p>
        )}
        {saved && !error && !pending && (
          <p role="status" className="text-sm font-medium text-primary">
            Cambios guardados.
          </p>
        )}

        <button type="submit" disabled={pending} className={`${btnPrimary} self-start`}>
          {pending ? "Guardando..." : "Guardar"}
        </button>
      </form>
    </section>
  );
}
