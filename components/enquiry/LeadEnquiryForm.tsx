"use client";

import { useState } from "react";
import { AlertCircle, ShieldCheck, Check } from "lucide-react";
import type { LeadSource, Lead } from "@/types/enquiry";
import { getWhatsAppUrl } from "@/lib/whatsapp";
import { trackWhatsAppClick } from "@/lib/analytics";
import styles from "./lead-form.module.css";

export interface LeadEnquiryFormProps {
  source: LeadSource;
  productName?: string;
  productId?: string | null;
  productImage?: string;
  productSubtitle?: string;
  title?: string;
  subtitle?: string;
  tagline?: string;
  submitButtonText?: string;
  isWhatsAppStyle?: boolean;
  onSuccess?: (lead: Lead) => void;
}

export default function LeadEnquiryForm({
  source,
  productName,
  productId,
  productImage,
  productSubtitle,
  title = "Request a Quote",
  subtitle = "Fill in your details and our team will get back to you shortly.",
  tagline = "Send us a message",
  submitButtonText = "Submit Enquiry →",
  isWhatsAppStyle = false,
  onSuccess,
}: LeadEnquiryFormProps) {
  // Form fields state
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState(
    productName ? `I'm interested in ${productName}. Please share more details including pricing and availability.` : ""
  );

  // Validation & status state
  const [errors, setErrors] = useState<{ name?: string; phone?: string }>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [whatsappUrl, setWhatsappUrl] = useState<string>("");

  // Input validation helper
  const validate = () => {
    const newErrors: { name?: string; phone?: string } = {};

    if (!name.trim()) {
      newErrors.name = "Please enter your name";
    }

    const cleanPhone = phone.trim().replace(/\D/g, "");
    if (!phone.trim()) {
      newErrors.phone = "Please enter your phone number";
    } else if (cleanPhone.length < 7 || cleanPhone.length > 15) {
      newErrors.phone = "Please enter valid phone number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    if (!validate()) return;

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim(),
          message: message.trim(),
          product: productName || undefined,
          productId: productId ?? undefined,
          source,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setServerError(data.error || "Something went wrong. Please try again.");
        setIsSubmitting(false);
        return;
      }

      // Success logic
      const waUrl = data.whatsappUrl || getWhatsAppUrl({
        product: productName,
        message: message.trim(),
        name: name.trim(),
        phone: phone.trim(),
      });

      setWhatsappUrl(waUrl);
      setIsSuccess(true);
      setIsSubmitting(false);

      if (onSuccess && data.lead) {
        onSuccess(data.lead);
      }

      // Analytics tracking
      trackWhatsAppClick(productName || "General Service Enquiry", source);

      // Auto-open WhatsApp in a new tab after submission
      if (typeof window !== "undefined") {
        setTimeout(() => {
          window.open(waUrl, "_blank", "noopener,noreferrer");
        }, 600);
      }
    } catch (err) {
      console.error("Lead form submission error:", err);
      setServerError("Something went wrong. Please try again.");
      setIsSubmitting(false);
    }
  };

  // Direct WhatsApp click handler (fallback/secondary button)
  const handleDirectWhatsAppClick = () => {
    const directUrl = getWhatsAppUrl({
      product: productName,
      message: message.trim(),
      name: name.trim() || undefined,
      phone: phone.trim() || undefined,
    });
    trackWhatsAppClick(productName || "Direct WhatsApp Enquiry", source);
    window.open(directUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <div className={styles.formContainer}>
      {!isSuccess ? (
        <>
          {/* FORM HEADER */}
          {productName ? (
            <div className={styles.productContextCard}>
              {productImage && (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={productImage} alt={productName} className={styles.productThumb} />
              )}
              <div className={styles.productContextMeta}>
                <span className={styles.enquiringLabel}>Enquiring about:</span>
                <span className={styles.productContextName}>{productName}</span>
                {productSubtitle && <span className={styles.productContextSub}>{productSubtitle}</span>}
              </div>
            </div>
          ) : (
            <div className={styles.formHeader}>
              {tagline && <span className={styles.tagline}>{tagline}</span>}
              <h2 className={styles.formTitle}>{title}</h2>
              {subtitle && <p className={styles.formSubTitle}>{subtitle}</p>}
            </div>
          )}

          {/* SERVER ERROR ALERT */}
          {serverError && (
            <div className={styles.alertError} role="alert" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <AlertCircle size={16} /> {serverError}
            </div>
          )}

          {/* FORM */}
          <form className={styles.form} onSubmit={handleSubmit} noValidate>
            {/* NAME FIELD */}
            <div className={styles.fieldGroup}>
              <label className={styles.label} htmlFor="lead-name">
                Name <span className={styles.requiredStar}>*</span>
              </label>
              <div className={styles.inputWrapper}>
                <svg className={styles.fieldIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                <input
                  id="lead-name"
                  type="text"
                  className={`${styles.input} ${errors.name ? styles.inputError : ""}`}
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
                  }}
                  disabled={isSubmitting}
                  required
                />
              </div>
              {errors.name && (
                <span className={styles.errorMessage} style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem" }}>
                  <AlertCircle size={13} /> {errors.name}
                </span>
              )}
            </div>

            {/* PHONE FIELD */}
            <div className={styles.fieldGroup}>
              <label className={styles.label} htmlFor="lead-phone">
                Phone <span className={styles.requiredStar}>*</span>
              </label>
              <div className={styles.inputWrapper}>
                <svg className={styles.fieldIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.16 6.16l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
                <input
                  id="lead-phone"
                  type="tel"
                  className={`${styles.input} ${errors.phone ? styles.inputError : ""}`}
                  placeholder="Enter your phone number"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    if (errors.phone) setErrors((prev) => ({ ...prev, phone: undefined }));
                  }}
                  disabled={isSubmitting}
                  required
                />
              </div>
              {errors.phone && (
                <span className={styles.errorMessage} style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem" }}>
                  <AlertCircle size={13} /> {errors.phone}
                </span>
              )}
            </div>

            {/* MESSAGE FIELD */}
            <div className={styles.fieldGroup}>
              <label className={styles.label} htmlFor="lead-message">
                Message <span className={styles.optionalText}>(Optional)</span>
              </label>
              <textarea
                id="lead-message"
                className={`${styles.input} ${styles.inputNoIcon} ${styles.textarea}`}
                placeholder="Tell us about your project or requirements..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                disabled={isSubmitting}
                rows={3}
              />
            </div>

            {/* SUBMIT BUTTON */}
            <button
              type="submit"
              className={`${styles.submitBtn} ${isWhatsAppStyle ? styles.whatsappSubmitBtn : ""}`}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span>Submitting...</span>
              ) : isWhatsAppStyle ? (
                <>
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414-.074-.124-.272-.198-.57-.347z" />
                  </svg>
                  <span>Send & Continue to WhatsApp</span>
                </>
              ) : (
                <span>{submitButtonText}</span>
              )}
            </button>

            {/* DIVIDER & DIRECT WHATSAPP OPTION (MOCKUP #1) */}
            {!isWhatsAppStyle && (
              <>
                <div className={styles.dividerRow}>
                  <div className={styles.dividerLine} />
                  <span>or</span>
                  <div className={styles.dividerLine} />
                </div>

                <button
                  type="button"
                  className={styles.secondaryWaBtn}
                  onClick={handleDirectWhatsAppClick}
                >
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414-.074-.124-.272-.198-.57-.347z" />
                  </svg>
                  <span>Chat on WhatsApp</span>
                </button>
                <p className={styles.waSubNote}>Get faster response on WhatsApp</p>
              </>
            )}

            <div className={styles.privacyBadge} style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem" }}>
              <ShieldCheck size={14} color="#0d9488" /> Your details are safe with us. No spam guarantee.
            </div>
          </form>
        </>
      ) : (
        /* SUCCESS STATE VIEW (MOCKUP #3) */
        <div className={styles.successContainer}>
          <div className={styles.successCheckCircle} style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Check size={28} />
          </div>
          <h2 className={styles.successTitle}>Your enquiry has been received!</h2>
          <p className={styles.successDesc}>
            Thank you for getting in touch. Our team will review your request and connect with you shortly.
          </p>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.whatsappRedirectBtn}
          >
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414-.074-.124-.272-.198-.57-.347z" />
            </svg>
            <span>Continue to WhatsApp →</span>
          </a>

          {/* WHAT HAPPENS NEXT CARD */}
          <div className={styles.nextStepsCard}>
            <h3 className={styles.nextStepsTitle}>What happens next?</h3>
            <div className={styles.stepList}>
              <div className={styles.stepItem}>
                <span className={styles.stepNum}>1</span>
                <p className={styles.stepText}>Our team will review your enquiry details</p>
              </div>
              <div className={styles.stepItem}>
                <span className={styles.stepNum}>2</span>
                <p className={styles.stepText}>We&apos;ll share product specifications and custom pricing</p>
              </div>
              <div className={styles.stepItem}>
                <span className={styles.stepNum}>3</span>
                <p className={styles.stepText}>Continue the conversation on WhatsApp for faster support</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
