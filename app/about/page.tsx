import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Building2, Zap, ShieldCheck, Tag, Truck, MessageSquare, ArrowRight } from "lucide-react";
import { siteConfig } from "@/config/site";
import { getWhatsAppUrl } from "@/lib/whatsapp";
import styles from "./about.module.css";

export const metadata: Metadata = {
  title: `About Us — Trusted Interior Material Partner | ${siteConfig.name}`,
  description:
    "Learn about VLR Traders — our commitment to quality plywood, hardware, and locks for contractors, builders, and interior designers.",
};

export default function AboutPage() {
  return (
    <div className={styles.page}>
      {/* ══════════════════════════════════════════════════════
          ABOUT HERO SECTION
      ══════════════════════════════════════════════════════ */}
      <section className={styles.heroSection}>
        <div className={styles.heroContainer}>
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className={styles.breadcrumbNav}>
            <ol className={styles.breadcrumbList}>
              <li>
                <Link href="/" className={styles.breadcrumbLink}>Home</Link>
              </li>
              <li className={styles.breadcrumbSep}>/</li>
              <li className={styles.breadcrumbCurrent} aria-current="page">About Us</li>
            </ol>
          </nav>

          {/* Eyebrow */}
          <span className={styles.eyebrowBadge}>
            <Building2 size={15} color="#0d9488" /> Trusted B2B Interior Material Supplier
          </span>

          {/* Title & Subtext */}
          <h1 className={styles.heroTitle}>
            Powering Modern Interiors With{" "}
            <span className={styles.titleHighlight}>Quality &amp; Reliability</span>
          </h1>

          <p className={styles.heroSubtext}>
            VLR Traders is a premier B2B supplier of plywood, architectural hardware, and locks.
            We partner with contractors, interior designers, and builders to supply top-tier materials on time.
          </p>

          {/* Stats Bar */}
          <div className={styles.statsGrid}>
            <div className={styles.statItem}>
              <span className={styles.statNumber}>15+ Years</span>
              <span className={styles.statLabel}>Industry Trust</span>
            </div>
            <div className={styles.statDivider} />
            <div className={styles.statItem}>
              <span className={styles.statNumber}>1000+</span>
              <span className={styles.statLabel}>Products Supplied</span>
            </div>
            <div className={styles.statDivider} />
            <div className={styles.statItem}>
              <span className={styles.statNumber}>100+</span>
              <span className={styles.statLabel}>Active Contractors</span>
            </div>
            <div className={styles.statDivider} />
            <div className={styles.statItem}>
              <span className={styles.statNumber} style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem" }}>
                <Zap size={20} color="#0d9488" /> 24/7
              </span>
              <span className={styles.statLabel}>WhatsApp Support</span>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          STORY & MISSION SECTION
      ══════════════════════════════════════════════════════ */}
      <section className={styles.section}>
        <div className="container">
          <div className={styles.gridTwoCol}>
            <div>
              <span className={styles.sectionLabel}>OUR MISSION</span>
              <h2 className={styles.sectionTitle}>Built for Contractors, Architects &amp; Builders</h2>
              <p className={styles.paragraph}>
                At VLR Traders, we believe every interior project deserves materials that match design vision with structural perfection. We bridge the gap between world-class manufacturers—such as Century, Sylvan, Hettich, and Godrej—and commercial &amp; residential project execution.
              </p>
              <p className={styles.paragraph}>
                Whether you need boiling waterproof marine plywood, soft-close cabinet hardware, or heavy-duty digital locks, our catalog is curated for durability, transparent pricing, and immediate dispatch.
              </p>
              <div style={{ marginTop: "1.5rem" }}>
                <a
                  href={getWhatsAppUrl("Hello VLR Traders! I would like to learn more about partnering with you for interior material sourcing.")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary btn-lg"
                  style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem" }}
                >
                  Partner With Us on WhatsApp <ArrowRight size={18} />
                </a>
              </div>
            </div>

            <div style={{ position: "relative", width: "100%", aspectRatio: "4/3", borderRadius: "1rem", overflow: "hidden", boxShadow: "0 20px 40px -15px rgba(0,0,0,0.15)" }}>
              <Image
                src="/hero_kitchen.jpg"
                alt="VLR Traders Materials Showcase"
                fill
                style={{ objectFit: "cover" }}
              />
            </div>
          </div>

          {/* ══════════════════════════════════════════════════════
              CORE VALUE PILLARS
          ══════════════════════════════════════════════════════ */}
          <div style={{ marginTop: "4rem" }}>
            <span className={styles.sectionLabel} style={{ textAlign: "center" }}>WHY VLR TRADERS</span>
            <h2 className={styles.sectionTitle} style={{ textAlign: "center" }}>Our Core Promises</h2>

            <div className={styles.valuesGrid}>
              <div className={styles.valueCard}>
                <div className={styles.valueIcon}>
                  <ShieldCheck size={20} color="#1b4f8a" />
                </div>
                <h3 className={styles.valueTitle}>Guaranteed Quality</h3>
                <p className={styles.valueDesc}>
                  100% genuine plywood and hardware sourced directly from certified brand distributors.
                </p>
              </div>

              <div className={styles.valueCard}>
                <div className={styles.valueIcon}>
                  <Tag size={20} color="#0d9488" />
                </div>
                <h3 className={styles.valueTitle}>Wholesale Pricing</h3>
                <p className={styles.valueDesc}>
                  Transparent wholesale rate structure for bulk orders, contractors, and interior designers.
                </p>
              </div>

              <div className={styles.valueCard}>
                <div className={styles.valueIcon}>
                  <Truck size={20} color="#1b4f8a" />
                </div>
                <h3 className={styles.valueTitle}>Fast Dispatch</h3>
                <p className={styles.valueDesc}>
                  Express fulfillment and scheduled job site deliveries across Hyderabad and regional hubs.
                </p>
              </div>

              <div className={styles.valueCard}>
                <div className={styles.valueIcon}>
                  <MessageSquare size={20} color="#0d9488" />
                </div>
                <h3 className={styles.valueTitle}>WhatsApp First</h3>
                <p className={styles.valueDesc}>
                  Direct line of communication with material specialists for rapid quotes and stock updates.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
