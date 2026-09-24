"use client";

import { useState, useEffect, useMemo } from "react";
import { getWhatsAppUrl, buildWhatsAppMessage } from "@/lib/whatsapp";
import type { EnquiriesSettings } from "@/lib/settings-store";
import { Save, MessageSquare, Pencil, Sliders, CheckCircle2, CheckCheck } from "lucide-react";
import styles from "./enquiries-settings.module.css";

export default function AdminEnquiriesSettingsView() {
  const [settings, setSettings] = useState<EnquiriesSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showToast, setShowToast] = useState(false);

  // Fetch settings from API on mount
  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/settings/enquiries");
      const data = await res.json();
      if (data.success && data.settings) {
        setSettings(data.settings);
      }
    } catch (err) {
      console.error("Error loading settings", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;

    if (!settings.whatsappNumber.trim()) {
      alert("Please enter WhatsApp number");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/settings/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      if (data.success) {
        setSettings(data.settings);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
      } else {
        alert(data.error || "Failed to save settings");
      }
    } catch (err: any) {
      alert(err.message || "Error saving settings");
    } finally {
      setSaving(false);
    }
  };

  // Append variable to template
  const handleInsertVariable = (field: "defaultMessageTemplate" | "productMessageTemplate", variable: string) => {
    if (!settings) return;
    setSettings((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        [field]: prev[field] + " " + variable,
      };
    });
  };

  // Live preview message computation
  const previewSampleMessage = useMemo(() => {
    if (!settings) return "";
    return buildWhatsAppMessage({
      product: "Modern Modular Kitchen",
      message: "Need quote for 3BHK duplex flat in Jubilee Hills",
      name: "Rajesh Kumar",
      phone: "+91 98765 43210",
      defaultTemplate: settings.defaultMessageTemplate,
      productTemplate: settings.productMessageTemplate,
    });
  }, [settings]);

  if (loading || !settings) {
    return (
      <div className={styles.container}>
        <div style={{ padding: "4rem", textAlign: "center", color: "#64748b" }}>
          Loading Enquiries Settings...
        </div>
      </div>
    );
  }

  const testWaUrl = getWhatsAppUrl(
    {
      product: "Modern Modular Kitchen",
      message: "Testing Enquiries Settings from Admin Panel",
    },
    settings.whatsappNumber
  );

  return (
    <div className={styles.container}>
      <form onSubmit={handleSave}>
        {/* ── HEADER ROW ────────────────────────────────────────────── */}
        <div className={styles.headerRow}>
          <div>
            <h1 className={styles.title}>Enquiries & WhatsApp Settings</h1>
            <p className={styles.subtitle}>
              Central control for lead flow, WhatsApp destination number, and dynamic prefilled templates.
            </p>
          </div>
          <button
            type="submit"
            className={styles.saveBtn}
            disabled={saving}
            id="save-settings-btn"
            style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem" }}
          >
            {saving ? "Saving..." : <><Save size={16} /> Save Settings</>}
          </button>
        </div>

        {/* ── CARD 1: WHATSAPP CONTACT & RECIPIENTS ─────────────────── */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.cardTitleWrap}>
              <span className={styles.cardIcon} style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                <MessageSquare size={20} color="#0d9488" />
              </span>
              <div>
                <h3 className={styles.cardTitle}>WhatsApp Destination &amp; Contact Info</h3>
                <p className={styles.cardDesc}>Configure primary &amp; secondary numbers where enquiries are routed.</p>
              </div>
            </div>

            <a
              href={testWaUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.varPill}
              style={{ padding: "0.4rem 0.875rem", fontSize: "0.8125rem" }}
            >
              Test WhatsApp Routing
            </a>
          </div>

          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label className={styles.label}>
                Primary WhatsApp Number <span className={styles.required}>*</span>
              </label>
              <input
                type="text"
                className={styles.input}
                value={settings.whatsappNumber}
                onChange={(e) =>
                  setSettings({ ...settings, whatsappNumber: e.target.value })
                }
                required
              />
              <span className={styles.hintText}>E.164 international format (e.g. +91 9876543210)</span>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Display Number Format</label>
              <input
                type="text"
                className={styles.input}
                value={settings.whatsappDisplay}
                onChange={(e) =>
                  setSettings({ ...settings, whatsappDisplay: e.target.value })
                }
              />
              <span className={styles.hintText}>Formatted string shown in UI buttons</span>
            </div>
          </div>
        </div>

        {/* ── CARD 2: DYNAMIC MESSAGE TEMPLATES ────────────────────── */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.cardTitleWrap}>
              <span className={styles.cardIcon} style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Pencil size={20} color="#1b4f8a" />
              </span>
              <div>
                <h3 className={styles.cardTitle}>Dynamic WhatsApp Prefilled Templates</h3>
                <p className={styles.cardDesc}>
                  Customize the pre-written text user sees when opening WhatsApp from any CTA button.
                </p>
              </div>
            </div>
          </div>

          <div className={styles.formGrid}>
            {/* Product Specific Template */}
            <div className={`${styles.formGroup} ${styles.fullWidth}`}>
              <label className={styles.label}>
                <span>Product Enquiry Template</span>
                <span className={styles.hintText}>Used on Product Detail &amp; Catalog Card buttons</span>
              </label>
              <textarea
                className={styles.textarea}
                value={settings.productMessageTemplate}
                onChange={(e) =>
                  setSettings({ ...settings, productMessageTemplate: e.target.value })
                }
              />
              <div className={styles.variableRow}>
                <span className={styles.varLabel}>Insert Variable:</span>
                <button
                  type="button"
                  className={styles.varPill}
                  onClick={() =>
                    handleInsertVariable("productMessageTemplate", "[Product Name]")
                  }
                >
                  + [Product Name]
                </button>
                <button
                  type="button"
                  className={styles.varPill}
                  onClick={() =>
                    handleInsertVariable("productMessageTemplate", "[Category]")
                  }
                >
                  + [Category]
                </button>
              </div>
            </div>

            {/* Default Homepage/General Template */}
            <div className={`${styles.formGroup} ${styles.fullWidth}`}>
              <label className={styles.label}>
                <span>Default General Template</span>
                <span className={styles.hintText}>Used on Homepage Hero &amp; Floating FAB</span>
              </label>
              <textarea
                className={styles.textarea}
                value={settings.defaultMessageTemplate}
                onChange={(e) =>
                  setSettings({ ...settings, defaultMessageTemplate: e.target.value })
                }
              />
            </div>
          </div>

          {/* Chat Bubble Live Preview Card */}
          <div className={styles.chatPreviewBox}>
            <div className={styles.chatPreviewHeader}>
              <div className={styles.waIconCircle} style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                <MessageSquare size={16} color="#0d9488" />
              </div>
              <div>
                <span className={styles.previewTitle}>Live WhatsApp Message Preview</span>
                <span className={styles.previewSubtitle} style={{ display: "block" }}>
                  Destination: {settings.whatsappDisplay || settings.whatsappNumber}
                </span>
              </div>
            </div>

            <div className={styles.chatBubble}>
              {previewSampleMessage}
              <div className={styles.chatTime} style={{ display: "inline-flex", alignItems: "center", gap: "0.2rem" }}>
                14:55 <CheckCheck size={14} color="#0d9488" />
              </div>
            </div>
          </div>
        </div>

        {/* ── CARD 3: LEAD CAPTURE & FORM BEHAVIOR ────────────────── */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.cardTitleWrap}>
              <span className={styles.cardIcon} style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Sliders size={20} color="#1b4f8a" />
              </span>
              <div>
                <h3 className={styles.cardTitle}>Lead Capture &amp; Form Behavior</h3>
                <p className={styles.cardDesc}>
                  Configure automated redirects, database storage, and input rules.
                </p>
              </div>
            </div>
          </div>

          <div className={styles.toggleRow}>
            <div className={styles.toggleTextGroup}>
              <span className={styles.toggleTitle}>Auto-Redirect to WhatsApp on Submit</span>
              <span className={styles.toggleSub}>
                Automatically opens WhatsApp deep link after visitor submits quote form.
              </span>
            </div>
            <label className={styles.switch}>
              <input
                type="checkbox"
                checked={settings.autoRedirectToWhatsApp}
                onChange={(e) =>
                  setSettings({ ...settings, autoRedirectToWhatsApp: e.target.checked })
                }
              />
              <span className={styles.slider} />
            </label>
          </div>

          <div className={styles.toggleRow}>
            <div className={styles.toggleTextGroup}>
              <span className={styles.toggleTitle}>Save Leads to Mini CRM Database</span>
              <span className={styles.toggleSub}>
                Stores every submitted enquiry in Admin Leads table for follow-up.
              </span>
            </div>
            <label className={styles.switch}>
              <input
                type="checkbox"
                checked={settings.saveLeadsToDatabase}
                onChange={(e) =>
                  setSettings({ ...settings, saveLeadsToDatabase: e.target.checked })
                }
              />
              <span className={styles.slider} />
            </label>
          </div>

          <div className={styles.toggleRow}>
            <div className={styles.toggleTextGroup}>
              <span className={styles.toggleTitle}>Mandatory Phone Number</span>
              <span className={styles.toggleSub}>
                Requires visitor to enter valid phone number before submitting form.
              </span>
            </div>
            <label className={styles.switch}>
              <input
                type="checkbox"
                checked={settings.requirePhone}
                onChange={(e) =>
                  setSettings({ ...settings, requirePhone: e.target.checked })
                }
              />
              <span className={styles.slider} />
            </label>
          </div>

          <div className={styles.formGroup} style={{ marginTop: "1.25rem" }}>
            <label className={styles.label}>Custom Success Message</label>
            <textarea
              className={styles.textarea}
              style={{ minHeight: "70px" }}
              value={settings.successMessageText}
              onChange={(e) =>
                setSettings({ ...settings, successMessageText: e.target.value })
              }
            />
            <span className={styles.hintText}>
              Displayed on green success banner after form submission.
            </span>
          </div>
        </div>
      </form>

      {/* Toast Notification */}
      {showToast && (
        <div className={styles.toast} style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem" }}>
          <CheckCircle2 size={18} /> Enquiries Settings Saved Successfully!
        </div>
      )}
    </div>
  );
}
