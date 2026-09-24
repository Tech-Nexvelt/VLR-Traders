import type { Metadata } from "next";
import { Clock, UserCheck, Ruler, Phone, MessageSquare, Mail, MapPin, ArrowRight } from "lucide-react";
import LeadEnquiryForm from "@/components/enquiry/LeadEnquiryForm";
import { siteConfig } from "@/config/site";
import styles from "./contact.module.css";

export const metadata: Metadata = {
  title: `Contact Us — Get a Custom Quote | ${siteConfig.name}`,
  description:
    "Have a project in mind? Contact VLR Traders for expert guidance, product catalogues, and instant WhatsApp quote support.",
};

export default function ContactPage() {
  return (
    <div className={styles.page}>
      {/* ── PAGE TITLE ─────────────────────────────────────────── */}
      <section className={styles.heroSection}>
        <div className={styles.heroContainer}>
          <span className={styles.heroTagline}>GET IN TOUCH</span>
          <h1 className={styles.heroTitle}>Let’s Build Your Vision Together</h1>
          <p className={styles.heroSubtext}>
            Have a project in mind? Get in touch with our team for expert advice, product details, or a custom quote.
          </p>

          <div className={styles.valuePropsGrid}>
            <div className={styles.valuePropCard}>
              <div className={styles.valuePropIcon}>
                <Clock size={20} color="#0d9488" />
              </div>
              <div>
                <h4 className={styles.valuePropTitle}>Quick Response</h4>
                <p className={styles.valuePropDesc}>Within 1 business day</p>
              </div>
            </div>

            <div className={styles.valuePropCard}>
              <div className={styles.valuePropIcon}>
                <UserCheck size={20} color="#1b4f8a" />
              </div>
              <div>
                <h4 className={styles.valuePropTitle}>Expert Guidance</h4>
                <p className={styles.valuePropDesc}>From product specialists</p>
              </div>
            </div>

            <div className={styles.valuePropCard}>
              <div className={styles.valuePropIcon}>
                <Ruler size={20} color="#0d9488" />
              </div>
              <div>
                <h4 className={styles.valuePropTitle}>Custom Solutions</h4>
                <p className={styles.valuePropDesc}>Tailored to your project</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── MAIN CONTENT GRID ─────────────────────────────────── */}
      <div className={styles.contentContainer}>
        <div className={styles.mainGrid}>
          {/* LEFT: CONTACT DETAILS & SHOWROOM INFO */}
          <div className={styles.infoColumn}>
            <div className={styles.infoCard}>
              <h2 className={styles.infoCardTitle}>Direct Contact Channels</h2>
              <div className={styles.contactList}>
                {/* Phone Numbers */}
                <div className={styles.contactItem}>
                  <div className={styles.iconCircle}>
                    <Phone size={20} color="#1b4f8a" />
                  </div>
                  <div>
                    <span className={styles.contactLabel}>Call Our Sales Team</span>
                    {siteConfig.phones.map((phone, i) => (
                      <a key={i} href={`tel:${phone.raw}`} className={styles.contactValue}>
                        {phone.display} ({phone.label})
                      </a>
                    ))}
                    <p className={styles.contactSubText}>Mon – Sat, 9:00 AM to 8:00 PM IST</p>
                  </div>
                </div>

                {/* WhatsApp */}
                <div className={styles.contactItem}>
                  <div className={styles.iconCircle}>
                    <MessageSquare size={20} color="#0d9488" />
                  </div>
                  <div>
                    <span className={styles.contactLabel}>Instant WhatsApp Enquiry</span>
                    <a
                      href={`https://wa.me/${siteConfig.whatsapp.replace(/[^+\d]/g, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.contactValue}
                    >
                      {siteConfig.whatsappDisplay}
                    </a>
                    <p className={styles.contactSubText}>24/7 automated &amp; quick live response</p>
                  </div>
                </div>

                {/* Email */}
                <div className={styles.contactItem}>
                  <div className={styles.iconCircle}>
                    <Mail size={20} color="#1b4f8a" />
                  </div>
                  <div>
                    <span className={styles.contactLabel}>Email Us</span>
                    <a href={`mailto:${siteConfig.email}`} className={styles.contactValue}>
                      {siteConfig.email}
                    </a>
                    <p className={styles.contactSubText}>Send project drawings &amp; RFP docs</p>
                  </div>
                </div>
              </div>
            </div>

            {/* SHOWROOM LOCATION */}
            <div className={styles.mapCard}>
              <div className={styles.mapHeader}>
                <h3 className={styles.mapTitle}>Showroom &amp; Warehouse</h3>
                <a
                  href="https://maps.google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.getDirectionsBtn}
                  style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem" }}
                >
                  Get Directions <ArrowRight size={14} />
                </a>
              </div>
              <div className={styles.mapPlaceholder}>
                <span className={styles.mapIcon} style={{ display: "flex", justifyContent: "center", marginBottom: "0.5rem" }}>
                  <MapPin size={32} color="#0d9488" />
                </span>
                <p><strong>VLR Traders Main Showroom</strong></p>
                <p style={{ fontSize: "0.8125rem", color: "#94a3b8", margin: "0.25rem 0 0" }}>
                  {siteConfig.address}
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT: LEAD CAPTURE FORM (MOCKUP #1) */}
          <div>
            <LeadEnquiryForm
              source="form"
              tagline="SEND US A MESSAGE"
              title="Request a Quote"
              subtitle="Fill in your details and our team will get back to you shortly."
              submitButtonText="Submit Enquiry →"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
