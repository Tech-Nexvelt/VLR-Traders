import { NextResponse } from "next/server";
import { updateLeadStatus, deleteLead } from "@/lib/leads-store";
import type { LeadStatus } from "@/types/enquiry";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// PATCH /api/leads/[id] — Update lead status
export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    const status: LeadStatus = body.status;

    if (!status) {
      return NextResponse.json(
        { success: false, error: "Status field is required." },
        { status: 400 }
      );
    }

    const updated = await updateLeadStatus(id, status);
    if (!updated) {
      return NextResponse.json(
        { success: false, error: "Lead not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, lead: updated });
  } catch (error) {
    console.error("PATCH /api/leads/[id] error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update lead status." },
      { status: 500 }
    );
  }
}

// DELETE /api/leads/[id] — Delete lead
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const deleted = await deleteLead(id);

    if (!deleted) {
      return NextResponse.json(
        { success: false, error: "Lead not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, message: "Lead deleted successfully." });
  } catch (error) {
    console.error("DELETE /api/leads/[id] error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete lead." },
      { status: 500 }
    );
  }
}
