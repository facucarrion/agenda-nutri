"use client";

import Link from "next/link";
import { PhoneField } from "@/components/phone-field";
import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  CheckIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "../../_components/icons";
import { Stepper } from "../../_components/stepper";
import {
  MODALITY_LABEL,
  ModalityIcon,
  type Modality,
} from "@/components/modality";
import type {
  BookingRequest,
  PublicAppointmentType,
  PublicProfile,
  PublicSlot,
} from "./types";

// The API allows up to 31 days per request, so the calendar loads one month
// at a time and lets the patient look a few months ahead.
const MAX_MONTHS = 3;
// A day with this many free slots or fewer is shown as "quedan pocos".
const FEW_SLOTS = 3;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const WEEKDAYS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

type Step = 1 | 2 | 3;
type SlotsData = { key: string; slots: PublicSlot[]; failed?: boolean };

const card = "rounded-[20px] border border-line bg-surface p-5 sm:p-7";
const primaryButton =
  "w-full rounded-full bg-primary px-6 py-3.5 text-[15px] font-semibold text-white transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50";
const secondaryButton =
  "w-full rounded-full border-[1.5px] border-primary bg-surface px-6 py-3.5 text-[15px] font-semibold text-primary transition-colors hover:bg-primary-soft";
const input =
  "w-full rounded-xl border border-line bg-surface px-4 py-3.5 text-[15px] text-ink placeholder:text-faint focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20";

// Each slot says how it is attended (from the nutritionist's weekly hours).
const allows = (slot: PublicSlot, mode: Modality) =>
  slot.modality === "both" || slot.modality === mode;
const MODES: Modality[] = ["in_person", "virtual"];

const pad = (n: number) => String(n).padStart(2, "0");

function todayIn(timezone: string) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: timezone }).format(
    new Date(),
  );
}

// Calendar data for the month `offset` months after the one containing `today`.
function monthInfo(today: string, offset: number) {
  const [y, m] = today.split("-").map(Number);
  const first = new Date(Date.UTC(y, m - 1 + offset, 1));
  const year = first.getUTCFullYear();
  const month = first.getUTCMonth();
  const days = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  const key = `${year}-${pad(month + 1)}`;

  return {
    key,
    year,
    month,
    days,
    // Monday-first column of the 1st.
    leading: (first.getUTCDay() + 6) % 7,
    from: offset === 0 ? today : `${key}-01`,
    to: `${key}-${pad(days)}`,
  };
}

const capitalize = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);

// "YYYY-MM-DD" -> "Jueves 8 de octubre". Built from the key, so it is UTC.
function formatDay(dayKey: string) {
  const parts = new Intl.DateTimeFormat("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "UTC",
  }).formatToParts(new Date(`${dayKey}T00:00:00Z`));
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  return capitalize(`${get("weekday")} ${get("day")} de ${get("month")}`);
}

function formatMonth(year: number, month: number) {
  const name = new Intl.DateTimeFormat("es-AR", {
    month: "long",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, month, 1)));
  return `${capitalize(name)} ${year}`;
}

export function BookingForm({
  profile,
  defaultCountry,
}: {
  profile: PublicProfile;
  defaultCountry?: string;
}) {
  const timeFmt = new Intl.DateTimeFormat("es-AR", {
    timeZone: profile.timezone,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });
  const dayKeyFmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: profile.timezone,
  });
  const time = (iso: string) => timeFmt.format(new Date(iso));
  const dayKey = (iso: string) => dayKeyFmt.format(new Date(iso));

  const [step, setStep] = useState<Step>(1);
  // What the patient picked; the day may only allow the other one.
  const [preferred, setPreferred] = useState<Modality>("in_person");
  const [typeId, setTypeId] = useState(profile.types[0].id);
  const [offset, setOffset] = useState(0);
  const [data, setData] = useState<SlotsData | null>(null);
  const [day, setDay] = useState<string | null>(null);
  const [slot, setSlot] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [email, setEmail] = useState("");

  const type = profile.types.find((t) => t.id === typeId) ?? profile.types[0];
  const today = todayIn(profile.timezone);
  const month = monthInfo(today, offset);
  const dataKey = `${typeId}:${month.key}`;
  const ready = data?.key === dataKey ? data : null;
  const loading = !ready;

  useEffect(() => {
    const controller = new AbortController();
    const query = new URLSearchParams({
      type: typeId,
      from: month.from,
      to: month.to,
    });

    fetch(`/api/public/${profile.slug}/slots?${query}`, {
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) throw new Error("slots request failed");
        const body: { slots: PublicSlot[] } = await response.json();
        setData({ key: dataKey, slots: body.slots });
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setData({ key: dataKey, slots: [], failed: true });
        }
      });

    return () => controller.abort();
  }, [dataKey, typeId, month.from, month.to, profile.slug]);

  const slotsByDay = new Map<string, PublicSlot[]>();
  if (ready) {
    for (const s of ready.slots) {
      const key = dayKey(s.starts_at);
      slotsByDay.set(key, [...(slotsByDay.get(key) ?? []), s]);
    }
  }
  const allDaySlots = day ? (slotsByDay.get(day) ?? []) : [];
  // Modalities offered on the chosen day. If the preferred one is not, the
  // day's only modality is used, so the patient can only book what is offered.
  const dayModes = MODES.filter((m) => allDaySlots.some((s) => allows(s, m)));
  const mode: Modality =
    dayModes.length === 0 || dayModes.includes(preferred) ? preferred : dayModes[0];
  const daySlots = allDaySlots.filter((s) => allows(s, mode));

  function chooseType(id: string) {
    setTypeId(id);
    setDay(null);
    setSlot(null);
  }

  // Swaps presencial/virtual; a chosen time that does not allow it is cleared.
  function switchMode(next: Modality) {
    setPreferred(next);
    const current = allDaySlots.find((s) => s.starts_at === slot);
    if (current && !allows(current, next)) setSlot(null);
  }

  function goToMonth(next: number) {
    setOffset(next);
    setDay(null);
    setSlot(null);
  }

  function restart() {
    setStep(1);
    setDay(null);
    setSlot(null);
    setError(null);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!slot) return;

    const form = new FormData(event.currentTarget);
    const field = (name: string) => String(form.get(name) ?? "").trim();
    const consent = form.get("consent") === "on";
    const body: BookingRequest = {
      type: type.id,
      starts_at: slot,
      modality: mode,
      first_name: field("first_name"),
      last_name: field("last_name"),
      email: field("email").toLowerCase(),
      phone: field("phone"),
      consent: true,
      website: field("website"),
    };

    if (!body.first_name || !body.last_name) {
      setError("Completá tu nombre y apellido.");
      return;
    }
    if (!EMAIL_RE.test(body.email)) {
      setError("El email no es válido.");
      return;
    }
    if (!body.phone) {
      setError("Completá tu teléfono.");
      return;
    }
    if (!consent) {
      setError("Tenés que aceptar la política de privacidad para continuar.");
      return;
    }

    setError(null);
    setSubmitting(true);
    try {
      const response = await fetch(`/api/public/${profile.slug}/book`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        setEmail(body.email);
        setStep(3);
      } else {
        const result: { error?: string } = await response
          .json()
          .catch(() => ({}));
        setError(result.error ?? "No pudimos reservar el turno. Probá de nuevo.");
      }
    } catch {
      setError("No pudimos reservar el turno. Probá de nuevo.");
    } finally {
      setSubmitting(false);
    }
  }

  const title =
    step === 1 ? "Reservá tu turno" : step === 2 ? "Tus datos" : "¡Listo, ya casi está!";
  const subtitle =
    step === 1
      ? `Elegí el servicio, el día y el horario. ${profile.fullName} te confirma el turno por email.`
      : step === 2
        ? `Los usamos solo para que ${profile.fullName} pueda gestionar tu turno.`
        : null;

  const summary = (
    <section
      className={`${card} flex flex-1 flex-col gap-3.5 !p-6 ${
        step === 1 ? "xl:min-h-0 xl:gap-3 xl:overflow-y-auto xl:!p-5" : ""
      }`}
    >
      <h2 className="text-lg font-semibold">Tu turno</h2>
      <SummaryRow label="Servicio" value={type.name} />
      <SummaryRow label="Modalidad" value={day ? MODALITY_LABEL[mode] : "—"} />
      <SummaryRow label="Día" value={day ? formatDay(day) : "—"} />
      <SummaryRow label="Hora" value={slot ? `${time(slot)} hs` : "—"} />
      <div className="h-px bg-line" />
      <div className="flex items-baseline justify-between gap-4">
        <span className="text-sm text-muted">Duración</span>
        <span className="text-xl font-bold text-primary">
          {type.duration_minutes} min
        </span>
      </div>
      <div className="mt-auto flex flex-col gap-3.5 pt-1.5">
      {step === 1 ? (
        <button
          type="button"
          disabled={!slot}
          onClick={() => {
            setError(null);
            setStep(2);
          }}
          className={primaryButton}
        >
          Continuar →
        </button>
      ) : (
        <>
          <button
            type="submit"
            form="datos"
            disabled={submitting}
            className={primaryButton}
          >
            {submitting ? "Solicitando..." : "Solicitar turno"}
          </button>
          <button
            type="button"
            onClick={() => {
              setError(null);
              setStep(1);
            }}
            className={secondaryButton}
          >
            Volver a elegir horario
          </button>
        </>
      )}
      <p className="text-xs text-muted">
        {step === 1
          ? `Te mandamos un email para que confirmes el turno. Hasta entonces queda como pendiente.`
          : `Al solicitar, el turno queda pendiente y te enviamos un email con el link para confirmarlo. Tenés 30 minutos para hacerlo.`}
      </p>
      </div>
    </section>
  );

  return (
    // On wide screens step 1 fits the window (header 69px + page padding
    // 40px), so the patient sees everything without scrolling. Below the
    // minimum height, or on narrower screens, the page scrolls as usual.
    <div
      className={`flex flex-col gap-6 ${
        step === 1
          ? "xl:h-[min(calc(100dvh-110px),700px)] xl:min-h-[520px] xl:gap-5"
          : ""
      }`}
    >
      <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between xl:gap-8">
        <div className="flex flex-col gap-2 xl:gap-1">
          <h1 className="text-3xl font-bold sm:text-[40px] sm:leading-tight xl:text-[32px]">
            {title}
          </h1>
          {subtitle && (
            <p className="text-[17px] text-muted xl:text-[15px]">{subtitle}</p>
          )}
        </div>

        <div className="xl:shrink-0 xl:pb-1">
          <Stepper current={step} allDone={step === 3} />
        </div>
      </div>

      {step === 3 && slot ? (
        <section className="mx-auto flex w-full max-w-[640px] flex-col items-center gap-[18px] rounded-3xl border border-line bg-surface p-6 sm:p-10">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-ok-soft text-ok">
            <CheckIcon className="h-8 w-8" />
          </span>
          <h2 className="text-[28px] font-bold">Solicitud enviada</h2>
          <span className="inline-flex items-center gap-2 rounded-full bg-warn-soft px-3 py-1.5 text-[13px] font-semibold">
            <span className="h-2 w-2 rounded-full bg-warn" aria-hidden />
            Pendiente de confirmación
          </span>
          <p className="text-center text-[15px] text-muted">
            Te mandamos un email a <strong className="text-ink">{email}</strong>{" "}
            con el link para confirmar tu turno. Tenés 30 minutos: si no lo
            confirmás, el horario vuelve a quedar libre.
          </p>
          <div className="flex w-full flex-col gap-3 rounded-[14px] bg-canvas p-5 text-sm">
            <SummaryRow label="Servicio" value={type.name} />
            <SummaryRow label="Modalidad" value={MODALITY_LABEL[mode]} />
            <SummaryRow
              label="Día y hora"
              value={`${formatDay(dayKey(slot))} · ${time(slot)} hs`}
            />
            <SummaryRow label="Duración" value={`${type.duration_minutes} min`} />
          </div>
          <button type="button" onClick={restart} className={secondaryButton}>
            Reservar otro turno
          </button>
        </section>
      ) : (
        <div
          className={`grid gap-6 lg:grid-cols-[minmax(0,1fr)_392px] ${
            // Three columns (calendar | horarios | resumen) that share the
            // remaining height; each one scrolls inside if it ever needs to.
            step === 1
              ? "xl:min-h-0 xl:flex-1 xl:grid-cols-[minmax(0,1fr)_300px_300px] xl:grid-rows-[minmax(0,1fr)] xl:gap-5"
              : ""
          }`}
        >
          {step === 1 ? (
            // On xl the two cards merge into one, so they fit in one column.
            <div className="flex flex-col gap-6 xl:min-h-0 xl:gap-4 xl:rounded-[20px] xl:border xl:border-line xl:bg-surface xl:p-5">
              <section
                className={`${card} flex flex-col gap-4 xl:flex-row xl:items-center xl:rounded-none xl:border-0 xl:bg-transparent xl:p-0`}
              >
                <h2 className="text-lg font-semibold xl:shrink-0 xl:text-base">
                  1 · Elegí el servicio
                </h2>
                <ServiceSelect
                  types={profile.types}
                  value={type.id}
                  onChange={chooseType}
                />
              </section>

              <section
                className={`${card} flex flex-1 flex-col gap-5 xl:min-h-0 xl:gap-3 xl:rounded-none xl:border-x-0 xl:border-b-0 xl:bg-transparent xl:px-0 xl:pb-0 xl:pt-4`}
              >
                <h2 className="text-lg font-semibold xl:text-base">
                  2 · Elegí día y horario
                </h2>

                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <NavButton
                      label="Mes anterior"
                      disabled={offset === 0}
                      onClick={() => goToMonth(offset - 1)}
                    >
                      <ChevronLeftIcon className="h-[18px] w-[18px]" />
                    </NavButton>
                    <span className="min-w-[8.5rem] text-center text-[17px] font-semibold">
                      {formatMonth(month.year, month.month)}
                    </span>
                    <NavButton
                      label="Mes siguiente"
                      disabled={offset >= MAX_MONTHS - 1}
                      onClick={() => goToMonth(offset + 1)}
                    >
                      <ChevronRightIcon className="h-[18px] w-[18px]" />
                    </NavButton>
                  </div>
                  <div className="flex items-center gap-4 text-[13px] text-muted">
                    <Legend color="bg-ok" label="Hay turnos" />
                    <Legend color="bg-warn" label="Quedan pocos" />
                  </div>
                </div>

                {ready?.failed ? (
                  <p role="alert" className="text-sm text-bad">
                    No pudimos cargar los horarios. Probá de nuevo.
                  </p>
                ) : (
                  <div
                    // On xl the weeks grow with the card, up to 56px each.
                    className={`grid grid-cols-7 gap-1.5 transition-opacity xl:min-h-0 xl:flex-1 xl:auto-rows-[minmax(0,56px)] xl:grid-rows-[auto] xl:gap-1 ${
                      loading ? "opacity-50" : ""
                    }`}
                    aria-busy={loading}
                  >
                    {WEEKDAYS.map((w) => (
                      <span
                        key={w}
                        className="py-1 text-center text-xs font-semibold text-muted"
                      >
                        {w}
                      </span>
                    ))}
                    {Array.from({ length: month.leading }, (_, i) => (
                      <span key={`blank-${i}`} />
                    ))}
                    {Array.from({ length: month.days }, (_, i) => {
                      const key = `${month.key}-${pad(i + 1)}`;
                      const count = slotsByDay.get(key)?.length ?? 0;
                      const selectable = !loading && count > 0;
                      const selected = day === key;

                      return (
                        <button
                          key={key}
                          type="button"
                          disabled={!selectable}
                          aria-pressed={selected}
                          onClick={() => {
                            setDay(key);
                            setSlot(null);
                          }}
                          className={`flex h-14 flex-col items-start gap-1.5 rounded-xl p-2 text-left transition-colors sm:h-16 sm:p-2.5 xl:h-auto xl:min-h-0 xl:flex-row xl:items-center xl:justify-between xl:px-2.5 xl:py-1 ${
                            selected
                              ? "border-2 border-primary bg-primary-soft"
                              : selectable
                                ? "border border-line bg-surface hover:border-primary"
                                : "border border-transparent"
                          }`}
                        >
                          <span className="flex items-center gap-1.5">
                            <span
                              className={`text-[15px] font-medium ${
                                selectable ? "text-ink" : "text-faint"
                              }`}
                            >
                              {i + 1}
                            </span>
                            {key === today && (
                              <span className="hidden text-[11px] font-semibold text-primary sm:inline">
                                Hoy
                              </span>
                            )}
                          </span>
                          {selectable && (
                            <span
                              className={`h-2.5 w-2.5 rounded-full ${
                                count <= FEW_SLOTS ? "bg-warn" : "bg-ok"
                              }`}
                              aria-label={
                                count <= FEW_SLOTS ? "Quedan pocos" : "Hay turnos"
                              }
                            />
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </section>
            </div>
          ) : (
            <form
              id="datos"
              onSubmit={submit}
              noValidate
              className={`${card} flex flex-col gap-5`}
            >
              <h2 className="text-lg font-semibold">Completá tus datos</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Nombre" name="first_name" autoComplete="given-name" />
                <Field label="Apellido" name="last_name" autoComplete="family-name" />
                <Field label="Email" name="email" type="email" autoComplete="email" />
                <PhoneField
                  label="Teléfono (WhatsApp)"
                  defaultCountry={defaultCountry}
                  className="sm:col-span-2"
                  labelClassName="text-[13px] font-medium text-muted"
                  selectClassName={input}
                  inputClassName={input}
                />
              </div>

              {/* Honeypot: hidden from people, bots tend to fill it. */}
              <div
                aria-hidden="true"
                className="absolute -left-[9999px] h-0 overflow-hidden"
              >
                <label>
                  Sitio web
                  <input name="website" type="text" tabIndex={-1} autoComplete="off" />
                </label>
              </div>

              <label className="flex items-center gap-2.5 text-sm text-muted">
                <input
                  name="consent"
                  type="checkbox"
                  className="h-5 w-5 rounded-md accent-primary"
                />
                <span>
                  Acepto la{" "}
                  <Link
                    href="/privacidad"
                    target="_blank"
                    className="text-primary underline"
                  >
                    política de privacidad
                  </Link>{" "}
                  y los{" "}
                  <Link
                    href="/terminos"
                    target="_blank"
                    className="text-primary underline"
                  >
                    términos
                  </Link>
                  .
                </span>
              </label>

              {error && (
                <p role="alert" className="text-sm text-bad">
                  {error}
                </p>
              )}
            </form>
          )}

          <div className={`flex flex-col gap-6 ${step === 1 ? "xl:contents" : ""}`}>
            {step === 1 && (
              <section className={`${card} flex flex-col gap-4 !p-6 xl:min-h-0 xl:gap-3 xl:!p-5`}>
                <div className="flex flex-col gap-1">
                  <h2 className="text-lg font-semibold">
                    {day ? formatDay(day) : "Horarios"}
                  </h2>
                  <p className="text-sm text-muted">
                    {day
                      ? `${daySlots.length} ${daySlots.length === 1 ? "turno libre" : "turnos libres"}`
                      : "Elegí un día del calendario para ver los horarios."}
                  </p>
                </div>
                {day && (
                  <div className="grid max-h-56 grid-cols-2 gap-3 overflow-y-auto pr-1 xl:max-h-none xl:min-h-0 xl:flex-1 xl:content-start xl:gap-2.5">
                    {daySlots.map((s) => (
                      <button
                        key={s.starts_at}
                        type="button"
                        aria-pressed={slot === s.starts_at}
                        onClick={() => setSlot(s.starts_at)}
                        className={`h-11 shrink-0 rounded-xl text-[15px] font-medium transition-colors xl:h-10 ${
                          slot === s.starts_at
                            ? "bg-primary text-white"
                            : "border-[1.5px] border-line bg-surface hover:border-primary"
                        }`}
                      >
                        {time(s.starts_at)}
                      </button>
                    ))}
                  </div>
                )}
                <p className="text-xs text-muted xl:mt-auto">
                  Horarios en hora de{" "}
                  {profile.timezone.startsWith("America/Argentina")
                    ? "Argentina"
                    : profile.timezone}
                  .
                </p>
                {day && allDaySlots.length > 0 && (
                  <ModeSwitch
                    value={mode}
                    available={dayModes}
                    onChange={switchMode}
                  />
                )}
              </section>
            )}
            {summary}
          </div>
        </div>
      )}
    </div>
  );
}

// Segmented switch Presencial | Virtual. The thumb slides between both
// halves: tap a side, swipe it left or right, or use the arrow keys. A side
// the chosen day does not offer is disabled.
function ModeSwitch({
  value,
  available,
  onChange,
}: {
  value: Modality;
  available: Modality[];
  onChange: (next: Modality) => void;
}) {
  const startX = useRef<number | null>(null);
  // A swipe ends with a click on the button under the finger: ignore it.
  const swiped = useRef(false);
  const only = available.length === 1 ? available[0] : null;

  function pick(next: Modality) {
    if (next !== value && available.includes(next)) onChange(next);
  }

  return (
    <div className="flex flex-col gap-2">
      <div
        role="radiogroup"
        aria-label="Modalidad del turno"
        onPointerDown={(e) => {
          startX.current = e.clientX;
          swiped.current = false;
        }}
        onPointerUp={(e) => {
          if (startX.current === null) return;
          const dx = e.clientX - startX.current;
          startX.current = null;
          if (Math.abs(dx) <= 24) return;
          swiped.current = true;
          pick(dx > 0 ? "virtual" : "in_person");
        }}
        onPointerCancel={() => {
          startX.current = null;
        }}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") pick("virtual");
          if (e.key === "ArrowLeft") pick("in_person");
        }}
        className="relative grid touch-pan-y select-none grid-cols-2 rounded-full bg-primary-soft p-1"
      >
        <span
          aria-hidden
          className={`absolute inset-y-1 left-1 w-[calc(50%-4px)] rounded-full bg-primary shadow-sm transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] motion-reduce:transition-none ${
            value === "virtual" ? "translate-x-full" : "translate-x-0"
          }`}
        />
        {MODES.map((option) => {
          const selected = value === option;
          const enabled = available.includes(option);
          return (
            <button
              key={option}
              type="button"
              role="radio"
              aria-checked={selected}
              disabled={!enabled}
              tabIndex={selected ? 0 : -1}
              onClick={() => {
                if (swiped.current) swiped.current = false;
                else pick(option);
              }}
              className={`relative z-10 flex items-center justify-center gap-2 rounded-full px-4 py-2.5 text-[15px] font-semibold transition-colors duration-300 disabled:cursor-not-allowed motion-reduce:transition-none ${
                selected
                  ? "text-white"
                  : enabled
                    ? "text-primary/60 hover:text-primary"
                    : "text-primary/25"
              }`}
            >
              <ModalityIcon modality={option} className="h-[18px] w-[18px]" />
              {MODALITY_LABEL[option]}
            </button>
          );
        })}
      </div>
      {only && (
        <p className="text-xs text-muted">
          Este día se atiende solo de forma {only === "virtual" ? "virtual" : "presencial"}.
        </p>
      )}
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start gap-4 text-sm">
      <span className="shrink-0 text-muted">{label}</span>
      <span className="flex-1 text-right font-medium">{value}</span>
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className={`h-2.5 w-2.5 rounded-full ${color}`} aria-hidden />
      {label}
    </span>
  );
}

function NavButton({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string;
  disabled: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="flex h-9 w-9 items-center justify-center rounded-full border border-line text-ink transition-colors hover:border-primary disabled:cursor-not-allowed disabled:opacity-40"
    >
      {children}
    </button>
  );
}

function Field({
  label,
  name,
  type = "text",
  autoComplete,
  placeholder,
}: {
  label: string;
  name: string;
  type?: string;
  autoComplete?: string;
  placeholder?: string;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[13px] font-medium text-muted">{label}</span>
      <input
        name={name}
        type={type}
        autoComplete={autoComplete}
        placeholder={placeholder}
        required
        className={input}
      />
    </label>
  );
}

function ServiceSelect({
  types,
  value,
  onChange,
}: {
  types: PublicAppointmentType[];
  value: string;
  onChange: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const current = types.find((t) => t.id === value) ?? types[0];

  useEffect(() => {
    if (!open) return;
    const onDown = (event: MouseEvent) => {
      if (!ref.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative xl:flex-1">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-3 rounded-xl border-[1.5px] border-primary bg-surface px-4 py-3.5 text-left xl:py-2.5"
      >
        <span className="flex flex-1 flex-col gap-0.5 xl:flex-row xl:items-baseline xl:gap-2">
          <span className="text-base font-medium">{current.name}</span>
          <span className="text-[13px] text-muted">
            {current.duration_minutes} min
          </span>
        </span>
        <ChevronDownIcon className="h-5 w-5 text-muted" />
      </button>

      {open && (
        <ul
          role="listbox"
          className="absolute z-10 mt-2 flex w-full flex-col gap-0.5 rounded-[14px] border border-line bg-surface p-1.5 shadow-[0_8px_24px_rgba(0,0,0,0.12)]"
        >
          {types.map((t) => {
            const selected = t.id === current.id;
            return (
              <li
                key={t.id}
                role="option"
                aria-selected={selected}
                tabIndex={0}
                onClick={() => {
                  onChange(t.id);
                  setOpen(false);
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    onChange(t.id);
                    setOpen(false);
                  }
                }}
                className={`flex cursor-pointer items-center gap-3 rounded-[10px] px-3.5 py-3 ${
                  selected ? "bg-primary-soft" : "hover:bg-canvas"
                }`}
              >
                <span className="flex flex-1 flex-col gap-0.5">
                  <span
                    className={`text-[15px] ${selected ? "font-semibold" : "font-medium"}`}
                  >
                    {t.name}
                  </span>
                  <span className="text-[13px] text-muted">
                    {t.duration_minutes} min
                  </span>
                </span>
                {selected && <CheckIcon className="h-[18px] w-[18px] text-primary" />}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
