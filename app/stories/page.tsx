import Link from "next/link";
import { Button } from "@canopy/ui";
import { StoriesShell } from "@/app/_components/stories-shell";
import { listStoryLibraryItems } from "@/lib/stories-data";
import { StoriesLibrary } from "@/app/stories/stories-library";

export default async function StoriesPage() {
  const items = await listStoryLibraryItems();

  return (
    <StoriesShell
      activeNav="stories"
      eyebrow="Stories"
      title="Stories"
      subtitle="Browse and manage your success story library"
      headerActions={
        <Button asChild variant="primary" className="!text-white hover:!text-white">
          <Link href="/stories/create">Create Story</Link>
        </Button>
      }
    >
      <StoriesLibrary items={items} />
    </StoriesShell>
  );
}
