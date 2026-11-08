import Image from "next/image";
import Link from "next/link";

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
      className={`mt-px size-5 shrink-0 ${className}`}
      aria-hidden
    >
      <path d="m4.5 10.5 3.5 3.5 7.5-8" />
    </svg>
  );
}

export function PlanCard({ plan }: { plan: Plan }) {
  const f = plan.featured;
  const CtaTag = plan.cta.href.startsWith("/") ? Link : "a";

  return (
    <li className="plan group relative isolate flex">
      {/* Glow behind the card */}
      <div
        aria-hidden
        className={`plan-glow pointer-events-none absolute -inset-x-12 -inset-y-10 -z-20 rounded-[64px] blur-xl ${
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
          className={`plan-fruit plan-fruit--${corner} pointer-events-none absolute -z-10 select-none`}
        />
      ))}

      <div
        className={`plan-card flex w-full flex-col gap-[22px] rounded-[28px] px-9 pb-10 pt-9 ${
          f
            ? "bg-cream text-forest shadow-[0_24px_48px_rgba(0,0,0,0.35)]"
            : "border border-cream/14 bg-forest-2 text-cream"
        }`}
      >
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-[24px] font-semibold leading-8">{plan.name}</h3>
          {plan.badge &&
            (f ? (
              <span className="rounded-full bg-tangerine px-3 py-[5px] text-[12px] font-bold leading-4 text-forest">
                {plan.badge}
              </span>
            ) : (
              <span className="rounded-full border border-cream/35 px-3 py-[5px] text-[12px] font-bold leading-4 text-sage-light">
                {plan.badge}
              </span>
            ))}
        </div>
        <p className={`text-[15px] leading-[22px] ${f ? "text-slate-green" : "text-sage"}`}>
          {plan.tagline}
        </p>
        <p className="flex items-end gap-1.5">
          <span className="text-[48px] font-bold leading-[52px] tracking-[-0.02em]">{plan.price}</span>
          {plan.period && (
            <span className={`text-[16px] font-medium leading-6 ${f ? "text-slate-green" : "text-sage"}`}>
              {plan.period}
            </span>
          )}
        </p>
        <CtaTag
          href={plan.cta.href}
          className={`flex w-full items-center justify-center rounded-full px-7 py-3.5 text-[16px] font-semibold leading-6 transition-colors ${focusDark} ${
            f
              ? "bg-tangerine text-forest hover:bg-[#f59d55]"
              : "border border-cream/50 text-cream hover:border-cream hover:bg-cream/10"
          }`}
        >
          {plan.cta.label}
        </CtaTag>
        <hr className={`border-0 border-t ${f ? "border-forest/14" : "border-cream/14"}`} />
        <ul className="flex flex-col gap-3.5">
          {plan.features.map((item) => (
            <li key={item} className="flex items-start gap-3 text-[15px] leading-[22px]">
              <Check className={f ? "text-forest" : "text-tangerine"} />
              {item}
            </li>
          ))}
        </ul>
      </div>
    </li>
  );
}
