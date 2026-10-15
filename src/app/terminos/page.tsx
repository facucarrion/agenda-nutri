import type { Metadata } from "next";
import { CONTACT_EMAIL, LEGAL_DRAFT, PRODUCT_NAME } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Términos de uso",
};

export default function TermsPage() {
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

      <h1 className="text-2xl font-semibold">Términos de uso</h1>

      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold">1. Qué es {PRODUCT_NAME}</h2>
        <p>
          {PRODUCT_NAME} es una herramienta para que profesionales de la
          nutrición gestionen su agenda de turnos y para que sus pacientes
          puedan reservarlos en línea. No presta servicios de salud ni
          reemplaza la consulta con el profesional.
        </p>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold">2. Reservas</h2>
        <p>
          Una reserva queda confirmada cuando abrís el link que te enviamos por
          email. Si no la confirmás a tiempo, el horario se libera
          automáticamente. Para cancelar o reprogramar, comunicate con tu
          profesional.
        </p>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold">3. Uso correcto</h2>
        <p>
          Te comprometés a usar datos reales y a no utilizar el servicio para
          fines indebidos, incluido el envío masivo de reservas.
        </p>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold">4. Datos personales</h2>
        <p>
          El tratamiento de tus datos se rige por la{" "}
          <a className="underline" href="/privacidad">
            política de privacidad
          </a>
          .
        </p>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold">5. Contacto</h2>
        <p>
          Consultas:{" "}
          <a className="underline" href={`mailto:${CONTACT_EMAIL}`}>
            {CONTACT_EMAIL}
          </a>
          .
        </p>
      </section>
    </main>
  );
}
