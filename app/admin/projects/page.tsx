import type { Metadata } from "next";
import AdminProjectsView from "./AdminProjectsView";

export const metadata: Metadata = {
  title: "Projects Portfolio Management — VLR Traders Admin",
  description: "Manage client projects, upload showcase images, and update installation portfolio.",
};

export default function AdminProjectsPage() {
  return <AdminProjectsView />;
}
