import Link from "next/link";
import { Badge, BodyText, Button, Card, CardTitle, Eyebrow, SectionTitle } from "@canopy/ui";
import { StoriesShell } from "@/app/_components/stories-shell";
import { listPublishedForms } from "@/lib/stories-data";

export default async function FormsPage() {
  const forms = await listPublishedForms();
  const workspaces = [...new Set(forms.map((form) => form.workspaceName))];

  return (
    <StoriesShell
      activeNav="forms"
      eyebrow="Forms"
      title="Templates and public intake"
      subtitle="This page now reads from the Stories product data layer. Public forms here can become real submission entry points instead of staying as static previews."
      headerMeta={`${forms.length} active form${forms.length === 1 ? "" : "s"} across ${workspaces.length} workspace${workspaces.length === 1 ? "" : "s"}`}
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
      <section className="rounded-[28px] border border-[var(--border)] bg-white p-6 shadow-[var(--shadow-sm)] sm:p-7">
        <Eyebrow className="text-[#4f46e5]">Published intake</Eyebrow>
        <SectionTitle className="mt-3">Active public forms</SectionTitle>
        <div className="mt-5 space-y-4">
          {forms.map((form) => (
            <Card key={form.id} variant="soft" padding="sm" className="rounded-[24px]">
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
                <code className="inline-flex h-11 items-center rounded-xl border border-[var(--border)] bg-white px-4 text-sm text-[var(--text-muted)]">
                  {form.shareablePath}
                </code>
              </div>
            </Card>
          ))}
          {forms.length === 0 ? (
            <Card padding="md" className="sm:p-7">
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
