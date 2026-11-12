// The two plans. On phones they sit side by side in compact cards so all of
// them are in view at once; from sm up they stack, and from lg up they go in
// two columns.
export function PlansCarousel({ children }: { children: React.ReactNode }) {
  return (
    <ul className="reveal mx-auto grid w-full max-w-[480px] grid-cols-2 gap-2 py-6 sm:max-w-[520px] sm:grid-cols-1 sm:gap-20 sm:py-0 lg:max-w-[820px] lg:grid-cols-2 lg:gap-6">
      {children}
    </ul>
  );
}
