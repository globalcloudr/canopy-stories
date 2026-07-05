"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@globalcloudr/canopy-ui";
import { copyTextToClipboard } from "@/lib/copy-text";

type CopyButtonProps = {
  text: string;
  label?: string;
  className?: string;
};

export function CopyButton({ text, label = "Copy", className }: CopyButtonProps) {
  const [state, setState] = useState<"idle" | "copied" | "error">("idle");
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  async function handleCopy() {
    const ok = await copyTextToClipboard(text);
    setState(ok ? "copied" : "error");
    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = window.setTimeout(() => setState("idle"), 2000);
  }

  return (
    <Button type="button" variant="secondary" size="sm" onClick={handleCopy} className={className}>
      <span aria-live="polite">
        {state === "copied" ? "Copied" : state === "error" ? "Copy failed" : label}
      </span>
    </Button>
  );
}
