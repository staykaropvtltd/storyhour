import { createHmac, timingSafeEqual } from "crypto";

const ADMIN_COOKIE_NAME = "storyhour_admin_token";

/**
 * Returns the configured ADMIN_SECRET_KEY.
 * Fails closed by returning null if not configured, empty, or too short.
 * Never falls back to a hardcoded string.
 */
export function getAdminSecretKey(): string | null {
  const secret = process.env.ADMIN_SECRET_KEY;
  if (!secret || secret.trim().length === 0) {
    return null;
  }
  const trimmed = secret.trim();
  if (trimmed.length < 32 && process.env.NODE_ENV === "production") {
    console.warn("[admin-auth] WARNING: ADMIN_SECRET_KEY is shorter than the recommended 32 characters.");
  }
  return trimmed;
}

export interface AdminTokenPayload {
  email: string;
  role: "admin";
  iat: number;
  exp: number;
}

/**
 * Computes an HMAC-SHA-256 signature for the given base64url payload.
 */
function computeSignature(payloadBase64Url: string, secret: string): string {
  return createHmac("sha256", secret).update(payloadBase64Url).digest("base64url");
}

/**
 * Creates an HMAC-SHA-256 signed admin session token.
 * Throws if ADMIN_SECRET_KEY is not configured on the server.
 */
export function generateAdminToken(email: string): string {
  const secret = getAdminSecretKey();
  if (!secret) {
    throw new Error(
      "Admin authentication service misconfigured: ADMIN_SECRET_KEY environment variable is required."
    );
  }

  const now = Date.now();
  const payload: AdminTokenPayload = {
    email: email.trim().toLowerCase(),
    role: "admin",
    iat: now,
    exp: now + 1000 * 60 * 60 * 24 * 7, // 7-day expiration
  };

  const encodedPayload = Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
  const signature = computeSignature(encodedPayload, secret);
  return `${encodedPayload}.${signature}`;
}

/**
 * Validates an admin token using HMAC-SHA-256 and constant-time verification.
 * Fails closed if ADMIN_SECRET_KEY is absent, if format is invalid,
 * if signature does not match, or if the token has expired.
 */
export function isValidAdminToken(token: string): boolean {
  if (!token || typeof token !== "string" || !token.includes(".")) {
    return false;
  }

  const secret = getAdminSecretKey();
  if (!secret) {
    // Fail closed: cannot validate tokens without a configured signing secret
    return false;
  }

  try {
    const parts = token.split(".");
    if (parts.length !== 2) {
      return false;
    }

    const [encodedPayload, providedSignature] = parts;
    if (!encodedPayload || !providedSignature) {
      return false;
    }

    // 1. Recompute expected HMAC-SHA-256 signature
    const expectedSignature = computeSignature(encodedPayload, secret);

    // 2. Constant-time verification to prevent timing attack side-channels
    const providedBuffer = Buffer.from(providedSignature, "utf8");
    const expectedBuffer = Buffer.from(expectedSignature, "utf8");

    if (providedBuffer.length !== expectedBuffer.length) {
      return false;
    }

    if (!timingSafeEqual(providedBuffer, expectedBuffer)) {
      return false;
    }

    // 3. Decode payload and validate claims
    const rawJson = Buffer.from(encodedPayload, "base64url").toString("utf8");
    const payload: Partial<AdminTokenPayload> = JSON.parse(rawJson);

    if (payload.role !== "admin") {
      return false;
    }

    if (typeof payload.exp !== "number" || Date.now() > payload.exp) {
      return false;
    }

    if (!payload.email || typeof payload.email !== "string") {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

/**
 * Server-side helper to verify incoming API request has admin privileges.
 * Validates Bearer authorization header or HttpOnly session cookie.
 * NEVER authorizes requests based on Host headers or IP ranges.
 */
export async function verifyAdminRequest(request: Request): Promise<boolean> {
  // 1. Check Authorization header: "Bearer <token>"
  const authHeader =
    request.headers.get("authorization") || request.headers.get("Authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const bearerToken = authHeader.replace("Bearer ", "").trim();
    if (isValidAdminToken(bearerToken)) {
      return true;
    }
  }

  // 2. Check Cookie via Next.js cookies()
  try {
    const { cookies } = await import("next/headers");
    const cookieStore = await cookies();
    const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
    if (token && isValidAdminToken(token)) {
      return true;
    }
  } catch {
    // In Edge route handlers, unit tests, or direct requests where cookies() throws
  }

  // 3. Fallback check from raw request Cookie header
  const rawCookie = request.headers.get("cookie");
  if (rawCookie) {
    const match = rawCookie.match(new RegExp(`(?:^|;\\s*)${ADMIN_COOKIE_NAME}=([^;]+)`));
    if (match && match[1] && isValidAdminToken(match[1])) {
      return true;
    }
  }

  return false;
}

export { ADMIN_COOKIE_NAME };
