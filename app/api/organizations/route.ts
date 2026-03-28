import { NextResponse } from "next/server";
import { listAllOrganizations } from "@/lib/stories-data";

export async function GET() {
  try {
    const orgs = await listAllOrganizations();
    return NextResponse.json(orgs);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to load organizations." },
      { status: 500 }
    );
  }
}
