import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { qpProfiles } from "@/lib/db/quotation-pro";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 });
  }

  let profileData = {
    fullName: user.user_metadata?.full_name || user.email?.split("@")[0] || "Admin",
    email: user.email || "",
    role: "admin",
  };

  try {
    const [profile] = await db
      .select({ fullName: qpProfiles.fullName, email: qpProfiles.email, role: qpProfiles.role })
      .from(qpProfiles)
      .where(eq(qpProfiles.userId, user.id))
      .limit(1);

    if (profile) {
      profileData = {
        fullName: profile.fullName || profileData.fullName,
        email: profile.email || profileData.email,
        role: profile.role || profileData.role,
      };
    }
  } catch (err) {
    console.warn("Error reading qpProfiles in /api/admin/auth/me:", err);
  }

  return NextResponse.json({ success: true, profile: profileData });
}
