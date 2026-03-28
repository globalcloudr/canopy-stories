import { NextResponse } from "next/server";
import { listAllProjects, createProject } from "@/lib/stories-data";

export async function GET() {
  try {
    const projects = await listAllProjects();
    return NextResponse.json(projects);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to load projects." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      workspaceId?: string;
      name?: string;
      description?: string | null;
      storyCountTarget?: number | null;
      deadlineAt?: string | null;
    };

    if (!body.workspaceId?.trim()) {
      return NextResponse.json({ error: "Workspace is required." }, { status: 400 });
    }
    if (!body.name?.trim()) {
      return NextResponse.json({ error: "Project name is required." }, { status: 400 });
    }

    const project = await createProject({
      workspaceId: body.workspaceId.trim(),
      name: body.name.trim(),
      description: body.description ?? null,
      storyCountTarget: body.storyCountTarget ?? null,
      deadlineAt: body.deadlineAt ?? null,
    });

    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create project." },
      { status: 500 }
    );
  }
}
