// ============================================================
// VLR Traders — Lead & Enquiry Type Definitions
// ============================================================

export type LeadSource = "form" | "product" | "catalog" | "call" | "whatsapp";

export type LeadStatus = "New" | "Contacted" | "In Progress" | "Closed" | "Converted";

export interface Lead {
  id: string;
  name: string;
  phone: string;
  message?: string;
  product?: string;
  productId?: string | null;
  source: LeadSource;
  timestamp: string; // ISO 8601 string e.g. "2026-09-12T08:00:00.000Z"
  status: LeadStatus;
}

/** Input payload when submitting a lead form */
export interface CreateLeadInput {
  name: string;
  phone: string;
  message?: string;
  product?: string;
  productId?: string | null;
  source: LeadSource;
}

/** Input payload when updating lead status */
export interface UpdateLeadStatusInput {
  id: string;
  status: LeadStatus;
}

// Retain Enquiry alias for backward compatibility
export type Enquiry = Lead;
export type EnquiryStatus = LeadStatus;
export type CreateEnquiryInput = CreateLeadInput;
export type UpdateEnquiryStatusInput = UpdateLeadStatusInput;
