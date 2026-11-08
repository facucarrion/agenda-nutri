"use client";

import { useEffect, useRef } from "react";

// On phones the three plans sit side by side in a row that swipes, and it
// opens centered on the featured plan. From lg up it is a plain 3-column grid.
export function PlansCarousel({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const list = ref.current;
    if (!list || list.scrollWidth <= list.clientWidth) return;
    const featured = list.querySelector<HTMLElement>("[data-featured]");
    if (!featured) return;
    list.scrollLeft =
      featured.offsetLeft - (list.clientWidth - featured.offsetWidth) / 2;
  }, []);

  return (
    <ul
      ref={ref}
      className="reveal relative -mx-4 flex w-[calc(100%+2rem)] snap-x snap-mandatory gap-4 overflow-x-auto px-[7%] py-12 [scrollbar-width:none] sm:-mx-8 sm:w-[calc(100%+4rem)] lg:mx-0 lg:grid lg:w-full lg:grid-cols-3 lg:gap-6 lg:overflow-visible lg:px-0 lg:py-0 [&::-webkit-scrollbar]:hidden"
    >
      {children}
    </ul>
  );
}
