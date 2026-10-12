import { NextResponse } from "next/server";
import { getPublicContent } from "@/lib/cms-service";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const publicContent = await getPublicContent();
    return NextResponse.json(
      { success: true, data: publicContent },
      {
        headers: {
          "Cache-Control": "public, s-maxage=10, stale-while-revalidate=59",
        },
      }
    );
  } catch (error) {
    console.error("[API /api/cms/content] Error retrieving public content:", error);
    return NextResponse.json(
      { success: false, error: "Failed to retrieve public content." },
      { status: 500 }
    );
  }
}
