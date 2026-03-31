import { NextResponse } from "next/server";
import { getFlatProjectById, deleteProjectById } from "@/lib/stories-data";
import { requireWorkspaceAccess, toErrorResponse } from "@/lib/server-auth";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const project = await getFlatProjectById(id);
    if (!project) {
      return NextResponse.json({ error: "Project not found." }, { status: 404 });
    }
    await requireWorkspaceAccess(req, project.workspaceId);
    return NextResponse.json(project);
  } catch (error) {
    return toErrorResponse(error, "Failed to load project.");
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const project = await getFlatProjectById(id);
    if (!project) {
      return NextResponse.json({ error: "Project not found." }, { status: 404 });
    }
    await requireWorkspaceAccess(req, project.workspaceId);
    await deleteProjectById(id);
    return NextResponse.json({ message: "Project deleted." });
  } catch (error) {
    return toErrorResponse(error, "Failed to delete project.");
  }
}
