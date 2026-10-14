/**
 * Security utilities for input sanitization, safe URL handling,
 * formula injection defense, rate limiting, and PII masking.
 */

/**
 * Sanitizes open redirect destinations to prevent phishing and SSRF.
 * Guarantees destination is a safe relative path starting with a single '/'
 * and containing no backslashes, protocol markers, or control characters.
 */
export function sanitizeRedirectParam(
  param: string | null | undefined,
  fallback = "/account"
): string {
  if (!param || typeof param !== "string") {
    return fallback;
  }

  const trimmed = param.trim();

  // Must begin with a single slash, not double slash (protocol-relative)
  if (!trimmed.startsWith("/") || trimmed.startsWith("//")) {
    return fallback;
  }

  // Reject backslashes (Windows path traversal and browser URL parser ambiguities)
  if (trimmed.includes("\\")) {
    return fallback;
  }

  // Reject URLs containing protocol schemes (http:, https:, javascript:, data:, vbscript:)
  if (/[a-zA-Z][a-zA-Z0-9+.-]*:/.test(trimmed)) {
    return fallback;
  }

  // Reject control characters and newlines
  if (/[\x00-\x1F\x7F]/.test(trimmed)) {
    return fallback;
  }

  return trimmed;
}

/**
 * Sanitizes CSV cell values to prevent CSV Formula Injection (CWE-1236).
 * Prepends a single quote if the value begins with formula characters (=, +, -, @, \t, \r).
 * Properly escapes embedded double quotes by doubling them.
 */
export function sanitizeCsvCell(value: string | number | boolean | null | undefined): string {
  if (value === null || value === undefined) {
    return '""';
  }

  let str = String(value);

  // If starts with dangerous formula execution trigger, neutralize with leading single quote
  if (/^[=+\-@\t\r]/.test(str)) {
    str = `'${str}`;
  }

  // Escape internal quotes
  return `"${str.replace(/"/g, '""')}"`;
}

/**
 * Validates that an external or internal URL does not use dangerous pseudo-protocols
 * such as javascript:, vbscript:, or data: (CWE-79).
 */
export function isSafeNavigationUrl(url: string | null | undefined): boolean {
  if (!url || typeof url !== "string") return false;
  const trimmed = url.trim().toLowerCase();

  // Block dangerous pseudo-protocols
  if (
    trimmed.startsWith("javascript:") ||
    trimmed.startsWith("vbscript:") ||
    trimmed.startsWith("data:")
  ) {
    return false;
  }

  return true;
}

// ============================================================================
// Rate Limiting Controls (Fix #6, DoS & Quota Exhaustion Defense)
// ============================================================================

const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000; // 10-minute sliding window
const MAX_REQUESTS_PER_WINDOW = 5; // Max 5 submissions per IP in 10 minutes
const ipSubmissions = new Map<string, number[]>();

/**
 * In-memory sliding-window rate limiter for contact form submissions.
 * Prevents automated endpoint flooding and Resend API quota exhaustion.
 */
export function checkContactRateLimit(ip: string): boolean {
  const now = Date.now();
  const timestamps = ipSubmissions.get(ip) || [];
  const recent = timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW_MS);

  if (recent.length >= MAX_REQUESTS_PER_WINDOW) {
    return false;
  }

  recent.push(now);
  ipSubmissions.set(ip, recent);
  return true;
}

/** Resets rate limit records (used in test suites) */
export function resetContactRateLimit(): void {
  ipSubmissions.clear();
}

// ============================================================================
// PII Masking & Log Anonymization Controls (Fix #8, CWE-532 & GDPR Compliance)
// ============================================================================

/**
 * Anonymizes email addresses for audit logging (e.g. "a***v@example.com").
 * Prevents unmasked PII exposure in cloud log aggregators (GDPR / CWE-532).
 */
export function maskEmail(email: string): string {
  if (!email || typeof email !== "string") return "***";
  const parts = email.trim().split("@");
  if (parts.length !== 2) return "***";
  const [local, domain] = parts;
  const maskedLocal = local.length > 2 ? `${local[0]}***${local[local.length - 1]}` : "***";
  return `${maskedLocal}@${domain}`;
}

/**
 * Anonymizes phone numbers for audit logging (e.g. "***3456").
 */
export function maskPhone(phone: string): string {
  if (!phone || typeof phone !== "string") return "N/A";
  const clean = phone.replace(/\s+/g, "");
  if (clean.length < 4) return "***";
  return `***${clean.slice(-4)}`;
}
