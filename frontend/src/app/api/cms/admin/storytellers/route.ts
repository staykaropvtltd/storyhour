import { NextResponse } from "next/server";
import { createStoryteller } from "@/lib/cms-service";
import { verifyAdminRequest } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const isAuthed = await verifyAdminRequest(request);
  if (!isAuthed) {
    return NextResponse.json(
      { success: false, error: "Unauthorized. Admin session required." },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    if (!body.name || !body.name.trim()) {
      return NextResponse.json(
        { success: false, error: "Storyteller name is required." },
        { status: 422 }
      );
    }

    const newSt = await createStoryteller({
      name: body.name.trim(),
      role: body.role?.trim() || "Classical Voice Artist & Narrator",
      bio: body.bio?.trim() || "",
      image: body.image?.trim() || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80",
      region: body.region?.trim() || "London, UK",
      languages: Array.isArray(body.languages)
        ? body.languages
        : typeof body.languages === "string"
        ? body.languages.split(",").map((s: string) => s.trim())
        : ["English"],
      connectedStoryTitle: body.connectedStoryTitle?.trim() || "Classical Narration Series",
      status: body.status || "published",
    });

    return NextResponse.json({ success: true, storyteller: newSt }, { status: 201 });
  } catch (error) {
    console.error("[API /api/cms/admin/storytellers] Error creating:", error);
    return NextResponse.json(
      { success: false, error: "Failed to persist new storyteller." },
      { status: 500 }
    );
  }
}
