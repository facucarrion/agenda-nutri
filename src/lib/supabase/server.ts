import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/types/database";
import { asSessionCookie, SESSION_ONLY_COOKIE } from "./session-cookie";

export async function createClient(opts: { sessionOnly?: boolean } = {}) {
  const cookieStore = await cookies();
  const sessionOnly =
    opts.sessionOnly ?? cookieStore.get(SESSION_ONLY_COOKIE)?.value === "1";

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(
                name,
                value,
                // Deletions (empty value) keep their options so they expire.
                sessionOnly && value ? asSessionCookie(options) : options,
              ),
            );
          } catch {
            // Called from a Server Component: the proxy refreshes the session.
          }
        },
      },
    },
  );
}
