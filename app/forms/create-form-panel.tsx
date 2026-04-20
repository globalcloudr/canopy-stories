"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Badge, BodyText, Button, Card, CardTitle, FieldLabel, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@globalcloudr/canopy-ui";
import { apiFetch } from "@/lib/api-client";
import type { LiveProjectOption } from "@/lib/stories-data";
import { referenceIntakeTemplates } from "@/lib/reference-form-templates";
import { buildWorkspaceHref } from "@/lib/workspace-href";

type CreateFormPanelProps = {
  projects: LiveProjectOption[];
};

type CreateState =
  | { type: "idle" }
  | { type: "submitting" }
  | { type: "success"; message: string }
  | { type: "error"; message: string };

export function CreateFormPanel({ projects }: CreateFormPanelProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const workspaceSlug = searchParams.get("workspace")?.trim() || null;
  const requestedTemplateId = searchParams.get("template")?.trim() || "";
  const [projectId, setProjectId] = useState<string>("");
  const [templateId, setTemplateId] = useState<string>("");
  const [state, setState] = useState<CreateState>({ type: "idle" });

  const selectedTemplate = useMemo(
    () => referenceIntakeTemplates.find((template) => template.id === templateId) ?? null,
    [templateId]
  );

  const hasLiveProjects = projects.length > 0;

  useEffect(() => {
    if (!requestedTemplateId) {
      return;
    }

    const matchingTemplate = referenceIntakeTemplates.find((template) => template.id === requestedTemplateId);
    if (matchingTemplate) {
      setTemplateId(matchingTemplate.id);
    }
  }, [requestedTemplateId]);

  async function handleCreate() {
    if (!projectId || !templateId) {
      setState({ type: "error", message: "Choose a project and a starter template first." });
      return;
    }

    setState({ type: "submitting" });

    try {
      const response = await apiFetch("/api/forms/create-from-template", {
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

      setState({ type: "success", message: payload.message || "Form created and ready to share." });
      router.push(buildWorkspaceHref("/forms", workspaceSlug));
      router.refresh();
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
          <Badge variant="sky" className="text-[11px] uppercase tracking-[0.08em]">Create form</Badge>
          <CardTitle className="mt-3 text-xl">Create a shareable intake form</CardTitle>
          <BodyText muted className="mt-2">
            Choose a project and a starter template to create a form you can share with students, staff, and partners.
          </BodyText>
        </div>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <div className="space-y-2">
          <FieldLabel>Project</FieldLabel>
          <Select value={projectId} onValueChange={setProjectId} disabled={!hasLiveProjects}>
            <SelectTrigger>
              <SelectValue placeholder={hasLiveProjects ? "Choose a project" : "Create a project first"} />
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
          <FieldLabel>Starter template</FieldLabel>
          <Select value={templateId} onValueChange={setTemplateId}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a template" />
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
          <div className="flex flex-wrap items-center justify-between gap-3">
            <BodyText className="text-amber-800">
              No projects are ready yet. Create a project first, then come back here to build and share a form.
            </BodyText>
            {templateId ? (
              <Button asChild variant="secondary" size="sm">
                <Link href={buildWorkspaceHref(`/projects?start=create-project&template=${templateId}`, workspaceSlug)}>
                  Create project with this template
                </Link>
              </Button>
            ) : null}
          </div>
        </div>
      ) : null}

      {state.type === "error" ? (
        <div className="mt-5 rounded-[24px] border border-rose-200 bg-rose-50 px-4 py-3">
          <BodyText className="text-rose-700">{state.message}</BodyText>
        </div>
      ) : null}

      {state.type === "success" ? (
        <div className="mt-5 rounded-[24px] border border-[var(--rule)] bg-[var(--surface-muted)] px-4 py-3">
          <BodyText className="text-[var(--success)]">{state.message}</BodyText>
        </div>
      ) : null}

      <div className="mt-5">
        <Button type="button" variant="primary" onClick={handleCreate} disabled={!hasLiveProjects || state.type === "submitting"}>
          {state.type === "submitting" ? "Creating..." : "Create form"}
        </Button>
      </div>
    </Card>
  );
}
