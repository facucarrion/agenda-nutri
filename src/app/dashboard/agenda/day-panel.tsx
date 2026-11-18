import { MODALITY_LABEL, ModalityIcon } from "@/components/modality";
import type { AppointmentStatus, DashboardAppointment } from "../_lib/types";
import { longDay, timeOf } from "../_lib/dates";
import { AppointmentActions } from "../_components/appointment-actions";
import { STATUS, btnPrimary, fullName } from "../_components/ui";
import type { DayInfo } from "./agenda-view";

// Status colour of each turno's left border.
const BORDER: Record<AppointmentStatus, string> = {
  pending: "border-warn",
  confirmed: "border-ok",
  completed: "border-faint",
  no_show: "border-faint",
  cancelled: "border-bad",
};

export function DayPanel({
  day,
  now,
  onStatus,
  onNotify,
  onNew,
  onEdit,
}: {
  day: DayInfo;
  now: string;
  onStatus: (id: string, status: AppointmentStatus) => void;
  onNotify: (appointment: DashboardAppointment) => void;
  onNew: (day: string) => void;
  onEdit: (appointment: DashboardAppointment) => void;
}) {
  const total = day.appointments.length;
  const pending = day.appointments.filter((a) => a.status === "pending").length;

  let summary = `${total === 1 ? "1 turno" : `${total} turnos`}`;
  if (pending) summary += ` · ${pending === 1 ? "1 pendiente" : `${pending} pendientes`}`;

  let empty = "No hay turnos este día.";
  if (day.blocked) empty = "Bloqueaste este día: no se pueden reservar turnos.";
  else if (!day.works) empty = "Este día no atendés.";

  return (
    <aside
      aria-live="polite"
      className="rounded-[24px] border border-line bg-surface p-4 sm:px-3.5 sm:py-5 lg:sticky lg:top-6 lg:max-h-[calc(100vh-3rem)] lg:overflow-y-auto"
    >
      <h2 className="text-base font-bold">{longDay(day.key)}</h2>
      <p className="mt-0.5 text-sm text-muted">{total ? summary : day.today ? "Hoy" : "Sin turnos"}</p>
      <button type="button" onClick={() => onNew(day.key)} className={`${btnPrimary} mt-2.5 w-full`}>
        + Nuevo turno
      </button>

      {total === 0 ? (
        <p className="mt-4 rounded-2xl border border-dashed border-line px-4 py-8 text-center text-sm text-muted">
          {empty}
        </p>
      ) : (
        <ul className="mt-3 flex flex-col gap-2">
          {day.appointments.map((a) => {
            const status = STATUS[a.status];
            return (
              // Two lines per turno: time and patient, then type and modality.
              // The left border carries the status colour; icons sit on the right.
              // The text keeps at least 8rem, so a wide confirm step ("¿Cancelar
              // turno?") drops to its own line instead of hiding the name.
              <li
                key={a.id}
                className={`flex flex-wrap items-center gap-x-2 gap-y-1.5 rounded-xl border-l-[3px] bg-canvas py-2.5 pl-3 pr-1 ${BORDER[a.status]} ${
                  a.status === "cancelled" || a.status === "no_show" ? "opacity-70" : ""
                }`}
              >
                <div className="min-w-0 grow basis-32">
                  <p className="flex min-w-0 items-baseline gap-2">
                    <span className="shrink-0 font-bold tabular-nums">{timeOf(a.starts_at)}</span>
                    <span className="min-w-0 break-words font-semibold leading-snug">{fullName(a)}</span>
                  </p>
                  <p className="mt-0.5 flex min-w-0 items-center gap-1.5 text-xs text-muted">
                    <span className="sr-only">{status.label}.</span>
                    <span className="truncate">{a.appointment_types.name}</span>
                    {a.modality && (
                      <>
                        <span aria-hidden>·</span>
                        <span className="inline-flex shrink-0 items-center gap-1">
                          <ModalityIcon modality={a.modality} className="h-3.5 w-3.5" />
                          {MODALITY_LABEL[a.modality]}
                        </span>
                      </>
                    )}
                  </p>
                </div>
                <div className="ml-auto flex shrink-0 items-center empty:hidden">
                  <AppointmentActions
                    appointment={a}
                    now={now}
                    onStatus={onStatus}
                    onNotify={onNotify}
                    onEdit={onEdit}
                    compact
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </aside>
  );
}
