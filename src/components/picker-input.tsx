"use client";

import { useRef, type InputHTMLAttributes } from "react";

// Native date/time input whose picker icon is not a Tab stop. Chrome and Edge
// make the built-in icon focusable, so Tab stopped on it between two fields.
// The built-in icon is hidden in globals.css and this one only takes clicks.
export function PickerInput({
  className = "",
  type,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { type: "date" | "time" }) {
  const ref = useRef<HTMLInputElement>(null);

  return (
    <div className="relative">
      <input ref={ref} type={type} {...props} className={`${className} picker-input pr-10`} />
      <button
        type="button"
        tabIndex={-1}
        aria-hidden
        disabled={props.disabled}
        onClick={() => {
          const input = ref.current;
          if (!input) return;
          input.focus();
          try {
            input.showPicker();
          } catch {
            // Browsers without showPicker still let the user type the value.
          }
        }}
        className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-ink/80 hover:text-primary disabled:opacity-50"
      >
        {type === "time" ? (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden focusable="false" className="h-[18px] w-[18px]">
            <circle cx="12" cy="12" r="9" />
            <path d="M12 7v5l3 2" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden focusable="false" className="h-[18px] w-[18px]">
            <rect x="3.5" y="5" width="17" height="15" rx="2.5" />
            <path d="M3.5 10h17M8 3v4M16 3v4" />
          </svg>
        )}
      </button>
    </div>
  );
}
