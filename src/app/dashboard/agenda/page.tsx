import { Suspense } from "react";
import { connection } from "next/server";
import { getAppointments, getSchedule } from "../_lib/data";
import { AgendaView } from "./agenda-view";

async function Agenda() {
  await connection(); // "today" must be computed per request
  const now = new Date();
  const [appointments, schedule] = await Promise.all([
    getAppointments(now),
    getSchedule(now),
  ]);

  return (
    <AgendaView
      initialAppointments={appointments}
      schedule={schedule}
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
