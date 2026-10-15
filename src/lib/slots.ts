// Pure slot generation: no I/O, so it is easy to test.

export type Rule = { weekday: number; start_time: string; end_time: string };
export type Busy = { start: Date; end: Date };

export type SlotInput = {
  rules: Rule[];
  busy: Busy[];
  timezone: string;
  /** Local dates, inclusive, as YYYY-MM-DD. */
  fromDate: string;
  toDate: string;
  slotMinutes: number;
  durationMinutes: number;
  minNoticeHours: number;
  now: Date;
};

const DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/;

export function parseDate(value: string) {
  const m = DATE_RE.exec(value);
  if (!m) return null;
  const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const date = new Date(Date.UTC(y, mo - 1, d));
  if (date.getUTCFullYear() !== y || date.getUTCMonth() !== mo - 1) return null;
  return { y, mo, d };
}

function timeToMinutes(time: string) {
  const [h, m] = time.split(":");
  return Number(h) * 60 + Number(m);
}

// Offset (ms) of `timezone` from UTC at the instant `ts`.
function offsetMs(ts: number, timezone: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    hourCycle: "h23",
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
  }).formatToParts(new Date(ts));
  const get = (type: string) =>
    Number(parts.find((p) => p.type === type)!.value);
  const asUtc = Date.UTC(
    get("year"),
    get("month") - 1,
    get("day"),
    get("hour"),
    get("minute"),
    get("second"),
  );
  return asUtc - Math.floor(ts / 1000) * 1000;
}

// Wall-clock time in `timezone` -> UTC instant.
export function zonedToUtc(
  y: number,
  mo: number,
  d: number,
  minutesOfDay: number,
  timezone: string,
) {
  const naive = Date.UTC(y, mo - 1, d, 0, minutesOfDay);
  const first = naive - offsetMs(naive, timezone);
  return new Date(naive - offsetMs(first, timezone));
}

export function computeSlots(input: SlotInput): string[] {
  const from = parseDate(input.fromDate);
  const to = parseDate(input.toDate);
  if (!from || !to) return [];

  const earliest = input.now.getTime() + input.minNoticeHours * 3_600_000;
  const durationMs = input.durationMinutes * 60_000;
  const slots: string[] = [];

  const end = Date.UTC(to.y, to.mo - 1, to.d);
  for (
    let day = Date.UTC(from.y, from.mo - 1, from.d);
    day <= end;
    day += 86_400_000
  ) {
    const date = new Date(day);
    const [y, mo, d] = [
      date.getUTCFullYear(),
      date.getUTCMonth() + 1,
      date.getUTCDate(),
    ];
    const weekday = date.getUTCDay();

    for (const rule of input.rules) {
      if (rule.weekday !== weekday) continue;
      const ruleStart = timeToMinutes(rule.start_time);
      const ruleEnd = timeToMinutes(rule.end_time);

      for (
        let t = ruleStart;
        t + input.durationMinutes <= ruleEnd;
        t += input.slotMinutes
      ) {
        const start = zonedToUtc(y, mo, d, t, input.timezone);
        const startMs = start.getTime();
        if (startMs < earliest) continue;

        const endMs = startMs + durationMs;
        const clash = input.busy.some(
          (b) => startMs < b.end.getTime() && endMs > b.start.getTime(),
        );
        if (!clash) slots.push(start.toISOString());
      }
    }
  }

  return slots.sort();
}
