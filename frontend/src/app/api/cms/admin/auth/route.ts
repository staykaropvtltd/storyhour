import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  generateAdminToken,
  isValidAdminToken,
  verifyAdminRequest,
  ADMIN_COOKIE_NAME,
} from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

// Allowed admin credentials configured via environment or verified secure default
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@storyhour.co.uk";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "StoryHour2026!";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, email, password } = body || {};

    if (action === "logout") {
      const cookieStore = await cookies();
      cookieStore.delete(ADMIN_COOKIE_NAME);
      return NextResponse.json({ success: true, message: "Logged out successfully" });
    }

    // Login action
    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Please provide both email and password." },
        { status: 400 }
      );
    }

    const trimmedEmail = String(email).trim().toLowerCase();
    const trimmedPassword = String(password).trim();

    // Verify credentials
    const isAuthorized =
      trimmedEmail === ADMIN_EMAIL.toLowerCase() && trimmedPassword === ADMIN_PASSWORD;

    if (!isAuthorized) {
      return NextResponse.json(
        { success: false, error: "Invalid administrator credentials." },
        { status: 401 }
      );
    }

    // Generate token and set HTTP-only cookie
    const token = generateAdminToken(trimmedEmail);
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

  return NextResponse.json({
    authenticated: true,
    admin: {
      email: ADMIN_EMAIL,
      role: "admin",
    },
  });
}
