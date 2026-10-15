import "server-only";

import { createHash } from "node:crypto";
import type { NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

// Client IP behind Vercel / a proxy: first hop of x-forwarded-for.
export function clientIp(request: NextRequest) {
  const forwarded = request.headers.get("x-forwarded-for");
  return (
    forwarded?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

type Options = {
  /** Bucket name, e.g. "book:ip". */
  name: string;
  /** Identifier to limit (IP, email...). Hashed before storing. */
  id: string;
  max: number;
  windowSeconds: number;
  /** Allow the request if the limiter itself fails. Default: block. */
  failOpen?: boolean;
};

// Returns true when the request is allowed.
export async function rateLimit(options: Options): Promise<boolean> {
  const key = `${options.name}:${createHash("sha256")
    .update(options.id)
    .digest("hex")
    .slice(0, 32)}`;

  try {
    const admin = createAdminClient();
    const { data, error } = await admin.rpc("rate_limit_hit", {
      p_key: key,
      p_max: options.max,
      p_window_seconds: options.windowSeconds,
    });
    if (error) return options.failOpen ?? false;
    return data === true;
  } catch {
    return options.failOpen ?? false;
  }
}
