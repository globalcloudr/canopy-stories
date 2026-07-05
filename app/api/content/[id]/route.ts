import { NextResponse } from "next/server";
import { getContentById, updateContentBody, updateContentStatus } from "@/lib/stories-data";
import { requireWorkspaceAccess, toErrorResponse } from "@/lib/server-auth";

const VALID_STATUSES = ["draft", "ready", "approved"] as const;
type ValidStatus = (typeof VALID_STATUSES)[number];

const MAX_BODY_LENGTH = 100_000;

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = (await request.json()) as { status?: string; body?: string };

    const hasStatus = body.status !== undefined;
    const hasBody = body.body !== undefined;

    if (!hasStatus && !hasBody) {
      return NextResponse.json({ error: "Provide a status or body to update." }, { status: 400 });
    }
    if (hasStatus && !VALID_STATUSES.includes(body.status as ValidStatus)) {
      return NextResponse.json({ error: "status must be draft, ready, or approved." }, { status: 400 });
    }
    if (hasBody && (typeof body.body !== "string" || body.body.trim().length === 0)) {
      return NextResponse.json({ error: "body must be a non-empty string." }, { status: 400 });
    }
    if (hasBody && (body.body as string).length > MAX_BODY_LENGTH) {
      return NextResponse.json({ error: "body is too long." }, { status: 400 });
    }

    const content = await getContentById(id);
    if (!content) {
      return NextResponse.json({ error: "Content not found." }, { status: 404 });
    }
    await requireWorkspaceAccess(request, content.workspaceId);
    if (hasBody) {
      await updateContentBody(id, content.workspaceId, body.body as string);
    }
    if (hasStatus) {
      await updateContentStatus(id, content.workspaceId, body.status as ValidStatus);
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    return toErrorResponse(error, "Failed to update content.");
  }
}
