import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { qpProfiles } from "@/lib/db/quotation-pro";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Please enter both email and password." },
        { status: 400 }
      );
    }

    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
          },
        },
      }
    );

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error || !data.user) {
      return NextResponse.json({ success: false, error: "Invalid email or password." }, { status: 401 });
    }

    const websiteCompanyId = process.env.WEBSITE_COMPANY_ID;
    const [profile] = await db
      .select({
        id: qpProfiles.id,
        fullName: qpProfiles.fullName,
        email: qpProfiles.email,
        companyId: qpProfiles.companyId,
        status: qpProfiles.status,
      })
      .from(qpProfiles)
      .where(eq(qpProfiles.userId, data.user.id))
      .limit(1);

    const isAuthorized = profile && profile.companyId === websiteCompanyId && profile.status === "active";

    if (!isAuthorized) {
      await supabase.auth.signOut();
      return NextResponse.json(
        { success: false, error: "This account is not authorized for the VLR Traders admin panel." },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      user: { email: profile.email, name: profile.fullName },
      message: "Login successful.",
    });
  } catch (error) {
    console.error("Admin auth error:", error);
    return NextResponse.json(
      { success: false, error: "Authentication failed. Please try again." },
      { status: 500 }
    );
  }
}
