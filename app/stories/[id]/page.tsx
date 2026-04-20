import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge, BodyText, Button, Card, CardTitle, Eyebrow, PageTitle, SectionTitle } from "@globalcloudr/canopy-ui";
import { StoriesShell } from "@/app/_components/stories-shell";
import { getStoryDetailSnapshot } from "@/lib/stories-data";
import { formatRelativeDate, pipelineStageLabel, storyTypeLabel, contentStatusLabel } from "@/lib/stories-domain";
import { ContentReviewButtons } from "./content-review-buttons";
import { StoryProgressBar } from "@/app/_components/story-progress-bar";
import { RegenerateButton } from "./regenerate-button";
import { MarkdownBody } from "@/app/_components/markdown-body";
import { buildWorkspaceHref } from "@/lib/workspace-href";

type StoryDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
  searchParams?: Promise<{
    workspace?: string | string[];
  }>;
};

function stageTone(stage: string) {
  if (stage === "delivered") {
    return "emerald" as const;
  }
  if (stage === "ai_processing" || stage === "asset_generation" || stage === "packaging") {
    return "sky" as const;
  }
  return "outline" as const;
}

export default async function StoryDetailPage({ params, searchParams }: StoryDetailPageProps) {
  const { id } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const workspaceSlug = typeof resolvedSearchParams?.workspace === "string"
    ? resolvedSearchParams.workspace.trim() || null
    : null;
  const snapshot = await getStoryDetailSnapshot(id);

  if (!snapshot) {
    notFound();
  }

  const photoCount = snapshot.assets.filter((asset) => asset.assetType === "image").length;
  const videoCount = snapshot.assets.filter((asset) => asset.assetType === "video").length;

  return (
    <StoriesShell
      activeNav="stories"
      eyebrow="Story"
      title={snapshot.story.title || "Untitled Story"}
      subtitle={`${snapshot.projectName} · ${snapshot.workspaceName}`}
      headerActions={
        <>
          <Link href={buildWorkspaceHref("/stories", workspaceSlug)}>
            <Button variant="secondary">Back to Stories</Button>
          </Link>
          {snapshot.storyPackage ? (
            <Link href={buildWorkspaceHref(`/package/${snapshot.storyPackage.id}`, workspaceSlug)}>
              <Button variant="accent">View Ready-to-Publish Package</Button>
            </Link>
          ) : null}
          <Link href={buildWorkspaceHref("/projects", workspaceSlug)}>
            <Button variant="secondary">View Projects</Button>
          </Link>
          <RegenerateButton storyId={id} />
        </>
      }
      headerMeta={`Created ${formatRelativeDate(snapshot.story.createdAt)}`}
    >
      <section className="space-y-4">
        <StoryProgressBar currentStage={snapshot.story.currentStage} />
        <div className="flex flex-wrap items-center gap-3">
          <Badge variant="outline">{storyTypeLabel(snapshot.story.storyType)}</Badge>
          {snapshot.storyPackage ? <Badge variant="outline">{contentStatusLabel(snapshot.storyPackage.status) || snapshot.storyPackage.status}</Badge> : null}
        </div>
        {snapshot.story.errorMessage ? (
          <Card padding="sm" className="border border-rose-200 bg-rose-50 shadow-none">
            <CardTitle className="text-rose-700">Automation needs attention</CardTitle>
            <BodyText className="mt-2 text-rose-700">{snapshot.story.errorMessage}</BodyText>
          </Card>
        ) : null}
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <Card padding="sm" className="rounded-[20px] border border-[var(--rule)] bg-transparent shadow-none">
          <CardTitle className="text-sm text-[var(--text-muted)]">Subject</CardTitle>
          <SectionTitle className="mt-4 text-3xl sm:text-3xl">{snapshot.story.subjectName || "N/A"}</SectionTitle>
        </Card>
        <Card padding="sm" className="rounded-[20px] border border-[var(--rule)] bg-transparent shadow-none">
          <CardTitle className="text-sm text-[var(--text-muted)]">Content pieces</CardTitle>
          <SectionTitle className="mt-4 text-3xl sm:text-3xl">{snapshot.contents.length}</SectionTitle>
        </Card>
        <Card padding="sm" className="rounded-[20px] border border-[var(--rule)] bg-transparent shadow-none">
          <CardTitle className="text-sm text-[var(--text-muted)]">Assets</CardTitle>
          <SectionTitle className="mt-4 text-3xl sm:text-3xl">{snapshot.assets.length}</SectionTitle>
        </Card>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <Card padding="md" className="border border-[var(--rule)] bg-transparent shadow-none sm:p-7">
          <Eyebrow>Response</Eyebrow>
          <PageTitle className="mt-3 text-[2rem]">About {snapshot.story.subjectName || "this subject"}</PageTitle>
          <div className="mt-5 space-y-4">
            <div className="grid grid-cols-[120px_1fr] gap-2 text-[15px]">
              <span className="text-[var(--text-muted)]">Name</span>
              <span>{snapshot.submission?.submitterName || snapshot.story.subjectName || "—"}</span>
              <span className="text-[var(--text-muted)]">Email</span>
              <span>{snapshot.submission?.submitterEmail || "Not provided"}</span>
              {photoCount > 0 ? (
                <>
                  <span className="text-[var(--text-muted)]">Photos</span>
                  <span>{photoCount} uploaded</span>
                </>
              ) : null}
            </div>
          </div>
        </Card>

        <Card padding="md" className="border border-[var(--rule)] bg-transparent shadow-none sm:p-7">
          <Eyebrow>Ready-to-Publish Package</Eyebrow>
          <PageTitle className="mt-3 text-[2rem]">Content delivery</PageTitle>
          {snapshot.storyPackage ? (
            <div className="mt-5 space-y-4">
              <div className="grid grid-cols-[120px_1fr] gap-2 text-[15px]">
                <span className="text-[var(--text-muted)]">Package</span>
                <span>{snapshot.storyPackage.name}</span>
                <span className="text-[var(--text-muted)]">Status</span>
                <span>{snapshot.storyPackage.status === "ready" ? "Ready to download" : snapshot.storyPackage.status === "delivered" ? "Delivered" : "Preparing…"}</span>
                <span className="text-[var(--text-muted)]">Downloads</span>
                <span>{snapshot.storyPackage.downloadCount}</span>
              </div>
              <div className="pt-1">
                <Link href={buildWorkspaceHref(`/package/${snapshot.storyPackage.id}`, workspaceSlug)}>
                  <Button variant="secondary" size="sm">Open Ready-to-Publish Package</Button>
                </Link>
              </div>
            </div>
          ) : (
            <BodyText muted className="mt-5">Content is being prepared. It will appear here once ready.</BodyText>
          )}
        </Card>
      </section>

      <section className="space-y-4">
        <div>
          <Eyebrow>Content</Eyebrow>
          <PageTitle className="mt-3 text-[2rem]">Ready to publish</PageTitle>
        </div>
        {snapshot.contents.length === 0 ? (
          <Card padding="md" className="border border-[var(--rule)] bg-transparent shadow-none sm:p-8">
            <BodyText muted>Content is being written. Check back shortly.</BodyText>
          </Card>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {snapshot.contents.map((content) => (
              <Card key={content.id} padding="md" className="border border-[var(--rule)] bg-transparent shadow-none sm:p-7">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <CardTitle className="text-lg">{content.title || content.contentType}</CardTitle>
                    <BodyText muted className="mt-2">
                      {content.channel} · {content.contentType}
                    </BodyText>
                  </div>
                  <Badge variant="outline" className="border-[var(--rule)] bg-[var(--surface-muted)]">{contentStatusLabel(content.status)}</Badge>
                </div>
                <div className="mt-5 rounded-2xl border border-[var(--rule)] bg-white/62 p-5 text-sm">
                  <MarkdownBody>{content.body}</MarkdownBody>
                </div>
                <div className="mt-4 border-t border-[var(--border)] pt-4">
                  <ContentReviewButtons contentId={content.id} currentStatus={content.status} />
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-4">
        <div>
          <Eyebrow>Media</Eyebrow>
          <PageTitle className="mt-3 text-[2rem]">Graphics and video</PageTitle>
        </div>
        {snapshot.assets.length === 0 ? (
          <Card padding="md" className="border border-[var(--rule)] bg-transparent shadow-none sm:p-8">
            <BodyText muted>Graphics and video are being created. They'll appear here when ready.</BodyText>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {snapshot.assets.map((asset) => (
              <Card key={asset.id} padding="md" className="border border-[var(--rule)] bg-transparent shadow-none sm:p-6">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <CardTitle className="text-base">{asset.fileName}</CardTitle>
                    <BodyText muted className="mt-2">
                      {asset.assetType} · {asset.platform || "general"}
                    </BodyText>
                  </div>
                  <Badge variant="outline">{asset.status}</Badge>
                </div>
                <div className="mt-5 space-y-2 text-sm text-[var(--text-muted)]">
                  {asset.dimensions ? <div>{asset.dimensions}</div> : null}
                  {asset.fileUrl ? (
                    <a href={asset.fileUrl} target="_blank" rel="noopener noreferrer" className="block truncate text-[var(--foreground)] underline underline-offset-2">
                      Download
                    </a>
                  ) : null}
                </div>
              </Card>
            ))}
          </div>
        )}

      </section>
    </StoriesShell>
  );
}
