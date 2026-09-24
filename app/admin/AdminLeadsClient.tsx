"use client";

import { useState, useMemo } from "react";
import { Download, Search, MessageSquare, Phone, Trash2 } from "lucide-react";
import type { Lead, LeadStatus, LeadSource } from "@/types/enquiry";
import { getWhatsAppUrl, getCallUrl } from "@/lib/whatsapp";
import styles from "./admin-leads.module.css";

interface AdminLeadsClientProps {
  initialLeads: Lead[];
}

export default function AdminLeadsClient({ initialLeads }: AdminLeadsClientProps) {
  const [leads, setLeads] = useState<Lead[]>(initialLeads);
  const [search, setSearch] = useState("");
  const [sourceFilter, setSourceFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  // Status badge style lookup
  const getStatusClass = (status: LeadStatus) => {
    switch (status) {
      case "New": return styles.statusNew;
      case "Contacted": return styles.statusContacted;
      case "In Progress": return styles.statusInProgress;
      case "Closed": return styles.statusClosed;
      default: return "";
    }
  };

  // Source badge style lookup
  const getSourceClass = (source: LeadSource) => {
    switch (source) {
      case "form": return styles.sourceForm;
      case "product": return styles.sourceProduct;
      case "catalog": return styles.sourceCatalog;
      default: return "";
    }
  };

  // Update Status handler
  const handleStatusChange = async (id: string, newStatus: LeadStatus) => {
    setIsUpdating(id);
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
      console.error("Failed to update status:", err);
    } finally {
      setIsUpdating(null);
    }
  };

  // Delete lead handler
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this lead record?")) return;
    try {
      const res = await fetch(`/api/leads/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setLeads((prev) => prev.filter((l) => l.id !== id));
      }
    } catch (err) {
      console.error("Failed to delete lead:", err);
    }
  };

  // CSV Export handler
  const handleExportCSV = () => {
    if (leads.length === 0) return;
    const headers = ["ID", "Name", "Phone", "Product", "Message", "Source", "Status", "Timestamp"];
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

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `vlr_traders_leads_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtered leads
  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      const q = search.toLowerCase();
      const matchesSearch =
        !q ||
        lead.name.toLowerCase().includes(q) ||
        lead.phone.toLowerCase().includes(q) ||
        (lead.product && lead.product.toLowerCase().includes(q)) ||
        (lead.message && lead.message.toLowerCase().includes(q));

      const matchesSource = sourceFilter === "all" || lead.source === sourceFilter;
      const matchesStatus = statusFilter === "all" || lead.status === statusFilter;

      return matchesSearch && matchesSource && matchesStatus;
    });
  }, [leads, search, sourceFilter, statusFilter]);

  // Statistics
  const stats = useMemo(() => {
    return {
      total: leads.length,
      newCount: leads.filter((l) => l.status === "New").length,
      contacted: leads.filter((l) => l.status === "Contacted").length,
      inProgress: leads.filter((l) => l.status === "In Progress").length,
      closed: leads.filter((l) => l.status === "Closed").length,
    };
  }, [leads]);

  return (
    <div className={styles.container}>
      {/* HEADER */}
      <div className={styles.header}>
        <div className={styles.titleGroup}>
          <h1 className={styles.title}>Lead Management Dashboard</h1>
          <p className={styles.subtitle}>
            Real-time customer enquiries captured across Contact Form, Product Pages & Catalog.
          </p>
        </div>

        <button type="button" className={styles.exportBtn} onClick={handleExportCSV} style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem" }}>
          <Download size={14} /> Export CSV ({filteredLeads.length})
        </button>
      </div>

      {/* STATS CARDS */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Total Enquiries</span>
          <span className={styles.statVal}>{stats.total}</span>
        </div>

        <div className={styles.statCard}>
          <span className={styles.statLabel}>New Leads</span>
          <span className={`${styles.statVal} ${styles.statNew}`}>{stats.newCount}</span>
        </div>

        <div className={styles.statCard}>
          <span className={styles.statLabel}>Contacted</span>
          <span className={styles.statVal}>{stats.contacted}</span>
        </div>

        <div className={styles.statCard}>
          <span className={styles.statLabel}>In Progress / Closed</span>
          <span className={styles.statVal}>{stats.inProgress + stats.closed}</span>
        </div>
      </div>

      {/* FILTER & SEARCH BAR */}
      <div className={styles.controlsBar}>
        <div className={styles.searchWrap}>
          <span className={styles.searchIcon} style={{ display: "inline-flex", alignItems: "center" }}>
            <Search size={16} color="#64748b" />
          </span>
          <input
            type="search"
            className={styles.searchInput}
            placeholder="Search by name, phone, product..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className={styles.filterGroup}>
          <select
            className={styles.filterSelect}
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
          >
            <option value="all">All Sources</option>
            <option value="form">Contact Form</option>
            <option value="product">Product Page</option>
            <option value="catalog">Catalog</option>
          </select>

          <select
            className={styles.filterSelect}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="New">New</option>
            <option value="Contacted">Contacted</option>
            <option value="In Progress">In Progress</option>
            <option value="Closed">Closed</option>
          </select>
        </div>
      </div>

      {/* LEADS TABLE */}
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Source</th>
              <th>Customer Details</th>
              <th>Product Enquired</th>
              <th>Requirement / Message</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredLeads.length > 0 ? (
              filteredLeads.map((lead) => {
                const waUrl = getWhatsAppUrl({
                  product: lead.product,
                  message: lead.message,
                  name: lead.name,
                  phone: lead.phone,
                });
                const callUrl = getCallUrl(lead.phone);

                return (
                  <tr key={lead.id}>
                    {/* Timestamp */}
                    <td style={{ whiteSpace: "nowrap", color: "#64748b", fontSize: "0.8125rem" }}>
                      {new Date(lead.timestamp).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>

                    {/* Source Badge */}
                    <td>
                      <span className={`${styles.sourceBadge} ${getSourceClass(lead.source)}`}>
                        {lead.source}
                      </span>
                    </td>

                    {/* Customer */}
                    <td>
                      <div className={styles.customerName}>{lead.name}</div>
                      <div className={styles.customerPhone}>{lead.phone}</div>
                      <div className={styles.quickActions}>
                        <a href={waUrl} target="_blank" rel="noopener noreferrer" className={styles.actionIconLink} style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem" }}>
                          <MessageSquare size={12} /> WhatsApp
                        </a>
                        <a href={callUrl} className={styles.actionIconLink} style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem" }}>
                          <Phone size={12} /> Call
                        </a>
                      </div>
                    </td>

                    {/* Product */}
                    <td>
                      {lead.product ? (
                        <strong style={{ color: "#0f172a" }}>{lead.product}</strong>
                      ) : (
                        <span style={{ color: "#94a3b8" }}>General Service</span>
                      )}
                    </td>

                    {/* Requirement */}
                    <td style={{ maxWidth: "280px" }}>
                      <p style={{ margin: 0, color: "#334155", lineHeight: 1.4 }}>
                        {lead.message || <em style={{ color: "#94a3b8" }}>No specific message provided</em>}
                      </p>
                    </td>

                    {/* Status Dropdown */}
                    <td>
                      <select
                        className={`${styles.statusSelect} ${getStatusClass(lead.status)}`}
                        value={lead.status}
                        disabled={isUpdating === lead.id}
                        onChange={(e) => handleStatusChange(lead.id, e.target.value as LeadStatus)}
                      >
                        <option value="New">New</option>
                        <option value="Contacted">Contacted</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Closed">Closed</option>
                      </select>
                    </td>

                    {/* Actions */}
                    <td>
                      <button
                        type="button"
                        className={styles.deleteBtn}
                        onClick={() => handleDelete(lead.id)}
                        title="Delete Lead"
                        style={{ display: "inline-flex", alignItems: "center" }}
                      >
                        <Trash2 size={14} color="#ef4444" />
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={7} className={styles.emptyState}>
                  No leads found matching your search or filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
