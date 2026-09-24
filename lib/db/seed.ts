// ============================================================
// VLR Traders — One-time DB Seed Script
// Seeds the real product catalog (Plywood/Hardware/Locks + brands)
// plus leads/settings from data/*.json.
// Admin accounts are NOT created here — they live in Supabase Auth +
// quotation_pro.profiles, managed by Quotation Pro.
// Usage: npm run db:seed
// ============================================================

import { loadEnvConfig } from "@next/env";
loadEnvConfig(process.cwd());

import fs from "fs";
import path from "path";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not set. Copy .env.example to .env.local first.");
}

const client = postgres(connectionString, { max: 1, ssl: "require" });
const db = drizzle(client, { schema });

function readJson<T>(filename: string, fallback: T): T {
  const filePath = path.join(process.cwd(), "data", filename);
  if (!fs.existsSync(filePath)) return fallback;
  return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}

// ── Real catalog: categories + brands ─────────────────────────

// ── Real catalog: categories + brands ─────────────────────────

// Distinct Dedicated High-Res Product Photography URLs per product item
const SYLVAN_CATALOG_IMG = "https://images.unsplash.com/photo-1504148455328-c376907d081c?w=1000&q=85";
const SYLVAN_DETAIL_IMG = "https://images.unsplash.com/photo-1546484475-7f7bd55792da?w=1000&q=85";

const VANAM_CATALOG_IMG = "https://images.unsplash.com/photo-1600121848594-d8644e57abab?w=1000&q=85";
const VANAM_DETAIL_IMG = "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1000&q=85";

const CENTURY_CATALOG_IMG = "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=1000&q=85";
const CENTURY_DETAIL_IMG = "https://images.unsplash.com/photo-1538688525198-9b88f6f53126?w=1000&q=85";

const HETTICH_CATALOG_IMG = "https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=1000&q=85";
const HETTICH_DETAIL_IMG = "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=1000&q=85";

const SIMOR_CATALOG_IMG = "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1000&q=85";
const SIMOR_DETAIL_IMG = "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=1000&q=85";

const NIMMI_CATALOG_IMG = "https://images.unsplash.com/photo-1532323544230-7191fd51bc1b?w=1000&q=85";
const NIMMI_DETAIL_IMG = "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1000&q=85";

const GODREJ_CATALOG_IMG = "https://images.unsplash.com/photo-1558002038-1055907df827?w=1000&q=85";
const GODREJ_DETAIL_IMG = "https://images.unsplash.com/photo-1517646287270-a5a9ca602e5c?w=1000&q=85";

const EUROPA_CATALOG_IMG = "https://images.unsplash.com/photo-1622372738946-62e02505feb3?w=1000&q=85";
const EUROPA_DETAIL_IMG = "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=1000&q=85";

const CATEGORY_SEED = [
  { id: "cat-plywood", name: "Plywood", slug: "plywood" },
  { id: "cat-hardware", name: "Hardware", slug: "hardware" },
  { id: "cat-locks", name: "Locks", slug: "locks" },
  { id: "cat-services", name: "Services", slug: "services" },
];

const PRODUCT_SEED = [
  {
    id: "prod-sylvan-plywood",
    slug: "sylvan-plywood",
    name: "Sylvan Plywood",
    categoryId: "cat-plywood",
    brand: "Sylvan",
    description: "Durable, moisture-resistant plywood boards for everyday furniture and interior work.",
    images: [SYLVAN_CATALOG_IMG, SYLVAN_DETAIL_IMG],
    badge: null as string | null,
  },
  {
    id: "prod-vanam-plywood",
    slug: "vanam-plywood",
    name: "Vanam Plywood",
    categoryId: "cat-plywood",
    brand: "Vanam",
    description: "Reliable, affordable plywood boards suited for a wide range of interior applications.",
    images: [VANAM_CATALOG_IMG, VANAM_DETAIL_IMG],
    badge: null,
  },
  {
    id: "prod-century-club-prime",
    slug: "century-club-prime-plywood",
    name: "Century Club Prime Plywood",
    categoryId: "cat-plywood",
    brand: "Century",
    description: "Premium-grade plywood from Century — known for strength, durability, and moisture resistance.",
    images: [CENTURY_CATALOG_IMG, CENTURY_DETAIL_IMG],
    badge: "Premium",
  },
  {
    id: "prod-hettich-hardware",
    slug: "hettich-cabinet-hardware",
    name: "Hettich Cabinet Hardware",
    categoryId: "cat-hardware",
    brand: "Hettich",
    description: "Premium German-engineered cabinet hardware — hinges, channels, and fittings built to last.",
    images: [HETTICH_CATALOG_IMG, HETTICH_DETAIL_IMG],
    badge: "Premium",
  },
  {
    id: "prod-simor-hardware",
    slug: "simor-hardware-fittings",
    name: "Simor Hardware Fittings",
    categoryId: "cat-hardware",
    brand: "Simor",
    description: "Dependable hardware fittings for modular kitchens and wardrobes at an affordable price point.",
    images: [SIMOR_CATALOG_IMG, SIMOR_DETAIL_IMG],
    badge: null,
  },
  {
    id: "prod-nimmi-hardware",
    slug: "nimmi-hardware-fittings",
    name: "Nimmi Hardware Fittings",
    categoryId: "cat-hardware",
    brand: "Nimmi",
    description: "Everyday cabinet and furniture hardware fittings for residential and commercial projects.",
    images: [NIMMI_CATALOG_IMG, NIMMI_DETAIL_IMG],
    badge: null,
  },
  {
    id: "prod-uropa-locks",
    slug: "europa-locks",
    name: "Europa Locks",
    categoryId: "cat-locks",
    brand: "Europa",
    description: "Secure, reliable locks for doors, cabinets, and furniture applications.",
    images: [EUROPA_CATALOG_IMG, EUROPA_DETAIL_IMG],
    badge: null,
  },
  {
    id: "prod-godrej-locks",
    slug: "godrej-locks",
    name: "Godrej Locks",
    categoryId: "cat-locks",
    brand: "Godrej",
    description: "India's most trusted lock brand — robust security hardware for doors and furniture.",
    images: [GODREJ_CATALOG_IMG, GODREJ_DETAIL_IMG],
    badge: "Popular",
  },
];

async function seedCategories() {
  await db
    .insert(schema.categories)
    .values(CATEGORY_SEED.map((c) => ({ id: c.id, name: c.name, slug: c.slug })))
    .onConflictDoNothing({ target: schema.categories.id });
  return CATEGORY_SEED.length;
}

async function seedCatalogProducts() {
  await db
    .insert(schema.products)
    .values(
      PRODUCT_SEED.map((p) => ({
        id: p.id,
        slug: p.slug,
        name: p.name,
        categoryId: p.categoryId,
        brand: p.brand,
        description: p.description,
        longDescription: p.description,
        images: p.images,
        badge: p.badge,
        featured: p.badge !== null,
        status: "Active",
      }))
    )
    .onConflictDoNothing({ target: schema.products.id });
  return PRODUCT_SEED.length;
}

async function seedLeads() {
  const leads = readJson<any[]>("leads.json", []);
  if (leads.length === 0) return 0;
  await db
    .insert(schema.leads)
    .values(
      leads.map((l) => ({
        id: l.id,
        name: l.name,
        phone: l.phone,
        message: l.message || "",
        product: l.product || "",
        source: l.source,
        status: l.status,
        timestamp: new Date(l.timestamp),
      }))
    )
    .onConflictDoNothing({ target: schema.leads.id });
  return leads.length;
}

async function seedEnquirySettings() {
  const data = readJson<Record<string, unknown> | null>("settings.json", null);
  if (!data) return false;
  await db
    .insert(schema.enquirySettings)
    .values({ id: "singleton", data })
    .onConflictDoNothing({ target: schema.enquirySettings.id });
  return true;
}

async function seedWebsiteSettings() {
  const data = readJson<Record<string, unknown> | null>("website-settings.json", null);
  if (!data) return false;
  await db
    .insert(schema.websiteSettings)
    .values({ id: "singleton", data })
    .onConflictDoNothing({ target: schema.websiteSettings.id });
  return true;
}

async function main() {
  console.log("Seeding website schema...");

  const categoryCount = await seedCategories();
  const productCount = await seedCatalogProducts();
  const [leadCount, enquirySeeded, websiteSeeded] = await Promise.all([
    seedLeads(),
    seedEnquirySettings(),
    seedWebsiteSettings(),
  ]);

  console.log(`Categories:       ${categoryCount} inserted (skipped if already present)`);
  console.log(`Products:         ${productCount} inserted (skipped if already present)`);
  console.log(`Leads:            ${leadCount} inserted (skipped if already present)`);
  console.log(`Enquiry settings: ${enquirySeeded ? "seeded" : "skipped (no data/settings.json)"}`);
  console.log(`Website settings: ${websiteSeeded ? "seeded" : "skipped (no data/website-settings.json)"}`);

  await client.end();
  console.log("Done.");
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
