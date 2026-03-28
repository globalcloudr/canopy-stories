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
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [uploadingFields, setUploadingFields] = useState<Record<string, boolean>>({});
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
          photoUrls,
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

  async function handleFileChange(fieldId: string, file: File | null) {
    if (!file) return;
    setUploadingFields((prev) => ({ ...prev, [fieldId]: true }));
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const payload = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !payload.url) throw new Error(payload.error ?? "Upload failed.");
      setPhotoUrls((prev) => [...prev, payload.url!]);
      setFormData((prev) => ({ ...prev, [fieldId]: payload.url! }));
    } catch (err) {
      setSubmitState({
        type: "error",
        message: err instanceof Error ? err.message : "Photo upload failed.",
      });
    } finally {
      setUploadingFields((prev) => ({ ...prev, [fieldId]: false }));
    }
  }

  const isUploading = Object.values(uploadingFields).some(Boolean);

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
          ) : field.type === "file" ? (
            <div className="space-y-2">
              <label className="flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center transition hover:border-slate-400 hover:bg-slate-100">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-8 w-8 text-slate-400">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                </svg>
                <span className="text-sm font-medium text-slate-600">
                  {uploadingFields[field.id] ? "Uploading..." : formData[field.id] ? "Photo uploaded ✓" : "Click to upload a photo"}
                </span>
                <span className="text-xs text-slate-400">JPG, PNG or WEBP · Max 10MB</span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="sr-only"
                  disabled={uploadingFields[field.id]}
                  onChange={(e) => handleFileChange(field.id, e.target.files?.[0] ?? null)}
                />
              </label>
              {formData[field.id] && (
                <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2">
                  <img src={formData[field.id]} alt="Uploaded" className="h-12 w-12 rounded-lg object-cover" />
                  <span className="text-sm text-emerald-700">Photo ready</span>
                </div>
              )}
            </div>
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

      <Button type="submit" variant="primary" size="lg" className="w-full" disabled={submitState.type === "submitting" || isUploading}>
        {isUploading ? "Uploading photo..." : submitState.type === "submitting" ? "Submitting..." : "Submit story information"}
      </Button>
    </form>
  );
}
