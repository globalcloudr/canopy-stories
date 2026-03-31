import { NextResponse } from "next/server";
import { getFlatFormById, updateFormById, deleteFormById } from "@/lib/stories-data";
import type { StoryFormField } from "@/lib/stories-schema";
import { requireWorkspaceAccess, toErrorResponse } from "@/lib/server-auth";

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
    const form = await getFlatFormById(id);
    if (!form) {
      return NextResponse.json({ error: "Form not found." }, { status: 404 });
    }
    await requireWorkspaceAccess(req, form.workspaceId);
    await updateFormById(id, {
      title: body.title.trim(),
      description: body.description ?? null,
      storyType: body.storyType.trim(),
      fields: body.fields ?? [],
    });
    return NextResponse.json({ message: "Form updated." });
  } catch (error) {
    return toErrorResponse(error, "Failed to update form.");
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const form = await getFlatFormById(id);
    if (!form) {
      return NextResponse.json({ error: "Form not found." }, { status: 404 });
    }
    await requireWorkspaceAccess(req, form.workspaceId);
    await deleteFormById(id);
    return NextResponse.json({ message: "Form deleted." });
  } catch (error) {
    return toErrorResponse(error, "Failed to delete form.");
  }
}
