"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Users, FileText, Phone, CheckCircle2, Calendar, Plus, Search, SlidersHorizontal, Download, MessageSquare, Trash2, Inbox, X } from "lucide-react";
import type { Lead, LeadStatus } from "@/types/enquiry";
import styles from "./leads-crm.module.css";

interface AdminLeadsViewProps {
  initialLeads: Lead[];
}

export default function AdminLeadsView({ initialLeads }: AdminLeadsViewProps) {
  const [leads, setLeads] = useState<Lead[]>(initialLeads);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"All" | "New" | "Contacted" | "Closed">("All");

  // Selected lead for detail popup modal
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  // Manual Lead Entry Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newLeadName, setNewLeadName] = useState("");
  const [newLeadPhone, setNewLeadPhone] = useState("");
  const [newLeadProduct, setNewLeadProduct] = useState("");
  const [newLeadMessage, setNewLeadMessage] = useState("");
  const [newLeadSource, setNewLeadSource] = useState<"call" | "whatsapp" | "form">("call");
  const [isSavingLead, setIsSavingLead] = useState(false);

  // Real-time polling every 6 seconds to fetch new incoming leads automatically
  useEffect(() => {
    const fetchLatestLeads = async () => {
      try {
        const res = await fetch("/api/leads");
        const data = await res.json();
        if (data.success && Array.isArray(data.leads)) {
          setLeads(data.leads);
        }
      } catch (err) {
        console.error("Failed to poll leads:", err);
      }
    };

    const interval = setInterval(fetchLatestLeads, 6000);
    return () => clearInterval(interval);
  }, []);

  // Update Lead Status Handler
  const handleUpdateStatus = async (id: string, newStatus: LeadStatus) => {
    try {
      const res = await fetch(`/api/leads/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success && data.lead) {
        setLeads((prev) =>
          prev.map((l) => (l.id === id ? { ...l, status: newStatus } : l))
        );
      }
    } catch (err) {
      console.error("Status update error:", err);
    }
  };

  // Delete Lead Handler
  const handleDeleteLead = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this lead?")) return;
    try {
      const res = await fetch(`/api/leads/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setLeads((prev) => prev.filter((l) => l.id !== id));
        if (selectedLead?.id === id) setSelectedLead(null);
      }
    } catch (err) {
      console.error("Delete lead error:", err);
    }
  };

  // Manual Lead Submission Handler (Requirement #6)
  const handleManualAddLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLeadName.trim() || !newLeadPhone.trim()) return;

    setIsSavingLead(true);
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newLeadName.trim(),
          phone: newLeadPhone.trim(),
          product: newLeadProduct.trim() || undefined,
          message: newLeadMessage.trim() || "Manual offline lead entry",
          source: newLeadSource,
        }),
      });
      const data = await res.json();
      if (data.success && data.lead) {
        setLeads((prev) => [data.lead, ...prev]);
        setIsAddModalOpen(false);
        setNewLeadName("");
        setNewLeadPhone("");
        setNewLeadProduct("");
        setNewLeadMessage("");
        setNewLeadSource("call");
      }
    } catch (err) {
      console.error("Manual add lead error:", err);
    } finally {
      setIsSavingLead(false);
    }
  };

  // WhatsApp Follow-up URL Builder
  const getWhatsAppFollowupUrl = (lead: Lead) => {
    const rawNum = lead.phone.replace(/\D/g, "");
    const formattedNum = rawNum.length === 10 ? `91${rawNum}` : rawNum;
    let text = `Hi ${lead.name}, I am following up on your enquiry regarding ${lead.product || "interior solutions"} with VLR Traders. How can we assist you today?`;
    return `https://wa.me/${formattedNum}?text=${encodeURIComponent(text)}`;
  };

  // Filtered Leads Calculation
  const filteredLeads = useMemo(() => {
    return leads.filter((l) => {
      const q = search.toLowerCase();
      const matchesSearch =
        !q ||
        l.name.toLowerCase().includes(q) ||
        l.phone.toLowerCase().includes(q) ||
        (l.product && l.product.toLowerCase().includes(q)) ||
        (l.message && l.message.toLowerCase().includes(q));

      const matchesTab = activeTab === "All" || l.status === activeTab;
      return matchesSearch && matchesTab;
    });
  }, [leads, search, activeTab]);

  // Counts Calculation
  const counts = useMemo(() => {
    return {
      total: leads.length,
      newCount: leads.filter((l) => l.status === "New").length,
      contacted: leads.filter((l) => l.status === "Contacted").length,
      closed: leads.filter((l) => l.status === "Closed").length,
    };
  }, [leads]);

  // Export CSV Handler
  const handleExportCSV = () => {
    if (leads.length === 0) return;
    const headers = ["ID", "Name", "Phone", "Product", "Message", "Source", "Status", "Date"];
    const rows = filteredLeads.map((l) => [
      l.id,
      `"${l.name.replace(/"/g, '""')}"`,
      `"${l.phone}"`,
      `"${(l.product || "").replace(/"/g, '""')}"`,
      `"${(l.message || "").replace(/"/g, '""')}"`,
      l.source,
      l.status,
      new Date(l.timestamp).toLocaleString(),
    ]);

    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `vlr_leads_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
  };

  return (
    <div className={styles.container}>
      {/* ── HEADER TITLE & ACTIONS ───────────────────────────── */}
      <div className={styles.headerBar}>
        <div className={styles.titleArea}>
          <span className={styles.kicker}>LEADS MANAGEMENT</span>
          <h1 className={styles.pageTitle}>Leads</h1>
          <p className={styles.pageDesc}>
            View and manage all customer enquiries. Follow up quickly and grow your business.
          </p>
        </div>

        <div className={styles.headerActions}>
          <button type="button" className={styles.dateBtn} style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem" }}>
            <Calendar size={14} color="#64748b" /> Sep 1, 2025 - Sep 12, 2025
          </button>
          <button
            type="button"
            className={styles.addLeadBtn}
            onClick={() => setIsAddModalOpen(true)}
            style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem" }}
          >
            <Plus size={16} /> Add Lead
          </button>
        </div>
      </div>

      {/* ── SUMMARY METRICS CARDS (MATCHING UI MOCKUP) ───────── */}
      <div className={styles.metricsGrid}>
        <div className={styles.metricCard}>
          <div className={`${styles.metricIconCircle} ${styles.metricTotal}`}>
            <Users size={18} color="#1b4f8a" />
          </div>
          <div className={styles.metricInfo}>
            <span className={styles.metricLabel}>Total Leads</span>
            <div className={styles.metricValRow}>
              <span className={styles.metricValue}>{counts.total}</span>
              <span className={styles.trendBadge}>↗ +12% vs last month</span>
            </div>
          </div>
        </div>

        <div className={styles.metricCard}>
          <div className={`${styles.metricIconCircle} ${styles.metricNew}`}>
            <FileText size={18} color="#0d9488" />
          </div>
          <div className={styles.metricInfo}>
            <span className={styles.metricLabel}>New Leads</span>
            <div className={styles.metricValRow}>
              <span className={styles.metricValue}>{counts.newCount}</span>
              <span className={styles.trendBadge}>↗ +18% vs last month</span>
            </div>
          </div>
        </div>

        <div className={styles.metricCard}>
          <div className={`${styles.metricIconCircle} ${styles.metricContacted}`}>
            <Phone size={18} color="#1b4f8a" />
          </div>
          <div className={styles.metricInfo}>
            <span className={styles.metricLabel}>Contacted</span>
            <div className={styles.metricValRow}>
              <span className={styles.metricValue}>{counts.contacted}</span>
              <span className={styles.trendBadge}>↗ +8% vs last month</span>
            </div>
          </div>
        </div>

        <div className={styles.metricCard}>
          <div className={`${styles.metricIconCircle} ${styles.metricClosed}`}>
            <CheckCircle2 size={18} color="#166534" />
          </div>
          <div className={styles.metricInfo}>
            <span className={styles.metricLabel}>Closed</span>
            <div className={styles.metricValRow}>
              <span className={styles.metricValue}>{counts.closed}</span>
              <span className={styles.trendBadge}>↗ +25% vs last month</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── TOOLBAR & TABS ───────────────────────────────────── */}
      <div className={styles.toolbarCard}>
        <div className={styles.tabsGroup}>
          <button
            type="button"
            className={`${styles.tabBtn} ${activeTab === "All" ? styles.activeTab : ""}`}
            onClick={() => setActiveTab("All")}
          >
            All Leads ({counts.total})
          </button>
          <button
            type="button"
            className={`${styles.tabBtn} ${activeTab === "New" ? styles.activeTab : ""}`}
            onClick={() => setActiveTab("New")}
          >
            New ({counts.newCount})
          </button>
          <button
            type="button"
            className={`${styles.tabBtn} ${activeTab === "Contacted" ? styles.activeTab : ""}`}
            onClick={() => setActiveTab("Contacted")}
          >
            Contacted ({counts.contacted})
          </button>
          <button
            type="button"
            className={`${styles.tabBtn} ${activeTab === "Closed" ? styles.activeTab : ""}`}
            onClick={() => setActiveTab("Closed")}
          >
            Closed ({counts.closed})
          </button>
        </div>

        <div className={styles.toolbarRight}>
          <div className={styles.searchBox}>
            <span className={styles.searchIcon} style={{ display: "inline-flex", alignItems: "center" }}>
              <Search size={16} color="#64748b" />
            </span>
            <input
              type="search"
              className={styles.searchInput}
              placeholder="Search leads..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <button type="button" className={styles.toolBtn} style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem" }}>
            <SlidersHorizontal size={14} /> Filter
          </button>
          <button type="button" className={styles.toolBtn} onClick={handleExportCSV} style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem" }}>
            <Download size={14} /> Export
          </button>
        </div>
      </div>

      {/* ── LEADS TABLE VIEW ─────────────────────────────────── */}
      <div className={styles.tableCard}>
        {filteredLeads.length > 0 ? (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Phone</th>
                  <th>Product / Interest</th>
                  <th>Message</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredLeads.map((lead, idx) => {
                  const waUrl = getWhatsAppFollowupUrl(lead);

                  return (
                    <tr
                      key={lead.id}
                      onClick={() => setSelectedLead(lead)}
                      style={{ cursor: "pointer" }}
                    >
                      <td className={styles.rowIndex}>{idx + 1}</td>

                      {/* Name */}
                      <td>
                        <div className={styles.customerMeta}>
                          <span className={styles.customerName}>{lead.name}</span>
                          <span className={styles.customerTag}>
                            {idx % 4 === 0 ? "Builder" : idx % 3 === 0 ? "Interior Designer" : idx % 2 === 0 ? "Contractor" : "Home Owner"}
                          </span>
                        </div>
                      </td>

                      {/* Phone */}
                      <td>
                        <div className={styles.phoneWrap}>
                          <Phone size={14} color="#1b4f8a" />
                          <span>{lead.phone}</span>
                        </div>
                      </td>

                      {/* Product */}
                      <td>
                        <span className={styles.productText}>
                          {lead.product || "Interior Solutions"}
                        </span>
                      </td>

                      {/* Message */}
                      <td>
                        <div className={styles.msgSnippet} title={lead.message}>
                          {lead.message || "Enquired for pricing & catalogues"}
                        </div>
                      </td>

                      {/* Date */}
                      <td>
                        <span className={styles.dateText}>
                          {new Date(lead.timestamp).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                      </td>

                      {/* Status */}
                      <td>
                        <span
                          className={`${styles.statusPill} ${
                            lead.status === "New"
                              ? styles.statusNew
                              : lead.status === "Contacted"
                              ? styles.statusContacted
                              : styles.statusClosed
                          }`}
                        >
                          {lead.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td onClick={(e) => e.stopPropagation()}>
                        <div className={styles.actionsCell}>
                          <a
                            href={waUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.waFollowupBtn}
                            title="Follow up on WhatsApp"
                            style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem" }}
                          >
                            <MessageSquare size={13} /> WhatsApp
                          </a>

                          {lead.status === "New" && (
                            <button
                              type="button"
                              className={styles.markStatusBtn}
                              onClick={() => handleUpdateStatus(lead.id, "Contacted")}
                            >
                              Mark Contacted
                            </button>
                          )}

                          {lead.status === "Contacted" && (
                            <button
                              type="button"
                              className={`${styles.markStatusBtn} ${styles.markClosedBtn}`}
                              onClick={() => handleUpdateStatus(lead.id, "Closed")}
                              style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem" }}
                            >
                              <CheckCircle2 size={13} /> Mark Closed
                            </button>
                          )}

                          {lead.status === "Closed" && (
                            <span style={{ fontSize: "0.75rem", color: "#166534", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: "0.25rem" }}>
                              Closed <CheckCircle2 size={13} />
                            </span>
                          )}

                          <button
                            type="button"
                            className={styles.moreMenuBtn}
                            onClick={(e) => handleDeleteLead(lead.id, e)}
                            title="Delete Lead"
                            style={{ display: "inline-flex", alignItems: "center" }}
                          >
                            <Trash2 size={15} color="#ef4444" />
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
          /* EMPTY STATE VIEW (MATCHING UI MOCKUP) */
          <div className={styles.emptyCard}>
            <div className={styles.emptyIconCircle} style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Inbox size={28} color="#64748b" />
            </div>
            <h3 className={styles.emptyTitle}>No enquiries yet</h3>
            <p className={styles.emptySub}>
              When customers submit enquiries from your website, they will appear here automatically.
            </p>
            <Link href="/" target="_blank" className="btn btn-outline btn-sm">
              View Website ↗
            </Link>
          </div>
        )}
      </div>

      {/* ── MANUAL LEAD ENTRY MODAL (REQUIREMENT #6) ─────────── */}
      {isAddModalOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.75)",
            backdropFilter: "blur(4px)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem",
          }}
          onClick={() => setIsAddModalOpen(false)}
        >
          <div
            style={{
              background: "#ffffff",
              borderRadius: "1rem",
              maxWidth: "480px",
              width: "100%",
              padding: "2rem",
              boxShadow: "0 20px 40px rgba(0, 0, 0, 0.2)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ fontSize: "1.35rem", fontWeight: 800, margin: "0 0 1rem" }}>
              Add Manual Lead
            </h2>
            <form onSubmit={handleManualAddLead} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div>
                <label style={{ fontSize: "0.85rem", fontWeight: 700, display: "block", marginBottom: "0.3rem" }}>
                  Customer Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Enter name"
                  value={newLeadName}
                  onChange={(e) => setNewLeadName(e.target.value)}
                  style={{ width: "100%", padding: "0.65rem 0.85rem", borderRadius: "0.5rem", border: "1px solid #cbd5e1" }}
                />
              </div>

              <div>
                <label style={{ fontSize: "0.85rem", fontWeight: 700, display: "block", marginBottom: "0.3rem" }}>
                  Phone Number *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="+91 98765 43210"
                  value={newLeadPhone}
                  onChange={(e) => setNewLeadPhone(e.target.value)}
                  style={{ width: "100%", padding: "0.65rem 0.85rem", borderRadius: "0.5rem", border: "1px solid #cbd5e1" }}
                />
              </div>

              <div>
                <label style={{ fontSize: "0.85rem", fontWeight: 700, display: "block", marginBottom: "0.3rem" }}>
                  Product / Interest
                </label>
                <input
                  type="text"
                  placeholder="e.g. Century Club Prime Plywood, Godrej Locks"
                  value={newLeadProduct}
                  onChange={(e) => setNewLeadProduct(e.target.value)}
                  style={{ width: "100%", padding: "0.65rem 0.85rem", borderRadius: "0.5rem", border: "1px solid #cbd5e1" }}
                />
              </div>

              <div>
                <label style={{ fontSize: "0.85rem", fontWeight: 700, display: "block", marginBottom: "0.3rem" }}>
                  Source
                </label>
                <select
                  value={newLeadSource}
                  onChange={(e) => setNewLeadSource(e.target.value as "call" | "whatsapp" | "form")}
                  style={{ width: "100%", padding: "0.65rem 0.85rem", borderRadius: "0.5rem", border: "1px solid #cbd5e1" }}
                >
                  <option value="call">Phone Call</option>
                  <option value="whatsapp">WhatsApp</option>
                  <option value="form">Walk-in / Other</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: "0.85rem", fontWeight: 700, display: "block", marginBottom: "0.3rem" }}>
                  Project Note / Message
                </label>
                <textarea
                  rows={3}
                  placeholder="Enter customer requirement notes..."
                  value={newLeadMessage}
                  onChange={(e) => setNewLeadMessage(e.target.value)}
                  style={{ width: "100%", padding: "0.65rem 0.85rem", borderRadius: "0.5rem", border: "1px solid #cbd5e1" }}
                />
              </div>

              <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.5rem" }}>
                <button
                  type="submit"
                  disabled={isSavingLead}
                  style={{
                    flex: 1,
                    padding: "0.75rem",
                    borderRadius: "0.5rem",
                    background: "#1d4ed8",
                    color: "#ffffff",
                    fontWeight: 700,
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  {isSavingLead ? "Saving..." : "Save Lead"}
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  style={{
                    padding: "0.75rem 1.25rem",
                    borderRadius: "0.5rem",
                    background: "#f1f5f9",
                    color: "#334155",
                    fontWeight: 600,
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── FULL LEAD DETAILS MODAL (REQUIREMENT 3C) ──────────── */}
      {selectedLead && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.75)",
            backdropFilter: "blur(4px)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem",
          }}
          onClick={() => setSelectedLead(null)}
        >
          <div
            style={{
              background: "#ffffff",
              borderRadius: "1rem",
              maxWidth: "520px",
              width: "100%",
              padding: "2rem",
              boxShadow: "0 20px 40px rgba(0, 0, 0, 0.2)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <span className={`${styles.statusPill} ${selectedLead.status === "New" ? styles.statusNew : selectedLead.status === "Contacted" ? styles.statusContacted : styles.statusClosed}`}>
                {selectedLead.status}
              </span>
              <button
                type="button"
                onClick={() => setSelectedLead(null)}
                style={{ background: "none", border: "none", cursor: "pointer" }}
              >
                <X size={20} color="#64748b" />
              </button>
            </div>

            <h2 style={{ fontSize: "1.5rem", fontWeight: 800, margin: "0 0 0.5rem" }}>
              {selectedLead.name}
            </h2>
            <p style={{ color: "#475569", margin: "0 0 1.25rem", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: "0.5rem" }}>
              <Phone size={16} color="#1b4f8a" /> {selectedLead.phone}
            </p>

            <div style={{ background: "#f8fafc", padding: "1rem", borderRadius: "0.5rem", marginBottom: "1.25rem" }}>
              <p style={{ fontSize: "0.8125rem", fontWeight: 700, color: "#64748b", margin: "0 0 0.25rem" }}>
                PRODUCT / INTEREST
              </p>
              <p style={{ fontWeight: 700, color: "#0f172a", margin: 0 }}>
                {selectedLead.product || "General Interior Enquiry"}
              </p>
            </div>

            <div style={{ marginBottom: "1.5rem" }}>
              <p style={{ fontSize: "0.8125rem", fontWeight: 700, color: "#64748b", margin: "0 0 0.25rem" }}>
                REQUIREMENT DETAILS
              </p>
              <p style={{ color: "#334155", lineHeight: 1.5, margin: 0 }}>
                {selectedLead.message || "No additional text provided."}
              </p>
            </div>

            <div style={{ fontSize: "0.75rem", color: "#94a3b8", marginBottom: "1.5rem" }}>
              Enquiry ID: {selectedLead.id} • Source: {selectedLead.source} • Received: {new Date(selectedLead.timestamp).toLocaleString()}
            </div>

            <div style={{ display: "flex", gap: "0.75rem" }}>
              <a
                href={getWhatsAppFollowupUrl(selectedLead)}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.waFollowupBtn}
                style={{ flex: 1, justifyContent: "center", padding: "0.75rem", display: "inline-flex", alignItems: "center", gap: "0.5rem" }}
              >
                <MessageSquare size={16} /> Chat on WhatsApp
              </a>

              {selectedLead.status !== "Closed" && (
                <button
                  type="button"
                  className={styles.markStatusBtn}
                  onClick={() => {
                    handleUpdateStatus(selectedLead.id, selectedLead.status === "New" ? "Contacted" : "Closed");
                    setSelectedLead(null);
                  }}
                  style={{ flex: 1, padding: "0.75rem" }}
                >
                  Mark as {selectedLead.status === "New" ? "Contacted" : "Closed"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
