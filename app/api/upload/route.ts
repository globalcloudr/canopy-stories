import { NextResponse } from "next/server";
import { getFlatFormById } from "@/lib/stories-data";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import {
  ensurePrivateStoriesBucket,
  signStoryStorageRef,
  uploadStoryStorageObject,
} from "@/lib/stories-storage";

const BUCKET = "story-photos";
const MAX_FILE_BYTES = 10 * 1024 * 1024;
const ALLOWED_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

type SniffedType = "image/jpeg" | "image/png" | "image/webp";

const EXTENSION_BY_TYPE: Record<SniffedType, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

/**
 * Determine the real image type from the file's magic bytes rather than the
 * client-declared `file.type`, which is trivially spoofable on a public,
 * unauthenticated endpoint. Returns null if the content isn't a supported image.
 */
async function sniffImageType(file: File): Promise<SniffedType | null> {
  const header = Buffer.from(await file.slice(0, 12).arrayBuffer());
  if (header.length >= 3 && header[0] === 0xff && header[1] === 0xd8 && header[2] === 0xff) {
    return "image/jpeg";
  }
  if (
    header.length >= 8 &&
    header[0] === 0x89 &&
    header[1] === 0x50 &&
    header[2] === 0x4e &&
    header[3] === 0x47 &&
    header[4] === 0x0d &&
    header[5] === 0x0a &&
    header[6] === 0x1a &&
    header[7] === 0x0a
  ) {
    return "image/png";
  }
  if (
    header.length >= 12 &&
    header.toString("ascii", 0, 4) === "RIFF" &&
    header.toString("ascii", 8, 12) === "WEBP"
  ) {
    return "image/webp";
  }
  return null;
}

export async function POST(request: Request) {
  try {
    // Public, unauthenticated endpoint — throttle per IP to prevent storage
    // abuse / cost DoS. (A submission typically uploads a handful of photos.)
    const limit = await checkRateLimit({
      name: "story-photo-upload",
      identifier: getClientIp(request),
      limit: 40,
      windowSeconds: 60 * 60,
    });
    if (!limit.ok) {
      return NextResponse.json(
        { error: "Too many uploads. Please try again later." },
        { status: 429 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file");
    const formId = (formData.get("formId") as string | null)?.trim() || "";

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file provided." }, { status: 400 });
    }
    if (!formId) {
      return NextResponse.json({ error: "formId is required." }, { status: 400 });
    }
    if (file.size > MAX_FILE_BYTES) {
      return NextResponse.json({ error: "Image must be 10MB or smaller." }, { status: 400 });
    }

    // Verify actual content, not the declared MIME type.
    const sniffedType = await sniffImageType(file);
    if (!sniffedType || !ALLOWED_MIME_TYPES.has(sniffedType)) {
      return NextResponse.json(
        { error: "Only JPG, PNG, and WEBP images are supported." },
        { status: 400 }
      );
    }

    const form = await getFlatFormById(formId);
    if (!form) {
      return NextResponse.json({ error: "Form not found." }, { status: 404 });
    }

    const workspaceId = form.workspaceId;
    const ext = EXTENSION_BY_TYPE[sniffedType];
    const path = `${workspaceId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    await ensurePrivateStoriesBucket(BUCKET, {
      fileSizeLimit: `${MAX_FILE_BYTES}`,
      allowedMimeTypes: [...ALLOWED_MIME_TYPES],
    });
    const photoRef = await uploadStoryStorageObject({
      bucket: BUCKET,
      path,
      file,
      contentType: sniffedType,
      upsert: false,
    });
    const previewUrl = await signStoryStorageRef(photoRef, 60 * 30);
    return NextResponse.json({ url: previewUrl, photoRef });
  } catch (error) {
    console.error("[upload] failed", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Upload failed." },
      { status: 500 }
    );
  }
}
