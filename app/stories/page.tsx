import Link from "next/link";
import { Badge, BodyText, Button, Card, CardTitle, Eyebrow, SectionTitle } from "@canopy/ui";
import { StoriesShell } from "@/app/_components/stories-shell";
import { listStoryLibraryItems } from "@/lib/stories-data";
import { formatRelativeDate } from "@/lib/stories-domain";

function storyStatusLabel(stage: string) {
  return stage === "delivered" ? "published" : "draft";
}

export default async function StoriesPage() {
  const items = await listStoryLibraryItems();

  return (
    <StoriesShell
      activeNav="stories"
      eyebrow="Stories"
      title="Stories"
      subtitle="Browse and manage your success story library"
      headerActions={
        <Button type="button" variant="primary">
          Create Story
        </Button>
      }
    >
      <section className="flex items-center gap-3 flex-wrap">
        <div className="flex-1 min-w-64 rounded-xl border border-[var(--border)] bg-white px-4 py-3 text-[15px] text-[var(--text-muted)]">
          Search stories...
        </div>
        <div className="w-48 rounded-xl border border-[var(--border)] bg-white px-4 py-3 text-[15px] text-[var(--text-muted)]">
          All Types
        </div>
        <div className="flex items-center gap-1 rounded-xl border border-[var(--border)] bg-white p-1">
          <div className="h-8 w-8 rounded-md bg-[var(--surface-muted)]" />
          <div className="h-8 w-8 rounded-md" />
        </div>
      </section>

      {items.length === 0 ? (
        <Card padding="md" className="sm:p-10">
          <BodyText muted className="text-center">
            No stories yet. Stories are created automatically when forms are submitted.
          </BodyText>
        </Card>
      ) : (
        <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <Link key={item.story.id} href={`/stories/${item.story.id}`} className="block">
              <Card padding="md" className="rounded-[20px] border border-[var(--border)] bg-white transition hover:border-slate-300 sm:p-6">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <CardTitle className="text-lg">{item.story.title || "Untitled Story"}</CardTitle>
                    <BodyText muted className="mt-2">{item.story.subjectName || "N/A"}</BodyText>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {storyStatusLabel(item.story.currentStage)}
                  </Badge>
                </div>
                <BodyText muted className="mt-4">
                  {item.excerpt}
                  {item.excerpt.endsWith("...") ? "" : "..."}
                </BodyText>
                <div className="mt-5 flex items-center justify-between gap-3 text-sm text-[var(--text-muted)]">
                  <span>{item.story.storyType.replace("_", "/")}</span>
                  <span>{formatRelativeDate(item.story.createdAt)}</span>
                </div>
              </Card>
            </Link>
          ))}
        </section>
      )}
    </StoriesShell>
  );
}
