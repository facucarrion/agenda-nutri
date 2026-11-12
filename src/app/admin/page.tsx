import { Suspense } from "react";
import { accessState } from "@/lib/access";
import { requireAdmin } from "@/lib/admin";
import { createAdminClient } from "@/lib/supabase/admin";
import { AdminHeader } from "./_components/admin-header";
import { AccountActions } from "./_components/account-actions";
import { CodeForm } from "./_components/code-form";

const TIMEZONE = "America/Argentina/Buenos_Aires";

const day = new Intl.DateTimeFormat("es-AR", { timeZone: TIMEZONE, dateStyle: "short" });
const dayTime = new Intl.DateTimeFormat("es-AR", {
  timeZone: TIMEZONE,
  dateStyle: "short",
  timeStyle: "short",
});
const formatDay = (iso: string | null) => (iso ? day.format(new Date(iso)) : "—");

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-4 rounded-[20px] border border-line bg-surface p-5 sm:p-7">
      <h2 className="text-[20px] font-bold">{title}</h2>
      {children}
    </section>
  );
}

const th = "px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-muted";
const td = "px-3 py-3 align-top text-sm";

// Account data only: names, plan and counts. Nothing about patients.
async function AdminHome() {
  const { email } = await requireAdmin();
  const db = createAdminClient();

  const [accounts, stats, users, codes, log] = await Promise.all([
    db
      .from("nutritionists")
      .select("id, full_name, business_name, slug, plan, trial_ends_at, active_until, created_at")
      .order("created_at", { ascending: false }),
    db.rpc("admin_account_stats"),
    db.auth.admin.listUsers({ page: 1, perPage: 200 }),
    db
      .from("invitation_codes")
      .select("code, business_name, note, trial_days, created_at, used_at, used_by")
      .order("created_at", { ascending: false })
      .limit(100),
    db
      .from("admin_log")
      .select("id, admin_email, action, target, created_at")
      .order("id", { ascending: false })
      .limit(30),
  ]);

  const emailById = new Map((users.data?.users ?? []).map((u) => [u.id, u.email ?? ""]));
  const statsById = new Map((stats.data ?? []).map((s) => [s.nutritionist_id, s]));
  const nameById = new Map(
    (accounts.data ?? []).map((a) => [a.id, a.business_name || a.full_name || "Sin nombre"]),
  );

  return (
    <>
      <AdminHeader />
      <main className="mx-auto flex w-full max-w-[1280px] flex-col gap-6 px-4 pb-16 pt-8 sm:px-12 sm:pt-10">
        <div>
          <h1 className="text-[32px] font-bold leading-tight">Administración</h1>
          <p className="text-muted">Sesión de {email}. Todo lo que hagas queda en el historial.</p>
        </div>

        <Section title="Crear código de invitación">
          <CodeForm />
        </Section>

        <Section title={`Cuentas (${accounts.data?.length ?? 0})`}>
          {accounts.error ? (
            <p className="text-muted">No pudimos cargar las cuentas.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[960px]">
                <thead>
                  <tr className="border-b border-line">
                    <th className={th}>Consultorio</th>
                    <th className={th}>Email</th>
                    <th className={th}>Estado</th>
                    <th className={th}>Vence</th>
                    <th className={th}>Pacientes</th>
                    <th className={th}>Turnos</th>
                    <th className={th}>Alta</th>
                    <th className={th}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {(accounts.data ?? []).map((a) => {
                    const access = accessState(a);
                    const s = statsById.get(a.id);
                    const name = a.business_name || a.full_name || "Sin nombre";
                    const label =
                      access.status === "active"
                        ? "Activa"
                        : access.status === "trial"
                          ? `Prueba (${access.daysLeft} d)`
                          : "Solo lectura";
                    const tone =
                      access.status === "expired"
                        ? "bg-[#fbe4e0] text-[#8a2a1c]"
                        : access.status === "trial"
                          ? "bg-[#fbf1d4] text-[#7a5a05]"
                          : "bg-primary-soft text-primary";
                    const ends = access.endsAt ? access.endsAt.toISOString() : null;

                    return (
                      <tr key={a.id} className="border-b border-line last:border-0">
                        <td className={td}>
                          <p className="font-semibold">{name}</p>
                          {a.business_name && a.full_name && (
                            <p className="text-muted">{a.full_name}</p>
                          )}
                        </td>
                        <td className={td}>{emailById.get(a.id) || "—"}</td>
                        <td className={td}>
                          <span
                            className={`whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold ${tone}`}
                          >
                            {label}
                          </span>
                        </td>
                        <td className={td}>{formatDay(ends)}</td>
                        <td className={td}>{s?.patients_count ?? 0}</td>
                        <td className={td}>
                          {s?.appointments_count ?? 0}
                          {s?.last_appointment_at && (
                            <span className="block text-xs text-muted">
                              último: {formatDay(s.last_appointment_at)}
                            </span>
                          )}
                        </td>
                        <td className={td}>{formatDay(a.created_at)}</td>
                        <td className={td}>
                          <AccountActions
                            id={a.id}
                            name={name}
                            plan={a.plan}
                            expired={access.status === "expired"}
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Section>

        <Section title="Códigos de invitación">
          {codes.error ? (
            <p className="text-muted">No pudimos cargar los códigos.</p>
          ) : (codes.data ?? []).length === 0 ? (
            <p className="text-muted">Todavía no hay códigos.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px]">
                <thead>
                  <tr className="border-b border-line">
                    <th className={th}>Código</th>
                    <th className={th}>Consultorio / nota</th>
                    <th className={th}>Prueba</th>
                    <th className={th}>Creado</th>
                    <th className={th}>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {(codes.data ?? []).map((c) => (
                    <tr key={c.code} className="border-b border-line last:border-0">
                      <td className={`${td} font-mono`}>{c.code}</td>
                      <td className={td}>
                        {c.business_name || "—"}
                        {c.note && <span className="block text-xs text-muted">{c.note}</span>}
                      </td>
                      <td className={td}>
                        {c.trial_days === 0 ? "Activa" : `${c.trial_days} días`}
                      </td>
                      <td className={td}>{formatDay(c.created_at)}</td>
                      <td className={td}>
                        {c.used_at
                          ? `Usado el ${formatDay(c.used_at)}${
                              c.used_by
                                ? ` por ${nameById.get(c.used_by) ?? "una cuenta borrada"}`
                                : ""
                            }`
                          : "Sin usar"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Section>

        <Section title="Historial">
          {(log.data ?? []).length === 0 ? (
            <p className="text-muted">Todavía no hay movimientos.</p>
          ) : (
            <ul className="flex flex-col divide-y divide-line text-sm">
              {(log.data ?? []).map((l) => (
                <li key={l.id} className="flex flex-wrap gap-x-3 gap-y-0.5 py-2">
                  <span className="text-muted">{dayTime.format(new Date(l.created_at))}</span>
                  <span className="font-medium">{l.admin_email}</span>
                  <span>{l.action}</span>
                  {l.target && (
                    <span className="text-muted">{nameById.get(l.target) ?? l.target}</span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </Section>
      </main>
    </>
  );
}

export default function AdminPage() {
  return (
    <Suspense fallback={<p className="px-4 py-10 text-muted sm:px-12">Cargando…</p>}>
      <AdminHome />
    </Suspense>
  );
}
