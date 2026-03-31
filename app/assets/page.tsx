"use client"
export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import Link from "next/link";
import { BodyText, Button, CardTitle, Input } from "@canopy/ui";
import { StoriesShell } from "@/app/_components/stories-shell";

type Asset = {
  id: string;
  storyId: string;
  storyTitle: string;
  assetType: string;
  fileName?: string;
  fileUrl: string | null;
  platform?: string | null;
  dimensions?: string | null;
  status: string;
  createdAt: string;
};

const assetTypeFilters = ["all", "video", "image", "graphic", "document"] as const;

export default function AssetsPage() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  useEffect(() => {
    fetch("/api/assets")
      .then((r) => r.json())
      .then((data) => { setAssets(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filtered = assets.filter((a) => {
    const q = search.toLowerCase();
    const matchSearch =
      (a.storyTitle ?? "").toLowerCase().includes(q) ||
      (a.fileName ?? "").toLowerCase().includes(q) ||
      a.assetType.toLowerCase().includes(q);
    const matchType = typeFilter === "all" || a.assetType.toLowerCase() === typeFilter;
    return matchSearch && matchType;
  });

  const counts: Record<string, number> = {
    all: assets.length,
    video: assets.filter((a) => a.assetType === "video").length,
    image: assets.filter((a) => a.assetType === "image").length,
    graphic: assets.filter((a) => a.assetType === "graphic").length,
    document: assets.filter((a) => a.assetType === "document").length,
  };

  return (
    <StoriesShell
      activeNav="assets"
      eyebrow="Assets"
      title="Assets"
      subtitle="All generated graphics, videos, and visual content"
      headerMeta={loading ? undefined : `${assets.length} asset${assets.length === 1 ? "" : "s"}`}
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
            placeholder="Search assets..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border-[#dfe7f4] bg-transparent pl-9"
          />
        </div>
        <div className="flex items-center gap-1">
          {assetTypeFilters.map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setTypeFilter(type)}
              className={`rounded-full border px-3 py-1.5 text-[12px] font-medium transition-colors ${
                typeFilter === type
                  ? "border-[var(--foreground)] bg-[var(--foreground)] text-white"
                  : "border-[#d7e3f3] bg-[#edf3fb] text-[var(--text-muted)] hover:border-[#c8d7eb] hover:text-[var(--foreground)]"
              }`}
            >
              {type === "all" ? "All" : type.charAt(0).toUpperCase() + type.slice(1) + "s"}
              {!loading && (
                <span className="ml-1.5 opacity-60">{counts[type]}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-14 animate-pulse rounded-xl bg-[var(--surface-muted)]" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-12 text-center">
          <CardTitle>
            {search || typeFilter !== "all" ? "No assets match your filters" : "No assets yet"}
          </CardTitle>
          <BodyText muted className="mt-2">
            {search || typeFilter !== "all"
              ? "Try clearing your search or type filter."
              : "Assets appear here when stories complete automation."}
          </BodyText>
        </div>
      ) : (
        <div className="rounded-[24px] border border-[#dfe7f4] bg-transparent shadow-none divide-y divide-[var(--border)]">
          {filtered.map((asset) => (
            <div key={asset.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-[var(--foreground)]">
                    {asset.fileName || asset.storyTitle || "Untitled Asset"}
                  </span>
                  <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--text-muted)]">
                    {asset.assetType}{asset.platform ? ` · ${asset.platform}` : ""}
                  </span>
                </div>
                <BodyText muted className="mt-0.5 text-[13px]">
                  {asset.storyTitle}{asset.dimensions ? ` · ${asset.dimensions}` : ""}
                </BodyText>
              </div>
              <div className="flex items-center gap-2">
                <span className={`rounded-full border px-2 py-0.5 text-[11px] font-semibold ${asset.status === "ready" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-gray-200 bg-gray-50 text-gray-600"}`}>
                  {asset.status}
                </span>
                <Button asChild variant="secondary" size="sm">
                  <Link href={`/stories/${asset.storyId}`}>Story</Link>
                </Button>
                {asset.fileUrl && !asset.fileUrl.startsWith("[") && (
                  <Button asChild variant="primary" size="sm">
                    <a href={asset.fileUrl} target="_blank" rel="noopener noreferrer">Download</a>
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </StoriesShell>
  );
}
