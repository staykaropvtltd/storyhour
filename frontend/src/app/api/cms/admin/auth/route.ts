import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { timingSafeEqual } from "crypto";
import {
  generateAdminToken,
  verifyAdminRequest,
  ADMIN_COOKIE_NAME,
} from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

/**
 * Retrieves configured admin credentials from server environment.
 * Fails closed by returning null if either variable is absent.
 */
function getAdminCredentials(): { email: string; password: string } | null {
  const email = process.env.ADMIN_EMAIL?.trim();
  const password = process.env.ADMIN_PASSWORD?.trim();

  if (!email || !password) {
    return null;
  }
  return { email: email.toLowerCase(), password };
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, email, password } = body || {};

    if (action === "logout") {
      const cookieStore = await cookies();
      cookieStore.delete(ADMIN_COOKIE_NAME);
      return NextResponse.json({ success: true, message: "Logged out successfully" });
    }

    // Fail closed if admin credentials are not configured in environment
    const configuredAdmin = getAdminCredentials();
    if (!configuredAdmin) {
      console.error(
        "[API /api/cms/admin/auth] CRITICAL: ADMIN_EMAIL or ADMIN_PASSWORD is not configured in server environment."
      );
      return NextResponse.json(
        {
          success: false,
          error: "Admin authentication service is not configured on the server. Please set ADMIN_EMAIL and ADMIN_PASSWORD.",
        },
        { status: 503 }
      );
    }

    // Login action: validate input presence
    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Please provide both email and password." },
        { status: 400 }
      );
    }

    const trimmedEmail = String(email).trim().toLowerCase();
    const trimmedPassword = String(password).trim();

    // Constant-time password verification to prevent timing attack side-channels
    const emailMatches = trimmedEmail === configuredAdmin.email;
    const providedPassBuffer = Buffer.from(trimmedPassword, "utf8");
    const configuredPassBuffer = Buffer.from(configuredAdmin.password, "utf8");

    const passwordMatches =
      providedPassBuffer.length === configuredPassBuffer.length &&
      timingSafeEqual(providedPassBuffer, configuredPassBuffer);

    if (!emailMatches || !passwordMatches) {
      return NextResponse.json(
        { success: false, error: "Invalid administrator credentials." },
        { status: 401 }
      );
    }

    // Generate cryptographically signed token (HMAC-SHA-256)
    let token: string;
    try {
      token = generateAdminToken(trimmedEmail);
    } catch (tokenErr: any) {
      console.error("[API /api/cms/admin/auth] Token generation failed:", tokenErr.message);
      return NextResponse.json(
        {
          success: false,
          error: "Authentication service error: ADMIN_SECRET_KEY is required on the server.",
        },
        { status: 500 }
      );
    }

    // Set HttpOnly session cookie
    const cookieStore = await cookies();
    cookieStore.set(ADMIN_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return NextResponse.json({
      success: true,
      token,
      admin: {
        email: trimmedEmail,
        role: "admin",
      },
    });
  } catch (error) {
    console.error("[API /api/cms/admin/auth] Auth error:", error);
    return NextResponse.json(
      { success: false, error: "Authentication service error." },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  const isAuthed = await verifyAdminRequest(request);
  if (!isAuthed) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  const configuredEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase() || "admin";

  return NextResponse.json({
    authenticated: true,
    admin: {
      email: configuredEmail,
      role: "admin",
    },
  });
}
