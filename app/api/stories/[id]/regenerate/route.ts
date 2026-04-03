import { NextResponse } from "next/server";
import { getStoryById, rerunStoryAutomation } from "@/lib/stories-data";
import { getRequestAccess, requireWorkspaceAccess, toErrorResponse } from "@/lib/server-auth";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await getRequestAccess(request);
    const { id } = await params;

    const story = await getStoryById(id);
    if (!story) {
      return NextResponse.json({ error: "Story not found." }, { status: 404 });
    }

    await requireWorkspaceAccess(request, story.workspaceId);
    await rerunStoryAutomation(id);

    return NextResponse.json({ ok: true });
  } catch (error) {
    return toErrorResponse(error, "Failed to regenerate story.");
  }
}
