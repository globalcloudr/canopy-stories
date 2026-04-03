import { createHash } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { createSubmissionFromPublicForm } from "@/lib/stories-data";

const RATE_LIMIT_MAX = 10;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

function getIpHash(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded ? forwarded.split(",")[0].trim() : "unknown";
  return createHash("sha256").update(ip).digest("hex");
}

async function checkRateLimit(formId: string, ipHash: string): Promise<boolean> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) return true; // fail open if misconfigured

  const client = createClient(supabaseUrl, serviceRoleKey);
  const windowStart = new Date(Date.now() - RATE_LIMIT_WINDOW_MS).toISOString();

  const { count } = await client
    .from("form_submission_rate_limits")
    .select("id", { count: "exact", head: true })
    .eq("form_id", formId)
    .eq("ip_hash", ipHash)
    .gte("created_at", windowStart);

  if ((count ?? 0) >= RATE_LIMIT_MAX) return false;

  await client.from("form_submission_rate_limits").insert({ form_id: formId, ip_hash: ipHash });
  return true;
}

export async function POST(request: Request, context: RouteContext) {
  const { id } = await context.params;

  const ipHash = getIpHash(request);
  const allowed = await checkRateLimit(id, ipHash);
  if (!allowed) {
    return NextResponse.json(
      { error: "Too many submissions. Please try again later." },
      { status: 429 }
    );
  }

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
