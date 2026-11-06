import { LEGAL_DRAFT } from "@/lib/legal";

// Building blocks of the legal pages (privacy and terms).

export function LegalPage({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <main className="mx-auto w-full max-w-[760px] px-4 py-10 sm:py-14">
      <article className="flex flex-col gap-7 rounded-3xl border border-line bg-surface p-6 text-[15px] leading-[24px] text-ink sm:p-10">
        {LEGAL_DRAFT && (
          <p
            role="note"
            className="rounded-xl bg-warn-soft px-4 py-3 text-[13px] font-medium leading-[18px] text-[#8a6410]"
          >
            Borrador pendiente de revisión legal.
          </p>
        )}
        <header className="flex flex-col gap-1.5 border-b border-line pb-6">
          <h1 className="text-[28px] font-bold leading-tight">{title}</h1>
          {subtitle && <p className="text-[13px] text-muted">{subtitle}</p>}
        </header>
        {children}
      </article>
    </main>
  );
}

export function LegalSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-2.5">
      <h2 className="text-[17px] font-semibold text-primary">{title}</h2>
      {children}
    </section>
  );
}

export function LegalList({ children }: { children: React.ReactNode }) {
  return (
    <ul className="flex list-disc flex-col gap-1.5 pl-5 marker:text-primary">
      {children}
    </ul>
  );
}

export const legalLink =
  "font-medium text-primary underline decoration-primary/30 underline-offset-2 hover:decoration-primary";
