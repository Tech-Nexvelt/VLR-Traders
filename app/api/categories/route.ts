import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = createSupabaseServerClient();

    const { data, error } = await supabase
      .schema("website")
      .from("categories")
      .select("*");

    console.log("CATEGORIES DATA:", data);
    console.log("CATEGORIES ERROR:", error);

    if (error) {
      console.error("API ERROR:", error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    const categories = (data || []).map((cat: any) => ({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      imageUrl: cat.cover_image || cat.image_url || null,
      coverImage: cat.cover_image || cat.image_url || null,
    }));

    return NextResponse.json({ success: true, categories, data: data || [] });
  } catch (err: any) {
    console.error("GET /api/categories Exception:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to fetch categories" },
      { status: 500 }
    );
  }
}
