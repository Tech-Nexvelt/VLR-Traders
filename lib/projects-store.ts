// ============================================================
// VLR Traders — Projects Data Store (Postgres via Drizzle)
// ============================================================

import { and, desc, eq, ne, or } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { projects } from "@/lib/db/schema";
import { generateSlug } from "@/lib/slug";

export interface Project {
  id: string;
  slug: string;
  title: string;
  name?: string;
  category: "Modular Kitchens" | "Wardrobes" | "Interior Panels" | "Full Interior" | "Commercial";
  location: string;
  client?: string;
  area?: string;
  completionDate?: string;
  description: string;
  images: string[];
  featured?: boolean;
  status?: "Completed" | "In Progress";
  createdAt: string;
}

function toProject(row: typeof projects.$inferSelect): Project {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    name: row.name ?? row.title,
    category: row.category as Project["category"],
    location: row.location,
    client: row.client ?? undefined,
    area: row.area ?? undefined,
    completionDate: row.completionDate ?? undefined,
    description: row.description,
    images: row.images,
    featured: row.featured,
    status: row.status as Project["status"],
    createdAt: row.createdAt.toISOString(),
  };
}

let projectsCache: { data: Project[]; timestamp: number } | null = null;
const PROJECTS_CACHE_TTL = 30000;

export function clearProjectsCache() {
  projectsCache = null;
}

/** Read all projects */
export async function getAllProjects(): Promise<Project[]> {
  const now = Date.now();
  if (projectsCache && now - projectsCache.timestamp < PROJECTS_CACHE_TTL) {
    return projectsCache.data;
  }
  try {
    const rows = await db.select().from(projects).orderBy(desc(projects.createdAt));
    const data = rows.map(toProject);
    projectsCache = { data, timestamp: now };
    return data;
  } catch (error) {
    console.error("Error reading projects:", error);
    return projectsCache?.data ?? [];
  }
}

export interface CreateProjectInput {
  title: string;
  category: string;
  location: string;
  client?: string;
  area?: string;
  completionDate?: string;
  description: string;
  images: string[];
  featured?: boolean;
  status?: "Completed" | "In Progress";
}

async function findUniqueSlug(baseTitle: string, excludeId?: string): Promise<string> {
  const baseSlug = generateSlug(baseTitle);
  let candidate = baseSlug;
  let counter = 1;

  while (true) {
    const existing = await db
      .select({ id: projects.id })
      .from(projects)
      .where(excludeId ? and(eq(projects.slug, candidate), ne(projects.id, excludeId)) : eq(projects.slug, candidate))
      .limit(1);
    if (existing.length === 0) return candidate;
    candidate = `${baseSlug}-${counter}`;
    counter++;
  }
}

/** Add a new project */
export async function createProject(input: CreateProjectInput): Promise<Project> {
  const slug = await findUniqueSlug(input.title);
  const id = `proj-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 5)}`;

  const [row] = await db
    .insert(projects)
    .values({
      id,
      slug,
      title: input.title.trim(),
      name: input.title.trim(),
      category: input.category,
      location: input.location.trim(),
      client: input.client?.trim() || "Private Client",
      area: input.area?.trim() || "",
      completionDate: input.completionDate?.trim() || "Recent",
      description: input.description.trim(),
      images: input.images && input.images.length > 0 ? input.images : ["/hero_kitchen.jpg"],
      featured: input.featured ?? true,
      status: input.status || "Completed",
    })
    .returning();

  clearProjectsCache();
  return toProject(row);
}

/** Update existing project */
export async function updateProject(id: string, updates: Partial<CreateProjectInput>): Promise<Project | null> {
  const [existing] = await db.select().from(projects).where(eq(projects.id, id)).limit(1);
  if (!existing) return null;

  let slug = existing.slug;
  if (updates.title && updates.title.trim() !== existing.title) {
    slug = await findUniqueSlug(updates.title, id);
  }

  const [row] = await db
    .update(projects)
    .set({
      slug,
      title: updates.title ? updates.title.trim() : existing.title,
      name: updates.title ? updates.title.trim() : existing.name ?? existing.title,
      category: updates.category ?? existing.category,
      location: updates.location !== undefined ? updates.location.trim() : existing.location,
      client: updates.client !== undefined ? updates.client.trim() : existing.client,
      area: updates.area !== undefined ? updates.area.trim() : existing.area,
      completionDate:
        updates.completionDate !== undefined ? updates.completionDate.trim() : existing.completionDate,
      description: updates.description !== undefined ? updates.description.trim() : existing.description,
      images: updates.images && updates.images.length > 0 ? updates.images : existing.images,
      featured: updates.featured !== undefined ? updates.featured : existing.featured,
      status: updates.status || existing.status,
    })
    .where(eq(projects.id, id))
    .returning();

  clearProjectsCache();
  return toProject(row);
}

/** Delete project */
export async function deleteProject(id: string): Promise<boolean> {
  const deleted = await db.delete(projects).where(eq(projects.id, id)).returning({ id: projects.id });
  clearProjectsCache();
  return deleted.length > 0;
}

/** Get single project by slug or id */
export async function getProjectBySlugOrId(identifier: string): Promise<Project | null> {
  const [row] = await db
    .select()
    .from(projects)
    .where(or(eq(projects.slug, identifier), eq(projects.id, identifier)))
    .limit(1);
  return row ? toProject(row) : null;
}
