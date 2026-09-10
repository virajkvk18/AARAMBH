import { createBrowserClient } from "@supabase/ssr";
import { supabaseUrl, supabaseKey, isSupabaseConfigured } from "./env";

export { isSupabaseConfigured };

// Shared browser instance; stores the session in cookies so server-side
// helpers (proxy, server components) can validate the same session.
export const browserSupabaseClient = isSupabaseConfigured
  ? createBrowserClient(supabaseUrl, supabaseKey)
  : null;

export function getBrowserSupabaseClient() {
  return browserSupabaseClient;
}