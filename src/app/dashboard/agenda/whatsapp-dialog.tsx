"use client";

import { useEffect, useRef, useState } from "react";
import { TIMEZONE, type MockAppointment } from "./mock-data";

export function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className={className}>
      <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2c-1.5 0-3-.4-4.3-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.4.1-.7.3-.2.3-.9.9-.9 2.2s.9 2.5 1 2.7c.1.2 1.8 2.8 4.4 3.9 1.6.7 2.3.8 3.1.6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.3-.2-.5-.3Z" />
    </svg>
  );
}

const longDate = new Intl.DateTimeFormat("es-AR", {
  timeZone: TIMEZONE,
  weekday: "long",
  day: "numeric",
  month: "long",
});
const time = new Intl.DateTimeFormat("es-AR", {
  timeZone: TIMEZONE,
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

function defaultMessage(a: MockAppointment) {
  const when = `el ${longDate.format(new Date(a.starts_at)).replace(",", "")} a las ${time.format(new Date(a.starts_at))} hs`;
  const virtual = /telemedicina|virtual|online/i.test(a.appointment_types.name);
  return [
    `Hola ${a.patients.first_name}, te escribo de NutriSol.`,
    `Te confirmo tu turno de ${a.appointment_types.name} ${when}.`,
    virtual
      ? "Un rato antes te paso el link de la videollamada."
      : "Si no podés venir, avisame por acá así libero el horario.",
    "¡Nos vemos!",
  ].join(" ");
}

// wa.me only accepts digits, with the country code and no "+".
function waLink(phone: string, text: string) {
  return `https://wa.me/${phone.replace(/\D/g, "")}?text=${encodeURIComponent(text)}`;
}

// Native <dialog>: Esc closes it and focus stays inside while open.
export function WhatsAppDialog({
  appointment,
  onClose,
}: {
  appointment: MockAppointment;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const [message, setMessage] = useState(() => defaultMessage(appointment));
  const phone = appointment.patients.phone ?? "";

  useEffect(() => {
    ref.current?.showModal();
  }, []);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === ref.current) ref.current?.close(); // backdrop click
      }}
      aria-labelledby="wa-title"
      className="m-auto w-[min(540px,calc(100vw-32px))] rounded-[24px] bg-surface p-0 text-ink shadow-[0_24px_60px_rgba(0,0,0,0.18)] backdrop:bg-ink/40 backdrop:backdrop-blur-[2px]"
    >
      <div className="flex flex-col gap-5 p-6 sm:p-8">
        <div>
          <h2 id="wa-title" className="text-2xl font-bold">
            Avisar a {appointment.patients.first_name} {appointment.patients.last_name}
          </h2>
          <p className="mt-1 text-sm text-muted">
            Se abre WhatsApp con este mensaje. Podés editarlo antes de enviarlo.
          </p>
        </div>

        <p className="flex items-center gap-2 rounded-xl bg-canvas px-3.5 py-2.5 text-sm">
          <span className="text-muted">Para</span>
          <span className="font-semibold">{phone}</span>
        </p>

        <label className="flex flex-col gap-2">
          <span className="sr-only">Mensaje</span>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={5}
            className="resize-none rounded-2xl border border-line bg-surface p-4 text-[15px] leading-relaxed outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </label>

        <p className="text-xs text-muted">
          Se abre con un enlace de WhatsApp: el mensaje no se manda solo, lo enviás vos.
        </p>

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={() => ref.current?.close()}
            className="inline-flex h-11 items-center justify-center rounded-full border border-line px-5 text-sm font-semibold hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          >
            Ahora no
          </button>
          <a
            href={waLink(phone, message)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => ref.current?.close()}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-ok px-5 text-sm font-semibold text-white hover:bg-ok/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ok/40"
          >
            <WhatsAppIcon className="h-4 w-4" />
            Abrir WhatsApp
          </a>
        </div>
      </div>
    </dialog>
  );
}
