// ============================================================
// VLR Traders — Categories Data Store (Supabase `website` schema)
// ============================================================

import { getSupabaseServerAdminClient } from "@/lib/supabase/server";
import { parseProductImages } from "@/lib/products-store";
import { generateSlug } from "@/lib/slug";
import type { Category } from "@/data/products";

export interface CategoryWithCover extends Category {
  /** First active product image URL for this category, or cover_image, or null. */
  coverImage: string | null;
}

let categoriesCache: { data: Category[]; timestamp: number } | null = null;
let categoriesWithCoverCache: { data: CategoryWithCover[]; timestamp: number } | null = null;
const CATEGORIES_CACHE_TTL = 30000;

export function clearCategoriesCache() {
  categoriesCache = null;
  categoriesWithCoverCache = null;
}

/** Read all categories using schema-aware query: supabase.schema('website').from('categories') */
export async function getAllCategories(): Promise<Category[]> {
  const now = Date.now();
  if (categoriesCache && now - categoriesCache.timestamp < CATEGORIES_CACHE_TTL) {
    return categoriesCache.data;
  }
  try {
    const supabase = getSupabaseServerAdminClient();
    const { data, error } = await supabase
      .schema("website")
      .from("categories")
      .select("*")
      .order("name", { ascending: true });

    if (error) {
      console.error("Supabase getAllCategories error:", error);
      return categoriesCache?.data ?? [];
    }

    const result: Category[] = (data || []).map((cat: any) => ({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      imageUrl: cat.cover_image || cat.image_url || null,
    }));

    categoriesCache = { data: result, timestamp: now };
    return result;
  } catch (error) {
    console.error("Error reading categories:", error);
    return categoriesCache?.data ?? [];
  }
}

/**
 * Returns all categories enriched with a coverImage derived from
 * 1) category.cover_image / image_url if explicitly set, or
 * 2) fallback to first Active product image (images[0]) in that category.
 */
export async function getCategoriesWithCoverImage(): Promise<CategoryWithCover[]> {
  const now = Date.now();
  if (categoriesWithCoverCache && now - categoriesWithCoverCache.timestamp < CATEGORIES_CACHE_TTL) {
    return categoriesWithCoverCache.data;
  }
  try {
    const supabase = getSupabaseServerAdminClient();

    // 1. Query categories using schema-aware query: supabase.schema('website').from('categories')
    const { data: categoriesData, error: catError } = await supabase
      .schema("website")
      .from("categories")
      .select("*")
      .order("name", { ascending: true });

    if (catError) {
      console.error("Supabase categories error in getCategoriesWithCoverImage:", catError);
      return categoriesWithCoverCache?.data ?? [];
    }

    // 2. Query active products using schema-aware query: supabase.schema('website').from('products').eq('status', 'Active')
    const { data: productsData, error: prodError } = await supabase
      .schema("website")
      .from("products")
      .select("*")
      .eq("status", "Active")
      .order("created_at", { ascending: true });

    if (prodError) {
      console.error("Supabase products error in getCategoriesWithCoverImage:", prodError);
    }

    const activeProducts = productsData || [];

    const data: CategoryWithCover[] = (categoriesData || []).map((cat: any) => {
      // Priority 1: Explicit cover_image column or image_url column
      const explicitCover = cat.cover_image || cat.image_url || null;

      // Priority 2: Fallback to first active product's images[0] in this category
      const firstCatProduct = activeProducts.find(
        (p: any) => (p.category_id || p.categoryId) === cat.id
      );
      const productImages = parseProductImages(firstCatProduct?.images);
      const fallbackProductCover = productImages[0] || null;

      return {
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        imageUrl: cat.cover_image || cat.image_url || null,
        coverImage: explicitCover || fallbackProductCover,
      };
    });

    categoriesWithCoverCache = { data, timestamp: now };
    return data;
  } catch (error) {
    console.error("Error reading categories with cover:", error);
    return categoriesWithCoverCache?.data ?? [];
  }
}

export async function getCategoryById(id: string): Promise<Category | null> {
  try {
    const supabase = getSupabaseServerAdminClient();
    const { data, error } = await supabase
      .schema("website")
      .from("categories")
      .select("*")
      .eq("id", id)
      .limit(1);

    if (error) {
      console.error("Supabase getCategoryById error:", error);
      return null;
    }

    if (!data || data.length === 0) return null;
    const cat = data[0];
    return {
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      imageUrl: cat.cover_image || cat.image_url || null,
    };
  } catch (error) {
    console.error("Error fetching category by ID:", error);
    return null;
  }
}

async function findUniqueSlug(baseName: string, excludeId?: string): Promise<string> {
  const supabase = getSupabaseServerAdminClient();
  const baseSlug = generateSlug(baseName);
  let candidate = baseSlug;
  let counter = 1;

  while (true) {
    let query = supabase
      .schema("website")
      .from("categories")
      .select("id")
      .eq("slug", candidate);

    if (excludeId) query = query.neq("id", excludeId);

    const { data, error } = await query.limit(1);
    if (error) {
      console.error("Supabase findUniqueSlug error:", error);
      return candidate;
    }
    if (!data || data.length === 0) return candidate;
    candidate = `${baseSlug}-${counter}`;
    counter++;
  }
}

export async function createCategory(name: string, imageUrl?: string | null): Promise<Category> {
  const supabase = getSupabaseServerAdminClient();
  const slug = await findUniqueSlug(name);
  const id = `cat-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 5)}`;
  const cleanImage = imageUrl?.trim() || null;

  const { data, error } = await supabase
    .schema("website")
    .from("categories")
    .insert([{ id, name: name.trim(), slug, cover_image: cleanImage, image_url: cleanImage }])
    .select("*")
    .single();

  if (error) {
    console.error("Error creating category:", error);
    throw new Error(error.message || "Failed to create category");
  }

  clearCategoriesCache();
  return {
    id: data.id,
    name: data.name,
    slug: data.slug,
    imageUrl: data.cover_image || data.image_url || null,
  };
}

export async function updateCategory(
  id: string,
  data: { name?: string; imageUrl?: string | null }
): Promise<Category | null> {
  const supabase = getSupabaseServerAdminClient();
  const existing = await getCategoryById(id);
  if (!existing) return null;

  const payload: Record<string, any> = {};
  if (data.name !== undefined && data.name.trim() !== existing.name) {
    payload.name = data.name.trim();
    payload.slug = await findUniqueSlug(data.name, id);
  }
  if (data.imageUrl !== undefined) {
    const cleanImg = data.imageUrl ? data.imageUrl.trim() : null;
    payload.cover_image = cleanImg;
    payload.image_url = cleanImg;
  }

  if (Object.keys(payload).length === 0) {
    return existing;
  }

  const { data: updated, error } = await supabase
    .schema("website")
    .from("categories")
    .update(payload)
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    console.error("Error updating category:", error);
    return null;
  }

  clearCategoriesCache();
  return {
    id: updated.id,
    name: updated.name,
    slug: updated.slug,
    imageUrl: updated.cover_image || updated.image_url || null,
  };
}

export async function deleteCategory(id: string): Promise<{ success: boolean; error?: string }> {
  const supabase = getSupabaseServerAdminClient();

  // Check if products exist in this category
  const { data: existingProducts, error: checkError } = await supabase
    .schema("website")
    .from("products")
    .select("id")
    .eq("category_id", id)
    .limit(1);

  if (checkError) console.error("Supabase check existing products error:", checkError);

  if (existingProducts && existingProducts.length > 0) {
    return {
      success: false,
      error: "Cannot delete category because products are assigned to it. Please reassign or remove the products first.",
    };
  }

  const { error } = await supabase
    .schema("website")
    .from("categories")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting category:", error);
    return { success: false, error: error.message };
  }

  clearCategoriesCache();
  return { success: true };
}
