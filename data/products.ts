// ============================================================
// VLR Traders — Product Types
// Categories are now DB-managed (see lib/categories-store.ts / the
// `website.categories` table) rather than a hardcoded union — the
// live list always comes from /api/categories.
// ============================================================

export interface Category {
  id: string;
  name: string;
  slug: string;
  imageUrl?: string | null;
}

export interface ProductVariant {
  type: "color" | "finish" | "size";
  label: string;              // e.g. "Color Options"
  options: {
    value: string;            // e.g. "Matte Grey"
    hex?: string;             // for color swatches
  }[];
}

export interface ProductFeature {
  icon: string;               // emoji
  title: string;
  desc: string;
}

export interface ProductSpec {
  key: string;
  value: string;
}

export interface ProductDocument {
  name: string;   // display name, e.g. "Kitchen Planner Sheet.pdf"
  url: string;    // /uploads/... or an external URL
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  categoryId: string;
  categoryName: string;        // denormalized for display (joined by the store)
  brand: string;
  material?: string;           // optional — doesn't apply to hardware/locks
  finish?: string;              // optional — doesn't apply to hardware/locks
  images: string[];
  documents?: ProductDocument[]; // planner sheets, spec sheets, catalogues (PDFs)
  description: string;         // short (used on catalog cards)
  longDescription?: string;    // full product description (detail page)
  badge?: "Premium" | "Popular" | "Bestseller" | "New";
  featured?: boolean;
  status?: "Active" | "Inactive";
  createdAt: string;           // ISO date for sorting
  variants?: ProductVariant[];
  features?: ProductFeature[];
  specs?: ProductSpec[];
}

export type SortOption = "featured" | "newest" | "popular" | "az";

// Live data always comes from /api/products — this is only the
// pre-fetch fallback shape used for initial render.
export const products: Product[] = [];
