import { NextResponse } from "next/server";
import { createStoryManually, getFlatProjectById } from "@/lib/stories-data";
import { storyTypes } from "@/lib/stories-schema";
import { requireWorkspaceAccess, toErrorResponse } from "@/lib/server-auth";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      projectId?: string;
      title?: string;
      storyType?: string;
      subjectName?: string | null;
      background?: string;
      details?: string | null;
      photoUrls?: string[];
    };

    if (!body.projectId?.trim()) {
      return NextResponse.json({ error: "Project is required." }, { status: 400 });
    }

    if (!body.title?.trim()) {
      return NextResponse.json({ error: "Title is required." }, { status: 400 });
    }

    if (!body.background?.trim()) {
      return NextResponse.json({ error: "Background is required." }, { status: 400 });
    }

    if (!body.storyType || !storyTypes.includes(body.storyType as (typeof storyTypes)[number])) {
      return NextResponse.json({ error: "Story type is invalid." }, { status: 400 });
    }
    const project = await getFlatProjectById(body.projectId.trim());
    if (!project) {
      return NextResponse.json({ error: "Project not found." }, { status: 404 });
    }
    await requireWorkspaceAccess(request, project.workspaceId);

    const story = await createStoryManually({
      projectId: body.projectId.trim(),
      title: body.title.trim(),
      storyType: body.storyType as (typeof storyTypes)[number],
      subjectName: body.subjectName?.trim() || null,
      background: body.background.trim(),
      details: body.details?.trim() || null,
      photoUrls: body.photoUrls ?? [],
    });

    return NextResponse.json({
      message: "Story created. Automation has started.",
      storyId: story.id,
    });
  } catch (error) {
    return toErrorResponse(error, "Story creation failed.");
  }
}
