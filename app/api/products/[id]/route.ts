import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getProductBySlugOrId, updateProduct, deleteProduct } from "@/lib/products-store";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/products/[id] — Fetch single product
export async function GET(req: Request, { params }: RouteParams) {
  try {
    const { id: productId } = await params;
    console.log("Product ID:", productId);

    const product = await getProductBySlugOrId(productId);

    if (!product) {
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, product });
  } catch (error: any) {
    console.error("GET /api/products/[id] error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch product" },
      { status: 500 }
    );
  }
}

// PATCH /api/products/[id] — Update product without company_id filter
export async function PATCH(req: Request, { params }: RouteParams) {
  try {
    const { id: productId } = await params;
    const body = await req.json();
    console.log("Product ID:", productId);

    const supabase = createSupabaseServerClient();

    const payload: Record<string, any> = {};
    if (body.name !== undefined) payload.name = body.name.trim();
    if (body.slug !== undefined) payload.slug = body.slug.trim();
    if (body.categoryId !== undefined) payload.category_id = body.categoryId;
    if (body.brand !== undefined) payload.brand = body.brand.trim();
    if (body.material !== undefined) payload.material = body.material ? body.material.trim() : null;
    if (body.finish !== undefined) payload.finish = body.finish ? body.finish.trim() : null;
    if (body.description !== undefined) payload.description = body.description.trim();
    if (body.longDescription !== undefined) payload.long_description = body.longDescription.trim();
    if (body.status !== undefined) payload.status = body.status;
    if (body.images && Array.isArray(body.images)) payload.images = body.images;
    if (body.documents && Array.isArray(body.documents)) payload.documents = body.documents;
    if (body.badge !== undefined) payload.badge = body.badge || null;
    if (body.featured !== undefined) payload.featured = body.featured;

    const { data, error } = await supabase
      .schema("website")
      .from("products")
      .update(payload)
      .eq("id", productId)
      .select("*")
      .single();

    if (error) {
      console.error("Supabase UPDATE product error:", error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    const updatedProduct = await updateProduct(productId, body);

    return NextResponse.json({
      success: true,
      product: updatedProduct || data,
      message: "Product updated successfully",
    });
  } catch (err: any) {
    console.error("PATCH /api/products/[id] Exception:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to update product" },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request, ctx: RouteParams) {
  return PATCH(req, ctx);
}

// DELETE /api/products/[id] — Delete product without company_id filter
export async function DELETE(req: Request, { params }: RouteParams) {
  try {
    const { id: productId } = await params;
    console.log("Product ID:", productId);

    const supabase = createSupabaseServerClient();

    const { error } = await supabase
      .schema("website")
      .from("products")
      .delete()
      .eq("id", productId);

    if (error) {
      console.error("Supabase DELETE product error:", error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    await deleteProduct(productId);

    return NextResponse.json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (err: any) {
    console.error("DELETE /api/products/[id] Exception:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to delete product" },
      { status: 500 }
    );
  }
}
