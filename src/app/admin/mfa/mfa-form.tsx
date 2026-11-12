"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Step =
  | { kind: "loading" }
  | { kind: "verify"; factorId: string }
  | { kind: "enroll"; factorId: string; qr: string; secret: string }
  | { kind: "error"; message: string };

export function MfaForm() {
  const router = useRouter();
  const [step, setStep] = useState<Step>({ kind: "loading" });
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    let cancelled = false;

    async function start() {
      const { data, error } = await supabase.auth.mfa.listFactors();
      if (cancelled) return;
      if (error) return setStep({ kind: "error", message: "No pudimos cargar tu verificación." });

      const verified = data.totp[0];
      if (verified) return setStep({ kind: "verify", factorId: verified.id });

      // An earlier setup that was never finished would block a new one.
      for (const factor of data.all) {
        if (factor.factor_type === "totp" && factor.status === "unverified") {
          await supabase.auth.mfa.unenroll({ factorId: factor.id });
        }
      }

      const enrolled = await supabase.auth.mfa.enroll({
        factorType: "totp",
        friendlyName: `Admin ${Date.now()}`,
      });
      if (cancelled) return;
      if (enrolled.error) {
        return setStep({ kind: "error", message: "No pudimos iniciar la configuración." });
      }
      setStep({
        kind: "enroll",
        factorId: enrolled.data.id,
        qr: enrolled.data.totp.qr_code,
        secret: enrolled.data.totp.secret,
      });
    }

    void start();
    return () => {
      cancelled = true;
    };
  }, []);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (step.kind !== "verify" && step.kind !== "enroll") return;
    setBusy(true);
    setError(null);

    const { error } = await createClient().auth.mfa.challengeAndVerify({
      factorId: step.factorId,
      code: code.trim(),
    });
    if (error) {
      setBusy(false);
      setCode("");
      return setError("El código no es válido. Probá con el que muestra ahora tu app.");
    }
    router.replace("/admin");
    router.refresh();
  }

  if (step.kind === "loading") return <p className="text-muted">Cargando…</p>;
  if (step.kind === "error") {
    return (
      <p role="alert" className="text-[#8a2a1c]">
        {step.message}
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-5 rounded-[20px] border border-line bg-surface p-7">
      <h1 className="text-[24px] font-bold">Verificación en dos pasos</h1>

      {step.kind === "enroll" ? (
        <>
          <p className="text-muted">
            Escaneá el QR con una app de autenticación (Google Authenticator, Authy, 1Password…) y
            escribí el código de 6 dígitos que te muestra.
          </p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={step.qr} alt="QR para tu app de autenticación" className="size-44 self-center" />
          <p className="break-all text-center font-mono text-xs text-muted">
            ¿No podés escanear? Clave: {step.secret}
          </p>
        </>
      ) : (
        <p className="text-muted">Ingresá el código de 6 dígitos de tu app de autenticación.</p>
      )}

      <form onSubmit={submit} className="flex flex-col gap-3">
        <input
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
          inputMode="numeric"
          autoComplete="one-time-code"
          aria-label="Código de 6 dígitos"
          placeholder="123456"
          required
          className="rounded-xl border border-line px-3.5 py-2.5 text-center text-[20px] tracking-[0.3em] outline-none focus:border-primary"
        />
        {error && (
          <p role="alert" className="text-sm font-medium text-[#8a2a1c]">
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={busy || code.length !== 6}
          className="rounded-full bg-primary px-5 py-2.5 font-semibold text-white disabled:opacity-60"
        >
          {busy ? "Verificando…" : "Verificar"}
        </button>
      </form>
    </div>
  );
}
