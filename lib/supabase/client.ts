import { createBrowserClient } from "@supabase/ssr";
import { Database } from "@/types/supabase";

const DEFAULT_SUPABASE_URL = "https://uxxavporesuoszmjkijb.supabase.co";
const DEFAULT_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV4eGF2cG9yZXN1b3N6bWpraWpiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg1MTM0MDksImV4cCI6MjEwNDA4OTQwOX0.74xc966aKqh5R-KOaM4huM4HgO92SD_XTomMvLLJxYQ";

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || DEFAULT_ANON_KEY;

  return createBrowserClient<Database>(url, key);
}
