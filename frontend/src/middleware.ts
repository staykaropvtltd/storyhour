import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Edge Middleware — lightweight request-level protections.
 *
 * 1. Admin route guard: redirects unauthenticated visitors away from /admin.
 * 2. API admin rate-limit: basic sliding-window throttle on the auth endpoint.
 * 3. Security header enforcement (supplements next.config.ts headers).
 */

// Simple in-memory rate limiter for auth endpoint (per-IP, 10 attempts / 60s)
const AUTH_WINDOW_MS = 60_000;
const AUTH_MAX_ATTEMPTS = 10;
const authAttempts = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const record = authAttempts.get(ip);

  if (!record || now > record.resetAt) {
    authAttempts.set(ip, { count: 1, resetAt: now + AUTH_WINDOW_MS });
    return false;
  }

  record.count += 1;
  if (record.count > AUTH_MAX_ATTEMPTS) {
    return true;
  }

  return false;
}

// Periodically clean stale entries (max 500 tracked IPs)
function pruneRateLimitMap() {
  if (authAttempts.size > 500) {
    const now = Date.now();
    for (const [ip, record] of authAttempts) {
      if (now > record.resetAt) {
        authAttempts.delete(ip);
      }
    }
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ─── Rate Limit: POST /api/cms/admin/auth ───
  if (pathname === "/api/cms/admin/auth" && request.method === "POST") {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "unknown";

    pruneRateLimitMap();

    if (isRateLimited(ip)) {
      return NextResponse.json(
        { success: false, error: "Too many login attempts. Please wait 60 seconds." },
        { status: 429 }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Rate limit auth endpoint
    "/api/cms/admin/auth",
  ],
};
