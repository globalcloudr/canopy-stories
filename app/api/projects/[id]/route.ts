import { NextResponse } from "next/server";
import { getFlatProjectById, deleteProjectById } from "@/lib/stories-data";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const project = await getFlatProjectById(id);
    if (!project) {
      return NextResponse.json({ error: "Project not found." }, { status: 404 });
    }
    return NextResponse.json(project);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to load project." },
      { status: 500 }
    );
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await deleteProjectById(id);
    return NextResponse.json({ message: "Project deleted." });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to delete project." },
      { status: 400 }
    );
  }
}
