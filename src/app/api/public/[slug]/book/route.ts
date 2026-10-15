import { NextResponse, type NextRequest } from "next/server";
import { sendEmail, siteUrl } from "@/lib/email";
import { confirmationEmail } from "@/lib/email-templates";
import { cancelPendingBooking, createPublicBooking } from "@/lib/public-booking";
import { clientIp, rateLimit } from "@/lib/rate-limit";

function tooMany(retryAfter: number) {
  return NextResponse.json(
    { error: "Demasiados intentos. Probá de nuevo más tarde." },
    { status: 429, headers: { "Retry-After": String(retryAfter) } },
  );
}

// POST /api/public/:slug/book
// body: { type, starts_at, first_name, last_name, email, phone, website? }
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  // 5 attempts per IP every 10 minutes.
  const ipAllowed = await rateLimit({
    name: "book:ip",
    id: clientIp(request),
    max: 5,
    windowSeconds: 600,
  });
  if (!ipAllowed) return tooMany(600);

  const { slug } = await params;

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Solicitud inválida." }, { status: 400 });
  }

  const str = (key: string) =>
    typeof body[key] === "string" ? (body[key] as string) : "";

  // Honeypot: real users never fill this hidden field.
  if (str("website")) {
    return NextResponse.json({ ok: true });
  }

  // 3 attempts per email and professional every hour, so the form cannot be
  // used to spam someone's inbox.
  const email = str("email").trim().toLowerCase();
  if (email) {
    const emailAllowed = await rateLimit({
      name: "book:email",
      id: `${slug}:${email}`,
      max: 3,
      windowSeconds: 3600,
    });
    if (!emailAllowed) return tooMany(3600);
  }

  const result = await createPublicBooking({
    slug,
    typeId: str("type"),
    startsAt: str("starts_at"),
    firstName: str("first_name"),
    lastName: str("last_name"),
    email: str("email"),
    phone: str("phone"),
    consent: body.consent === true,
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 409 });
  }

  // The token only travels by email; it is never returned to the browser.
  const confirmUrl = `${siteUrl(request.nextUrl.origin)}/api/public/confirm?token=${encodeURIComponent(result.confirmationToken)}`;
  const message = confirmationEmail({
    patientName: result.patientName,
    nutritionistName: result.nutritionistName || "tu nutricionista",
    startsAt: result.startsAt,
    timezone: result.timezone,
    confirmUrl,
    validMinutes: result.pendingMinutes,
  });

  const sent = await sendEmail({ to: result.email, ...message });
  if (!sent) {
    await cancelPendingBooking(result.appointmentId);
    return NextResponse.json(
      { error: "No pudimos enviarte el email de confirmación. Probá de nuevo." },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}
