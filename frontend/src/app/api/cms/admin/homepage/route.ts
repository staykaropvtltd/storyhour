import { NextResponse } from "next/server";
import { updateHomepageConfig, getHomepageConfig } from "@/lib/cms-service";
import { verifyAdminRequest } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const config = await getHomepageConfig();
    return NextResponse.json({ success: true, data: config });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to fetch homepage config." }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const isAuthed = await verifyAdminRequest(request);
  if (!isAuthed) {
    return NextResponse.json(
      { success: false, error: "Unauthorized. Admin session required." },
      { status: 401 }
    );
  }

  try {
    const updates = await request.json();
    const updated = await updateHomepageConfig(updates);
    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("[API /api/cms/admin/homepage] Error updating homepage:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update homepage settings." },
      { status: 500 }
    );
  }
}
