"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { BodyText, Button, Card, CardTitle } from "@globalcloudr/canopy-ui";
import { apiFetch } from "@/lib/api-client";
import type { LiveProjectOption } from "@/lib/stories-data";
import { storyTypes } from "@/lib/stories-schema";
import { buildWorkspaceHref } from "@/lib/workspace-href";

type StoryCreatorFormProps = {
  projectOptions: LiveProjectOption[];
};

export function StoryCreatorForm({ projectOptions }: StoryCreatorFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const workspaceSlug = searchParams.get("workspace")?.trim() || null;
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    projectId: projectOptions[0]?.id ?? "",
    title: "",
    storyType: "OVERVIEW",
    subjectName: "",
    background: "",
    details: "",
  });

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    startTransition(async () => {
      const response = await apiFetch("/api/stories/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const payload = (await response.json()) as { error?: string; storyId?: string };
      if (!response.ok || !payload.storyId) {
        setError(payload.error || "Story creation failed.");
        return;
      }

      router.push(buildWorkspaceHref(`/stories/${payload.storyId}`, workspaceSlug));
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card padding="md" className="border border-[var(--rule)] bg-transparent shadow-none sm:p-7">
        <CardTitle className="text-lg">Source information</CardTitle>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <label className="block">
            <BodyText muted as="span">Project</BodyText>
            <select
              value={form.projectId}
              onChange={(event) => setForm((current) => ({ ...current, projectId: event.target.value }))}
              className="mt-2 w-full rounded-xl border border-[var(--rule)] bg-transparent px-4 py-3 text-[15px] outline-none"
              required
            >
              {projectOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <BodyText muted as="span">Story type</BodyText>
            <select
              value={form.storyType}
              onChange={(event) => setForm((current) => ({ ...current, storyType: event.target.value }))}
              className="mt-2 w-full rounded-xl border border-[var(--rule)] bg-transparent px-4 py-3 text-[15px] outline-none"
            >
              {storyTypes.map((type) => (
                <option key={type} value={type}>
                  {type.replace(/_/g, "/")}
                </option>
              ))}
            </select>
          </label>
          <label className="block md:col-span-2">
            <BodyText muted as="span">Story title</BodyText>
            <input
              value={form.title}
              onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
              className="mt-2 w-full rounded-xl border border-[var(--rule)] bg-transparent px-4 py-3 text-[15px] outline-none"
              placeholder="Maria finds confidence through Berkeley ESL"
              required
            />
          </label>
          <label className="block md:col-span-2">
            <BodyText muted as="span">Subject name</BodyText>
            <input
              value={form.subjectName}
              onChange={(event) => setForm((current) => ({ ...current, subjectName: event.target.value }))}
              className="mt-2 w-full rounded-xl border border-[var(--rule)] bg-transparent px-4 py-3 text-[15px] outline-none"
              placeholder="Maria R."
            />
          </label>
          <label className="block md:col-span-2">
            <BodyText muted as="span">Background</BodyText>
            <textarea
              value={form.background}
              onChange={(event) => setForm((current) => ({ ...current, background: event.target.value }))}
              className="mt-2 min-h-40 w-full rounded-xl border border-[var(--rule)] bg-transparent px-4 py-3 text-[15px] outline-none"
              placeholder="Tell the core story, challenge, journey, and outcome."
              required
            />
          </label>
          <label className="block md:col-span-2">
            <BodyText muted as="span">Extra notes</BodyText>
            <textarea
              value={form.details}
              onChange={(event) => setForm((current) => ({ ...current, details: event.target.value }))}
              className="mt-2 min-h-32 w-full rounded-xl border border-[var(--rule)] bg-transparent px-4 py-3 text-[15px] outline-none"
              placeholder="Interview notes, editorial direction, quotes, or context."
            />
          </label>
        </div>
      </Card>

      {error ? (
        <Card padding="sm" className="border border-rose-200 bg-transparent shadow-none">
          <BodyText>{error}</BodyText>
        </Card>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <Button type="submit" variant="primary" disabled={isPending || projectOptions.length === 0}>
          {isPending ? "Creating story..." : "Create Story"}
        </Button>
        <Button type="button" variant="secondary" onClick={() => router.push(buildWorkspaceHref("/stories", workspaceSlug))}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
