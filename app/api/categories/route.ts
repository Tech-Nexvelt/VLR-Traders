import { NextResponse } from "next/server";
import { getCategoriesWithCoverImage, createCategory } from "@/lib/categories-store";

// GET /api/categories — list all categories (with coverImage derived from products)
export async function GET() {
  try {
    const categories = await getCategoriesWithCoverImage();
    return NextResponse.json({ success: true, categories });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}

// POST /api/categories — create a new category
export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body.name || !body.name.trim()) {
      return NextResponse.json(
        { success: false, error: "Category name is required" },
        { status: 400 }
      );
    }

    const category = await createCategory(body.name, body.imageUrl);
    return NextResponse.json({ success: true, category, message: "Category created successfully" });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create category" },
      { status: 500 }
    );
  }
}
