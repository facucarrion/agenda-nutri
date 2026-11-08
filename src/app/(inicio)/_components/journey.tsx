"use client";

import { useEffect, useRef } from "react";

// A vertical thread that fills with color as the page is scrolled. Each
// child marked data-step carries a numbered node (data-node) on the thread:
// the node lights up once the thread reaches it, and the step gets
// data-glow while it is in view (the screenshot's glow follows that).
// With reduced motion everything is shown lit from the start.
export function Journey({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const steps = [...root.querySelectorAll<HTMLElement>("[data-step]")];
    let frame = 0;

    const update = () => {
      frame = 0;
      const box = root.getBoundingClientRect();
      const mid = window.innerHeight * 0.55;

      root.style.setProperty(
        "--fill",
        `${reduce ? box.height : Math.min(Math.max(mid - box.top, 0), box.height)}px`,
      );

      for (const step of steps) {
        const r = step.getBoundingClientRect();
        const lit = reduce || r.top + r.height / 2 <= mid;
        const inView = reduce || (r.top < window.innerHeight * 0.7 && r.bottom > window.innerHeight * 0.15);
        step.toggleAttribute("data-lit", lit);
        step.toggleAttribute("data-glow", inView);
      }
    };

    const request = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", request, { passive: true });
    window.addEventListener("resize", request);
    return () => {
      window.removeEventListener("scroll", request);
      window.removeEventListener("resize", request);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div ref={ref} className="journey relative flex flex-col gap-24 pl-11 sm:gap-32 sm:pl-16">
      <span aria-hidden className="journey-track" />
      <span aria-hidden className="journey-fill" />
      {children}
    </div>
  );
}
