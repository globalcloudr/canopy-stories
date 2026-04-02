import { NextResponse } from "next/server";
import { getContentById, updateContentStatus } from "@/lib/stories-data";
import { requireWorkspaceAccess, toErrorResponse } from "@/lib/server-auth";

const VALID_STATUSES = ["draft", "ready", "approved"] as const;
type ValidStatus = (typeof VALID_STATUSES)[number];

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = (await request.json()) as { status?: string };

    if (!body.status || !VALID_STATUSES.includes(body.status as ValidStatus)) {
      return NextResponse.json({ error: "status must be draft, ready, or approved." }, { status: 400 });
    }

    const content = await getContentById(id);
    if (!content) {
      return NextResponse.json({ error: "Content not found." }, { status: 404 });
    }
    await requireWorkspaceAccess(request, content.workspaceId);
    await updateContentStatus(id, content.workspaceId, body.status as ValidStatus);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return toErrorResponse(error, "Failed to update content status.");
  }
}
