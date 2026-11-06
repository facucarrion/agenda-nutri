import { BRAND_NAME } from "@/lib/brand";
import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage, LegalSection, legalLink } from "../_components/legal";
import { CONTACT_EMAIL, PRODUCT_NAME } from "@/lib/legal";

export const metadata: Metadata = {
  title: `Términos de uso · ${BRAND_NAME}`,
};

export default function TermsPage() {
  return (
    <LegalPage title="Términos de uso">
      <LegalSection title={`1. Qué es ${PRODUCT_NAME}`}>
        <p>
          {PRODUCT_NAME} es una herramienta para que profesionales de la
          nutrición gestionen su agenda de turnos y para que sus pacientes
          puedan reservarlos en línea. No presta servicios de salud ni
          reemplaza la consulta con el profesional.
        </p>
      </LegalSection>

      <LegalSection title="2. Reservas">
        <p>
          Una reserva queda confirmada cuando abrís el link que te enviamos por
          email. Si no la confirmás a tiempo, el horario se libera
          automáticamente. Para cancelar o reprogramar, comunicate con tu
          profesional.
        </p>
      </LegalSection>

      <LegalSection title="3. Uso correcto">
        <p>
          Te comprometés a usar datos reales y a no utilizar el servicio para
          fines indebidos, incluido el envío masivo de reservas.
        </p>
      </LegalSection>

      <LegalSection title="4. Datos personales">
        <p>
          El tratamiento de tus datos se rige por la{" "}
          <Link className={legalLink} href="/privacidad">
            política de privacidad
          </Link>
          .
        </p>
      </LegalSection>

      <LegalSection title="5. Contacto">
        <p>
          Consultas:{" "}
          <a className={legalLink} href={`mailto:${CONTACT_EMAIL}`}>
            {CONTACT_EMAIL}
          </a>
          .
        </p>
      </LegalSection>
    </LegalPage>
  );
}
