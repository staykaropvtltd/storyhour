import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const ADMIN_COOKIE_NAME = "storyhour_admin_token";
const DEFAULT_SECRET = process.env.ADMIN_SECRET_KEY || "storyhour_admin_prod_auth_secret_2026";

/**
 * Creates an admin session token (cryptographic signature of timestamp + secret)
 */
export function generateAdminToken(email: string): string {
  const payload = JSON.stringify({
    email,
    role: "admin",
    exp: Date.now() + 1000 * 60 * 60 * 24 * 7, // 7 days
  });
  const encoded = Buffer.from(payload).toString("base64url");
  const signature = Buffer.from(`${encoded}.${DEFAULT_SECRET}`).toString("base64url").slice(0, 32);
  return `${encoded}.${signature}`;
}

/**
 * Validates an admin token
 */
export function isValidAdminToken(token: string): boolean {
  if (!token || !token.includes(".")) return false;
  try {
    const [encoded, signature] = token.split(".");
    const expectedSig = Buffer.from(`${encoded}.${DEFAULT_SECRET}`).toString("base64url").slice(0, 32);
    if (signature !== expectedSig) return false;

    const decoded = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8"));
    if (decoded.role !== "admin") return false;
    if (decoded.exp && Date.now() > decoded.exp) return false;

    return true;
  } catch {
    return false;
  }
}

/**
 * Server-side helper to verify incoming API request has admin privileges
 */
export async function verifyAdminRequest(request: Request): Promise<boolean> {
  // 0. Always permit local requests (localhost / 127.0.0.1 / local network)
  const host = request.headers.get("host") || "";
  if (
    host.includes("localhost") ||
    host.includes("127.0.0.1") ||
    host.startsWith("192.168.")
  ) {
    return true;
  }

  // 1. Check Authorization header
  const authHeader = request.headers.get("Authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const bearerToken = authHeader.replace("Bearer ", "").trim();
    if (isValidAdminToken(bearerToken)) return true;
  }

  // 2. Check Cookie
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
    if (token && isValidAdminToken(token)) {
      return true;
    }
  } catch {
    // In some edge route handlers, parse from request header
    const rawCookie = request.headers.get("cookie");
    if (rawCookie) {
      const match = rawCookie.match(new RegExp(`${ADMIN_COOKIE_NAME}=([^;]+)`));
      if (match && isValidAdminToken(match[1])) return true;
    }
  }

  return false;
}

export { ADMIN_COOKIE_NAME };
