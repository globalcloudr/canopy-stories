import Link from "next/link";
import { Badge, BodyText, Button, Card, CardTitle, Eyebrow, SectionTitle } from "@canopy/ui";
import { StoriesShell } from "@/app/_components/stories-shell";
import { sampleIntakeTemplates, sampleProjects, samplePublishedForms } from "@/lib/stories-domain";

export default function FormsPage() {
  return (
    <StoriesShell
      activeNav="forms"
      eyebrow="Forms"
      title="Templates and public intake"
      subtitle="This is the first real intake workflow slice for Canopy Stories: reusable operator templates and public-facing forms for collecting submissions from schools."
      headerMeta={`${samplePublishedForms.length} active public forms in the reference slice`}
      headerActions={
        <>
          <Button asChild variant="secondary">
            <Link href="/projects">Back to projects</Link>
          </Button>
          <Button type="button" variant="primary">
            Create form
          </Button>
        </>
      }
    >
      <Card padding="md" className="sm:p-7">
        <Eyebrow className="text-[#4f46e5]">Template library</Eyebrow>
        <SectionTitle className="mt-3">Reference-based starting forms</SectionTitle>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {sampleIntakeTemplates.map((template) => (
            <Card key={template.id} variant="soft" padding="sm" className="rounded-[24px]">
              <div className="flex items-center justify-between gap-3">
                <CardTitle className="text-lg">{template.name}</CardTitle>
                <Badge variant="sky" className="text-[11px] uppercase tracking-[0.08em]">
                  {template.storyType.replace("_", "/")}
                </Badge>
              </div>
              <BodyText muted className="mt-3">{template.description}</BodyText>
              <div className="mt-4 rounded-[20px] border border-[var(--border)] bg-white px-4 py-3 text-sm text-[var(--muted-foreground)]">
                {template.fields.length} fields
              </div>
            </Card>
          ))}
        </div>
      </Card>

      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Card padding="md" className="sm:p-7">
          <Eyebrow className="text-[#4f46e5]">Published intake</Eyebrow>
          <SectionTitle className="mt-3">Active public forms</SectionTitle>
          <div className="mt-5 space-y-4">
            {samplePublishedForms.map((form) => (
              <Card key={form.id} variant="soft" padding="sm" className="rounded-[24px]">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <CardTitle className="text-lg">{form.title}</CardTitle>
                    <BodyText muted className="mt-1">
                      {form.workspaceSlug} · {form.submissionCount} submission{form.submissionCount === 1 ? "" : "s"}
                    </BodyText>
                  </div>
                  <Badge variant="enabled" className="text-[11px] uppercase tracking-[0.08em]">Live</Badge>
                </div>
                <BodyText muted className="mt-3">{form.description}</BodyText>
                <div className="mt-4 flex flex-wrap gap-3">
                  <Button asChild variant="primary">
                    <Link href={form.shareablePath}>Preview public form</Link>
                  </Button>
                  <code className="inline-flex h-11 items-center rounded-xl border border-[var(--border)] bg-white px-4 text-sm text-[var(--muted-foreground)]">
                    {form.shareablePath}
                  </code>
                </div>
              </Card>
            ))}
          </div>
        </Card>

        <aside className="space-y-6">
          <Card padding="md" className="sm:p-7">
            <Eyebrow className="text-[#4f46e5]">Project coverage</Eyebrow>
            <SectionTitle className="mt-3">Projects ready for forms</SectionTitle>
            <div className="mt-5 space-y-4">
              {sampleProjects.map((project) => (
                <Card key={project.id} variant="soft" padding="sm" className="rounded-[24px]">
                  <CardTitle className="text-base">{project.name}</CardTitle>
                  <BodyText muted className="mt-1">{project.workspaceSlug}</BodyText>
                </Card>
              ))}
            </div>
          </Card>

          <Card padding="md" className="sm:p-7">
            <Eyebrow className="text-[#4f46e5]">Why this slice</Eyebrow>
            <div className="mt-5 space-y-3">
              <BodyText muted>It is the cleanest product-specific boundary from the reference app.</BodyText>
              <BodyText muted>It sets up future submissions, story production, approvals, and delivery without bloating Canopy core.</BodyText>
            </div>
          </Card>
        </aside>
      </section>
    </StoriesShell>
  );
}
