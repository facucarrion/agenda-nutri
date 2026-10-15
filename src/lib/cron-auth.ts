import "server-only";

import { timingSafeEqual } from "node:crypto";
import type { NextRequest } from "next/server";

// Vercel Cron sends `Authorization: Bearer $CRON_SECRET`.
export function isCronAuthorized(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;

  const header = request.headers.get("authorization") ?? "";
  const expected = `Bearer ${secret}`;
  if (header.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(header), Buffer.from(expected));
}
