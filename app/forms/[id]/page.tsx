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
    <PublicStoriesFrame eyebrow={form.workspaceName} title={form.title} subtitle={form.description || "Tell us your story — we'll use your answers to create content for your school."}>
      <section className="rounded-[28px] border border-[var(--border)] bg-white p-6 shadow-[var(--shadow-sm)] sm:p-8">
        <PublicFormExperience form={form} />
      </section>
    </PublicStoriesFrame>
  );
}
