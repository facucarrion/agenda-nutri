"use client";

import { useState, useTransition } from "react";

type Result = { ok: true } | { ok: false; error: string };

// Runs a server action with a loading flag and its error message. The action
// revalidates the page, so the new data arrives with the same transition.
export function useRun() {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function run(action: () => Promise<Result>, onDone?: () => void) {
    setError(null);
    startTransition(async () => {
      const result = await action();
      if (result.ok) onDone?.();
      else setError(result.error);
    });
  }

  return { run, error, pending };
}
