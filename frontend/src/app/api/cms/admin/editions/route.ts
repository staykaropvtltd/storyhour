import { NextResponse } from "next/server";
import { createEdition } from "@/lib/cms-service";
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
        { success: false, error: "Edition title is required." },
        { status: 422 }
      );
    }

    const newEdition = await createEdition({
      year: body.year?.trim() || "2026",
      season: body.season?.trim() || "Signature Collection",
      codeName: body.codeName?.trim() || "SH-ED-" + Math.floor(100 + Math.random() * 900),
      title: body.title.trim(),
      nativeTitle: body.nativeTitle?.trim(),
      subtitle: body.subtitle?.trim() || "Classic StoryHour Edition",
      language: body.language || "English",
      bookFormat: body.bookFormat?.trim() || "Hardcover (Clothbound Foil)",
      category: body.category?.trim() || "Mythology & Classical Literature",
      pagesCount: Number(body.pagesCount) || 280,
      chaptersCount: Number(body.chaptersCount) || 24,
      duration: body.duration?.trim() || "12h 00m",
      coverImage: body.coverImage?.trim() || "https://storyhour.co.uk/wp-content/uploads/2026/01/WhatsApp-Image-2026-01-19-at-17.28.53.jpeg",
      badge: body.badge?.trim(),
      isFeatured: !!body.isFeatured,
      description: body.description?.trim() || "",
      audioPreviewUrl: body.audioPreviewUrl?.trim() || "https://www.youtube.com/embed/4up2VdHiO5I?autoplay=1",
      storyteller: body.storyteller?.trim() || "StoryHour Ensemble",
      price: Number(body.price) || 29.99,
      accentColor: body.accentColor?.trim() || "#C9281D",
      status: body.status || "published",
      stockCount: Number(body.stockCount) || 25,
    });

    return NextResponse.json({ success: true, edition: newEdition }, { status: 201 });
  } catch (error) {
    console.error("[API /api/cms/admin/editions] Error creating edition:", error);
    return NextResponse.json(
      { success: false, error: "Failed to persist new edition." },
      { status: 500 }
    );
  }
}
