// ============================================================
// VLR Traders — Enquiry Store (localStorage-based)
// Easily swappable for a database / API layer later.
// ============================================================

import type {
  Enquiry,
  CreateEnquiryInput,
  UpdateEnquiryStatusInput,
} from "@/types/enquiry";

const STORAGE_KEY = "vlr_enquiries";

// ── Helpers ──────────────────────────────────────────────────

function generateId(): string {
  return `enq_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

function readAll(): Enquiry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Enquiry[]) : [];
  } catch {
    return [];
  }
}

function writeAll(enquiries: Enquiry[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(enquiries));
}

// ── Public API ────────────────────────────────────────────────

/**
 * Save a new enquiry.
 * @returns The full Enquiry object (with auto-generated id, timestamp, status).
 */
export function saveEnquiry(input: CreateEnquiryInput): Enquiry {
  const enquiry: Enquiry = {
    id: generateId(),
    timestamp: new Date().toISOString(),
    status: "New",
    ...input,
  };
  const all = readAll();
  writeAll([enquiry, ...all]);
  return enquiry;
}

/**
 * Retrieve all stored enquiries, sorted newest first.
 */
export function getEnquiries(): Enquiry[] {
  return readAll().sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
}

/**
 * Retrieve a single enquiry by id.
 */
export function getEnquiryById(id: string): Enquiry | undefined {
  return readAll().find((e) => e.id === id);
}

/**
 * Update the status of an existing enquiry.
 * @returns The updated Enquiry, or undefined if not found.
 */
export function updateEnquiryStatus(
  input: UpdateEnquiryStatusInput
): Enquiry | undefined {
  const all = readAll();
  const index = all.findIndex((e) => e.id === input.id);
  if (index === -1) return undefined;

  all[index] = { ...all[index], status: input.status };
  writeAll(all);
  return all[index];
}

/**
 * Delete an enquiry by id.
 */
export function deleteEnquiry(id: string): boolean {
  const all = readAll();
  const filtered = all.filter((e) => e.id !== id);
  if (filtered.length === all.length) return false;
  writeAll(filtered);
  return true;
}

/**
 * Clear all enquiries. Use with caution (admin only).
 */
export function clearAllEnquiries(): void {
  writeAll([]);
}
