// Compatibility layer: keeps the original AuthContext API while delegating to
// the shared helpers under src/utils/supabase.
export { isSupabaseConfigured } from "@/utils/supabase/env";
export { isSupabaseConfigured as isBrowserSupabaseConfigured } from "@/utils/supabase/env";
export { getBrowserSupabaseClient as getSupabaseClient } from "@/utils/supabase/client";
export { browserSupabaseClient as supabaseClient } from "@/utils/supabase/client";