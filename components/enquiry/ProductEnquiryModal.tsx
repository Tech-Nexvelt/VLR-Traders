"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import type { LeadSource, Lead } from "@/types/enquiry";
import LeadEnquiryForm from "./LeadEnquiryForm";
import styles from "./lead-modal.module.css";

export interface ProductEnquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  productName?: string;
  productId?: string | null;
  productImage?: string;
  productSubtitle?: string;
  source?: LeadSource;
  onSuccess?: (lead: Lead) => void;
}

export default function ProductEnquiryModal({
  isOpen,
  onClose,
  productName,
  productId,
  productImage,
  productSubtitle,
  source = "product",
  onSuccess,
}: ProductEnquiryModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen || !mounted) return null;

  // Use React Portal to render modal directly at body level, escaping card overflow/transforms
  return createPortal(
    <div className={styles.overlay} onClick={onClose} role="dialog" aria-modal="true">
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          className={styles.closeBtn}
          onClick={onClose}
          aria-label="Close modal"
        >
          <X size={18} />
        </button>

        <LeadEnquiryForm
          source={source}
          productName={productName}
          productId={productId}
          productImage={productImage}
          productSubtitle={productSubtitle}
          isWhatsAppStyle={true}
          onSuccess={(lead) => {
            if (onSuccess) onSuccess(lead);
          }}
        />
      </div>
    </div>,
    document.body
  );
}
