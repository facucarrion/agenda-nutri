import { getCurrentAccess } from "@/lib/access-server";
import { ACTIVATE_ACCOUNT_HREF } from "@/lib/legal";
import { TRIAL_WARNING_DAYS } from "@/lib/access";

// Trial notice under the header. Quiet while there is time left, visible in
// the last days, and explicit once the account is read-only. Rendered inside
// <Suspense> because it reads the session.
export async function AccessBanner() {
  const access = await getCurrentAccess();
  if (!access) return null;

  if (access.status === "active") {
    // A paid period about to end gets the same warning as a trial.
    if (access.daysLeft === null || access.daysLeft > TRIAL_WARNING_DAYS) return null;
    return (
      <Notice tone="warning">
        Tu plan vence {access.daysLeft === 1 ? "mañana" : `en ${access.daysLeft} días`}.
      </Notice>
    );
  }

  if (access.status === "trial") {
    if (access.daysLeft > TRIAL_WARNING_DAYS) {
      return (
        <Notice tone="info">
          Estás en tu prueba gratuita: te quedan {access.daysLeft} días.
        </Notice>
      );
    }
    return (
      <Notice tone="warning">
        Tu prueba gratuita termina {access.daysLeft === 1 ? "mañana" : `en ${access.daysLeft} días`}.
        Después vas a poder ver tu agenda, pero no cargar ni editar turnos.
      </Notice>
    );
  }

  return (
    <Notice tone="blocked">
      Tu prueba gratuita terminó. Podés ver tu agenda y descargar los datos de tus
      pacientes, pero no cargar ni editar turnos, y tu link de reserva está en
      pausa. Tus datos están a salvo.
    </Notice>
  );
}

function Notice({
  tone,
  children,
}: {
  tone: "info" | "warning" | "blocked";
  children: React.ReactNode;
}) {
  const colors = {
    info: "bg-primary-soft text-primary",
    warning: "bg-[#fbf1d4] text-[#7a5a05]",
    blocked: "bg-[#fbe4e0] text-[#8a2a1c]",
  }[tone];

  return (
    <div className={colors}>
      <div className="mx-auto flex w-full max-w-[1280px] flex-wrap items-center justify-between gap-x-4 gap-y-1 px-4 py-2 text-sm font-medium sm:px-12">
        <p>{children}</p>
        {tone !== "info" && (
          <a href={ACTIVATE_ACCOUNT_HREF} className="font-semibold underline underline-offset-2">
            Activar mi cuenta
          </a>
        )}
      </div>
    </div>
  );
}
