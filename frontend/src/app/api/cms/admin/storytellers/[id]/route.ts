import { NextResponse } from "next/server";
import { updateStoryteller, deleteStoryteller } from "@/lib/cms-service";
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
    const updated = await updateStoryteller(id, updates);
    if (!updated) {
      return NextResponse.json(
        { success: false, error: `Storyteller with ID '${id}' not found.` },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, storyteller: updated });
  } catch (error) {
    console.error(`[API /api/cms/admin/storytellers/${id}] Error updating:`, error);
    return NextResponse.json(
      { success: false, error: "Failed to update storyteller." },
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
    const success = await deleteStoryteller(id);
    if (!success) {
      return NextResponse.json(
        { success: false, error: `Storyteller with ID '${id}' not found.` },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, message: `Storyteller ${id} deleted.` });
  } catch (error) {
    console.error(`[API /api/cms/admin/storytellers/${id}] Error deleting:`, error);
    return NextResponse.json(
      { success: false, error: "Failed to delete storyteller." },
      { status: 500 }
    );
  }
}
