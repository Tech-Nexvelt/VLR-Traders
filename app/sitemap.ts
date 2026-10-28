import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";
import { getAllProducts } from "@/lib/products-store";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = siteConfig.url;

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: baseUrl, changeFrequency: "weekly", priority: 1 },
    { url: `${baseUrl}/catalog`, changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/projects`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${baseUrl}/about`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/contact`, changeFrequency: "monthly", priority: 0.6 },
  ];

  let productRoutes: MetadataRoute.Sitemap = [];
  try {
    const products = await getAllProducts();
    productRoutes = products.map((product) => ({
      url: `${baseUrl}/product/${product.slug}`,
      lastModified: product.createdAt ? new Date(product.createdAt) : undefined,
      changeFrequency: "weekly",
      priority: 0.8,
    }));
  } catch {
    // Data store unavailable at build time — fall back to static routes only.
  }

  return [...staticRoutes, ...productRoutes];
}
