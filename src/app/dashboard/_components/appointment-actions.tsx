"use client";

import { useState, type ReactNode } from "react";
import type { AppointmentStatus, DashboardAppointment } from "../_lib/types";
import { WhatsAppIcon } from "./whatsapp-dialog";
import {
  btnBadSolid,
  btnDanger,
  btnPrimary,
  btnSecondary,
  focus,
} from "./ui";

type IconProps = { className?: string };

function Svg({ className = "h-4 w-4", children }: IconProps & { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      focusable="false"
      className={className}
    >
      {children}
    </svg>
  );
}

export function PencilIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16v4z" />
      <path d="m13.5 6.5 4 4" />
    </Svg>
  );
}

function CheckIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="m5 12.5 4.5 4.5L19 7.5" />
    </Svg>
  );
}

function XIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M6 6l12 12M18 6 6 18" />
    </Svg>
  );
}

function TrashIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M4 7h16M10 11v6M14 11v6" />
      <path d="M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12" />
      <path d="M9 7V4.5A1.5 1.5 0 0 1 10.5 3h3A1.5 1.5 0 0 1 15 4.5V7" />
    </Svg>
  );
}

// Person with a cross: the patient did not show up.
function AbsentIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="9" cy="8" r="3.5" />
      <path d="M2.5 20a6.5 6.5 0 0 1 13 0" />
      <path d="m17 9 4 4m0-4-4 4" />
    </Svg>
  );
}

// Ghost icons: no fill or border until hover, so a list of turnos stays calm.
const TONES = {
  neutral: "text-muted hover:bg-line/60 hover:text-primary",
  primary: "text-primary hover:bg-primary-soft",
  danger: "text-bad hover:bg-bad-soft",
  whatsapp: "text-ok hover:bg-ok-soft",
  trash: "text-muted hover:bg-bad-soft hover:text-bad",
};

// Round icon-only button. The label is its accessible name and also shows
// as a tooltip on hover or keyboard focus. The tooltip hangs from the right
// edge so it never spills out of the narrow, scrollable day panel.
function IconAction({
  label,
  tone = "neutral",
  onClick,
  children,
}: {
  label: string;
  tone?: keyof typeof TONES;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <span className="group relative inline-flex">
      <button
        type="button"
        aria-label={label}
        onClick={onClick}
        className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors ${TONES[tone]} ${focus}`}
      >
        {children}
      </button>
      <span
        aria-hidden
        className="pointer-events-none absolute bottom-full right-0 z-10 mb-1.5 whitespace-nowrap rounded-lg bg-ink px-2 py-1 text-xs font-medium text-white opacity-0 shadow-sm transition-opacity duration-150 group-hover:opacity-100 group-has-[:focus-visible]:opacity-100 motion-reduce:transition-none"
      >
        {label}
      </span>
    </span>
  );
}

// The buttons each appointment offers, by status. Used by the Turnos list
// and the Agenda day panel. `compact` turns the decisions (confirmar,
// rechazar, atendido, ausente) into icons too, for the narrow day panel.
function StatusActions({
  appointment: a,
  now,
  onStatus,
  onNotify,
  compact = false,
}: {
  appointment: DashboardAppointment;
  now: string;
  onStatus: (id: string, status: AppointmentStatus) => void;
  onNotify: (appointment: DashboardAppointment) => void;
  compact?: boolean;
}) {
  const [rejecting, setRejecting] = useState(false);
  const past = a.starts_at < now;
  const small = compact ? "h-8 px-3 text-xs" : "";

  if (a.status === "pending") {
    if (rejecting) {
      return (
        <>
          <span className="text-sm text-muted">¿Rechazar?</span>
          <button type="button" className={`${btnSecondary} ${small}`} onClick={() => setRejecting(false)}>
            No
          </button>
          <button
            type="button"
            className={`${btnBadSolid} ${small}`}
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
    const confirm = () => {
      onStatus(a.id, "confirmed");
      // Same flow as the Figma: right after confirming, offer the message.
      onNotify({ ...a, status: "confirmed" });
    };
    if (compact) {
      return (
        <>
          <IconAction label="Rechazar" tone="danger" onClick={() => setRejecting(true)}>
            <XIcon />
          </IconAction>
          <IconAction label="Confirmar" tone="primary" onClick={confirm}>
            <CheckIcon />
          </IconAction>
        </>
      );
    }
    return (
      <>
        <button type="button" className={btnDanger} onClick={() => setRejecting(true)}>
          Rechazar
        </button>
        <button type="button" className={btnPrimary} onClick={confirm}>
          Confirmar
        </button>
      </>
    );
  }

  if (a.status === "confirmed" && past) {
    if (compact) {
      return (
        <>
          <IconAction label="Marcar ausente" onClick={() => onStatus(a.id, "no_show")}>
            <AbsentIcon />
          </IconAction>
          <IconAction label="Marcar atendido" tone="primary" onClick={() => onStatus(a.id, "completed")}>
            <CheckIcon />
          </IconAction>
        </>
      );
    }
    return (
      <>
        <button type="button" className={btnSecondary} onClick={() => onStatus(a.id, "no_show")}>
          Ausente
        </button>
        <button type="button" className={btnPrimary} onClick={() => onStatus(a.id, "completed")}>
          Atendido
        </button>
      </>
    );
  }

  if (a.status === "confirmed" && a.patients.phone) {
    return (
      <IconAction label="Avisar por WhatsApp" tone="whatsapp" onClick={() => onNotify(a)}>
        <WhatsAppIcon className="h-4 w-4" />
      </IconAction>
    );
  }

  return null;
}

// Status buttons plus the pencil to edit turnos that can still change.
export function AppointmentActions({
  appointment: a,
  now,
  onStatus,
  onNotify,
  onEdit,
  compact = false,
}: {
  appointment: DashboardAppointment;
  now: string;
  onStatus: (id: string, status: AppointmentStatus) => void;
  onNotify: (appointment: DashboardAppointment) => void;
  onEdit?: (appointment: DashboardAppointment) => void;
  compact?: boolean;
}) {
  const [cancelling, setCancelling] = useState(false);
  const editable = onEdit && (a.status === "pending" || a.status === "confirmed");
  // Pending turnos already have "Rechazar"; the bin is for confirmed ones.
  const cancellable = a.status === "confirmed";
  const small = compact ? "h-8 px-3 text-xs" : "";

  // Cancelling frees the slot but keeps the turno in the history, so it asks first.
  if (cancelling) {
    return (
      <>
        <span className="text-sm text-muted">¿Cancelar turno?</span>
        <button type="button" className={`${btnSecondary} ${small}`} onClick={() => setCancelling(false)}>
          No
        </button>
        <button
          type="button"
          className={`${btnBadSolid} ${small}`}
          onClick={() => {
            onStatus(a.id, "cancelled");
            setCancelling(false);
          }}
        >
          Sí, cancelar
        </button>
      </>
    );
  }

  return (
    <>
      <StatusActions
        appointment={a}
        now={now}
        onStatus={onStatus}
        onNotify={onNotify}
        compact={compact}
      />
      {editable && (
        <IconAction label="Editar" onClick={() => onEdit(a)}>
          <PencilIcon />
        </IconAction>
      )}
      {cancellable && (
        <IconAction label="Cancelar turno" tone="trash" onClick={() => setCancelling(true)}>
          <TrashIcon />
        </IconAction>
      )}
    </>
  );
}
