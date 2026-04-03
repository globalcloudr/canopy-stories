"use client"
export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import Link from "next/link";
import { BodyText, Button, Card, CardTitle, Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@canopy/ui";
import { StoriesShell } from "@/app/_components/stories-shell";
import { apiFetchArray } from "@/lib/api-client";
import { pipelineStageLabel, storyTypeLabel } from "@/lib/stories-domain";
import { useStoriesWorkspaceId } from "@/lib/workspace-client";

type Story = {
  id: string;
  title: string;
  subjectName: string | null;
  storyType: string;
  currentStage: string;
  projectId: string;
  workspaceId: string;
  createdAt: string;
};

const typeColors: Record<string, string> = {
  ESL: "bg-blue-100 text-blue-800",
  HSD_GED: "bg-green-100 text-green-800",
  CTE: "bg-purple-100 text-purple-800",
  EMPLOYER: "bg-orange-100 text-orange-800",
  STAFF: "bg-pink-100 text-pink-800",
  PARTNER: "bg-teal-100 text-teal-800",
  OVERVIEW: "bg-gray-100 text-gray-800",
};

function stageBadge(stage: string) {
  if (stage === "delivered") return "border-emerald-200 bg-emerald-50 text-emerald-700";
  if (stage === "packaging" || stage === "asset_generation") return "border-amber-200 bg-amber-50 text-amber-700";
  return "border-indigo-200 bg-indigo-50 text-indigo-700";
}

export default function StoriesPage() {
  const workspaceId = useStoriesWorkspaceId();
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  useEffect(() => {
    if (!workspaceId) {
      setStories([]);
      setLoading(true);
      return;
    }

    setLoading(true);
    apiFetchArray<Story>(`/api/stories?workspaceId=${encodeURIComponent(workspaceId)}`)
      .then((data) => { setStories(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [workspaceId]);

  const filtered = stories.filter((s) => {
    const q = search.toLowerCase();
    const matchSearch =
      s.title.toLowerCase().includes(q) ||
      (s.subjectName ?? "").toLowerCase().includes(q);
    const matchType = typeFilter === "all" || s.storyType === typeFilter;
    return matchSearch && matchType;
  });

  return (
    <StoriesShell
      activeNav="stories"
      eyebrow="Stories"
      title="Stories"
      subtitle="Browse and manage your success story library"
      headerMeta={loading ? undefined : `${stories.length} stor${stories.length === 1 ? "y" : "ies"}`}
    >
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[220px] flex-1">
          <svg
            viewBox="0 0 20 20"
            fill="currentColor"
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]"
          >
            <path
              fillRule="evenodd"
              d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z"
              clipRule="evenodd"
            />
          </svg>
          <Input
            placeholder="Search stories..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border-[#dfe7f4] bg-transparent pl-9"
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-44 border-[#dfe7f4] bg-transparent">
            <SelectValue>
              {typeFilter === "all" ? "All Types" : storyTypeLabel(typeFilter)}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="ESL">ESL</SelectItem>
            <SelectItem value="HSD_GED">HSD / GED</SelectItem>
            <SelectItem value="CTE">CTE</SelectItem>
            <SelectItem value="EMPLOYER">Employer</SelectItem>
            <SelectItem value="STAFF">Staff</SelectItem>
            <SelectItem value="PARTNER">Partner</SelectItem>
            <SelectItem value="OVERVIEW">Overview</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Content */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-14 animate-pulse rounded-xl bg-[var(--surface-muted)]" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-12 text-center">
          <CardTitle>
            {search || typeFilter !== "all" ? "No stories match your filters" : "No stories yet"}
          </CardTitle>
          <BodyText muted className="mt-2">
            {search || typeFilter !== "all"
              ? "Try clearing your search or type filter."
              : "Stories are created automatically when intake forms are submitted."}
          </BodyText>
        </div>
      ) : (
        <div className="rounded-[24px] border border-[#dfe7f4] bg-transparent shadow-none divide-y divide-[var(--border)]">
          {filtered.map((story) => (
            <div key={story.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-medium text-[var(--foreground)]">{story.title || "Untitled Story"}</span>
                  <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.06em] ${typeColors[story.storyType] ?? "bg-gray-100 text-gray-700"}`}>
                    {storyTypeLabel(story.storyType)}
                  </span>
                </div>
                {story.subjectName && (
                  <BodyText muted className="mt-0.5 text-[13px]">{story.subjectName}</BodyText>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className={`rounded-full border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.06em] ${stageBadge(story.currentStage)}`}>
                  {pipelineStageLabel(story.currentStage)}
                </span>
                <Button asChild variant="secondary" size="sm">
                  <Link href={`/stories/${story.id}`}>Open</Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </StoriesShell>
  );
}
