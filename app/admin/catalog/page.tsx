import type { Metadata } from "next";
import AdminCatalogView from "./AdminCatalogView";

export const metadata: Metadata = {
  title: "Catalog Management — VLR Traders Admin",
  description: "Manage product listings, update categories, materials, finishes and image assets.",
};

export default function CatalogManagementPage() {
  return <AdminCatalogView />;
}
