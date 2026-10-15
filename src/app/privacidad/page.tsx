import type { Metadata } from "next";
import {
  CONTACT_EMAIL,
  LEGAL_DRAFT,
  POLICY_VERSION,
  PRODUCT_NAME,
  RETENTION_YEARS,
} from "@/lib/legal";

export const metadata: Metadata = {
  title: "Política de privacidad",
};

export default function PrivacyPage() {
  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-6 px-4 py-12 text-sm leading-6">
      {LEGAL_DRAFT && (
        <p
          role="note"
          className="rounded border border-amber-400 bg-amber-50 p-3 text-amber-900"
        >
          Borrador pendiente de revisión legal.
        </p>
      )}

      <h1 className="text-2xl font-semibold">Política de privacidad</h1>
      <p className="text-zinc-600">Versión {POLICY_VERSION}</p>

      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold">1. Quién trata tus datos</h2>
        <p>
          Cuando reservás un turno, el responsable de tus datos es el
          profesional de la nutrición con quien te atendés. {PRODUCT_NAME} es la
          plataforma de gestión de turnos que el profesional utiliza y trata tus
          datos únicamente por su cuenta y para este fin.
        </p>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold">2. Qué datos recopilamos</h2>
        <ul className="list-disc pl-5">
          <li>Al reservar: nombre, apellido, email y teléfono.</li>
          <li>El horario y el tipo de consulta del turno.</li>
          <li>
            Durante la atención, el profesional puede registrar datos de salud
            (por ejemplo peso, altura y notas), que son datos sensibles.
          </li>
        </ul>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold">3. Para qué los usamos</h2>
        <ul className="list-disc pl-5">
          <li>Gestionar y confirmar tu turno.</li>
          <li>Enviarte por email la confirmación y recordatorios del turno.</li>
          <li>Que el profesional lleve tu ficha de atención.</li>
        </ul>
        <p>No usamos tus datos para publicidad ni los vendemos.</p>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold">4. Consentimiento</h2>
        <p>
          Al reservar, aceptás esta política. Registramos la fecha y la versión
          que aceptaste. Los datos de salud son sensibles: solo se registran en
          el marco de tu atención con el profesional.
        </p>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold">5. Quién accede</h2>
        <p>
          Solo el profesional que te atiende accede a tu ficha. Cada
          profesional ve únicamente a sus propios pacientes. Utilizamos
          proveedores tecnológicos para el almacenamiento, el alojamiento y el
          envío de emails; tratan los datos solo para prestar ese servicio.
        </p>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold">6. Dónde se almacenan</h2>
        <p>
          Los datos se alojan en servidores de proveedores de infraestructura
          ubicados fuera de la Argentina. Al aceptar esta política, consentís
          esa transferencia.
        </p>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold">7. Cuánto tiempo los conservamos</h2>
        <p>
          Conservamos tus datos hasta {RETENTION_YEARS} años después de tu
          último turno, salvo que pidas su eliminación antes y no exista una
          obligación legal de conservarlos.
        </p>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold">8. Tus derechos</h2>
        <p>
          Podés pedir acceso, rectificación, actualización o supresión de tus
          datos escribiendo a{" "}
          <a className="underline" href={`mailto:${CONTACT_EMAIL}`}>
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
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold">9. Seguridad</h2>
        <p>
          Usamos conexión cifrada (HTTPS), acceso restringido por profesional y
          controles técnicos para evitar accesos no autorizados.
        </p>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold">10. Cambios</h2>
        <p>
          Si esta política cambia de forma relevante, actualizaremos la versión
          y te pediremos aceptarla nuevamente.
        </p>
      </section>
    </main>
  );
}
