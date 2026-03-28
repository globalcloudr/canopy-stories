"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { BodyText, Card, CardTitle } from "@canopy/ui";
import type { AssetLibraryItem } from "@/lib/stories-data";

type AssetsLibraryProps = {
  assets: AssetLibraryItem[];
};

export function AssetsLibrary({ assets }: AssetsLibraryProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");

  const filteredAssets = useMemo(() => {
    return assets.filter((asset) => {
      const matchesSearch =
        asset.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        asset.storyTitle.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = filterType === "all" || asset.assetType === filterType;
      return matchesSearch && matchesType;
    });
  }, [assets, searchQuery, filterType]);

  return (
    <>
      <section className="flex gap-4">
        <input
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          placeholder="Search assets..."
          className="flex-1 rounded-xl border border-[var(--border)] bg-white px-4 py-3 text-[15px] text-[var(--foreground)] outline-none"
        />
        <select
          value={filterType}
          onChange={(event) => setFilterType(event.target.value)}
          className="w-48 rounded-xl border border-[var(--border)] bg-white px-4 py-3 text-[15px] text-[var(--foreground)] outline-none"
        >
          <option value="all">All Assets</option>
          <option value="video">Video</option>
          <option value="image">Image</option>
          <option value="graphic">Graphic</option>
          <option value="document">Document</option>
        </select>
      </section>

      {filteredAssets.length === 0 ? (
        <Card padding="md" className="sm:p-10">
          <BodyText muted className="text-center">
            {searchQuery || filterType !== "all"
              ? "No assets found matching your filters."
              : "No assets yet. Assets will appear here when stories complete automation."}
          </BodyText>
        </Card>
      ) : (
        <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredAssets.map((asset) => (
            <Card key={asset.id} padding="md" className="rounded-[20px] border border-[var(--border)] bg-white sm:p-6">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <CardTitle className="text-base">{asset.fileName}</CardTitle>
                  <BodyText muted className="mt-2">{asset.storyTitle}</BodyText>
                </div>
                <BodyText muted as="span" className="text-xs uppercase tracking-[0.08em]">
                  {asset.assetType}
                </BodyText>
              </div>
              <div className="mt-5 space-y-2 text-sm text-[var(--text-muted)]">
                {asset.platform ? <div>Platform: {asset.platform}</div> : null}
                {asset.dimensions ? <div>Size: {asset.dimensions}</div> : null}
                <div>Status: {asset.status}</div>
              </div>
              <div className="mt-5 flex gap-2">
                <Link href={`/stories/${asset.storyId}`} className="inline-flex rounded-xl border border-[var(--border)] px-4 py-2 text-sm">
                  View Story
                </Link>
                {asset.fileUrl && !asset.fileUrl.startsWith("[") ? (
                  <a
                    href={asset.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex rounded-xl border border-[var(--border)] px-4 py-2 text-sm"
                  >
                    Open Asset
                  </a>
                ) : null}
              </div>
            </Card>
          ))}
        </section>
      )}
    </>
  );
}
