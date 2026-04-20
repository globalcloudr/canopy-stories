"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@globalcloudr/canopy-ui";
import { apiFetch } from "@/lib/api-client";

export function RegenerateButton({ storyId }: { storyId: string }) {
  const router = useRouter();
  const [state, setState] = useState<"idle" | "confirming" | "running">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleRegenerate() {
    setState("running");
    setError(null);
    try {
      const res = await apiFetch(`/api/stories/${storyId}/regenerate`, { method: "POST" });
      const payload = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok) throw new Error(payload.error ?? "Regeneration failed.");
      router.refresh();
      setState("idle");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setState("idle");
    }
  }

  if (state === "confirming") {
    return (
      <div className="flex items-center gap-2">
        <span className="text-[13px] text-[var(--text-muted)]">This will replace all existing content and assets.</span>
        <Button variant="secondary" size="sm" onClick={() => setState("idle")}>Cancel</Button>
        <Button variant="accent" size="sm" onClick={handleRegenerate}>Yes, regenerate</Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <Button
        variant="secondary"
        size="sm"
        onClick={() => setState("confirming")}
        disabled={state === "running"}
      >
        {state === "running" ? "Regenerating…" : "Regenerate story"}
      </Button>
      {error ? <span className="text-[13px] text-rose-600">{error}</span> : null}
    </div>
  );
}
