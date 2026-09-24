import { NextResponse } from "next/server";
import { getProductBySlugOrId, updateProduct, deleteProduct } from "@/lib/products-store";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/products/[id] — Fetch single product
export async function GET(req: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const product = await getProductBySlugOrId(id);

    if (!product) {
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, product });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch product" },
      { status: 500 }
    );
  }
}

// PUT or PATCH /api/products/[id] — Update product details or status
export async function PATCH(req: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await req.json();

    const updated = await updateProduct(id, body);

    if (!updated) {
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      product: updated,
      message: "Product updated successfully",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update product" },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request, ctx: RouteParams) {
  return PATCH(req, ctx);
}

// DELETE /api/products/[id] — Delete product
export async function DELETE(req: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const deleted = await deleteProduct(id);

    if (!deleted) {
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to delete product" },
      { status: 500 }
    );
  }
}
