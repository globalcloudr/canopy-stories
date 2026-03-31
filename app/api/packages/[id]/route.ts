import { NextResponse } from "next/server";
import { deletePackageById, getPackageById } from "@/lib/stories-data";
import { requireWorkspaceAccess, toErrorResponse } from "@/lib/server-auth";

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const storyPackage = await getPackageById(id);
    if (!storyPackage) {
      return NextResponse.json({ error: "Package not found." }, { status: 404 });
    }
    await requireWorkspaceAccess(req, storyPackage.workspaceId);
    await deletePackageById(id);
    return NextResponse.json({ message: "Package deleted." });
  } catch (error) {
    return toErrorResponse(error, "Failed to delete package.");
  }
}
