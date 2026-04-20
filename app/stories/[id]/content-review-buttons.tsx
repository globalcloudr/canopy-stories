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

  async function setContentStatus(next: ReviewStatus) {
    setLoading(true);
    try {
      const res = await apiFetch(`/api/content/${contentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      if (res.ok) setStatus(next);
    } finally {
      setLoading(false);
    }
  }

  if (status === "approved") {
    return (
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[12px] font-medium text-emerald-700">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          Approved
        </span>
        <button
          onClick={() => setContentStatus("draft")}
          disabled={loading}
          className="text-[12px] text-[var(--text-muted)] underline underline-offset-2 hover:text-[var(--foreground)] disabled:opacity-50"
        >
          Undo
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="primary"
        size="sm"
        onClick={() => setContentStatus("approved")}
        disabled={loading}
      >
        Approve
      </Button>
      <Button
        variant="secondary"
        size="sm"
        onClick={() => setContentStatus("draft")}
        disabled={loading || status === "draft"}
      >
        Flag for revision
      </Button>
    </div>
  );
}
