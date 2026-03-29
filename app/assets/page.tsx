"use client"
export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import Link from "next/link";
import { BodyText, Button, Card, CardTitle, Input } from "@canopy/ui";
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

  const counts = {
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
      {/* Stat cards */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {(["video", "image", "graphic", "document"] as const).map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => setTypeFilter(typeFilter === type ? "all" : type)}
            className={`rounded-[20px] border p-4 text-left transition ${
              typeFilter === type
                ? "border-[var(--foreground)] bg-[var(--foreground)] text-white"
                : "border-[var(--border)] bg-white hover:border-slate-300"
            }`}
          >
            <p className={`text-[12px] font-medium uppercase tracking-[0.06em] ${typeFilter === type ? "text-white/70" : "text-[var(--text-muted)]"}`}>
              {type.charAt(0).toUpperCase() + type.slice(1)}s
            </p>
            <p className={`mt-1 text-3xl font-bold ${typeFilter === type ? "text-white" : "text-[var(--foreground)]"}`}>
              {loading ? "—" : counts[type]}
            </p>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
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
          className="pl-9"
        />
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} padding="sm" className="h-36 animate-pulse rounded-[20px] bg-[var(--surface-muted)]" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card padding="md" className="py-12 text-center">
          <CardTitle>
            {search || typeFilter !== "all" ? "No assets match your filters" : "No assets yet"}
          </CardTitle>
          <BodyText muted className="mt-2">
            {search || typeFilter !== "all"
              ? "Try clearing your search or type filter."
              : "Assets appear here when stories complete automation."}
          </BodyText>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((asset) => (
            <Card key={asset.id} padding="sm" className="flex flex-col rounded-[20px]">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--text-muted)]">
                    {asset.assetType}
                    {asset.platform ? ` · ${asset.platform}` : ""}
                  </p>
                  <CardTitle className="mt-1 text-sm leading-snug">
                    {asset.fileName || asset.storyTitle || "Untitled Asset"}
                  </CardTitle>
                  <BodyText muted className="mt-1 text-[12px] line-clamp-1">{asset.storyTitle}</BodyText>
                </div>
                <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[11px] font-semibold ${asset.status === "ready" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-gray-200 bg-gray-50 text-gray-600"}`}>
                  {asset.status}
                </span>
              </div>

              {asset.dimensions && (
                <BodyText muted className="mt-2 text-[12px]">{asset.dimensions}</BodyText>
              )}

              <div className="mt-4 flex items-center gap-2">
                <Button asChild variant="secondary" size="sm" className="flex-1">
                  <Link href={`/stories/${asset.storyId}`}>View Story</Link>
                </Button>
                {asset.fileUrl && !asset.fileUrl.startsWith("[") && (
                  <Button asChild variant="primary" size="sm">
                    <a href={asset.fileUrl} target="_blank" rel="noopener noreferrer">Download</a>
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </StoriesShell>
  );
}
