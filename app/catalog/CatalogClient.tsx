"use client";

import React, { useState, useMemo, useCallback, useEffect, useTransition } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { products, type Category, type Product } from "@/data/products";
import {
  filterProducts,
  getCategoryCounts,
  getBrands,
  hasActiveFilters,
  DEFAULT_FILTERS,
  type FilterState,
  type SortOption,
} from "@/lib/catalog";
import { getWhatsAppUrl } from "@/lib/whatsapp";
import ProductEnquiryModal from "@/components/enquiry/ProductEnquiryModal";
import { MessageSquare, Grid, Layers, Wrench, Lock } from "lucide-react";
import styles from "./catalog.module.css";

const PAGE_SIZE = 12;

// ── Icons ────────────────────────────────────────────────────

function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" />
    </svg>
  );
}

function WhatsAppIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
    </svg>
  );
}

function CloseIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function FilterIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
    </svg>
  );
}

function EmptyIcon() {
  return (
    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" aria-hidden="true">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" />
      <line x1="8" y1="11" x2="14" y2="11" />
    </svg>
  );
}

// ── Product Card ─────────────────────────────────────────────

function ProductCard({ product }: { product: Product }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const waUrl = getWhatsAppUrl(product.name);

  return (
    <article className={styles.productCard} id={`product-${product.id}`}>
      <div className={styles.productImgWrap}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={product.images[0]}
          alt={product.name}
          className={styles.productImg}
          loading="lazy"
        />
        {product.badge && (
          <span className={`${styles.badge} ${styles[`badge${product.badge.replace(" ", "")}`]}`}>
            {product.badge}
          </span>
        )}
      </div>

      <div className={styles.productBody}>
        <div className={styles.productMeta}>
          <span className={styles.metaTag}>{product.categoryName}</span>
          {product.brand && (
            <span className={`${styles.metaTag} ${styles.metaFinish}`}>{product.brand}</span>
          )}
        </div>
        <h3 className={styles.productName}>{product.name}</h3>
        <p className={styles.productDesc}>{product.description}</p>

        <div className={styles.productActions}>
          <Link
            href={`/product/${product.slug}`}
            className={`btn btn-outline btn-sm ${styles.detailsBtn}`}
            id={`details-${product.id}`}
          >
            View Details
          </Link>
          <button
            type="button"
            className={`btn btn-whatsapp btn-sm ${styles.waBtn}`}
            id={`enquire-${product.id}`}
            onClick={() => setIsModalOpen(true)}
          >
            <WhatsAppIcon size={13} />
            WhatsApp Enquiry
          </button>
        </div>
      </div>

      <ProductEnquiryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        productName={product.name}
        productId={product.id}
        productImage={product.images[0]}
        productSubtitle={`${product.categoryName}${product.brand ? " • " + product.brand : ""}`}
        source="catalog"
      />
    </article>
  );
}

// ── Checkbox Filter Item ─────────────────────────────────────

function FilterCheckbox({
  label,
  count,
  checked,
  onChange,
}: {
  label: string;
  count?: number;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className={styles.checkLabel}>
      <input
        type="checkbox"
        className={styles.checkbox}
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span className={styles.checkText}>{label}</span>
      {count !== undefined && <span className={styles.checkCount}>{count}</span>}
    </label>
  );
}

// ── Main Client Component ────────────────────────────────────

export default function CatalogClient() {
  const searchParams = useSearchParams();
  const [liveProducts, setLiveProducts] = useState<Product[]>(products);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filters, setFilters] = useState<FilterState>(() => {
    const categoryIdParam = searchParams.get("categoryId");
    return { ...DEFAULT_FILTERS, categoryIds: categoryIdParam ? [categoryIdParam] : [] };
  });
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [, startTransition] = useTransition();

  useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.products)) {
          setLiveProducts(data.products);
        }
      })
      .catch(() => { });

    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.categories)) {
          // "Services" isn't a browsable catalog category — filtered from the UI.
          setCategories(data.categories.filter((c: Category) => c.slug !== "services"));
        }
      })
      .catch(() => { });
  }, []);

  const categoryCounts = useMemo(() => getCategoryCounts(liveProducts), [liveProducts]);
  const brands = useMemo(() => getBrands(liveProducts), [liveProducts]);

  const filtered = useMemo(() => filterProducts(filters, liveProducts), [filters, liveProducts]);
  const visible = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;
  const isFiltered = hasActiveFilters(filters);

  // ── Filter updaters ───────────────────────────────────────

  const setSearch = useCallback((search: string) => {
    startTransition(() => {
      setFilters((f) => ({ ...f, search }));
      setVisibleCount(PAGE_SIZE);
    });
  }, []);

  const toggleCategory = useCallback((catId: string, on: boolean) => {
    startTransition(() => {
      setFilters((f) => ({
        ...f,
        categoryIds: on
          ? [...f.categoryIds, catId]
          : f.categoryIds.filter((c) => c !== catId),
      }));
      setVisibleCount(PAGE_SIZE);
    });
  }, []);

  const toggleBrand = useCallback((brand: string, on: boolean) => {
    startTransition(() => {
      setFilters((f) => ({
        ...f,
        brands: on ? [...f.brands, brand] : f.brands.filter((b) => b !== brand),
      }));
      setVisibleCount(PAGE_SIZE);
    });
  }, []);

  const setSort = useCallback((sort: SortOption) => {
    setFilters((f) => ({ ...f, sort }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({ ...DEFAULT_FILTERS });
    setVisibleCount(PAGE_SIZE);
  }, []);

  const loadMore = useCallback(() => {
    setVisibleCount((c) => c + PAGE_SIZE);
  }, []);

  const categoryName = (id: string) => categories.find((c) => c.id === id)?.name ?? id;

  // ── Sidebar panel (shared between desktop sidebar + mobile drawer)

  const FilterPanel = (
    <div className={styles.filterPanel}>
      <div className={styles.filterPanelHeader}>
        <span className={styles.filterPanelTitle}>Filters</span>
        {isFiltered && (
          <button className={styles.clearBtn} onClick={clearFilters} type="button">
            Clear All
          </button>
        )}
      </div>

      {/* Search */}
      <div className={styles.filterGroup}>
        <p className={styles.filterGroupLabel}>Search</p>
        <div className={styles.searchWrap}>
          <SearchIcon />
          <input
            type="search"
            className={styles.searchInput}
            placeholder="Search products..."
            value={filters.search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search products"
            id="catalog-search"
          />
          {filters.search && (
            <button
              className={styles.clearSearch}
              onClick={() => setSearch("")}
              aria-label="Clear search"
              type="button"
            >
              <CloseIcon size={12} />
            </button>
          )}
        </div>
      </div>

      {/* Category */}
      <div className={styles.filterGroup}>
        <p className={styles.filterGroupLabel}>Category</p>
        {categories.map((cat) => (
          <FilterCheckbox
            key={cat.id}
            label={cat.name}
            count={categoryCounts[cat.id] ?? 0}
            checked={filters.categoryIds.includes(cat.id)}
            onChange={(on) => toggleCategory(cat.id, on)}
          />
        ))}
      </div>

      {/* Brand */}
      {brands.length > 0 && (
        <div className={styles.filterGroup}>
          <p className={styles.filterGroupLabel}>Brand</p>
          {brands.map((brand) => (
            <FilterCheckbox
              key={brand}
              label={brand}
              checked={filters.brands.includes(brand)}
              onChange={(on) => toggleBrand(brand, on)}
            />
          ))}
        </div>
      )}

      {/* Active filter tags */}
      {isFiltered && (
        <div className={styles.activeFilters}>
          {filters.categoryIds.map((c) => (
            <button
              key={c}
              className={styles.filterTag}
              onClick={() => toggleCategory(c, false)}
              type="button"
            >
              {categoryName(c)} <CloseIcon size={10} />
            </button>
          ))}
          {filters.brands.map((b) => (
            <button
              key={b}
              className={styles.filterTag}
              onClick={() => toggleBrand(b, false)}
              type="button"
            >
              {b} <CloseIcon size={10} />
            </button>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* ══════════════════════════════════════════════════════
          CATALOG HERO SECTION
      ══════════════════════════════════════════════════════ */}
      <section className={styles.catalogHero}>
        <div className={styles.heroBackgroundGlow} />
        <div className="container">
          {/* Header Row: Breadcrumb, Heading, WhatsApp CTA */}
          <div className={styles.heroHeaderRow}>
            <div className={styles.heroLeft}>
              {/* 1. Breadcrumb */}
              <nav aria-label="Breadcrumb" className={styles.breadcrumbNav}>
                <ol className={styles.breadcrumbList}>
                  <li>
                    <Link href="/" className={styles.breadcrumbLink}>Home</Link>
                  </li>
                  <li className={styles.breadcrumbSep}>/</li>
                  <li className={styles.breadcrumbCurrent} aria-current="page">Catalog</li>
                </ol>
              </nav>

              {/* 2. Main Heading */}
              <h1 className={styles.catalogHeroTitle}>
                Explore Our <span className={styles.titleHighlight}>Product Catalog</span>
              </h1>

              {/* 3. Subtext */}
              <p className={styles.catalogHeroSub}>
                Browse premium plywood, hardware, and locks from trusted brands for your interior and construction needs.
              </p>
            </div>

            {/* 4. CTA Element (Need help choosing?) */}
            <div className={styles.heroCtaCard}>
              <div className={styles.ctaCardIcon}><MessageSquare className="w-5 h-5 text-teal-700" /></div>
              <div className={styles.ctaCardText}>
                <p className={styles.ctaCardTitle}>Need help choosing?</p>
                <p className={styles.ctaCardSub}>Get expert advice &amp; bulk rates</p>
              </div>
              <a
                href={getWhatsAppUrl("Hello VLR Traders! I am browsing your catalog and would like assistance selecting the right materials.")}
                target="_blank"
                rel="noopener noreferrer"
                className={`btn btn-whatsapp btn-sm ${styles.heroCtaBtn}`}
                id="hero-catalog-whatsapp"
              >
                <WhatsAppIcon size={14} />
                Chat on WhatsApp
              </a>
            </div>
          </div>

          {/* 5. Search Bar + Quick Brand Filters */}
          <div className={styles.heroSearchContainer}>
            <div className={styles.largeSearchWrap}>
              <SearchIcon />
              <input
                type="search"
                className={styles.largeSearchInput}
                placeholder="Search products, brands, materials (e.g. Century Plywood, Hettich, Godrej)..."
                value={filters.search}
                onChange={(e) => setSearch(e.target.value)}
                id="hero-catalog-search"
                aria-label="Search product catalog"
              />
              {filters.search && (
                <button
                  className={styles.heroClearSearch}
                  onClick={() => setSearch("")}
                  type="button"
                  aria-label="Clear search"
                >
                  <CloseIcon size={12} />
                </button>
              )}
            </div>

            {/* Quick Brand Filter Chips */}
            <div className={styles.quickFilterRow}>
              <span className={styles.quickFilterLabel}>Popular Brands:</span>
              {["Century Club Prime", "Sylvan", "Vanam", "Hettich", "Simor", "Nimmi", "Godrej", "Europa"].map((brand) => {
                const isActive = filters.brands.includes(brand);
                return (
                  <button
                    key={brand}
                    type="button"
                    className={`${styles.quickFilterChip} ${isActive ? styles.quickFilterChipActive : ""}`}
                    onClick={() => toggleBrand(brand, !isActive)}
                  >
                    {brand}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 6. Category Quick Select Tabs */}
          <div className={styles.categoryTabsWrap}>
            <div className={styles.categoryTabsScroll}>
              <button
                type="button"
                className={`${styles.categoryTab} ${filters.categoryIds.length === 0 ? styles.categoryTabActive : ""}`}
                onClick={() => {
                  setFilters((f) => ({ ...f, categoryIds: [] }));
                  setVisibleCount(PAGE_SIZE);
                }}
                id="cat-tab-all"
              >
                <span className={styles.tabIcon}><Grid className="w-4 h-4 text-slate-700" /></span>
                <div className={styles.tabTextWrap}>
                  <span className={styles.tabLabel}>All Products</span>
                  <span className={styles.tabSub}>Full Range</span>
                </div>
                <span className={styles.tabCount}>{liveProducts.length}</span>
              </button>

              {/* Plywood Tab */}
              <button
                type="button"
                className={`${styles.categoryTab} ${filters.categoryIds.includes("cat-plywood") ? styles.categoryTabActive : ""}`}
                onClick={() => toggleCategory("cat-plywood", !filters.categoryIds.includes("cat-plywood"))}
                id="cat-tab-plywood"
              >
                <span className={styles.tabIcon}><Layers className="w-4 h-4 text-slate-700" /></span>
                <div className={styles.tabTextWrap}>
                  <span className={styles.tabLabel}>Plywood &amp; Boards</span>
                  <span className={styles.tabSub}>Sylvan, Vanam, Century</span>
                </div>
                {categoryCounts["cat-plywood"] !== undefined && (
                  <span className={styles.tabCount}>{categoryCounts["cat-plywood"]}</span>
                )}
              </button>

              {/* Hardware Tab */}
              <button
                type="button"
                className={`${styles.categoryTab} ${filters.categoryIds.includes("cat-hardware") ? styles.categoryTabActive : ""}`}
                onClick={() => toggleCategory("cat-hardware", !filters.categoryIds.includes("cat-hardware"))}
                id="cat-tab-hardware"
              >
                <span className={styles.tabIcon}><Wrench className="w-4 h-4 text-slate-700" /></span>
                <div className={styles.tabTextWrap}>
                  <span className={styles.tabLabel}>Hardware &amp; Fittings</span>
                  <span className={styles.tabSub}>Hettich, Simor, Nimmi</span>
                </div>
                {categoryCounts["cat-hardware"] !== undefined && (
                  <span className={styles.tabCount}>{categoryCounts["cat-hardware"]}</span>
                )}
              </button>

              {/* Locks Tab */}
              <button
                type="button"
                className={`${styles.categoryTab} ${filters.categoryIds.includes("cat-locks") ? styles.categoryTabActive : ""}`}
                onClick={() => toggleCategory("cat-locks", !filters.categoryIds.includes("cat-locks"))}
                id="cat-tab-locks"
              >
                <span className={styles.tabIcon}><Lock className="w-4 h-4 text-slate-700" /></span>
                <div className={styles.tabTextWrap}>
                  <span className={styles.tabLabel}>Locks &amp; Security</span>
                  <span className={styles.tabSub}>Godrej, Europa</span>
                </div>
                {categoryCounts["cat-locks"] !== undefined && (
                  <span className={styles.tabCount}>{categoryCounts["cat-locks"]}</span>
                )}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Catalog Layout Container */}
      <div className={`container ${styles.catalogContainer}`}>
        <div className={styles.catalogLayout}>
          {/* ── Mobile filter toggle ───────────────────────── */}
          <div className={styles.mobileFilterBar}>
            <div className={styles.mobileResultCount}>
              Showing {filtered.length} of {liveProducts.length} products
            </div>
            <button
              className={`btn btn-outline btn-sm ${styles.mobileFilterBtn}`}
              onClick={() => setMobileFiltersOpen(true)}
              id="mobile-filter-toggle"
              type="button"
            >
              <FilterIcon /> Filters
              {isFiltered && (
                <span className={styles.filterBadge}>
                  {filters.categoryIds.length + filters.brands.length}
                </span>
              )}
            </button>
          </div>

          {/* ── Mobile filter drawer ───────────────────────── */}
          {mobileFiltersOpen && (
            <>
              <div
                className={styles.drawerOverlay}
                onClick={() => setMobileFiltersOpen(false)}
                aria-hidden="true"
              />
              <div className={styles.mobileDrawer} role="dialog" aria-label="Filters">
                <div className={styles.mobileDrawerHeader}>
                  <span className={styles.filterPanelTitle}>Filters</span>
                  <button
                    className={styles.drawerClose}
                    onClick={() => setMobileFiltersOpen(false)}
                    aria-label="Close filters"
                    type="button"
                  >
                    <CloseIcon size={18} />
                  </button>
                </div>
                {FilterPanel}
                <div className={styles.mobileDrawerFooter}>
                  <button
                    className="btn btn-primary"
                    onClick={() => setMobileFiltersOpen(false)}
                    type="button"
                  >
                    Show {filtered.length} Results
                  </button>
                </div>
              </div>
            </>
          )}

          {/* ── Sidebar (desktop) ──────────────────────────── */}
          <aside className={styles.sidebar} aria-label="Product filters">
            {FilterPanel}
          </aside>

          {/* ── Main content ──────────────────────────────── */}
          <main className={styles.main} id="catalog-results">
            {/* Toolbar */}
            <div className={styles.toolbar}>
              <p className={styles.resultCount}>
                Showing {Math.min(visibleCount, filtered.length)}–{filtered.length} of{" "}
                <strong>{liveProducts.length}</strong> products
              </p>
              <div className={styles.sortWrap}>
                <label htmlFor="sort-select" className={styles.sortLabel}>Sort by:</label>
                <select
                  id="sort-select"
                  className={styles.sortSelect}
                  value={filters.sort}
                  onChange={(e) => setSort(e.target.value as SortOption)}
                >
                  <option value="featured">Featured</option>
                  <option value="newest">Newest</option>
                  <option value="popular">Most Popular</option>
                  <option value="az">A–Z</option>
                </select>
              </div>
            </div>

            {/* Grid */}
            {visible.length > 0 ? (
              <>
                <div className={styles.productGrid}>
                  {visible.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                {/* Load More */}
                {hasMore && (
                  <div className={styles.loadMoreWrap}>
                    <p className={styles.loadMoreInfo}>
                      Showing {visibleCount} of {filtered.length} products
                    </p>
                    <button
                      className={`btn btn-outline btn-lg ${styles.loadMoreBtn}`}
                      onClick={loadMore}
                      id="load-more-btn"
                      type="button"
                    >
                      Load More Products
                    </button>
                  </div>
                )}
              </>
            ) : (
              /* Empty state */
              <div className={styles.emptyState} id="empty-state">
                <EmptyIcon />
                <h2 className={styles.emptyTitle}>No products found</h2>
                <p className={styles.emptyDesc}>
                  Try adjusting your filters or search with different keywords.
                </p>
                <button
                  className={`btn btn-primary`}
                  onClick={clearFilters}
                  type="button"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </main>
        </div>
      </div>
    </>
  );
}
