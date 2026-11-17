// How a turno takes place: in the consultorio or by video call. Shared by
// the nutritionist's screens and the public booking page.

export type Modality = "in_person" | "virtual";
export type RuleModality = Modality | "both";

export const MODALITY_LABEL: Record<RuleModality, string> = {
  in_person: "Presencial",
  virtual: "Virtual",
  both: "Presencial y virtual",
};

type IconProps = { className?: string };

// Map pin: the consultorio.
export function InPersonIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={className}
    >
      <path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z" />
      <circle cx="12" cy="9.5" r="2.5" />
    </svg>
  );
}

// Video camera: a video call.
export function VirtualIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={className}
    >
      <rect x="2.5" y="6" width="13" height="12" rx="2.5" />
      <path d="m15.5 10.5 6-3.5v10l-6-3.5" />
    </svg>
  );
}

export function ModalityIcon({
  modality,
  className,
}: {
  modality: RuleModality;
  className?: string;
}) {
  if (modality === "virtual") return <VirtualIcon className={className} />;
  if (modality === "in_person") return <InPersonIcon className={className} />;
  return (
    <span className="inline-flex items-center gap-0.5">
      <InPersonIcon className={className} />
      <VirtualIcon className={className} />
    </span>
  );
}

// Small pill with icon and label, e.g. on a turno card.
export function ModalityBadge({
  modality,
  className = "",
}: {
  modality: Modality;
  className?: string;
}) {
  const tone =
    modality === "virtual" ? "bg-sky-50 text-sky-800" : "bg-primary-soft text-primary";
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${tone} ${className}`}
    >
      <ModalityIcon modality={modality} className="h-3.5 w-3.5" />
      {MODALITY_LABEL[modality]}
    </span>
  );
}
