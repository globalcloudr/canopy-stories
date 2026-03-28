import { NextResponse } from "next/server";
import { deleteFormById } from "@/lib/stories-data";

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
