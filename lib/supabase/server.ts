import "server-only";
import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import fs from "fs";
import path from "path";

/**
 * Ensures .env.local variables are populated in local development.
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
 * Server-side admin/service client for database queries.
 */
export function createSupabaseServerClient() {
  ensureEnvLoaded();

  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.SUPABASE_URL ||
    process.env.PUBLIC_SUPABASE_URL;

  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Missing Supabase ENV in production or local environment");
  }

  console.log("SUPABASE URL:", supabaseUrl);

  return createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false },
  });
}

/**
 * Cookie-aware SSR client for authenticating current user session.
 */
export async function createSupabaseUserClient() {
  ensureEnvLoaded();
  const cookieStore = await cookies();

  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.SUPABASE_URL ||
    process.env.PUBLIC_SUPABASE_URL;

  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Missing Supabase ENV in production or local environment");
  }

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
          // Ignore if called from context that cannot set cookies
        }
      },
    },
  });
}

export const createServerSupabaseClient = createSupabaseServerClient;
export const getSupabaseServerAdminClient = createSupabaseServerClient;
