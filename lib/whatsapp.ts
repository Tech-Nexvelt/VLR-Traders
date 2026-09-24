// ============================================================
// VLR Traders — WhatsApp Message & URL Generator
// Dynamic template interpolation & wa.me deep-linking
// ============================================================

import { siteConfig } from "@/config/site";

export interface GenerateWhatsAppMessageOptions {
  product?: string;
  message?: string;
  name?: string;
  phone?: string;
  defaultTemplate?: string;
  productTemplate?: string;
}

/**
 * Builds the dynamic WhatsApp message applying template rules.
 *
 * Placeholders supported:
 * - [Product Name]
 * - [Requirement]
 * - [User Name]
 * - [Phone]
 */
export function buildWhatsAppMessage(options: GenerateWhatsAppMessageOptions = {}): string {
  const { product, message, name, phone, defaultTemplate, productTemplate } = options;

  let text = "";

  if (product && product.trim()) {
    const template = productTemplate || "Hi, I am interested in [Product Name] from VLR Traders website.";
    text = template.replace(/\[Product Name\]/gi, product.trim());
  } else {
    text = defaultTemplate || "Hi, I am interested in your services from VLR Traders website.";
  }

  if (message && message.trim()) {
    text += ` Requirement: ${message.trim()}`;
  }

  if (name && name.trim()) {
    text += `\n\nName: ${name.trim()}`;
    if (phone && phone.trim()) {
      text += ` | Phone: ${phone.trim()}`;
    }
  }

  return text;
}

/**
 * Generates a wa.me deep-link with a prefilled message.
 */
export function getWhatsAppUrl(
  input?: string | GenerateWhatsAppMessageOptions,
  customNumber?: string
): string {
  const number = customNumber ? customNumber.replace(/[^+\d]/g, "") : siteConfig.whatsapp;

  let messageText = "";

  if (typeof input === "string") {
    if (input.startsWith("Hi,")) {
      messageText = input;
    } else if (input) {
      messageText = buildWhatsAppMessage({ product: input });
    } else {
      messageText = buildWhatsAppMessage();
    }
  } else if (input && typeof input === "object") {
    messageText = buildWhatsAppMessage(input);
  } else {
    messageText = buildWhatsAppMessage();
  }

  return `https://wa.me/${number}?text=${encodeURIComponent(messageText)}`;
}

/**
 * Generates a tel: link for a phone number.
 */
export function getCallUrl(rawPhone?: string): string {
  const num = rawPhone || siteConfig.whatsapp;
  return `tel:${num.replace(/[^+\d]/g, "")}`;
}
