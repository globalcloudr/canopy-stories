export const dynamic = "force-dynamic";
import React from "react";
import Link from "next/link";
import { BodyText, Button, Card, CardTitle, SectionTitle } from "@canopy/ui";
import { StoriesShell } from "@/app/_components/stories-shell";
import { getStoriesOverviewSnapshot } from "@/lib/stories-data";
import { formatRelativeDate, pipelineStageLabel, storyTypeLabel } from "@/lib/stories-domain";

type HomePageProps = {
  searchParams?: Promise<{
    workspace?: string;
  }>;
};

function DashboardStatCard({
  title,
  value,
  trend,
  icon,
}: {
  title: string;
  value: string | number;
  trend?: string;
  icon?: React.ReactNode;
}) {
  return (
    <Card padding="sm" className="rounded-[20px] border border-[var(--border)] bg-white">
      <div className="flex items-start justify-between gap-3">
        <CardTitle className="text-sm font-medium text-[var(--text-muted)]">{title}</CardTitle>
        {icon && (
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-[var(--border)] bg-[var(--surface-muted)] text-[var(--text-muted)]" aria-hidden="true">
            {icon}
          </div>
        )}
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
        <Button asChild variant="primary">
          <Link href="/projects">New Project</Link>
        </Button>
      }
    >
      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <DashboardStatCard
          title="Active Projects"
          value={overview.activeProjectCount}
          trend={overview.projectCount > 0 ? `${overview.projectCount} total` : undefined}
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
              <path d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
            </svg>
          }
        />
        <DashboardStatCard
          title="Responses Received"
          value={overview.submissionCount}
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
              <path d="M21.75 9v.906a2.25 2.25 0 01-1.183 1.981l-6.478 3.488M2.25 9v.906a2.25 2.25 0 001.183 1.981l6.478 3.488m8.839 2.51l-4.66-2.51m0 0l-1.023-.55a2.25 2.25 0 00-2.134 0l-1.022.55m0 0l-4.661 2.51m16.5 1.615a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V8.844a2.25 2.25 0 011.183-1.98l7.5-4.04a2.25 2.25 0 012.134 0l7.5 4.04a2.25 2.25 0 011.183 1.98V19.5z" />
            </svg>
          }
        />
        <DashboardStatCard
          title="Stories in Progress"
          value={overview.storiesInProductionCount}
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
              <path d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
            </svg>
          }
        />
        <DashboardStatCard
          title="Delivered"
          value={overview.deliveredCount}
          trend={overview.deliveredCount > 0 ? "Ready to use" : undefined}
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
              <path d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <DashboardStatCard
          title="Avg Turnaround"
          value="12m"
          trend="From submission to delivery"
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
              <path d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <DashboardStatCard
          title="Completion Rate"
          value="100%"
          trend="All stories delivered"
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
              <path d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
            </svg>
          }
        />
      </section>

      <section>
        <div className="mb-4">
          <SectionTitle className="text-[2rem] sm:text-[2rem]">Stories in Progress</SectionTitle>
          <BodyText muted className="mt-1">Where each story is right now — from first response to final delivery</BodyText>
        </div>

        {overview.pipelineStories.length > 0 ? (
          <div className="flex gap-4 overflow-x-auto pb-2">
            {overview.workflow.map((stage) => {
              const stories = overview.pipelineStories.filter((story) => story.stage === stage.stage);

              return (
                <Card key={stage.stage} padding="sm" className="w-72 shrink-0 rounded-[20px] border border-[var(--border)] bg-white">
                  <div className="flex items-center justify-between gap-2">
                    <CardTitle className="text-sm">{pipelineStageLabel(stage.stage)}</CardTitle>
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
                            {storyTypeLabel(story.type)}
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
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface-muted)] text-[var(--text-muted)]" aria-hidden="true">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
                <path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
              </svg>
            </div>
            <SectionTitle className="mt-6 text-[1.9rem] sm:text-[1.9rem]">No stories in pipeline yet</SectionTitle>
            <BodyText muted className="mt-3">Create a project and collect your first response to see stories move through here</BodyText>
            <Button asChild variant="primary" className="mt-6">
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
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface-muted)] text-[var(--text-muted)]" aria-hidden="true">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                        <path d="M3.75 9.776c.112-.017.227-.026.344-.026h15.812c.117 0 .232.009.344.026m-16.5 0a2.25 2.25 0 00-1.883 2.542l.857 6a2.25 2.25 0 002.227 1.932H19.05a2.25 2.25 0 002.227-1.932l.857-6a2.25 2.25 0 00-1.883-2.542m-16.5 0V6A2.25 2.25 0 016 3.75h3.879a1.5 1.5 0 011.06.44l2.122 2.12a1.5 1.5 0 001.06.44H18A2.25 2.25 0 0120.25 9v.776" />
                      </svg>
                    </div>
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
                    {project.status === "planning" ? "Planning" : project.status === "active" ? "Active" : project.status === "paused" ? "Paused" : "Delivered"}
                  </span>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <Card padding="md" className="rounded-[24px] border border-[var(--border)] bg-white text-center sm:p-10">
            <SectionTitle className="text-[1.8rem] sm:text-[1.8rem]">No projects yet</SectionTitle>
            <BodyText muted className="mt-3">Create your first project to start collecting and delivering success stories</BodyText>
            <Button asChild variant="primary" className="mt-6">
              <Link href="/projects">Create Project</Link>
            </Button>
          </Card>
        )}
      </section>
    </StoriesShell>
  );
}
