// ============================================================
// VLR Traders — Website Settings Store (Postgres via Drizzle)
// Centralized Single Source of Truth for Global Website Content
// ============================================================

import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { websiteSettings } from "@/lib/db/schema";
import { siteConfig } from "@/config/site";

export interface WebsiteSettings {
  id: string;
  business_name: string;
  name: string;
  logo_url: string;
  logoUrl: string;
  phone: string;
  salesPhone: string;
  whatsapp_number: string;
  whatsappNumber: string;
  email: string;
  address: string;
  hero_title: string;
  heroTitle: string;
  hero_subtitle: string;
  heroSubtitle: string;
  hero_image_url: string;
  heroImageUrl: string;
  updated_at: string;
  updatedAt?: string | Date;

  tagline: string;
  shortTagline: string;
  faviconUrl: string;
  googleMapsUrl: string;
  workingHours: string;
  supportPhone: string;
  instagram: string;
  linkedin: string;
  facebook?: string;
  youtube?: string;
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;
  ogImage: string;
}

const SINGLETON_ID = "singleton";

export function normalizeWebsiteSettings(input: any = {}): WebsiteSettings {
  const businessName = input.business_name || input.name || siteConfig.name;
  const logo = input.logo_url || input.logoUrl || "/logo.jpg";
  const phone = input.phone || input.salesPhone || siteConfig.phones[0]?.display || "+91 99128 21118";
  const whatsapp = input.whatsapp_number || input.whatsappNumber || "919912821118";
  const heroTitle = input.hero_title || input.heroTitle || "Premium Plywood, Hardware & Architectural Locks";
  const heroSubtitle = input.hero_subtitle || input.heroSubtitle || "Your trusted partner for interior materials, high-grade hardware, and security solutions.";
  const heroImageUrl = input.hero_image_url || input.heroImageUrl || "/hero_kitchen.jpg";
  const updatedAtStr = input.updated_at || (input.updatedAt ? new Date(input.updatedAt).toISOString() : new Date().toISOString());

  return {
    id: "1",
    business_name: businessName,
    name: businessName,
    logo_url: logo,
    logoUrl: logo,
    phone: phone,
    salesPhone: phone,
    whatsapp_number: whatsapp,
    whatsappNumber: whatsapp,
    email: input.email || siteConfig.email,
    address: input.address || siteConfig.address,
    hero_title: heroTitle,
    heroTitle: heroTitle,
    hero_subtitle: heroSubtitle,
    heroSubtitle: heroSubtitle,
    hero_image_url: heroImageUrl,
    heroImageUrl: heroImageUrl,
    updated_at: updatedAtStr,
    updatedAt: updatedAtStr,

    tagline: input.tagline || siteConfig.tagline,
    shortTagline: input.shortTagline || siteConfig.shortTagline,
    faviconUrl: input.faviconUrl || "/favicon.ico",
    googleMapsUrl: input.googleMapsUrl || "https://maps.google.com",
    workingHours: input.workingHours || "Mon – Sat, 9:00 AM to 8:00 PM IST",
    supportPhone: input.supportPhone || siteConfig.phones[1]?.display || "+91 96185 60405",
    instagram: input.instagram || siteConfig.social.instagram,
    linkedin: input.linkedin || siteConfig.social.linkedin,
    facebook: input.facebook || "https://facebook.com/vlrtraders",
    youtube: input.youtube || "https://youtube.com/vlrtraders",
    seoTitle: input.seoTitle || siteConfig.seo.title,
    seoDescription: input.seoDescription || siteConfig.seo.description,
    seoKeywords: input.seoKeywords || siteConfig.seo.keywords.join(", "),
    ogImage: input.ogImage || heroImageUrl,
  };
}

export const DEFAULT_WEBSITE_SETTINGS: WebsiteSettings = normalizeWebsiteSettings({});

let settingsCache: { data: WebsiteSettings; timestamp: number } | null = null;
const CACHE_TTL = 30000; // 30 seconds

export function clearWebsiteSettingsCache() {
  settingsCache = null;
}

/** Get website settings from the database (or default) */
export async function getWebsiteSettings(): Promise<WebsiteSettings> {
  const now = Date.now();
  if (settingsCache && now - settingsCache.timestamp < CACHE_TTL) {
    return settingsCache.data;
  }
  try {
    const [row] = await db
      .select()
      .from(websiteSettings)
      .where(eq(websiteSettings.id, SINGLETON_ID))
      .limit(1);
    const data = !row ? DEFAULT_WEBSITE_SETTINGS : normalizeWebsiteSettings(row.data);
    settingsCache = { data, timestamp: now };
    return data;
  } catch (error) {
    console.error("Error reading website settings:", error);
    return settingsCache?.data ?? DEFAULT_WEBSITE_SETTINGS;
  }
}

/** Save updated website settings */
export async function saveWebsiteSettings(updates: Partial<WebsiteSettings>): Promise<WebsiteSettings> {
  const current = await getWebsiteSettings();
  const merged = { ...current, ...updates, updated_at: new Date().toISOString() };
  const normalized = normalizeWebsiteSettings(merged);

  await db
    .insert(websiteSettings)
    .values({ id: SINGLETON_ID, data: normalized, updatedAt: new Date() })
    .onConflictDoUpdate({
      target: websiteSettings.id,
      set: { data: normalized, updatedAt: new Date() },
    });

  clearWebsiteSettingsCache();
  return normalized;
}
