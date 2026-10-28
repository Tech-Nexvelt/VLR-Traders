import type { Metadata } from "next";
import { Suspense } from "react";
import CatalogClient from "./CatalogClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Product Catalog — Plywood, Hardware & Locks | VLR Traders",
  description:
    "Browse VLR Traders' full range of plywood & boards, hardware, and locks — quality materials, affordable pricing, WhatsApp-first support.",
  keywords: [
    "plywood catalog",
    "hardware catalog",
    "locks catalog",
    "Century plywood price",
    "Hettich hardware price",
    "Godrej locks price",
    "interior design materials",
    "modular wardrobe materials",
    "false ceiling materials",
    "wall paneling",
    "VLR Traders Siddipet",
  ],
};

export default function CatalogPage() {
  return (
    <Suspense fallback={null}>
      <CatalogClient />
    </Suspense>
  );
}
