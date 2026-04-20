import { createClient, SupabaseClient } from "@supabase/supabase-js";

// Allow environment variables to be read safely (next.js syntax)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("⚠️ SUPABASE KEYS MISSING. Ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set.");
}

// Strict global singleton to prevent LockAbortError in Next.js development and strict mode hydration
const globalAny = (typeof globalThis !== "undefined" ? globalThis : typeof window !== "undefined" ? window : global) as any;

if (!globalAny.supabaseClientInstance) {
  globalAny.supabaseClientInstance = createClient(supabaseUrl, supabaseAnonKey);
}

export const supabase = globalAny.supabaseClientInstance as SupabaseClient;
