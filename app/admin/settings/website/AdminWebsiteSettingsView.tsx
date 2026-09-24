"use client";

import { useState, useEffect, useRef } from "react";
import type { WebsiteSettings } from "@/lib/website-settings-store";
import { useWebsiteSettings } from "@/hooks/useWebsiteSettings";
import { Save, Building2, Phone, Search, Globe, CheckCircle2, UploadCloud, Sparkles } from "lucide-react";
import styles from "./website-settings.module.css";

export default function AdminWebsiteSettingsView() {
  const { settings: globalSettings, refetchSettings } = useWebsiteSettings();
  const [formState, setFormState] = useState<WebsiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [isUploadingHero, setIsUploadingHero] = useState(false);

  const logoInputRef = useRef<HTMLInputElement>(null);
  const heroInputRef = useRef<HTMLInputElement>(null);

  // Fetch settings from API on mount
  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/settings/website");
      const data = await res.json();
      if (data.success && data.settings) {
        setFormState(data.settings);
      }
    } catch (err) {
      console.error("Error loading website settings", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (globalSettings) {
      setFormState(globalSettings);
      setLoading(false);
    } else {
      fetchSettings();
    }
  }, [globalSettings]);

  const handleFileUpload = async (
    file: File,
    prefix: "logo-1" | "hero-1",
    onSuccess: (url: string) => void,
    setUploading: (val: boolean) => void
  ) => {
    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!validTypes.includes(file.type)) {
      alert("Invalid image type. Please select JPG, PNG, WebP, or GIF.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert("File size exceeds 5MB limit.");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("prefix", prefix);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.success && data.url) {
        onSuccess(data.url);
      } else {
        alert(data.error || "Upload failed");
      }
    } catch (err: any) {
      alert(err.message || "Error uploading file");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState) return;

    const bName = (formState.business_name || formState.name || "").trim();
    const ph = (formState.phone || formState.salesPhone || "").trim();
    const wa = (formState.whatsapp_number || formState.whatsappNumber || "").trim();

    if (!bName) {
      alert("Business Name is required.");
      return;
    }
    if (!ph) {
      alert("Phone Number is required.");
      return;
    }
    if (!wa) {
      alert("WhatsApp Number is required.");
      return;
    }

    setSaving(true);
    try {
      const payload: Partial<WebsiteSettings> = {
        ...formState,
        business_name: bName,
        name: bName,
        phone: ph,
        salesPhone: ph,
        whatsapp_number: wa,
        whatsappNumber: wa,
        logo_url: formState.logo_url || formState.logoUrl,
        logoUrl: formState.logo_url || formState.logoUrl,
        hero_title: formState.hero_title || formState.heroTitle,
        heroTitle: formState.hero_title || formState.heroTitle,
        hero_subtitle: formState.hero_subtitle || formState.heroSubtitle,
        heroSubtitle: formState.hero_subtitle || formState.heroSubtitle,
        hero_image_url: formState.hero_image_url || formState.heroImageUrl,
        heroImageUrl: formState.hero_image_url || formState.heroImageUrl,
        updated_at: new Date().toISOString(),
      };

      const res = await fetch("/api/settings/website", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        setFormState(data.settings);
        await refetchSettings();
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
      } else {
        alert(data.error || "Failed to save website settings");
      }
    } catch (err: any) {
      alert(err.message || "Error saving website settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading || !formState) {
    return (
      <div className={styles.container}>
        <div style={{ padding: "4rem", textAlign: "center", color: "#64748b" }}>
          Loading Website Settings...
        </div>
      </div>
    );
  }

  const currentBusinessName = formState.business_name || formState.name || "";
  const currentLogoUrl = formState.logo_url || formState.logoUrl || "";
  const currentPhone = formState.phone || formState.salesPhone || "";
  const currentWhatsapp = formState.whatsapp_number || formState.whatsappNumber || "";
  const currentHeroTitle = formState.hero_title || formState.heroTitle || "";
  const currentHeroSubtitle = formState.hero_subtitle || formState.heroSubtitle || "";
  const currentHeroImageUrl = formState.hero_image_url || formState.heroImageUrl || "";

  return (
    <div className={styles.container}>
      <form onSubmit={handleSave}>
        {/* ── HEADER ROW ────────────────────────────────────────────── */}
        <div className={styles.headerRow}>
          <div>
            <h1 className={styles.title}>Website &amp; Business Settings</h1>
            <p className={styles.subtitle}>
              Central control for business identity, logo, hero banner, contacts, and SEO metadata.
            </p>
          </div>
          <button
            type="submit"
            className={styles.saveBtn}
            disabled={saving || isUploadingLogo || isUploadingHero}
            id="save-website-settings-btn"
            style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem" }}
          >
            {saving ? "Saving..." : <><Save size={16} /> Save Settings</>}
          </button>
        </div>

        {/* ── CARD 1: BUSINESS IDENTITY & LOGO ─────────────────────── */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.cardTitleWrap}>
              <span className={styles.cardIcon} style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Building2 size={20} color="#1b4f8a" />
              </span>
              <div>
                <h3 className={styles.cardTitle}>Business Identity &amp; Logo</h3>
                <p className={styles.cardDesc}>Company name, logo image, address, and operating hours.</p>
              </div>
            </div>
          </div>

          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label className={styles.label}>
                Business Name <span className={styles.required}>*</span>
              </label>
              <input
                type="text"
                className={styles.input}
                value={currentBusinessName}
                onChange={(e) => setFormState({ ...formState, business_name: e.target.value, name: e.target.value })}
                required
                placeholder="e.g. VLR Traders"
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Eyebrow Tagline</label>
              <input
                type="text"
                className={styles.input}
                value={formState.tagline || ""}
                onChange={(e) => setFormState({ ...formState, tagline: e.target.value })}
                placeholder="e.g. Trusted Interior Material Supplier"
              />
            </div>

            {/* Logo Upload Dropzone */}
            <div className={`${styles.formGroup} ${styles.fullWidth}`}>
              <label className={styles.label}>Business Logo Image</label>
              <input
                type="file"
                ref={logoInputRef}
                accept="image/*"
                style={{ display: "none" }}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    handleFileUpload(
                      file,
                      "logo-1",
                      (url) => setFormState({ ...formState, logo_url: url, logoUrl: url }),
                      setIsUploadingLogo
                    );
                  }
                }}
              />

              <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                <div
                  className={styles.uploadBox}
                  onClick={() => logoInputRef.current?.click()}
                  style={{ flex: 1, padding: "1rem", cursor: "pointer", border: "1px dashed #cbd5e1", borderRadius: "0.5rem", background: "#f8fafc", textAlign: "center" }}
                >
                  <UploadCloud size={24} color="#1b4f8a" style={{ margin: "0 auto 0.25rem" }} />
                  <span style={{ fontSize: "0.8125rem", fontWeight: 600, color: "#334155", display: "block" }}>
                    {isUploadingLogo ? "Uploading Logo (logo-1)..." : "Click to upload brand logo"}
                  </span>
                  <span style={{ fontSize: "0.75rem", color: "#64748b" }}>PNG, JPG, WebP (Max 5MB)</span>
                </div>

                {currentLogoUrl && (
                  <div style={{ textAlign: "center" }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={currentLogoUrl}
                      alt="Logo Preview"
                      style={{ height: "50px", objectFit: "contain", borderRadius: "0.375rem", border: "1px solid #e2e8f0", padding: "4px", background: "#fff" }}
                    />
                    <span style={{ display: "block", fontSize: "0.75rem", color: "#16a34a", fontWeight: 600, marginTop: "4px" }}>
                      ✓ Logo Active
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className={`${styles.formGroup} ${styles.fullWidth}`}>
              <label className={styles.label}>Full Showroom Address</label>
              <input
                type="text"
                className={styles.input}
                value={formState.address || ""}
                onChange={(e) => setFormState({ ...formState, address: e.target.value })}
                placeholder="Enter showroom address"
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Operating Hours</label>
              <input
                type="text"
                className={styles.input}
                value={formState.workingHours || ""}
                onChange={(e) => setFormState({ ...formState, workingHours: e.target.value })}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Short Subtitle / Tagline</label>
              <input
                type="text"
                className={styles.input}
                value={formState.shortTagline || ""}
                onChange={(e) => setFormState({ ...formState, shortTagline: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* ── CARD 2: HOMEPAGE HERO BANNER CONTENT ───────────────── */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.cardTitleWrap}>
              <span className={styles.cardIcon} style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Sparkles size={20} color="#7c3aed" />
              </span>
              <div>
                <h3 className={styles.cardTitle}>Homepage Hero Banner</h3>
                <p className={styles.cardDesc}>Control the main headline, subtitle, and background photo rendered on the website homepage.</p>
              </div>
            </div>
          </div>

          <div className={styles.formGrid}>
            <div className={`${styles.formGroup} ${styles.fullWidth}`}>
              <label className={styles.label}>Hero Title</label>
              <input
                type="text"
                className={styles.input}
                value={currentHeroTitle}
                onChange={(e) => setFormState({ ...formState, hero_title: e.target.value, heroTitle: e.target.value })}
                placeholder="e.g. Premium Plywood, Hardware & Architectural Locks"
              />
            </div>

            <div className={`${styles.formGroup} ${styles.fullWidth}`}>
              <label className={styles.label}>Hero Subtitle</label>
              <textarea
                className={styles.textarea}
                value={currentHeroSubtitle}
                onChange={(e) => setFormState({ ...formState, hero_subtitle: e.target.value, heroSubtitle: e.target.value })}
                placeholder="Enter subtitle description for the main banner..."
              />
            </div>

            {/* Hero Background Image Upload */}
            <div className={`${styles.formGroup} ${styles.fullWidth}`}>
              <label className={styles.label}>Hero Background Image Upload</label>
              <input
                type="file"
                ref={heroInputRef}
                accept="image/*"
                style={{ display: "none" }}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    handleFileUpload(
                      file,
                      "hero-1",
                      (url) => setFormState({ ...formState, hero_image_url: url, heroImageUrl: url }),
                      setIsUploadingHero
                    );
                  }
                }}
              />

              <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                <div
                  className={styles.uploadBox}
                  onClick={() => heroInputRef.current?.click()}
                  style={{ flex: 1, padding: "1.25rem", cursor: "pointer", border: "1px dashed #cbd5e1", borderRadius: "0.5rem", background: "#f8fafc", textAlign: "center" }}
                >
                  <UploadCloud size={28} color="#7c3aed" style={{ margin: "0 auto 0.25rem" }} />
                  <span style={{ fontSize: "0.8125rem", fontWeight: 600, color: "#334155", display: "block" }}>
                    {isUploadingHero ? "Uploading Banner Photo (hero-1)..." : "Click to upload hero background image"}
                  </span>
                  <span style={{ fontSize: "0.75rem", color: "#64748b" }}>High-resolution PNG, JPG, WebP (Max 5MB)</span>
                </div>

                {currentHeroImageUrl && (
                  <div style={{ textAlign: "center" }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={currentHeroImageUrl}
                      alt="Hero Preview"
                      style={{ width: "100px", height: "65px", objectFit: "cover", borderRadius: "0.375rem", border: "1px solid #e2e8f0" }}
                    />
                    <span style={{ display: "block", fontSize: "0.75rem", color: "#16a34a", fontWeight: 600, marginTop: "4px" }}>
                      ✓ Hero Image Active
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── CARD 3: CONTACT CHANNELS & SOCIAL PROFILES ────────────── */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.cardTitleWrap}>
              <span className={styles.cardIcon} style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Phone size={20} color="#0d9488" />
              </span>
              <div>
                <h3 className={styles.cardTitle}>Contact Channels &amp; WhatsApp</h3>
                <p className={styles.cardDesc}>Updates header call numbers, direct WhatsApp button, and social profiles.</p>
              </div>
            </div>
          </div>

          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label className={styles.label}>
                Phone Number <span className={styles.required}>*</span>
              </label>
              <input
                type="text"
                className={styles.input}
                value={currentPhone}
                onChange={(e) => setFormState({ ...formState, phone: e.target.value, salesPhone: e.target.value })}
                required
                placeholder="e.g. +91 99128 21118"
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>
                WhatsApp Number <span className={styles.required}>*</span>
              </label>
              <input
                type="text"
                className={styles.input}
                value={currentWhatsapp}
                onChange={(e) => setFormState({ ...formState, whatsapp_number: e.target.value, whatsappNumber: e.target.value })}
                required
                placeholder="e.g. 919912821118"
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Support Phone Number</label>
              <input
                type="text"
                className={styles.input}
                value={formState.supportPhone || ""}
                onChange={(e) => setFormState({ ...formState, supportPhone: e.target.value })}
                placeholder="e.g. +91 96185 60405"
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Business Email Address</label>
              <input
                type="email"
                className={styles.input}
                value={formState.email || ""}
                onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                placeholder="e.g. vlrtraderscbe@gmail.com"
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Instagram Profile URL</label>
              <input
                type="url"
                className={styles.input}
                value={formState.instagram || ""}
                onChange={(e) => setFormState({ ...formState, instagram: e.target.value })}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>LinkedIn Profile URL</label>
              <input
                type="url"
                className={styles.input}
                value={formState.linkedin || ""}
                onChange={(e) => setFormState({ ...formState, linkedin: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* ── CARD 4: SEO METADATA & GOOGLE SEARCH PREVIEW ─────────── */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.cardTitleWrap}>
              <span className={styles.cardIcon} style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Search size={20} color="#1b4f8a" />
              </span>
              <div>
                <h3 className={styles.cardTitle}>SEO Metadata &amp; Search Snippet</h3>
                <p className={styles.cardDesc}>Control how your website appears on Google Search and social sharing.</p>
              </div>
            </div>
          </div>

          <div className={styles.formGrid}>
            <div className={`${styles.formGroup} ${styles.fullWidth}`}>
              <label className={styles.label}>
                Default Page Title (SEO) <span className={styles.required}>*</span>
              </label>
              <input
                type="text"
                className={styles.input}
                value={formState.seoTitle || ""}
                onChange={(e) => setFormState({ ...formState, seoTitle: e.target.value })}
                required
              />
            </div>

            <div className={`${styles.formGroup} ${styles.fullWidth}`}>
              <label className={styles.label}>Meta Description (SEO)</label>
              <textarea
                className={styles.textarea}
                value={formState.seoDescription || ""}
                onChange={(e) => setFormState({ ...formState, seoDescription: e.target.value })}
              />
              <span className={styles.hintText}>
                Recommended length: 140–160 characters ({(formState.seoDescription || "").length} chars)
              </span>
            </div>

            <div className={`${styles.formGroup} ${styles.fullWidth}`}>
              <label className={styles.label}>Keywords (comma separated)</label>
              <input
                type="text"
                className={styles.input}
                value={formState.seoKeywords || ""}
                onChange={(e) => setFormState({ ...formState, seoKeywords: e.target.value })}
              />
            </div>
          </div>

          {/* Live Google Search Snippet Preview */}
          <div style={{ marginTop: "1.5rem" }}>
            <span className={styles.label}>Live Google Search Result Preview</span>
            <div className={styles.googlePreviewCard}>
              <div className={styles.googlePreviewHeader}>
                <span style={{ display: "inline-flex", alignItems: "center" }}>
                  <Globe size={16} color="#64748b" />
                </span>
                <span className={styles.googleBreadcrumb}>
                  https://vlrtraders.com
                </span>
              </div>
              <h3 className={styles.googleTitle}>{formState.seoTitle}</h3>
              <p className={styles.googleDesc}>{formState.seoDescription}</p>
            </div>
          </div>
        </div>
      </form>

      {/* Toast Notification */}
      {showToast && (
        <div className={styles.toast} style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem" }}>
          <CheckCircle2 size={18} /> Website Settings Saved Successfully!
        </div>
      )}
    </div>
  );
}
