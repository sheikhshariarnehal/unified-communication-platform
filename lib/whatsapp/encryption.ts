import crypto from "crypto";

/**
 * WhatsApp token encryption using AES-256-GCM.
 * Format: `<iv-hex>:<ciphertext-hex>:<authTag-hex>`
 */

// Default fallback 64-hex key (32 bytes) if ENCRYPTION_KEY is not in env
const DEFAULT_ENCRYPTION_KEY =
  process.env.ENCRYPTION_KEY ||
  "e83a4bf91240cb1d0637f191b7d5bf295171761ef7639ce162ff7bd8b2a30bb9";

const GCM_IV_LENGTH = 12;
const CBC_IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;

function getKeyBuffer(): Buffer {
  const key = process.env.ENCRYPTION_KEY || DEFAULT_ENCRYPTION_KEY;
  if (key.length === 64) {
    return Buffer.from(key, "hex");
  }
  // If provided key is not 64 hex chars, hash it with SHA-256 to produce 32 bytes
  return crypto.createHash("sha256").update(key).digest();
}

export function encrypt(text: string): string {
  if (!text) return "";
  const key = getKeyBuffer();
  const iv = crypto.randomBytes(GCM_IV_LENGTH);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  const authTag = cipher.getAuthTag();
  return `${iv.toString("hex")}:${encrypted}:${authTag.toString("hex")}`;
}

export function decrypt(encryptedText: string): string {
  if (!encryptedText) return "";
  // If not encrypted (no colon separator), return as-is for backwards compatibility
  if (!encryptedText.includes(":")) {
    return encryptedText;
  }

  const parts = encryptedText.split(":");
  const key = getKeyBuffer();

  if (parts.length === 3) {
    // GCM format: iv:ciphertext:tag
    const [ivHex, ctHex, tagHex] = parts;
    const iv = Buffer.from(ivHex, "hex");
    const authTag = Buffer.from(tagHex, "hex");

    if (iv.length !== GCM_IV_LENGTH || authTag.length !== AUTH_TAG_LENGTH) {
      // Fallback if malformed
      return encryptedText;
    }

    try {
      const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
      decipher.setAuthTag(authTag);
      let decrypted = decipher.update(ctHex, "hex", "utf8");
      decrypted += decipher.final("utf8");
      return decrypted;
    } catch {
      // If decryption fails, return as-is
      return encryptedText;
    }
  }

  if (parts.length === 2) {
    // CBC legacy format: iv:ciphertext
    const [ivHex, ctHex] = parts;
    const iv = Buffer.from(ivHex, "hex");
    if (iv.length !== CBC_IV_LENGTH) return encryptedText;

    try {
      const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);
      let decrypted = decipher.update(ctHex, "hex", "utf8");
      decrypted += decipher.final("utf8");
      return decrypted;
    } catch {
      return encryptedText;
    }
  }

  return encryptedText;
}

export function isLegacyFormat(text: string): boolean {
  return text.split(":").length === 2;
}
