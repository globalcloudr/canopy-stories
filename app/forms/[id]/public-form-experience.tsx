"use client";

import { useMemo, useState } from "react";
import { BodyText, Button, FieldLabel, Input, Textarea } from "@canopy/ui";
import type { PublishedIntakeForm } from "@/lib/stories-domain";

type PublicFormExperienceProps = {
  form: PublishedIntakeForm;
};

type SubmitState =
  | { type: "idle" }
  | { type: "submitting" }
  | { type: "success"; message: string }
  | { type: "error"; message: string };

export function PublicFormExperience({ form }: PublicFormExperienceProps) {
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [submitState, setSubmitState] = useState<SubmitState>({ type: "idle" });

  const requiredIds = useMemo(
    () => new Set(form.fields.filter((field) => field.required).map((field) => field.id)),
    [form.fields]
  );

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitState({ type: "submitting" });

    try {
      const response = await fetch(`/api/forms/${form.id}/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          submitterName: (formData.name ?? "").trim() || null,
          submitterEmail: (formData.email ?? "").trim() || null,
          data: form.fields.reduce<Record<string, string>>((acc, field) => {
            acc[field.id] = formData[field.id] ?? "";
            return acc;
          }, {}),
        }),
      });

      const payload = (await response.json()) as { error?: string; message?: string };

      if (!response.ok) {
        throw new Error(payload.error || "Submission failed.");
      }

      setSubmitState({
        type: "success",
        message: payload.message || "Your story information has been submitted.",
      });
      setFormData({});
    } catch (error) {
      setSubmitState({
        type: "error",
        message: error instanceof Error ? error.message : "Submission failed.",
      });
    }
  }

  return (
    <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
      {form.fields.map((field) => (
        <div key={field.id} className="space-y-2">
          <FieldLabel>
            {field.label}
            {requiredIds.has(field.id) ? <span className="ml-1 text-[#4f46e5]">*</span> : null}
          </FieldLabel>
          {field.type === "textarea" ? (
            <Textarea
              placeholder={field.placeholder}
              value={formData[field.id] ?? ""}
              onChange={(event) => setFormData((current) => ({ ...current, [field.id]: event.target.value }))}
              rows={6}
            />
          ) : field.type === "select" ? (
            <select
              className="flex h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-900 shadow-sm outline-none"
              value={formData[field.id] ?? ""}
              onChange={(event) => setFormData((current) => ({ ...current, [field.id]: event.target.value }))}
            >
              <option value="">Select an option</option>
              {(field.options ?? []).map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          ) : (
            <Input
              type={field.type}
              placeholder={field.placeholder}
              value={formData[field.id] ?? ""}
              onChange={(event) => setFormData((current) => ({ ...current, [field.id]: event.target.value }))}
            />
          )}
        </div>
      ))}

      {submitState.type === "success" ? (
        <div className="rounded-[24px] border border-emerald-200 bg-emerald-50 px-4 py-3">
          <BodyText className="text-emerald-800">{submitState.message}</BodyText>
        </div>
      ) : null}

      {submitState.type === "error" ? (
        <div className="rounded-[24px] border border-rose-200 bg-rose-50 px-4 py-3">
          <BodyText className="text-rose-700">{submitState.message}</BodyText>
        </div>
      ) : null}

      <div className="rounded-[24px] border border-[var(--border)] bg-[var(--surface-muted)] px-4 py-3 text-sm leading-6 text-[var(--text-muted)]">
        This first persistence slice saves the submission and creates a linked story record. Asset uploads and automation
        will come in later phases.
      </div>

      <Button type="submit" variant="primary" size="lg" className="w-full !text-white hover:!text-white" disabled={submitState.type === "submitting"}>
        {submitState.type === "submitting" ? "Submitting..." : "Submit story information"}
      </Button>
    </form>
  );
}
