import Link from "next/link";
import { BodyText, Button, Card, CardTitle, Eyebrow, SectionTitle } from "@canopy/ui";
import { StoriesShell } from "@/app/_components/stories-shell";
import { getStoriesOverviewSnapshot } from "@/lib/stories-data";
import { formatRelativeDate } from "@/lib/stories-domain";

type HomePageProps = {
  searchParams?: Promise<{
    workspace?: string;
  }>;
};

function DashboardStatCard({
  title,
  value,
  trend,
}: {
  title: string;
  value: string | number;
  trend?: string;
}) {
  return (
    <Card padding="sm" className="rounded-[20px] border border-[var(--border)] bg-white">
      <div className="flex items-start justify-between gap-3">
        <CardTitle className="text-sm font-medium text-[var(--text-muted)]">{title}</CardTitle>
        <div className="h-5 w-5 rounded-md border border-[var(--border)] bg-[var(--surface-muted)]" aria-hidden="true" />
      </div>
      <SectionTitle className="mt-4 text-[2rem] leading-none sm:text-[2rem]">{value}</SectionTitle>
      {trend ? (
        <BodyText muted className="mt-2 text-[13px] text-emerald-600">
          {trend}
        </BodyText>
      ) : null}
    </Card>
  );
}

function stageLabel(value: string) {
  return value.replace(/_/g, " ");
}

function stageClass(stage: string) {
  if (stage === "delivered") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (stage === "asset_generation" || stage === "packaging") {
    return "border-amber-200 bg-amber-50 text-amber-700";
  }

  if (stage === "submitted") {
    return "border-blue-200 bg-blue-50 text-blue-700";
  }

  return "border-indigo-200 bg-indigo-50 text-indigo-700";
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const params = (await searchParams) ?? {};
  const workspace = params.workspace?.trim() || null;
  const overview = await getStoriesOverviewSnapshot();

  return (
    <StoriesShell
      activeNav="home"
      eyebrow="Dashboard"
      title="Dashboard"
      subtitle="Automated production pipeline for success story creation"
      headerMeta={
        workspace
          ? `Workspace context received: ${workspace}`
          : `${overview.workspaceCount} workspace${overview.workspaceCount === 1 ? "" : "s"} in the current Stories dataset`
      }
      headerActions={
        <Button asChild variant="primary" className="!text-white hover:!text-white">
          <Link href="/projects">New Project</Link>
        </Button>
      }
    >
      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <DashboardStatCard
          title="Active Projects"
          value={overview.activeProjectCount}
          trend={overview.projectCount > 0 ? `${overview.projectCount} total` : undefined}
        />
        <DashboardStatCard title="Forms Submitted" value={overview.submissionCount} />
        <DashboardStatCard title="In Production" value={overview.storiesInProductionCount} />
        <DashboardStatCard title="Delivered" value={overview.deliveredCount} />
        <DashboardStatCard title="Avg Processing" value="12m" trend="Target: 10-15m" />
        <DashboardStatCard title="Success Rate" value="100%" trend="Fully automated" />
      </section>

      <section>
        <div className="mb-4">
          <SectionTitle className="text-[2rem] sm:text-[2rem]">Automation Pipeline</SectionTitle>
          <BodyText muted className="mt-1">Real-time view of stories moving through automated stages</BodyText>
        </div>

        {overview.pipelineStories.length > 0 ? (
          <div className="flex gap-4 overflow-x-auto pb-2">
            {overview.workflow.map((stage) => {
              const stories = overview.pipelineStories.filter((story) => story.stage === stage.stage);

              return (
                <Card key={stage.stage} padding="sm" className="w-72 shrink-0 rounded-[20px] border border-[var(--border)] bg-white">
                  <div className="flex items-center justify-between gap-2">
                    <CardTitle className="text-sm">{stageLabel(stage.stage)}</CardTitle>
                    <span className="rounded-full border border-[var(--border)] bg-[var(--surface-muted)] px-2.5 py-1 text-xs text-[var(--text-muted)]">
                      {stories.length}
                    </span>
                  </div>
                  <div className="mt-4 space-y-3">
                    {stories.map((story) => (
                      <Link key={story.id} href={`/stories/${story.id}`} className="block">
                        <Card
                          variant="soft"
                          padding="sm"
                          className="rounded-[18px] border border-[var(--border)] bg-[var(--surface-muted)] transition hover:border-slate-300"
                        >
                          <CardTitle className="text-sm">{story.title}</CardTitle>
                          <BodyText muted className="mt-2">{story.subject}</BodyText>
                          <span className={`mt-3 inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] ${stageClass(story.stage)}`}>
                            {story.type.replace("_", "/")}
                          </span>
                        </Card>
                      </Link>
                    ))}
                    {stories.length === 0 ? (
                      <div className="rounded-[18px] border border-dashed border-[var(--border)] bg-[var(--surface-muted)] px-4 py-8 text-center text-sm text-[var(--text-muted)]">
                        No stories
                      </div>
                    ) : null}
                  </div>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card padding="md" className="rounded-[24px] border border-[var(--border)] bg-white text-center sm:p-12">
            <div className="mx-auto h-12 w-12 rounded-full border border-[var(--border)] bg-[var(--surface-muted)]" aria-hidden="true" />
            <SectionTitle className="mt-6 text-[1.9rem] sm:text-[1.9rem]">No stories in pipeline yet</SectionTitle>
            <BodyText muted className="mt-3">Create a project and submit a form to see the automation in action</BodyText>
            <Button asChild variant="primary" className="mt-6 !text-white hover:!text-white">
              <Link href="/projects">Get Started</Link>
            </Button>
          </Card>
        )}
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between gap-4">
          <SectionTitle className="text-[2rem] sm:text-[2rem]">Recent Projects</SectionTitle>
          <Button asChild variant="ghost" size="sm">
            <Link href="/projects">View All</Link>
          </Button>
        </div>

        {overview.recentProjects.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {overview.recentProjects.map((project) => (
              <Link key={project.id} href={`/projects/${project.id}`} className="block">
                <Card padding="md" className="rounded-[20px] border border-[var(--border)] bg-white transition hover:border-slate-300 sm:p-6">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <BodyText muted className="text-sm">{project.workspaceName}</BodyText>
                      <CardTitle className="mt-2 text-xl">{project.name}</CardTitle>
                    </div>
                    <div className="h-8 w-8 rounded-full border border-[var(--border)] bg-[var(--surface-muted)]" aria-hidden="true" />
                  </div>

                  <div className="mt-5 space-y-3 text-sm text-[var(--text-muted)]">
                    <div>
                      {project.activeStories + project.deliveredStories} stor{project.activeStories + project.deliveredStories === 1 ? "y" : "ies"}
                    </div>
                    <div>
                      {project.formsSubmitted} of {(project.storyCountTarget ?? project.formsSubmitted) || 1} submitted
                    </div>
                    <div>{project.deadlineAt ? new Date(project.deadlineAt).toLocaleDateString() : formatRelativeDate(project.updatedAt)}</div>
                  </div>

                  <span className={`mt-5 inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] ${stageClass(project.status === "delivered" ? "delivered" : project.status === "active" ? "submitted" : "form_sent")}`}>
                    {project.status}
                  </span>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <Card padding="md" className="rounded-[24px] border border-[var(--border)] bg-white text-center sm:p-10">
            <SectionTitle className="text-[1.8rem] sm:text-[1.8rem]">No projects yet</SectionTitle>
            <BodyText muted className="mt-3">Create your first project to start automating success story production</BodyText>
            <Button asChild variant="primary" className="mt-6 !text-white hover:!text-white">
              <Link href="/projects">Create Project</Link>
            </Button>
          </Card>
        )}
      </section>
    </StoriesShell>
  );
}
