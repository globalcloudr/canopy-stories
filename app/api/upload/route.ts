import { NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
const BUCKET = "story-photos";

export async function POST(request: Request) {
  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json({ error: "Storage not configured." }, { status: 500 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided." }, { status: 400 });
    }

    const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
    const path = `uploads/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    const buffer = await file.arrayBuffer();

    const uploadRes = await fetch(
      `${supabaseUrl}/storage/v1/object/${BUCKET}/${path}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${serviceRoleKey}`,
          "Content-Type": file.type || "image/jpeg",
          "x-upsert": "true",
        },
        body: buffer,
      }
    );

    if (!uploadRes.ok) {
      const err = await uploadRes.text();
      return NextResponse.json({ error: `Upload failed: ${err}` }, { status: 500 });
    }

    const publicUrl = `${supabaseUrl}/storage/v1/object/public/${BUCKET}/${path}`;
    return NextResponse.json({ url: publicUrl });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Upload failed." },
      { status: 500 }
    );
  }
}
