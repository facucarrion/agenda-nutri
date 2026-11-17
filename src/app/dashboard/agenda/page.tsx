import { Suspense } from "react";
import { connection } from "next/server";
import { displayName, getCurrentProfile } from "@/lib/nutritionist";
import { getActiveTypes, getAppointments, getSchedule } from "../_lib/data";
import { AgendaView } from "./agenda-view";

async function Agenda() {
  await connection(); // "today" must be computed per request
  const now = new Date();
  const [appointments, schedule, types, profile] = await Promise.all([
    getAppointments(now),
    getSchedule(now),
    getActiveTypes(),
    getCurrentProfile(),
  ]);

  return (
    <AgendaView
      initialAppointments={appointments}
      schedule={schedule}
      types={types}
      senderName={displayName(profile)}
      now={now.toISOString()}
    />
  );
}

export default function AgendaPage() {
  return (
    <main className="mx-auto w-full max-w-[1280px] px-4 pb-12 pt-5 sm:px-12 sm:pt-6">
      <Suspense fallback={<p className="text-muted">Cargando agenda...</p>}>
        <Agenda />
      </Suspense>
    </main>
  );
}
