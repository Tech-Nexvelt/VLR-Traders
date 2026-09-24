import { NextResponse } from "next/server";
import { getWebsiteSettings, saveWebsiteSettings } from "@/lib/website-settings-store";

// GET /api/settings/website — Fetch site settings
export async function GET() {
  try {
    const settings = await getWebsiteSettings();
    return NextResponse.json({ success: true, settings });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch website settings" },
      { status: 500 }
    );
  }
}

// POST or PATCH /api/settings/website — Save site settings
export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!body.name || !body.name.trim()) {
      return NextResponse.json(
        { success: false, error: "Business name is required" },
        { status: 400 }
      );
    }

    const updated = await saveWebsiteSettings(body);

    return NextResponse.json({
      success: true,
      settings: updated,
      message: "Website settings saved successfully",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to save website settings" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  return POST(req);
}
