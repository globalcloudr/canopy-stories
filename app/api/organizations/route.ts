import { NextResponse } from "next/server";
import { resolveAccessibleOrganizations, toErrorResponse } from "@/lib/server-auth";

export async function GET(request: Request) {
  try {
    const orgs = await resolveAccessibleOrganizations(request);
    return NextResponse.json(orgs);
  } catch (error) {
    return toErrorResponse(error, "Failed to load organizations.");
  }
}
