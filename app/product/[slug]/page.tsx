import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllProducts } from "@/lib/products-store";
import { siteConfig } from "@/config/site";
import ProductDetailClient from "./ProductDetailClient";

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

// ── SSG: Pre-render all product detail pages at build time ─────
export async function generateStaticParams() {
  const products = await getAllProducts();
  return products.map((p) => ({
    slug: p.slug,
  }));
}

// ── DYNAMIC METADATA ──────────────────────────────────────────
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const products = await getAllProducts();
  const product = products.find((p) => p.slug === slug);

  if (!product) {
    return {
      title: `Product Not Found — ${siteConfig.name}`,
    };
  }

  const title = `${product.name} | ${product.categoryName} — ${siteConfig.name}`;
  const description = `${product.description}${product.brand ? ` By ${product.brand}.` : ""} Contact VLR Traders for pricing and availability.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${siteConfig.url}/product/${product.slug}`,
      siteName: siteConfig.name,
      images: [
        {
          url: product.images[0],
          width: 800,
          height: 600,
          alt: product.name,
        },
      ],
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [product.images[0]],
    },
  };
}

// ── SERVER PAGE COMPONENT ──────────────────────────────────────
export default async function ProductDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const products = await getAllProducts();
  const productIndex = products.findIndex((p) => p.slug === slug);

  if (productIndex === -1) {
    notFound();
  }

  const product = products[productIndex];
  const prevProduct = productIndex > 0 ? products[productIndex - 1] : null;
  const nextProduct = productIndex < products.length - 1 ? products[productIndex + 1] : null;

  return (
    <main>
      <ProductDetailClient
        product={product}
        prevProduct={prevProduct ? { slug: prevProduct.slug, name: prevProduct.name } : null}
        nextProduct={nextProduct ? { slug: nextProduct.slug, name: nextProduct.name } : null}
      />
    </main>
  );
}
