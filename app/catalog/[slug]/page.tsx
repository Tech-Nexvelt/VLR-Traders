import { redirect } from "next/navigation";
import { getAllProducts } from "@/lib/products-store";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export const dynamic = "force-dynamic";

export default async function CatalogSlugPage({ params }: PageProps) {
  const { slug } = await params;
  redirect(`/product/${slug}`);
}
