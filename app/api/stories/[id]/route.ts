import { NextResponse } from "next/server";
import { getStoryById, deleteStoryById } from "@/lib/stories-data";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const story = await getStoryById(id);
    if (!story) {
      return NextResponse.json({ error: "Story not found." }, { status: 404 });
    }
    return NextResponse.json(story);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to load story." },
      { status: 500 }
    );
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await deleteStoryById(id);
    return NextResponse.json({ message: "Story deleted." });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to delete story." },
      { status: 400 }
    );
  }
}
