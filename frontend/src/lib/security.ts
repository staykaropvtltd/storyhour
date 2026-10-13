/**
 * Security utilities for input sanitization, safe URL handling,
 * and formula injection defense across StoryHour frontend.
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
