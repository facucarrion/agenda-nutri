import type { AppointmentStatus, DashboardAppointment } from "../_lib/types";

// Shared look for the nutritionist's screens (palette from globals.css).

export const STATUS: Record<
  AppointmentStatus,
  { label: string; badge: string; chip: string; dot: string }
> = {
  pending: { label: "Pendiente", badge: "bg-warn-soft text-ink", chip: "bg-warn-soft", dot: "bg-warn" },
  confirmed: { label: "Confirmado", badge: "bg-ok-soft text-primary", chip: "bg-ok-soft", dot: "bg-ok" },
  completed: { label: "Atendido", badge: "bg-primary-soft text-primary", chip: "bg-canvas text-muted", dot: "bg-faint" },
  no_show: { label: "Ausente", badge: "bg-line/60 text-muted", chip: "bg-canvas text-muted line-through", dot: "bg-faint" },
  cancelled: { label: "Cancelado", badge: "bg-bad-soft text-bad", chip: "bg-bad-soft text-bad", dot: "bg-bad" },
};

export const focus =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40";
const btn = `inline-flex h-9 items-center justify-center gap-2 rounded-full px-4 text-sm font-semibold transition-colors ${focus}`;
export const btnPrimary = `${btn} bg-primary text-white hover:bg-primary/90`;
export const btnDanger = `${btn} border border-bad text-bad hover:bg-bad-soft`;
export const btnBadSolid = `${btn} bg-bad text-white hover:bg-bad/90`;
export const btnSecondary = `${btn} border border-line bg-surface text-ink hover:border-primary hover:text-primary`;
export const btnWhatsApp = `${btn} bg-ok text-white hover:bg-ok/90`;
export const iconButton = `flex h-9 w-9 items-center justify-center rounded-full border border-line bg-surface text-muted hover:border-primary hover:text-primary ${focus}`;

export const fullName = (a: DashboardAppointment) =>
  `${a.patients.first_name} ${a.patients.last_name}`;

// "Agustina R."
export const shortName = (a: DashboardAppointment) =>
  `${a.patients.first_name} ${a.patients.last_name[0] ?? ""}.`;

export const initials = (a: DashboardAppointment) =>
  `${a.patients.first_name[0] ?? ""}${a.patients.last_name[0] ?? ""}`;

// "Primera asesoría · Presencial" -> "Primera vez"
export function shortType(name: string) {
  if (/primera/i.test(name)) return "Primera vez";
  if (/deportiva/i.test(name)) return "Deportiva";
  if (/análisis/i.test(name)) return "Análisis";
  return name.split(" · ")[0];
}

// Appointments that hold the slot (cancelled ones free it).
export const isActive = (a: DashboardAppointment) => a.status !== "cancelled";

// Form pieces for the settings screens and dialogs.
export const card = "rounded-[24px] border border-line bg-surface p-5 sm:p-7";
export const labelClass = "text-[13px] font-medium text-muted";
export const inputClass =
  "h-10 w-full rounded-xl border border-line bg-surface px-3 text-[15px] text-ink placeholder:text-faint focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-60";
export const errorClass = "rounded-xl bg-bad-soft px-4 py-3 text-sm text-bad";
