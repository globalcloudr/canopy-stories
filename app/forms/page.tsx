export const dynamic = "force-dynamic";
import Link from "next/link";
import { Badge, BodyText, Button, Card, CardTitle, Eyebrow, SectionTitle } from "@canopy/ui";
import { StoriesShell } from "@/app/_components/stories-shell";
import { listLiveProjectOptions, listPublishedForms } from "@/lib/stories-data";
import { referenceIntakeTemplates } from "@/lib/reference-form-templates";
import { CreateFormPanel } from "@/app/forms/create-form-panel";

export default async function FormsPage() {
  const [forms, projects] = await Promise.all([listPublishedForms(), listLiveProjectOptions()]);
  const workspaces = [...new Set(forms.map((form) => form.workspaceName))];

  return (
    <StoriesShell
      activeNav="projects"
      eyebrow="Forms"
      title="Templates and public intake"
      subtitle="This page now reads from the Stories product data layer. Public forms here can become real submission entry points instead of staying as static previews."
      headerMeta={`${forms.length} active form${forms.length === 1 ? "" : "s"} across ${workspaces.length} workspace${workspaces.length === 1 ? "" : "s"}`}
      headerActions={
        <>
          <Button asChild variant="secondary">
            <Link href="/projects">Back to projects</Link>
          </Button>
          <Button asChild type="button" variant="primary">
            <Link href="#create-form">Create form</Link>
          </Button>
        </>
      }
    >
      <CreateFormPanel projects={projects} />

      <section className="rounded-[28px] border border-[#dfe7f4] bg-transparent p-6 shadow-none sm:p-7">
        <Eyebrow className="text-[#4f46e5]">Reference templates</Eyebrow>
        <SectionTitle className="mt-3">Promoted from the mature Stories app</SectionTitle>
        <BodyText muted className="mt-3">
          These are the full template forms from the tested Replit app. They are product templates, not yet published
          workspace forms, so they should remain visible even before the live Stories tables are fully populated.
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
            </Card>
          ))}
        </div>
      </section>

      <section className="rounded-[28px] border border-[#dfe7f4] bg-transparent p-6 shadow-none sm:p-7">
        <Eyebrow className="text-[#4f46e5]">Published intake</Eyebrow>
        <SectionTitle className="mt-3">Active public forms</SectionTitle>
        <div className="mt-5 space-y-4">
          {forms.map((form) => (
            <Card key={form.id} variant="soft" padding="sm" className="rounded-[24px] border border-[#dfe7f4] bg-transparent shadow-none">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <CardTitle className="text-lg">{form.title}</CardTitle>
                  <BodyText muted className="mt-1">
                    {form.workspaceName} · {form.submissionCount} submission{form.submissionCount === 1 ? "" : "s"}
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
                Run the Stories SQL contract and create the first form records to make this page fully data-backed.
              </BodyText>
            </Card>
          ) : null}
        </div>
      </section>
    </StoriesShell>
  );
}
