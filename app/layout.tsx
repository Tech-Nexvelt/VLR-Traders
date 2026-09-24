import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/styles/globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import WhatsAppFAB from "@/components/ui/WhatsAppFAB";
import MobileStickyBar from "@/components/ui/MobileStickyBar";
import { siteConfig } from "@/config/site";
import { headers } from "next/headers";
import { WebsiteSettingsProvider } from "@/hooks/useWebsiteSettings";

// ── Font ───────────────────────────────────────────────────────
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800"],
});

// ── Metadata ───────────────────────────────────────────────────
export const metadata: Metadata = {
  title: {
    default: siteConfig.seo.title,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.seo.description,
  keywords: [...siteConfig.seo.keywords],
  authors: [{ name: siteConfig.name }],
  creator: siteConfig.name,
  metadataBase: new URL("https://vlrtraders.com"),
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://vlrtraders.com",
    siteName: siteConfig.name,
    title: siteConfig.seo.title,
    description: siteConfig.seo.description,
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.seo.title,
    description: siteConfig.seo.description,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  icons: {
    icon: "/logo.jpg",
    shortcut: "/logo.jpg",
    apple: "/logo.jpg",
  },
};

// ── Root Layout ────────────────────────────────────────────────
export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Read the pathname forwarded by proxy.ts so we can hide the public website
  // chrome (Header, Footer, FABs) on all /admin/** routes.
  const headersList = await headers();
  const pathname = headersList.get("x-pathname") ?? "";
  const isAdminRoute = pathname.startsWith("/admin");

  return (
    <html lang="en" className={inter.variable}>
      <body suppressHydrationWarning>
        <WebsiteSettingsProvider>
          {/* Sticky navigation — hidden on admin routes */}
          {!isAdminRoute && <Header />}

          {/* Page content */}
          <main id="main-content" className={isAdminRoute ? "w-full max-w-full overflow-x-hidden" : "page-wrapper w-full max-w-full overflow-x-hidden"}>
            {children}
          </main>

          {/* Footer — hidden on admin routes */}
          {!isAdminRoute && <Footer />}

          {/* Floating WhatsApp button — hidden on admin routes */}
          {!isAdminRoute && <WhatsAppFAB />}

          {/* Mobile sticky bottom bar — hidden on admin routes */}
          {!isAdminRoute && <MobileStickyBar />}
        </WebsiteSettingsProvider>
      </body>
    </html>
  );
}
