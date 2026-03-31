import { NextResponse } from "next/server";
import { getStoryById, listAssetsForStory, listAllAssetsFlat } from "@/lib/stories-data";
import { getRequestAccess, requireWorkspaceAccess, toErrorResponse } from "@/lib/server-auth";

export async function GET(request: Request) {
  try {
    const access = await getRequestAccess(request);
    const { searchParams } = new URL(request.url);
    const storyId = searchParams.get("storyId");
    if (storyId) {
      const story = await getStoryById(storyId);
      if (!story) {
        return NextResponse.json({ error: "Story not found." }, { status: 404 });
      }
      await requireWorkspaceAccess(request, story.workspaceId);
      return NextResponse.json(await listAssetsForStory(storyId));
    }

    const assets = await listAllAssetsFlat();
    const allowedWorkspaceIds = access.isPlatformOperator
      ? null
      : new Set(access.memberships.map((membership) => membership.org_id));
    return NextResponse.json(
      allowedWorkspaceIds ? assets.filter((asset) => allowedWorkspaceIds.has(asset.workspaceId)) : assets
    );
  } catch (error) {
    return toErrorResponse(error, "Failed to load assets.");
  }
}
