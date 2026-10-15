import { NextResponse, type NextRequest } from "next/server";
import { createPublicBooking } from "@/lib/public-booking";

// POST /api/public/:slug/book
// body: { type, starts_at, first_name, last_name, email, phone, website? }
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
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

  const result = await createPublicBooking({
    slug,
    typeId: str("type"),
    startsAt: str("starts_at"),
    firstName: str("first_name"),
    lastName: str("last_name"),
    email: str("email"),
    phone: str("phone"),
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 409 });
  }

  // TODO(email): send result.confirmationToken to result.email via Resend.
  // The token must never be returned to the browser.
  return NextResponse.json({ ok: true }, { status: 201 });
}
