import { NextResponse } from "next/server";
import { getFlatProjectById, listPackagesForProject } from "@/lib/stories-data";
import { requireWorkspaceAccess, toErrorResponse } from "@/lib/server-auth";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId");
    if (!projectId) {
      return NextResponse.json({ error: "projectId is required." }, { status: 400 });
    }
    const project = await getFlatProjectById(projectId);
    if (!project) {
      return NextResponse.json({ error: "Project not found." }, { status: 404 });
    }
    await requireWorkspaceAccess(request, project.workspaceId);
    const packages = await listPackagesForProject(projectId);
    return NextResponse.json(packages);
  } catch (error) {
    return toErrorResponse(error, "Failed to load packages.");
  }
}
