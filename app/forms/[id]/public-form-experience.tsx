"use client";

import { useMemo, useState } from "react";
import { BodyText, Button, FieldLabel, Input, Textarea } from "@globalcloudr/canopy-ui";
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
  const [photoRefs, setPhotoRefs] = useState<string[]>([]);
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
          photoUrls: photoRefs,
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
      setPhotoRefs([]);
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
      fd.append("formId", form.id);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const payload = (await res.json()) as { url?: string; photoRef?: string; error?: string };
      if (!res.ok || !payload.url || !payload.photoRef) throw new Error(payload.error ?? "Upload failed.");
      setPhotoRefs((prev) => [...prev, payload.photoRef!]);
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

  if (submitState.type === "success") {
    return (
      <div className="mt-8 rounded-[24px] border border-emerald-200 bg-emerald-50 px-6 py-10 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-6 w-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <p className="text-lg font-semibold text-emerald-900">Thank you!</p>
        <p className="mt-2 text-[15px] leading-6 text-emerald-800">
          Your story is in good hands. We'll use what you shared to create content — no further action needed from you.
        </p>
      </div>
    );
  }

  return (
    <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
      {form.fields.map((field) => (
        <div key={field.id} className="space-y-2">
          <FieldLabel>
            {field.label}
            {requiredIds.has(field.id) ? <span className="ml-1 text-[#2f76dd]">*</span> : null}
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

      {submitState.type === "error" ? (
        <div className="rounded-[24px] border border-rose-200 bg-rose-50 px-4 py-3">
          <BodyText className="text-rose-700">{submitState.message}</BodyText>
        </div>
      ) : null}

      <Button type="submit" variant="accent" size="lg" className="w-full" disabled={submitState.type === "submitting" || isUploading}>
        {isUploading ? "Uploading photo…" : submitState.type === "submitting" ? "Submitting…" : "Share your story"}
      </Button>
    </form>
  );
}
