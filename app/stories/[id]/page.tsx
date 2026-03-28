import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge, BodyText, Button, Card, CardTitle, Eyebrow, PageTitle, SectionTitle } from "@canopy/ui";
import { StoriesShell } from "@/app/_components/stories-shell";
import { getStoryDetailSnapshot } from "@/lib/stories-data";
import { formatRelativeDate } from "@/lib/stories-domain";

type StoryDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

function stageLabel(stage: string) {
  switch (stage) {
    case "form_sent":
      return "Form sent";
    case "submitted":
      return "Submitted";
    case "ai_processing":
      return "AI processing";
    case "asset_generation":
      return "Generating assets";
    case "packaging":
      return "Packaging";
    case "delivered":
      return "Delivered";
    default:
      return stage;
  }
}

function stageTone(stage: string) {
  if (stage === "delivered") {
    return "emerald" as const;
  }
  if (stage === "ai_processing" || stage === "asset_generation" || stage === "packaging") {
    return "sky" as const;
  }
  return "outline" as const;
}

export default async function StoryDetailPage({ params }: StoryDetailPageProps) {
  const { id } = await params;
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
          <Link href="/stories">
            <Button variant="secondary">Back to Stories</Button>
          </Link>
          {snapshot.storyPackage ? (
            <Link href={`/package/${snapshot.storyPackage.id}`}>
              <Button variant="primary">View Package</Button>
            </Link>
          ) : null}
          <Link href="/projects">
            <Button variant="secondary">View Projects</Button>
          </Link>
        </>
      }
      headerMeta={`Created ${formatRelativeDate(snapshot.story.createdAt)}`}
    >
      <section className="flex flex-wrap items-center gap-3">
        <Badge variant={stageTone(snapshot.story.currentStage)}>{stageLabel(snapshot.story.currentStage)}</Badge>
        <Badge variant="outline">{snapshot.story.storyType.replace(/_/g, "/")}</Badge>
        {snapshot.storyPackage ? <Badge variant="outline">Package {snapshot.storyPackage.status}</Badge> : null}
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <Card padding="sm" className="rounded-[20px] border border-[var(--border)] bg-white">
          <CardTitle className="text-sm text-[var(--text-muted)]">Subject</CardTitle>
          <SectionTitle className="mt-4 text-3xl sm:text-3xl">{snapshot.story.subjectName || "N/A"}</SectionTitle>
        </Card>
        <Card padding="sm" className="rounded-[20px] border border-[var(--border)] bg-white">
          <CardTitle className="text-sm text-[var(--text-muted)]">Content pieces</CardTitle>
          <SectionTitle className="mt-4 text-3xl sm:text-3xl">{snapshot.contents.length}</SectionTitle>
        </Card>
        <Card padding="sm" className="rounded-[20px] border border-[var(--border)] bg-white">
          <CardTitle className="text-sm text-[var(--text-muted)]">Assets</CardTitle>
          <SectionTitle className="mt-4 text-3xl sm:text-3xl">{snapshot.assets.length}</SectionTitle>
        </Card>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <Card padding="md" className="sm:p-7">
          <Eyebrow>Submission</Eyebrow>
          <PageTitle className="mt-3 text-[2rem]">Source material</PageTitle>
          <div className="mt-5 space-y-3 text-[15px] text-[var(--foreground)]">
            <div>Name: {snapshot.submission?.submitterName || snapshot.story.subjectName || "N/A"}</div>
            <div>Email: {snapshot.submission?.submitterEmail || "Not provided"}</div>
            <div>Workspace: {snapshot.workspaceSlug}</div>
            <div>Photos: {photoCount}</div>
          </div>
          {snapshot.story.sourceData ? (
            <div className="mt-6 rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] p-5 text-sm text-[var(--foreground)]">
              <pre className="whitespace-pre-wrap break-words font-mono text-[13px] leading-6">
                {JSON.stringify(snapshot.story.sourceData, null, 2)}
              </pre>
            </div>
          ) : null}
        </Card>

        <Card padding="md" className="sm:p-7">
          <Eyebrow>Package</Eyebrow>
          <PageTitle className="mt-3 text-[2rem]">Delivery status</PageTitle>
          {snapshot.storyPackage ? (
            <div className="mt-5 space-y-3 text-[15px] text-[var(--foreground)]">
              <div>Name: {snapshot.storyPackage.name}</div>
              <div>Status: {snapshot.storyPackage.status}</div>
              <div>Downloads: {snapshot.storyPackage.downloadCount}</div>
              {snapshot.storyPackage.shareableLink ? (
                <div>
                  Shareable link: <span className="text-[var(--text-muted)]">{snapshot.storyPackage.shareableLink}</span>
                </div>
              ) : null}
              <div className="pt-2">
                <Link href={`/package/${snapshot.storyPackage.id}`}>
                  <Button variant="secondary" size="sm">Open Package</Button>
                </Link>
              </div>
            </div>
          ) : (
            <BodyText muted className="mt-5">No package has been created for this story yet.</BodyText>
          )}
        </Card>
      </section>

      <section className="space-y-4">
        <div>
          <Eyebrow>Generated content</Eyebrow>
          <PageTitle className="mt-3 text-[2rem]">Content outputs</PageTitle>
        </div>
        {snapshot.contents.length === 0 ? (
          <Card padding="md" className="sm:p-8">
            <BodyText muted>No content generated yet.</BodyText>
          </Card>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {snapshot.contents.map((content) => (
              <Card key={content.id} padding="md" className="sm:p-7">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <CardTitle className="text-lg">{content.title || content.contentType}</CardTitle>
                    <BodyText muted className="mt-2">
                      {content.channel} · {content.contentType}
                    </BodyText>
                  </div>
                  <Badge variant="outline">{content.status}</Badge>
                </div>
                <div className="mt-5 rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] p-5 text-sm leading-7 text-[var(--foreground)] whitespace-pre-wrap break-words">
                  {content.body}
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-4">
        <div>
          <Eyebrow>Generated assets</Eyebrow>
          <PageTitle className="mt-3 text-[2rem]">Assets and media</PageTitle>
        </div>
        {snapshot.assets.length === 0 ? (
          <Card padding="md" className="sm:p-8">
            <BodyText muted>No assets generated yet.</BodyText>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {snapshot.assets.map((asset) => (
              <Card key={asset.id} padding="md" className="sm:p-6">
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
                  {asset.dimensions ? <div>Size: {asset.dimensions}</div> : null}
                  {asset.fileUrl ? <div className="break-all">URL: {asset.fileUrl}</div> : null}
                </div>
              </Card>
            ))}
          </div>
        )}

        {videoCount > 0 ? (
          <BodyText muted>
            Video outputs are now part of the automation pipeline. If a real provider key is not configured, the story still records a placeholder video asset so the pipeline remains visible.
          </BodyText>
        ) : null}
      </section>
    </StoriesShell>
  );
}
