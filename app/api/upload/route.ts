import { NextResponse } from "next/server";
import { getFlatFormById } from "@/lib/stories-data";
import {
  ensurePrivateStoriesBucket,
  signStoryStorageRef,
  uploadStoryStorageObject,
} from "@/lib/stories-storage";

const BUCKET = "story-photos";
const MAX_FILE_BYTES = 10 * 1024 * 1024;
const ALLOWED_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

function getExtensionForFile(file: File) {
  switch (file.type) {
    case "image/png":
      return "png";
    case "image/webp":
      return "webp";
    default:
      return "jpg";
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const formId = (formData.get("formId") as string | null)?.trim() || "";

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file provided." }, { status: 400 });
    }
    if (!formId) {
      return NextResponse.json({ error: "formId is required." }, { status: 400 });
    }
    if (!ALLOWED_MIME_TYPES.has(file.type)) {
      return NextResponse.json({ error: "Only JPG, PNG, and WEBP images are supported." }, { status: 400 });
    }
    if (file.size > MAX_FILE_BYTES) {
      return NextResponse.json({ error: "Image must be 10MB or smaller." }, { status: 400 });
    }

    const form = await getFlatFormById(formId);
    if (!form) {
      return NextResponse.json({ error: "Form not found." }, { status: 404 });
    }

    const workspaceId = form.workspaceId;
    const ext = getExtensionForFile(file);
    const path = `${workspaceId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    await ensurePrivateStoriesBucket(BUCKET, {
      fileSizeLimit: `${MAX_FILE_BYTES}`,
      allowedMimeTypes: [...ALLOWED_MIME_TYPES],
    });
    const photoRef = await uploadStoryStorageObject({
      bucket: BUCKET,
      path,
      file,
      contentType: file.type || "image/jpeg",
      upsert: false,
    });
    const previewUrl = await signStoryStorageRef(photoRef, 60 * 30);
    return NextResponse.json({ url: previewUrl, photoRef });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Upload failed." },
      { status: 500 }
    );
  }
}
