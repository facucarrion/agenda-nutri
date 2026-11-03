"use client";

import { useState } from "react";
import type { AppointmentStatus, MockAppointment } from "../_lib/mock-data";

// Local state for the mocked appointments.
// TODO(backend): call the matching server action in agenda/actions.ts
// (cancel, complete, markNoShow; confirm is still missing) and refresh.
export function useAppointments(initial: MockAppointment[]) {
  const [appointments, setAppointments] = useState(initial);
  const [notify, setNotify] = useState<MockAppointment | null>(null);

  function setStatus(id: string, status: AppointmentStatus) {
    setAppointments((list) => list.map((a) => (a.id === id ? { ...a, status } : a)));
  }

  return { appointments, setStatus, notify, setNotify };
}
