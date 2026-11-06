"use client";

import { useEffect, useId, useRef, useState } from "react";
import { COUNTRIES, DEFAULT_COUNTRY, countryByIso, detectCountry } from "@/lib/countries";

// Phone number with a country selector. The visible number has no name; a
// hidden input sends "+<code> <number>", which whatsappNumber() understands.
// Pasting a full international number ("+598 99 ...") skips the selector.
//
// `defaultCountry` comes from the server (the visitor's country). Without it
// the browser guesses after the first render, so server and client markup
// match.
export function PhoneField({
  label,
  name = "phone",
  defaultCountry,
  className,
  labelClassName,
  selectClassName,
  inputClassName,
}: {
  label: string;
  name?: string;
  defaultCountry?: string;
  className?: string;
  labelClassName?: string;
  selectClassName?: string;
  inputClassName?: string;
}) {
  const id = useId();
  const [iso, setIso] = useState(defaultCountry ?? DEFAULT_COUNTRY);
  const [number, setNumber] = useState("");
  const chosenByUser = useRef(false);

  useEffect(() => {
    if (defaultCountry || chosenByUser.current) return;
    // Needs the browser, so it runs after hydration.
    setIso(detectCountry());
  }, [defaultCountry]);

  const country = countryByIso(iso);
  const typed = number.trim();
  const value = !typed ? "" : typed.startsWith("+") ? typed : `+${country.dial} ${typed}`;
  const argentina = country.iso === "AR";

  return (
    <div
      role="group"
      aria-labelledby={`${id}-label`}
      className={`flex flex-col gap-1.5 ${className ?? ""}`}
    >
      <span id={`${id}-label`} className={labelClassName}>
        {label}
      </span>
      <div className="flex gap-2">
        <div className="w-[7.5rem] shrink-0">
          <select
            aria-label="País"
            value={iso}
            onChange={(e) => {
              chosenByUser.current = true;
              setIso(e.target.value);
            }}
            className={selectClassName}
          >
            {COUNTRIES.map((c) => (
              <option key={c.iso} value={c.iso} title={c.name}>
                {c.iso} +{c.dial}
              </option>
            ))}
          </select>
        </div>
        <div className="min-w-0 flex-1">
          <input
            type="tel"
            inputMode="tel"
            autoComplete="tel-national"
            required
            maxLength={30}
            value={number}
            onChange={(e) => setNumber(e.target.value)}
            placeholder={argentina ? "351 555 0101" : "Número"}
            aria-describedby={`${id}-hint`}
            className={inputClassName}
          />
        </div>
        <input type="hidden" name={name} value={value} />
      </div>
      <p id={`${id}-hint`} className="text-xs text-muted">
        {argentina
          ? "Código de área sin 0 y número sin 15. Ej: 351 555 0101."
          : `Número sin el código de país (+${country.dial}).`}
      </p>
    </div>
  );
}
