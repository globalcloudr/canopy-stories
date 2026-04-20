export const dynamic = "force-dynamic";
import Link from "next/link";
import { Badge, BodyText, Button, Card, CardTitle, Eyebrow, SectionTitle } from "@globalcloudr/canopy-ui";
import { StoriesShell } from "@/app/_components/stories-shell";
import { listLiveProjectOptions, listPublishedForms } from "@/lib/stories-data";
import { referenceIntakeTemplates } from "@/lib/reference-form-templates";
import { CreateFormPanel } from "@/app/forms/create-form-panel";
import { buildWorkspaceHref } from "@/lib/workspace-href";

export default async function FormsPage({
  searchParams,
}: {
  searchParams?: Promise<{ workspace?: string | string[] }>;
}) {
  const params = searchParams ? await searchParams : undefined;
  const workspaceSlug = typeof params?.workspace === "string" ? params.workspace.trim() || null : null;
  const [forms, projects] = await Promise.all([
    listPublishedForms(workspaceSlug),
    listLiveProjectOptions(workspaceSlug),
  ]);
  const workspaces = [...new Set(forms.map((form) => form.workspaceName))];

  return (
    <StoriesShell
      activeNav="projects"
      eyebrow="Forms"
      title="Forms"
      subtitle="Choose a template, create a shareable intake form, and collect story responses for your school."
      headerMeta={`${forms.length} active form${forms.length === 1 ? "" : "s"} across ${workspaces.length} workspace${workspaces.length === 1 ? "" : "s"}`}
      headerActions={
        <>
          <Button asChild variant="secondary">
            <Link href={buildWorkspaceHref("/projects", workspaceSlug)}>Back to projects</Link>
          </Button>
          <Button asChild type="button" variant="primary">
            <Link href={buildWorkspaceHref("#create-form", workspaceSlug)}>Create form</Link>
          </Button>
        </>
      }
    >
      <CreateFormPanel projects={projects} />

      <section id="starter-templates" className="rounded-[28px] border border-[#dfe7f4] bg-transparent p-6 shadow-none sm:p-7">
        <Eyebrow className="text-[#2f76dd]">Starter templates</Eyebrow>
        <SectionTitle className="mt-3">Start with a proven intake form</SectionTitle>
        <BodyText muted className="mt-3">
          Use these templates to get started quickly. Each one is designed for a common school story type such as ESL,
          CTE, staff highlights, employer partners, and program overviews.
        </BodyText>
        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {referenceIntakeTemplates.map((template) => (
            <Card key={template.id} variant="soft" padding="sm" className="rounded-[24px] border border-[#dfe7f4] bg-transparent shadow-none">
              <div className="flex items-center justify-between gap-3">
                <CardTitle className="text-base">{template.name}</CardTitle>
                <Badge variant="outline" className="text-[11px] uppercase tracking-[0.08em]">
                  {template.storyType.replace("_", "/")}
                </Badge>
              </div>
              <BodyText muted className="mt-2">{template.description}</BodyText>
              <div className="mt-4 rounded-[20px] border border-[#d7e3f3] bg-[#edf3fb] px-4 py-3 text-sm text-[var(--text-muted)]">
                {template.fields.length} fields
              </div>
              <div className="mt-4 flex flex-wrap gap-3">
                <Button asChild variant="secondary" size="sm">
                  <Link href={buildWorkspaceHref(`/forms?template=${template.id}#create-form`, workspaceSlug)}>
                    Use in existing project
                  </Link>
                </Button>
                <Button asChild variant="primary" size="sm">
                  <Link href={buildWorkspaceHref(`/projects?start=create-project&template=${template.id}`, workspaceSlug)}>
                    Create project with this template
                  </Link>
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </section>

      <section className="rounded-[28px] border border-[#dfe7f4] bg-transparent p-6 shadow-none sm:p-7">
        <Eyebrow className="text-[#2f76dd]">Live forms</Eyebrow>
        <SectionTitle className="mt-3">Forms ready to share</SectionTitle>
        <div className="mt-5 space-y-4">
          {forms.map((form) => (
            <Card key={form.id} variant="soft" padding="sm" className="rounded-[24px] border border-[#dfe7f4] bg-transparent shadow-none">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <CardTitle className="text-lg">{form.title}</CardTitle>
                  <BodyText muted className="mt-1">
                    {form.workspaceName} · {form.submissionCount} response{form.submissionCount === 1 ? "" : "s"}
                  </BodyText>
                </div>
                <Badge variant="sky" className="text-[11px] uppercase tracking-[0.08em]">
                  {form.storyType.replace("_", "/")}
                </Badge>
              </div>
              <BodyText muted className="mt-3">{form.description}</BodyText>
              <div className="mt-4 flex flex-wrap gap-3">
                <Button asChild variant="primary">
                  <Link href={form.shareablePath}>Open public form</Link>
                </Button>
                <code className="inline-flex h-11 items-center rounded-xl border border-[#d7e3f3] bg-[#edf3fb] px-4 text-sm text-[var(--text-muted)]">
                  {form.shareablePath}
                </code>
              </div>
            </Card>
          ))}
          {forms.length === 0 ? (
            <Card padding="md" className="border border-[#dfe7f4] bg-transparent shadow-none sm:p-7">
              <CardTitle>No forms yet</CardTitle>
              <BodyText muted className="mt-2">
                Create your first form to start collecting student, staff, and partner stories.
              </BodyText>
            </Card>
          ) : null}
        </div>
      </section>
    </StoriesShell>
  );
}
