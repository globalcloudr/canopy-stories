import { NextResponse } from "next/server";
import { listPackagesForProject } from "@/lib/stories-data";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId");
    if (!projectId) {
      return NextResponse.json({ error: "projectId is required." }, { status: 400 });
    }
    const packages = await listPackagesForProject(projectId);
    return NextResponse.json(packages);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to load packages." },
      { status: 500 }
    );
  }
}
