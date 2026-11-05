"use client";

import { useState } from "react";
import { btnPrimary, btnSecondary, card, errorClass, inputClass, labelClass } from "../_components/ui";
import { useRun } from "../_components/use-run";
import { updateBookingSlug } from "./actions";

export function BookingLink({ slug, origin }: { slug: string; origin: string }) {
  const [editing, setEditing] = useState(false);
  const [copied, setCopied] = useState(false);
  const { run, error, pending } = useRun();
  const url = `${origin}/reservar/${slug}`;

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard blocked: the link is still selectable on screen.
    }
  }

  return (
    <section className={`${card} flex flex-col gap-4`}>
      <div>
        <h2 className="text-lg font-semibold">Tu link de reserva</h2>
        <p className="mt-1 text-sm text-muted">
          Compartilo con tus pacientes para que reserven solos. Solo ven los horarios libres.
        </p>
      </div>

      <p className="break-all rounded-xl bg-canvas px-4 py-3 text-[15px] font-medium">{url}</p>

      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={copy} className={btnPrimary}>
          {copied ? "¡Copiado!" : "Copiar link"}
        </button>
        <a href={url} target="_blank" rel="noopener noreferrer" className={btnSecondary}>
          Abrir
        </a>
        {!editing && (
          <button type="button" onClick={() => setEditing(true)} className={btnSecondary}>
            Cambiar link
          </button>
        )}
      </div>

      {editing && (
        <form
          className="flex flex-col gap-3 border-t border-line pt-4"
          action={(formData) =>
            run(
              () => updateBookingSlug(formData),
              () => setEditing(false),
            )
          }
        >
          <label className="flex flex-col gap-1.5">
            <span className={labelClass}>Nuevo link</span>
            <span className="flex items-center gap-2">
              <span className="shrink-0 text-sm text-muted">/reservar/</span>
              <input
                name="slug"
                defaultValue={slug}
                required
                minLength={3}
                maxLength={40}
                autoCapitalize="none"
                spellCheck={false}
                className={inputClass}
              />
            </span>
          </label>
          <p className="text-xs text-muted">
            Letras minúsculas, números y guiones. Si lo cambiás, el link anterior deja de
            funcionar: avisale a tus pacientes.
          </p>
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
      )}
    </section>
  );
}
