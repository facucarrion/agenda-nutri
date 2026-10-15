import { NextResponse, type NextRequest } from "next/server";
import { confirmPublicBooking } from "@/lib/public-booking";

// GET /api/public/confirm?token=...  (link from the confirmation email)
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const ok = await confirmPublicBooking(searchParams.get("token") ?? "");

  return NextResponse.redirect(
    `${origin}/reservar/${ok ? "confirmado" : "error"}`,
  );
}
