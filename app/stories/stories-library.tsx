"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Badge, BodyText, Card, CardTitle } from "@canopy/ui";
import type { StoryLibraryItem } from "@/lib/stories-data";
import { formatRelativeDate } from "@/lib/stories-domain";

type StoriesLibraryProps = {
  items: StoryLibraryItem[];
};

function storyStatusLabel(stage: string) {
  return stage === "delivered" ? "published" : "draft";
}

export function StoriesLibrary({ items }: StoriesLibraryProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch =
        item.story.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.story.subjectName || "").toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = typeFilter === "all" || item.story.storyType.toLowerCase() === typeFilter.toLowerCase();
      return matchesSearch && matchesType;
    });
  }, [items, searchQuery, typeFilter]);

  return (
    <>
      <section className="flex items-center gap-3 flex-wrap">
        <input
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          placeholder="Search stories..."
          className="flex-1 min-w-64 rounded-xl border border-[#dfe7f4] bg-transparent px-4 py-3 text-[15px] text-[var(--foreground)] outline-none"
        />
        <select
          value={typeFilter}
          onChange={(event) => setTypeFilter(event.target.value)}
          className="w-48 rounded-xl border border-[#dfe7f4] bg-transparent px-4 py-3 text-[15px] text-[var(--foreground)] outline-none"
        >
          <option value="all">All Types</option>
          <option value="esl">ESL</option>
          <option value="hsd_ged">HSD/GED</option>
          <option value="cte">CTE</option>
          <option value="employer">Employer</option>
          <option value="staff">Staff</option>
          <option value="partner">Partner</option>
          <option value="overview">Overview</option>
        </select>
        <div className="flex items-center gap-1 rounded-xl border border-[#dfe7f4] bg-transparent p-1">
          <button
            type="button"
            onClick={() => setViewMode("grid")}
            className={`h-8 rounded-md px-3 text-sm ${viewMode === "grid" ? "border border-[#d7e3f3] bg-[#edf3fb]" : ""}`}
          >
            Grid
          </button>
          <button
            type="button"
            onClick={() => setViewMode("list")}
            className={`h-8 rounded-md px-3 text-sm ${viewMode === "list" ? "border border-[#d7e3f3] bg-[#edf3fb]" : ""}`}
          >
            List
          </button>
        </div>
      </section>

      {filteredItems.length === 0 ? (
        <Card padding="md" className="border border-[#dfe7f4] bg-transparent shadow-none sm:p-10">
          <BodyText muted className="text-center">
            {searchQuery || typeFilter !== "all"
              ? "No stories found matching your filters."
              : "No stories yet. Stories are created automatically when forms are submitted."}
          </BodyText>
        </Card>
      ) : (
        <section className={viewMode === "grid" ? "grid gap-4 md:grid-cols-2 lg:grid-cols-3" : "space-y-4"}>
          {filteredItems.map((item) => (
            <Link key={item.story.id} href={`/stories/${item.story.id}`} className="block">
              <Card
                padding="md"
                className={`rounded-[20px] border border-[#dfe7f4] bg-transparent shadow-none transition hover:border-[#c8d7eb] hover:bg-white/65 ${
                  viewMode === "list" ? "sm:p-5" : "sm:p-6"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <CardTitle className="text-lg">{item.story.title || "Untitled Story"}</CardTitle>
                    <BodyText muted className="mt-2">{item.story.subjectName || "N/A"}</BodyText>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {storyStatusLabel(item.story.currentStage)}
                  </Badge>
                </div>
                <BodyText muted className="mt-4">
                  {item.excerpt}
                  {item.excerpt.endsWith("...") ? "" : "..."}
                </BodyText>
                <div className="mt-5 flex items-center justify-between gap-3 text-sm text-[var(--text-muted)]">
                  <span>{item.story.storyType.replace("_", "/")}</span>
                  <span>{formatRelativeDate(item.story.createdAt)}</span>
                </div>
              </Card>
            </Link>
          ))}
        </section>
      )}
    </>
  );
}
