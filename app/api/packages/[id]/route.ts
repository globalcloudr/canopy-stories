import { NextResponse } from "next/server";
import { deletePackageById } from "@/lib/stories-data";

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await deletePackageById(id);
    return NextResponse.json({ message: "Package deleted." });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to delete package." },
      { status: 400 }
    );
  }
}
