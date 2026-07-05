"use client";

import { useState } from "react";
import { Button, Textarea } from "@globalcloudr/canopy-ui";
import { MarkdownBody } from "@/app/_components/markdown-body";
import { CopyButton } from "@/app/_components/copy-button";
import { apiFetch } from "@/lib/api-client";
import { ContentReviewButtons } from "./content-review-buttons";

type ReviewStatus = "draft" | "ready" | "approved";

export function EditableContentBody({
  contentId,
  initialBody,
  initialStatus,
}: {
  contentId: string;
  initialBody: string;
  initialStatus: string;
}) {
  const [body, setBody] = useState(initialBody);
  const [status, setStatus] = useState<ReviewStatus>(initialStatus as ReviewStatus);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(initialBody);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const approved = status === "approved";

  function startEditing() {
    setDraft(body);
    setError(null);
    setEditing(true);
  }

  function cancelEditing() {
    if (draft !== body && !window.confirm("Discard unsaved changes?")) {
      return;
    }
    setEditing(false);
    setError(null);
  }

  async function saveEdit() {
    setSaving(true);
    setError(null);
    try {
      const res = await apiFetch(`/api/content/${contentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: draft }),
      });
      if (res.ok) {
        setBody(draft);
        setEditing(false);
      } else {
        const data = (await res.json().catch(() => null)) as { error?: string } | null;
        setError(data?.error || "Couldn't save — please try again.");
      }
    } catch {
      setError("Couldn't save — check your connection and try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <div className="mt-5 rounded-2xl border border-[var(--rule)] bg-white/62 p-5 text-sm">
        {editing ? (
          <div className="space-y-3">
            <Textarea
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              rows={14}
              disabled={saving}
              aria-label="Edit content"
              className="min-h-[240px] text-[13px] leading-6"
            />
            {error ? (
              <p role="alert" className="text-[12px] text-red-600">
                {error}
              </p>
            ) : null}
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="accent"
                size="sm"
                onClick={saveEdit}
                disabled={saving || draft.trim().length === 0}
              >
                {saving ? "Saving…" : "Save"}
              </Button>
              <Button variant="secondary" size="sm" onClick={cancelEditing} disabled={saving}>
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <MarkdownBody>{body}</MarkdownBody>
        )}
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--border)] pt-4">
        {editing ? (
          <span className="text-[12px] text-[var(--text-muted)]">Editing — save or cancel to review.</span>
        ) : (
          <ContentReviewButtons contentId={contentId} currentStatus={status} onStatusChange={setStatus} />
        )}
        <div className="flex flex-wrap items-center gap-2">
          {!editing ? (
            <span title={approved ? "Undo approval to edit" : undefined}>
              <Button
                variant="secondary"
                size="sm"
                onClick={startEditing}
                disabled={approved}
                aria-disabled={approved || undefined}
              >
                Edit
              </Button>
            </span>
          ) : null}
          <CopyButton text={editing ? draft : body} />
        </div>
      </div>
    </>
  );
}
