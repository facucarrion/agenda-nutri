import { Suspense } from "react";
import { headers } from "next/headers";
import { countryFromHeader } from "@/lib/countries";
import { notFound } from "next/navigation";
import { getPublicProfile } from "@/lib/public-booking";
import { BookingForm } from "./booking-form";

async function Booking({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const profile = await getPublicProfile(slug);
  if (!profile) notFound();

  if (profile.types.length === 0) {
    return (
      <p className="rounded-[20px] border border-line bg-surface p-7 text-muted">
        Por ahora no hay turnos disponibles para reservar online.
      </p>
    );
  }

  // The visitor's country, when the host provides it (Vercel does). Otherwise
  // the browser guesses it after the page loads.
  const defaultCountry =
    countryFromHeader((await headers()).get("x-vercel-ip-country")) ?? undefined;

  return (
    <BookingForm
      defaultCountry={defaultCountry}
      profile={{
        ...profile,
        // New accounts start with an empty name.
        fullName: profile.fullName || "tu nutricionista",
      }}
    />
  );
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
