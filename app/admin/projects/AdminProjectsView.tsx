"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { FolderKanban, ChefHat, Star, Ruler, Search, Camera, MapPin, Pencil, Trash2, Plus, X, UploadCloud } from "lucide-react";
import { generateSlug } from "@/lib/slug";
import type { Project } from "@/lib/projects-store";
import styles from "./projects-management.module.css";

const CATEGORY_OPTIONS = [
  "Modular Kitchens",
  "Wardrobes",
  "Interior Panels",
  "Full Interior",
  "Commercial",
];

export default function AdminProjectsView() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Search
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form Fields
  const [formTitle, setFormTitle] = useState("");
  const [formCategory, setFormCategory] = useState(CATEGORY_OPTIONS[0]);
  const [formLocation, setFormLocation] = useState("");
  const [formClient, setFormClient] = useState("");
  const [formArea, setFormArea] = useState("");
  const [formCompletionDate, setFormCompletionDate] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formImages, setFormImages] = useState<string[]>([]);
  const [formUrlInput, setFormUrlInput] = useState("");
  const [formFeatured, setFormFeatured] = useState(true);
  const [formStatus, setFormStatus] = useState<"Completed" | "In Progress">("Completed");
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Delete modal state
  const [deletingProject, setDeletingProject] = useState<Project | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch projects from API
  const fetchProjects = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/projects");
      const data = await res.json();
      if (data.success) {
        setProjects(data.projects || []);
      } else {
        setError(data.error || "Failed to load projects");
      }
    } catch (err: any) {
      setError(err.message || "Network error loading projects");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  // Filtered & Sorted Projects
  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      // Search filter
      if (search.trim()) {
        const q = search.toLowerCase().trim();
        const matchTitle = p.title.toLowerCase().includes(q);
        const matchLoc = p.location.toLowerCase().includes(q);
        const matchCat = p.category.toLowerCase().includes(q);
        const matchDesc = (p.description || "").toLowerCase().includes(q);
        if (!matchTitle && !matchLoc && !matchCat && !matchDesc) return false;
      }

      // Category filter
      if (selectedCategory !== "all" && p.category !== selectedCategory) {
        return false;
      }

      return true;
    });
  }, [projects, search, selectedCategory]);

  // Metric stats
  const totalProjects = projects.length;
  const kitchenProjects = projects.filter((p) => p.category === "Modular Kitchens").length;
  const featuredProjects = projects.filter((p) => p.featured).length;

  // Open Modal for Create
  const handleOpenAdd = () => {
    setEditingId(null);
    setFormTitle("");
    setFormCategory(CATEGORY_OPTIONS[0]);
    setFormLocation("");
    setFormClient("");
    setFormArea("");
    setFormCompletionDate("");
    setFormDesc("");
    setFormImages([
      "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1000&q=85",
    ]);
    setFormFeatured(true);
    setFormStatus("Completed");
    setIsModalOpen(true);
  };

  // Open Modal for Edit
  const handleOpenEdit = (p: Project) => {
    setEditingId(p.id);
    setFormTitle(p.title);
    setFormCategory(p.category);
    setFormLocation(p.location);
    setFormClient(p.client || "");
    setFormArea(p.area || "");
    setFormCompletionDate(p.completionDate || "");
    setFormDesc(p.description || "");
    setFormImages(p.images && p.images.length > 0 ? [...p.images] : []);
    setFormFeatured(p.featured ?? true);
    setFormStatus(p.status || "Completed");
    setIsModalOpen(true);
  };

  // Save Project (Create or Edit)
  const handleSaveProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      alert("Please enter project title");
      return;
    }
    if (!formLocation.trim()) {
      alert("Please enter project location");
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        title: formTitle.trim(),
        category: formCategory,
        location: formLocation.trim(),
        client: formClient.trim(),
        area: formArea.trim(),
        completionDate: formCompletionDate.trim(),
        description: formDesc.trim(),
        images: formImages.length > 0 ? formImages : ["/hero_kitchen.jpg"],
        featured: formFeatured,
        status: formStatus,
      };

      if (editingId) {
        const res = await fetch(`/api/projects/${editingId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (data.success) {
          setIsModalOpen(false);
          fetchProjects();
        } else {
          alert(data.error || "Failed to update project");
        }
      } else {
        const res = await fetch("/api/projects", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (data.success) {
          setIsModalOpen(false);
          fetchProjects();
        } else {
          alert(data.error || "Failed to create project");
        }
      }
    } catch (err: any) {
      alert(err.message || "Error saving project");
    } finally {
      setIsSaving(false);
    }
  };

  // Confirm Delete
  const handleDeleteConfirm = async () => {
    if (!deletingProject) return;
    try {
      const res = await fetch(`/api/projects/${deletingProject.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        setDeletingProject(null);
        fetchProjects();
      } else {
        alert(data.error || "Failed to delete project");
      }
    } catch (err: any) {
      alert(err.message || "Error deleting project");
    }
  };

  // Multiple File Image Upload
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
        console.error("Failed to upload project image", err);
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

  // Remove thumbnail
  const handleRemoveImage = (index: number) => {
    setFormImages((prev) => prev.filter((_, i) => i !== index));
  };

  const generatedSlugPreview = useMemo(() => {
    return formTitle.trim() ? generateSlug(formTitle) : "project-slug";
  }, [formTitle]);

  return (
    <div className={styles.container}>
      {/* ── HEADER ROW ────────────────────────────────────────────── */}
      <div className={styles.headerRow}>
        <div>
          <h1 className={styles.title}>Projects Portfolio Management</h1>
          <p className={styles.subtitle}>
            Showcase completed installations, client work, and interior design projects.
          </p>
        </div>
        <button
          type="button"
          className={styles.addBtn}
          onClick={handleOpenAdd}
          style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem" }}
        >
          <Plus size={16} /> Add New Project
        </button>
      </div>

      {/* ── METRIC STATS CARDS ────────────────────────────────────── */}
      <div className={styles.statsGrid}>
        {/* Total Projects */}
        <div className={styles.statCard}>
          <div className={`${styles.statIconBox} ${styles.iconBlue}`}>
            <FolderKanban size={20} color="#1b4f8a" />
          </div>
          <div className={styles.statContent}>
            <span className={styles.statLabel}>Total Completed Projects</span>
            <span className={styles.statValue}>{totalProjects}</span>
          </div>
        </div>

        {/* Modular Kitchens */}
        <div className={styles.statCard}>
          <div className={`${styles.statIconBox} ${styles.iconGreen}`}>
            <ChefHat size={20} color="#0d9488" />
          </div>
          <div className={styles.statContent}>
            <span className={styles.statLabel}>Modular Kitchens</span>
            <span className={styles.statValue}>{kitchenProjects}</span>
          </div>
        </div>

        {/* Featured Projects */}
        <div className={styles.statCard}>
          <div className={`${styles.statIconBox} ${styles.iconPurple}`}>
            <Star size={20} color="#8b5cf6" />
          </div>
          <div className={styles.statContent}>
            <span className={styles.statLabel}>Featured Showcase</span>
            <span className={styles.statValue}>{featuredProjects}</span>
          </div>
        </div>

        {/* Total Installed Area */}
        <div className={styles.statCard}>
          <div className={`${styles.statIconBox} ${styles.iconOrange}`}>
            <Ruler size={20} color="#f97316" />
          </div>
          <div className={styles.statContent}>
            <span className={styles.statLabel}>Total Installed Area</span>
            <span className={styles.statValue}>14,500 sq.ft</span>
          </div>
        </div>
      </div>

      {/* ── SEARCH & FILTERS TOOLBAR ─────────────────────────────── */}
      <div className={styles.toolbarCard}>
        <div className={styles.toolbarLeft}>
          <div className={styles.searchInputWrap}>
            <span className={styles.searchIcon} style={{ display: "inline-flex", alignItems: "center" }}>
              <Search size={16} color="#64748b" />
            </span>
            <input
              type="text"
              className={styles.searchInput}
              placeholder="Search projects by title, location, or scope..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              id="projects-search-input"
            />
          </div>

          <select
            className={styles.filterSelect}
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="all">All Categories</option>
            {CATEGORY_OPTIONS.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ── PROJECTS GRID ────────────────────────────────────────── */}
      {loading ? (
        <div style={{ padding: "4rem", textAlign: "center", color: "#64748b" }}>
          Loading projects portfolio...
        </div>
      ) : filteredProjects.length === 0 ? (
        <div
          style={{
            padding: "4rem 2rem",
            textAlign: "center",
            background: "#ffffff",
            borderRadius: "0.875rem",
            border: "1px dashed #cbd5e1",
          }}
        >
          <div style={{ display: "flex", justifyContent: "center", marginBottom: "1rem" }}>
            <FolderKanban size={44} color="#64748b" />
          </div>
          <h3 style={{ fontSize: "1.125rem", fontWeight: 700, color: "#0f172a" }}>
            No projects added yet
          </h3>
          <p style={{ fontSize: "0.875rem", color: "#64748b", marginBottom: "1.5rem" }}>
            Add your completed client projects to showcase real installations.
          </p>
          <button
            type="button"
            className={styles.primaryBtn}
            onClick={handleOpenAdd}
            style={{ margin: "0 auto" }}
          >
            + Add New Project
          </button>
        </div>
      ) : (
        <div className={styles.projectsGrid}>
          {filteredProjects.map((p) => {
            const coverImg = p.images && p.images.length > 0 ? p.images[0] : "/hero_kitchen.jpg";
            const imgCount = p.images ? p.images.length : 0;

            return (
              <div key={p.id} className={styles.projectCard}>
                <div className={styles.cardImageWrap}>
                  <img
                    src={coverImg}
                    alt={p.title}
                    className={styles.cardImg}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/hero_kitchen.jpg";
                    }}
                  />
                  <span className={styles.imageBadge} style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem" }}>
                    <Camera size={12} /> {imgCount} Photos
                  </span>
                  <span className={styles.catBadge}>{p.category}</span>
                </div>

                <div className={styles.cardContent}>
                  <h3 className={styles.projectTitle}>{p.title}</h3>
                  <div className={styles.locationRow}>
                    <MapPin size={14} color="#0d9488" />
                    <span>{p.location}</span>
                  </div>
                  <p className={styles.descText}>{p.description}</p>

                  <div className={styles.metaRow}>
                    <span className={styles.metaChip}>{p.client || "Residence"}</span>
                    {p.area && <span className={styles.metaChip}>{p.area}</span>}
                    {p.completionDate && (
                      <span className={styles.metaChip}>{p.completionDate}</span>
                    )}
                  </div>
                </div>

                <div className={styles.cardFooter}>
                  <button
                    type="button"
                    className={styles.editBtn}
                    onClick={() => handleOpenEdit(p)}
                    style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem" }}
                  >
                    <Pencil size={14} /> Edit
                  </button>
                  <button
                    type="button"
                    className={styles.deleteBtn}
                    onClick={() => setDeletingProject(p)}
                    style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem" }}
                  >
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── ADD / EDIT PROJECT CENTERED MODAL DIALOG ──────────── */}
      {isModalOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsModalOpen(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>
                {editingId ? "Edit Project" : "Add New Project"}
              </h3>
              <button
                type="button"
                className={styles.closeBtn}
                onClick={() => setIsModalOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveProject} style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden" }}>
              <div className={styles.modalBody}>
                {/* Title */}
                <div className={styles.formGroup}>
                  <label className={styles.label}>
                    Project Title <span className={styles.required}>*</span>
                  </label>
                  <input
                    type="text"
                    className={styles.input}
                    placeholder="e.g. Luxury Villa Modular Kitchen"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    required
                  />
                  <span className={styles.slugHint}>
                    Slug: <span className={styles.slugHighlight}>/projects/{generatedSlugPreview}</span>
                  </span>
                </div>

                {/* Category & Location */}
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>
                      Category <span className={styles.required}>*</span>
                    </label>
                    <select
                      className={styles.select}
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value)}
                    >
                      {CATEGORY_OPTIONS.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label}>
                      Location <span className={styles.required}>*</span>
                    </label>
                    <input
                      type="text"
                      className={styles.input}
                      placeholder="e.g. Jubilee Hills, Hyderabad"
                      value={formLocation}
                      onChange={(e) => setFormLocation(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* Client / Area / Completion */}
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Client / Scope</label>
                    <input
                      type="text"
                      className={styles.input}
                      placeholder="e.g. Private Villa / 3BHK Residence"
                      value={formClient}
                      onChange={(e) => setFormClient(e.target.value)}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label}>Area (sq.ft)</label>
                    <input
                      type="text"
                      className={styles.input}
                      placeholder="e.g. 450 sq.ft"
                      value={formArea}
                      onChange={(e) => setFormArea(e.target.value)}
                    />
                  </div>
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Completion Date</label>
                    <input
                      type="text"
                      className={styles.input}
                      placeholder="e.g. August 2026"
                      value={formCompletionDate}
                      onChange={(e) => setFormCompletionDate(e.target.value)}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label}>Status</label>
                    <select
                      className={styles.select}
                      value={formStatus}
                      onChange={(e) => setFormStatus(e.target.value as any)}
                    >
                      <option value="Completed">Completed</option>
                      <option value="In Progress">In Progress</option>
                    </select>
                  </div>
                </div>

                {/* Description */}
                <div className={styles.formGroup}>
                  <label className={styles.label}>Project Description</label>
                  <textarea
                    className={styles.textarea}
                    placeholder="Describe project details, scope of work, materials used, etc."
                    value={formDesc}
                    onChange={(e) => setFormDesc(e.target.value)}
                  />
                </div>

                {/* Multiple Images Upload */}
                <div className={styles.formGroup}>
                  <label className={styles.label}>
                    Upload Project Images <span className={styles.required}>*</span>
                  </label>

                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    multiple
                    style={{ display: "none" }}
                  />

                  <div
                    className={styles.uploadBox}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <div className={styles.uploadIcon} style={{ display: "flex", justifyContent: "center" }}>
                      <UploadCloud size={32} color="#0d9488" />
                    </div>
                    <div className={styles.uploadTitle}>
                      {isUploading ? "Uploading photos..." : "Click to upload multiple project images"}
                    </div>
                    <div className={styles.uploadSubtitle}>
                      PNG, JPG, WebP (Upload multiple photos of completed site)
                    </div>
                  </div>
                </div>

                {/* Image URL fallback */}
                <div className={styles.formGroup}>
                  <label className={styles.label}>Or add image URL</label>
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <input
                      type="url"
                      className={styles.input}
                      placeholder="https://images.unsplash.com/..."
                      value={formUrlInput}
                      onChange={(e) => setFormUrlInput(e.target.value)}
                    />
                    <button
                      type="button"
                      className={styles.cancelBtn}
                      onClick={handleAddUrlImage}
                    >
                      Add URL
                    </button>
                  </div>
                </div>

                {/* Thumbnails grid */}
                {formImages.length > 0 && (
                  <div className={styles.imageGrid}>
                    {formImages.map((imgUrl, idx) => (
                      <div key={idx} className={styles.imageThumbWrap}>
                        <img
                          src={imgUrl}
                          alt={`Project photo ${idx + 1}`}
                          className={styles.imageThumb}
                        />
                        <button
                          type="button"
                          className={styles.removeImgBtn}
                          onClick={() => handleRemoveImage(idx)}
                          title="Remove photo"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className={styles.modalFooter}>
                <button
                  type="button"
                  className={styles.cancelBtn}
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={styles.primaryBtn}
                  disabled={isSaving}
                >
                  {isSaving ? "Saving..." : "Save Project"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── DELETE CONFIRMATION MODAL ───────────────────────────── */}
      {deletingProject && (
        <div
          className={styles.modalOverlay}
          onClick={() => setDeletingProject(null)}
        >
          <div
            className={styles.modal}
            style={{
              maxWidth: "420px",
              height: "auto",
              padding: "1.5rem",
              borderRadius: "0.75rem",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className={styles.modalTitle} style={{ color: "#dc2626" }}>
              Delete Project?
            </h3>
            <p style={{ fontSize: "0.875rem", color: "#475569", margin: "0.5rem 0 1rem" }}>
              Are you sure you want to delete <strong>{deletingProject.title}</strong>? This action cannot be undone.
            </p>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem" }}>
              <button
                type="button"
                className={styles.cancelBtn}
                onClick={() => setDeletingProject(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className={styles.deleteBtn}
                onClick={handleDeleteConfirm}
                style={{ padding: "0.625rem 1.25rem" }}
              >
                Delete Project
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
