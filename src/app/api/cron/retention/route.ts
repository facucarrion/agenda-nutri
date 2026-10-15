import { NextResponse, type NextRequest } from "next/server";
import { isCronAuthorized } from "@/lib/cron-auth";
import { enforceRetention } from "@/lib/retention";

// GET /api/cron/retention  (monthly; dry run unless RETENTION_ENFORCE=true)
export async function GET(request: NextRequest) {
  if (!isCronAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await enforceRetention();
  return NextResponse.json(result);
}
