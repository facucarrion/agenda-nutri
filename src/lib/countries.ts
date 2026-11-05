// Countries offered in the phone field, with their calling code.
// Argentina first: it is the market this product is sold in.

export type Country = { iso: string; name: string; dial: string };

export const COUNTRIES: Country[] = [
  { iso: "AR", name: "Argentina", dial: "54" },
  { iso: "UY", name: "Uruguay", dial: "598" },
  { iso: "CL", name: "Chile", dial: "56" },
  { iso: "PY", name: "Paraguay", dial: "595" },
  { iso: "BO", name: "Bolivia", dial: "591" },
  { iso: "BR", name: "Brasil", dial: "55" },
  { iso: "PE", name: "Perú", dial: "51" },
  { iso: "CO", name: "Colombia", dial: "57" },
  { iso: "EC", name: "Ecuador", dial: "593" },
  { iso: "VE", name: "Venezuela", dial: "58" },
  { iso: "MX", name: "México", dial: "52" },
  { iso: "ES", name: "España", dial: "34" },
  { iso: "US", name: "Estados Unidos", dial: "1" },
];

export const DEFAULT_COUNTRY = "AR";

export function countryByIso(iso: string): Country {
  return COUNTRIES.find((c) => c.iso === iso) ?? COUNTRIES[0];
}

const known = (iso: string | undefined | null) =>
  iso && COUNTRIES.some((c) => c.iso === iso.toUpperCase()) ? iso.toUpperCase() : null;

// Country code the hosting platform sends with each request (Vercel sets
// x-vercel-ip-country). Null when missing or not in the list.
export function countryFromHeader(value: string | null | undefined) {
  return known(value);
}

const TIME_ZONES: Record<string, string> = {
  "America/Buenos_Aires": "AR",
  "America/Montevideo": "UY",
  "America/Santiago": "CL",
  "America/Punta_Arenas": "CL",
  "America/Asuncion": "PY",
  "America/La_Paz": "BO",
  "America/Sao_Paulo": "BR",
  "America/Lima": "PE",
  "America/Bogota": "CO",
  "America/Guayaquil": "EC",
  "America/Caracas": "VE",
  "America/Mexico_City": "MX",
  "Europe/Madrid": "ES",
  "America/New_York": "US",
  "America/Chicago": "US",
  "America/Denver": "US",
  "America/Los_Angeles": "US",
};

// The time zone says where the person is, which a browser language does not
// (someone in Argentina may use an English browser).
export function countryFromTimeZone(timeZone: string) {
  if (timeZone.startsWith("America/Argentina/")) return "AR";
  return TIME_ZONES[timeZone] ?? null;
}

// "es-AR" -> "AR", the first language with a known region.
export function countryFromLanguages(languages: readonly string[]) {
  for (const language of languages) {
    const iso = known(language.split("-")[1]);
    if (iso) return iso;
  }
  return null;
}

// Best guess of the visitor's country from the browser.
export function detectCountry() {
  const zone = Intl.DateTimeFormat().resolvedOptions().timeZone ?? "";
  return (
    countryFromTimeZone(zone) ??
    countryFromLanguages(navigator.languages ?? [navigator.language]) ??
    DEFAULT_COUNTRY
  );
}
