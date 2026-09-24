// ============================================================
// VLR Traders — Categories Data Store (Postgres via Drizzle)
// ============================================================

import { and, asc, eq, ne, sql } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { categories, products } from "@/lib/db/schema";
import { generateSlug } from "@/lib/slug";
import type { Category } from "@/data/products";

export interface CategoryWithCover extends Category {
  /** First product image URL for this category, or null if no products yet. */
  coverImage: string | null;
}

function toCategory(row: typeof categories.$inferSelect): Category {
  return { id: row.id, name: row.name, slug: row.slug, imageUrl: row.imageUrl ?? null };
}

export async function getAllCategories(): Promise<Category[]> {
  try {
    const rows = await db.select().from(categories).orderBy(asc(categories.name));
    return rows.map(toCategory);
  } catch (error) {
    console.error("Error reading categories:", error);
    return [];
  }
}

/**
 * Returns all categories enriched with a coverImage derived from
 * 1) category.imageUrl if explicitly set, or
 * 2) first Active product image in that category.
 */
export async function getCategoriesWithCoverImage(): Promise<CategoryWithCover[]> {
  try {
    const rows = await db
      .select({
        id: categories.id,
        name: categories.name,
        slug: categories.slug,
        imageUrl: categories.imageUrl,
        productCoverImage: sql<string | null>`(
          SELECT p.images->0
          FROM website.products p
          WHERE p.category_id = ${categories.id}
            AND p.status = 'Active'
            AND jsonb_array_length(p.images) > 0
          ORDER BY p.created_at ASC
          LIMIT 1
        )`,
      })
      .from(categories)
      .orderBy(asc(categories.name));

    return rows.map((r) => ({
      id: r.id,
      name: r.name,
      slug: r.slug,
      imageUrl: r.imageUrl ?? null,
      coverImage: r.imageUrl || r.productCoverImage || null,
    }));
  } catch (error) {
    console.error("Error reading categories with cover:", error);
    return [];
  }
}

export async function getCategoryById(id: string): Promise<Category | null> {
  const [row] = await db.select().from(categories).where(eq(categories.id, id)).limit(1);
  return row ? toCategory(row) : null;
}

async function findUniqueSlug(baseName: string, excludeId?: string): Promise<string> {
  const baseSlug = generateSlug(baseName);
  let candidate = baseSlug;
  let counter = 1;

  while (true) {
    const existing = await db
      .select({ id: categories.id })
      .from(categories)
      .where(
        excludeId
          ? and(eq(categories.slug, candidate), ne(categories.id, excludeId))
          : eq(categories.slug, candidate)
      )
      .limit(1);
    if (existing.length === 0) return candidate;
    candidate = `${baseSlug}-${counter}`;
    counter++;
  }
}

export async function createCategory(name: string, imageUrl?: string | null): Promise<Category> {
  const slug = await findUniqueSlug(name);
  const id = `cat-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 5)}`;
  const [row] = await db
    .insert(categories)
    .values({ id, name: name.trim(), slug, imageUrl: imageUrl?.trim() || null })
    .returning();
  return toCategory(row);
}

export async function updateCategory(
  id: string,
  data: { name?: string; imageUrl?: string | null }
): Promise<Category | null> {
  const existing = await getCategoryById(id);
  if (!existing) return null;

  const updateFields: { name?: string; slug?: string; imageUrl?: string | null } = {};
  if (data.name !== undefined && data.name.trim() !== existing.name) {
    updateFields.name = data.name.trim();
    updateFields.slug = await findUniqueSlug(data.name, id);
  }
  if (data.imageUrl !== undefined) {
    updateFields.imageUrl = data.imageUrl ? data.imageUrl.trim() : null;
  }

  if (Object.keys(updateFields).length === 0) {
    return existing;
  }

  const [row] = await db
    .update(categories)
    .set(updateFields)
    .where(eq(categories.id, id))
    .returning();

  return row ? toCategory(row) : null;
}

export async function deleteCategory(id: string): Promise<{ success: boolean; error?: string }> {
  // Check if products exist in this category
  const existingProducts = await db
    .select({ id: products.id })
    .from(products)
    .where(eq(products.categoryId, id))
    .limit(1);

  if (existingProducts.length > 0) {
    return {
      success: false,
      error: "Cannot delete category because products are assigned to it. Please reassign or remove the products first.",
    };
  }

  await db.delete(categories).where(eq(categories.id, id));
  return { success: true };
}
