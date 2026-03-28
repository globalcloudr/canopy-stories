import Link from "next/link";
import { Button } from "@canopy/ui";
import { StoriesShell } from "@/app/_components/stories-shell";
import { listLiveProjectOptions } from "@/lib/stories-data";
import { StoryCreatorForm } from "@/app/stories/create/story-creator-form";

export default async function CreateStoryPage() {
  const projectOptions = await listLiveProjectOptions();

  return (
    <StoriesShell
      activeNav="stories"
      eyebrow="Stories"
      title="Create Success Story"
      subtitle="Collect source information manually and start the automation pipeline."
      headerActions={
        <Link href="/stories">
          <Button variant="secondary">Back to Stories</Button>
        </Link>
      }
    >
      <StoryCreatorForm projectOptions={projectOptions} />
    </StoriesShell>
  );
}
