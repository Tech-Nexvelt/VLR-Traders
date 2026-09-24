// ============================================================
// VLR Traders — Read/write access to the EXISTING `quotation_pro` schema
// This schema is owned and managed by the Quotation Pro product.
// These table definitions describe tables that already exist in
// production — this file is intentionally NOT referenced by
// drizzle.config.ts, so `drizzle-kit generate/push/migrate` never
// generates or applies DDL against it. Only query/insert/update here,
// never create/alter/drop.
// ============================================================

import { pgSchema, uuid, varchar, text, timestamp, integer } from "drizzle-orm/pg-core";

export const quotationProSchema = pgSchema("quotation_pro");

export const qpCompanies = quotationProSchema.table("companies", {
  id: uuid("id").primaryKey(),
  companyName: varchar("company_name").notNull(),
  workspaceSlug: varchar("workspace_slug").notNull(),
  email: varchar("email").notNull(),
  phone: varchar("phone"),
});

export const qpProfiles = quotationProSchema.table("profiles", {
  id: uuid("id").primaryKey(),
  userId: uuid("user_id"),
  companyId: uuid("company_id").notNull(),
  fullName: varchar("full_name").notNull(),
  email: varchar("email").notNull(),
  role: varchar("role"),
  status: varchar("status"),
});

export const qpCustomers = quotationProSchema.table("customers", {
  id: uuid("id").primaryKey(),
  companyId: uuid("company_id").notNull(),
  name: varchar("name").notNull(),
  email: varchar("email"),
  phone: varchar("phone"),
  companyName: varchar("company_name"),
  address: text("address"),
  notes: text("notes"),
  status: varchar("status"),
  version: integer("version").notNull(),
  createdBy: uuid("created_by"),
  createdAt: timestamp("created_at", { withTimezone: true }),
});
