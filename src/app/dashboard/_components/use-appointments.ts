"use client";

import { useRouter } from "next/navigation";
import { useOptimistic, useState, useTransition } from "react";
import {
  cancelAppointment,
  completeAppointment,
  confirmAppointment,
  markNoShow,
} from "../agenda/actions";
import type { AppointmentStatus, DashboardAppointment } from "../_lib/types";

const ACTIONS = {
  confirmed: confirmAppointment,
  cancelled: cancelAppointment,
  completed: completeAppointment,
  no_show: markNoShow,
} as const;

type Change = { id: string; status: AppointmentStatus };

// The list comes from the server. A change shows up right away and is then
// replaced by the refreshed server data (or rolled back if the action fails).
export function useAppointments(initial: DashboardAppointment[]) {
  const [appointments, applyChange] = useOptimistic(
    initial,
    (list, change: Change) =>
      list.map((a) => (a.id === change.id ? { ...a, status: change.status } : a)),
  );
  const [notify, setNotify] = useState<DashboardAppointment | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, startTransition] = useTransition();
  const router = useRouter();

  function setStatus(id: string, status: AppointmentStatus) {
    const action = ACTIONS[status as keyof typeof ACTIONS];
    if (!action) return;

    setError(null);
    startTransition(async () => {
      applyChange({ id, status });
      const result = await action(id);
      if (!result.ok) {
        setError(result.error);
        // The list is probably out of date (another device, an expired
        // request): reload it so the screen shows the real state.
        router.refresh();
      }
    });
  }

  return { appointments, setStatus, notify, setNotify, error, saving };
}
