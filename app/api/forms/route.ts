import { NextResponse } from "next/server";
import { listFormsForProject, createFormFromBuilder } from "@/lib/stories-data";
import type { StoryFormField } from "@/lib/stories-schema";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId");
    if (!projectId) {
      return NextResponse.json({ error: "projectId is required." }, { status: 400 });
    }
    const forms = await listFormsForProject(projectId);
    return NextResponse.json(forms);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to load forms." },
      { status: 500 }
    );
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
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create form." },
      { status: 500 }
    );
  }
}
