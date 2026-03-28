import { notFound } from "next/navigation";
import { PublicStoriesFrame } from "@/app/_components/stories-shell";
import { getPublishedFormById } from "@/lib/stories-data";
import { PublicFormExperience } from "@/app/forms/[id]/public-form-experience";

type PublicFormPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function PublicFormPage({ params }: PublicFormPageProps) {
  const { id } = await params;
  const form = await getPublishedFormById(id);

  if (!form) {
    notFound();
  }

  return (
    <PublicStoriesFrame eyebrow="Public intake form" title={form.title} subtitle={form.description}>
      <section className="rounded-[28px] border border-[var(--border)] bg-white p-6 shadow-[var(--shadow-sm)] sm:p-8">
        <div className="flex flex-wrap gap-3">
          <span className="rounded-full border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-1 text-sm text-[var(--text-muted)]">
            Workspace: {form.workspaceName}
          </span>
          <span className="rounded-full border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-1 text-sm text-[var(--text-muted)]">
            Story type: {form.storyType.replace("_", "/")}
          </span>
        </div>

        <PublicFormExperience form={form} />
      </section>
    </PublicStoriesFrame>
  );
}
