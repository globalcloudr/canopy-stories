import { NextResponse } from "next/server";
import { getFlatFormById, listSubmissionsForForm } from "@/lib/stories-data";
import { requireWorkspaceAccess, toErrorResponse } from "@/lib/server-auth";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const formId = searchParams.get("formId");

  if (!formId) {
    return NextResponse.json({ error: "formId is required." }, { status: 400 });
  }

  try {
    const form = await getFlatFormById(formId);
    if (!form) {
      return NextResponse.json({ error: "Form not found." }, { status: 404 });
    }
    await requireWorkspaceAccess(request, form.workspaceId);
    const items = await listSubmissionsForForm(formId);
    return NextResponse.json(items);
  } catch (error) {
    return toErrorResponse(error, "Failed to load submissions.");
  }
}
