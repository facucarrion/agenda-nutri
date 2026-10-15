import { NextResponse, type NextRequest } from "next/server";
import { getPublicSlots } from "@/lib/public-booking";

// GET /api/public/:slug/slots?type=<uuid>&from=YYYY-MM-DD&to=YYYY-MM-DD
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const q = request.nextUrl.searchParams;

  const result = await getPublicSlots(
    slug,
    q.get("type") ?? "",
    q.get("from") ?? "",
    q.get("to") ?? "",
  );

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }
  return NextResponse.json(
    { slots: result.slots, timezone: result.timezone },
    { headers: { "Cache-Control": "no-store" } },
  );
}
