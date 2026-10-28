// ============================================================
// VLR Traders — Site Configuration
// Single source of truth for all site-wide constants.
// ============================================================

export const siteConfig = {
  name: "VLR Traders",
  url: "https://vlrtraders.com",
  tagline: "Plywood, Hardware & Locks from Trusted Brands",
  shortTagline: "Quality Materials. Affordable Pricing.",

  // ── Contact ───────────────────────────────────────────────
  // Both numbers shown for "Call Now"
  phones: [
    { raw: "+919912821118", display: "+91 99128 21118", label: "Sales" },
    { raw: "+919618560405", display: "+91 96185 60405", label: "Support" },
  ],
  // Single WhatsApp number
  whatsapp: "+919618560405",
  whatsappDisplay: "+91 96185 60405",
  email: "info@vlrtraders.com",
  address: "VLR Traders, 18-16-126/1/1A Housing Board TO, Ensanpally Rd, Siddipet, Telangana 502103",

  // ── WhatsApp prefilled message ────────────────────────────
  whatsappDefaultMessage:
    "Hi, I am interested in your products from VLR Traders",

  // ── Social ────────────────────────────────────────────────
  social: {
    whatsapp: "https://wa.me/919618560405",
    instagram: "https://www.instagram.com/vlr.traders/",
    linkedin: "https://linkedin.com/company/vlrtraders",
  },

  // ── Navigation ────────────────────────────────────────────
  nav: [
    { label: "Home",     href: "/" },
    { label: "Catalog",  href: "/catalog" },
    { label: "Projects", href: "/projects" },
    { label: "About",    href: "/about" },
    { label: "Contact",  href: "/contact" },
  ],

  // ── SEO Defaults ─────────────────────────────────────────
  seo: {
    title: "VLR Traders — Plywood, Hardware & Locks",
    description:
      "VLR Traders supplies quality plywood & boards, hardware, and locks from trusted brands like Century, Hettich, and Godrej — affordable pricing, strong service support.",
    keywords: [
      "plywood",
      "plywood dealers Siddipet",
      "plywood suppliers Telangana",
      "hardware",
      "cabinet hardware",
      "door locks",
      "architectural locks",
      "Century plywood",
      "Sylvan plywood",
      "Vanam plywood",
      "Hettich hardware",
      "Simor hardware",
      "Nimmi hardware",
      "Godrej locks",
      "Europa locks",
      "waterproof plywood",
      "termite proof plywood",
      "modular kitchen materials",
      "interior materials supplier",
      "construction hardware supplier",
      "VLR Traders",
      "Siddipet",
      "Telangana",
      "Hyderabad",
    ],
  },
} as const;

export type SiteConfig = typeof siteConfig;
