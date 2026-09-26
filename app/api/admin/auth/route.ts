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
      process.env.PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_ANON_KEY!,
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
      return NextResponse.json(
        { success: false, error: error?.message || "Invalid email or password." },
        { status: 401 }
      );
    }

    let userFullName = data.user.user_metadata?.full_name || data.user.email?.split("@")[0] || "Admin";

    const websiteCompanyId = process.env.WEBSITE_COMPANY_ID;
    if (websiteCompanyId) {
      try {
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

        if (profile) {
          if (profile.companyId !== websiteCompanyId || profile.status !== "active") {
            await supabase.auth.signOut();
            return NextResponse.json(
              { success: false, error: "This account is not authorized for the VLR Traders admin panel." },
              { status: 403 }
            );
          }
          if (profile.fullName) {
            userFullName = profile.fullName;
          }
        }
      } catch (dbErr) {
        console.warn("[auth] Profile check warning:", dbErr);
      }
    }

    return NextResponse.json({
      success: true,
      user: { email: data.user.email, name: userFullName },
      message: "Login successful.",
    });
  } catch (error: any) {
    console.error("Admin auth error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Authentication failed. Please try again." },
      { status: 500 }
    );
  }
}
