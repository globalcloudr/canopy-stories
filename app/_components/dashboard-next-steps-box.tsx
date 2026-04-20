"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BodyText, Button, Card, CardTitle } from "@globalcloudr/canopy-ui";

type DashboardGuideItem = {
  eyebrow: string;
  title: string;
  description: string;
  ctaLabel: string;
  ctaHref: string;
};

type DashboardNextStepsBoxProps = {
  items: DashboardGuideItem[];
  storageKey: string;
};

export function DashboardNextStepsBox({ items, storageKey }: DashboardNextStepsBoxProps) {
  const [ready, setReady] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    try {
      setDismissed(window.localStorage.getItem(storageKey) === "1");
    } catch {
      setDismissed(false);
    } finally {
      setReady(true);
    }
  }, [storageKey]);

  function handleDismiss() {
    try {
      window.localStorage.setItem(storageKey, "1");
    } catch {
      // Ignore storage failures and still hide the box for this session.
    }
    setDismissed(true);
  }

  if (!ready || dismissed) {
    return null;
  }

  return (
    <Card padding="md" className="rounded-[24px] border border-[#dfe7f4] bg-[#f7fafd] shadow-none sm:p-7">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#2f76dd]">Quick Start</p>
          <CardTitle className="mt-3 text-[1.4rem]">Helpful next steps for your team</CardTitle>
          <BodyText muted className="mt-2 max-w-3xl text-[14px] leading-6">
            Keep this box around as a guide while you get started, or close it once your team is comfortable with the workflow.
          </BodyText>
        </div>
        <button
          type="button"
          onClick={handleDismiss}
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#d7e3f3] bg-white text-[var(--text-muted)] transition hover:border-[#c8d7eb] hover:text-[var(--foreground)]"
          aria-label="Dismiss quick start box"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
            <path d="M18 6L6 18" />
            <path d="M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {items.map((item) => (
          <div key={item.title} className="rounded-[20px] border border-[#dfe7f4] bg-white px-5 py-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#7b8ca3]">{item.eyebrow}</p>
            <CardTitle className="mt-2 text-[1.1rem] leading-snug">{item.title}</CardTitle>
            <BodyText muted className="mt-3 text-[14px] leading-6">{item.description}</BodyText>
            <div className="mt-4">
              <Button asChild variant="secondary" size="sm">
                <Link href={item.ctaHref}>{item.ctaLabel}</Link>
              </Button>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
