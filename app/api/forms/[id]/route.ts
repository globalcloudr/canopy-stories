import { NextResponse } from "next/server";
import { updateFormById, deleteFormById } from "@/lib/stories-data";
import type { StoryFormField } from "@/lib/stories-schema";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = (await req.json()) as {
      title?: string;
      description?: string | null;
      storyType?: string;
      fields?: StoryFormField[];
    };
    if (!body.title?.trim()) return NextResponse.json({ error: "Title is required." }, { status: 400 });
    if (!body.storyType?.trim()) return NextResponse.json({ error: "Story type is required." }, { status: 400 });
    await updateFormById(id, {
      title: body.title.trim(),
      description: body.description ?? null,
      storyType: body.storyType.trim(),
      fields: body.fields ?? [],
    });
    return NextResponse.json({ message: "Form updated." });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update form." },
      { status: 400 }
    );
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await deleteFormById(id);
    return NextResponse.json({ message: "Form deleted." });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to delete form." },
      { status: 400 }
    );
  }
}
