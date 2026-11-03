import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Handles the links from the confirmation and password-recovery emails
// (PKCE code exchange). `next` must be a local path.
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const nextParam = searchParams.get("next") ?? "";
  const next = /^\/(?!\/)/.test(nextParam) ? nextParam : "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  const reason = next === "/restablecer" ? "recovery" : "confirmation";
  return NextResponse.redirect(`${origin}/login?error=${reason}`);
}
