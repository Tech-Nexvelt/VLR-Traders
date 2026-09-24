// ============================================================
// VLR Traders — Leads Data Store (Postgres via Drizzle)
// ============================================================

import { and, desc, eq, gt, sql } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { leads } from "@/lib/db/schema";
import { qpCustomers } from "@/lib/db/quotation-pro";
import type { Lead, CreateLeadInput, LeadStatus } from "@/types/enquiry";

function toLead(row: typeof leads.$inferSelect): Lead {
  return {
    id: row.id,
    name: row.name,
    phone: row.phone,
    message: row.message,
    product: row.product,
    productId: row.productId,
    source: row.source as Lead["source"],
    timestamp: row.timestamp.toISOString(),
    status: row.status as LeadStatus,
  };
}

export async function getAllLeads(): Promise<Lead[]> {
  try {
    const rows = await db.select().from(leads).orderBy(desc(leads.timestamp));
    return rows.map(toLead);
  } catch (err) {
    console.error("[LeadsStore] Failed to read leads:", err);
    return [];
  }
}

/** Anti-spam rate limiting: Prevent submission if same phone number submitted within 30 sec */
export async function isDuplicateSubmission(phone: string): Promise<boolean> {
  const cleanPhone = phone.replace(/\D/g, "");
  if (!cleanPhone) return false;

  const cutoff = new Date(Date.now() - 30_000);

  const recent = await db
    .select({ id: leads.id })
    .from(leads)
    .where(and(gt(leads.timestamp, cutoff), sql`regexp_replace(${leads.phone}, '\D', '', 'g') = ${cleanPhone}`))
    .limit(1);

  return recent.length > 0;
}

export async function saveLead(
  input: CreateLeadInput
): Promise<{ success: boolean; lead?: Lead; error?: string }> {
  const name = input.name?.trim();
  const phone = input.phone?.trim();

  if (!name) {
    return { success: false, error: "Name is required." };
  }
  if (!phone) {
    return { success: false, error: "Phone number is required." };
  }

  const digitCount = phone.replace(/\D/g, "").length;
  if (digitCount < 7) {
    return { success: false, error: "Please enter a valid phone number." };
  }

  if (await isDuplicateSubmission(phone)) {
    return {
      success: false,
      error: "An enquiry with this phone number was recently submitted. Please wait a moment before trying again.",
    };
  }

  const newLead = {
    id: `lead_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    name,
    phone,
    message: input.message?.trim() || "",
    product: input.product?.trim() || "",
    productId: input.productId ?? null,
    source: input.source || "form",
    status: "New" as LeadStatus,
    timestamp: new Date(),
  };

  try {
    const [row] = await db.insert(leads).values(newLead).returning();
    return { success: true, lead: toLead(row) };
  } catch (err) {
    console.error("[LeadsStore] Failed to save lead:", err);
    return { success: false, error: "Database storage error. Please try again." };
  }
}

export async function updateLeadStatus(id: string, status: LeadStatus): Promise<Lead | null> {
  const [row] = await db.update(leads).set({ status }).where(eq(leads.id, id)).returning();
  return row ? toLead(row) : null;
}

export async function deleteLead(id: string): Promise<boolean> {
  const deleted = await db.delete(leads).where(eq(leads.id, id)).returning({ id: leads.id });
  return deleted.length > 0;
}

export async function getLeadById(id: string): Promise<Lead | null> {
  const [row] = await db.select().from(leads).where(eq(leads.id, id)).limit(1);
  return row ? toLead(row) : null;
}

/**
 * Converts a website lead into a quotation_pro.customers row (scoped to
 * WEBSITE_COMPANY_ID) and marks the lead "Converted". Idempotent: refuses
 * to run twice on the same lead.
 */
export async function convertLeadToCustomer(
  id: string,
  convertedByProfileId: string | null
): Promise<{ success: boolean; customerId?: string; error?: string }> {
  const websiteCompanyId = process.env.WEBSITE_COMPANY_ID;
  if (!websiteCompanyId) {
    return { success: false, error: "WEBSITE_COMPANY_ID is not configured." };
  }

  const lead = await getLeadById(id);
  if (!lead) {
    return { success: false, error: "Lead not found." };
  }
  if (lead.status === "Converted") {
    return { success: false, error: "This lead has already been converted." };
  }

  const noteParts = [
    `Converted from website lead ${lead.id} (source: ${lead.source}).`,
    lead.product ? `Interested in: ${lead.product}.` : null,
    lead.message ? `Message: ${lead.message}` : null,
  ].filter(Boolean);

  const [customer] = await db
    .insert(qpCustomers)
    .values({
      id: crypto.randomUUID(),
      companyId: websiteCompanyId,
      name: lead.name,
      phone: lead.phone,
      notes: noteParts.join(" "),
      status: "active",
      version: 1,
      createdBy: convertedByProfileId,
      createdAt: new Date(),
    })
    .returning({ id: qpCustomers.id });

  await db.update(leads).set({ status: "Converted" }).where(eq(leads.id, id));

  return { success: true, customerId: customer.id };
}
