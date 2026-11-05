import type { AppointmentStatus, DashboardAppointment } from "../_lib/types";
import { longDay, timeOf } from "../_lib/dates";
import { AppointmentActions } from "../_components/appointment-actions";
import { STATUS, btnPrimary } from "../_components/ui";
import type { DayInfo } from "./agenda-view";

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
      className="rounded-[24px] border border-line bg-surface p-5 lg:sticky lg:top-6 lg:max-h-[calc(100vh-3rem)] lg:overflow-y-auto"
    >
      <h2 className="text-lg font-bold">{longDay(day.key)}</h2>
      <p className="mt-0.5 text-sm text-muted">{total ? summary : day.today ? "Hoy" : "Sin turnos"}</p>
      <button type="button" onClick={() => onNew(day.key)} className={`${btnPrimary} mt-3 w-full`}>
        + Nuevo turno
      </button>

      {total === 0 ? (
        <p className="mt-4 rounded-2xl border border-dashed border-line px-4 py-8 text-center text-sm text-muted">
          {empty}
        </p>
      ) : (
        <ul className="mt-4 flex flex-col gap-3">
          {day.appointments.map((a) => {
            const status = STATUS[a.status];
            return (
              <li key={a.id} className="rounded-2xl bg-canvas p-4">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold">{timeOf(a.starts_at)} hs</span>
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${status.badge}`}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />
                    {status.label}
                  </span>
                </div>
                <p className="mt-2 font-semibold">
                  {a.patients.first_name} {a.patients.last_name}
                </p>
                <p className="text-sm text-muted">{a.appointment_types.name}</p>
                <div className="mt-3 flex flex-wrap items-center gap-2 empty:hidden">
                  <AppointmentActions
                    appointment={a}
                    now={now}
                    onStatus={onStatus}
                    onNotify={onNotify}
                    onEdit={onEdit}
                    block
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
