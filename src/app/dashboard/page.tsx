import { Suspense } from "react";
import { logout } from "@/app/(auth)/actions";
import { createClient } from "@/lib/supabase/server";

async function Greeting() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: nutritionist } = await supabase
    .from("nutritionists")
    .select("full_name, slug")
    .eq("id", user!.id)
    .single();

  return (
    <>
      <h1 className="text-2xl font-semibold">
        Hola{nutritionist?.full_name ? `, ${nutritionist.full_name}` : ""}
      </h1>
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        Acá va a estar tu agenda. Tu link de reserva será{" "}
        <code>/reservar/{nutritionist?.slug}</code>.
      </p>
    </>
  );
}

export default function DashboardPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col gap-4 px-4 py-16">
      <Suspense fallback={<p className="text-sm">Cargando...</p>}>
        <Greeting />
      </Suspense>
      <form action={logout}>
        <button type="submit" className="rounded border px-3 py-1 text-sm">
          Cerrar sesión
        </button>
      </form>
    </main>
  );
}
