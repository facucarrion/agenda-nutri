"use client";

import { useEffect } from "react";
import { getTodayAppointmentCount } from "../_lib/today-count";
import { drawFavicon, type FaviconState } from "./favicon-art";

const SIZE = 64;
const SPIN_MS = 1400;
const SPIN_TURNS = 2;
const BOUNCE_MS = 700;

const easeOut = (t: number) => 1 - (1 - t) ** 3;
// 1 -> 1.25 -> 1, with a small overshoot on the way back.
const bounce = (t: number) => 1 + 0.25 * Math.sin(Math.PI * t) * (1 - t * 0.4);

// Turns the tab icon into a clock while the nutritionist is in the
// dashboard: the hands show the real time, the orange badge counts today's
// appointments, and a new appointment makes the hands spin and the badge
// jump. The static favicon stays as the fallback everywhere else.
export function LiveFavicon() {
  useEffect(() => {
    const canvas = document.createElement("canvas");
    canvas.width = SIZE;
    canvas.height = SIZE;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const links = Array.from(
      document.querySelectorAll<HTMLLinkElement>('link[rel~="icon"]'),
    );
    const originals = links.map((link) => link.href);
    let own: HTMLLinkElement | null = null;
    if (links.length === 0) {
      own = document.createElement("link");
      own.rel = "icon";
      document.head.appendChild(own);
      links.push(own);
    }

    let count = 0;
    let firstLoadDone = false;
    let stopped = false;
    let minuteTimer: ReturnType<typeof setTimeout> | undefined;
    let frameTimer: ReturnType<typeof setTimeout> | undefined;

    const paint = (extra: Partial<FaviconState> = {}) => {
      const now = new Date();
      drawFavicon(ctx, SIZE, {
        hours: now.getHours(),
        minutes: now.getMinutes(),
        count,
        ...extra,
      });
      const url = canvas.toDataURL("image/png");
      for (const link of links) {
        link.type = "image/png";
        link.href = url;
      }
    };

    // Timers instead of requestAnimationFrame, which does not run while the
    // tab is in the background, and that is when the favicon matters.
    const celebrate = () => {
      clearTimeout(frameTimer);
      const start = performance.now();
      const step = () => {
        if (stopped) return;
        const elapsed = performance.now() - start;
        const t = Math.min(elapsed / SPIN_MS, 1);
        const b = Math.min(elapsed / BOUNCE_MS, 1);
        paint({
          spin: SPIN_TURNS * easeOut(t) - SPIN_TURNS,
          badgeScale: b < 1 ? bounce(b) : 1,
        });
        if (t < 1) frameTimer = setTimeout(step, 50);
      };
      step();
    };

    const refreshCount = async () => {
      const next = await getTodayAppointmentCount();
      if (stopped) return;
      const isNew = next > count;
      count = next;
      if (isNew && firstLoadDone) celebrate();
      else paint();
    };

    const tick = () => {
      paint();
      void refreshCount();
      // Next tick right after the minute changes.
      const now = new Date();
      minuteTimer = setTimeout(
        tick,
        60_000 - now.getSeconds() * 1000 - now.getMilliseconds() + 50,
      );
    };

    paint();
    void refreshCount().then(() => {
      firstLoadDone = true;
    });
    const now = new Date();
    minuteTimer = setTimeout(
      tick,
      60_000 - now.getSeconds() * 1000 - now.getMilliseconds() + 50,
    );

    // Coming back to the tab: catch up at once instead of waiting a minute.
    const onVisible = () => {
      if (document.visibilityState === "visible") void refreshCount();
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      stopped = true;
      clearTimeout(minuteTimer);
      clearTimeout(frameTimer);
      document.removeEventListener("visibilitychange", onVisible);
      links.forEach((link, i) => {
        if (link !== own) link.href = originals[i];
      });
      own?.remove();
    };
  }, []);

  return null;
}
