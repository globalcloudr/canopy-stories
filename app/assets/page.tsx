import { BodyText, Card, CardTitle, SectionTitle } from "@canopy/ui";
import { StoriesShell } from "@/app/_components/stories-shell";
import { listAssetLibraryItems } from "@/lib/stories-data";
import { AssetsLibrary } from "@/app/assets/assets-library";

export default async function AssetsPage() {
  const assets = await listAssetLibraryItems();

  const counts = {
    all: assets.length,
    video: assets.filter((asset) => asset.assetType === "video").length,
    image: assets.filter((asset) => asset.assetType === "image").length,
    graphic: assets.filter((asset) => asset.assetType === "graphic").length,
  };

  return (
    <StoriesShell
      activeNav="assets"
      eyebrow="Assets"
      title="Assets"
      subtitle="All generated graphics, videos, and visual content"
    >
      <section className="grid gap-4 md:grid-cols-4">
        <Card padding="sm" className="rounded-[20px] border border-[var(--border)] bg-white">
          <CardTitle className="text-sm text-[var(--text-muted)]">Total Assets</CardTitle>
          <SectionTitle className="mt-4 text-3xl sm:text-3xl">{counts.all}</SectionTitle>
        </Card>
        <Card padding="sm" className="rounded-[20px] border border-[var(--border)] bg-white">
          <CardTitle className="text-sm text-[var(--text-muted)]">Videos</CardTitle>
          <SectionTitle className="mt-4 text-3xl sm:text-3xl">{counts.video}</SectionTitle>
        </Card>
        <Card padding="sm" className="rounded-[20px] border border-[var(--border)] bg-white">
          <CardTitle className="text-sm text-[var(--text-muted)]">Images</CardTitle>
          <SectionTitle className="mt-4 text-3xl sm:text-3xl">{counts.image}</SectionTitle>
        </Card>
        <Card padding="sm" className="rounded-[20px] border border-[var(--border)] bg-white">
          <CardTitle className="text-sm text-[var(--text-muted)]">Graphics</CardTitle>
          <SectionTitle className="mt-4 text-3xl sm:text-3xl">{counts.graphic}</SectionTitle>
        </Card>
      </section>

      <AssetsLibrary assets={assets} />
    </StoriesShell>
  );
}
