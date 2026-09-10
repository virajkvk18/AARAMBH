import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { supabaseUrl, supabaseKey } from "./env";

// Server-side client for Server Components / route handlers / server actions.
// Reads cookies from the incoming request via the async next/headers API.
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(supabaseUrl, supabaseKey, {
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
          // Called from a Server Component (no mutable cookies) — safe to ignore:
          // session refresh happens in proxy.ts.
        }
      },
    },
  });
}