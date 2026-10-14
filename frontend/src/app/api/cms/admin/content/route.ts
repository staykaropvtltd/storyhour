import { NextResponse } from "next/server";
import { getCmsData, getDashboardStats } from "@/lib/cms-service";
import { verifyAdminRequest } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const isAuthed = await verifyAdminRequest(request);
  if (!isAuthed) {
    return NextResponse.json(
      { success: false, error: "Unauthorized. Admin credentials required." },
      { status: 401 }
    );
  }

  try {
    const data = await getCmsData();
    const stats = await getDashboardStats();

    return NextResponse.json({
      success: true,
      data: {
        ...data,
        stats,
      },
    });
  } catch (error) {
    console.error("[API /api/cms/admin/content] Error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error fetching admin content." },
      { status: 500 }
    );
  }
}
