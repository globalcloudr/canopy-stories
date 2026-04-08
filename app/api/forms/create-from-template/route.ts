import { NextResponse } from "next/server";
import { createFormFromReferenceTemplate, getFlatProjectById } from "@/lib/stories-data";
import { requireWorkspaceAccess, toErrorResponse } from "@/lib/server-auth";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      projectId?: string;
      templateId?: string;
    };

    if (!body.projectId || !body.templateId) {
      return NextResponse.json({ error: "projectId and templateId are required." }, { status: 400 });
    }
    const project = await getFlatProjectById(body.projectId);
    if (!project) {
      return NextResponse.json({ error: "Project not found." }, { status: 404 });
    }
    await requireWorkspaceAccess(request, project.workspaceId);

    const created = await createFormFromReferenceTemplate(body.projectId, body.templateId);

    return NextResponse.json({
      message: "Form created and ready to share.",
      id: created.id,
      publicSlug: created.public_slug,
    });
  } catch (error) {
    return toErrorResponse(error, "Could not create form.");
  }
}
