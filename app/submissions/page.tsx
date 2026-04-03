export const dynamic = "force-dynamic";
import Link from "next/link";
import { Badge, BodyText, Button, CardTitle } from "@canopy/ui";
import { StoriesShell } from "@/app/_components/stories-shell";
import { listSubmissionItems } from "@/lib/stories-data";
import { formatRelativeDate, pipelineStageLabel, storyTypeLabel } from "@/lib/stories-domain";

function submissionStatusVariant(status: string): "sky" | "emerald" | "outline" | "paused" {
  if (status === "reviewed") return "sky";
  if (status === "processing") return "paused";
  if (status === "archived") return "outline";
  return "emerald";
}

export default async function SubmissionsPage({
  searchParams,
}: {
  searchParams?: Promise<{ workspace?: string | string[] }>;
}) {
  const params = searchParams ? await searchParams : undefined;
  const workspaceSlug = typeof params?.workspace === "string" ? params.workspace.trim() || null : null;
  const items = await listSubmissionItems(workspaceSlug);

  return (
    <StoriesShell
      activeNav="stories"
      eyebrow="Submissions"
      title="Submissions"
      subtitle="Responses received from intake forms"
      headerMeta={`${items.length} submission${items.length === 1 ? "" : "s"}`}
    >
      {items.length === 0 ? (
        <div className="py-12 text-center">
          <CardTitle>No submissions yet</CardTitle>
          <BodyText muted className="mt-2">
            Once a public form is submitted, responses will appear here.
          </BodyText>
        </div>
      ) : (
        <div className="rounded-[24px] border border-[#dfe7f4] bg-transparent shadow-none divide-y divide-[var(--border)]">
          {items.map((item) => (
            <div key={item.submission.id} className="flex flex-wrap items-start justify-between gap-3 px-5 py-5">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-medium text-[var(--foreground)]">
                    {item.submission.submitterName || "Unnamed respondent"}
                  </span>
                  <Badge variant={submissionStatusVariant(item.submission.status)} className="text-[11px] uppercase tracking-[0.08em]">
                    {item.submission.status}
                  </Badge>
                  {item.story && (
                    <span className="rounded-full border border-indigo-200 bg-indigo-50 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-indigo-700">
                      {pipelineStageLabel(item.story.currentStage)}
                    </span>
                  )}
                </div>
                <BodyText muted className="mt-1 text-[13px]">
                  {item.workspaceName} · {item.formTitle} · {formatRelativeDate(item.submission.submittedAt)}
                </BodyText>
                {item.story && (
                  <BodyText muted className="mt-0.5 text-[13px]">
                    {item.story.title}
                    {" · "}
                    <span className="text-[var(--text-muted)]">{storyTypeLabel(item.story.storyType)}</span>
                  </BodyText>
                )}
              </div>
              {item.story && (
                <Button asChild variant="secondary" size="sm">
                  <Link href={`/stories/${item.story.id}`}>Open Story</Link>
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
    </StoriesShell>
  );
}
