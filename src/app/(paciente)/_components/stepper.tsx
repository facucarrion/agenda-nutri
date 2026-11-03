import { CheckIcon } from "./icons";

const STEPS = ["Servicio y horario", "Tus datos", "Listo"];

// Three-step progress indicator. With `allDone` every step shows a check.
export function Stepper({
  current,
  allDone = false,
}: {
  current: 1 | 2 | 3;
  allDone?: boolean;
}) {
  return (
    <ol className="flex items-center gap-3" aria-label="Pasos de la reserva">
      {STEPS.map((label, index) => {
        const number = index + 1;
        const done = allDone || number < current;
        const active = !allDone && number === current;

        return (
          <li key={label} className="flex items-center gap-3">
            {index > 0 && <span className="h-0.5 w-6 bg-line sm:w-10" />}
            <span
              aria-current={active ? "step" : undefined}
              className="flex items-center gap-2.5"
            >
              <span
                className={`flex h-7 w-7 items-center justify-center rounded-full text-[13px] font-semibold ${
                  done || active
                    ? "bg-primary text-white"
                    : "border border-line bg-surface text-muted"
                }`}
              >
                {done ? <CheckIcon className="h-4 w-4" /> : number}
              </span>
              <span
                className={`text-sm ${
                  active
                    ? "font-semibold text-ink"
                    : done
                      ? "hidden font-medium text-ink sm:inline"
                      : "hidden font-medium text-muted sm:inline"
                }`}
              >
                {label}
              </span>
            </span>
          </li>
        );
      })}
    </ol>
  );
}
