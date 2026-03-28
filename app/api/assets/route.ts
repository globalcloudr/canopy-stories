import { NextResponse } from "next/server";
import { listAssetsForStory, listAllAssetsFlat } from "@/lib/stories-data";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const storyId = searchParams.get("storyId");
    const assets = storyId
      ? await listAssetsForStory(storyId)
      : await listAllAssetsFlat();
    return NextResponse.json(assets);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to load assets." },
      { status: 500 }
    );
  }
}
