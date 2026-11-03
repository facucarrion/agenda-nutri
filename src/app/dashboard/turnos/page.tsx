import { Suspense } from "react";
import { connection } from "next/server";
import { AppointmentsBoard } from "./appointments-board";
import { getMockAppointments } from "../_lib/mock-data";

// TODO(backend): replace getMockAppointments with listAppointments() from
// @/lib/appointments, and the board's local state changes with the actions
// in ../agenda/actions.ts (cancel, complete, markNoShow; confirm is still missing).
async function Agenda() {
  await connection(); // "today" must be computed per request
  const now = new Date();
  return (
    <AppointmentsBoard
      initialAppointments={getMockAppointments(now)}
      now={now.toISOString()}
    />
  );
}

export default function AgendaPage() {
  return (
    <main className="mx-auto w-full max-w-[1280px] px-4 pb-16 pt-8 sm:px-12 sm:pt-10">
      <Suspense fallback={<p className="text-muted">Cargando turnos...</p>}>
        <Agenda />
      </Suspense>
    </main>
  );
}
