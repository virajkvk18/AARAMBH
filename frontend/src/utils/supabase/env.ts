// Shared env resolution for all Supabase clients.
// The publishable key is the modern secret type; the legacy anon key is kept
// as a fallback so the app works with both styles.
export const supabaseUrl: string = (
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.SUPABASE_URL ||
  ""
).trim();

export const supabaseKey: string = (
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  ""
).trim();

export const isSupabaseConfigured: boolean = Boolean(
  supabaseUrl &&
    supabaseKey &&
    supabaseUrl.startsWith("http") &&
    !supabaseUrl.includes("your-supabase")
);