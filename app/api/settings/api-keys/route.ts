import { NextResponse } from "next/server";
import { getWorkspaceApiKeys, upsertWorkspaceApiKeys } from "@/lib/stories-data";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const workspaceId = searchParams.get("workspaceId");

  if (!workspaceId) {
    return NextResponse.json({ error: "workspaceId is required." }, { status: 400 });
  }

  try {
    const keys = await getWorkspaceApiKeys(workspaceId);
    // Return masked values — never expose raw keys to the browser
    return NextResponse.json({
      hasOpenaiKey: !!keys?.openaiApiKey,
      hasVideoKey: !!keys?.videoApiKey,
      videoApiProvider: keys?.videoApiProvider ?? "json2video",
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to load API key settings." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      workspaceId?: string;
      openaiApiKey?: string;
      videoApiKey?: string;
      videoApiProvider?: string;
    };

    if (!body.workspaceId?.trim()) {
      return NextResponse.json({ error: "workspaceId is required." }, { status: 400 });
    }

    await upsertWorkspaceApiKeys(body.workspaceId.trim(), {
      openaiApiKey: body.openaiApiKey,
      videoApiKey: body.videoApiKey,
      videoApiProvider: body.videoApiProvider,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to save API keys." },
      { status: 500 }
    );
  }
}
