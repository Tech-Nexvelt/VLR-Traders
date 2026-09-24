import { NextResponse } from "next/server";
import { getEnquiriesSettings, saveEnquiriesSettings } from "@/lib/settings-store";

// GET /api/settings/enquiries — Fetch settings
export async function GET() {
  try {
    const settings = await getEnquiriesSettings();
    return NextResponse.json({ success: true, settings });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch enquiries settings" },
      { status: 500 }
    );
  }
}

// POST or PATCH /api/settings/enquiries — Save settings
export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!body.whatsappNumber || !body.whatsappNumber.trim()) {
      return NextResponse.json(
        { success: false, error: "WhatsApp number is required" },
        { status: 400 }
      );
    }

    const updated = await saveEnquiriesSettings(body);

    return NextResponse.json({
      success: true,
      settings: updated,
      message: "Enquiries settings saved successfully",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to save settings" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  return POST(req);
}
