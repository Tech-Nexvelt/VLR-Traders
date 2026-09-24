// ============================================================
// VLR Traders — Postgres/Drizzle Client Singleton
// ============================================================

import "server-only";
import dns from "node:dns";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

// Force IPv4 DNS resolution first to prevent 20s IPv6 socket timeouts on Vercel / AWS Lambda
try {
  dns.setDefaultResultOrder("ipv4first");
} catch {
  // Ignored in non-Node environments
}

declare global {
  // eslint-disable-next-line no-var
  var __vlrPgClient: ReturnType<typeof postgres> | undefined;
}

function createClient() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error(
      "DATABASE_URL is not set. Copy .env.example to .env.local and set it to your Postgres connection string."
    );
  }
  // A serverless/edge-friendly Postgres connection (Supabase pooled URL).
  return postgres(connectionString, {
    max: 1,
    ssl: "require",
    prepare: false,
    idle_timeout: 20,
    connect_timeout: 10,
  });
}

// Reuse the client across hot reloads in dev so we don't exhaust connections.
const client = global.__vlrPgClient ?? createClient();
if (process.env.NODE_ENV !== "production") {
  global.__vlrPgClient = client;
}

export const db = drizzle(client, { schema });
