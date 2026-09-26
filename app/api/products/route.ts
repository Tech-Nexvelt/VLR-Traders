import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { parseProductImages, createProduct } from "@/lib/products-store";

// GET /api/products — Basic fetch test on website.products
export async function GET() {
  try {
    const supabase = createSupabaseServerClient();

    const { data, error } = await supabase
      .schema("website")
      .from("products")
      .select("*");

    console.log("PRODUCTS DATA:", data);
    console.log("PRODUCTS ERROR:", error);

    if (error) {
      console.error("API ERROR:", error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    const products = (data || []).map((row: any) => ({
      id: row.id,
      slug: row.slug,
      name: row.name,
      categoryId: row.category_id || row.categoryId,
      categoryName: "Uncategorized",
      brand: row.brand || "",
      material: row.material ?? undefined,
      finish: row.finish ?? undefined,
      status: row.status || "Active",
      images: parseProductImages(row.images),
      documents: row.documents || [],
      description: row.description || "",
      longDescription: row.long_description || row.description || "",
      badge: row.badge ?? undefined,
      featured: Boolean(row.featured),
      createdAt: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString(),
    }));

    return NextResponse.json(
      {
        success: true,
        count: products.length,
        products,
        data: data || [],
      },
      {
        headers: {
          "Cache-Control": "public, max-age=10, s-maxage=60, stale-while-revalidate=3600",
        },
      }
    );
  } catch (error: any) {
    console.error("GET /api/products Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch products" },
      { status: 500 }
    );
  }
}

// POST /api/products — Create new product
export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!body.name || !body.name.trim()) {
      return NextResponse.json(
        { success: false, error: "Product name is required" },
        { status: 400 }
      );
    }
    if (!body.categoryId) {
      return NextResponse.json(
        { success: false, error: "Category is required" },
        { status: 400 }
      );
    }
    if (!body.brand || !body.brand.trim()) {
      return NextResponse.json(
        { success: false, error: "Brand is required" },
        { status: 400 }
      );
    }

    const newProduct = await createProduct({
      name: body.name,
      categoryId: body.categoryId,
      brand: body.brand,
      material: body.material || undefined,
      finish: body.finish || undefined,
      description: body.description || "",
      longDescription: body.longDescription || "",
      status: body.status || "Active",
      images: Array.isArray(body.images) && body.images.length > 0 ? body.images : ["/hero_kitchen.jpg"],
      documents: Array.isArray(body.documents) ? body.documents : [],
      badge: body.badge,
      featured: body.featured ?? false,
    });

    return NextResponse.json({
      success: true,
      product: newProduct,
      message: "Product created successfully",
    });
  } catch (error: any) {
    console.error("POST /api/products Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create product" },
      { status: 500 }
    );
  }
}
