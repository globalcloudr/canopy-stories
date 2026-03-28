import { NextResponse } from "next/server";
import { listContentForStory } from "@/lib/stories-data";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const storyId = searchParams.get("storyId");
    if (!storyId) {
      return NextResponse.json({ error: "storyId is required." }, { status: 400 });
    }
    const content = await listContentForStory(storyId);
    return NextResponse.json(content);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to load content." },
      { status: 500 }
    );
  }
}
