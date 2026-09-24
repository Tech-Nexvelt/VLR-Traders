import { NextResponse } from "next/server";
import { getAllLeads, saveLead } from "@/lib/leads-store";
import { getWhatsAppUrl } from "@/lib/whatsapp";
import type { CreateLeadInput } from "@/types/enquiry";

// GET /api/leads — List all captured leads
export async function GET() {
  try {
    const leads = await getAllLeads();
    return NextResponse.json({ success: true, count: leads.length, leads });
  } catch (error) {
    console.error("GET /api/leads error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch leads" },
      { status: 500 }
    );
  }
}

// POST /api/leads — Save a new lead & return WhatsApp redirect URL
export async function POST(request: Request) {
  try {
    const body: CreateLeadInput = await request.json();

    const result = await saveLead(body);

    if (!result.success || !result.lead) {
      return NextResponse.json(
        { success: false, error: result.error || "Failed to process lead submission." },
        { status: 400 }
      );
    }

    // Generate prefilled WhatsApp URL for instant client redirection
    const whatsappUrl = getWhatsAppUrl({
      product: result.lead.product,
      message: result.lead.message,
      name: result.lead.name,
      phone: result.lead.phone,
    });

    return NextResponse.json({
      success: true,
      lead: result.lead,
      whatsappUrl,
      message: "Your enquiry has been received",
    });
  } catch (error: any) {
    console.error("POST /api/leads error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
