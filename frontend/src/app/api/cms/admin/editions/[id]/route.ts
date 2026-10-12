import { NextResponse } from "next/server";
import { updateEdition, deleteEdition } from "@/lib/cms-service";
import { verifyAdminRequest } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const isAuthed = await verifyAdminRequest(request);
  if (!isAuthed) {
    return NextResponse.json(
      { success: false, error: "Unauthorized. Admin session required." },
      { status: 401 }
    );
  }

  const { id } = await params;
  try {
    const updates = await request.json();
    const updated = await updateEdition(id, updates);
    if (!updated) {
      return NextResponse.json(
        { success: false, error: `Edition with ID '${id}' not found.` },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, edition: updated });
  } catch (error: any) {
    console.error(`[API /api/cms/admin/editions/${id}] Error updating:`, error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to update edition." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const isAuthed = await verifyAdminRequest(request);
  if (!isAuthed) {
    return NextResponse.json(
      { success: false, error: "Unauthorized. Admin session required." },
      { status: 401 }
    );
  }

  const { id } = await params;
  try {
    const success = await deleteEdition(id);
    if (!success) {
      return NextResponse.json(
        { success: false, error: `Edition with ID '${id}' not found.` },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, message: `Edition ${id} deleted.` });
  } catch (error) {
    console.error(`[API /api/cms/admin/editions/${id}] Error deleting:`, error);
    return NextResponse.json(
      { success: false, error: "Failed to delete edition." },
      { status: 500 }
    );
  }
}
