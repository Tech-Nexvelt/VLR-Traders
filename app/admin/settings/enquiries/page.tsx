import type { Metadata } from "next";
import AdminEnquiriesSettingsView from "./AdminEnquiriesSettingsView";

export const metadata: Metadata = {
  title: "Enquiries & WhatsApp Settings — VLR Traders Admin",
  description: "Configure WhatsApp destination numbers, dynamic message templates, and lead form behavior.",
};

export default function EnquiriesSettingsPage() {
  return <AdminEnquiriesSettingsView />;
}
