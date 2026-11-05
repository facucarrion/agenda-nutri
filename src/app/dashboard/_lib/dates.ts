// Date helpers for the dashboard. Every "day" is a YYYY-MM-DD key in the
// nutritionist's timezone; instants stay as UTC ISO strings.

export const TIMEZONE = "America/Argentina/Buenos_Aires";
// Argentina has no DST, so a fixed offset is enough to build instants.
export const AR_OFFSET = "-03:00";

const dayKeyFmt = new Intl.DateTimeFormat("en-CA", { timeZone: TIMEZONE });
const timeFmt = new Intl.DateTimeFormat("es-AR", {
  timeZone: TIMEZONE,
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

export const dayKey = (iso: string | Date) => dayKeyFmt.format(new Date(iso));
export const timeOf = (iso: string) => timeFmt.format(new Date(iso));

export function addDays(key: string, days: number) {
  const d = new Date(`${key}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

// 1 = Monday ... 7 = Sunday
export function isoWeekday(key: string) {
  const day = new Date(`${key}T12:00:00Z`).getUTCDay();
  return day === 0 ? 7 : day;
}

export const mondayOf = (key: string) => addDays(key, 1 - isoWeekday(key));

export const instant = (key: string, time: string) =>
  new Date(`${key}T${time}:00${AR_OFFSET}`).toISOString();

const capitalize = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);

function fmt(key: string, options: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat("es-AR", { ...options, timeZone: "UTC" }).format(
    new Date(`${key}T12:00:00Z`),
  );
}

// "Jue 8 oct"
export const shortDay = (key: string) =>
  capitalize(
    fmt(key, { weekday: "short", day: "numeric", month: "short" })
      .replace(",", "")
      .replaceAll(".", ""),
  );

// "Jueves 8 de octubre"
export const longDay = (key: string) =>
  capitalize(fmt(key, { weekday: "long", day: "numeric", month: "long" }).replace(",", ""));

// "Octubre 2026"
export const monthTitle = (key: string) =>
  capitalize(fmt(key, { month: "long", year: "numeric" }).replace(" de ", " "));

// "5 – 11 de octubre" or "28 de septiembre – 4 de octubre"
export function weekTitle(monday: string) {
  const sunday = addDays(monday, 6);
  const sameMonth = monday.slice(0, 7) === sunday.slice(0, 7);
  const end = fmt(sunday, { day: "numeric", month: "long" });
  const start = sameMonth ? fmt(monday, { day: "numeric" }) : fmt(monday, { day: "numeric", month: "long" });
  return `${start} – ${end}`;
}
