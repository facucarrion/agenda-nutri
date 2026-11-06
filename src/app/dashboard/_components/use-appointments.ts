"use client";

import { useRouter } from "next/navigation";
import { useOptimistic, useState, useTransition } from "react";
import {
  cancelAppointment,
  completeAppointment,
  confirmAppointment,
  markNoShow,
  markWhatsappReminded,
} from "../agenda/actions";
import type { AppointmentStatus, DashboardAppointment } from "../_lib/types";

const ACTIONS = {
  confirmed: confirmAppointment,
  cancelled: cancelAppointment,
  completed: completeAppointment,
  no_show: markNoShow,
} as const;

type Change =
  | { id: string; status: AppointmentStatus }
  | { id: string; remindedAt: string };

// The list comes from the server. A change shows up right away and is then
// replaced by the refreshed server data (or rolled back if the action fails).
export function useAppointments(initial: DashboardAppointment[]) {
  const [appointments, applyChange] = useOptimistic(
    initial,
    (list, change: Change) =>
      list.map((a) => {
        if (a.id !== change.id) return a;
        return "status" in change
          ? { ...a, status: change.status }
          : { ...a, whatsapp_reminded_at: change.remindedAt };
      }),
  );
  const [notify, setNotify] = useState<DashboardAppointment | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, startTransition] = useTransition();
  const router = useRouter();

  // Runs the action after the change is shown. If it fails the list is
  // probably out of date (another device, an expired request): reload it so
  // the screen shows the real state.
  function commit(
    change: Change,
    action: () => Promise<{ ok: true } | { ok: false; error: string }>,
  ) {
    setError(null);
    startTransition(async () => {
      applyChange(change);
      const result = await action();
      if (!result.ok) {
        setError(result.error);
        router.refresh();
      }
    });
  }

  function setStatus(id: string, status: AppointmentStatus) {
    const action = ACTIONS[status as keyof typeof ACTIONS];
    if (action) commit({ id, status }, () => action(id));
  }

  // Marks the WhatsApp reminder of a turno as sent.
  function markReminded(id: string) {
    commit({ id, remindedAt: new Date().toISOString() }, () => markWhatsappReminded(id));
  }

  return { appointments, setStatus, markReminded, notify, setNotify, error, saving };
}
