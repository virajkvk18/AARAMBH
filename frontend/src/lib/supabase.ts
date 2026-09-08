import { createBrowserClient } from "@supabase/ssr";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export const isBrowserSupabaseConfigured: boolean = Boolean(
  SUPABASE_URL &&
    SUPABASE_ANON_KEY &&
    SUPABASE_URL.startsWith("http") &&
    !SUPABASE_URL.includes("your-supabase")
);

// The module instance is shared by all browser consumers and stores Supabase's
// session in cookies so the server-side proxy can validate the same session.
export const supabaseClient = isBrowserSupabaseConfigured
  ? createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;
export function getSupabaseClient() {
  return supabaseClient;
}
