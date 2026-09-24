import { NextResponse } from "next/server";
import { getAllProjects, createProject } from "@/lib/projects-store";

// GET /api/projects — List all projects
export async function GET() {
  try {
    const projects = await getAllProjects();
    return NextResponse.json(
      {
        success: true,
        count: projects.length,
        projects,
      },
      {
        headers: {
          "Cache-Control": "public, max-age=10, s-maxage=60, stale-while-revalidate=3600",
        },
      }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch projects" },
      { status: 500 }
    );
  }
}

// POST /api/projects — Create new project
export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!body.title || !body.title.trim()) {
      return NextResponse.json(
        { success: false, error: "Project title is required" },
        { status: 400 }
      );
    }

    if (!body.category) {
      return NextResponse.json(
        { success: false, error: "Category is required" },
        { status: 400 }
      );
    }

    if (!body.location || !body.location.trim()) {
      return NextResponse.json(
        { success: false, error: "Location is required" },
        { status: 400 }
      );
    }

    const newProject = await createProject({
      title: body.title,
      category: body.category,
      location: body.location,
      client: body.client || "",
      area: body.area || "",
      completionDate: body.completionDate || "",
      description: body.description || "",
      images: Array.isArray(body.images) && body.images.length > 0 ? body.images : ["/hero_kitchen.jpg"],
      featured: body.featured ?? true,
      status: body.status || "Completed",
    });

    return NextResponse.json({
      success: true,
      project: newProject,
      message: "Project added successfully",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create project" },
      { status: 500 }
    );
  }
}
