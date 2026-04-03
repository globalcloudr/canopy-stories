import { NextResponse } from "next/server";
import { getFlatProjectById, listAllStoriesFlat, listStoriesForProject } from "@/lib/stories-data";
import { getRequestAccess, requireWorkspaceAccess, toErrorResponse } from "@/lib/server-auth";

export async function GET(request: Request) {
  try {
    const access = await getRequestAccess(request);
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId");
    const workspaceId = searchParams.get("workspaceId")?.trim() || null;
    if (projectId) {
      const project = await getFlatProjectById(projectId);
      if (!project) {
        return NextResponse.json({ error: "Project not found." }, { status: 404 });
      }
      await requireWorkspaceAccess(request, project.workspaceId);
      return NextResponse.json(await listStoriesForProject(projectId));
    }

    if (workspaceId) {
      await requireWorkspaceAccess(request, workspaceId);
    }

    const stories = await listAllStoriesFlat();
    const allowedWorkspaceIds = access.isPlatformOperator
      ? null
      : new Set(access.memberships.map((membership) => membership.org_id));
    const visibleStories = allowedWorkspaceIds
      ? stories.filter((story) => allowedWorkspaceIds.has(story.workspaceId))
      : stories;

    return NextResponse.json(
      workspaceId ? visibleStories.filter((story) => story.workspaceId === workspaceId) : visibleStories
    );
  } catch (error) {
    return toErrorResponse(error, "Failed to load stories.");
  }
}
