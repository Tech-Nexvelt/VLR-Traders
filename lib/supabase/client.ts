import { createClient } from "@supabase/supabase-js";
import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.SUPABASE_URL ||
  process.env.PUBLIC_SUPABASE_URL;

const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Supabase ENV variables are missing. Check Vercel environment variables."
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export function createSupabaseBrowserClient() {
  return createBrowserClient(supabaseUrl!, supabaseAnonKey!);
}
