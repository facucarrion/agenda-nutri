"use client";

import { useState } from "react";
import type { AppointmentStatus, DashboardAppointment } from "../_lib/types";
import { WhatsAppIcon } from "./whatsapp-dialog";
import {
  btnBadSolid,
  btnDanger,
  btnPrimary,
  btnSecondary,
  btnWhatsApp,
} from "./ui";

// The buttons each appointment offers, by status. Used by the Turnos list
// and the Agenda day panel. `block` stretches them to the full width.
function StatusActions({
  appointment: a,
  now,
  onStatus,
  onNotify,
  block = false,
}: {
  appointment: DashboardAppointment;
  now: string;
  onStatus: (id: string, status: AppointmentStatus) => void;
  onNotify: (appointment: DashboardAppointment) => void;
  block?: boolean;
}) {
  const [rejecting, setRejecting] = useState(false);
  const past = a.starts_at < now;
  const w = block ? "flex-1" : "";

  if (a.status === "pending") {
    if (rejecting) {
      return (
        <>
          <span className="text-sm text-muted">¿Rechazar?</span>
          <button type="button" className={`${btnSecondary} ${w}`} onClick={() => setRejecting(false)}>
            No
          </button>
          <button
            type="button"
            className={`${btnBadSolid} ${w}`}
            onClick={() => {
              onStatus(a.id, "cancelled");
              setRejecting(false);
            }}
          >
            Sí, rechazar
          </button>
        </>
      );
    }
    return (
      <>
        <button type="button" className={`${btnDanger} ${w}`} onClick={() => setRejecting(true)}>
          Rechazar
        </button>
        <button
          type="button"
          className={`${btnPrimary} ${w}`}
          onClick={() => {
            onStatus(a.id, "confirmed");
            // Same flow as the Figma: right after confirming, offer the message.
            onNotify({ ...a, status: "confirmed" });
          }}
        >
          Confirmar
        </button>
      </>
    );
  }

  if (a.status === "confirmed" && past) {
    return (
      <>
        <button type="button" className={`${btnSecondary} ${w}`} onClick={() => onStatus(a.id, "no_show")}>
          Ausente
        </button>
        <button type="button" className={`${btnPrimary} ${w}`} onClick={() => onStatus(a.id, "completed")}>
          Atendido
        </button>
      </>
    );
  }

  if (a.status === "confirmed" && a.patients.phone) {
    return (
      <button type="button" className={`${btnWhatsApp} ${w}`} onClick={() => onNotify(a)}>
        <WhatsAppIcon className="h-4 w-4" />
        Avisar por WhatsApp
      </button>
    );
  }

  return null;
}

// Status buttons plus "Editar" for turnos that can still change.
export function AppointmentActions({
  appointment: a,
  now,
  onStatus,
  onNotify,
  onEdit,
  block = false,
}: {
  appointment: DashboardAppointment;
  now: string;
  onStatus: (id: string, status: AppointmentStatus) => void;
  onNotify: (appointment: DashboardAppointment) => void;
  onEdit?: (appointment: DashboardAppointment) => void;
  block?: boolean;
}) {
  const editable = onEdit && (a.status === "pending" || a.status === "confirmed");

  return (
    <>
      <StatusActions
        appointment={a}
        now={now}
        onStatus={onStatus}
        onNotify={onNotify}
        block={block}
      />
      {editable && (
        <button
          type="button"
          className={`${btnSecondary} ${block ? "flex-1" : ""}`}
          onClick={() => onEdit(a)}
        >
          Editar
        </button>
      )}
    </>
  );
}
