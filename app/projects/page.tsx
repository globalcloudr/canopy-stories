import Link from "next/link";
import { Badge, BodyText, Button, Card, CardTitle, Eyebrow, SectionTitle } from "@canopy/ui";
import { StoriesShell } from "@/app/_components/stories-shell";
import {
  formatRelativeDate,
  sampleIntakeTemplates,
  sampleProjects,
  sampleWorkflowSummaries,
} from "@/lib/stories-domain";

function statusStyles(status: "active" | "draft" | "paused") {
  if (status === "active") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (status === "paused") {
    return "border-amber-200 bg-amber-50 text-amber-700";
  }

  return "border-indigo-200 bg-indigo-50 text-indigo-700";
}

export default function ProjectsPage() {
  return (
    <StoriesShell
      activeNav="projects"
      eyebrow="Projects"
      title="Workspace-linked campaigns"
      subtitle="This is the first real operator workspace inside Canopy Stories: practical visibility into live projects, workflow status, and what is ready for intake."
      headerMeta={`${sampleProjects.length} projects in the current reference slice`}
      headerActions={
        <>
          <Button asChild variant="secondary">
            <Link href="/forms">Intake forms</Link>
          </Button>
          <Button type="button" variant="primary">
            New project
          </Button>
        </>
      }
    >
      <section className="grid gap-4 md:grid-cols-3">
        {sampleWorkflowSummaries.map((summary) => (
          <Card key={summary.stage} padding="sm" className="rounded-[24px]">
            <Eyebrow className="text-slate-400">{summary.stage.replace(/_/g, " ")}</Eyebrow>
            <SectionTitle className="mt-3 text-3xl sm:text-3xl">{summary.count}</SectionTitle>
            <BodyText muted className="mt-2">{summary.label}</BodyText>
          </Card>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <Card padding="md" className="sm:p-7">
          <div className="flex items-end justify-between gap-4">
            <div>
              <Eyebrow className="text-[#4f46e5]">Active projects</Eyebrow>
              <SectionTitle className="mt-3">Story campaigns in motion</SectionTitle>
            </div>
            <BodyText muted as="span">{sampleProjects.length} total</BodyText>
          </div>
          <div className="mt-5 space-y-4">
            {sampleProjects.map((project) => (
              <Card key={project.id} variant="soft" padding="sm" className="rounded-[24px]">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <CardTitle className="text-lg">{project.name}</CardTitle>
                    <BodyText muted className="mt-1">
                      {project.workspaceSlug} · updated {formatRelativeDate(project.updatedAt)}
                    </BodyText>
                  </div>
                  <Badge className={`text-[11px] uppercase tracking-[0.08em] ${statusStyles(project.status)}`}>
                    {project.status}
                  </Badge>
                </div>
                <div className="mt-4 grid gap-3 md:grid-cols-3">
                  <div className="rounded-[20px] border border-[var(--border)] bg-white px-4 py-3">
                    <CardTitle className="text-sm">Season</CardTitle>
                    <BodyText muted className="mt-1">{project.seasonLabel}</BodyText>
                  </div>
                  <div className="rounded-[20px] border border-[var(--border)] bg-white px-4 py-3">
                    <CardTitle className="text-sm">Stories in flight</CardTitle>
                    <BodyText muted className="mt-1">{project.activeStories}</BodyText>
                  </div>
                  <div className="rounded-[20px] border border-[var(--border)] bg-white px-4 py-3">
                    <CardTitle className="text-sm">Delivered packages</CardTitle>
                    <BodyText muted className="mt-1">{project.deliveredPackages}</BodyText>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {project.storyTypeMix.map((type) => (
                    <Badge key={type} variant="outline" className="text-xs">
                      {type.replace("_", "/")}
                    </Badge>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </Card>

        <aside className="space-y-6">
          <Card padding="md" className="sm:p-7">
            <Eyebrow className="text-[#4f46e5]">Intake templates</Eyebrow>
            <SectionTitle className="mt-3">Ready for operator setup</SectionTitle>
            <div className="mt-5 space-y-4">
              {sampleIntakeTemplates.map((template) => (
                <Card key={template.id} variant="soft" padding="sm" className="rounded-[24px]">
                  <div className="flex items-center justify-between gap-3">
                    <CardTitle className="text-base">{template.name}</CardTitle>
                    <Badge variant="sky" className="text-[11px] uppercase tracking-[0.08em]">
                      {template.storyType.replace("_", "/")}
                    </Badge>
                  </div>
                  <BodyText muted className="mt-2">{template.description}</BodyText>
                </Card>
              ))}
            </div>
          </Card>

          <Card padding="md" className="sm:p-7">
            <Eyebrow className="text-[#4f46e5]">Product direction</Eyebrow>
            <div className="mt-5 space-y-3">
              <BodyText muted>Stories should feel like a sibling to PhotoVault, not a separate product universe.</BodyText>
              <BodyText muted>Canopy enables launch and workspace context. Stories owns the project pipeline and the actual work.</BodyText>
            </div>
            <Button asChild variant="primary" className="mt-5">
              <Link href="/forms">Open intake workflow</Link>
            </Button>
          </Card>
        </aside>
      </section>
    </StoriesShell>
  );
}
