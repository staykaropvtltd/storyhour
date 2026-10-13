import { NextResponse } from "next/server";
import { updateStory, deleteStory, getStoryById } from "@/lib/cms-service";
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
    const existing = await getStoryById(id);
    if (!existing) {
      return NextResponse.json(
        { success: false, error: `Story with ID '${id}' not found.` },
        { status: 404 }
      );
    }

    const updated = await updateStory(id, updates);
    return NextResponse.json({ success: true, story: updated });
  } catch (error) {
    console.error(`[API /api/cms/admin/stories/${id}] Error updating:`, error);
    return NextResponse.json(
      { success: false, error: "Failed to update story." },
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
    const success = await deleteStory(id);
    if (!success) {
      return NextResponse.json(
        { success: false, error: `Story with ID '${id}' not found.` },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, message: `Story ${id} deleted.` });
  } catch (error) {
    console.error(`[API /api/cms/admin/stories/${id}] Error deleting:`, error);
    return NextResponse.json(
      { success: false, error: "Failed to delete story." },
      { status: 500 }
    );
  }
}
