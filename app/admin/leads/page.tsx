import type { Metadata } from "next";
import { getAllLeads } from "@/lib/leads-store";
import AdminLeadsView from "./AdminLeadsView";

export const metadata: Metadata = {
  title: "Leads Management — VLR Traders Admin CRM",
  description: "View and manage customer enquiries, follow up on WhatsApp, and track conversion statuses.",
  robots: { index: false, follow: false },
};

export const revalidate = 0;

export default async function AdminLeadsPage() {
  const initialLeads = await getAllLeads();

  return <AdminLeadsView initialLeads={initialLeads} />;
}
