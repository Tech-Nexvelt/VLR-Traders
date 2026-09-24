"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { siteConfig } from "@/config/site";
import { getWhatsAppUrl } from "@/lib/whatsapp";
import GooeyNav from "@/components/ui/GooeyNav";
import { useWebsiteSettings } from "@/hooks/useWebsiteSettings";
import styles from "./Header.module.css";

// ── WhatsApp icon (inline SVG) ────────────────────────────────
function WhatsAppIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
    </svg>
  );
}

// ── Menu / Close icons ────────────────────────────────────────
function MenuIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

// ── Component ─────────────────────────────────────────────────
export default function Header() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { settings } = useWebsiteSettings();
  const drawerRef = useRef<HTMLDivElement>(null);

  const businessName = settings?.business_name || settings?.name || siteConfig.name;
  const logoUrl = settings?.logo_url || settings?.logoUrl || "/logo.jpg";
  const whatsappNumber = settings?.whatsapp_number || settings?.whatsappNumber;

  // Detect scroll for elevated header style
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close menu on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  // Close menu on outside click
  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (drawerRef.current && !drawerRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [menuOpen]);

  // Prevent body scroll when drawer is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  const activeNavIndex = Math.max(
    0,
    siteConfig.nav.findIndex((item) => isActive(item.href))
  );

  return (
    <>
      <header
        className={`${styles.header} ${scrolled ? styles.scrolled : ""}`}
        id="site-header"
      >
        <div className={`container ${styles.inner}`}>
          {/* ── Logo ──────────────────────────────────────── */}
          <Link href="/" className={styles.logo} aria-label={`${businessName} — Home`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={logoUrl}
              alt={businessName}
              width={44}
              height={44}
              className={styles.logoImage}
              style={{ objectFit: "contain" }}
            />
            <span className={styles.logoName}>
              {businessName}
            </span>
          </Link>

          {/* ── Desktop Nav ───────────────────────────────── */}
          <nav className={styles.desktopNav} aria-label="Main navigation">
            <div className={styles.gooeyNavWrap}>
              <GooeyNav
                items={siteConfig.nav}
                initialActiveIndex={activeNavIndex}
                particleDistances={[24, 6]}
                particleR={40}
              />
            </div>
          </nav>

          {/* ── CTA + Hamburger ───────────────────────────── */}
          <div className={styles.actions}>
            <a
              href={getWhatsAppUrl(undefined, whatsappNumber)}
              target="_blank"
              rel="noopener noreferrer"
              className={`btn btn-whatsapp btn-sm ${styles.ctaBtn}`}
              id="header-whatsapp-cta"
            >
              <WhatsAppIcon size={15} />
              WhatsApp Now
            </a>

            <button
              className={styles.hamburger}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              aria-controls="mobile-drawer"
              onClick={() => setMenuOpen((v) => !v)}
              id="mobile-menu-toggle"
            >
              {menuOpen ? <CloseIcon /> : <MenuIcon />}
            </button>
          </div>
        </div>
      </header>

      {/* ── Mobile Drawer Overlay ──────────────────────────── */}
      {menuOpen && (
        <div
          className={styles.overlay}
          aria-hidden="true"
          onClick={() => setMenuOpen(false)}
        />
      )}

      {/* ── Mobile Drawer ─────────────────────────────────── */}
      <div
        id="mobile-drawer"
        ref={drawerRef}
        className={`${styles.drawer} ${menuOpen ? styles.drawerOpen : ""}`}
        aria-hidden={!menuOpen}
        role="dialog"
        aria-label="Mobile navigation"
      >
        <nav aria-label="Mobile navigation">
          <ul className={styles.drawerList} role="list">
            {siteConfig.nav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`${styles.drawerLink} ${isActive(item.href) ? styles.drawerLinkActive : ""}`}
                  aria-current={isActive(item.href) ? "page" : undefined}
                  tabIndex={menuOpen ? 0 : -1}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className={styles.drawerFooter}>
          <a
            href={getWhatsAppUrl(undefined, whatsappNumber)}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-whatsapp"
            tabIndex={menuOpen ? 0 : -1}
            id="mobile-drawer-whatsapp-cta"
          >
            <WhatsAppIcon size={16} />
            WhatsApp Now
          </a>
        </div>
      </div>
    </>
  );
}
