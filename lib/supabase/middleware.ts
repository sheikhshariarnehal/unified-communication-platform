import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const DEFAULT_SUPABASE_URL = "https://uxxavporesuoszmjkijb.supabase.co";
const DEFAULT_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV4eGF2cG9yZXN1b3N6bWpraWpiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg1MTM0MDksImV4cCI6MjEwNDA4OTQwOX0.74xc966aKqh5R-KOaM4huM4HgO92SD_XTomMvLLJxYQ";

const PUBLIC_ROUTES = [
  "/login",
  "/signup",
  "/forgot-password",
  "/auth/callback",
  "/auth/signout",
];

const PUBLIC_API_PREFIXES = [
  "/api/webhooks",
  "/api/leads/ingest",
];

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || DEFAULT_ANON_KEY;

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        supabaseResponse = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  // IMPORTANT: Do not run code between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // 1. Allow public API prefixes (e.g. webhooks, extension lead ingestion)
  if (PUBLIC_API_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    return supabaseResponse;
  }

  // 2. Check if user is trying to access auth pages (login, signup) while logged in
  const isAuthPage = PUBLIC_ROUTES.some((route) => pathname === route);

  if (user && isAuthPage && pathname !== "/auth/signout" && pathname !== "/auth/callback") {
    const redirectTo = request.nextUrl.searchParams.get("redirectTo") || "/";
    const redirectUrl = new URL(redirectTo, request.url);
    const redirectResponse = NextResponse.redirect(redirectUrl);
    
    // Copy updated session cookies to redirect response
    request.cookies.getAll().forEach((c) => {
      redirectResponse.cookies.set(c.name, c.value);
    });
    return redirectResponse;
  }

  // 3. If user is NOT logged in and trying to access protected dashboard routes
  if (!user && !isAuthPage) {
    const loginUrl = new URL("/login", request.url);
    if (pathname !== "/") {
      loginUrl.searchParams.set("redirectTo", pathname + request.nextUrl.search);
    }
    const redirectResponse = NextResponse.redirect(loginUrl);
    
    request.cookies.getAll().forEach((c) => {
      redirectResponse.cookies.set(c.name, c.value);
    });
    return redirectResponse;
  }

  return supabaseResponse;
}
