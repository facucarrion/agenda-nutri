import { Suspense } from "react";
import { connection } from "next/server";
import { getMockAppointments, getMockSchedule } from "../_lib/mock-data";
import { AgendaView } from "./agenda-view";

// TODO(backend): replace the mocks with listAppointments() from
// @/lib/appointments and the availability_rules / availability_blocks rows.
async function Agenda() {
  await connection(); // "today" must be computed per request
  const now = new Date();
  return (
    <AgendaView
      initialAppointments={getMockAppointments(now)}
      schedule={getMockSchedule(now)}
      now={now.toISOString()}
    />
  );
}

export default function AgendaPage() {
  return (
    <main className="mx-auto w-full max-w-[1280px] px-4 pb-16 pt-8 sm:px-12 sm:pt-10">
      <Suspense fallback={<p className="text-muted">Cargando agenda...</p>}>
        <Agenda />
      </Suspense>
    </main>
  );
}
