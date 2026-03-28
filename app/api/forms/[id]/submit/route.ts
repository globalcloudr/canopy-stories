import { NextResponse } from "next/server";
import { createSubmissionFromPublicForm } from "@/lib/stories-data";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function POST(request: Request, context: RouteContext) {
  const { id } = await context.params;

  try {
    const body = (await request.json()) as {
      submitterName?: string | null;
      submitterEmail?: string | null;
      data?: Record<string, unknown>;
      photoUrls?: string[];
    };

    const result = await createSubmissionFromPublicForm(id, {
      submitterName: body.submitterName?.trim() || null,
      submitterEmail: body.submitterEmail?.trim() || null,
      data: body.data ?? {},
      photoUrls: body.photoUrls ?? [],
    });

    return NextResponse.json({
      message: "Submission received. Story automation has started.",
      submissionId: result.submission.id,
      storyId: result.story.id,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Submission failed.",
      },
      { status: 400 }
    );
  }
}
