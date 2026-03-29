import { NextResponse } from "next/server";
import { updateContentStatus } from "@/lib/stories-data";

const VALID_STATUSES = ["draft", "ready", "approved"] as const;
type ValidStatus = (typeof VALID_STATUSES)[number];

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = (await request.json()) as { status?: string; workspaceId?: string };

    if (!body.workspaceId?.trim()) {
      return NextResponse.json({ error: "workspaceId is required." }, { status: 400 });
    }
    if (!body.status || !VALID_STATUSES.includes(body.status as ValidStatus)) {
      return NextResponse.json({ error: "status must be draft, ready, or approved." }, { status: 400 });
    }

    await updateContentStatus(id, body.workspaceId.trim(), body.status as ValidStatus);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update content status." },
      { status: 500 }
    );
  }
}
