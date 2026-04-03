import Link from "next/link";
import { Button } from "@canopy/ui";
import { StoriesShell } from "@/app/_components/stories-shell";
import { listLiveProjectOptions } from "@/lib/stories-data";
import { StoryCreatorForm } from "@/app/stories/create/story-creator-form";
import { buildWorkspaceHref } from "@/lib/workspace-href";

export default async function CreateStoryPage({
  searchParams,
}: {
  searchParams?: Promise<{ workspace?: string | string[] }>;
}) {
  const params = searchParams ? await searchParams : undefined;
  const workspaceSlug = typeof params?.workspace === "string" ? params.workspace.trim() || null : null;
  const projectOptions = await listLiveProjectOptions(workspaceSlug);

  return (
    <StoriesShell
      activeNav="stories"
      eyebrow="Stories"
      title="Create Success Story"
      subtitle="Collect source information manually and start the automation pipeline."
      headerActions={
        <Link href={buildWorkspaceHref("/stories", workspaceSlug)}>
          <Button variant="secondary">Back to Stories</Button>
        </Link>
      }
    >
      <StoryCreatorForm projectOptions={projectOptions} />
    </StoriesShell>
  );
}
