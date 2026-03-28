import { Badge, BodyText, Card, CardTitle, Eyebrow, SectionTitle } from "@canopy/ui";
import { StoriesShell } from "@/app/_components/stories-shell";
import { listSubmissionItems } from "@/lib/stories-data";
import { formatRelativeDate } from "@/lib/stories-domain";

function submissionStatusVariant(status: string): "sky" | "emerald" | "outline" | "paused" {
  if (status === "reviewed") {
    return "sky";
  }

  if (status === "processing") {
    return "paused";
  }

  if (status === "archived") {
    return "outline";
  }

  return "emerald";
}

function storyStageClass(stage: string) {
  if (stage === "delivered") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (stage === "asset_generation" || stage === "packaging") {
    return "border-amber-200 bg-amber-50 text-amber-700";
  }

  return "border-indigo-200 bg-indigo-50 text-indigo-700";
}

export default async function SubmissionsPage() {
  const items = await listSubmissionItems();

  return (
    <StoriesShell
      activeNav="submissions"
      eyebrow="Submissions"
      title="Incoming source material"
      subtitle="This is the first operator view tied directly to the persisted intake loop. Each submission should be traceable to the form it came from and the story record it created."
      headerMeta={`${items.length} submission${items.length === 1 ? "" : "s"} in the current Stories dataset`}
    >
      <section className="space-y-4">
        {items.map((item) => (
          <Card key={item.submission.id} padding="md" className="sm:p-7">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <Eyebrow className="text-slate-400">{item.workspaceName}</Eyebrow>
                <SectionTitle className="mt-3 text-2xl sm:text-2xl">
                  {item.submission.submitterName || "Unnamed submitter"}
                </SectionTitle>
                <BodyText muted className="mt-2">
                  {item.formTitle} · {item.projectName} · submitted {formatRelativeDate(item.submission.submittedAt)}
                </BodyText>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge variant={submissionStatusVariant(item.submission.status)} className="text-[11px] uppercase tracking-[0.08em]">
                  {item.submission.status}
                </Badge>
                {item.story ? (
                  <span className={`inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] ${storyStageClass(item.story.currentStage)}`}>
                    {item.story.currentStage.replace(/_/g, " ")}
                  </span>
                ) : null}
              </div>
            </div>

            <div className="mt-5 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="rounded-[24px] border border-[var(--border)] bg-[var(--surface-muted)] p-5">
                <CardTitle className="text-base">Submission details</CardTitle>
                <div className="mt-3 space-y-2">
                  <BodyText muted>Email: {item.submission.submitterEmail || "Not provided"}</BodyText>
                  <BodyText muted>Workspace: {item.workspaceSlug}</BodyText>
                  <BodyText muted>Photos: {item.submission.photoUrls.length}</BodyText>
                </div>
              </div>
              <div className="rounded-[24px] border border-[var(--border)] bg-[var(--surface-muted)] p-5">
                <CardTitle className="text-base">Linked story</CardTitle>
                {item.story ? (
                  <div className="mt-3 space-y-2">
                    <BodyText muted>Title: {item.story.title}</BodyText>
                    <BodyText muted>Type: {item.story.storyType.replace("_", "/")}</BodyText>
                    <BodyText muted>Status: {item.story.status.replace(/_/g, " ")}</BodyText>
                  </div>
                ) : (
                  <BodyText muted className="mt-3">No story record has been created yet.</BodyText>
                )}
              </div>
            </div>
          </Card>
        ))}

        {items.length === 0 ? (
          <Card padding="md" className="sm:p-7">
            <CardTitle>No submissions yet</CardTitle>
            <BodyText muted className="mt-2">
              Once a public form is submitted, this page will show the saved submission and the linked story record.
            </BodyText>
          </Card>
        ) : null}
      </section>
    </StoriesShell>
  );
}
