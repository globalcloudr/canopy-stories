import { NextResponse } from "next/server";
import { getFlatProjectById, listAllStoriesFlat, listStoriesForProject } from "@/lib/stories-data";
import { getRequestAccess, requireWorkspaceAccess, toErrorResponse } from "@/lib/server-auth";

export async function GET(request: Request) {
  try {
    const access = await getRequestAccess(request);
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId");
    if (projectId) {
      const project = await getFlatProjectById(projectId);
      if (!project) {
        return NextResponse.json({ error: "Project not found." }, { status: 404 });
      }
      await requireWorkspaceAccess(request, project.workspaceId);
      return NextResponse.json(await listStoriesForProject(projectId));
    }

    const stories = await listAllStoriesFlat();
    const allowedWorkspaceIds = access.isPlatformOperator
      ? null
      : new Set(access.memberships.map((membership) => membership.org_id));
    return NextResponse.json(
      allowedWorkspaceIds ? stories.filter((story) => allowedWorkspaceIds.has(story.workspaceId)) : stories
    );
  } catch (error) {
    return toErrorResponse(error, "Failed to load stories.");
  }
}
