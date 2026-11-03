"use client";

import { useEffect, useState } from "react";

const ROTATE_MS = 10_000;

const leaf = "#2e9e5b";
const stem = "#6b4a2b";

// Own inline SVGs (32x32), so there are no image files to host.
const FRUITS: { name: string; art: React.ReactNode }[] = [
  {
    name: "manzana",
    art: (
      <>
        <path
          d="M16 9c-3-2.4-9-1.4-9 6 0 6 4 12 7 12 1.2 0 1.4-.6 2-.6s.8.6 2 .6c3 0 7-6 7-12 0-7.4-6-8.4-9-6Z"
          fill="#d64545"
        />
        <path d="M16 9c0-2 .6-4 2-5" stroke={stem} strokeWidth="1.8" strokeLinecap="round" fill="none" />
        <path d="M18 6c2.5-1.8 5-1 6 .5-2.5 1.6-5 1.2-6-.5Z" fill={leaf} />
        <path d="M10 14c.4-1.6 1.4-2.6 2.8-3" stroke="#fff" strokeOpacity=".5" strokeWidth="1.6" strokeLinecap="round" fill="none" />
      </>
    ),
  },
  {
    name: "naranja",
    art: (
      <>
        <circle cx="16" cy="18" r="10" fill="#f08a24" />
        <path d="M16 8c0-1.6.8-3 2-3.6" stroke={stem} strokeWidth="1.6" strokeLinecap="round" fill="none" />
        <path d="M17 7c2.5-2 5.5-1.4 6.5.2-2.6 1.8-5.4 1.6-6.5-.2Z" fill={leaf} />
        <path d="M9.5 15c.7-2 2-3.3 3.8-4" stroke="#fff" strokeOpacity=".45" strokeWidth="1.8" strokeLinecap="round" fill="none" />
      </>
    ),
  },
  {
    name: "pera",
    art: (
      <>
        <path
          d="M16 8c-3 0-4.4 2.6-5 5-.6 2.4-3.4 3.8-3.4 7.4 0 4.2 3.6 6.6 8.4 6.6s8.4-2.4 8.4-6.6c0-3.6-2.8-5-3.4-7.4-.6-2.4-2-5-5-5Z"
          fill="#a8c545"
        />
        <path d="M16 8c0-1.8.4-3.4 1.6-4.4" stroke={stem} strokeWidth="1.7" strokeLinecap="round" fill="none" />
        <path d="M17.4 6.2c2.2-1.6 4.8-1 5.6.6-2.2 1.4-4.6 1.2-5.6-.6Z" fill={leaf} />
        <path d="M11.5 20c.2-1.8 1-3 2.2-3.8" stroke="#fff" strokeOpacity=".45" strokeWidth="1.6" strokeLinecap="round" fill="none" />
      </>
    ),
  },
  {
    name: "frutilla",
    art: (
      <>
        <path
          d="M16 28C9 24 6 18.5 6.6 14.2 7 11 9.6 9.4 12.4 9.8c1.2.2 2.4.6 3.6.6s2.4-.4 3.6-.6c2.8-.4 5.4 1.2 5.8 4.4C25.9 18.5 23 24 16 28Z"
          fill="#e04a5a"
        />
        <path d="M10 9.6 16 6l6 3.6-6-.4-6 .4Z" fill={leaf} />
        <path d="M16 6V3.6" stroke={leaf} strokeWidth="1.8" strokeLinecap="round" />
        <g fill="#fbe7a1">
          <ellipse cx="12" cy="15" rx=".9" ry="1.3" />
          <ellipse cx="17" cy="14" rx=".9" ry="1.3" />
          <ellipse cx="20.5" cy="17.5" rx=".9" ry="1.3" />
          <ellipse cx="14.5" cy="19.5" rx=".9" ry="1.3" />
          <ellipse cx="17.5" cy="22" rx=".9" ry="1.3" />
          <ellipse cx="11.5" cy="19" rx=".9" ry="1.3" />
        </g>
      </>
    ),
  },
  {
    name: "limón",
    art: (
      <>
        <path
          d="M4.5 16.5c0-1.2.9-2 2-2.2.9-.2 1.4-.6 1.9-1.2C10.4 10.6 13 9 16 9s5.6 1.6 7.6 4.1c.5.6 1 1 1.9 1.2 1.1.2 2 1 2 2.2s-.9 2-2 2.2c-.9.2-1.4.6-1.9 1.2C21.6 22.4 19 24 16 24s-5.6-1.6-7.6-4.1c-.5-.6-1-1-1.9-1.2-1.1-.2-2-1-2-2.2Z"
          fill="#f2cf3a"
        />
        <path d="M10 15.5c1-1.8 2.6-2.8 4.6-3" stroke="#fff" strokeOpacity=".5" strokeWidth="1.7" strokeLinecap="round" fill="none" />
        <path d="M22 8c2.6-.6 4.4.4 4.8 2-2.2 1.2-4.4.8-4.8-2Z" fill={leaf} />
      </>
    ),
  },
];

// Logo for the patient header: the fruit changes every 10 seconds with a soft
// cross-fade, and reacts to hover together with the page name.
export function FruitLogo() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(
      () => setIndex((i) => (i + 1) % FRUITS.length),
      ROTATE_MS,
    );
    return () => clearInterval(id);
  }, []);

  return (
    <span className="relative inline-block h-9 w-9" aria-hidden>
      <span className="pointer-events-none absolute -inset-3 rounded-full bg-[radial-gradient(closest-side,rgba(46,158,91,0.5),rgba(47,107,79,0.22)_55%,transparent)] opacity-0 blur-md transition-opacity duration-500 ease-out group-hover:opacity-100 motion-reduce:transition-none" />
      <span className="absolute inset-0 origin-center transition-transform duration-300 ease-out group-hover:-rotate-12 group-hover:scale-125 motion-reduce:transition-none">
        {FRUITS.map((fruit, i) => (
          <svg
            key={fruit.name}
            viewBox="0 0 32 32"
            className={`absolute inset-0 h-full w-full transition-all duration-1000 ease-in-out motion-reduce:transition-none ${
              i === index ? "scale-100 opacity-100" : "scale-75 opacity-0"
            }`}
          >
            {fruit.art}
          </svg>
        ))}
      </span>
    </span>
  );
}
