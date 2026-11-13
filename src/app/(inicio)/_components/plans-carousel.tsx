// The two plans. Up to lg they stack, full width, one under the other; from
// lg up they go in two columns.
export function PlansCarousel({ children }: { children: React.ReactNode }) {
  return (
    <ul className="reveal mx-auto grid w-full max-w-[480px] grid-cols-1 gap-4 py-6 sm:max-w-[520px] sm:gap-20 sm:py-0 lg:max-w-[820px] lg:grid-cols-2 lg:gap-6">
      {children}
    </ul>
  );
}
