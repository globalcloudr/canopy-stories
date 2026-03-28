"use client";

import { useState, useEffect } from "react";
import {
  Badge,
  BodyText,
  Button,
  Card,
  CardTitle,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  FieldLabel,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
} from "@canopy/ui";
import { referenceIntakeTemplates } from "@/lib/reference-form-templates";

type FormField = {
  id: string;
  type: string;
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[];
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  onCreated: () => void;
};

const STORY_TYPES = ["ESL", "HSD_GED", "CTE", "EMPLOYER", "STAFF", "PARTNER", "OVERVIEW"];

export function FormBuilderDialog({ open, onOpenChange, projectId, onCreated }: Props) {
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [storyType, setStoryType] = useState("");
  const [fields, setFields] = useState<FormField[]>([
    { id: "1", type: "text", label: "Full Name", placeholder: "Your full name", required: true },
    { id: "2", type: "email", label: "Contact Email", placeholder: "email@example.com", required: true },
  ]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedTemplate || selectedTemplate === "custom") {
      return;
    }
    const template = referenceIntakeTemplates.find((t) => t.id === selectedTemplate);
    if (template) {
      setTitle(template.name);
      setDescription(template.description);
      setStoryType(template.storyType);
      setFields(
        template.fields.map((f, i) => ({
          id: String(i + 1),
          type: f.type,
          label: f.label,
          placeholder: f.placeholder ?? "",
          required: f.required,
          options: f.options,
        }))
      );
    }
  }, [selectedTemplate]);

  function resetForm() {
    setSelectedTemplate("");
    setTitle("");
    setDescription("");
    setStoryType("");
    setFields([
      { id: "1", type: "text", label: "Full Name", placeholder: "Your full name", required: true },
      { id: "2", type: "email", label: "Contact Email", placeholder: "email@example.com", required: true },
    ]);
    setError(null);
  }

  function addField() {
    setFields([
      ...fields,
      { id: String(Date.now()), type: "text", label: "", placeholder: "", required: false },
    ]);
  }

  function removeField(id: string) {
    setFields(fields.filter((f) => f.id !== id));
  }

  function updateField(id: string, updates: Partial<FormField>) {
    setFields(fields.map((f) => (f.id === id ? { ...f, ...updates } : f)));
  }

  async function handleSubmit() {
    if (!title.trim() || !storyType) {
      setError("Title and story type are required.");
      return;
    }
    if (fields.some((f) => !f.label.trim())) {
      setError("All fields must have a label.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/forms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId, title, description: description || null, storyType, fields }),
      });
      const payload = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(payload.error ?? "Failed to create form.");
      resetForm();
      onOpenChange(false);
      onCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create form.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Form Template</DialogTitle>
          <DialogDescription>
            Choose a pre-built template or design a custom form for submissions.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          <div className="space-y-2">
            <FieldLabel>Start with a template</FieldLabel>
            <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a template or start from scratch" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="custom">Custom — start from scratch</SelectItem>
                {referenceIntakeTemplates.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <FieldLabel>Form title</FieldLabel>
            <Input placeholder="e.g., ESL Student Success Form" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>

          <div className="space-y-2">
            <FieldLabel>Description (optional)</FieldLabel>
            <Textarea
              placeholder="Brief description of what this form is for..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <FieldLabel>Story type</FieldLabel>
            <Select value={storyType} onValueChange={setStoryType}>
              <SelectTrigger>
                <SelectValue placeholder="Select story type" />
              </SelectTrigger>
              <SelectContent>
                {STORY_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t.replace("_", "/")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <FieldLabel>Form fields</FieldLabel>
              <Button type="button" variant="secondary" size="sm" onClick={addField}>
                + Add field
              </Button>
            </div>

            <div className="space-y-3">
              {fields.map((field, index) => (
                <Card key={field.id} padding="sm" className="rounded-[20px]">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs text-[var(--text-muted)]">Type</Label>
                      <Select value={field.type} onValueChange={(v) => updateField(field.id, { type: v })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="text">Text</SelectItem>
                          <SelectItem value="email">Email</SelectItem>
                          <SelectItem value="tel">Phone</SelectItem>
                          <SelectItem value="textarea">Long Text</SelectItem>
                          <SelectItem value="select">Dropdown</SelectItem>
                          <SelectItem value="file">Photo Upload</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-[var(--text-muted)]">Label</Label>
                      <Input
                        placeholder="Field label"
                        value={field.label}
                        onChange={(e) => updateField(field.id, { label: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="mt-2 space-y-1">
                    <Label className="text-xs text-[var(--text-muted)]">Placeholder (optional)</Label>
                    <Input
                      placeholder="Placeholder text..."
                      value={field.placeholder ?? ""}
                      onChange={(e) => updateField(field.id, { placeholder: e.target.value })}
                    />
                  </div>

                  {field.type === "select" && (
                    <div className="mt-2 space-y-1">
                      <Label className="text-xs text-[var(--text-muted)]">Options (comma-separated)</Label>
                      <Input
                        placeholder="Option 1, Option 2, Option 3"
                        value={field.options?.join(", ") ?? ""}
                        onChange={(e) =>
                          updateField(field.id, {
                            options: e.target.value
                              .split(",")
                              .map((o) => o.trim())
                              .filter(Boolean),
                          })
                        }
                      />
                    </div>
                  )}

                  <div className="mt-3 flex items-center justify-between">
                    <label className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
                      <input
                        type="checkbox"
                        checked={field.required}
                        onChange={(e) => updateField(field.id, { required: e.target.checked })}
                        className="rounded border-[var(--border)]"
                      />
                      Required
                    </label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeField(field.id)}
                      className="text-rose-500 hover:text-rose-700"
                    >
                      Remove
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {error && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="secondary" onClick={() => { resetForm(); onOpenChange(false); }}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit} disabled={submitting}>
            {submitting ? "Creating..." : "Create Form"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
