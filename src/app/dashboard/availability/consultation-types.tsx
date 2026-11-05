"use client";

import { useState } from "react";
import type { ConsultationType } from "../_lib/types";
import {
  btnBadSolid,
  btnDanger,
  btnPrimary,
  btnSecondary,
  card,
  errorClass,
  focus,
  inputClass,
  labelClass,
} from "../_components/ui";
import { useRun } from "../_components/use-run";
import {
  createAppointmentType,
  deleteAppointmentType,
  updateAppointmentType,
} from "./actions";

function TypeRow({ type }: { type: ConsultationType }) {
  const [editing, setEditing] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const { run, error, pending } = useRun();

  function save(formData: FormData) {
    formData.set("is_active", String(type.is_active));
    run(
      () => updateAppointmentType(type.id, formData),
      () => setEditing(false),
    );
  }

  function toggleActive() {
    const data = new FormData();
    data.set("name", type.name);
    data.set("duration_minutes", String(type.duration_minutes));
    data.set("is_active", String(!type.is_active));
    run(() => updateAppointmentType(type.id, data));
  }

  if (editing) {
    return (
      <li className="px-4 py-3">
        <form action={save} className="flex flex-col gap-3">
          <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_140px]">
            <label className="flex flex-col gap-1.5">
              <span className={labelClass}>Nombre</span>
              <input name="name" defaultValue={type.name} required maxLength={80} className={inputClass} />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className={labelClass}>Duración (min)</span>
              <input
                name="duration_minutes"
                type="number"
                min={10}
                max={240}
                step={5}
                defaultValue={type.duration_minutes}
                required
                className={inputClass}
              />
            </label>
          </div>
          {error && (
            <p role="alert" className={errorClass}>
              {error}
            </p>
          )}
          <div className="flex gap-2">
            <button type="submit" disabled={pending} className={btnPrimary}>
              {pending ? "Guardando..." : "Guardar"}
            </button>
            <button type="button" onClick={() => setEditing(false)} className={btnSecondary}>
              Cancelar
            </button>
          </div>
        </form>
      </li>
    );
  }

  return (
    <li className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3">
      <div className={`w-full min-w-0 ${type.is_active ? "" : "opacity-60"}`}>
        <p className="break-words text-[15px] font-semibold">{type.name}</p>
        <p className="text-sm text-muted">
          {type.duration_minutes} min{type.is_active ? "" : " · Pausado: no se puede reservar"}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {confirmingDelete ? (
          <>
            <span className="text-sm text-muted">¿Eliminar?</span>
            <button type="button" className={btnSecondary} onClick={() => setConfirmingDelete(false)}>
              No
            </button>
            <button
              type="button"
              disabled={pending}
              className={btnBadSolid}
              onClick={() => run(() => deleteAppointmentType(type.id))}
            >
              Sí, eliminar
            </button>
          </>
        ) : (
          <>
            <button type="button" disabled={pending} onClick={toggleActive} className={btnSecondary}>
              {type.is_active ? "Pausar" : "Activar"}
            </button>
            <button type="button" onClick={() => setEditing(true)} className={btnSecondary}>
              Editar
            </button>
            <button type="button" onClick={() => setConfirmingDelete(true)} className={btnDanger}>
              Eliminar
            </button>
          </>
        )}
      </div>

      {error && (
        <p role="alert" className={`${errorClass} w-full`}>
          {error}
        </p>
      )}
    </li>
  );
}

export function ConsultationTypes({ types }: { types: ConsultationType[] }) {
  const { run, error, pending } = useRun();
  const hasActive = types.some((t) => t.is_active);

  return (
    <section className={`${card} flex flex-col gap-5`}>
      <div>
        <h2 className="text-lg font-semibold">Tipos de consulta</h2>
        <p className="mt-1 text-sm text-muted">
          Lo que tus pacientes eligen al reservar, con su duración. Por ejemplo &quot;Primera
          consulta · 60 min&quot; y &quot;Seguimiento · 30 min&quot;.
        </p>
      </div>

      {!hasActive && (
        <p role="status" className="rounded-xl bg-warn-soft px-4 py-3 text-sm text-ink">
          Todavía no tenés ningún tipo de consulta activo, así que nadie puede reservar online.
          Creá uno para empezar.
        </p>
      )}

      {types.length > 0 && (
        <ul className="flex flex-col divide-y divide-line rounded-2xl border border-line">
          {types.map((type) => (
            <TypeRow key={`${type.id}:${type.name}:${type.duration_minutes}:${type.is_active}`} type={type} />
          ))}
        </ul>
      )}

      <form
        action={(formData) => run(() => createAppointmentType(formData))}
        className="flex flex-col gap-4 rounded-2xl bg-canvas p-4"
      >
        <h3 className="text-[15px] font-semibold">Agregar un tipo de consulta</h3>
        <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_140px]">
          <label className="flex flex-col gap-1.5">
            <span className={labelClass}>Nombre</span>
            <input
              name="name"
              required
              maxLength={80}
              placeholder="Primera consulta"
              className={inputClass}
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className={labelClass}>Duración (min)</span>
            <input
              name="duration_minutes"
              type="number"
              min={10}
              max={240}
              step={5}
              defaultValue={45}
              required
              className={inputClass}
            />
          </label>
        </div>
        {error && (
          <p role="alert" className={errorClass}>
            {error}
          </p>
        )}
        <button type="submit" disabled={pending} className={`${btnPrimary} self-start ${focus}`}>
          {pending ? "Guardando..." : "Agregar"}
        </button>
      </form>
    </section>
  );
}
