// ============================================================
// VLR Traders — Products Data Store (Supabase `website` schema)
// ============================================================

import { getSupabaseServerAdminClient } from "@/lib/supabase/server";
import { Product, ProductDocument } from "@/data/products";
import { generateSlug } from "@/lib/slug";

/**
 * Parses JSONB or raw images array from database into string array.
 * Ensures products images[0] is safely accessible.
 */
export function parseProductImages(imagesRaw: any): string[] {
  let list: string[] = [];
  if (Array.isArray(imagesRaw)) {
    list = imagesRaw.filter((img): img is string => typeof img === "string" && img.trim().length > 0);
  } else if (typeof imagesRaw === "string") {
    try {
      const parsed = JSON.parse(imagesRaw);
      if (Array.isArray(parsed)) {
        list = parsed.filter((img): img is string => typeof img === "string" && img.trim().length > 0);
      }
    } catch {
      if (imagesRaw.trim()) list = [imagesRaw.trim()];
    }
  }
  return list.length > 0 ? list : ["/hero_kitchen.jpg"];
}

let productsCache: { data: Product[]; timestamp: number } | null = null;
const PRODUCTS_CACHE_TTL = 30000; // 30 seconds

export function clearProductsCache() {
  productsCache = null;
}

/** Read products using schema-aware query with multi-tenant company_id filter */
export async function getAllProducts(includeInactive = false): Promise<Product[]> {
  const now = Date.now();
  if (!includeInactive && productsCache && now - productsCache.timestamp < PRODUCTS_CACHE_TTL) {
    return productsCache.data;
  }
  try {
    const supabase = getSupabaseServerAdminClient();
    const companyId = process.env.WEBSITE_COMPANY_ID;

    // Fetch categories to join name
    let catQuery = supabase
      .schema("website")
      .from("categories")
      .select("id, name");

    if (companyId) {
      catQuery = catQuery.eq("company_id", companyId);
    }

    const { data: categoriesData, error: catError } = await catQuery;

    if (catError) {
      console.error("Supabase categories fetch error in getAllProducts:", catError);
    }

    const categoryMap = new Map<string, string>();
    (categoriesData || []).forEach((c: any) => {
      categoryMap.set(c.id, c.name);
    });

    // Build schema-aware query for products
    let query = supabase
      .schema("website")
      .from("products")
      .select("*");

    if (companyId) {
      query = query.eq("company_id", companyId);
    }

    if (!includeInactive) {
      query = query.eq("status", "Active");
    }

    const { data, error } = await query.order("created_at", { ascending: false });

    if (error) {
      console.error("Supabase products fetch error in getAllProducts:", error);
      return productsCache?.data ?? [];
    }

    const productsList: Product[] = (data || []).map((row: any) => {
      const catId = row.category_id || row.categoryId;
      const catName = categoryMap.get(catId) || "Uncategorized";
      const images = parseProductImages(row.images);

      return {
        id: row.id,
        slug: row.slug,
        name: row.name,
        categoryId: catId,
        categoryName: catName,
        brand: row.brand || "",
        material: row.material ?? undefined,
        finish: row.finish ?? undefined,
        status: (row.status as Product["status"]) || "Active",
        images, // JSONB array mapped; images[0] is primary image
        documents: (row.documents as ProductDocument[]) || [],
        description: row.description || "",
        longDescription: row.long_description || row.longDescription || row.description || "",
        badge: (row.badge as Product["badge"]) ?? undefined,
        featured: Boolean(row.featured),
        createdAt: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString(),
      };
    });

    if (!includeInactive) {
      productsCache = { data: productsList, timestamp: now };
    }
    return productsList;
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
  const supabase = getSupabaseServerAdminClient();
  const companyId = process.env.WEBSITE_COMPANY_ID;
  const baseSlug = generateSlug(baseName);
  let candidate = baseSlug;
  let counter = 1;

  while (true) {
    let query = supabase
      .schema("website")
      .from("products")
      .select("id")
      .eq("slug", candidate);

    if (companyId) query = query.eq("company_id", companyId);

    if (excludeId) {
      query = query.neq("id", excludeId);
    }

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

async function categoryNameFor(categoryId: string): Promise<string> {
  try {
    const supabase = getSupabaseServerAdminClient();
    const companyId = process.env.WEBSITE_COMPANY_ID;

    let query = supabase
      .schema("website")
      .from("categories")
      .select("name")
      .eq("id", categoryId);

    if (companyId) query = query.eq("company_id", companyId);

    const { data, error } = await query.limit(1);

    if (error) {
      console.error("Supabase categoryNameFor error:", error);
      return "Uncategorized";
    }

    return data?.[0]?.name ?? "Uncategorized";
  } catch {
    return "Uncategorized";
  }
}

/** Add a new product */
export async function createProduct(input: CreateProductInput): Promise<Product> {
  const supabase = getSupabaseServerAdminClient();
  const companyId = process.env.WEBSITE_COMPANY_ID;
  const slug = await findUniqueSlug(input.name);
  const id = `prod-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 5)}`;
  const images = input.images && input.images.length > 0 ? input.images : ["/hero_kitchen.jpg"];

  const payload: Record<string, any> = {
    id,
    slug,
    name: input.name.trim(),
    category_id: input.categoryId,
    brand: input.brand.trim(),
    material: input.material?.trim() || null,
    finish: input.finish?.trim() || null,
    description: input.description.trim(),
    long_description: input.longDescription?.trim() || input.description.trim(),
    status: input.status || "Active",
    images,
    documents: input.documents ?? [],
    badge: input.badge ?? null,
    featured: input.featured ?? false,
  };

  if (companyId) {
    payload.company_id = companyId;
  }

  const { data, error } = await supabase
    .schema("website")
    .from("products")
    .insert([payload])
    .select("*")
    .single();

  if (error) {
    console.error("Error creating product:", error);
    throw new Error(error.message || "Failed to create product");
  }

  clearProductsCache();

  const categoryName = await categoryNameFor(data.category_id || data.categoryId);
  return {
    id: data.id,
    slug: data.slug,
    name: data.name,
    categoryId: data.category_id || data.categoryId,
    categoryName,
    brand: data.brand || "",
    material: data.material ?? undefined,
    finish: data.finish ?? undefined,
    status: (data.status as Product["status"]) || "Active",
    images: parseProductImages(data.images),
    documents: (data.documents as ProductDocument[]) || [],
    description: data.description || "",
    longDescription: data.long_description || data.description || "",
    badge: (data.badge as Product["badge"]) ?? undefined,
    featured: Boolean(data.featured),
    createdAt: data.created_at ? new Date(data.created_at).toISOString() : new Date().toISOString(),
  };
}

/** Update an existing product with company_id multi-tenant filter */
export async function updateProduct(id: string, updates: Partial<CreateProductInput>): Promise<Product | null> {
  const supabase = getSupabaseServerAdminClient();
  const companyId = process.env.WEBSITE_COMPANY_ID;

  console.log("Company ID:", companyId);
  console.log("Product ID:", id);

  let fetchQuery = supabase
    .schema("website")
    .from("products")
    .select("*")
    .eq("id", id);

  if (companyId) {
    fetchQuery = fetchQuery.eq("company_id", companyId);
  }

  const { data: existingData, error: fetchError } = await fetchQuery.single();

  if (fetchError || !existingData) {
    if (fetchError) console.error("Error fetching existing product:", fetchError);
    return null;
  }

  let slug = existingData.slug;
  if (updates.name && updates.name.trim() !== existingData.name) {
    slug = await findUniqueSlug(updates.name, id);
  }

  const payload: Record<string, any> = {};
  if (updates.name !== undefined) payload.name = updates.name.trim();
  payload.slug = slug;
  if (updates.categoryId !== undefined) payload.category_id = updates.categoryId;
  if (updates.brand !== undefined) payload.brand = updates.brand.trim();
  if (updates.material !== undefined) payload.material = updates.material?.trim() || null;
  if (updates.finish !== undefined) payload.finish = updates.finish?.trim() || null;
  if (updates.description !== undefined) payload.description = updates.description.trim();
  if (updates.longDescription !== undefined) payload.long_description = updates.longDescription.trim();
  if (updates.status !== undefined) payload.status = updates.status;
  if (updates.images && updates.images.length > 0) payload.images = updates.images;
  if (updates.documents !== undefined) payload.documents = updates.documents;
  if (updates.badge !== undefined) payload.badge = updates.badge || null;
  if (updates.featured !== undefined) payload.featured = updates.featured;

  let updateQuery = supabase
    .schema("website")
    .from("products")
    .update(payload)
    .eq("id", id);

  if (companyId) {
    updateQuery = updateQuery.eq("company_id", companyId);
  }

  const { data, error } = await updateQuery.select("*").single();

  if (error) {
    console.error("Error updating product:", error);
    return null;
  }

  clearProductsCache();

  const categoryName = await categoryNameFor(data.category_id || data.categoryId);
  return {
    id: data.id,
    slug: data.slug,
    name: data.name,
    categoryId: data.category_id || data.categoryId,
    categoryName,
    brand: data.brand || "",
    material: data.material ?? undefined,
    finish: data.finish ?? undefined,
    status: (data.status as Product["status"]) || "Active",
    images: parseProductImages(data.images),
    documents: (data.documents as ProductDocument[]) || [],
    description: data.description || "",
    longDescription: data.long_description || data.description || "",
    badge: (data.badge as Product["badge"]) ?? undefined,
    featured: Boolean(data.featured),
    createdAt: data.created_at ? new Date(data.created_at).toISOString() : new Date().toISOString(),
  };
}

/** Delete a product with company_id multi-tenant filter */
export async function deleteProduct(id: string): Promise<boolean> {
  try {
    const supabase = getSupabaseServerAdminClient();
    const companyId = process.env.WEBSITE_COMPANY_ID;

    console.log("Company ID:", companyId);
    console.log("Product ID:", id);

    let query = supabase
      .schema("website")
      .from("products")
      .delete()
      .eq("id", id);

    if (companyId) {
      query = query.eq("company_id", companyId);
    }

    const { error } = await query;

    if (error) {
      console.error("Error deleting product:", error);
      return false;
    }
    clearProductsCache();
    return true;
  } catch (error) {
    console.error("Error deleting product:", error);
    return false;
  }
}

/** Get single product by slug or id (with company_id filter & status = 'Active') */
export async function getProductBySlugOrId(identifier: string): Promise<Product | null> {
  try {
    const supabase = getSupabaseServerAdminClient();
    const companyId = process.env.WEBSITE_COMPANY_ID;

    let catQuery = supabase
      .schema("website")
      .from("categories")
      .select("id, name");

    if (companyId) catQuery = catQuery.eq("company_id", companyId);

    const { data: categoriesData, error: catError } = await catQuery;

    if (catError) console.error("Supabase categories error in getProductBySlugOrId:", catError);

    const categoryMap = new Map<string, string>();
    (categoriesData || []).forEach((c: any) => {
      categoryMap.set(c.id, c.name);
    });

    let query = supabase
      .schema("website")
      .from("products")
      .select("*")
      .or(`slug.eq.${identifier},id.eq.${identifier}`)
      .eq("status", "Active");

    if (companyId) query = query.eq("company_id", companyId);

    const { data, error } = await query.limit(1);

    if (error) {
      console.error("Supabase getProductBySlugOrId error:", error);
      return null;
    }

    if (!data || data.length === 0) return null;

    const row = data[0];
    const catId = row.category_id || row.categoryId;
    const catName = categoryMap.get(catId) || "Uncategorized";
    const images = parseProductImages(row.images);

    return {
      id: row.id,
      slug: row.slug,
      name: row.name,
      categoryId: catId,
      categoryName: catName,
      brand: row.brand || "",
      material: row.material ?? undefined,
      finish: row.finish ?? undefined,
      status: (row.status as Product["status"]) || "Active",
      images,
      documents: (row.documents as ProductDocument[]) || [],
      description: row.description || "",
      longDescription: row.long_description || row.longDescription || row.description || "",
      badge: (row.badge as Product["badge"]) ?? undefined,
      featured: Boolean(row.featured),
      createdAt: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString(),
    };
  } catch (error) {
    console.error("Error fetching product by slug/id:", error);
    return null;
  }
}
