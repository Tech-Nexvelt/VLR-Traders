import { NextResponse } from "next/server";
import { getProjectBySlugOrId, updateProject, deleteProject } from "@/lib/projects-store";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/projects/[id] — Fetch single project
export async function GET(req: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const project = await getProjectBySlugOrId(id);

    if (!project) {
      return NextResponse.json(
        { success: false, error: "Project not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, project });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch project" },
      { status: 500 }
    );
  }
}

// PATCH or PUT /api/projects/[id] — Update project
export async function PATCH(req: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await req.json();

    const updated = await updateProject(id, body);

    if (!updated) {
      return NextResponse.json(
        { success: false, error: "Project not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      project: updated,
      message: "Project updated successfully",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update project" },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request, ctx: RouteParams) {
  return PATCH(req, ctx);
}

// DELETE /api/projects/[id] — Delete project
export async function DELETE(req: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const deleted = await deleteProject(id);

    if (!deleted) {
      return NextResponse.json(
        { success: false, error: "Project not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Project deleted successfully",
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to delete project" },
      { status: 500 }
    );
  }
}
