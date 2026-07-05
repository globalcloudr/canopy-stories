"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Stages where the automation pipeline is actively working and the page
// should keep itself fresh without a manual reload.
const IN_PROGRESS_STAGES = ["ai_processing", "asset_generation", "packaging"];

export function StoryAutoRefresh({ currentStage }: { currentStage: string }) {
  const router = useRouter();
  const active = IN_PROGRESS_STAGES.includes(currentStage);

  useEffect(() => {
    if (!active) {
      return;
    }
    const interval = window.setInterval(() => {
      router.refresh();
    }, 5000);
    return () => {
      window.clearInterval(interval);
    };
  }, [active, router]);

  return null;
}
