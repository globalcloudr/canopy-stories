"use client";

import { useState } from "react";
import { Button } from "@globalcloudr/canopy-ui";
import { apiFetch } from "@/lib/api-client";

type ReviewStatus = "draft" | "ready" | "approved";

export function ContentReviewButtons({
  contentId,
  currentStatus,
}: {
  contentId: string;
  currentStatus: string;
}) {
  const [status, setStatus] = useState<ReviewStatus>(currentStatus as ReviewStatus);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function setContentStatus(next: ReviewStatus) {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch(`/api/content/${contentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      if (res.ok) {
        setStatus(next);
      } else {
        setError("Couldn't save — please try again.");
      }
    } catch {
      setError("Couldn't save — check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  if (status === "approved") {
    return (
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--rule)] bg-[var(--surface-muted)] px-2.5 py-1 text-[12px] font-medium text-[var(--success)]">
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--success)]" />
          Approved
        </span>
        <button
          onClick={() => setContentStatus("draft")}
          disabled={loading}
          className="text-[12px] text-[var(--text-muted)] underline underline-offset-2 hover:text-[var(--foreground)] disabled:opacity-50"
        >
          Undo
        </button>
        {error && (
          <span role="alert" className="text-[12px] text-red-600">
            {error}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        variant="accent"
        size="sm"
        onClick={() => setContentStatus("approved")}
        disabled={loading}
      >
        {loading ? "Saving…" : "Approve"}
      </Button>
      <Button
        variant="secondary"
        size="sm"
        onClick={() => setContentStatus("draft")}
        disabled={loading || status === "draft"}
      >
        Flag for revision
      </Button>
      {error && (
        <span role="alert" className="text-[12px] text-red-600">
          {error}
        </span>
      )}
    </div>
  );
}
