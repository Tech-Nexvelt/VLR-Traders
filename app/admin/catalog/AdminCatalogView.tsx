"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import Image from "next/image";
import {
  Package,
  FileCheck,
  FolderTree,
  AlertTriangle,
  Search,
  Box,
  Pencil,
  Trash2,
  X,
  Camera,
  FileText,
  UploadCloud,
  ChevronDown,
  ChevronRight,
  Plus,
  Layers,
  LayoutList,
  FolderPlus,
} from "lucide-react";
import { type Product, type Category, type ProductDocument } from "@/data/products";
import { generateSlug } from "@/lib/slug";
import styles from "./catalog-management.module.css";

const BADGE_OPTIONS = ["None", "Premium", "Popular", "Bestseller", "New"] as const;

export default function AdminCatalogView() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // View Mode: "grouped" | "table" | "categories"
  const [viewMode, setViewMode] = useState<"grouped" | "table" | "categories">("grouped");

  // Expanded category accordions in grouped view
  const [expandedCategoryIds, setExpandedCategoryIds] = useState<string[]>([]);

  // Automatically expand all categories when categories load
  useEffect(() => {
    if (categories.length > 0 && expandedCategoryIds.length === 0) {
      setExpandedCategoryIds(categories.map((c) => c.id));
    }
  }, [categories]);

  const toggleCategoryExpand = (catId: string) => {
    setExpandedCategoryIds((prev) =>
      prev.includes(catId) ? prev.filter((id) => id !== catId) : [...prev, catId]
    );
  };

  // Filters & Search
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("latest");

  // Selection
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Pagination (for flat table view)
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Drawer Modal State (Add / Edit Product)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerTab, setDrawerTab] = useState<"details" | "images" | "documents">("details");
  const [editingId, setEditingId] = useState<string | null>(null);

  // Product Form Fields
  const [formName, setFormName] = useState("");
  const [formCategoryId, setFormCategoryId] = useState("");
  const [formBrand, setFormBrand] = useState("");
  const [formMaterial, setFormMaterial] = useState("");
  const [formFinish, setFormFinish] = useState("");
  const [formBadge, setFormBadge] = useState<(typeof BADGE_OPTIONS)[number]>("None");
  const [formStatus, setFormStatus] = useState<"Active" | "Inactive">("Active");
  const [formDesc, setFormDesc] = useState("");
  const [formImages, setFormImages] = useState<string[]>([]);
  const [formUrlInput, setFormUrlInput] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [formDocuments, setFormDocuments] = useState<ProductDocument[]>([]);
  const [isUploadingDoc, setIsUploadingDoc] = useState(false);

  // Category Add / Edit Modal State
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryFormName, setCategoryFormName] = useState("");
  const [categoryFormImageUrl, setCategoryFormImageUrl] = useState("");
  const [isUploadingCatImg, setIsUploadingCatImg] = useState(false);
  const catFileInputRef = useRef<HTMLInputElement>(null);

  // Delete Confirmation Modal State
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);

  // Fetch products + categories from API
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/products");
      const data = await res.json();
      if (data.success) {
        setProducts(data.products || []);
      } else {
        setError(data.error || "Failed to load products");
      }
    } catch (err: any) {
      setError(err.message || "Network error loading products");
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/categories");
      const data = await res.json();
      if (data.success) {
        setCategories(data.categories || []);
      }
    } catch {
      // non-fatal — category dropdown will just be empty
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  // Filtered & Sorted Products
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        // Search
        if (search.trim()) {
          const q = search.toLowerCase().trim();
          const matchName = p.name.toLowerCase().includes(q);
          const matchCat = (p.categoryName || "").toLowerCase().includes(q);
          const matchBrand = (p.brand || "").toLowerCase().includes(q);
          const matchDesc = (p.description || "").toLowerCase().includes(q);
          if (!matchName && !matchCat && !matchBrand && !matchDesc) return false;
        }

        // Category Filter
        if (selectedCategory !== "all" && p.categoryId !== selectedCategory) {
          return false;
        }

        // Status Filter
        if (selectedStatus !== "all") {
          const status = p.status || "Active";
          if (status !== selectedStatus) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "name") return a.name.localeCompare(b.name);
        if (sortBy === "category") return (a.categoryName || "").localeCompare(b.categoryName || "");
        // default latest
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      });
  }, [products, search, selectedCategory, selectedStatus, sortBy]);

  // Group products by Category
  const productsGroupedByCategory = useMemo(() => {
    const map: { category: Category; items: Product[] }[] = [];

    categories.forEach((cat) => {
      const items = filteredProducts.filter((p) => p.categoryId === cat.id);
      map.push({ category: cat, items });
    });

    const knownCatIds = new Set(categories.map((c) => c.id));
    const uncategorized = filteredProducts.filter((p) => !knownCatIds.has(p.categoryId));

    if (uncategorized.length > 0) {
      map.push({
        category: { id: "uncategorized", name: "Uncategorized", slug: "uncategorized", imageUrl: null },
        items: uncategorized,
      });
    }

    return map;
  }, [categories, filteredProducts]);

  // Metrics
  const totalProducts = products.length;
  const activeProducts = products.filter((p) => (p.status || "Active") === "Active").length;
  const inactiveProducts = totalProducts - activeProducts;
  const totalCategories = categories.length;

  // Pagination calculation for table view
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage) || 1;
  const currentProducts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredProducts.slice(start, start + itemsPerPage);
  }, [filteredProducts, currentPage]);

  // Open Drawer for Create Product (optional preset categoryId)
  const handleOpenAdd = (presetCategoryId?: string) => {
    setEditingId(null);
    setFormName("");
    setFormCategoryId(presetCategoryId || categories[0]?.id || "");
    setFormBrand("");
    setFormMaterial("");
    setFormFinish("");
    setFormBadge("None");
    setFormStatus("Active");
    setFormDesc("");
    setFormImages([]);
    setFormDocuments([]);
    setDrawerTab("details");
    setIsDrawerOpen(true);
  };

  // Open Drawer for Edit Product
  const handleOpenEdit = (p: Product) => {
    setEditingId(p.id);
    setFormName(p.name || "");
    setFormCategoryId(p.categoryId || "");
    setFormBrand(p.brand || "");
    setFormMaterial(p.material || "");
    setFormFinish(p.finish || "");
    setFormBadge((p.badge as (typeof BADGE_OPTIONS)[number]) || "None");
    setFormStatus(p.status || "Active");
    setFormDesc(p.description || "");
    setFormImages(p.images && p.images.length > 0 ? [...p.images] : []);
    setFormDocuments(p.documents ? [...p.documents] : []);
    setDrawerTab("details");
    setIsDrawerOpen(true);
  };

  // Category Add/Edit Handlers
  const handleOpenAddCategory = (presetName = "") => {
    setEditingCategory(null);
    setCategoryFormName(presetName);
    setCategoryFormImageUrl("");
    setIsCategoryModalOpen(true);
  };

  const handleOpenEditCategory = (cat: Category) => {
    setEditingCategory(cat);
    setCategoryFormName(cat.name);
    setCategoryFormImageUrl(cat.imageUrl || "");
    setIsCategoryModalOpen(true);
  };

  const handleCatFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validation: Image types & max size 5MB
    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!validTypes.includes(file.type)) {
      alert("Invalid image format. Please select a JPG, PNG, WebP, or GIF image.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert("File size exceeds 5MB limit. Please select a smaller image.");
      return;
    }

    setIsUploadingCatImg(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.success && data.url) {
        setCategoryFormImageUrl(data.url);
      } else {
        alert(data.error || "Failed to upload category image");
      }
    } catch (err: any) {
      alert(err.message || "Error uploading category image");
    } finally {
      setIsUploadingCatImg(false);
    }
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryFormName.trim()) {
      alert("Please enter a category name");
      return;
    }

    try {
      if (editingCategory) {
        // Update category
        const res = await fetch(`/api/categories/${editingCategory.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: categoryFormName.trim(),
            imageUrl: categoryFormImageUrl.trim() || null,
          }),
        });
        const data = await res.json();
        if (data.success && data.category) {
          setCategories((prev) =>
            prev.map((c) => (c.id === data.category.id ? data.category : c))
          );
          setIsCategoryModalOpen(false);
          fetchProducts(); // Refresh products to show updated categoryName
        } else {
          alert(data.error || "Failed to update category");
        }
      } else {
        // Create category
        const res = await fetch("/api/categories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: categoryFormName.trim(),
            imageUrl: categoryFormImageUrl.trim() || null,
          }),
        });
        const data = await res.json();
        if (data.success && data.category) {
          setCategories((prev) => [...prev, data.category]);
          setExpandedCategoryIds((prev) => [...prev, data.category.id]);
          setFormCategoryId(data.category.id);
          setIsCategoryModalOpen(false);
        } else {
          alert(data.error || "Failed to create category");
        }
      }
    } catch (err: any) {
      alert(err.message || "Error saving category");
    }
  };

  const handleDeleteCategory = async (cat: Category) => {
    const productsInCat = products.filter((p) => p.categoryId === cat.id).length;
    if (productsInCat > 0) {
      alert(
        `Cannot delete category "${cat.name}" because ${productsInCat} product(s) are assigned to it. Please reassign or delete the products first.`
      );
      return;
    }

    if (!window.confirm(`Are you sure you want to delete category "${cat.name}"?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/categories/${cat.id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setCategories((prev) => prev.filter((c) => c.id !== cat.id));
      } else {
        alert(data.error || "Failed to delete category");
      }
    } catch (err: any) {
      alert(err.message || "Error deleting category");
    }
  };

  // Save Product (Create or Edit)
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      alert("Please enter product name");
      return;
    }
    if (!formCategoryId) {
      alert("Please select a category");
      return;
    }
    if (!formBrand.trim()) {
      alert("Please enter a brand");
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        name: formName.trim(),
        categoryId: formCategoryId,
        brand: formBrand.trim(),
        material: formMaterial.trim() || undefined,
        finish: formFinish.trim() || undefined,
        status: formStatus,
        description: formDesc.trim(),
        images: formImages.length > 0 ? formImages : ["/hero_kitchen.jpg"],
        documents: formDocuments,
        badge: formBadge === "None" ? null : formBadge,
      };

      if (editingId) {
        const res = await fetch(`/api/products/${editingId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (data.success) {
          setIsDrawerOpen(false);
          fetchProducts();
        } else {
          alert(data.error || "Failed to update product");
        }
      } else {
        const res = await fetch("/api/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (data.success) {
          setIsDrawerOpen(false);
          fetchProducts();
        } else {
          alert(data.error || "Failed to create product");
        }
      }
    } catch (err: any) {
      alert(err.message || "Error saving product");
    } finally {
      setIsSaving(false);
    }
  };

  // Toggle Product Status
  const handleToggleStatus = async (p: Product) => {
    const newStatus = (p.status || "Active") === "Active" ? "Inactive" : "Active";
    setProducts((prev) =>
      prev.map((item) => (item.id === p.id ? { ...item, status: newStatus } : item))
    );

    try {
      await fetch(`/api/products/${p.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
    } catch (err) {
      fetchProducts();
    }
  };

  // Confirm Delete Product
  const handleDeleteConfirm = async () => {
    if (!deletingProduct) return;
    try {
      const res = await fetch(`/api/products/${deletingProduct.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        setDeletingProduct(null);
        fetchProducts();
      } else {
        alert(data.error || "Failed to delete product");
      }
    } catch (err: any) {
      alert(err.message || "Error deleting product");
    }
  };

  // File Image Upload handler for products
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const formData = new FormData();
      formData.append("file", file);

      try {
        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        const data = await res.json();
        if (data.success && data.url) {
          setFormImages((prev) => [...prev, data.url]);
        }
      } catch (err) {
        console.error("Failed to upload image", err);
      }
    }
    setIsUploading(false);
  };

  // Add Image via URL input
  const handleAddUrlImage = () => {
    if (!formUrlInput.trim()) return;
    setFormImages((prev) => [...prev, formUrlInput.trim()]);
    setFormUrlInput("");
  };

  // Remove Image thumbnail
  const handleRemoveImage = (index: number) => {
    setFormImages((prev) => prev.filter((_, i) => i !== index));
  };

  // PDF document upload handler
  const handleDocFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploadingDoc(true);
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const formData = new FormData();
      formData.append("file", file);

      try {
        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        const data = await res.json();
        if (data.success && data.url) {
          setFormDocuments((prev) => [...prev, { name: file.name, url: data.url }]);
        } else {
          alert(data.error || `Failed to upload ${file.name}`);
        }
      } catch (err) {
        console.error("Failed to upload document", err);
      }
    }
    setIsUploadingDoc(false);
    if (docInputRef.current) docInputRef.current.value = "";
  };

  // Remove a document
  const handleRemoveDocument = (index: number) => {
    setFormDocuments((prev) => prev.filter((_, i) => i !== index));
  };

  // Select all checkboxes
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(currentProducts.map((p) => p.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const CATEGORY_BADGE_CLASSES = [
    styles.catModularKitchens,
    styles.catWardrobes,
    styles.catInteriorPanels,
    styles.catHardware,
    styles.catCustomSolutions,
  ];
  const getCategoryBadgeClass = (categoryId: string) => {
    const idx = categories.findIndex((c) => c.id === categoryId);
    return CATEGORY_BADGE_CLASSES[Math.max(0, idx) % CATEGORY_BADGE_CLASSES.length];
  };

  const generatedSlugPreview = useMemo(() => {
    return formName.trim() ? generateSlug(formName) : "product-slug";
  }, [formName]);

  return (
    <div className={styles.container}>
      {/* ── HEADER ROW ────────────────────────────────────────────── */}
      <div className={styles.headerRow}>
        <div>
          <h1 className={styles.title}>Catalog & Category Management</h1>
          <p className={styles.subtitle}>
            Manage products grouped by category, update cover images, and maintain your catalog.
          </p>
        </div>
        <div style={{ display: "flex", gap: "0.75rem" }}>
          <button
            type="button"
            className={styles.cancelBtn}
            onClick={() => handleOpenAddCategory()}
            style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem" }}
          >
            <FolderPlus size={16} /> + New Category
          </button>
          <button
            type="button"
            className={styles.primaryBtn}
            onClick={() => handleOpenAdd()}
            id="add-product-btn"
          >
            <span>+</span> Add Product
          </button>
        </div>
      </div>

      {/* ── METRIC STATS CARDS ────────────────────────────────────── */}
      <div className={styles.statsGrid}>
        {/* Total Products */}
        <div className={styles.statCard}>
          <div className={`${styles.statIconBox} ${styles.iconBlue}`}>
            <Package size={20} color="#1b4f8a" />
          </div>
          <div className={styles.statContent}>
            <span className={styles.statLabel}>Total Products</span>
            <div className={styles.statValueRow}>
              <span className={styles.statValue}>{totalProducts}</span>
            </div>
          </div>
        </div>

        {/* Active Products */}
        <div className={styles.statCard}>
          <div className={`${styles.statIconBox} ${styles.iconGreen}`}>
            <FileCheck size={20} color="#0d9488" />
          </div>
          <div className={styles.statContent}>
            <span className={styles.statLabel}>Active Products</span>
            <div className={styles.statValueRow}>
              <span className={styles.statValue}>{activeProducts}</span>
            </div>
          </div>
        </div>

        {/* Categories */}
        <div className={styles.statCard}>
          <div className={`${styles.statIconBox} ${styles.iconPurple}`}>
            <FolderTree size={20} color="#8b5cf6" />
          </div>
          <div className={styles.statContent}>
            <span className={styles.statLabel}>Categories</span>
            <div className={styles.statValueRow}>
              <span className={styles.statValue}>{totalCategories}</span>
            </div>
          </div>
        </div>

        {/* Inactive */}
        <div className={styles.statCard}>
          <div className={`${styles.statIconBox} ${styles.iconOrange}`}>
            <AlertTriangle size={20} color="#f97316" />
          </div>
          <div className={styles.statContent}>
            <span className={styles.statLabel}>Inactive Products</span>
            <div className={styles.statValueRow}>
              <span className={styles.statValue}>{inactiveProducts}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── TOOLBAR & VIEW MODE SWITCHER ─────────────────────────── */}
      <div className={styles.toolbarCard}>
        <div className={styles.toolbarLeft}>
          {/* View Mode Switcher */}
          <div className={styles.viewModeBar}>
            <button
              type="button"
              className={`${styles.viewModeBtn} ${
                viewMode === "grouped" ? styles.viewModeBtnActive : ""
              }`}
              onClick={() => setViewMode("grouped")}
            >
              <Layers size={15} /> Grouped View
            </button>
            <button
              type="button"
              className={`${styles.viewModeBtn} ${
                viewMode === "table" ? styles.viewModeBtnActive : ""
              }`}
              onClick={() => setViewMode("table")}
            >
              <LayoutList size={15} /> All Products
            </button>
            <button
              type="button"
              className={`${styles.viewModeBtn} ${
                viewMode === "categories" ? styles.viewModeBtnActive : ""
              }`}
              onClick={() => setViewMode("categories")}
            >
              <FolderTree size={15} /> Categories ({categories.length})
            </button>
          </div>

          {/* Search Box */}
          <div className={styles.searchInputWrap}>
            <span className={styles.searchIcon} style={{ display: "inline-flex", alignItems: "center" }}>
              <Search size={16} color="#64748b" />
            </span>
            <input
              type="text"
              className={styles.searchInput}
              placeholder="Search products..."
              value={search || ""}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              id="catalog-search-input"
            />
          </div>

          {/* Category Filter */}
          <select
            className={styles.filterSelect}
            value={selectedCategory || "all"}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setCurrentPage(1);
            }}
            id="category-filter-select"
          >
            <option value="all">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.toolbarRight}>
          <span>Sort by:</span>
          <select
            className={styles.filterSelect}
            value={sortBy || "latest"}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="latest">Latest First</option>
            <option value="name">Name A-Z</option>
            <option value="category">Category</option>
          </select>
        </div>
      </div>

      {/* ── MAIN CONTENT AREA ────────────────────────────────────── */}
      {loading ? (
        <div className={styles.tableContainer} style={{ padding: "3rem", textAlign: "center", color: "#64748b" }}>
          Loading catalog data...
        </div>
      ) : viewMode === "grouped" ? (
        /* ── VIEW 1: GROUPED BY CATEGORY (ACCORDION SECTIONS) ──── */
        <div>
          {productsGroupedByCategory.map(({ category, items }) => {
            const isExpanded = expandedCategoryIds.includes(category.id);
            const coverPhoto = category.imageUrl || (items[0]?.images?.[0] || "/cat_panels.jpg");

            return (
              <div key={category.id} className={styles.categoryGroupCard}>
                {/* Accordion Header */}
                <div
                  className={styles.categoryGroupHeader}
                  onClick={() => toggleCategoryExpand(category.id)}
                >
                  <div className={styles.categoryGroupTitleWrap}>
                    <span style={{ display: "flex", alignItems: "center" }}>
                      {isExpanded ? <ChevronDown size={20} color="#64748b" /> : <ChevronRight size={20} color="#64748b" />}
                    </span>
                    <img
                      src={coverPhoto}
                      alt={category.name}
                      className={styles.catGroupThumb}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/cat_panels.jpg";
                      }}
                    />
                    <div>
                      <h2 className={styles.catGroupTitle}>
                        {category.name}
                        <span className={styles.countPill}>
                          {items.length} {items.length === 1 ? "product" : "products"}
                        </span>
                      </h2>
                    </div>
                  </div>

                  <div className={styles.categoryGroupActions} onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      className={styles.catActionBtn}
                      onClick={() => handleOpenAdd(category.id)}
                    >
                      <Plus size={14} /> Add Product
                    </button>
                    {category.id !== "uncategorized" && (
                      <>
                        <button
                          type="button"
                          className={styles.catActionBtn}
                          onClick={() => handleOpenEditCategory(category)}
                        >
                          <Pencil size={13} /> Edit Category
                        </button>
                        <button
                          type="button"
                          className={`${styles.catActionBtn} ${styles.catActionBtnDanger}`}
                          onClick={() => handleDeleteCategory(category)}
                        >
                          <Trash2 size={13} /> Delete
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Accordion Body */}
                {isExpanded && (
                  <div className={styles.categoryGroupBody}>
                    {items.length === 0 ? (
                      <div style={{ padding: "1.5rem", textAlign: "center", color: "#94a3b8", fontSize: "0.875rem" }}>
                        No products added under <strong>{category.name}</strong> yet. Click "+ Add Product" to add one.
                      </div>
                    ) : (
                      <table className={styles.table}>
                        <thead>
                          <tr>
                            <th>Image</th>
                            <th>Product Name</th>
                            <th>Brand</th>
                            <th>Material</th>
                            <th>Finish</th>
                            <th>Status</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {items.map((p) => {
                            const status = p.status || "Active";
                            const thumb = p.images && p.images.length > 0 ? p.images[0] : "/hero_kitchen.jpg";

                            return (
                              <tr key={p.id}>
                                <td>
                                  <img
                                    src={thumb}
                                    alt={p.name}
                                    className={styles.productThumb}
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).src = "/hero_kitchen.jpg";
                                    }}
                                  />
                                </td>
                                <td>
                                  <div className={styles.productCell}>
                                    <div className={styles.productTextGroup}>
                                      <span className={styles.productTitle}>{p.name}</span>
                                      <span className={styles.productSubtitle}>{p.description}</span>
                                    </div>
                                  </div>
                                </td>
                                <td style={{ fontWeight: 500, color: "#475569" }}>{p.brand || "—"}</td>
                                <td style={{ fontSize: "0.8125rem", color: "#64748b" }}>{p.material || "—"}</td>
                                <td style={{ fontSize: "0.8125rem", color: "#64748b" }}>{p.finish || "—"}</td>
                                <td>
                                  <button
                                    type="button"
                                    className={`${styles.statusBtn} ${
                                      status === "Active" ? styles.statusActive : styles.statusInactive
                                    }`}
                                    onClick={() => handleToggleStatus(p)}
                                  >
                                    <span className={styles.statusDot} />
                                    {status}
                                  </button>
                                </td>
                                <td>
                                  <div className={styles.actionGroup}>
                                    <button
                                      type="button"
                                      className={styles.editBtn}
                                      onClick={() => handleOpenEdit(p)}
                                    >
                                      <Pencil size={13} /> Edit
                                    </button>
                                    <button
                                      type="button"
                                      className={styles.deleteBtn}
                                      onClick={() => setDeletingProduct(p)}
                                    >
                                      <Trash2 size={13} /> Delete
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : viewMode === "categories" ? (
        /* ── VIEW 2: CATEGORIES MANAGEMENT TABLE ────────────────── */
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Category Image</th>
                <th>Category Name</th>
                <th>Slug</th>
                <th>Products Count</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat) => {
                const count = products.filter((p) => p.categoryId === cat.id).length;
                const coverPhoto = cat.imageUrl || "/cat_panels.jpg";

                return (
                  <tr key={cat.id}>
                    <td>
                      <img
                        src={coverPhoto}
                        alt={cat.name}
                        style={{
                          width: "48px",
                          height: "48px",
                          borderRadius: "0.5rem",
                          objectFit: "cover",
                          border: "1px solid #cbd5e1",
                        }}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "/cat_panels.jpg";
                        }}
                      />
                    </td>
                    <td style={{ fontWeight: 600, color: "#0f172a", fontSize: "0.9375rem" }}>
                      {cat.name}
                    </td>
                    <td style={{ fontSize: "0.8125rem", color: "#64748b" }}>/catalog?cat={cat.slug}</td>
                    <td>
                      <span className={styles.countPill}>
                        {count} {count === 1 ? "product" : "products"}
                      </span>
                    </td>
                    <td>
                      <div className={styles.actionGroup}>
                        <button
                          type="button"
                          className={styles.editBtn}
                          onClick={() => handleOpenEditCategory(cat)}
                        >
                          <Pencil size={13} /> Edit Image / Name
                        </button>
                        <button
                          type="button"
                          className={styles.deleteBtn}
                          onClick={() => handleDeleteCategory(cat)}
                        >
                          <Trash2 size={13} /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        /* ── VIEW 3: FLAT PRODUCTS TABLE ───────────────────────── */
        <div className={styles.tableContainer}>
          {filteredProducts.length === 0 ? (
            <div className={styles.emptyCard}>
              <div className={styles.emptyIcon} style={{ display: "flex", justifyContent: "center" }}>
                <Box size={32} color="#64748b" />
              </div>
              <h3 className={styles.emptyTitle}>No products found</h3>
              <p className={styles.emptyDesc}>Try resetting your search filters or add a new product.</p>
            </div>
          ) : (
            <>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th className={styles.checkboxTh}>
                      <input
                        type="checkbox"
                        className={styles.checkboxInput}
                        onChange={handleSelectAll}
                        checked={
                          currentProducts.length > 0 &&
                          currentProducts.every((p) => selectedIds.includes(p.id))
                        }
                      />
                    </th>
                    <th>Image</th>
                    <th>Product Name</th>
                    <th>Category</th>
                    <th>Brand</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentProducts.map((p) => {
                    const isChecked = selectedIds.includes(p.id);
                    const status = p.status || "Active";
                    const thumb = p.images && p.images.length > 0 ? p.images[0] : "/hero_kitchen.jpg";

                    return (
                      <tr key={p.id}>
                        <td className={styles.checkboxTd}>
                          <input
                            type="checkbox"
                            className={styles.checkboxInput}
                            checked={isChecked}
                            onChange={() => handleSelectOne(p.id)}
                          />
                        </td>
                        <td>
                          <img
                            src={thumb}
                            alt={p.name}
                            className={styles.productThumb}
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = "/hero_kitchen.jpg";
                            }}
                          />
                        </td>
                        <td>
                          <div className={styles.productCell}>
                            <div className={styles.productTextGroup}>
                              <span className={styles.productTitle}>{p.name}</span>
                              <span className={styles.productSubtitle}>{p.description}</span>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className={`${styles.categoryBadge} ${getCategoryBadgeClass(p.categoryId)}`}>
                            {p.categoryName}
                          </span>
                        </td>
                        <td style={{ fontWeight: 500, color: "#475569" }}>{p.brand || "—"}</td>
                        <td>
                          <button
                            type="button"
                            className={`${styles.statusBtn} ${
                              status === "Active" ? styles.statusActive : styles.statusInactive
                            }`}
                            onClick={() => handleToggleStatus(p)}
                          >
                            <span className={styles.statusDot} />
                            {status}
                          </button>
                        </td>
                        <td>
                          <div className={styles.actionGroup}>
                            <button
                              type="button"
                              className={styles.editBtn}
                              onClick={() => handleOpenEdit(p)}
                            >
                              <Pencil size={13} /> Edit
                            </button>
                            <button
                              type="button"
                              className={styles.deleteBtn}
                              onClick={() => setDeletingProduct(p)}
                            >
                              <Trash2 size={13} /> Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className={styles.paginationBar}>
                  <span>
                    Showing {Math.min((currentPage - 1) * itemsPerPage + 1, filteredProducts.length)} to{" "}
                    {Math.min(currentPage * itemsPerPage, filteredProducts.length)} of {filteredProducts.length} entries
                  </span>
                  <div className={styles.pageBtnGroup}>
                    <button
                      type="button"
                      className={styles.pageBtn}
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                    >
                      Previous
                    </button>
                    {Array.from({ length: totalPages }).map((_, idx) => (
                      <button
                        key={idx + 1}
                        type="button"
                        className={`${styles.pageBtn} ${currentPage === idx + 1 ? styles.pageBtnActive : ""}`}
                        onClick={() => setCurrentPage(idx + 1)}
                      >
                        {idx + 1}
                      </button>
                    ))}
                    <button
                      type="button"
                      className={styles.pageBtn}
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* ── ADD / EDIT CATEGORY MODAL ───────────────────────────── */}
      {isCategoryModalOpen && (
        <div className={styles.catModalOverlay} onClick={() => setIsCategoryModalOpen(false)}>
          <div className={styles.catModalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.catModalHeader}>
              <h3 className={styles.catModalTitle}>
                {editingCategory ? `Edit Category: ${editingCategory.name}` : "Create New Category"}
              </h3>
              <button
                type="button"
                className={styles.closeBtn}
                onClick={() => setIsCategoryModalOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveCategory}>
              <div className={styles.catModalBody}>
                {/* Category Name */}
                <div className={styles.formGroup}>
                  <label className={styles.label}>
                    Category Name <span className={styles.required}>*</span>
                  </label>
                  <input
                    type="text"
                    className={styles.input}
                    placeholder="e.g. Plywood & Boards, Locks, Hardware"
                    value={categoryFormName || ""}
                    onChange={(e) => setCategoryFormName(e.target.value)}
                    required
                  />
                </div>

                {/* Category Image Upload */}
                <div className={styles.formGroup}>
                  <label className={styles.label}>Category Cover Image</label>
                  
                  {/* Hidden File Input */}
                  <input
                    type="file"
                    ref={catFileInputRef}
                    onChange={handleCatFileChange}
                    accept="image/*"
                    style={{ display: "none" }}
                  />

                  {/* Dropzone */}
                  <div
                    className={styles.uploadBox}
                    onClick={() => catFileInputRef.current?.click()}
                  >
                    <div className={styles.uploadIcon} style={{ display: "flex", justifyContent: "center" }}>
                      <UploadCloud size={32} color="#1b4f8a" />
                    </div>
                    <div className={styles.uploadTitle}>
                      {isUploadingCatImg ? "Uploading image..." : "Click to upload category cover image"}
                    </div>
                    <div className={styles.uploadSubtitle}>PNG, JPG, WebP, GIF (Max 5MB)</div>
                  </div>

                  {/* Preview (loaded directly from DB or newly uploaded storage image) */}
                  {categoryFormImageUrl && (
                    <div style={{ marginTop: "1rem", display: "flex", alignItems: "center", gap: "1rem" }}>
                      <img
                        src={categoryFormImageUrl}
                        alt="Category Preview"
                        style={{
                          width: "80px",
                          height: "60px",
                          borderRadius: "0.5rem",
                          objectFit: "cover",
                          border: "1px solid #cbd5e1",
                        }}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "/cat_panels.jpg";
                        }}
                      />
                      <div>
                        <span style={{ fontSize: "0.8125rem", fontWeight: 600, color: "#16a34a" }}>
                          ✓ Cover Image Set
                        </span>
                        <button
                          type="button"
                          style={{
                            display: "block",
                            background: "none",
                            border: "none",
                            color: "#dc2626",
                            fontSize: "0.75rem",
                            cursor: "pointer",
                            padding: 0,
                            marginTop: "2px",
                          }}
                          onClick={() => setCategoryFormImageUrl("")}
                        >
                          Remove Image
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className={styles.catModalFooter}>
                <button
                  type="button"
                  className={styles.cancelBtn}
                  onClick={() => setIsCategoryModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className={styles.primaryBtn} disabled={isUploadingCatImg}>
                  {isUploadingCatImg ? "Uploading..." : editingCategory ? "Save Changes" : "Create Category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── ADD / EDIT PRODUCT DRAWER MODAL ─────────────────────── */}
      {isDrawerOpen && (
        <div className={styles.drawerOverlay} onClick={() => setIsDrawerOpen(false)}>
          <div className={styles.drawer} onClick={(e) => e.stopPropagation()}>
            <div className={styles.drawerHeader}>
              <h3 className={styles.drawerTitle}>
                {editingId ? "Edit Product" : "Add New Product"}
              </h3>
              <button
                type="button"
                className={styles.closeBtn}
                onClick={() => setIsDrawerOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <div className={styles.drawerTabs}>
              <button
                type="button"
                className={`${styles.tabBtn} ${drawerTab === "details" ? styles.tabBtnActive : ""}`}
                onClick={() => setDrawerTab("details")}
              >
                Product Details
              </button>
              <button
                type="button"
                className={`${styles.tabBtn} ${drawerTab === "images" ? styles.tabBtnActive : ""}`}
                onClick={() => setDrawerTab("images")}
              >
                Images ({formImages.length})
              </button>
              <button
                type="button"
                className={`${styles.tabBtn} ${drawerTab === "documents" ? styles.tabBtnActive : ""}`}
                onClick={() => setDrawerTab("documents")}
              >
                Brochures & Specs ({formDocuments.length})
              </button>
            </div>

            <form onSubmit={handleSaveProduct} style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden" }}>
              <div className={styles.drawerBody}>
                {drawerTab === "details" && (
                  <>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>
                        Product Name <span className={styles.required}>*</span>
                      </label>
                      <input
                        type="text"
                        className={styles.input}
                        placeholder="e.g. Century Club Prime Plywood"
                        value={formName}
                        onChange={(e) => setFormName(e.target.value)}
                        required
                      />
                      <div className={styles.slugHint}>
                        URL Slug Preview: <span className={styles.slugHighlight}>/products/{generatedSlugPreview}</span>
                      </div>
                    </div>

                    <div className={styles.formRow}>
                      <div className={styles.formGroup}>
                        <label className={styles.label}>
                          Category <span className={styles.required}>*</span>
                        </label>
                        <select
                          className={styles.select}
                          value={formCategoryId}
                          onChange={(e) => setFormCategoryId(e.target.value)}
                          required
                        >
                          <option value="">Select Category</option>
                          {categories.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className={styles.formGroup}>
                        <label className={styles.label}>
                          Brand <span className={styles.required}>*</span>
                        </label>
                        <input
                          type="text"
                          className={styles.input}
                          placeholder="e.g. Century, Vanam, Sylvan"
                          value={formBrand}
                          onChange={(e) => setFormBrand(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div className={styles.formRow}>
                      <div className={styles.formGroup}>
                        <label className={styles.label}>Material</label>
                        <input
                          type="text"
                          className={styles.input}
                          placeholder="e.g. BWP Grade Marine Plywood"
                          value={formMaterial}
                          onChange={(e) => setFormMaterial(e.target.value)}
                        />
                      </div>

                      <div className={styles.formGroup}>
                        <label className={styles.label}>Finish</label>
                        <input
                          type="text"
                          className={styles.input}
                          placeholder="e.g. Matte, High Gloss, Textured"
                          value={formFinish}
                          onChange={(e) => setFormFinish(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className={styles.formRow}>
                      <div className={styles.formGroup}>
                        <label className={styles.label}>Badge</label>
                        <select
                          className={styles.select}
                          value={formBadge}
                          onChange={(e) => setFormBadge(e.target.value as (typeof BADGE_OPTIONS)[number])}
                        >
                          {BADGE_OPTIONS.map((b) => (
                            <option key={b} value={b}>
                              {b}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className={styles.formGroup}>
                        <label className={styles.label}>Status</label>
                        <select
                          className={styles.select}
                          value={formStatus}
                          onChange={(e) => setFormStatus(e.target.value as "Active" | "Inactive")}
                        >
                          <option value="Active">Active</option>
                          <option value="Inactive">Inactive</option>
                        </select>
                      </div>
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.label}>Description</label>
                      <textarea
                        className={styles.textarea}
                        placeholder="Detailed description of product features, specifications, and warranty..."
                        value={formDesc}
                        onChange={(e) => setFormDesc(e.target.value)}
                        rows={4}
                      />
                    </div>
                  </>
                )}

                {drawerTab === "images" && (
                  <>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>Upload Product Images</label>
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept="image/*"
                        multiple
                        style={{ display: "none" }}
                      />
                      <div className={styles.uploadBox} onClick={() => fileInputRef.current?.click()}>
                        <div className={styles.uploadIcon} style={{ display: "flex", justifyContent: "center" }}>
                          <UploadCloud size={32} color="#0f2b5c" />
                        </div>
                        <div className={styles.uploadTitle}>
                          {isUploading ? "Uploading images..." : "Click or drag to upload product images"}
                        </div>
                        <div className={styles.uploadSubtitle}>Supports PNG, JPG, WebP</div>
                      </div>
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.label}>Or Add Image URL</label>
                      <div style={{ display: "flex", gap: "0.5rem" }}>
                        <input
                          type="url"
                          className={styles.input}
                          placeholder="https://example.com/image.jpg"
                          value={formUrlInput}
                          onChange={(e) => setFormUrlInput(e.target.value)}
                        />
                        <button
                          type="button"
                          className={styles.cancelBtn}
                          onClick={handleAddUrlImage}
                          style={{ minHeight: "42px" }}
                        >
                          Add
                        </button>
                      </div>
                    </div>

                    {formImages.length > 0 && (
                      <div className={styles.imageGrid}>
                        {formImages.map((img, idx) => (
                          <div key={idx} className={styles.imageThumbWrap}>
                            <img src={img} alt={`Product ${idx}`} className={styles.imageThumb} />
                            <button
                              type="button"
                              className={styles.removeImgBtn}
                              onClick={() => handleRemoveImage(idx)}
                            >
                              <X size={12} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}

                {drawerTab === "documents" && (
                  <>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>Upload Brochures / Technical Data Sheets (PDF)</label>
                      <input
                        type="file"
                        ref={docInputRef}
                        onChange={handleDocFileChange}
                        accept=".pdf"
                        multiple
                        style={{ display: "none" }}
                      />
                      <div className={styles.uploadBox} onClick={() => docInputRef.current?.click()}>
                        <div className={styles.uploadIcon} style={{ display: "flex", justifyContent: "center" }}>
                          <FileText size={32} color="#0f2b5c" />
                        </div>
                        <div className={styles.uploadTitle}>
                          {isUploadingDoc ? "Uploading PDF document..." : "Click to upload product PDF documents"}
                        </div>
                        <div className={styles.uploadSubtitle}>PDF documents up to 10MB</div>
                      </div>
                    </div>

                    {formDocuments.length > 0 && (
                      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                        {formDocuments.map((doc: ProductDocument, idx: number) => (
                          <div
                            key={idx}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              padding: "0.625rem 0.875rem",
                              background: "#f8fafc",
                              borderRadius: "0.5rem",
                              border: "1px solid #e2e8f0",
                            }}
                          >











                            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                              <FileText size={16} color="#0f2b5c" />
                              <span style={{ fontSize: "0.875rem", fontWeight: 500, color: "#334155" }}>
                                {doc.name}
                              </span>
                            </div>
                            <button
                              type="button"
                              style={{ background: "none", border: "none", color: "#dc2626", cursor: "pointer" }}
                              onClick={() => handleRemoveDocument(idx)}
                            >
                              <X size={16} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>

              <div className={styles.drawerFooter}>
                <button
                  type="button"
                  className={styles.cancelBtn}
                  onClick={() => setIsDrawerOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className={styles.primaryBtn} disabled={isSaving}>
                  {isSaving ? "Saving..." : editingId ? "Update Product" : "Create Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── DELETE PRODUCT CONFIRMATION MODAL ────────────────────── */}
      {deletingProduct && (
        <div className={styles.catModalOverlay} onClick={() => setDeletingProduct(null)}>
          <div className={styles.catModalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.catModalHeader}>
              <h3 className={styles.catModalTitle}>Confirm Delete Product</h3>
              <button
                type="button"
                className={styles.closeBtn}
                onClick={() => setDeletingProduct(null)}
              >
                <X size={18} />
              </button>
            </div>
            <div className={styles.catModalBody}>
              <p style={{ color: "#334155", fontSize: "0.9375rem", margin: 0 }}>
                Are you sure you want to delete product <strong>"{deletingProduct.name}"</strong>?
              </p>
              <p style={{ color: "#64748b", fontSize: "0.8125rem", marginTop: "0.5rem", marginBottom: 0 }}>
                This action cannot be undone.
              </p>
            </div>
            <div className={styles.catModalFooter}>
              <button
                type="button"
                className={styles.cancelBtn}
                onClick={() => setDeletingProduct(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className={`${styles.catActionBtn} ${styles.catActionBtnDanger}`}
                style={{ minHeight: "44px", padding: "0.625rem 1.25rem", fontSize: "0.875rem" }}
                onClick={handleDeleteConfirm}
              >
                Delete Product
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
