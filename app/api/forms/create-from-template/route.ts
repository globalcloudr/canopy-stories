import { NextResponse } from "next/server";
import { createFormFromReferenceTemplate } from "@/lib/stories-data";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      projectId?: string;
      templateId?: string;
    };

    if (!body.projectId || !body.templateId) {
      return NextResponse.json({ error: "projectId and templateId are required." }, { status: 400 });
    }

    const created = await createFormFromReferenceTemplate(body.projectId, body.templateId);

    return NextResponse.json({
      message: "Live form created from reference template.",
      id: created.id,
      publicSlug: created.public_slug,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Could not create form.",
      },
      { status: 400 }
    );
  }
}
