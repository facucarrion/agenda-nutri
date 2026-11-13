import Image from "next/image";
import Link from "next/link";
import { PILOT_WHATSAPP_HREF } from "@/lib/legal";
import { PilotWhatsappLink } from "./pilot-whatsapp-link";

// Two bunches of fruit and leaves hide behind each card and come out of its
// top-left and bottom-right corners when the card is hovered. Each bunch is
// one transparent image, CLUSTER_W x CLUSTER_H on screen.
const CLUSTER_W = 192;
const CLUSTER_H = 144;

export type Plan = {
  name: string;
  tagline: string;
  price: string;
  // Regular price, shown struck through before `price` (e.g. during a trial).
  listPrice?: string;
  period?: string;
  badge?: string;
  featured?: boolean;
  cta: { label: string; href: string };
  features: string[];
  // Images of the two bunches: top-left corner and bottom-right corner.
  fruits: { top: string; bottom: string };
};

const focusDark =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tangerine/70 focus-visible:ring-offset-2 focus-visible:ring-offset-forest";

function Check({ className }: { className: string }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`mt-px size-5 shrink-0 ${className}`}
      aria-hidden
    >
      <path d="m4.5 10.5 3.5 3.5 7.5-8" />
    </svg>
  );
}

// How many features a phone shows before the "Ver todo" toggle.
const FEATURES_FOLDED = 4;

function Feature({
  item,
  featured,
  className = "flex",
}: {
  item: string;
  featured?: boolean;
  className?: string;
}) {
  return (
    <li className={`${className} items-start gap-3 break-words text-[15px] leading-[22px]`}>
      <Check className={featured ? "text-forest" : "text-tangerine"} />
      {item}
    </li>
  );
}

export function PlanCard({ plan }: { plan: Plan }) {
  const f = plan.featured;
  // On phones, long feature lists show the first few and fold the rest.
  const shown = plan.features.slice(0, FEATURES_FOLDED);
  const rest = plan.features.slice(FEATURES_FOLDED);
  const CtaTag = plan.cta.href.startsWith("/") ? Link : "a";
  const ctaClass = `flex w-full items-center justify-center rounded-full px-7 py-3.5 text-center text-[16px] font-semibold leading-6 transition-colors ${focusDark} ${
            f
              ? "bg-tangerine text-forest hover:bg-[#f59d55]"
              : "border border-cream/50 text-cream hover:border-cream hover:bg-cream/10"
          }`;

  return (
    <li
      data-featured={f ? "" : undefined}
      data-plan={plan.name.toLowerCase()}
      className="plan group relative isolate flex min-w-0"
    >
      {/* Glow behind the card */}
      <div
        aria-hidden
        className={`plan-glow pointer-events-none absolute -inset-x-3 -inset-y-4 -z-20 rounded-[32px] blur-xl sm:-inset-x-12 sm:-inset-y-10 sm:rounded-[64px] ${
          f
            ? "bg-[radial-gradient(closest-side,rgba(242,140,56,0.7),rgba(242,140,56,0.32)_65%,transparent)]"
            : "bg-[radial-gradient(closest-side,rgba(143,214,170,0.5),rgba(242,140,56,0.22)_65%,transparent)]"
        }`}
      />

      {/* Fruit bunches behind the card corners */}
      {(
        [
          { src: plan.fruits.top, corner: "top-left" },
          { src: plan.fruits.bottom, corner: "bottom-right" },
        ] as const
      ).map(({ src, corner }) => (
        <Image
          key={corner}
          src={src}
          alt=""
          width={CLUSTER_W}
          height={CLUSTER_H}
          quality={90}
          aria-hidden
          className={`plan-fruit plan-fruit--${corner} pointer-events-none absolute -z-10 hidden select-none sm:block`}
        />
      ))}

      <div
        className={`plan-card flex w-full flex-col gap-5 rounded-3xl px-6 pb-8 pt-7 sm:gap-[22px] sm:rounded-[28px] sm:px-9 sm:pb-10 sm:pt-9 ${
          f
            ? "bg-cream text-forest shadow-[0_24px_48px_rgba(0,0,0,0.35)] ring-2 ring-tangerine sm:ring-0"
            : "border border-cream/14 bg-forest-2 text-cream"
        }`}
      >
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-[22px] font-semibold leading-8 sm:text-[24px]">{plan.name}</h3>
          {plan.badge &&
            (f ? (
              <span className="shrink-0 whitespace-nowrap rounded-full bg-tangerine px-3 py-[5px] text-[12px] font-bold leading-4 text-forest">
                {plan.badge}
              </span>
            ) : (
              <span className="shrink-0 whitespace-nowrap rounded-full border border-cream/35 px-3 py-[5px] text-[12px] font-bold leading-4 text-sage-light">
                {plan.badge}
              </span>
            ))}
        </div>
        <p className={`text-[15px] leading-[22px] ${f ? "text-slate-green" : "text-sage"}`}>
          {plan.tagline}
        </p>
        <p className="flex flex-wrap items-end gap-x-1.5">
          {plan.listPrice && (
            <del
              className={`mr-1 self-center text-[22px] font-semibold leading-8 decoration-tangerine decoration-2 sm:text-[24px] ${f ? "text-slate-green" : "text-sage"}`}
            >
              <span className="sr-only">Antes </span>
              {plan.listPrice}
            </del>
          )}
          <span className="text-[44px] font-bold leading-[48px] tracking-[-0.02em] sm:text-[48px] sm:leading-[52px]">{plan.price}</span>
          {plan.period && (
            <span className={`text-[16px] font-medium leading-6 ${f ? "text-slate-green" : "text-sage"}`}>
              {plan.period}
            </span>
          )}
        </p>
        {plan.cta.href === PILOT_WHATSAPP_HREF ? (
          <PilotWhatsappLink className={ctaClass}>{plan.cta.label}</PilotWhatsappLink>
        ) : (
          <CtaTag href={plan.cta.href} className={ctaClass}>
            {plan.cta.label}
          </CtaTag>
        )}
        <hr className={`border-0 border-t ${f ? "border-forest/14" : "border-cream/14"}`} />
        <ul className="flex flex-col gap-3 sm:gap-3.5">
          {shown.map((item) => (
            <Feature key={item} item={item} featured={f} />
          ))}
          {/* From sm up the whole list is shown. */}
          {rest.map((item) => (
            <Feature key={item} item={item} featured={f} className="hidden sm:flex" />
          ))}
        </ul>
        {/* On phones a long list starts folded so the card stays short. */}
        {rest.length > 0 && (
          <details className="group/more -mt-2 sm:hidden">
            <summary
              className={`flex cursor-pointer list-none items-center justify-between gap-3 rounded-lg py-2 text-[15px] font-semibold leading-[22px] [&::-webkit-details-marker]:hidden ${focusDark}`}
            >
              <span className="group-open/more:hidden">Ver todo lo que incluye</span>
              <span className="hidden group-open/more:inline">Ver menos</span>
              <svg
                viewBox="0 0 20 20"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                className="size-6 shrink-0 rounded-full border border-current p-1 transition-transform group-open/more:rotate-45"
                aria-hidden
              >
                <path d="M10 4v12M4 10h12" />
              </svg>
            </summary>
            <ul className="flex flex-col gap-3 pt-2">
              {rest.map((item) => (
                <Feature key={item} item={item} featured={f} />
              ))}
            </ul>
          </details>
        )}
      </div>
    </li>
  );
}
