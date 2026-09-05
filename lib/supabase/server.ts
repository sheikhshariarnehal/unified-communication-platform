import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { Database } from "@/types/supabase";

const DEFAULT_SUPABASE_URL = "https://uxxavporesuoszmjkijb.supabase.co";
const DEFAULT_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV4eGF2cG9yZXN1b3N6bWpraWpiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg1MTM0MDksImV4cCI6MjEwNDA4OTQwOX0.74xc966aKqh5R-KOaM4huM4HgO92SD_XTomMvLLJxYQ";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || DEFAULT_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Server Component context may throw when attempting to set cookies; ignore
          }
        },
      },
    }
  );
}
