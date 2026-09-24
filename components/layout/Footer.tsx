"use client";

import React from "react";
import Link from "next/link";
import { siteConfig } from "@/config/site";
import { getWhatsAppUrl, getCallUrl } from "@/lib/whatsapp";
import { useWebsiteSettings } from "@/hooks/useWebsiteSettings";
import styles from "./Footer.module.css";

// ── Icon components ───────────────────────────────────────────

function WhatsAppIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.16 6.16l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}

function EmailIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <polyline points="2,4 12,13 22,4" />
    </svg>
  );
}

function MapPinIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

// ── Component ─────────────────────────────────────────────────
export default function Footer() {
  const year = new Date().getFullYear();
  const { settings } = useWebsiteSettings();

  const logoSrc = settings?.logo_url || settings?.logoUrl || "/logo.jpg";
  const businessName = settings?.business_name || settings?.name || siteConfig.name;
  const shortTagline = settings?.shortTagline || siteConfig.shortTagline;
  const instagramUrl = settings?.instagram || siteConfig.social.instagram;
  const linkedinUrl = settings?.linkedin || siteConfig.social.linkedin;
  const whatsappNumber = settings?.whatsapp_number || settings?.whatsappNumber;
  const whatsappUrl = getWhatsAppUrl(undefined, whatsappNumber);
  const phoneDisplay = settings?.phone || settings?.salesPhone || siteConfig.phones[0]?.display;
  const phoneRaw = (settings?.phone || settings?.salesPhone)
    ? (settings?.phone || settings?.salesPhone).replace(/\D/g, "")
    : siteConfig.phones[0]?.raw;
  const emailDisplay = settings?.email || siteConfig.email;
  const addressDisplay = settings?.address || siteConfig.address;

  return (
    <footer className={styles.footer} id="site-footer">
      <div className={`container ${styles.grid}`}>

        {/* ── Brand Column ────────────────────────────────── */}
        <div className={styles.brand}>
          <div className={styles.logoWrap}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={logoSrc}
              alt={businessName}
              style={{ maxHeight: "44px", width: "auto", objectFit: "contain" }}
              onError={(e) => {
                (e.target as HTMLImageElement).src = "/logo.jpg";
              }}
            />
          </div>
          <p className={styles.tagline}>{shortTagline}</p>
          <div className={styles.socials}>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`${styles.socialIcon} ${styles.socialWhatsapp}`}
              aria-label="WhatsApp"
            >
              <WhatsAppIcon />
            </a>
            <a
              href={instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`${styles.socialIcon} ${styles.socialInstagram}`}
              aria-label="Instagram"
            >
              <InstagramIcon />
            </a>
            <a
              href={linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`${styles.socialIcon} ${styles.socialLinkedIn}`}
              aria-label="LinkedIn"
            >
              <LinkedInIcon />
            </a>
          </div>
        </div>

        {/* ── Quick Links ──────────────────────────────────── */}
        <div className={styles.col}>
          <h3 className={styles.colTitle}>Quick Links</h3>
          <ul className={styles.linkList} role="list">
            {siteConfig.nav.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className={styles.footerLink}>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* ── Products ─────────────────────────────────────── */}
        <div className={styles.col}>
          <h3 className={styles.colTitle}>Products</h3>
          <ul className={styles.linkList} role="list">
            {[
              { label: "Plywood & Boards", href: "/catalog?categoryId=cat-plywood" },
              { label: "Hardware", href: "/catalog?categoryId=cat-hardware" },
              { label: "Locks", href: "/catalog?categoryId=cat-locks" },
              { label: "All Products", href: "/catalog" },
            ].map((item) => (
              <li key={item.label}>
                <Link href={item.href} className={styles.footerLink}>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* ── Contact ──────────────────────────────────────── */}
        <div className={styles.col}>
          <h3 className={styles.colTitle}>Get In Touch</h3>
          <ul className={styles.contactList} role="list">
            <li>
              <a href={getCallUrl(phoneRaw)} className={styles.contactItem}>
                <PhoneIcon />
                <span>{phoneDisplay}</span>
              </a>
            </li>
            <li>
              <a href={`mailto:${emailDisplay}`} className={styles.contactItem}>
                <EmailIcon />
                <span>{emailDisplay}</span>
              </a>
            </li>
            <li className={styles.contactItem}>
              <MapPinIcon />
              <span>{addressDisplay}</span>
            </li>
          </ul>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`btn btn-whatsapp btn-sm ${styles.waBtn}`}
            id="footer-whatsapp-cta"
          >
            <WhatsAppIcon />
            Chat on WhatsApp
          </a>
        </div>
      </div>

      {/* ── Bottom Bar ─────────────────────────────────────── */}
      <div className={styles.bottomBar}>
        <div className={`container ${styles.bottomInner}`}>
          <p className={styles.copyright}>
            &copy; {year} {businessName}. All rights reserved.
          </p>
          <p className={styles.legal}>
            {addressDisplay}
          </p>
        </div>
      </div>
    </footer>
  );
}
