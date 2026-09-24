"use client";

import { useState, useEffect, useMemo } from "react";
import { Camera, MapPin, MessageSquare, Tag, Ruler, Calendar, FileText, X } from "lucide-react";
import type { Project } from "@/lib/projects-store";
import { getWhatsAppUrl } from "@/lib/whatsapp";
import ProductEnquiryModal from "@/components/enquiry/ProductEnquiryModal";
import MaskedHeading from "@/components/ui/MaskedHeading";
import styles from "./projects.module.css";

const CATEGORY_TABS = [
  "All Projects",
  "Modular Kitchens",
  "Wardrobes",
  "Interior Panels",
  "Full Interior",
  "Commercial",
];

interface ProjectsClientProps {
  initialProjects: Project[];
}

export default function ProjectsClient({ initialProjects }: ProjectsClientProps) {
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [selectedCategory, setSelectedCategory] = useState("All Projects");
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Quote modal state
  const [isEnquiryModalOpen, setIsEnquiryModalOpen] = useState(false);
  const [enquiryProductName, setEnquiryProductName] = useState("");

  // Sync with live API on mount
  useEffect(() => {
    fetch("/api/projects")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.projects) && data.projects.length > 0) {
          setProjects(data.projects);
        }
      })
      .catch(() => {});
  }, []);

  // Filtered projects
  const filteredProjects = useMemo(() => {
    if (selectedCategory === "All Projects") return projects;
    return projects.filter((p) => p.category === selectedCategory);
  }, [projects, selectedCategory]);

  const handleOpenLightbox = (p: Project) => {
    setActiveProject(p);
    setActiveImageIndex(0);
  };

  const handleOpenEnquiryForm = (p: Project) => {
    setEnquiryProductName(`Project: ${p.title} (${p.location})`);
    setIsEnquiryModalOpen(true);
  };

  return (
    <div className={styles.page}>
      {/* ── PAGE TITLE ─────────────────────────────────────────── */}
      <section className={styles.heroSection}>
        <div className={styles.heroContainer}>
          <span className={styles.heroTagline}>OUR INSTALLATIONS</span>
          <h1 className={styles.heroTitle}>Quality Built in Real Spaces</h1>
          <p className={styles.heroSubtext}>
            Explore our showcase of completed residential &amp; commercial installations across Hyderabad. Premium materials, flawless execution, and lasting durability.
          </p>

          <div className={styles.statsBar}>
            <div className={styles.statItem}>
              <span className={styles.statNumber}>150+</span>
              <span className={styles.statText}>Completed Projects</span>
            </div>
            <div style={{ width: 1, height: 24, background: "rgba(15,23,42,0.15)" }} />
            <div className={styles.statItem}>
              <span className={styles.statNumber}>50,000+</span>
              <span className={styles.statText}>Sq.Ft Installed</span>
            </div>
            <div style={{ width: 1, height: 24, background: "rgba(15,23,42,0.15)" }} />
            <div className={styles.statItem}>
              <span className={styles.statNumber}>100%</span>
              <span className={styles.statText}>On-Time Execution</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── MAIN CONTENT CONTAINER ────────────────────────────── */}
      <div className={styles.contentContainer}>
        {/* Category Filter Tabs */}
        <div className={styles.filterRow}>
          {CATEGORY_TABS.map((cat) => (
            <button
              key={cat}
              type="button"
              className={`${styles.filterBtn} ${
                selectedCategory === cat ? styles.filterBtnActive : ""
              }`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Projects Grid */}
        <div className={styles.grid}>
          {filteredProjects.map((p) => {
            const cover = p.images && p.images.length > 0 ? p.images[0] : "/hero_kitchen.jpg";
            const photoCount = p.images ? p.images.length : 0;
            const waUrl = getWhatsAppUrl({
              product: `Project: ${p.title}`,
              message: `Hi, I saw your completed project "${p.title}" in ${p.location} on your website and would like a quote for a similar project.`,
            });

            return (
              <div
                key={p.id}
                className={styles.card}
                onClick={() => handleOpenLightbox(p)}
              >
                <div className={styles.imageWrap}>
                  <img
                    src={cover}
                    alt={p.title}
                    className={styles.image}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/hero_kitchen.jpg";
                    }}
                  />
                  <div className={styles.imageScrim} aria-hidden="true" />
                  <div className={styles.imageTitleOverlay}>
                    <MaskedHeading
                      tag="h3"
                      text={p.title}
                      src={cover}
                      mediaType="image"
                      align="center"
                      textScale={0.11}
                      fillScale={1.3}
                      parallax={20}
                      drift={8}
                    />
                  </div>
                  <span className={styles.photoBadge} style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem" }}>
                    <Camera size={13} /> {photoCount} Photos
                  </span>
                  <span className={styles.catBadge}>{p.category}</span>
                </div>

                <div className={styles.cardBody}>
                  <h3 className={styles.cardTitle}>{p.title}</h3>
                  <div className={styles.locationRow}>
                    <MapPin size={15} color="#0d9488" />
                    <span>{p.location}</span>
                  </div>
                  <p className={styles.cardDesc}>{p.description}</p>

                  <div className={styles.tagsRow}>
                    <span className={styles.tagChip}>{p.client || "Residence"}</span>
                    {p.area && <span className={styles.tagChip}>{p.area}</span>}
                    {p.completionDate && (
                      <span className={styles.tagChip}>{p.completionDate}</span>
                    )}
                  </div>
                </div>

                <div className={styles.cardFooter} onClick={(e) => e.stopPropagation()}>
                  <a
                    href={waUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.waBtn}
                    style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}
                  >
                    <MessageSquare size={16} /> Enquire via WhatsApp
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── LIGHTBOX MODAL SHOWCASE ────────────────────────────── */}
      {activeProject && (
        <div className={styles.modalOverlay} onClick={() => setActiveProject(null)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            {/* Gallery Viewer Header */}
            <div className={styles.modalGallery}>
              <button
                type="button"
                className={styles.closeModalBtn}
                onClick={() => setActiveProject(null)}
              >
                <X size={20} />
              </button>

              <img
                src={
                  activeProject.images && activeProject.images.length > activeImageIndex
                    ? activeProject.images[activeImageIndex]
                    : "/hero_kitchen.jpg"
                }
                alt={activeProject.title}
                className={styles.mainImage}
              />

              {/* Thumbnails strip */}
              {activeProject.images && activeProject.images.length > 1 && (
                <div className={styles.thumbStrip}>
                  {activeProject.images.map((img, idx) => (
                    <div
                      key={idx}
                      className={`${styles.thumbDot} ${
                        idx === activeImageIndex ? styles.thumbDotActive : ""
                      }`}
                      onClick={() => setActiveImageIndex(idx)}
                    >
                      <img src={img} alt={`Thumb ${idx}`} className={styles.thumbImg} />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Content Details */}
            <div className={styles.modalContent}>
              <h2 className={styles.modalTitle}>{activeProject.title}</h2>
              <div className={styles.modalMeta}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem" }}>
                  <MapPin size={14} color="#0d9488" /> {activeProject.location}
                </span>
                <span style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem" }}>
                  <Tag size={14} color="#1b4f8a" /> {activeProject.category}
                </span>
                {activeProject.area && (
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem" }}>
                    <Ruler size={14} color="#0d9488" /> {activeProject.area}
                  </span>
                )}
                {activeProject.completionDate && (
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem" }}>
                    <Calendar size={14} color="#1b4f8a" /> Completed: {activeProject.completionDate}
                  </span>
                )}
              </div>

              <p className={styles.modalDesc}>{activeProject.description}</p>

              <div className={styles.modalActions}>
                <a
                  href={getWhatsAppUrl({
                    product: `Project: ${activeProject.title}`,
                    message: `Hi, I am interested in getting work done similar to "${activeProject.title}" in ${activeProject.location}. Please share pricing and details.`,
                  })}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.waBtn}
                  style={{ width: "auto", padding: "0.75rem 1.5rem", display: "inline-flex", alignItems: "center", gap: "0.5rem" }}
                >
                  <MessageSquare size={16} /> Chat on WhatsApp for Quote
                </a>

                <button
                  type="button"
                  className={styles.filterBtn}
                  onClick={() => {
                    const proj = activeProject;
                    setActiveProject(null);
                    handleOpenEnquiryForm(proj);
                  }}
                  style={{ padding: "0.75rem 1.5rem", display: "inline-flex", alignItems: "center", gap: "0.5rem" }}
                >
                  <FileText size={16} /> Send Formal Enquiry
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── PRODUCT ENQUIRY FORM POPUP ──────────────────────────── */}
      <ProductEnquiryModal
        isOpen={isEnquiryModalOpen}
        onClose={() => setIsEnquiryModalOpen(false)}
        productName={enquiryProductName}
        source="catalog"
      />
    </div>
  );
}
