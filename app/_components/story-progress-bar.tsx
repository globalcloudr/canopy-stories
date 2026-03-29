// Pipeline progress stepper — server-safe, no "use client" needed.
// Renders inline in story detail pages to show where a story is in the pipeline.

const STAGES = [
  { key: "form_sent",       label: "Form sent" },
  { key: "submitted",       label: "Response received" },
  { key: "ai_processing",   label: "Writing content" },
  { key: "asset_generation",label: "Creating graphics" },
  { key: "packaging",       label: "Packaging" },
  { key: "delivered",       label: "Delivered" },
] as const;

type StageKey = (typeof STAGES)[number]["key"];

function stageIndex(key: string): number {
  return STAGES.findIndex((s) => s.key === key);
}

export function StoryProgressBar({ currentStage }: { currentStage: string }) {
  const current = stageIndex(currentStage);

  return (
    <div className="w-full overflow-x-auto">
      <ol className="flex min-w-[480px] items-center gap-0">
        {STAGES.map((stage, i) => {
          const done = i < current;
          const active = i === current;
          const upcoming = i > current;

          return (
            <li key={stage.key} className="flex flex-1 items-center">
              {/* Step bubble */}
              <div className="flex flex-col items-center gap-1.5">
                <div
                  className={`grid h-8 w-8 shrink-0 place-items-center rounded-full border-2 text-[12px] font-bold transition-colors ${
                    done
                      ? "border-[#1e40af] bg-[#1e40af] text-white"
                      : active
                      ? "border-[#1e40af] bg-white text-[#1e40af]"
                      : "border-[var(--border)] bg-[var(--surface-muted)] text-[var(--text-muted)]"
                  }`}
                >
                  {done ? (
                    <svg viewBox="0 0 12 12" fill="none" className="h-3.5 w-3.5" aria-hidden="true">
                      <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ) : (
                    <span>{i + 1}</span>
                  )}
                </div>
                <span
                  className={`w-20 text-center text-[11px] leading-snug ${
                    active
                      ? "font-semibold text-[var(--foreground)]"
                      : upcoming
                      ? "text-[var(--text-muted)]"
                      : "text-[#1e40af]"
                  }`}
                >
                  {stage.label}
                </span>
              </div>

              {/* Connector line (not after last step) */}
              {i < STAGES.length - 1 && (
                <div
                  className={`h-0.5 flex-1 transition-colors ${
                    i < current ? "bg-[#1e40af]" : "bg-[var(--border)]"
                  }`}
                  aria-hidden="true"
                />
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
