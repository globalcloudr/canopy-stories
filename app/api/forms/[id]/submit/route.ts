import { createHash } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { createSubmissionFromPublicForm } from "@/lib/stories-data";

const RATE_LIMIT_MAX = 10;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour, per IP
// Per-form daily ceiling — bounds AI/render cost even if an attacker rotates
// or spoofs IPs. Each submission fans out to several paid OpenAI + Creatomate
// calls, so this cap is the real cost backstop. Override via env if a form
// legitimately needs a higher volume.
const PER_FORM_DAILY_MAX = Number(process.env.PUBLIC_FORM_DAILY_CAP) || 100;
const DAY_MS = 24 * 60 * 60 * 1000;

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

/**
 * Trusted client IP. Prefers Vercel's `x-real-ip`, then the LAST hop of
 * `x-forwarded-for`. The FIRST XFF entry is client-supplied and spoofable, so
 * using it (as before) let an attacker bypass the per-IP limit by varying the
 * header.
 */
function getIpHash(request: Request): string {
  const realIp = request.headers.get("x-real-ip")?.trim();
  let ip = realIp || "";
  if (!ip) {
    const forwarded = request.headers.get("x-forwarded-for");
    if (forwarded) {
      const hops = forwarded.split(",").map((part) => part.trim()).filter(Boolean);
      ip = hops.length > 0 ? hops[hops.length - 1] : "";
    }
  }
  return createHash("sha256").update(ip || "unknown").digest("hex");
}

type RateLimitOutcome = "allowed" | "ip_limited" | "form_limited";

async function checkRateLimit(formId: string, ipHash: string): Promise<RateLimitOutcome> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) return "allowed"; // can't check; submission will fail later anyway

  const client = createClient(supabaseUrl, serviceRoleKey);
  const now = Date.now();
  const ipWindowStart = new Date(now - RATE_LIMIT_WINDOW_MS).toISOString();
  const dayWindowStart = new Date(now - DAY_MS).toISOString();

  const [{ count: ipCount }, { count: formCount }] = await Promise.all([
    client
      .from("form_submission_rate_limits")
      .select("id", { count: "exact", head: true })
      .eq("form_id", formId)
      .eq("ip_hash", ipHash)
      .gte("created_at", ipWindowStart),
    client
      .from("form_submission_rate_limits")
      .select("id", { count: "exact", head: true })
      .eq("form_id", formId)
      .gte("created_at", dayWindowStart),
  ]);

  if ((ipCount ?? 0) >= RATE_LIMIT_MAX) return "ip_limited";
  if ((formCount ?? 0) >= PER_FORM_DAILY_MAX) return "form_limited";

  await client.from("form_submission_rate_limits").insert({ form_id: formId, ip_hash: ipHash });
  return "allowed";
}

export async function POST(request: Request, context: RouteContext) {
  const { id } = await context.params;

  const ipHash = getIpHash(request);
  const outcome = await checkRateLimit(id, ipHash);
  if (outcome !== "allowed") {
    return NextResponse.json(
      {
        error:
          outcome === "form_limited"
            ? "This form has reached its submission limit for today. Please try again tomorrow."
            : "Too many submissions. Please try again later.",
      },
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
    console.error("[forms/submit] submission failed", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Submission failed.",
      },
      { status: 400 }
    );
  }
}
