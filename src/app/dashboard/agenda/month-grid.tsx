import { addDays, isoWeekday, longDay, timeOf } from "../_lib/dates";
import { STATUS, focus } from "../_components/ui";
import type { DayInfo } from "./agenda-view";

const WEEKDAYS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
const VISIBLE_CHIPS = 2;

export function MonthGrid({
  month,
  info,
  selected,
  onSelect,
}: {
  month: string; // YYYY-MM
  info: (key: string) => DayInfo;
  selected: string;
  onSelect: (key: string) => void;
}) {
  const first = `${month}-01`;
  const start = addDays(first, 1 - isoWeekday(first));
  const [y, m] = month.split("-").map(Number);
  const last = new Date(Date.UTC(y, m, 0)).toISOString().slice(0, 10);
  const end = addDays(last, 7 - isoWeekday(last));

  const days: string[] = [];
  for (let d = start; d <= end; d = addDays(d, 1)) days.push(d);

  return (
    <div>
      <div className="grid grid-cols-7 gap-1.5 pb-2 text-center text-xs font-medium text-muted sm:text-sm">
        {WEEKDAYS.map((w) => (
          <span key={w}>{w}</span>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1.5">
        {days.map((key) => {
          if (!key.startsWith(month)) return <span key={key} aria-hidden />;

          const day = info(key);
          const number = Number(key.slice(8));
          const isSelected = key === selected;
          const pending = day.appointments.filter((a) => a.status === "pending").length;
          const label = `${longDay(key)}${day.today ? ", hoy" : ""}: ${
            day.blocked ? "bloqueado" : !day.works ? "no atendés" : `${day.appointments.length} turnos`
          }${pending ? `, ${pending} pendientes` : ""}`;

          // Days without office hours: just the number, like the Figma.
          if (!day.works && day.appointments.length === 0) {
            return (
              <button
                key={key}
                type="button"
                onClick={() => onSelect(key)}
                aria-label={label}
                aria-pressed={isSelected}
                className={`min-h-16 rounded-xl p-1.5 text-left text-xs text-faint sm:min-h-28 sm:p-2 sm:text-sm ${focus} ${
                  isSelected ? "bg-primary-soft/60 ring-2 ring-primary" : ""
                }`}
              >
                {number}
              </button>
            );
          }

          const extra = day.appointments.length - VISIBLE_CHIPS;
          return (
            <button
              key={key}
              type="button"
              onClick={() => onSelect(key)}
              aria-label={label}
              aria-pressed={isSelected}
              className={`flex min-h-16 min-w-0 flex-col gap-1 rounded-xl border p-1.5 text-left transition-colors sm:min-h-28 sm:p-2 ${focus} ${
                isSelected
                  ? "border-2 border-primary bg-primary-soft/70"
                  : "border-line bg-surface hover:border-primary/60"
              } ${day.past && !isSelected ? "opacity-60" : ""}`}
            >
              <span className="flex items-center gap-1.5 text-xs font-semibold sm:text-sm">
                {number}
                {day.today && <span className="hidden text-[11px] font-semibold text-primary sm:inline">Hoy</span>}
                {day.full && (
                  <span className="ml-auto hidden rounded-full bg-bad-soft px-1.5 text-[10px] font-semibold text-bad sm:inline">
                    Completo
                  </span>
                )}
              </span>

              {/* Phone: dots only. */}
              <span className="flex flex-wrap gap-0.5 sm:hidden">
                {day.blocked && <span className="h-1.5 w-1.5 rounded-full bg-faint" />}
                {day.full && <span className="h-1.5 w-1.5 rounded-full bg-bad" />}
                {!day.full &&
                  day.appointments.slice(0, 6).map((a) => (
                    <span key={a.id} className={`h-1.5 w-1.5 rounded-full ${STATUS[a.status].dot}`} />
                  ))}
              </span>

              <span className="hidden flex-col gap-1 sm:flex">
                {day.blocked && (
                  <span className="flex items-center gap-1 rounded-md border border-line bg-canvas px-1.5 py-0.5 text-[11px] text-muted">
                    <span className="h-1.5 w-1.5 rounded-full bg-faint" />
                    Bloqueado
                  </span>
                )}
                {day.appointments.slice(0, VISIBLE_CHIPS).map((a) => (
                  <span
                    key={a.id}
                    className={`flex min-w-0 items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] ${STATUS[a.status].chip}`}
                  >
                    <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${STATUS[a.status].dot}`} />
                    <span className="truncate">
                      {timeOf(a.starts_at)} {a.patients.first_name}
                    </span>
                  </span>
                ))}
                {extra > 0 && <span className="px-1 text-[11px] text-muted">+{extra} más</span>}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
