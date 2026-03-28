import Link from "next/link";
import { BodyText, Button, Card, CardTitle, Eyebrow, SectionTitle } from "@canopy/ui";
import { StoriesShell } from "@/app/_components/stories-shell";

type HomePageProps = {
  searchParams?: Promise<{
    workspace?: string;
  }>;
};

const pillars = [
  {
    title: "Story intake",
    body: "Collect source material from schools through structured forms instead of manual scheduling and scattered email follow-up.",
  },
  {
    title: "Production workflow",
    body: "Move stories from intake through draft, review, and package delivery inside one practical operator workspace.",
  },
  {
    title: "Launch contract",
    body: "Canopy handles entitlement and workspace launch. Stories stays focused on the actual content pipeline.",
  },
];

export default async function HomePage({ searchParams }: HomePageProps) {
  const params = (await searchParams) ?? {};
  const workspace = params.workspace?.trim() || null;

  return (
    <StoriesShell
      activeNav="home"
      eyebrow="Stories Overview"
      title="Success story production for adult education."
      subtitle="Canopy Stories is being built as a practical workspace app, not a standalone microsite. The product should feel like PhotoVault from the first screen: clear shell, direct navigation, and clean operational cards."
      headerMeta={workspace ? `Workspace context received: ${workspace}` : "No workspace selected yet"}
      headerActions={
        <>
          <Button asChild variant="secondary">
            <Link href="/projects">View projects</Link>
          </Button>
          <Button asChild variant="primary">
            <Link href="/forms">Open forms</Link>
          </Button>
        </>
      }
    >
      <section className="grid gap-4 md:grid-cols-3">
        {pillars.map((pillar) => (
          <Card key={pillar.title} padding="sm" className="rounded-[24px]">
            <Eyebrow className="text-slate-400">Product standard</Eyebrow>
            <SectionTitle className="mt-3 text-xl sm:text-xl">{pillar.title}</SectionTitle>
            <BodyText muted className="mt-3">{pillar.body}</BodyText>
          </Card>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <Card padding="md" className="sm:p-7">
          <Eyebrow className="text-[#4f46e5]">Immediate next steps</Eyebrow>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            <Card variant="soft" padding="sm" className="rounded-[24px]">
              <CardTitle className="text-sm">1. Lock the shell</CardTitle>
              <BodyText muted className="mt-2">
                PhotoVault is now the UI standard for Stories. New screens should start from that shell, not invent a new one.
              </BodyText>
            </Card>
            <Card variant="soft" padding="sm" className="rounded-[24px]">
              <CardTitle className="text-sm">2. Keep the boundary clean</CardTitle>
              <BodyText muted className="mt-2">
                Stories owns forms, submissions, and packages. Canopy stays focused on launch, entitlement, and provisioning.
              </BodyText>
            </Card>
            <Card variant="soft" padding="sm" className="rounded-[24px]">
              <CardTitle className="text-sm">3. Promote one slice at a time</CardTitle>
              <BodyText muted className="mt-2">
                Keep pulling the smallest safe workflow pieces from the reference app instead of copying the whole product over.
              </BodyText>
            </Card>
          </div>
        </Card>

        <Card padding="md" className="sm:p-7">
          <Eyebrow className="text-[#4f46e5]">Current state</Eyebrow>
          <div className="mt-5 space-y-4">
            <Card variant="soft" padding="sm" className="rounded-[24px]">
              <CardTitle className="text-sm">Product workspace scaffold</CardTitle>
              <BodyText muted className="mt-2">
                The repo now has a real app shell, project workspace, and form workflow surface ready for deeper implementation.
              </BodyText>
            </Card>
            <Card variant="soft" padding="sm" className="rounded-[24px]">
              <CardTitle className="text-sm">Workspace-aware launch compatible</CardTitle>
              <BodyText muted className="mt-2">
                The app is already prepared to receive explicit workspace context from Canopy when product launch is wired up.
              </BodyText>
            </Card>
          </div>
        </Card>
      </section>
    </StoriesShell>
  );
}
