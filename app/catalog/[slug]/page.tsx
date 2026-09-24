import { redirect } from "next/navigation";
import { getAllProducts } from "@/lib/products-store";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const products = await getAllProducts();
  return products.map((p) => ({ slug: p.slug }));
}

export default async function CatalogSlugPage({ params }: PageProps) {
  const { slug } = await params;
  redirect(`/product/${slug}`);
}
