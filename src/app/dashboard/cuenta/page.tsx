import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { ChangePasswordForm } from "./change-password-form";

async function Account() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <>
      <h1 className="text-[34px] font-bold leading-tight tracking-tight sm:text-[40px]">
        Mi cuenta
      </h1>
      <p className="mt-1 text-muted">Cambiá tu contraseña cuando lo necesites.</p>
      <div className="mt-6">
        <ChangePasswordForm email={user?.email ?? ""} />
      </div>
    </>
  );
}

export default function AccountPage() {
  return (
    <main className="mx-auto w-full max-w-[1280px] px-4 pb-16 pt-8 sm:px-12 sm:pt-10">
      <Suspense fallback={<p className="text-muted">Cargando...</p>}>
        <Account />
      </Suspense>
    </main>
  );
}
