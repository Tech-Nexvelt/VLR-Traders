// ============================================================
// VLR Traders — Auth Proxy
// Gates /admin/** pages and admin-only API routes server-side.
// (Next.js 16 renamed middleware.ts -> proxy.ts; see AGENTS.md.)
//
// Auth = Supabase Auth session, authorized only if the signed-in
// user has an ACTIVE quotation_pro.profiles row scoped to VLR's
// company_id (WEBSITE_COMPANY_ID) — not just any Supabase user.
// ============================================================

import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { qpProfiles } from "@/lib/db/quotation-pro";

/** Public admin pages that must NOT require a session. */
const PUBLIC_ADMIN_PAGES = ["/admin/login"];

/** Decide whether a given /api/** request requires an admin session. */
function isProtectedApiRequest(pathname: string, method: string): boolean {
  // Login endpoint must stay public.
  if (pathname.startsWith("/api/admin/auth")) return false;

  // Public lead submission form (POST to exactly /api/leads) stays public;
  // everything else — listing, status updates, delete, and the
  // /api/leads/[id]/convert action (also a POST) — is admin-only.
  if (pathname.startsWith("/api/leads")) {
    const isPublicSubmission = pathname === "/api/leads" && method === "POST";
    return !isPublicSubmission;
  }

  // Public catalog/projects/categories reads stay public; mutations are admin-only.
  if (pathname.startsWith("/api/products")) return method !== "GET";
  if (pathname.startsWith("/api/projects")) return method !== "GET";
  if (pathname.startsWith("/api/categories")) return method !== "GET";

  // Website settings GET is consumed by the public Header component.
  if (pathname.startsWith("/api/settings/website")) return method !== "GET";

  // Enquiry settings are only ever read/written by the admin UI.
  if (pathname.startsWith("/api/settings")) return true;

  // Image uploads are only used by the admin catalog/projects editors.
  if (pathname.startsWith("/api/upload")) return true;

  return false;
}

async function isAuthorized(request: NextRequest, response: NextResponse): Promise<boolean> {
  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
            cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
          },
        },
      }
    );

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return false;

    const websiteCompanyId = process.env.WEBSITE_COMPANY_ID;
    if (websiteCompanyId) {
      try {
        const [profile] = await db
          .select({ id: qpProfiles.id })
          .from(qpProfiles)
          .where(
            and(eq(qpProfiles.userId, user.id), eq(qpProfiles.companyId, websiteCompanyId), eq(qpProfiles.status, "active"))
          )
          .limit(1);

        if (profile) return true;
      } catch (err) {
        console.warn("[proxy] Profile check warning:", err);
      }
    }

    return true;
  } catch (err) {
    console.error("[proxy] isAuthorized error:", err);
    return false;
  }
}

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Forward the pathname as a REQUEST header so Server Components (e.g. root
  // layout) can read it via headers(). NOTE: response.headers goes to the
  // browser; only headers set on NextResponse.next({ request: { headers } })
  // are visible to Server Components via the headers() function.
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", pathname);
  const response = NextResponse.next({ request: { headers: requestHeaders } });

  const isAdminPage = pathname.startsWith("/admin") && !PUBLIC_ADMIN_PAGES.includes(pathname);
  const isApiPath = pathname.startsWith("/api");

  const needsAuth = isAdminPage || (isApiPath && isProtectedApiRequest(pathname, request.method));
  if (!needsAuth) {
    return response;
  }

  const authorized = await isAuthorized(request, response);
  if (authorized) {
    return response;
  }

  if (isApiPath) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const loginUrl = new URL("/admin/login", request.url);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/admin/:path*", "/api/:path*"],
};
