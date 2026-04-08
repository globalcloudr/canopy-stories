export const dynamic = "force-dynamic";
import React from "react";
import Link from "next/link";
import { AppPill, BodyText, Button, Card, CardTitle, DashboardHero, SectionTitle } from "@canopy/ui";
import { StoriesShell } from "@/app/_components/stories-shell";
import { getStoriesOverviewSnapshot } from "@/lib/stories-data";
import { formatRelativeDate, pipelineStageLabel, storyTypeLabel } from "@/lib/stories-domain";
import { buildWorkspaceHref } from "@/lib/workspace-href";

function DashboardActionCard({
  title,
  description,
  ctaLabel,
  ctaHref,
  eyebrow,
  icon,
}: {
  title: string;
  description: string;
  ctaLabel: string;
  ctaHref: string;
  eyebrow?: string;
  icon?: React.ReactNode;
}) {
  return (
    <Card padding="sm" className="flex h-full flex-col rounded-[20px] border border-[#dfe7f4] bg-transparent shadow-none">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          {eyebrow ? (
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#7b8ca3]">{eyebrow}</p>
          ) : null}
          <CardTitle className="mt-2 text-[1.2rem] leading-snug">{title}</CardTitle>
        </div>
        {icon && (
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-[#d7e3f3] bg-[#edf3fb] text-[var(--text-muted)]" aria-hidden="true">
            {icon}
          </div>
        )}
      </div>
      <BodyText muted className="mt-4 flex-1 text-[14px] leading-6">{description}</BodyText>
      <div className="mt-5">
        <Button asChild variant="secondary" size="sm">
          <Link href={ctaHref}>{ctaLabel}</Link>
        </Button>
      </div>
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

export default async function HomePage({
  searchParams,
}: {
  searchParams?: Promise<{ workspace?: string | string[] }>;
}) {
  const params = searchParams ? await searchParams : undefined;
  const workspaceSlug = typeof params?.workspace === "string" ? params.workspace.trim() || null : null;
  const overview = await getStoriesOverviewSnapshot(workspaceSlug);
  const setupDescription = overview.projectCount === 0
    ? "Add your API keys in Settings, then create your first project to start collecting stories."
    : overview.formCount === 0
      ? "Your project is live. Create an intake form next so students, staff, and partners can respond."
      : "Review your API keys, templates, and notification email so your workflow is ready to run smoothly.";
  const shareFormDescription = overview.formCount > 0
    ? `${overview.formCount} form${overview.formCount === 1 ? " is" : "s are"} ready to share with students, staff, and partners.`
    : "You do not have a live intake form yet. Create one and start collecting responses.";
  const reviewTitle = overview.storiesReadyForReviewCount > 0
    ? `Review ${overview.storiesReadyForReviewCount} stor${overview.storiesReadyForReviewCount === 1 ? "y" : "ies"}`
    : "Review stories";
  const reviewDescription = overview.storiesReadyForReviewCount > 0
    ? "New AI-generated drafts are ready for approval before your team publishes them."
    : "When new drafts are ready, they will appear here so your team can approve them quickly.";
  const packageTitle = overview.packagesReadyCount > 0
    ? `${overview.packagesReadyCount} ready-to-publish package${overview.packagesReadyCount === 1 ? "" : "s"}`
    : "Ready-to-publish package";
  const packageDescription = overview.packagesReadyCount > 0
    ? "Your ready-to-publish packages are waiting with downloadable copy, graphics, and video."
    : "Delivered story packages will appear here when content and assets are ready to download.";

  return (
    <StoriesShell activeNav="home">
      <DashboardHero
        eyebrow="Canopy Stories"
        headline="Turn Responses Into Stories"
        subheading="An automated workflow for turning school responses into ready-to-use stories."
        ctaLabel="New Project"
        ctaHref={buildWorkspaceHref("/projects", workspaceSlug)}
        illustration={
          <svg width="140" height="120" viewBox="0 0 140 120" fill="none" aria-hidden="true">
            <rect x="25" y="20" width="64" height="80" rx="10" stroke="currentColor" strokeWidth="2" />
            <rect x="35" y="15" width="64" height="80" rx="10" stroke="currentColor" strokeWidth="2" opacity="0.6" />
            <line x1="45" y1="45" x2="75" y2="45" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <line x1="45" y1="57" x2="82" y2="57" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.7" />
            <line x1="45" y1="69" x2="68" y2="69" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
            <circle cx="108" cy="32" r="7" stroke="currentColor" strokeWidth="2" opacity="0.8" />
            <path d="M105 32 L107.5 34.5 L112 29" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" opacity="0.8" />
          </svg>
        }
      />
      <section>
        <div className="mb-4">
          <SectionTitle className="text-[2rem] sm:text-[2rem]">Next Steps</SectionTitle>
          <BodyText muted className="mt-1">The fastest ways to keep story collection and publishing moving.</BodyText>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <DashboardActionCard
            eyebrow="Setup"
            title="Finish setup"
            description={setupDescription}
            ctaLabel="Open settings"
            ctaHref={buildWorkspaceHref("/settings", workspaceSlug)}
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
              <path d="M12 3.5l2.1 1.2 2.4-.2 1.2 2.1 2 1.3-.2 2.4L20.5 12l-1.2 2.1.2 2.4-2.1 1.2-1.3 2-2.4-.2L12 20.5l-2.1 1.2-2.4-.2-1.2-2.1-2-1.3.2-2.4L3.5 12l1.2-2.1-.2-2.4 2.1-1.2 1.3-2 2.4.2Z" />
              <circle cx="12" cy="12" r="3.2" />
            </svg>
          }
        />
          <DashboardActionCard
            eyebrow="Intake"
            title="Share a form"
            description={shareFormDescription}
            ctaLabel={overview.formCount > 0 ? "Open forms" : "Create form"}
            ctaHref={buildWorkspaceHref("/forms", workspaceSlug)}
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
              <path d="M8.5 7h7M8.5 11h7M8.5 15h4" strokeLinecap="round" />
            </svg>
          }
        />
          <DashboardActionCard
            eyebrow="Review"
            title={reviewTitle}
            description={reviewDescription}
            ctaLabel="Open stories"
            ctaHref={buildWorkspaceHref("/stories", workspaceSlug)}
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
              <path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="12" cy="12" r="9" />
            </svg>
          }
        />
          <DashboardActionCard
            eyebrow="Delivery"
            title={packageTitle}
            description={packageDescription}
            ctaLabel="View delivered stories"
            ctaHref={buildWorkspaceHref("/stories", workspaceSlug)}
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
              <path d="M3.75 9.776c.112-.017.227-.026.344-.026h15.812c.117 0 .232.009.344.026m-16.5 0a2.25 2.25 0 00-1.883 2.542l.857 6a2.25 2.25 0 002.227 1.932H19.05a2.25 2.25 0 002.227-1.932l.857-6a2.25 2.25 0 00-1.883-2.542m-16.5 0V6A2.25 2.25 0 016 3.75h3.879a1.5 1.5 0 011.06.44l2.122 2.12a1.5 1.5 0 001.06.44H18A2.25 2.25 0 0120.25 9v.776" />
            </svg>
          }
        />
        </div>
      </section>

      <section>
        <div className="mb-4">
          <SectionTitle className="text-[2rem] sm:text-[2rem]">Story Progress</SectionTitle>
          <BodyText muted className="mt-1">Where each story is right now — from first response to final delivery</BodyText>
        </div>

        {overview.pipelineStories.length > 0 ? (
          <div className="flex gap-4 overflow-x-auto pb-2">
            {overview.workflow.map((stage) => {
              const stories = overview.pipelineStories.filter((story) => story.stage === stage.stage);

              return (
                <Card key={stage.stage} padding="sm" className="w-72 shrink-0 rounded-[20px] border border-[#dfe7f4] bg-transparent shadow-none">
                  <div className="flex items-center justify-between gap-2">
                    <CardTitle className="text-sm">{pipelineStageLabel(stage.stage)}</CardTitle>
                    <AppPill size="sm">
                      {stories.length}
                    </AppPill>
                  </div>
                  <div className="mt-4 space-y-3">
                    {stories.map((story) => (
                      <Link key={story.id} href={buildWorkspaceHref(`/stories/${story.id}`, workspaceSlug)} className="block">
                        <Card
                          variant="soft"
                          padding="sm"
                          className="rounded-[18px] border border-[#dfe7f4] bg-white/62 transition hover:border-[#c8d7eb] hover:bg-white/78"
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
                      <div className="rounded-[18px] border border-dashed border-[#dfe7f4] bg-transparent px-4 py-8 text-center text-sm text-[var(--text-muted)]">
                        No stories
                      </div>
                    ) : null}
                  </div>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card padding="md" className="rounded-[24px] border border-[#dfe7f4] bg-transparent text-center shadow-none sm:p-12">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-[#d7e3f3] bg-[#edf3fb] text-[var(--text-muted)]" aria-hidden="true">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
                <path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
              </svg>
            </div>
            <SectionTitle className="mt-6 text-[1.9rem] sm:text-[1.9rem]">No stories in progress yet</SectionTitle>
            <BodyText muted className="mt-3">Create a project and collect your first response to see stories move through here</BodyText>
            <Button asChild variant="primary" className="mt-6">
              <Link href={buildWorkspaceHref("/projects", workspaceSlug)}>Get Started</Link>
            </Button>
          </Card>
        )}
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between gap-4">
          <SectionTitle className="text-[2rem] sm:text-[2rem]">Recent Projects</SectionTitle>
          <Button asChild variant="ghost" size="sm">
            <Link href={buildWorkspaceHref("/projects", workspaceSlug)}>View All</Link>
          </Button>
        </div>

        {overview.recentProjects.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {overview.recentProjects.map((project) => (
              <Link key={project.id} href={buildWorkspaceHref(`/projects/${project.id}`, workspaceSlug)} className="block">
                <Card padding="md" className="rounded-[20px] border border-[#dfe7f4] bg-transparent shadow-none transition hover:border-[#c8d7eb] hover:bg-white/65 sm:p-6">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <BodyText muted className="text-sm">{project.workspaceName}</BodyText>
                      <CardTitle className="mt-2 text-xl">{project.name}</CardTitle>
                    </div>
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#d7e3f3] bg-[#edf3fb] text-[var(--text-muted)]" aria-hidden="true">
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
          <Card padding="md" className="rounded-[24px] border border-[#dfe7f4] bg-transparent text-center shadow-none sm:p-10">
            <SectionTitle className="text-[1.8rem] sm:text-[1.8rem]">No projects yet</SectionTitle>
            <BodyText muted className="mt-3">Create your first project to start collecting and delivering success stories</BodyText>
            <Button asChild variant="primary" className="mt-6">
              <Link href={buildWorkspaceHref("/projects", workspaceSlug)}>Create Project</Link>
            </Button>
          </Card>
        )}
      </section>
    </StoriesShell>
  );
}
