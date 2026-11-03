import { Suspense } from "react";
import { notFound } from "next/navigation";
import { BookingForm } from "./booking-form";
import { getMockProfile } from "./mock-data";

// TODO(backend): replace getMockProfile with getPublicProfile from
// @/lib/public-booking once the booking flow is ready end to end.
async function Booking({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const profile = getMockProfile(slug);
  if (!profile) notFound();

  if (profile.types.length === 0) {
    return (
      <p className="rounded-[20px] border border-line bg-surface p-7 text-muted">
        Por ahora no hay turnos disponibles para reservar online.
      </p>
    );
  }

  return <BookingForm profile={profile} />;
}

export default function BookingPage({ params }: PageProps<"/reservar/[slug]">) {
  return (
    <main className="mx-auto w-full max-w-[1280px] px-4 pb-16 pt-8 sm:px-12 sm:pt-10">
      <Suspense fallback={<p className="text-muted">Cargando...</p>}>
        <Booking params={params} />
      </Suspense>
    </main>
  );
}
