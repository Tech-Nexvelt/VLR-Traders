// ============================================================
// VLR Traders — Enquiries Settings Store (Postgres via Drizzle)
// ============================================================

import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { enquirySettings } from "@/lib/db/schema";
import { siteConfig } from "@/config/site";

export interface EnquiriesSettings {
  whatsappNumber: string;
  whatsappDisplay: string;
  secondaryWhatsapp?: string;
  notificationEmail: string;
  defaultMessageTemplate: string;
  productMessageTemplate: string;
  autoRedirectToWhatsApp: boolean;
  autoRedirectDelaySeconds: number;
  requirePhone: boolean;
  saveLeadsToDatabase: boolean;
  successMessageText: string;
}

const SINGLETON_ID = "singleton";

export const DEFAULT_ENQUIRIES_SETTINGS: EnquiriesSettings = {
  whatsappNumber: siteConfig.whatsapp,
  whatsappDisplay: siteConfig.whatsappDisplay,
  secondaryWhatsapp: siteConfig.phones[0]?.raw || "+919912821118",
  notificationEmail: siteConfig.email,
  defaultMessageTemplate: "Hi, I am interested in your services from VLR Traders website.",
  productMessageTemplate: "Hi, I am interested in [Product Name] from VLR Traders website.",
  autoRedirectToWhatsApp: true,
  autoRedirectDelaySeconds: 1,
  requirePhone: true,
  saveLeadsToDatabase: true,
  successMessageText: "Your enquiry has been received. Our team will contact you shortly.",
};

/** Get enquiries settings from the database (or default) */
export async function getEnquiriesSettings(): Promise<EnquiriesSettings> {
  try {
    const [row] = await db
      .select()
      .from(enquirySettings)
      .where(eq(enquirySettings.id, SINGLETON_ID))
      .limit(1);
    if (!row) return DEFAULT_ENQUIRIES_SETTINGS;
    return { ...DEFAULT_ENQUIRIES_SETTINGS, ...(row.data as Partial<EnquiriesSettings>) };
  } catch (error) {
    console.error("Error reading enquiry settings:", error);
    return DEFAULT_ENQUIRIES_SETTINGS;
  }
}

/** Save updated enquiries settings */
export async function saveEnquiriesSettings(updates: Partial<EnquiriesSettings>): Promise<EnquiriesSettings> {
  const current = await getEnquiriesSettings();
  const updated: EnquiriesSettings = {
    ...current,
    ...updates,
    whatsappNumber: updates.whatsappNumber
      ? updates.whatsappNumber.replace(/[^+\d]/g, "")
      : current.whatsappNumber,
  };

  await db
    .insert(enquirySettings)
    .values({ id: SINGLETON_ID, data: updated, updatedAt: new Date() })
    .onConflictDoUpdate({
      target: enquirySettings.id,
      set: { data: updated, updatedAt: new Date() },
    });

  return updated;
}
