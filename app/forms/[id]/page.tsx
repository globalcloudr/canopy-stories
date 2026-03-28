import { notFound } from "next/navigation";
import { PublicStoriesFrame } from "@/app/_components/stories-shell";
import { getPublishedFormById } from "@/lib/stories-domain";

type PublicFormPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function PublicFormPage({ params }: PublicFormPageProps) {
  const { id } = await params;
  const form = getPublishedFormById(id);

  if (!form) {
    notFound();
  }

  return (
    <PublicStoriesFrame
      eyebrow="Public intake form"
      title={form.title}
      subtitle={form.description}
    >
      <section className="rounded-[28px] border border-[var(--border)] bg-white p-6 shadow-[var(--shadow-sm)] sm:p-8">
        <div className="flex flex-wrap gap-3">
          <span className="rounded-full border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-1 text-sm text-[var(--text-muted)]">
            Workspace: {form.workspaceSlug}
          </span>
          <span className="rounded-full border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-1 text-sm text-[var(--text-muted)]">
            Story type: {form.storyType.replace("_", "/")}
          </span>
        </div>

        <form className="mt-8 space-y-5">
          {form.fields.map((field) => (
            <div key={field.id} className="space-y-2">
              <label className="block font-outfit text-sm font-medium tracking-[-0.01em] text-[var(--foreground)]">
                {field.label}
                {field.required ? <span className="ml-1 text-[#4f46e5]">*</span> : null}
              </label>
              {field.type === "textarea" ? (
                <textarea
                  className="min-h-32 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none"
                  placeholder={field.placeholder}
                  disabled
                />
              ) : field.type === "select" ? (
                <select
                  className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none"
                  disabled
                  defaultValue=""
                >
                  <option value="" disabled>
                    Select an option
                  </option>
                  {(field.options ?? []).map((option: string) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none"
                  type={field.type}
                  placeholder={field.placeholder}
                  disabled
                />
              )}
            </div>
          ))}

          <div className="rounded-[24px] border border-[var(--border)] bg-[var(--surface-muted)] px-4 py-3 text-sm leading-6 text-[var(--text-muted)]">
            This preview now uses the same practical Canopy surface language as the operator app. Submission handling is
            the next implementation step.
          </div>

          <button
            type="button"
            className="inline-flex h-12 w-full items-center justify-center rounded-xl bg-slate-950 px-5 text-sm font-medium text-white shadow-[0_12px_24px_rgba(15,23,42,0.16)] transition hover:bg-slate-800"
          >
            Submit story information
          </button>
        </form>
      </section>
    </PublicStoriesFrame>
  );
}
