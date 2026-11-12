"use client";

import { useState } from "react";
import { PILOT_WHATSAPP_NUMBERS, pilotWhatsappHref } from "@/lib/legal";

// Sends each click to the next number in the list, so requests take turns
// between the team's phones. The turn is remembered in the browser, and the
// first click picks a random phone so new visitors are split between them.
const STORAGE_KEY = "pilot-whatsapp-turn";

function nextTurn(): number {
  const count = PILOT_WHATSAPP_NUMBERS.length;
  try {
    const saved = Number(localStorage.getItem(STORAGE_KEY));
    const turn = Number.isInteger(saved) && saved > 0
      ? saved % count
      : Math.floor(Math.random() * count);
    localStorage.setItem(STORAGE_KEY, String(turn + 1));
    return turn;
  } catch {
    return Math.floor(Math.random() * count);
  }
}

export function PilotWhatsappLink({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  // Rendered with the first number so the link works without JavaScript.
  const [href, setHref] = useState(pilotWhatsappHref(PILOT_WHATSAPP_NUMBERS[0]));

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      onClick={(e) => {
        const next = pilotWhatsappHref(PILOT_WHATSAPP_NUMBERS[nextTurn()]);
        setHref(next);
        e.currentTarget.href = next;
      }}
    >
      {children}
    </a>
  );
}
