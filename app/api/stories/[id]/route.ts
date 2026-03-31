import { NextResponse } from "next/server";
import { getStoryById, deleteStoryById } from "@/lib/stories-data";
import { requireWorkspaceAccess, toErrorResponse } from "@/lib/server-auth";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const story = await getStoryById(id);
    if (!story) {
      return NextResponse.json({ error: "Story not found." }, { status: 404 });
    }
    await requireWorkspaceAccess(req, story.workspaceId);
    return NextResponse.json(story);
  } catch (error) {
    return toErrorResponse(error, "Failed to load story.");
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const story = await getStoryById(id);
    if (!story) {
      return NextResponse.json({ error: "Story not found." }, { status: 404 });
    }
    await requireWorkspaceAccess(req, story.workspaceId);
    await deleteStoryById(id);
    return NextResponse.json({ message: "Story deleted." });
  } catch (error) {
    return toErrorResponse(error, "Failed to delete story.");
  }
}
