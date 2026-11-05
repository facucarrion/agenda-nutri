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
  // The email typed belongs to a patient with another name: the data sent is
  // kept so the choice can be sent with it.
  const [conflict, setConflict] = useState<{ patientName: string; data: FormData } | null>(null);
  const editing = state.mode === "edit" ? state.appointment : null;

  useEffect(() => {
    ref.current?.showModal();
  }, []);

  // A turno keeps its service even if that type was paused later: it stays in
  // the list (marked) so saving a new time does not switch it to another one.
  const currentTypeId = editing?.appointment_type_id ?? null;
  const pausedCurrent =
    currentTypeId && editing?.appointment_types && !types.some((t) => t.id === currentTypeId)
      ? {
          id: currentTypeId,
          name: `${editing.appointment_types.name} (pausado)`,
          duration_minutes: editing.appointment_types.duration_minutes,
        }
      : null;
  const options = pausedCurrent ? [pausedCurrent, ...types] : types;

  // Editing a turno whose type was deleted: no default, the service must be
  // chosen on purpose instead of silently taking the first one.
  const defaultType = editing ? (currentTypeId ?? "") : (types[0]?.id ?? "");

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

    send(data);
  }

  function send(data: FormData) {
    setError(null);
    setConflict(null);
    startTransition(async () => {
      const result = editing
        ? await updateAppointment(editing.id, data)
        : await createAppointmentWithPatient(data);
      if (result.ok) ref.current?.close();
      else if (result.conflict) setConflict({ patientName: result.conflict.patientName, data });
      else setError(result.error);
    });
  }

  // The nutritionist's answer to "that email is someone else's".
  function resolve(choice: "existing" | "new") {
    if (!conflict) return;
    const data = new FormData();
    conflict.data.forEach((value, key) => data.set(key, value));
    data.set("patient_choice", choice);
    send(data);
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
      <form
        onSubmit={submit}
        onChange={() => setConflict(null)} // changed data: ask again on submit
        className="flex flex-col gap-5 p-6 sm:p-8"
      >
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

        {options.length === 0 ? (
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
                {defaultType === "" && (
                  <option value="" disabled>
                    Elegí un servicio (el anterior se eliminó)
                  </option>
                )}
                {options.map((t) => (
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

        {conflict && (
          <div role="alert" className="flex flex-col gap-3 rounded-xl bg-warn-soft px-4 py-3 text-sm">
            <p>
              Ese email ya es de <strong>{conflict.patientName}</strong>. ¿Es la misma persona?
            </p>
            <div className="flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                disabled={saving}
                onClick={() => resolve("existing")}
                className={btnSecondary}
              >
                Sí, agendar a {conflict.patientName}
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={() => resolve("new")}
                className={btnSecondary}
              >
                No, es otra persona
              </button>
            </div>
            <p className="text-xs text-muted">
              Si es la misma, el turno va a su ficha con sus datos de contacto. Si es otra, se
              guarda como paciente nuevo sin email (cada email puede ser de un solo paciente).
            </p>
          </div>
        )}

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button type="button" onClick={() => ref.current?.close()} className={btnSecondary}>
            Cancelar
          </button>
          <button
            type="submit"
            disabled={saving || options.length === 0 || conflict !== null}
            className={btnPrimary}
          >
            {saving ? "Guardando..." : editing ? "Guardar cambios" : "Crear turno"}
          </button>
        </div>
      </form>
    </dialog>
  );
}
