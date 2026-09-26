// ============================================================
// VLR Traders — Projects Data Store (Supabase `website` schema + Drizzle fallback)
// ============================================================

import { getSupabaseServerAdminClient } from "@/lib/supabase/server";
import { parseProductImages } from "@/lib/products-store";
import { generateSlug } from "@/lib/slug";
import { db } from "@/lib/db/client";
import { projects as projectsTable } from "@/lib/db/schema";
import { and, eq, ne, or } from "drizzle-orm";

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

let projectsCache: { data: Project[]; timestamp: number } | null = null;
const PROJECTS_CACHE_TTL = 30000;

export function clearProjectsCache() {
  projectsCache = null;
}

function parseProjectRow(row: any): Project {
  const title = row.title || row.name || "Untitled Project";
  const images = parseProductImages(row.images);
  const isFeatured = row.featured ?? row.is_featured ?? true;
  const statusStr = (row.status || "Completed").toString();
  const normalizedStatus: "Completed" | "In Progress" =
    statusStr.toLowerCase().includes("progress") ? "In Progress" : "Completed";

  return {
    id: row.id,
    slug: row.slug || generateSlug(title),
    title,
    name: title,
    category: row.category || "Full Interior",
    location: row.location || "Coimbatore",
    client: row.client ?? undefined,
    area: row.area ?? undefined,
    completionDate: row.completion_date || row.completionDate || "Recent",
    description: row.description || "",
    images,
    featured: Boolean(isFeatured),
    status: normalizedStatus,
    createdAt: row.created_at || row.createdAt
      ? new Date(row.created_at || row.createdAt).toISOString()
      : new Date().toISOString(),
  };
}

/** Read all projects from Supabase website.projects with Drizzle fallback (no restrictive filters) */
export async function getAllProjects(): Promise<Project[]> {
  const now = Date.now();
  if (projectsCache && now - projectsCache.timestamp < PROJECTS_CACHE_TTL) {
    return projectsCache.data;
  }
  try {
    const supabase = getSupabaseServerAdminClient();
    const { data: rawProjects, error } = await supabase
      .schema("website")
      .from("projects")
      .select("*");

    console.log("ALL PROJECTS DATA:", rawProjects);
    if (error) {
      console.error("Supabase getAllProjects error:", error);
    }

    if (rawProjects && rawProjects.length > 0) {
      console.log("PROJECTS SAMPLE ITEM:", rawProjects[0]);
      const data = rawProjects.map(parseProjectRow);
      projectsCache = { data, timestamp: now };
      return data;
    }

    // Fallback: Query via Drizzle Postgres connection
    const rows = await db.select().from(projectsTable);
    if (rows && rows.length > 0) {
      const data = rows.map((r) => parseProjectRow(r));
      projectsCache = { data, timestamp: now };
      return data;
    }

    return [];
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
  const supabase = getSupabaseServerAdminClient();
  const baseSlug = generateSlug(baseTitle);
  let candidate = baseSlug;
  let counter = 1;

  while (true) {
    let query = supabase
      .schema("website")
      .from("projects")
      .select("id")
      .eq("slug", candidate);

    if (excludeId) query = query.neq("id", excludeId);

    const { data, error } = await query.limit(1);

    if (error || !data || data.length === 0) return candidate;
    candidate = `${baseSlug}-${counter}`;
    counter++;
  }
}

/** Add a new project */
export async function createProject(input: CreateProjectInput): Promise<Project> {
  const supabase = getSupabaseServerAdminClient();
  const slug = await findUniqueSlug(input.title);
  const id = `proj-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 5)}`;
  const images = input.images && input.images.length > 0 ? input.images : ["/hero_kitchen.jpg"];

  const payload = {
    id,
    slug,
    title: input.title.trim(),
    name: input.title.trim(),
    category: input.category,
    location: input.location.trim(),
    client: input.client?.trim() || "Private Client",
    area: input.area?.trim() || "",
    completion_date: input.completionDate?.trim() || "Recent",
    description: input.description.trim(),
    images,
    featured: input.featured ?? true,
    status: input.status || "Completed",
  };

  const { data, error } = await supabase
    .schema("website")
    .from("projects")
    .insert([payload])
    .select("*")
    .single();

  if (error) {
    console.error("Supabase createProject error:", error);
    // Drizzle fallback
    const [row] = await db.insert(projectsTable).values({
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
      images,
      featured: input.featured ?? true,
      status: input.status || "Completed",
    }).returning();

    clearProjectsCache();
    return parseProjectRow(row);
  }

  clearProjectsCache();
  return parseProjectRow(data);
}

/** Update existing project */
export async function updateProject(id: string, updates: Partial<CreateProjectInput>): Promise<Project | null> {
  const supabase = getSupabaseServerAdminClient();
  const existing = await getProjectBySlugOrId(id);
  if (!existing) return null;

  let slug = existing.slug;
  if (updates.title && updates.title.trim() !== existing.title) {
    slug = await findUniqueSlug(updates.title, id);
  }

  const payload: Record<string, any> = {};
  if (updates.title !== undefined) {
    payload.title = updates.title.trim();
    payload.name = updates.title.trim();
  }
  payload.slug = slug;
  if (updates.category !== undefined) payload.category = updates.category;
  if (updates.location !== undefined) payload.location = updates.location.trim();
  if (updates.client !== undefined) payload.client = updates.client.trim();
  if (updates.area !== undefined) payload.area = updates.area.trim();
  if (updates.completionDate !== undefined) payload.completion_date = updates.completionDate.trim();
  if (updates.description !== undefined) payload.description = updates.description.trim();
  if (updates.images && updates.images.length > 0) payload.images = updates.images;
  if (updates.featured !== undefined) payload.featured = updates.featured;
  if (updates.status !== undefined) payload.status = updates.status;

  const { data, error } = await supabase
    .schema("website")
    .from("projects")
    .update(payload)
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    console.error("Supabase updateProject error:", error);
    return null;
  }

  clearProjectsCache();
  return parseProjectRow(data);
}

/** Delete project */
export async function deleteProject(id: string): Promise<boolean> {
  try {
    const supabase = getSupabaseServerAdminClient();
    const { error } = await supabase
      .schema("website")
      .from("projects")
      .delete()
      .eq("id", id);

    if (error) console.error("Supabase deleteProject error:", error);
    await db.delete(projectsTable).where(eq(projectsTable.id, id));
    clearProjectsCache();
    return true;
  } catch (error) {
    console.error("Error deleting project:", error);
    return false;
  }
}

/** Get single project by slug or id */
export async function getProjectBySlugOrId(identifier: string): Promise<Project | null> {
  try {
    const supabase = getSupabaseServerAdminClient();
    const { data, error } = await supabase
      .schema("website")
      .from("projects")
      .select("*")
      .or(`slug.eq.${identifier},id.eq.${identifier}`)
      .limit(1);

    if (!error && data && data.length > 0) {
      return parseProjectRow(data[0]);
    }

    const [row] = await db
      .select()
      .from(projectsTable)
      .where(or(eq(projectsTable.slug, identifier), eq(projectsTable.id, identifier)))
      .limit(1);

    return row ? parseProjectRow(row) : null;
  } catch (error) {
    console.error("Error fetching project by slug/id:", error);
    return null;
  }
}
