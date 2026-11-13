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
      className={`mt-px size-3 shrink-0 sm:size-5 ${className}`}
      aria-hidden
    >
      <path d="m4.5 10.5 3.5 3.5 7.5-8" />
    </svg>
  );
}

export function PlanCard({ plan }: { plan: Plan }) {
  const f = plan.featured;
  const CtaTag = plan.cta.href.startsWith("/") ? Link : "a";
  const ctaClass = `flex w-full items-center justify-center rounded-full px-1.5 py-1.5 text-center text-[10px] font-semibold leading-[14px] transition-colors sm:px-7 sm:py-3.5 sm:text-[16px] sm:leading-6 ${focusDark} ${
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
        className={`plan-card flex w-full flex-col gap-2 rounded-2xl px-2 pb-3 pt-3 sm:gap-[22px] sm:rounded-[28px] sm:px-9 sm:pb-10 sm:pt-9 ${
          f
            ? "bg-cream text-forest shadow-[0_24px_48px_rgba(0,0,0,0.35)]"
            : "border border-cream/14 bg-forest-2 text-cream"
        }`}
      >
        <div className="flex min-h-[34px] flex-col items-start gap-1 sm:min-h-0 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
          <h3 className="text-[13px] font-semibold leading-5 sm:text-[24px] sm:leading-8">{plan.name}</h3>
          {plan.badge &&
            (f ? (
              <span className="shrink-0 whitespace-nowrap rounded-full bg-tangerine px-1.5 py-0.5 text-[9px] font-bold leading-3 sm:px-3 sm:py-[5px] sm:text-[12px] sm:leading-4 text-forest">
                {plan.badge}
              </span>
            ) : (
              <span className="shrink-0 whitespace-nowrap rounded-full border border-cream/35 px-1.5 py-0.5 text-[9px] font-bold leading-3 sm:px-3 sm:py-[5px] sm:text-[12px] sm:leading-4 text-sage-light">
                {plan.badge}
              </span>
            ))}
        </div>
        <p className={`hidden text-[15px] leading-[22px] sm:block ${f ? "text-slate-green" : "text-sage"}`}>
          {plan.tagline}
        </p>
        <p className="flex flex-col items-start sm:flex-row sm:items-end sm:gap-1.5">
          <span className="text-[16px] font-bold leading-5 tracking-[-0.02em] sm:text-[48px] sm:leading-[52px]">{plan.price}</span>
          {plan.period && (
            <span className={`text-[9px] font-medium leading-3 sm:text-[16px] sm:leading-6 ${f ? "text-slate-green" : "text-sage"}`}>
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
        <ul className="flex flex-col gap-1 sm:gap-3.5">
          {plan.features.map((item) => (
            <li key={item} className="flex items-start gap-1 break-words text-[9px] leading-[12px] sm:gap-3 sm:text-[15px] sm:leading-[22px]">
              <Check className={f ? "text-forest" : "text-tangerine"} />
              {item}
            </li>
          ))}
        </ul>
      </div>
    </li>
  );
}
