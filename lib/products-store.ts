// ============================================================
// VLR Traders — Products Data Store (Postgres via Drizzle)
// ============================================================

import { and, desc, eq, ne, or } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { products, categories } from "@/lib/db/schema";
import { Product, ProductDocument } from "@/data/products";
import { generateSlug } from "@/lib/slug";

type ProductRow = typeof products.$inferSelect;

function toProduct(row: ProductRow, categoryName: string): Product {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    categoryId: row.categoryId,
    categoryName,
    brand: row.brand,
    material: row.material ?? undefined,
    finish: row.finish ?? undefined,
    status: row.status as Product["status"],
    images: row.images,
    documents: row.documents,
    description: row.description,
    longDescription: row.longDescription,
    badge: (row.badge as Product["badge"]) ?? undefined,
    featured: row.featured,
    createdAt: row.createdAt.toISOString(),
  };
}

let productsCache: { data: Product[]; timestamp: number } | null = null;
const PRODUCTS_CACHE_TTL = 30000; // 30 seconds

export function clearProductsCache() {
  productsCache = null;
}

/** Read all products (with category name joined in) */
export async function getAllProducts(): Promise<Product[]> {
  const now = Date.now();
  if (productsCache && now - productsCache.timestamp < PRODUCTS_CACHE_TTL) {
    return productsCache.data;
  }
  try {
    const rows = await db
      .select({ product: products, categoryName: categories.name })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .orderBy(desc(products.createdAt));
    const data = rows.map((r) => toProduct(r.product, r.categoryName ?? "Uncategorized"));
    productsCache = { data, timestamp: now };
    return data;
  } catch (error) {
    console.error("Error reading products:", error);
    return productsCache?.data ?? [];
  }
}

export interface CreateProductInput {
  name: string;
  categoryId: string;
  brand: string;
  material?: string;
  finish?: string;
  description: string;
  longDescription?: string;
  status?: "Active" | "Inactive";
  images: string[];
  documents?: ProductDocument[];
  badge?: "Premium" | "Popular" | "Bestseller" | "New";
  featured?: boolean;
}

async function findUniqueSlug(baseName: string, excludeId?: string): Promise<string> {
  const baseSlug = generateSlug(baseName);
  let candidate = baseSlug;
  let counter = 1;

  // Small catalog size — a loop of individual existence checks is fine.
  while (true) {
    const existing = await db
      .select({ id: products.id })
      .from(products)
      .where(excludeId ? and(eq(products.slug, candidate), ne(products.id, excludeId)) : eq(products.slug, candidate))
      .limit(1);
    if (existing.length === 0) return candidate;
    candidate = `${baseSlug}-${counter}`;
    counter++;
  }
}

async function categoryNameFor(categoryId: string): Promise<string> {
  const [row] = await db.select({ name: categories.name }).from(categories).where(eq(categories.id, categoryId)).limit(1);
  return row?.name ?? "Uncategorized";
}

/** Add a new product */
export async function createProduct(input: CreateProductInput): Promise<Product> {
  const slug = await findUniqueSlug(input.name);
  const id = `prod-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 5)}`;

  const [row] = await db
    .insert(products)
    .values({
      id,
      slug,
      name: input.name.trim(),
      categoryId: input.categoryId,
      brand: input.brand.trim(),
      material: input.material?.trim() || null,
      finish: input.finish?.trim() || null,
      description: input.description.trim(),
      longDescription: input.longDescription?.trim() || input.description.trim(),
      status: input.status || "Active",
      images: input.images && input.images.length > 0 ? input.images : ["/hero_kitchen.jpg"],
      documents: input.documents ?? [],
      badge: input.badge ?? null,
      featured: input.featured ?? false,
    })
    .returning();

  clearProductsCache();
  return toProduct(row, await categoryNameFor(row.categoryId));
}

/** Update an existing product */
export async function updateProduct(id: string, updates: Partial<CreateProductInput>): Promise<Product | null> {
  const [existing] = await db.select().from(products).where(eq(products.id, id)).limit(1);
  if (!existing) return null;

  let slug = existing.slug;
  if (updates.name && updates.name.trim() !== existing.name) {
    slug = await findUniqueSlug(updates.name, id);
  }

  const [row] = await db
    .update(products)
    .set({
      slug,
      name: updates.name ? updates.name.trim() : existing.name,
      categoryId: updates.categoryId ?? existing.categoryId,
      brand: updates.brand !== undefined ? updates.brand.trim() : existing.brand,
      material: updates.material !== undefined ? updates.material?.trim() || null : existing.material,
      finish: updates.finish !== undefined ? updates.finish?.trim() || null : existing.finish,
      description: updates.description !== undefined ? updates.description.trim() : existing.description,
      longDescription:
        updates.longDescription !== undefined ? updates.longDescription.trim() : existing.longDescription,
      status: updates.status || existing.status,
      images: updates.images && updates.images.length > 0 ? updates.images : existing.images,
      documents: updates.documents !== undefined ? updates.documents : existing.documents,
      badge: updates.badge !== undefined ? updates.badge ?? null : existing.badge,
      featured: updates.featured !== undefined ? updates.featured : existing.featured,
    })
    .where(eq(products.id, id))
    .returning();

  clearProductsCache();
  return toProduct(row, await categoryNameFor(row.categoryId));
}

/** Delete a product */
export async function deleteProduct(id: string): Promise<boolean> {
  const deleted = await db.delete(products).where(eq(products.id, id)).returning({ id: products.id });
  clearProductsCache();
  return deleted.length > 0;
}

/** Get single product by slug or id */
export async function getProductBySlugOrId(identifier: string): Promise<Product | null> {
  const [row] = await db
    .select({ product: products, categoryName: categories.name })
    .from(products)
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .where(or(eq(products.slug, identifier), eq(products.id, identifier)))
    .limit(1);
  return row ? toProduct(row.product, row.categoryName ?? "Uncategorized") : null;
}
