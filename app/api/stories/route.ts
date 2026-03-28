import { NextResponse } from "next/server";
import { listAllStoriesFlat, listStoriesForProject } from "@/lib/stories-data";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId");
    const stories = projectId
      ? await listStoriesForProject(projectId)
      : await listAllStoriesFlat();
    return NextResponse.json(stories);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to load stories." },
      { status: 500 }
    );
  }
}
