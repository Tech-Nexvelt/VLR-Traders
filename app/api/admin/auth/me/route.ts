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

  const [profile] = await db
    .select({ fullName: qpProfiles.fullName, email: qpProfiles.email, role: qpProfiles.role })
    .from(qpProfiles)
    .where(eq(qpProfiles.userId, user.id))
    .limit(1);

  if (!profile) {
    return NextResponse.json({ success: false, error: "No profile found" }, { status: 404 });
  }

  return NextResponse.json({ success: true, profile });
}
