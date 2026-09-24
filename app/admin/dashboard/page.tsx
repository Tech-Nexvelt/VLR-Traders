import type { Metadata } from "next";
import Link from "next/link";
import { Phone, MessageSquare } from "lucide-react";
import { getAllLeads } from "@/lib/leads-store";
import { getAllProducts } from "@/lib/products-store";
import { getAllCategories } from "@/lib/categories-store";
import { getWhatsAppUrl } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "Dashboard Overview — VLR Traders Admin",
  description: "VLR Traders Mini CRM Executive Dashboard Overview.",
  robots: { index: false, follow: false },
};

export const revalidate = 0;

export default async function AdminDashboardPage() {
  const [leads, products, categories] = await Promise.all([
    getAllLeads(),
    getAllProducts(),
    getAllCategories(),
  ]);
  const newLeads = leads.filter((l) => l.status === "New");
  const contactedLeads = leads.filter((l) => l.status === "Contacted");
  const closedLeads = leads.filter((l) => l.status === "Closed");
  const recentLeads = leads.slice(0, 5);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      {/* HEADER */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 style={{ fontSize: "1.85rem", fontWeight: 900, color: "#0f172a", margin: 0 }}>
            Executive Dashboard
          </h1>
          <p style={{ color: "#64748b", margin: "0.25rem 0 0", fontSize: "0.875rem" }}>
            Welcome back, Admin! Here is your business activity overview.
          </p>
        </div>

        <Link
          href="/admin/leads"
          style={{
            padding: "0.6rem 1.25rem",
            borderRadius: "0.5rem",
            background: "#1d4ed8",
            color: "#ffffff",
            fontWeight: 700,
            fontSize: "0.875rem",
            textDecoration: "none",
          }}
        >
          View All Leads ({leads.length}) →
        </Link>
      </div>

      {/* STATS OVERVIEW CARDS */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1.25rem" }}>
        <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "0.875rem", padding: "1.25rem" }}>
          <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>
            Total Enquiries
          </span>
          <div style={{ fontSize: "2rem", fontWeight: 900, color: "#0f172a", marginTop: "0.35rem" }}>
            {leads.length}
          </div>
          <span style={{ fontSize: "0.75rem", color: "#16a34a", fontWeight: 700 }}>↗ Live database</span>
        </div>

        <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "0.875rem", padding: "1.25rem" }}>
          <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>
            New Leads Requiring Action
          </span>
          <div style={{ fontSize: "2rem", fontWeight: 900, color: "#2563eb", marginTop: "0.35rem" }}>
            {newLeads.length}
          </div>
          <span style={{ fontSize: "0.75rem", color: "#2563eb", fontWeight: 700 }}>Pending follow-up</span>
        </div>

        <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "0.875rem", padding: "1.25rem" }}>
          <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>
            Contacted & In Progress
          </span>
          <div style={{ fontSize: "2rem", fontWeight: 900, color: "#0d9488", marginTop: "0.35rem" }}>
            {contactedLeads.length}
          </div>
          <span style={{ fontSize: "0.75rem", color: "#0d9488", fontWeight: 700 }}>Active discussions</span>
        </div>

        <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "0.875rem", padding: "1.25rem" }}>
          <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>
            Active Catalog Products
          </span>
          <div style={{ fontSize: "2rem", fontWeight: 900, color: "#166534", marginTop: "0.35rem" }}>
            {products.length}
          </div>
          <span style={{ fontSize: "0.75rem", color: "#166534", fontWeight: 700 }}>{categories.length} Categories live</span>
        </div>
      </div>

      {/* RECENT LEADS ACTIVITY STREAM */}
      <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "0.875rem", padding: "1.5rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
          <h2 style={{ fontSize: "1.25rem", fontWeight: 800, color: "#0f172a", margin: 0 }}>
            Recent Customer Enquiries
          </h2>
          <Link href="/admin/leads" style={{ fontSize: "0.875rem", fontWeight: 700, color: "#1d4ed8", textDecoration: "none" }}>
            Open Leads CRM →
          </Link>
        </div>

        {recentLeads.length > 0 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
            {recentLeads.map((lead) => {
              const waUrl = getWhatsAppUrl({
                product: lead.product,
                message: lead.message,
                name: lead.name,
                phone: lead.phone,
              });

              return (
                <div
                  key={lead.id}
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "1rem",
                    background: "#f8fafc",
                    border: "1px solid #e2e8f0",
                    borderRadius: "0.625rem",
                    gap: "1rem",
                  }}
                >
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <strong style={{ fontSize: "0.9375rem", color: "#0f172a" }}>{lead.name}</strong>
                      <span style={{ fontSize: "0.72rem", padding: "0.15rem 0.5rem", borderRadius: "9999px", background: "#dbeafe", color: "#1d4ed8", fontWeight: 700 }}>
                        {lead.status}
                      </span>
                    </div>
                    <span style={{ fontSize: "0.8125rem", color: "#64748b", marginTop: "0.15rem", display: "inline-flex", alignItems: "center", gap: "0.35rem" }}>
                      <Phone size={13} color="#1b4f8a" /> {lead.phone} • Enquired for: <strong>{lead.product || "General Services"}</strong>
                    </span>
                  </div>

                  <a
                    href={waUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      padding: "0.45rem 0.85rem",
                      borderRadius: "0.5rem",
                      background: "#25d366",
                      color: "#ffffff",
                      fontSize: "0.8125rem",
                      fontWeight: 700,
                      textDecoration: "none",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.35rem",
                    }}
                  >
                    <MessageSquare size={14} /> Chat on WhatsApp
                  </a>
                </div>
              );
            })}
          </div>
        ) : (
          <p style={{ color: "#64748b" }}>No recent enquiries.</p>
        )}
      </div>
    </div>
  );
}
