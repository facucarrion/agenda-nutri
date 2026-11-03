"use client";

import Link from "next/link";
import { useId, useState } from "react";
import { CheckIcon, ChevronLeftIcon } from "@/app/(paciente)/_components/icons";
import { PASSWORD_RULES, passwordScore } from "@/lib/password";
import { AlertCircleIcon, EyeIcon, EyeOffIcon, MailIcon } from "./icons";

// Building blocks of the auth screens (Figma "Iniciar sesión" page).

const focus =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40";

export function Card({
  children,
  centered = false,
}: {
  children: React.ReactNode;
  centered?: boolean;
}) {
  return (
    <div
      className={`flex w-full max-w-[440px] flex-col gap-5 rounded-3xl border border-line bg-surface p-6 sm:p-9 ${
        centered ? "items-center text-center" : ""
      }`}
    >
      {children}
    </div>
  );
}

export function Heading({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <h1 className="text-[26px] font-bold text-ink">{title}</h1>
      <p className="text-[15px] leading-[22px] text-muted">{children}</p>
    </div>
  );
}

export function ErrorBox({ children }: { children: React.ReactNode }) {
  return (
    <div
      role="alert"
      className="flex w-full items-center gap-2.5 rounded-xl bg-bad-soft px-3.5 py-3"
    >
      <AlertCircleIcon className="size-[18px] shrink-0 text-bad" />
      <p className="text-[13px] font-medium leading-[18px] text-bad">{children}</p>
    </div>
  );
}

const inputBox = (invalid: boolean) =>
  `flex w-full items-center gap-2 rounded-xl bg-surface px-4 transition-colors focus-within:ring-2 focus-within:ring-primary/30 ${
    invalid ? "border-[1.5px] border-bad" : "border border-line focus-within:border-primary"
  }`;

const inputText =
  "min-w-0 flex-1 bg-transparent py-3.5 text-[15px] text-ink outline-none placeholder:text-faint";

type FieldProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  invalid?: boolean;
  hint?: string;
};

export function Field({ label, invalid = false, hint, ...input }: FieldProps) {
  const id = useId();
  return (
    <div className="flex w-full flex-col gap-1.5">
      <label htmlFor={id} className="text-[13px] font-medium text-muted">
        {label}
      </label>
      <div className={inputBox(invalid)}>
        <input id={id} aria-invalid={invalid || undefined} className={inputText} {...input} />
      </div>
      {hint && <p className="text-xs text-muted">{hint}</p>}
    </div>
  );
}

export function PasswordField({
  label,
  invalid = false,
  value,
  onChange,
  ...input
}: Omit<FieldProps, "type" | "hint">) {
  const id = useId();
  const [visible, setVisible] = useState(false);
  return (
    <div className="flex w-full flex-col gap-1.5">
      <label htmlFor={id} className="text-[13px] font-medium text-muted">
        {label}
      </label>
      <div className={inputBox(invalid)}>
        <input
          id={id}
          type={visible ? "text" : "password"}
          aria-invalid={invalid || undefined}
          className={inputText}
          value={value}
          onChange={onChange}
          {...input}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Ocultar contraseña" : "Mostrar contraseña"}
          aria-pressed={visible}
          className={`-mr-1 rounded-md p-1 text-muted hover:text-ink ${focus}`}
        >
          {visible ? <EyeOffIcon className="size-[18px]" /> : <EyeIcon className="size-[18px]" />}
        </button>
      </div>
    </div>
  );
}

const STRENGTH = [
  null,
  { label: "Contraseña débil", bar: "bg-bad", text: "text-bad" },
  { label: "Contraseña regular", bar: "bg-warn", text: "text-warn" },
  { label: "Contraseña buena", bar: "bg-ok", text: "text-ok" },
  { label: "Contraseña muy buena", bar: "bg-ok", text: "text-ok" },
] as const;

// Strength bars + requirement checklist under a new-password field.
export function PasswordStrength({ password }: { password: string }) {
  const score = passwordScore(password);
  const level = STRENGTH[score];
  return (
    <>
      {level && (
        <div className="flex flex-col gap-1.5" aria-live="polite">
          <div className="flex gap-1.5">
            {[1, 2, 3, 4].map((n) => (
              <div
                key={n}
                className={`h-1 flex-1 rounded-[2px] ${n <= score ? level.bar : "bg-line"}`}
              />
            ))}
          </div>
          <p className={`text-xs font-medium ${level.text}`}>{level.label}</p>
        </div>
      )}
      <ul className="flex flex-col gap-1.5">
        {PASSWORD_RULES.map((rule) => {
          const ok = rule.test(password);
          return (
            <li key={rule.id} className="flex items-center gap-2 text-[13px]">
              <CheckIcon className={`size-3.5 ${ok ? "text-ok" : "text-faint"}`} />
              <span className={ok ? "text-ink" : "text-muted"}>{rule.label}</span>
              <span className="sr-only">{ok ? "(cumplido)" : "(pendiente)"}</span>
            </li>
          );
        })}
      </ul>
    </>
  );
}

// The "Grupo contraseña" block: field + strength (10px gap like the Figma).
export function NewPasswordGroup({
  label,
  name,
  value,
  onChange,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex w-full flex-col gap-2.5">
      <PasswordField
        label={label}
        name={name}
        autoComplete="new-password"
        required
        minLength={8}
        maxLength={72}
        placeholder="••••••••••"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <PasswordStrength password={value} />
    </div>
  );
}

export function SubmitButton({ pending, children }: { pending: boolean; children: string }) {
  return (
    <button
      type="submit"
      disabled={pending}
      aria-busy={pending}
      className={`w-full rounded-full bg-primary px-6 py-3.5 text-[15px] font-semibold text-white transition-colors hover:bg-primary/90 disabled:opacity-60 ${focus}`}
    >
      {children}
    </button>
  );
}

export function ButtonLink({ href, children }: { href: string; children: string }) {
  return (
    <Link
      href={href}
      className={`block w-full rounded-full bg-primary px-6 py-3.5 text-center text-[15px] font-semibold text-white transition-colors hover:bg-primary/90 ${focus}`}
    >
      {children}
    </Link>
  );
}

export function FooterLink({
  question,
  href,
  children,
}: {
  question: string;
  href: string;
  children: string;
}) {
  return (
    <p className="flex w-full justify-center gap-1.5 text-sm">
      <span className="text-muted">{question}</span>
      <Link href={href} className={`rounded font-semibold text-primary hover:underline ${focus}`}>
        {children}
      </Link>
    </p>
  );
}

export function BackLink({ href, children }: { href: string; children: string }) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center gap-1.5 self-start rounded text-sm font-semibold text-primary hover:underline ${focus}`}
    >
      <ChevronLeftIcon className="size-4" />
      {children}
    </Link>
  );
}

export function MailBadge() {
  return (
    <div className="flex size-16 items-center justify-center rounded-full bg-ok-soft">
      <MailIcon className="size-7 text-ok" />
    </div>
  );
}

export const linkClass = `rounded text-[13px] font-semibold text-primary hover:underline ${focus}`;
