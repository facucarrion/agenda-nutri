import { Suspense } from "react";
import { connection } from "next/server";
import { getActiveTypes, getAppointments } from "../_lib/data";
import { AppointmentsBoard } from "./appointments-board";

async function Appointments() {
  await connection(); // "today" must be computed per request
  const now = new Date();
  const [appointments, types] = await Promise.all([getAppointments(now), getActiveTypes()]);

  return (
    <AppointmentsBoard
      initialAppointments={appointments}
      types={types}
      now={now.toISOString()}
    />
  );
}

export default function AppointmentsPage() {
  return (
    <main className="mx-auto w-full max-w-[1280px] px-4 pb-16 pt-8 sm:px-12 sm:pt-10">
      <Suspense fallback={<p className="text-muted">Cargando turnos...</p>}>
        <Appointments />
      </Suspense>
    </main>
  );
}
