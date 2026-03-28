import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge, BodyText, Button, Card, CardTitle, Eyebrow, PageTitle, SectionTitle } from "@canopy/ui";
import { PublicStoriesFrame } from "@/app/_components/stories-shell";
import { getPackageDetailSnapshot } from "@/lib/stories-data";

type PublicPackagePageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function PublicPackagePage({ params }: PublicPackagePageProps) {
  const { id } = await params;
  const snapshot = await getPackageDetailSnapshot(id);

  if (!snapshot) {
    notFound();
  }

  const blogContent = snapshot.contents.find((item) => item.channel === "blog");
  const socialContent = snapshot.contents.filter((item) => item.channel === "social");
  const newsletterContent = snapshot.contents.find((item) => item.channel === "newsletter");
  const pressContent = snapshot.contents.find((item) => item.channel === "press_release");
  const videoAssets = snapshot.assets.filter((item) => item.assetType === "video");
  const imageAssets = snapshot.assets.filter((item) => item.assetType === "image");

  return (
    <PublicStoriesFrame
      eyebrow="Package"
      title={snapshot.storyPackage.name}
      subtitle={snapshot.storyPackage.description || `${snapshot.projectName} · ${snapshot.workspaceName}`}
    >
      <Card padding="md" className="sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <PageTitle className="text-[2rem]">{snapshot.storyPackage.name}</PageTitle>
            <BodyText muted className="mt-3">
              {snapshot.projectName} · {snapshot.workspaceName}
            </BodyText>
          </div>
          <Badge variant={snapshot.storyPackage.status === "ready" || snapshot.storyPackage.status === "delivered" ? "emerald" : "sky"}>
            {snapshot.storyPackage.status}
          </Badge>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          {snapshot.storyPackage.packageUrl ? (
            <a href={snapshot.storyPackage.packageUrl} target="_blank" rel="noopener noreferrer">
              <Button variant="primary">Download Package</Button>
            </a>
          ) : (
            <Button variant="secondary">Download All Content</Button>
          )}
          {snapshot.story ? (
            <Link href={`/stories/${snapshot.story.id}`}>
              <Button variant="secondary">View Story</Button>
            </Link>
          ) : null}
        </div>
      </Card>

      <section className="grid gap-4 md:grid-cols-3">
        <Card padding="sm" className="rounded-[20px] border border-[var(--border)] bg-white">
          <CardTitle className="text-sm text-[var(--text-muted)]">Total content</CardTitle>
          <SectionTitle className="mt-4 text-3xl sm:text-3xl">{snapshot.contents.length}</SectionTitle>
        </Card>
        <Card padding="sm" className="rounded-[20px] border border-[var(--border)] bg-white">
          <CardTitle className="text-sm text-[var(--text-muted)]">Total assets</CardTitle>
          <SectionTitle className="mt-4 text-3xl sm:text-3xl">{snapshot.assets.length}</SectionTitle>
        </Card>
        <Card padding="sm" className="rounded-[20px] border border-[var(--border)] bg-white">
          <CardTitle className="text-sm text-[var(--text-muted)]">Downloads</CardTitle>
          <SectionTitle className="mt-4 text-3xl sm:text-3xl">{snapshot.storyPackage.downloadCount}</SectionTitle>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
        <div className="space-y-6">
          {blogContent ? (
            <Card padding="md" className="sm:p-7">
              <Eyebrow>Blog</Eyebrow>
              <PageTitle className="mt-3 text-[2rem]">{blogContent.title || "Blog Post"}</PageTitle>
              <div className="mt-5 whitespace-pre-wrap break-words text-[15px] leading-7 text-[var(--foreground)]">
                {blogContent.body}
              </div>
            </Card>
          ) : null}

          {socialContent.length > 0 ? (
            <Card padding="md" className="sm:p-7">
              <Eyebrow>Social</Eyebrow>
              <PageTitle className="mt-3 text-[2rem]">Social media posts</PageTitle>
              <div className="mt-5 space-y-4">
                {socialContent.map((post) => (
                  <div key={post.id} className="rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] p-5">
                    <CardTitle className="text-base">{post.title || post.contentType}</CardTitle>
                    <BodyText muted className="mt-2">{post.contentType}</BodyText>
                    <div className="mt-4 whitespace-pre-wrap break-words text-[15px] leading-7 text-[var(--foreground)]">
                      {post.body}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          ) : null}

          {newsletterContent ? (
            <Card padding="md" className="sm:p-7">
              <Eyebrow>Newsletter</Eyebrow>
              <PageTitle className="mt-3 text-[2rem]">{newsletterContent.title || "Newsletter Content"}</PageTitle>
              <div className="mt-5 whitespace-pre-wrap break-words text-[15px] leading-7 text-[var(--foreground)]">
                {newsletterContent.body}
              </div>
            </Card>
          ) : null}

          {pressContent ? (
            <Card padding="md" className="sm:p-7">
              <Eyebrow>Press</Eyebrow>
              <PageTitle className="mt-3 text-[2rem]">{pressContent.title || "Press Release"}</PageTitle>
              <div className="mt-5 whitespace-pre-wrap break-words text-[15px] leading-7 text-[var(--foreground)]">
                {pressContent.body}
              </div>
            </Card>
          ) : null}
        </div>

        <div className="space-y-6">
          <Card padding="md" className="sm:p-7">
            <Eyebrow>Overview</Eyebrow>
            <PageTitle className="mt-3 text-[2rem]">Package summary</PageTitle>
            <div className="mt-5 space-y-3 text-[15px] text-[var(--foreground)]">
              {snapshot.story ? <div>Story: {snapshot.story.title}</div> : null}
              <div>Status: {snapshot.storyPackage.status}</div>
              <div>Assets: {snapshot.assets.length}</div>
              <div>Content pieces: {snapshot.contents.length}</div>
              {snapshot.storyPackage.expiresAt ? <div>Expires: {new Date(snapshot.storyPackage.expiresAt).toLocaleDateString()}</div> : null}
            </div>
          </Card>

          <Card padding="md" className="sm:p-7">
            <Eyebrow>Assets</Eyebrow>
            <PageTitle className="mt-3 text-[2rem]">Media included</PageTitle>
            <div className="mt-5 space-y-4">
              {videoAssets.map((asset) => (
                <div key={asset.id} className="rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] p-5">
                  <CardTitle className="text-base">{asset.fileName}</CardTitle>
                  <BodyText muted className="mt-2">Video · {asset.status}</BodyText>
                  <BodyText muted className="mt-2 break-all">{asset.fileUrl}</BodyText>
                </div>
              ))}
              {imageAssets.map((asset) => (
                <div key={asset.id} className="rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] p-5">
                  <CardTitle className="text-base">{asset.fileName}</CardTitle>
                  <BodyText muted className="mt-2">Image · {asset.status}</BodyText>
                  <BodyText muted className="mt-2 break-all">{asset.fileUrl}</BodyText>
                </div>
              ))}
              {snapshot.assets.length === 0 ? <BodyText muted>No media assets yet.</BodyText> : null}
            </div>
          </Card>
        </div>
      </section>
    </PublicStoriesFrame>
  );
}
