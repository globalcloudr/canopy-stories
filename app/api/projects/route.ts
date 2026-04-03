import { NextResponse } from "next/server";
import { listAllProjects, createProject } from "@/lib/stories-data";
import { getRequestAccess, requireWorkspaceAccess, toErrorResponse } from "@/lib/server-auth";

export async function GET(request: Request) {
  try {
    const access = await getRequestAccess(request);
    const workspaceId = new URL(request.url).searchParams.get("workspaceId")?.trim() || null;
    if (workspaceId) {
      await requireWorkspaceAccess(request, workspaceId);
    }
    const projects = await listAllProjects();
    const allowedWorkspaceIds = access.isPlatformOperator
      ? null
      : new Set(access.memberships.map((membership) => membership.org_id));
    const visibleProjects = allowedWorkspaceIds
      ? projects.filter((project) => allowedWorkspaceIds.has(project.workspaceId))
      : projects;
    return NextResponse.json(
      workspaceId ? visibleProjects.filter((project) => project.workspaceId === workspaceId) : visibleProjects
    );
  } catch (error) {
    return toErrorResponse(error, "Failed to load projects.");
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      workspaceId?: string;
      name?: string;
      description?: string | null;
      storyCountTarget?: number | null;
      deadlineAt?: string | null;
    };

    if (!body.workspaceId?.trim()) {
      return NextResponse.json({ error: "Workspace is required." }, { status: 400 });
    }
    if (!body.name?.trim()) {
      return NextResponse.json({ error: "Project name is required." }, { status: 400 });
    }

    await requireWorkspaceAccess(request, body.workspaceId.trim());

    const project = await createProject({
      workspaceId: body.workspaceId.trim(),
      name: body.name.trim(),
      description: body.description ?? null,
      storyCountTarget: body.storyCountTarget ?? null,
      deadlineAt: body.deadlineAt ?? null,
    });

    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    return toErrorResponse(error, "Failed to create project.");
  }
}
