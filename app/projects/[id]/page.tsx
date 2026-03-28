"use client";

import { useState, useEffect, useCallback, use } from "react";
import Link from "next/link";
import { BodyText, Button, Card, CardTitle } from "@canopy/ui";
import { StoriesShell } from "@/app/_components/stories-shell";
import { PipelineBoard } from "@/app/_components/pipeline-board";
import { FormBuilderDialog } from "@/app/_components/form-builder-dialog";
import type { FlatProject, FlatForm } from "@/lib/stories-data";

type Story = {
  id: string;
  title: string;
  subjectName: string | null;
  storyType: string;
  currentStage: string;
  updatedAt: string;
};

type Package = {
  id: string;
  name: string;
  description: string | null;
  status: string;
  downloadCount: number;
  createdAt: string;
};

type Asset = {
  id: string;
  storyId: string;
  storyTitle: string;
  assetType: string;
  fileUrl: string | null;
  status: string;
  createdAt: string;
};

type Tab = "overview" | "forms" | "content" | "assets" | "package";

function formatDeadline(value: string | null) {
  if (!value) return "No deadline";
  const d = new Date(value);
  const days = Math.ceil((d.getTime() - Date.now()) / 86400000);
  const label = d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  if (days < 0) return `${label} (overdue)`;
  if (days === 0) return `${label} (today)`;
  return `${label} (${days}d)`;
}

function statusBadge(status: string) {
  if (status === "active") return "border-emerald-200 bg-emerald-50 text-emerald-700";
  if (status === "paused") return "border-amber-200 bg-amber-50 text-amber-700";
  if (status === "delivered") return "border-blue-200 bg-blue-50 text-blue-700";
  return "border-indigo-200 bg-indigo-50 text-indigo-700";
}

function stageBadge(stage: string) {
  if (stage === "delivered") return "border-emerald-200 bg-emerald-50 text-emerald-700";
  if (stage === "packaging" || stage === "asset_generation") return "border-amber-200 bg-amber-50 text-amber-700";
  return "border-indigo-200 bg-indigo-50 text-indigo-700";
}

const typeColors: Record<string, string> = {
  ESL: "bg-blue-100 text-blue-800",
  HSD_GED: "bg-green-100 text-green-800",
  CTE: "bg-purple-100 text-purple-800",
  EMPLOYER: "bg-orange-100 text-orange-800",
  STAFF: "bg-pink-100 text-pink-800",
  PARTNER: "bg-teal-100 text-teal-800",
  OVERVIEW: "bg-gray-100 text-gray-800",
};

export default function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const [project, setProject] = useState<FlatProject | null>(null);
  const [forms, setForms] = useState<FlatForm[]>([]);
  const [stories, setStories] = useState<Story[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [formBuilderOpen, setFormBuilderOpen] = useState(false);

  const load = useCallback(async () => {
    const [projRes, formsRes, storiesRes, pkgsRes, assetsRes] = await Promise.all([
      fetch(`/api/projects/${id}`),
      fetch(`/api/forms?projectId=${id}`),
      fetch(`/api/stories?projectId=${id}`),
      fetch(`/api/packages?projectId=${id}`),
      fetch(`/api/assets`),
    ]);
    if (projRes.ok) setProject(await projRes.json());
    if (formsRes.ok) setForms(await formsRes.json());
    if (storiesRes.ok) setStories(await storiesRes.json());
    if (pkgsRes.ok) setPackages(await pkgsRes.json());
    if (assetsRes.ok) {
      const all: Asset[] = await assetsRes.json();
      const storyIds = new Set(stories.map((s) => s.id));
      setAssets(all.filter((a) => storyIds.has(a.storyId)));
    }
    setLoading(false);
  }, [id]);

  useEffect(() => {
    load();
    const interval = setInterval(load, 5000);
    return () => clearInterval(interval);
  }, [load]);

  // Re-filter assets when stories list changes
  useEffect(() => {
    if (assets.length > 0) {
      const storyIds = new Set(stories.map((s) => s.id));
      setAssets((prev) => prev.filter((a) => storyIds.has(a.storyId)));
    }
  }, [stories]);

  async function handleDeleteForm(formId: string) {
    if (!window.confirm("Delete this form? This cannot be undone.")) return;
    await fetch(`/api/forms/${formId}`, { method: "DELETE" });
    await load();
  }

  async function handleDeleteStory(storyId: string) {
    if (!window.confirm("Delete this story? This cannot be undone.")) return;
    await fetch(`/api/stories/${storyId}`, { method: "DELETE" });
    await load();
  }

  async function handleDeletePackage(pkgId: string) {
    if (!window.confirm("Delete this package? This cannot be undone.")) return;
    await fetch(`/api/packages/${pkgId}`, { method: "DELETE" });
    await load();
  }

  const pipelineStories = stories.map((s) => ({
    id: s.id,
    title: s.title,
    subject: s.subjectName ?? "",
    type: s.storyType,
    stage: s.currentStage,
  }));

  const tabs: { key: Tab; label: string; count?: number }[] = [
    { key: "overview", label: "Overview" },
    { key: "forms", label: "Forms", count: forms.length },
    { key: "content", label: "Content", count: stories.length },
    { key: "assets", label: "Assets", count: assets.length },
    { key: "package", label: "Package", count: packages.length },
  ];

  if (loading) {
    return (
      <StoriesShell activeNav="projects" eyebrow="Projects" title="Loading..." subtitle="">
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} padding="sm" className="h-28 animate-pulse rounded-[24px] bg-[var(--surface-muted)]" />
          ))}
        </div>
      </StoriesShell>
    );
  }

  if (!project) {
    return (
      <StoriesShell activeNav="projects" eyebrow="Projects" title="Not found" subtitle="">
        <Card padding="md" className="py-12 text-center">
          <CardTitle>Project not found</CardTitle>
          <div className="mt-4">
            <Button asChild variant="primary">
              <Link href="/projects">Back to projects</Link>
            </Button>
          </div>
        </Card>
      </StoriesShell>
    );
  }

  return (
    <StoriesShell
      activeNav="projects"
      eyebrow={project.workspaceName}
      title={project.name}
      subtitle={project.description || "Live project workspace for forms, submissions, and linked story records."}
      headerMeta={`Deadline: ${formatDeadline(project.deadlineAt)}`}
      headerActions={
        <>
          <Button asChild variant="secondary">
            <Link href="/projects">← Projects</Link>
          </Button>
          <Button variant="primary" onClick={() => setFormBuilderOpen(true)}>
            + Add Form
          </Button>
        </>
      }
    >
      {/* Metric cards */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Card padding="sm" className="rounded-[20px]">
          <p className="text-[12px] font-medium uppercase tracking-[0.06em] text-[var(--text-muted)]">Story Goal</p>
          <p className="mt-1 text-3xl font-bold text-[var(--foreground)]">{project.storyCountTarget ?? "—"}</p>
          <p className="mt-1 text-[12px] text-[var(--text-muted)]">{stories.length} stories created</p>
        </Card>
        <Card padding="sm" className="rounded-[20px]">
          <p className="text-[12px] font-medium uppercase tracking-[0.06em] text-[var(--text-muted)]">Forms</p>
          <p className="mt-1 text-3xl font-bold text-[var(--foreground)]">{forms.length}</p>
          <p className="mt-1 text-[12px] text-[var(--text-muted)]">intake forms active</p>
        </Card>
        <Card padding="sm" className="rounded-[20px]">
          <p className="text-[12px] font-medium uppercase tracking-[0.06em] text-[var(--text-muted)]">Status</p>
          <p className="mt-1">
            <span className={`inline-flex items-center rounded-full border px-3 py-1 text-sm font-semibold uppercase tracking-[0.06em] ${statusBadge(project.status)}`}>
              {project.status}
            </span>
          </p>
        </Card>
        <Card padding="sm" className="rounded-[20px]">
          <p className="text-[12px] font-medium uppercase tracking-[0.06em] text-[var(--text-muted)]">Delivered</p>
          <p className="mt-1 text-3xl font-bold text-[var(--foreground)]">
            {stories.filter((s) => s.currentStage === "delivered").length}
          </p>
          <p className="mt-1 text-[12px] text-[var(--text-muted)]">stories delivered</p>
        </Card>
      </div>

      {/* Tabs */}
      <div className="border-b border-[var(--border)]">
        <div className="flex gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-1.5 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? "border-[var(--foreground)] text-[var(--foreground)]"
                  : "border-transparent text-[var(--text-muted)] hover:text-[var(--foreground)]"
              }`}
            >
              {tab.label}
              {tab.count !== undefined && (
                <span className="rounded-full bg-[var(--surface-muted)] px-1.5 py-0.5 text-[11px] font-semibold">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab: Overview */}
      {activeTab === "overview" && (
        <div className="space-y-4">
          {project.description && (
            <Card padding="sm" className="rounded-[20px]">
              <BodyText muted>{project.description}</BodyText>
            </Card>
          )}
          <div>
            <p className="mb-3 text-sm font-semibold text-[var(--foreground)]">Story Pipeline</p>
            <PipelineBoard stories={pipelineStories} />
          </div>
        </div>
      )}

      {/* Tab: Forms */}
      {activeTab === "forms" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-[var(--foreground)]">{forms.length} form{forms.length !== 1 ? "s" : ""}</p>
            <Button variant="primary" size="sm" onClick={() => setFormBuilderOpen(true)}>
              + Create Form
            </Button>
          </div>

          {forms.length === 0 ? (
            <Card padding="md" className="py-12 text-center">
              <CardTitle>No forms yet</CardTitle>
              <BodyText muted className="mt-2">Create an intake form to start collecting story submissions.</BodyText>
              <div className="mt-5">
                <Button variant="primary" onClick={() => setFormBuilderOpen(true)}>
                  Create Form
                </Button>
              </div>
            </Card>
          ) : (
            <div className="space-y-3">
              {forms.map((form) => (
                <Card key={form.id} padding="sm" className="rounded-[20px]">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <CardTitle className="text-base">{form.title}</CardTitle>
                      <div className="mt-1 flex items-center gap-2">
                        <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.06em] ${typeColors[form.storyType] ?? "bg-gray-100 text-gray-700"}`}>
                          {form.storyType.replace("_", "/")}
                        </span>
                        {form.description && (
                          <BodyText muted className="text-[12px]">{form.description}</BodyText>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          navigator.clipboard.writeText(`${window.location.origin}/forms/${form.publicSlug}`);
                        }}
                      >
                        Copy Link
                      </Button>
                      <Button asChild variant="primary" size="sm">
                        <Link href={`/forms/${form.publicSlug}`} target="_blank">Open</Link>
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        className="text-rose-600 hover:bg-rose-50"
                        onClick={() => handleDeleteForm(form.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab: Content */}
      {activeTab === "content" && (
        <div className="space-y-3">
          <p className="text-sm font-semibold text-[var(--foreground)]">{stories.length} stor{stories.length !== 1 ? "ies" : "y"}</p>

          {stories.length === 0 ? (
            <Card padding="md" className="py-12 text-center">
              <CardTitle>No stories yet</CardTitle>
              <BodyText muted className="mt-2">Stories are created automatically when intake forms are submitted.</BodyText>
            </Card>
          ) : (
            <div className="space-y-3">
              {stories.map((story) => (
                <Card key={story.id} padding="sm" className="rounded-[20px]">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <CardTitle className="text-base">{story.title}</CardTitle>
                      <div className="mt-1 flex items-center gap-2">
                        <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.06em] ${typeColors[story.storyType] ?? "bg-gray-100 text-gray-700"}`}>
                          {story.storyType.replace("_", "/")}
                        </span>
                        {story.subjectName && (
                          <BodyText muted className="text-[12px]">{story.subjectName}</BodyText>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`rounded-full border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.06em] ${stageBadge(story.currentStage)}`}>
                        {story.currentStage.replace(/_/g, " ")}
                      </span>
                      <Button asChild variant="primary" size="sm">
                        <Link href={`/stories/${story.id}`}>Open</Link>
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        className="text-rose-600 hover:bg-rose-50"
                        onClick={() => handleDeleteStory(story.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab: Assets */}
      {activeTab === "assets" && (
        <div className="space-y-3">
          <p className="text-sm font-semibold text-[var(--foreground)]">{assets.length} asset{assets.length !== 1 ? "s" : ""}</p>

          {assets.length === 0 ? (
            <Card padding="md" className="py-12 text-center">
              <CardTitle>No assets yet</CardTitle>
              <BodyText muted className="mt-2">Assets are generated automatically as stories move through the pipeline.</BodyText>
            </Card>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {assets.map((asset) => (
                <Card key={asset.id} padding="sm" className="rounded-[20px]">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--text-muted)]">
                    {asset.assetType.replace(/_/g, " ")}
                  </p>
                  <CardTitle className="mt-1 text-sm">{asset.storyTitle}</CardTitle>
                  <div className="mt-3 flex items-center gap-2">
                    <span className={`rounded-full border px-2 py-0.5 text-[11px] font-semibold ${asset.status === "ready" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-gray-200 bg-gray-50 text-gray-600"}`}>
                      {asset.status}
                    </span>
                    {asset.fileUrl && (
                      <Button asChild variant="secondary" size="sm">
                        <a href={asset.fileUrl} target="_blank" rel="noopener noreferrer">Download</a>
                      </Button>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab: Package */}
      {activeTab === "package" && (
        <div className="space-y-3">
          <p className="text-sm font-semibold text-[var(--foreground)]">{packages.length} package{packages.length !== 1 ? "s" : ""}</p>

          {packages.length === 0 ? (
            <Card padding="md" className="py-12 text-center">
              <CardTitle>No packages yet</CardTitle>
              <BodyText muted className="mt-2">
                Packages are created automatically when story automation finishes and the deliverable bundle is ready.
              </BodyText>
            </Card>
          ) : (
            <div className="space-y-3">
              {packages.map((pkg) => (
                <Card key={pkg.id} padding="sm" className="rounded-[20px]">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <CardTitle className="text-base">{pkg.name}</CardTitle>
                      {pkg.description && (
                        <BodyText muted className="mt-1 text-[12px]">{pkg.description}</BodyText>
                      )}
                      <BodyText muted className="mt-1 text-[12px]">{pkg.downloadCount} downloads</BodyText>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`rounded-full border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.06em] ${pkg.status === "delivered" || pkg.status === "ready" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-indigo-200 bg-indigo-50 text-indigo-700"}`}>
                        {pkg.status}
                      </span>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => navigator.clipboard.writeText(`${window.location.origin}/package/${pkg.id}`)}
                      >
                        Copy Link
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        className="text-rose-600 hover:bg-rose-50"
                        onClick={() => handleDeletePackage(pkg.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      <FormBuilderDialog
        open={formBuilderOpen}
        onOpenChange={setFormBuilderOpen}
        projectId={id}
        onCreated={load}
      />
    </StoriesShell>
  );
}
