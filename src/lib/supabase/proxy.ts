import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/types/database";
import { asSessionCookie, SESSION_ONLY_COOKIE } from "./session-cookie";

const PUBLIC_PATHS = [
  "/",
  "/funciones",
  "/login",
  "/register",
  "/recuperar",
  "/restablecer", // the page itself checks for the recovery session
  "/auth",
  "/reservar",
  "/privacidad",
  "/terminos",
  "/api/public",
  "/api/cron", // authenticated with CRON_SECRET inside the route
];

function isPublic(pathname: string) {
  return PUBLIC_PATHS.some(
    (p) => pathname === p || (p !== "/" && pathname.startsWith(`${p}/`)),
  );
}

// Refreshes the Supabase session cookie and guards private routes.
export async function updateSession(request: NextRequest) {
  // Dev only: lets the frontend show the private screens with mock data
  // before Supabase is set up. Needs UI_PREVIEW=1 in .env.local; never
  // applies to a production build.
  if (process.env.NODE_ENV === "development" && process.env.UI_PREVIEW === "1") {
    return NextResponse.next({ request });
  }

  let response = NextResponse.next({ request });
  const sessionOnly = request.cookies.get(SESSION_ONLY_COOKIE)?.value === "1";

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(
              name,
              value,
              sessionOnly && value ? asSessionCookie(options) : options,
            ),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  if (!user && !isPublic(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (
    user &&
    (pathname === "/login" || pathname === "/register" || pathname === "/recuperar")
  ) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return response;
}
