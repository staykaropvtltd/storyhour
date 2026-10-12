import { NextResponse } from "next/server";
import { createStory } from "@/lib/cms-service";
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
    if (!body.title || !body.title.trim()) {
      return NextResponse.json(
        { success: false, error: "Story title is required." },
        { status: 422 }
      );
    }

    const newStory = await createStory({
      slug: body.slug || body.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, ""),
      title: body.title.trim(),
      subtitle: body.subtitle?.trim(),
      storyteller: body.storyteller?.trim() || "StoryHour Ensemble",
      language: body.language || "English",
      audience: body.audience || "Families & All Ages",
      category: body.category || "Mythology & Epics",
      format: body.format || "Audiobook",
      duration: body.duration?.trim() || "12h 00m",
      durationMinutes: Number(body.durationMinutes) || 720,
      coverImage: body.coverImage?.trim() || "https://storyhour.co.uk/wp-content/uploads/2026/01/WhatsApp-Image-2026-01-19-at-17.28.53.jpeg",
      audioPreviewUrl: body.audioPreviewUrl?.trim() || "https://www.youtube.com/embed/4up2VdHiO5I?autoplay=1",
      chaptersCount: Number(body.chaptersCount) || 20,
      description: body.description?.trim() || "",
      culturalNote: body.culturalNote?.trim(),
      featured: !!body.featured,
      status: body.status || "published",
    });

    return NextResponse.json({ success: true, story: newStory }, { status: 201 });
  } catch (error) {
    console.error("[API /api/cms/admin/stories] Error creating story:", error);
    return NextResponse.json(
      { success: false, error: "Failed to persist new story." },
      { status: 500 }
    );
  }
}
