import { NextResponse } from "next/server";
import { getAllProducts, createProduct } from "@/lib/products-store";

// GET /api/products — Get all products
export async function GET() {
  try {
    const products = await getAllProducts();
    return NextResponse.json(
      {
        success: true,
        count: products.length,
        products,
      },
      {
        headers: {
          "Cache-Control": "public, max-age=10, s-maxage=60, stale-while-revalidate=3600",
        },
      }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch products" },
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
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create product" },
      { status: 500 }
    );
  }
}
