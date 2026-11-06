import type { Metadata } from "next";
import { LegalList, LegalPage, LegalSection, legalLink } from "../_components/legal";
import {
  CONTACT_EMAIL,
  POLICY_VERSION,
  PRODUCT_NAME,
  RETENTION_YEARS,
} from "@/lib/legal";

export const metadata: Metadata = {
  title: "Política de privacidad · Agenda Nutri",
};

export default function PrivacyPage() {
  return (
    <LegalPage title="Política de privacidad" subtitle={`Versión ${POLICY_VERSION}`}>
      <LegalSection title="1. Quién trata tus datos">
        <p>
          Cuando reservás un turno, el responsable de tus datos es el
          profesional de la nutrición con quien te atendés. {PRODUCT_NAME} es la
          plataforma de gestión de turnos que el profesional utiliza y trata tus
          datos únicamente por su cuenta y para este fin.
        </p>
      </LegalSection>

      <LegalSection title="2. Qué datos recopilamos">
        <LegalList>
          <li>Al reservar: nombre, apellido, email y teléfono.</li>
          <li>El horario y el tipo de consulta del turno.</li>
          <li>
            Durante la atención, el profesional puede registrar datos de salud
            (por ejemplo peso, altura y notas), que son datos sensibles.
          </li>
        </LegalList>
      </LegalSection>

      <LegalSection title="3. Para qué los usamos">
        <LegalList>
          <li>Gestionar y confirmar tu turno.</li>
          <li>Enviarte por email la confirmación y recordatorios del turno.</li>
          <li>Que el profesional lleve tu ficha de atención.</li>
        </LegalList>
        <p>No usamos tus datos para publicidad ni los vendemos.</p>
      </LegalSection>

      <LegalSection title="4. Consentimiento">
        <p>
          Al reservar, aceptás esta política. Registramos la fecha y la versión
          que aceptaste. Los datos de salud son sensibles: solo se registran en
          el marco de tu atención con el profesional.
        </p>
      </LegalSection>

      <LegalSection title="5. Quién accede">
        <p>
          Solo el profesional que te atiende accede a tu ficha. Cada
          profesional ve únicamente a sus propios pacientes. Utilizamos
          proveedores tecnológicos para el almacenamiento, el alojamiento y el
          envío de emails; tratan los datos solo para prestar ese servicio.
        </p>
      </LegalSection>

      <LegalSection title="6. Dónde se almacenan">
        <p>
          Los datos se alojan en servidores de proveedores de infraestructura
          ubicados fuera de la Argentina. Al aceptar esta política, consentís
          esa transferencia.
        </p>
      </LegalSection>

      <LegalSection title="7. Cuánto tiempo los conservamos">
        <p>
          Conservamos tus datos hasta {RETENTION_YEARS} años después de tu
          último turno, salvo que pidas su eliminación antes y no exista una
          obligación legal de conservarlos.
        </p>
      </LegalSection>

      <LegalSection title="8. Tus derechos">
        <p>
          Podés pedir acceso, rectificación, actualización o supresión de tus
          datos escribiendo a{" "}
          <a className={legalLink} href={`mailto:${CONTACT_EMAIL}`}>
            {CONTACT_EMAIL}
          </a>
          . Respondemos dentro de los plazos que fija la ley.
        </p>
        <p>
          La Agencia de Acceso a la Información Pública, en su carácter de
          Órgano de Control de la Ley N° 25.326, tiene la atribución de atender
          las denuncias y reclamos que interpongan quienes resulten afectados
          en sus derechos por incumplimiento de las normas de protección de
          datos personales.
        </p>
      </LegalSection>

      <LegalSection title="9. Seguridad">
        <p>
          Usamos conexión cifrada (HTTPS), acceso restringido por profesional y
          controles técnicos para evitar accesos no autorizados.
        </p>
      </LegalSection>

      <LegalSection title="10. Cambios">
        <p>
          Si esta política cambia de forma relevante, actualizaremos la versión
          y te pediremos aceptarla nuevamente.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
