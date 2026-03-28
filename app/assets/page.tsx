import { BodyText, Card, CardTitle, Eyebrow, SectionTitle } from "@canopy/ui";
import { StoriesShell } from "@/app/_components/stories-shell";
import { listAssetLibraryItems } from "@/lib/stories-data";

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

      <section className="rounded-xl border border-[var(--border)] bg-white px-4 py-3 text-[15px] text-[var(--text-muted)]">
        Search assets...
      </section>

      {assets.length === 0 ? (
        <Card padding="md" className="sm:p-10">
          <SectionTitle className="text-center text-[1.8rem] sm:text-[1.8rem]">No assets yet</SectionTitle>
          <BodyText muted className="mt-3 text-center">
            Assets will appear here when stories complete the automation pipeline
          </BodyText>
        </Card>
      ) : (
        <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {assets.map((asset) => (
            <Card key={asset.id} padding="md" className="rounded-[20px] border border-[var(--border)] bg-white sm:p-6">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <CardTitle className="text-base">{asset.fileName}</CardTitle>
                  <BodyText muted className="mt-2">{asset.storyTitle}</BodyText>
                </div>
                <Eyebrow className="text-slate-400">{asset.assetType}</Eyebrow>
              </div>
              <div className="mt-5 space-y-2 text-sm text-[var(--text-muted)]">
                {asset.platform ? <div>Platform: {asset.platform}</div> : null}
                {asset.dimensions ? <div>Size: {asset.dimensions}</div> : null}
                <div>Status: {asset.status}</div>
              </div>
            </Card>
          ))}
        </section>
      )}
    </StoriesShell>
  );
}
