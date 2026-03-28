"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { BodyText, Button, Card, CardTitle, Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@canopy/ui";
import { StoriesShell } from "@/app/_components/stories-shell";

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
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  useEffect(() => {
    fetch("/api/stories")
      .then((r) => r.json())
      .then((data) => { setStories(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

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
            className="pl-9"
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-44">
            <SelectValue>
              {typeFilter === "all" ? "All Types" : typeFilter.replace("_", "/")}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="ESL">ESL</SelectItem>
            <SelectItem value="HSD_GED">HSD/GED</SelectItem>
            <SelectItem value="CTE">CTE</SelectItem>
            <SelectItem value="EMPLOYER">Employer</SelectItem>
            <SelectItem value="STAFF">Staff</SelectItem>
            <SelectItem value="PARTNER">Partner</SelectItem>
            <SelectItem value="OVERVIEW">Overview</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex items-center gap-1 rounded-xl border border-[var(--border)] bg-white p-1">
          <button
            type="button"
            onClick={() => setViewMode("grid")}
            className={`h-8 rounded-lg px-3 text-sm font-medium transition-colors ${viewMode === "grid" ? "bg-[var(--surface-muted)] text-[var(--foreground)]" : "text-[var(--text-muted)]"}`}
          >
            Grid
          </button>
          <button
            type="button"
            onClick={() => setViewMode("list")}
            className={`h-8 rounded-lg px-3 text-sm font-medium transition-colors ${viewMode === "list" ? "bg-[var(--surface-muted)] text-[var(--foreground)]" : "text-[var(--text-muted)]"}`}
          >
            List
          </button>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} padding="sm" className="h-40 animate-pulse rounded-[20px] bg-[var(--surface-muted)]" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card padding="md" className="py-12 text-center">
          <CardTitle>
            {search || typeFilter !== "all" ? "No stories match your filters" : "No stories yet"}
          </CardTitle>
          <BodyText muted className="mt-2">
            {search || typeFilter !== "all"
              ? "Try clearing your search or type filter."
              : "Stories are created automatically when intake forms are submitted."}
          </BodyText>
        </Card>
      ) : (
        <div className={viewMode === "grid" ? "grid gap-4 md:grid-cols-2 lg:grid-cols-3" : "space-y-3"}>
          {filtered.map((story) => (
            <Card
              key={story.id}
              padding="sm"
              className={`flex flex-col rounded-[20px] transition hover:shadow-sm ${viewMode === "list" ? "flex-row items-center gap-4" : ""}`}
            >
              <div className={`flex items-start justify-between gap-3 ${viewMode === "list" ? "flex-1" : ""}`}>
                <div className="min-w-0">
                  <CardTitle className="text-base leading-snug">{story.title || "Untitled Story"}</CardTitle>
                  {story.subjectName && (
                    <BodyText muted className="mt-1 text-[12px]">{story.subjectName}</BodyText>
                  )}
                </div>
                <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.06em] ${stageBadge(story.currentStage)}`}>
                  {story.currentStage.replace(/_/g, " ")}
                </span>
              </div>

              {viewMode === "grid" && (
                <div className="mt-3">
                  <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.06em] ${typeColors[story.storyType] ?? "bg-gray-100 text-gray-700"}`}>
                    {story.storyType.replace("_", "/")}
                  </span>
                </div>
              )}

              <div className={`${viewMode === "grid" ? "mt-4" : "shrink-0"}`}>
                <Button asChild variant="primary" size="sm" className={viewMode === "grid" ? "w-full" : ""}>
                  <Link href={`/stories/${story.id}`}>Open Story</Link>
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </StoriesShell>
  );
}
