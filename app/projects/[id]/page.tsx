import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge, BodyText, Button, Card, CardTitle, Eyebrow, SectionTitle } from "@canopy/ui";
import { StoriesShell } from "@/app/_components/stories-shell";
import { getProjectDetailSnapshot } from "@/lib/stories-data";
import { formatRelativeDate } from "@/lib/stories-domain";

type ProjectDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

function formatDeadline(value: string | null) {
  if (!value) {
    return "No deadline set";
  }

  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function stageClass(stage: string) {
  if (stage === "delivered") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (stage === "asset_generation" || stage === "packaging") {
    return "border-amber-200 bg-amber-50 text-amber-700";
  }

  return "border-indigo-200 bg-indigo-50 text-indigo-700";
}

export default async function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  const { id } = await params;
  const snapshot = await getProjectDetailSnapshot(id);

  if (!snapshot) {
    notFound();
  }

  const { project, forms, submissions, stories } = snapshot;

  return (
    <StoriesShell
      activeNav="projects"
      eyebrow={project.workspaceName}
      title={project.name}
      subtitle={project.description || "Live project workspace for forms, submissions, and linked story records."}
      headerMeta={`Updated ${formatRelativeDate(project.updatedAt)} · Deadline ${formatDeadline(project.deadlineAt)}`}
      headerActions={
        <>
          <Button asChild variant="secondary">
            <Link href="/projects">Back to projects</Link>
          </Button>
          <Button asChild variant="primary">
            <Link href="/forms">Open forms</Link>
          </Button>
        </>
      }
    >
      <section className="grid gap-4 md:grid-cols-4">
        <Card padding="sm" className="rounded-[24px]">
          <Eyebrow className="text-slate-400">Intake forms</Eyebrow>
          <SectionTitle className="mt-3 text-3xl sm:text-3xl">{forms.length}</SectionTitle>
          <BodyText muted className="mt-2">Published forms attached to this project.</BodyText>
        </Card>
        <Card padding="sm" className="rounded-[24px]">
          <Eyebrow className="text-slate-400">Submissions</Eyebrow>
          <SectionTitle className="mt-3 text-3xl sm:text-3xl">{submissions.length}</SectionTitle>
          <BodyText muted className="mt-2">Saved source-material entries received so far.</BodyText>
        </Card>
        <Card padding="sm" className="rounded-[24px]">
          <Eyebrow className="text-slate-400">Stories in flight</Eyebrow>
          <SectionTitle className="mt-3 text-3xl sm:text-3xl">{project.activeStories}</SectionTitle>
          <BodyText muted className="mt-2">Story records not yet in the delivered stage.</BodyText>
        </Card>
        <Card padding="sm" className="rounded-[24px]">
          <Eyebrow className="text-slate-400">Delivered stories</Eyebrow>
          <SectionTitle className="mt-3 text-3xl sm:text-3xl">{project.deliveredStories}</SectionTitle>
          <BodyText muted className="mt-2">Story records currently marked delivered.</BodyText>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <Card padding="md" className="sm:p-7">
          <Eyebrow className="text-[#4f46e5]">Published forms</Eyebrow>
          <SectionTitle className="mt-3">Live intake entry points</SectionTitle>
          <div className="mt-5 space-y-4">
            {forms.map((form) => (
              <Card key={form.id} variant="soft" padding="sm" className="rounded-[24px]">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <CardTitle className="text-base">{form.title}</CardTitle>
                    <BodyText muted className="mt-2">
                      {form.submissionCount} submission{form.submissionCount === 1 ? "" : "s"} · {form.storyType.replace("_", "/")}
                    </BodyText>
                  </div>
                  <Button asChild variant="secondary" size="sm">
                    <Link href={form.shareablePath}>Open form</Link>
                  </Button>
                </div>
              </Card>
            ))}
            {forms.length === 0 ? (
              <Card padding="md" className="sm:p-7">
                <CardTitle>No forms yet</CardTitle>
                <BodyText muted className="mt-2">Create or promote a form from the Forms workspace to start intake for this project.</BodyText>
              </Card>
            ) : null}
          </div>
        </Card>

        <Card padding="md" className="sm:p-7">
          <Eyebrow className="text-[#4f46e5]">Linked stories</Eyebrow>
          <SectionTitle className="mt-3">Records created from intake</SectionTitle>
          <div className="mt-5 space-y-4">
            {stories.map((story) => (
              <Card key={story.id} variant="soft" padding="sm" className="rounded-[24px]">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <CardTitle className="text-base">{story.title}</CardTitle>
                    <BodyText muted className="mt-2">
                      {story.subjectName || "No subject name"} · updated {formatRelativeDate(story.updatedAt)}
                    </BodyText>
                  </div>
                  <span className={`inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] ${stageClass(story.currentStage)}`}>
                    {story.currentStage.replace(/_/g, " ")}
                  </span>
                </div>
              </Card>
            ))}
            {stories.length === 0 ? (
              <Card padding="md" className="sm:p-7">
                <CardTitle>No story records yet</CardTitle>
                <BodyText muted className="mt-2">Once a public form is submitted, the linked story records will appear here.</BodyText>
              </Card>
            ) : null}
          </div>
        </Card>
      </section>

      <section>
        <Card padding="md" className="sm:p-7">
          <Eyebrow className="text-[#4f46e5]">Incoming submissions</Eyebrow>
          <SectionTitle className="mt-3">Source material tied to this project</SectionTitle>
          <div className="mt-5 space-y-4">
            {submissions.map((item) => (
              <Card key={item.submission.id} variant="soft" padding="sm" className="rounded-[24px]">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <CardTitle className="text-base">{item.submission.submitterName || "Unnamed submitter"}</CardTitle>
                    <BodyText muted className="mt-2">
                      {item.formTitle} · submitted {formatRelativeDate(item.submission.submittedAt)}
                    </BodyText>
                    <BodyText muted className="mt-2">
                      {item.submission.submitterEmail || "No email provided"}
                    </BodyText>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="emerald" className="text-[11px] uppercase tracking-[0.08em]">
                      {item.submission.status}
                    </Badge>
                    {item.story ? (
                      <span className={`inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] ${stageClass(item.story.currentStage)}`}>
                        {item.story.currentStage.replace(/_/g, " ")}
                      </span>
                    ) : null}
                  </div>
                </div>
              </Card>
            ))}
            {submissions.length === 0 ? (
              <Card padding="md" className="sm:p-7">
                <CardTitle>No submissions yet</CardTitle>
                <BodyText muted className="mt-2">Open one of this project’s public forms and submit a test entry to populate this view.</BodyText>
              </Card>
            ) : null}
          </div>
        </Card>
      </section>
    </StoriesShell>
  );
}
