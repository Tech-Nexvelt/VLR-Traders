import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { convertLeadToCustomer } from "@/lib/leads-store";
import { db } from "@/lib/db/client";
import { qpProfiles } from "@/lib/db/quotation-pro";
import { createSupabaseServerClient } from "@/lib/supabase/server";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// POST /api/leads/[id]/convert — Convert a website lead into a
// quotation_pro.customers row for VLR's tenant.
export async function POST(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;

    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    let convertedByProfileId: string | null = null;
    if (user) {
      const [profile] = await db
        .select({ id: qpProfiles.id })
        .from(qpProfiles)
        .where(eq(qpProfiles.userId, user.id))
        .limit(1);
      convertedByProfileId = profile?.id ?? null;
    }

    const result = await convertLeadToCustomer(id, convertedByProfileId);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || "Failed to convert lead." },
        { status: result.error === "Lead not found." ? 404 : 400 }
      );
    }

    return NextResponse.json({
      success: true,
      customerId: result.customerId,
      message: "Lead converted to a Quotation Pro customer.",
    });
  } catch (error) {
    console.error("POST /api/leads/[id]/convert error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to convert lead." },
      { status: 500 }
    );
  }
}
