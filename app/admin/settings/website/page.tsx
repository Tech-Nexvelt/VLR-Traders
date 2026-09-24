import type { Metadata } from "next";
import AdminWebsiteSettingsView from "./AdminWebsiteSettingsView";

export const metadata: Metadata = {
  title: "Website & Business Settings — VLR Traders Admin",
  description: "Configure business details, header/footer info, showroom address, and SEO metadata.",
};

export default function WebsiteSettingsPage() {
  return <AdminWebsiteSettingsView />;
}
