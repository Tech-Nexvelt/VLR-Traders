// ============================================================
// VLR Traders — Drizzle schema for the `website` Postgres schema
// (This DB is SHARED with Quotation Pro — see lib/db/quotation-pro.ts
// for read/write access to that product's `quotation_pro` schema.
// Nothing here is ever migrated into `quotation_pro` or `public`.)
// ============================================================

import { pgSchema, text, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";

export const websiteSchema = pgSchema("website");

export const categories = websiteSchema.table("categories", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const leads = websiteSchema.table("leads", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  message: text("message").notNull().default(""),
  product: text("product").notNull().default(""),
  // References products.id — nullable since general enquiries aren't
  // always tied to one specific product.
  productId: text("product_id"),
  source: text("source").notNull(), // "form" | "product" | "catalog" | "call" | "whatsapp"
  status: text("status").notNull().default("New"), // "New" | "Contacted" | "In Progress" | "Closed" | "Converted"
  timestamp: timestamp("timestamp", { withTimezone: true }).notNull().defaultNow(),
});

export const products = websiteSchema.table("products", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  categoryId: text("category_id").notNull(),
  brand: text("brand").notNull().default(""),
  material: text("material"), // optional — doesn't apply to hardware/locks
  finish: text("finish"), // optional — doesn't apply to hardware/locks
  status: text("status").notNull().default("Active"), // "Active" | "Inactive"
  images: jsonb("images").$type<string[]>().notNull().default([]),
  // Planner sheets, spec sheets, catalogues (PDFs) attached to this product.
  documents: jsonb("documents").$type<{ name: string; url: string }[]>().notNull().default([]),
  description: text("description").notNull().default(""),
  longDescription: text("long_description").notNull().default(""),
  badge: text("badge"), // "Premium" | "Popular" | "Bestseller" | "New" | null
  featured: boolean("featured").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const projects = websiteSchema.table("projects", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  name: text("name"),
  category: text("category").notNull(),
  location: text("location").notNull(),
  client: text("client"),
  area: text("area"),
  completionDate: text("completion_date"),
  description: text("description").notNull().default(""),
  images: jsonb("images").$type<string[]>().notNull().default([]),
  featured: boolean("featured").notNull().default(true),
  status: text("status").notNull().default("Completed"), // "Completed" | "In Progress"
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

/** Singleton row (id = "singleton") holding the full EnquiriesSettings object. */
export const enquirySettings = websiteSchema.table("enquiry_settings", {
  id: text("id").primaryKey(),
  data: jsonb("data").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

/** Singleton row (id = "singleton") holding the full WebsiteSettings object. */
export const websiteSettings = websiteSchema.table("website_settings", {
  id: text("id").primaryKey(),
  data: jsonb("data").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});
