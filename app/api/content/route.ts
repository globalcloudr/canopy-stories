import { NextResponse } from "next/server";
import { getStoryById, listContentForStory } from "@/lib/stories-data";
import { getRequestAccess, requireWorkspaceAccess, toErrorResponse } from "@/lib/server-auth";

export async function GET(request: Request) {
  try {
    await getRequestAccess(request);
    const { searchParams } = new URL(request.url);
    const storyId = searchParams.get("storyId");
    if (!storyId) {
      return NextResponse.json({ error: "storyId is required." }, { status: 400 });
    }
    const story = await getStoryById(storyId);
    if (!story) {
      return NextResponse.json({ error: "Story not found." }, { status: 404 });
    }
    await requireWorkspaceAccess(request, story.workspaceId);
    const content = await listContentForStory(storyId);
    return NextResponse.json(content);
  } catch (error) {
    return toErrorResponse(error, "Failed to load content.");
  }
}
