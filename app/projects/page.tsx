import type { Metadata } from "next";
import { getAllProjects } from "@/lib/projects-store";
import { siteConfig } from "@/config/site";
import ProjectsClient from "./ProjectsClient";

export const metadata: Metadata = {
  title: `Our Projects & Completed Installations — ${siteConfig.name}`,
  description:
    "Explore real completed modular kitchen, wardrobe, and interior panel installations by VLR Traders across Hyderabad.",
  openGraph: {
    title: `Our Projects — ${siteConfig.name}`,
    description:
      "Explore real completed modular kitchen, wardrobe, and interior panel installations by VLR Traders across Hyderabad.",
    url: `${siteConfig.url}/projects`,
    siteName: siteConfig.name,
  },
};

export default async function ProjectsPage() {
  const initialProjects = await getAllProjects();

  return <ProjectsClient initialProjects={initialProjects} />;
}
