import "server-only";
import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

/**
 * Ensures .env.local variables are populated in local development
 * even if the dev server was started before .env.local was created/edited.
 */
function ensureEnvLoaded() {
  if (process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL) return;
  try {
    const envPath = path.resolve(process.cwd(), ".env.local");
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, "utf-8");
      for (const line of content.split("\n")) {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith("#")) {
          const idx = trimmed.indexOf("=");
          if (idx !== -1) {
            const key = trimmed.slice(0, idx).trim();
            const val = trimmed.slice(idx + 1).trim();
            if (!process.env[key]) process.env[key] = val;
          }
        }
      }
    }
  } catch {
    // Non-fatal if fs is not accessible
  }
}

/**
 * Server-side Supabase client for Server Components, Server Actions, and Route Handlers.
 */
export function createSupabaseServerClient() {
  ensureEnvLoaded();

  let url =
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.SUPABASE_URL ||
    process.env.PUBLIC_SUPABASE_URL;

  let key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_ANON_KEY;

  // Fallback URL resolution from DATABASE_URL if URL is missing
  if (!url && process.env.DATABASE_URL) {
    try {
      const match = process.env.DATABASE_URL.match(/db\.([a-z0-9]+)\.supabase\.co/);
      if (match && match[1]) {
        url = `https://${match[1]}.supabase.co`;
      }
    } catch {
      // Ignored
    }
  }

  console.log("SUPABASE URL:", url);
  console.log("SUPABASE KEY EXISTS:", !!key);

  if (!url || !key) {
    throw new Error(
      "Missing Supabase environment variables: Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your environment variables or .env.local file."
    );
  }

  return createClient(url, key, {
    auth: { persistSession: false },
  });
}

/**
 * Cookie-aware Supabase client for authenticating current user sessions via cookies.
 */
export async function createSupabaseUserClient() {
  ensureEnvLoaded();
  const { createServerClient } = await import("@supabase/ssr");
  const { cookies } = await import("next/headers");
  const cookieStore = await cookies();

  let url =
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.SUPABASE_URL ||
    process.env.PUBLIC_SUPABASE_URL!;

  let key =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_ANON_KEY!;

  return createServerClient(url, key, {
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
          // Ignore if called from context that cannot set cookies
        }
      },
    },
  });
}

export const createServerSupabaseClient = createSupabaseServerClient;
export const getSupabaseServerAdminClient = createSupabaseServerClient;
