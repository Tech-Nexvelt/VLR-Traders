import type { Metadata } from "next";
import { Suspense } from "react";
import CatalogClient from "./CatalogClient";

export const metadata: Metadata = {
  title: "Product Catalog — Plywood, Hardware & Locks | VLR Traders",
  description:
    "Browse VLR Traders' full range of plywood & boards, hardware, and locks — quality materials, affordable pricing, WhatsApp-first support.",
};

export default function CatalogPage() {
  return (
    <Suspense fallback={null}>
      <CatalogClient />
    </Suspense>
  );
}
