"use client";

import { Badge, Card, CardTitle, BodyText } from "@canopy/ui";

type PipelineStory = {
  id: string;
  title: string;
  subject: string;
  type: string;
  stage: string;
};

const stages = [
  { key: "form_sent", label: "Form Sent" },
  { key: "submitted", label: "Submitted" },
  { key: "ai_processing", label: "AI Processing" },
  { key: "asset_generation", label: "Asset Generation" },
  { key: "packaging", label: "Packaging" },
  { key: "delivered", label: "Delivered" },
] as const;

const typeColors: Record<string, string> = {
  ESL: "bg-blue-100 text-blue-800",
  HSD_GED: "bg-green-100 text-green-800",
  CTE: "bg-purple-100 text-purple-800",
  EMPLOYER: "bg-orange-100 text-orange-800",
  STAFF: "bg-pink-100 text-pink-800",
  PARTNER: "bg-teal-100 text-teal-800",
  OVERVIEW: "bg-gray-100 text-gray-800",
};

const stageHeaderColors: Record<string, string> = {
  form_sent: "border-blue-200 bg-blue-50",
  submitted: "border-green-200 bg-green-50",
  ai_processing: "border-purple-200 bg-purple-50",
  asset_generation: "border-cyan-200 bg-cyan-50",
  packaging: "border-orange-200 bg-orange-50",
  delivered: "border-emerald-200 bg-emerald-50",
};

export function PipelineBoard({ stories }: { stories: PipelineStory[] }) {
  const grouped: Record<string, PipelineStory[]> = {};
  for (const stage of stages) {
    grouped[stage.key] = stories.filter((s) => s.stage === stage.key);
  }

  return (
    <div className="flex gap-3 overflow-x-auto pb-3">
      {stages.map((stage) => {
        const items = grouped[stage.key] ?? [];
        const headerClass = stageHeaderColors[stage.key] ?? "border-gray-200 bg-gray-50";

        return (
          <div key={stage.key} className="w-[260px] flex-shrink-0">
            <div className={`mb-2 flex items-center justify-between rounded-xl border px-3 py-2 ${headerClass}`}>
              <span className="text-[13px] font-semibold text-[var(--foreground)]">{stage.label}</span>
              <span className="rounded-full bg-white/80 px-2 py-0.5 text-[12px] font-semibold text-[var(--text-muted)]">
                {items.length}
              </span>
            </div>
            <div className="space-y-2">
              {items.map((story) => (
                <Card key={story.id} variant="soft" padding="sm" className="rounded-[16px]">
                  <p className="line-clamp-2 text-[13px] font-semibold leading-snug text-[var(--foreground)]">
                    {story.title}
                  </p>
                  <BodyText muted className="mt-1 text-[12px]">{story.subject}</BodyText>
                  <div className="mt-2">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${typeColors[story.type] ?? "bg-gray-100 text-gray-700"}`}
                    >
                      {story.type.replace("_", "/")}
                    </span>
                  </div>
                </Card>
              ))}
              {items.length === 0 && (
                <div className="rounded-xl border border-dashed border-[var(--border)] px-3 py-6 text-center">
                  <BodyText muted className="text-[12px]">No stories</BodyText>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
