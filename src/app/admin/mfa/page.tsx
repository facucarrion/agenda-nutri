import { Suspense } from "react";
import { notFound, redirect } from "next/navigation";
import { checkAdmin } from "@/lib/admin";
import { MfaForm } from "./mfa-form";

// Second factor for admins: scan a QR once, then a 6-digit code each session.
async function Mfa() {
  const check = await checkAdmin();
  if (check.status === "none") notFound();
  if (check.status === "ok") redirect("/admin");
  return <MfaForm />;
}

export default function MfaPage() {
  return (
    <main className="mx-auto flex w-full max-w-[480px] flex-col gap-5 px-4 pb-16 pt-12">
      <Suspense fallback={<p className="text-muted">Cargando…</p>}>
        <Mfa />
      </Suspense>
    </main>
  );
}
