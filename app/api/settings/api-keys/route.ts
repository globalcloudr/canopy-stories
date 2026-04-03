import { NextResponse } from "next/server";
import { getWorkspaceApiKeys, upsertWorkspaceApiKeys } from "@/lib/stories-data";
import { requireWorkspaceAdminAccess, toErrorResponse } from "@/lib/server-auth";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const workspaceId = searchParams.get("workspaceId");

  if (!workspaceId) {
    return NextResponse.json({ error: "workspaceId is required." }, { status: 400 });
  }

  try {
    await requireWorkspaceAdminAccess(request, workspaceId);
    const keys = await getWorkspaceApiKeys(workspaceId);
    // Return masked key status — actual key values are never sent to the browser
    return NextResponse.json({
      hasOpenaiKey: !!keys?.openaiApiKey,
      hasVideoKey: !!keys?.videoApiKey,
      videoApiProvider: keys?.videoApiProvider ?? "json2video",
      notificationEmail: keys?.notificationEmail ?? null,
    });
  } catch (error) {
    return toErrorResponse(error, "Failed to load API key settings.");
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      workspaceId?: string;
      openaiApiKey?: string | null;
      videoApiKey?: string | null;
      videoApiProvider?: string | null;
      notificationEmail?: string | null;
    };

    if (!body.workspaceId?.trim()) {
      return NextResponse.json({ error: "workspaceId is required." }, { status: 400 });
    }
    await requireWorkspaceAdminAccess(request, body.workspaceId.trim());

    await upsertWorkspaceApiKeys(body.workspaceId.trim(), {
      openaiApiKey: body.openaiApiKey,
      videoApiKey: body.videoApiKey,
      videoApiProvider: body.videoApiProvider,
      notificationEmail: body.notificationEmail,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return toErrorResponse(error, "Failed to save settings.");
  }
}
