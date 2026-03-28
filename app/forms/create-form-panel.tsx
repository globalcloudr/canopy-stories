"use client";

import { useMemo, useState } from "react";
import { Badge, BodyText, Button, Card, CardTitle, FieldLabel, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@canopy/ui";
import type { LiveProjectOption } from "@/lib/stories-data";
import { referenceIntakeTemplates } from "@/lib/reference-form-templates";

type CreateFormPanelProps = {
  projects: LiveProjectOption[];
};

type CreateState =
  | { type: "idle" }
  | { type: "submitting" }
  | { type: "success"; message: string }
  | { type: "error"; message: string };

export function CreateFormPanel({ projects }: CreateFormPanelProps) {
  const [projectId, setProjectId] = useState<string>("");
  const [templateId, setTemplateId] = useState<string>("");
  const [state, setState] = useState<CreateState>({ type: "idle" });

  const selectedTemplate = useMemo(
    () => referenceIntakeTemplates.find((template) => template.id === templateId) ?? null,
    [templateId]
  );

  const hasLiveProjects = projects.length > 0;

  async function handleCreate() {
    if (!projectId || !templateId) {
      setState({ type: "error", message: "Choose a project and a reference template first." });
      return;
    }

    setState({ type: "submitting" });

    try {
      const response = await fetch("/api/forms/create-from-template", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ projectId, templateId }),
      });

      const payload = (await response.json()) as { error?: string; message?: string };

      if (!response.ok) {
        throw new Error(payload.error || "Could not create form.");
      }

      setState({ type: "success", message: payload.message || "Form created from reference template." });
      window.location.reload();
    } catch (error) {
      setState({
        type: "error",
        message: error instanceof Error ? error.message : "Could not create form.",
      });
    }
  }

  return (
    <Card id="create-form" padding="md" className="sm:p-7">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Badge variant="sky" className="text-[11px] uppercase tracking-[0.08em]">Create live form</Badge>
          <CardTitle className="mt-3 text-xl">Promote a reference template into a real form</CardTitle>
          <BodyText muted className="mt-2">
            This uses the mature template set from the existing Stories app and creates a real `story_forms` row in Supabase.
          </BodyText>
        </div>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <div className="space-y-2">
          <FieldLabel>Project</FieldLabel>
          <Select value={projectId} onValueChange={setProjectId} disabled={!hasLiveProjects}>
            <SelectTrigger>
              <SelectValue placeholder={hasLiveProjects ? "Choose a live or reference project" : "No project options yet"} />
            </SelectTrigger>
            <SelectContent>
              {projects.map((project) => (
                <SelectItem key={project.id} value={project.id}>
                  {project.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <FieldLabel>Reference template</FieldLabel>
          <Select value={templateId} onValueChange={setTemplateId}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a tested template" />
            </SelectTrigger>
            <SelectContent>
              {referenceIntakeTemplates.map((template) => (
                <SelectItem key={template.id} value={template.id}>
                  {template.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {selectedTemplate ? (
        <div className="mt-5 rounded-[24px] border border-[var(--border)] bg-[var(--surface-muted)] p-5">
          <div className="flex items-center justify-between gap-3">
            <CardTitle className="text-base">{selectedTemplate.name}</CardTitle>
            <Badge variant="outline" className="text-[11px] uppercase tracking-[0.08em]">
              {selectedTemplate.storyType.replace("_", "/")}
            </Badge>
          </div>
          <BodyText muted className="mt-2">{selectedTemplate.description}</BodyText>
          <BodyText muted className="mt-3">{selectedTemplate.fields.length} fields</BodyText>
        </div>
      ) : null}

      {!hasLiveProjects ? (
        <div className="mt-5 rounded-[24px] border border-amber-200 bg-amber-50 px-4 py-3">
          <BodyText className="text-amber-800">
            No usable project options were found yet. Make sure the target workspace exists in Canopy so Stories can
            create a real project and form from the reference setup.
          </BodyText>
        </div>
      ) : null}

      {state.type === "error" ? (
        <div className="mt-5 rounded-[24px] border border-rose-200 bg-rose-50 px-4 py-3">
          <BodyText className="text-rose-700">{state.message}</BodyText>
        </div>
      ) : null}

      {state.type === "success" ? (
        <div className="mt-5 rounded-[24px] border border-emerald-200 bg-emerald-50 px-4 py-3">
          <BodyText className="text-emerald-800">{state.message}</BodyText>
        </div>
      ) : null}

      <div className="mt-5">
        <Button type="button" variant="primary" className="!text-white hover:!text-white" onClick={handleCreate} disabled={!hasLiveProjects || state.type === "submitting"}>
          {state.type === "submitting" ? "Creating..." : "Create live form"}
        </Button>
      </div>
    </Card>
  );
}
