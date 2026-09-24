// ============================================================
// VLR Traders — Catalog Filter + Search Logic
// ============================================================

import { products, type Product, type SortOption } from "@/data/products";

export type { SortOption };

export interface FilterState {
  search: string;
  categoryIds: string[];
  brands: string[];
  sort: SortOption;
}

export const DEFAULT_FILTERS: FilterState = {
  search: "",
  categoryIds: [],
  brands: [],
  sort: "featured",
};

/** Apply all filters + sort to the master product list */
export function filterProducts(filters: FilterState, customProducts?: Product[]): Product[] {
  let result = [...(customProducts || products)].filter((p) => p.status !== "Inactive");

  // ── Search ────────────────────────────────────────────────
  if (filters.search.trim()) {
    const q = filters.search.toLowerCase().trim();
    result = result.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.categoryName.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q)
    );
  }

  // ── Category ──────────────────────────────────────────────
  if (filters.categoryIds.length > 0) {
    result = result.filter((p) => filters.categoryIds.includes(p.categoryId));
  }

  // ── Brand ─────────────────────────────────────────────────
  if (filters.brands.length > 0) {
    result = result.filter((p) => filters.brands.includes(p.brand));
  }

  // ── Sort ──────────────────────────────────────────────────
  switch (filters.sort) {
    case "featured":
      result = result.sort((a, b) =>
        Number(b.featured ?? false) - Number(a.featured ?? false)
      );
      break;
    case "newest":
      result = result.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      break;
    case "popular":
      result = result.filter((p) => p.badge === "Bestseller" || p.badge === "Popular")
        .concat(result.filter((p) => p.badge !== "Bestseller" && p.badge !== "Popular"));
      break;
    case "az":
      result = result.sort((a, b) => a.name.localeCompare(b.name));
      break;
  }

  return result;
}

/** Count products per category id (from a live product list) */
export function getCategoryCounts(list: Product[]): Record<string, number> {
  return list.reduce(
    (acc, p) => {
      acc[p.categoryId] = (acc[p.categoryId] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );
}

/** Distinct brand list (from a live product list) */
export function getBrands(list: Product[]): string[] {
  return Array.from(new Set(list.map((p) => p.brand).filter(Boolean))).sort();
}

/** Check if any filter is active (besides sort) */
export function hasActiveFilters(filters: FilterState): boolean {
  return (
    filters.search.trim().length > 0 ||
    filters.categoryIds.length > 0 ||
    filters.brands.length > 0
  );
}
