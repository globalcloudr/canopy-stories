import { NextResponse } from "next/server";
import { listSubmissionsForForm } from "@/lib/stories-data";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const formId = searchParams.get("formId");

  if (!formId) {
    return NextResponse.json({ error: "formId is required." }, { status: 400 });
  }

  try {
    const items = await listSubmissionsForForm(formId);
    return NextResponse.json(items);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to load submissions." },
      { status: 500 }
    );
  }
}
