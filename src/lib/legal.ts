// Single source for the values used in the legal pages and consent records.

import { BRAND_NAME } from "./brand";

// Bump when the privacy policy changes in a way patients must re-accept.
export const POLICY_VERSION = "2026-10-15";

export const PRODUCT_NAME = BRAND_NAME;

export const CONTACT_EMAIL = "contactobfweb@gmail.com";

// Years a patient's data is kept after the last appointment.
export const RETENTION_YEARS = 10;

// Shows a "draft" banner on the legal pages until a lawyer validates them.
export const LEGAL_DRAFT = true;

// "Activar mi cuenta" (trial ended or about to) opens an email to the team.
// Billing is manual for now, so this is how an account gets activated.
export const ACTIVATE_ACCOUNT_HREF =
  `mailto:${CONTACT_EMAIL}` +
  `?subject=${encodeURIComponent(`Quiero activar mi cuenta de ${PRODUCT_NAME}`)}` +
  `&body=${encodeURIComponent(
    [
      `Hola, quiero seguir usando ${PRODUCT_NAME} cuando termine mi prueba gratuita.`,
      "",
      "Mi nombre y apellido:",
      "El email con el que ingreso:",
    ].join("\n"),
  )}`;

// The closing "Sumate al piloto" button opens a WhatsApp chat with the team,
// alternating between these numbers (wa.me format: 54 + 9 + area + number).
export const PILOT_WHATSAPP_NUMBERS = ["5493472549859", "5493571457461"];
export const PILOT_WHATSAPP_TEXT = `Hola, quiero sumarme al piloto de ${PRODUCT_NAME}.`;

export function pilotWhatsappHref(number: string) {
  return `https://wa.me/${number}?text=${encodeURIComponent(PILOT_WHATSAPP_TEXT)}`;
}

// Default link (first number). Links set to this href render as
// PilotWhatsappLink, which alternates between the numbers on click.
export const PILOT_WHATSAPP_HREF = pilotWhatsappHref(PILOT_WHATSAPP_NUMBERS[0]);

// "Pedí tu código" opens an email to the team with the subject and the data
// we need to create the invitation already laid out.
export const INVITE_REQUEST_HREF =
  `mailto:${CONTACT_EMAIL}` +
  `?subject=${encodeURIComponent(`Quiero mi código de acceso a ${PRODUCT_NAME}`)}` +
  `&body=${encodeURIComponent(
    [
      `Hola, soy profesional de la nutrición y quiero probar ${PRODUCT_NAME}.`,
      "",
      "Mi nombre y apellido:",
      "Nombre de mi consultorio (opcional):",
      "Mi teléfono:",
    ].join("\n"),
  )}`;
