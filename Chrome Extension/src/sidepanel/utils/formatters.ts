import { Lead } from '../../types/lead';
import { cleanAddress } from '../../content/normalizer';

/**
 * Returns a strictly cleansed address for display.
 * Strips raw Maps search repetition like "Holland Center 3.9(1,800)Shopping mall".
 */
export function getDisplayAddress(lead: Lead): string | null {
  if (!lead.address) return null;
  const cleaned = cleanAddress(lead.address, lead.businessName, lead.category);
  return cleaned || null;
}

/**
 * Detects if a phone number is eligible for WhatsApp messaging (standard Bangladesh mobile or international).
 */
export function isWhatsAppEligible(phone?: string | null): boolean {
  if (!phone) return false;
  const digits = phone.replace(/[^\d]/g, '');
  // BD mobile: 013-019 (11 digits) or 88013-88019 (13 digits)
  if (/^01[3-9]\d{8}$/.test(digits)) return true;
  if (/^8801[3-9]\d{8}$/.test(digits)) return true;
  // Generic international mobile with 10-15 digits
  if (digits.length >= 10 && digits.length <= 15 && !digits.startsWith('02')) return true;
  return false;
}

/**
 * Returns WhatsApp direct link url
 */
export function getWhatsAppDirectUrl(phone?: string | null, message?: string): string | null {
  if (!phone) return null;
  let digits = phone.replace(/[^\d]/g, '');
  if (digits.startsWith('01') && digits.length === 11) {
    digits = `88${digits}`;
  }
  if (!digits) return null;
  const base = `https://wa.me/${digits}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}
