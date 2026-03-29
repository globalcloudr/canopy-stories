import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge, BodyText, Button, Card, CardTitle, Eyebrow, PageTitle, SectionTitle } from "@canopy/ui";
import { packageStatusLabel } from "@/lib/stories-domain";
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
      eyebrow={snapshot.workspaceName}
      title={snapshot.story ? `${snapshot.story.title}` : snapshot.storyPackage.name}
      subtitle={`Here's the content package for ${snapshot.projectName}.`}
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
            {packageStatusLabel(snapshot.storyPackage.status)}
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
                    <CardTitle className="text-base">{post.title || "Post"}</CardTitle>
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
            <Eyebrow>Summary</Eyebrow>
            <PageTitle className="mt-3 text-[2rem]">What's included</PageTitle>
            <div className="mt-5 grid grid-cols-[100px_1fr] gap-2 text-[15px]">
              <span className="text-[var(--text-muted)]">Status</span>
              <span>{packageStatusLabel(snapshot.storyPackage.status)}</span>
              <span className="text-[var(--text-muted)]">Content</span>
              <span>{snapshot.contents.length} piece{snapshot.contents.length === 1 ? "" : "s"}</span>
              <span className="text-[var(--text-muted)]">Media</span>
              <span>{snapshot.assets.length} file{snapshot.assets.length === 1 ? "" : "s"}</span>
              {snapshot.storyPackage.expiresAt ? (
                <>
                  <span className="text-[var(--text-muted)]">Expires</span>
                  <span>{new Date(snapshot.storyPackage.expiresAt).toLocaleDateString()}</span>
                </>
              ) : null}
            </div>
          </Card>

          <Card padding="md" className="sm:p-7">
            <Eyebrow>Media</Eyebrow>
            <PageTitle className="mt-3 text-[2rem]">Download files</PageTitle>
            <div className="mt-5 space-y-4">
              {videoAssets.map((asset) => (
                <div key={asset.id} className="rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] p-5">
                  <CardTitle className="text-base">{asset.fileName}</CardTitle>
                  <BodyText muted className="mt-2">Video</BodyText>
                  {asset.fileUrl ? (
                    <a href={asset.fileUrl} target="_blank" rel="noopener noreferrer" className="mt-3 block text-sm underline underline-offset-2">
                      Download
                    </a>
                  ) : null}
                </div>
              ))}
              {imageAssets.map((asset) => (
                <div key={asset.id} className="rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] p-5">
                  <CardTitle className="text-base">{asset.fileName}</CardTitle>
                  <BodyText muted className="mt-2">Image</BodyText>
                  {asset.fileUrl ? (
                    <a href={asset.fileUrl} target="_blank" rel="noopener noreferrer" className="mt-3 block text-sm underline underline-offset-2">
                      Download
                    </a>
                  ) : null}
                </div>
              ))}
              {snapshot.assets.length === 0 ? <BodyText muted>No media files in this package yet.</BodyText> : null}
            </div>
          </Card>
        </div>
      </section>
    </PublicStoriesFrame>
  );
}
