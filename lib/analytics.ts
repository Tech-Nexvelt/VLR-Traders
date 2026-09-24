// ============================================================
// lib/analytics.ts — Event Tracking Helper
// ============================================================

export interface AnalyticsEvent {
  event: string;
  category?: string;
  action?: string;
  label?: string;
  value?: number;
  params?: Record<string, any>;
}

export function trackEvent(name: string, data?: Record<string, any>) {
  if (typeof window !== "undefined") {
    // Console logging in dev for verification
    if (process.env.NODE_ENV === "development") {
      console.log(`[Analytics Event] ${name}:`, data);
    }

    // Push to window.dataLayer if Google Tag Manager or GA4 is configured
    (window as any).dataLayer = (window as any).dataLayer || [];
    (window as any).dataLayer.push({
      event: name,
      ...data,
      timestamp: new Date().toISOString(),
    });
  }
}

export function trackWhatsAppClick(productName: string, productCategory: string, selectedVariants?: Record<string, string>) {
  trackEvent("whatsapp_enquiry_click", {
    product_name: productName,
    product_category: productCategory,
    variants: selectedVariants || {},
  });
}

export function trackCallClick(productName: string, productCategory: string) {
  trackEvent("call_now_click", {
    product_name: productName,
    product_category: productCategory,
  });
}
