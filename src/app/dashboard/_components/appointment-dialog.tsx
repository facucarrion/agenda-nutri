"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useTransition, type FormEvent } from "react";
import { createAppointmentWithPatient, updateAppointment } from "../agenda/actions";
import { dayKey, instant, timeOf } from "../_lib/dates";
import type { DashboardAppointment, TypeOption } from "../_lib/types";
import { btnPrimary, btnSecondary, errorClass, inputClass, labelClass } from "./ui";

export type DialogState =
  | { mode: "create"; day: string }
  | { mode: "edit"; appointment: DashboardAppointment }
  | null;

// Create a turno by hand (the patient is entered right here) or change the
// day, time or service of an existing one. Native <dialog>: Esc closes it.
export function AppointmentDialog({
  state,
  types,
  onClose,
}: {
  state: NonNullable<DialogState>;
  types: TypeOption[];
  onClose: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, startTransition] = useTransition();
  const editing = state.mode === "edit" ? state.appointment : null;

  useEffect(() => {
    ref.current?.showModal();
  }, []);

  const defaultType =
    types.find((t) => t.id === editing?.appointment_type_id)?.id ?? types[0]?.id ?? "";

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const field = (name: string) => String(form.get(name) ?? "").trim();
    const date = field("date");
    const time = field("time");
    if (!date || !time) {
      setError("Elegí el día y la hora.");
      return;
    }

    const data = new FormData();
    data.set("appointment_type_id", field("type"));
    data.set("starts_at", instant(date, time));

    if (editing) {
      data.set("patient_id", editing.patient_id);
    } else {
      data.set("first_name", field("first_name"));
      data.set("last_name", field("last_name"));
      data.set("phone", field("phone"));
      data.set("email", field("email"));
    }

    setError(null);
    startTransition(async () => {
      const result = editing
        ? await updateAppointment(editing.id, data)
        : await createAppointmentWithPatient(data);
      if (result.ok) ref.current?.close();
      else setError(result.error);
    });
  }

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === ref.current) ref.current?.close(); // backdrop click
      }}
      aria-labelledby="appt-title"
      className="m-auto w-[min(560px,calc(100vw-32px))] rounded-[24px] bg-surface p-0 text-ink shadow-[0_24px_60px_rgba(0,0,0,0.18)] backdrop:bg-ink/40 backdrop:backdrop-blur-[2px]"
    >
      <form onSubmit={submit} className="flex flex-col gap-5 p-6 sm:p-8">
        <div>
          <h2 id="appt-title" className="text-2xl font-bold">
            {editing ? "Editar turno" : "Nuevo turno"}
          </h2>
          <p className="mt-1 text-sm text-muted">
            {editing
              ? "Cambiá el día, la hora o el servicio."
              : "Cargá un turno que pediste por teléfono o en persona. Queda confirmado."}
          </p>
        </div>

        {types.length === 0 ? (
          <p role="status" className="rounded-xl bg-warn-soft px-4 py-3 text-sm">
            Primero creá un tipo de consulta en{" "}
            <Link href="/dashboard/availability" className="font-semibold text-primary underline">
              Disponibilidad
            </Link>
            .
          </p>
        ) : (
          <>
            {editing ? (
              <p className="rounded-xl bg-canvas px-4 py-3 text-[15px]">
                <span className="text-muted">Paciente </span>
                <strong>
                  {editing.patients.first_name} {editing.patients.last_name}
                </strong>
              </p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="flex flex-col gap-1.5">
                  <span className={labelClass}>Nombre</span>
                  <input name="first_name" required maxLength={80} autoComplete="off" className={inputClass} />
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className={labelClass}>Apellido</span>
                  <input name="last_name" required maxLength={80} autoComplete="off" className={inputClass} />
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className={labelClass}>Teléfono (WhatsApp)</span>
                  <input
                    name="phone"
                    type="tel"
                    required
                    maxLength={40}
                    placeholder="+54 9 351 555 0101"
                    autoComplete="off"
                    className={inputClass}
                  />
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className={labelClass}>Email (opcional)</span>
                  <input name="email" type="email" maxLength={200} autoComplete="off" className={inputClass} />
                </label>
              </div>
            )}

            <label className="flex flex-col gap-1.5">
              <span className={labelClass}>Servicio</span>
              <select name="type" defaultValue={defaultType} required className={inputClass}>
                {types.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} · {t.duration_minutes} min
                  </option>
                ))}
              </select>
            </label>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="flex flex-col gap-1.5">
                <span className={labelClass}>Día</span>
                <input
                  name="date"
                  type="date"
                  required
                  defaultValue={editing ? dayKey(editing.starts_at) : state.mode === "create" ? state.day : ""}
                  className={inputClass}
                />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className={labelClass}>Hora</span>
                <input
                  name="time"
                  type="time"
                  step={300}
                  required
                  defaultValue={editing ? timeOf(editing.starts_at) : "09:00"}
                  className={inputClass}
                />
              </label>
            </div>

            <p className="text-xs text-muted">
              Podés agendar fuera de tus horarios de atención. Si el horario ya está ocupado, te
              avisamos.
            </p>
          </>
        )}

        {error && (
          <p role="alert" className={errorClass}>
            {error}
          </p>
        )}

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button type="button" onClick={() => ref.current?.close()} className={btnSecondary}>
            Cancelar
          </button>
          <button type="submit" disabled={saving || types.length === 0} className={btnPrimary}>
            {saving ? "Guardando..." : editing ? "Guardar cambios" : "Crear turno"}
          </button>
        </div>
      </form>
    </dialog>
  );
}
