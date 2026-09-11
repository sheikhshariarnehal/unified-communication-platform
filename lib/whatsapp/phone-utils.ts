/**
 * Sanitize phone number for Meta WhatsApp API.
 * Meta requires digits only — no + prefix, no spaces, no dashes.
 * e.g. "+880 1711-123456" → "8801711123456"
 */
export function sanitizePhoneForMeta(phone: string): string {
  if (!phone) return "";
  let digits = phone.replace(/\D/g, "");
  // Common normalization: if starts with 01 (e.g. Bangladesh domestic), prepend 88
  if (digits.startsWith("01") && digits.length === 11) {
    digits = "88" + digits;
  }
  return digits;
}

export function normalizePhone(phone: string): string {
  if (!phone) return "";
  return phone.replace(/\D/g, "");
}

export function phonesMatch(phone1: string, phone2: string): boolean {
  const n1 = normalizePhone(phone1);
  const n2 = normalizePhone(phone2);
  if (n1 === n2) return true;
  if (n1.length >= 8 && n2.length >= 8) {
    return n1.slice(-8) === n2.slice(-8);
  }
  return false;
}

export function isValidE164(phone: string): boolean {
  const sanitized = sanitizePhoneForMeta(phone);
  return /^[1-9]\d{6,14}$/.test(sanitized);
}

export function phoneVariants(sanitized: string): string[] {
  if (!sanitized) return [];
  const seen = new Set<string>();
  const push = (v: string) => {
    if (v && !seen.has(v)) seen.add(v);
  };

  // 1. Original
  push(sanitized);

  // 2. Insert a 0 after plausible country code
  for (const ccLen of [1, 2, 3]) {
    if (sanitized.length <= ccLen) continue;
    const cc = sanitized.slice(0, ccLen);
    const rest = sanitized.slice(ccLen);
    if (!rest.startsWith("0")) {
      push(cc + "0" + rest);
    }
  }

  // 3. Remove leading 0 after plausible country code
  for (const ccLen of [1, 2, 3]) {
    if (sanitized.length <= ccLen + 1) continue;
    const cc = sanitized.slice(0, ccLen);
    const rest = sanitized.slice(ccLen);
    if (rest.startsWith("0")) {
      push(cc + rest.slice(1));
    }
  }

  return [...seen];
}

export function isRecipientNotAllowedError(errorMessage: string): boolean {
  return (
    errorMessage.includes("131030") ||
    errorMessage.toLowerCase().includes("not in allowed list") ||
    errorMessage.toLowerCase().includes("recipient phone number not in allowed")
  );
}
