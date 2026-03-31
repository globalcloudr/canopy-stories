import { NextResponse } from "next/server";
import { getFlatProjectById, listFormsForProject, createFormFromBuilder } from "@/lib/stories-data";
import type { StoryFormField } from "@/lib/stories-schema";
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
    const forms = await listFormsForProject(projectId);
    return NextResponse.json(forms);
  } catch (error) {
    return toErrorResponse(error, "Failed to load forms.");
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      projectId?: string;
      title?: string;
      description?: string | null;
      storyType?: string;
      fields?: StoryFormField[];
      isActive?: boolean;
    };

    if (!body.projectId?.trim()) {
      return NextResponse.json({ error: "projectId is required." }, { status: 400 });
    }
    if (!body.title?.trim()) {
      return NextResponse.json({ error: "Title is required." }, { status: 400 });
    }
    if (!body.storyType?.trim()) {
      return NextResponse.json({ error: "Story type is required." }, { status: 400 });
    }
    const project = await getFlatProjectById(body.projectId.trim());
    if (!project) {
      return NextResponse.json({ error: "Project not found." }, { status: 404 });
    }
    await requireWorkspaceAccess(request, project.workspaceId);

    const form = await createFormFromBuilder({
      projectId: body.projectId.trim(),
      title: body.title.trim(),
      description: body.description ?? null,
      storyType: body.storyType.trim(),
      fields: body.fields ?? [],
      isActive: body.isActive ?? true,
    });

    return NextResponse.json(form, { status: 201 });
  } catch (error) {
    return toErrorResponse(error, "Failed to create form.");
  }
}
