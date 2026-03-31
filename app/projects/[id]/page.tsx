"use client";

import { useState, useEffect, useCallback, use } from "react";
import Link from "next/link";
import { AppPill, BodyText, Button, Card, CardTitle } from "@canopy/ui";
import { StoriesShell } from "@/app/_components/stories-shell";
import { PipelineBoard } from "@/app/_components/pipeline-board";
import { FormBuilderDialog } from "@/app/_components/form-builder-dialog";
import { apiFetch } from "@/lib/api-client";
import { pipelineStageLabel } from "@/lib/stories-domain";
import type { FlatProject, FlatForm, FormSubmissionItem } from "@/lib/stories-data";

// ─── Form responses tab ──────────────────────────────────────────────────────

function FormResponsesTab({
  forms,
  onCreateForm,
  onCustomizeForm,
  onDeleteForm,
  typeColors,
}: {
  forms: FlatForm[];
  onCreateForm: () => void;
  onCustomizeForm: (form: FlatForm) => void;
  onDeleteForm: (id: string) => void;
  typeColors: Record<string, string>;
}) {
  const [expandedFormId, setExpandedFormId] = useState<string | null>(null);
  const [responses, setResponses] = useState<Record<string, FormSubmissionItem[]>>({});
  const [loadingId, setLoadingId] = useState<string | null>(null);

  async function toggleResponses(formId: string) {
    if (expandedFormId === formId) {
      setExpandedFormId(null);
      return;
    }
    setExpandedFormId(formId);
    if (responses[formId]) return; // already loaded
    setLoadingId(formId);
    try {
      const res = await apiFetch(`/api/submissions?formId=${formId}`);
      if (res.ok) {
        const data = (await res.json()) as FormSubmissionItem[];
        setResponses((prev) => ({ ...prev, [formId]: data }));
      }
    } finally {
      setLoadingId(null);
    }
  }

  if (forms.length === 0) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-[var(--foreground)]">0 forms</p>
          <Button variant="primary" size="sm" onClick={onCreateForm}>+ Create Form</Button>
        </div>
        <div className="py-12 text-center">
          <CardTitle>No forms yet</CardTitle>
          <BodyText muted className="mt-2">Create an intake form to start collecting story submissions.</BodyText>
          <div className="mt-5">
            <Button variant="primary" onClick={onCreateForm}>Create Form</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-[var(--foreground)]">{forms.length} form{forms.length !== 1 ? "s" : ""}</p>
        <Button variant="primary" size="sm" onClick={onCreateForm}>+ Create Form</Button>
      </div>
      <div className="divide-y divide-[var(--border)]">
        {forms.map((form) => (
          <div key={form.id}>
            <div className="flex flex-wrap items-center justify-between gap-3 py-4">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-medium text-[var(--foreground)]">{form.title}</span>
                  <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.06em] ${typeColors[form.storyType] ?? "bg-gray-100 text-gray-700"}`}>
                    {form.storyType.replace("_", "/")}
                  </span>
                  <span className={`rounded-full border px-2 py-0.5 text-[11px] font-semibold ${form.submissionCount > 0 ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-[var(--border)] bg-[var(--surface-muted)] text-[var(--text-muted)]"}`}>
                    {form.submissionCount} response{form.submissionCount !== 1 ? "s" : ""}
                  </span>
                </div>
                {form.description && (
                  <BodyText muted className="mt-0.5 text-[13px]">{form.description}</BodyText>
                )}
              </div>
              <div className="flex items-center gap-2">
                {form.submissionCount > 0 && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => toggleResponses(form.id)}
                  >
                    {expandedFormId === form.id ? "Hide responses" : "View responses"}
                  </Button>
                )}
                <Button variant="secondary" size="sm" onClick={() => onCustomizeForm(form)}>
                  Customize
                </Button>
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
                  onClick={() => onDeleteForm(form.id)}
                >
                  Delete
                </Button>
              </div>
            </div>

            {/* Inline response list */}
            {expandedFormId === form.id && (
              <div className="mb-4 rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] p-4">
                {loadingId === form.id ? (
                  <BodyText muted className="text-[13px]">Loading responses…</BodyText>
                ) : (responses[form.id] ?? []).length === 0 ? (
                  <BodyText muted className="text-[13px]">No responses found.</BodyText>
                ) : (
                  <div className="divide-y divide-[var(--border)]">
                    {(responses[form.id] ?? []).map((r) => (
                      <div key={r.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                        <div>
                          <span className="text-[14px] font-medium text-[var(--foreground)]">
                            {r.submitterName || "Unnamed respondent"}
                          </span>
                          {r.submitterEmail && (
                            <span className="ml-2 text-[13px] text-[var(--text-muted)]">{r.submitterEmail}</span>
                          )}
                          <div className="mt-0.5 flex items-center gap-2">
                            <span className="text-[12px] text-[var(--text-muted)]">
                              {new Date(r.submittedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                            </span>
                            {r.storyStage && (
                              <span className="rounded-full border border-indigo-200 bg-indigo-50 px-2 py-0.5 text-[11px] font-semibold text-indigo-700">
                                {pipelineStageLabel(r.storyStage)}
                              </span>
                            )}
                          </div>
                        </div>
                        {r.storyId && (
                          <Button asChild variant="secondary" size="sm">
                            <Link href={`/stories/${r.storyId}`}>Open Story</Link>
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

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
  const [editingForm, setEditingForm] = useState<FlatForm | null>(null);

  const load = useCallback(async () => {
    const [projRes, formsRes, storiesRes, pkgsRes, assetsRes] = await Promise.all([
      apiFetch(`/api/projects/${id}`),
      apiFetch(`/api/forms?projectId=${id}`),
      apiFetch(`/api/stories?projectId=${id}`),
      apiFetch(`/api/packages?projectId=${id}`),
      apiFetch(`/api/assets`),
    ]);
    if (projRes.ok) setProject(await projRes.json());
    if (formsRes.ok) setForms(await formsRes.json());
    let fetchedStories: Story[] = [];
    if (storiesRes.ok) {
      fetchedStories = await storiesRes.json();
      setStories(fetchedStories);
    }
    if (pkgsRes.ok) setPackages(await pkgsRes.json());
    if (assetsRes.ok) {
      const all: Asset[] = await assetsRes.json();
      const storyIds = new Set(fetchedStories.map((s) => s.id));
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
    await apiFetch(`/api/forms/${formId}`, { method: "DELETE" });
    await load();
  }

  async function handleDeleteStory(storyId: string) {
    if (!window.confirm("Delete this story? This cannot be undone.")) return;
    await apiFetch(`/api/stories/${storyId}`, { method: "DELETE" });
    await load();
  }

  async function handleDeletePackage(pkgId: string) {
    if (!window.confirm("Delete this package? This cannot be undone.")) return;
    await apiFetch(`/api/packages/${pkgId}`, { method: "DELETE" });
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
            <Card key={i} padding="sm" className="h-28 animate-pulse rounded-[24px] border border-[#dfe7f4] bg-[#f3f6fb]" />
          ))}
        </div>
      </StoriesShell>
    );
  }

  if (!project) {
    return (
      <StoriesShell activeNav="projects" eyebrow="Projects" title="Not found" subtitle="">
        <Card padding="md" className="border border-[#dfe7f4] bg-transparent py-12 text-center shadow-none">
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
      {/* Stat row */}
      {(() => {
        const delivered = stories.filter((s) => s.currentStage === "delivered").length;
        const target = project.storyCountTarget ?? stories.length;
        const pct = target > 0 ? Math.min(100, Math.round((delivered / target) * 100)) : 0;
        return (
          <div className="space-y-4 border-b border-[var(--border)] pb-5">
            <div className="flex flex-wrap gap-x-8 gap-y-4">
              <div>
                <p className="text-[12px] font-medium uppercase tracking-[0.06em] text-[var(--text-muted)]">Story goal</p>
                <p className="mt-1 text-2xl font-bold text-[var(--foreground)]">{project.storyCountTarget ?? "—"}</p>
                <p className="mt-0.5 text-[12px] text-[var(--text-muted)]">{stories.length} created</p>
              </div>
              <div>
                <p className="text-[12px] font-medium uppercase tracking-[0.06em] text-[var(--text-muted)]">Forms</p>
                <p className="mt-1 text-2xl font-bold text-[var(--foreground)]">{forms.length}</p>
                <p className="mt-0.5 text-[12px] text-[var(--text-muted)]">active</p>
              </div>
              <div>
                <p className="text-[12px] font-medium uppercase tracking-[0.06em] text-[var(--text-muted)]">Delivered</p>
                <p className="mt-1 text-2xl font-bold text-[var(--foreground)]">{delivered}</p>
                <p className="mt-0.5 text-[12px] text-[var(--text-muted)]">stories</p>
              </div>
              <div>
                <p className="text-[12px] font-medium uppercase tracking-[0.06em] text-[var(--text-muted)]">Status</p>
                <p className="mt-1">
                  <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-[0.06em] ${statusBadge(project.status)}`}>
                    {project.status}
                  </span>
                </p>
              </div>
            </div>
            {target > 0 && (
              <div className="max-w-sm">
                <div className="mb-1.5 flex items-center justify-between text-[12px]">
                  <span className="font-medium text-[var(--text-muted)]">Delivery progress</span>
                  <span className="font-semibold text-[var(--foreground)]">{delivered} of {target} delivered · {pct}%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--surface-muted)]">
                  <div
                    className="h-full rounded-full bg-[#1e40af] transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        );
      })()}

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
                      <AppPill size="sm" className="px-1.5 py-0.5">
                        {tab.count}
                      </AppPill>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab: Overview */}
      {activeTab === "overview" && (
        <div className="space-y-5">
          <PipelineBoard stories={pipelineStories} />
        </div>
      )}

      {/* Tab: Forms */}
      {activeTab === "forms" && (
        <FormResponsesTab
          forms={forms}
          onCreateForm={() => { setEditingForm(null); setFormBuilderOpen(true); }}
          onCustomizeForm={(form) => { setEditingForm(form); setFormBuilderOpen(true); }}
          onDeleteForm={handleDeleteForm}
          typeColors={typeColors}
        />
      )}

      {/* Tab: Content */}
      {activeTab === "content" && (
        <div className="space-y-3">
          <p className="text-sm font-semibold text-[var(--foreground)]">{stories.length} stor{stories.length !== 1 ? "ies" : "y"}</p>

          {stories.length === 0 ? (
            <div className="py-12 text-center">
              <CardTitle>No stories yet</CardTitle>
              <BodyText muted className="mt-2">Stories are created automatically when intake forms are submitted.</BodyText>
            </div>
          ) : (
            <div className="divide-y divide-[var(--border)]">
              {stories.map((story) => (
                <div key={story.id} className="flex flex-wrap items-center justify-between gap-3 py-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-[var(--foreground)]">{story.title}</span>
                      <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.06em] ${typeColors[story.storyType] ?? "bg-gray-100 text-gray-700"}`}>
                        {story.storyType.replace("_", "/")}
                      </span>
                    </div>
                    {story.subjectName && (
                      <BodyText muted className="mt-0.5 text-[13px]">{story.subjectName}</BodyText>
                    )}
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
            <div className="py-12 text-center">
              <CardTitle>No assets yet</CardTitle>
              <BodyText muted className="mt-2">Assets are generated automatically as stories move through the pipeline.</BodyText>
            </div>
          ) : (
            <div className="divide-y divide-[var(--border)]">
              {assets.map((asset) => (
                <div key={asset.id} className="flex items-center justify-between gap-3 py-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-[var(--foreground)]">{asset.storyTitle}</span>
                      <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--text-muted)]">
                        {asset.assetType}
                      </span>
                    </div>
                    <span className={`mt-0.5 inline-block rounded-full border px-2 py-0.5 text-[11px] font-semibold ${asset.status === "ready" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-gray-200 bg-gray-50 text-gray-600"}`}>
                      {asset.status}
                    </span>
                  </div>
                  {asset.fileUrl && (
                    <Button asChild variant="secondary" size="sm">
                      <a href={asset.fileUrl} target="_blank" rel="noopener noreferrer">Download</a>
                    </Button>
                  )}
                </div>
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
            <div className="py-12 text-center">
              <CardTitle>No packages yet</CardTitle>
              <BodyText muted className="mt-2">
                Packages are created automatically when the content bundle is ready to deliver.
              </BodyText>
            </div>
          ) : (
            <div className="divide-y divide-[var(--border)]">
              {packages.map((pkg) => (
                <div key={pkg.id} className="flex flex-wrap items-center justify-between gap-3 py-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-[var(--foreground)]">{pkg.name}</span>
                      <span className={`rounded-full border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.06em] ${pkg.status === "delivered" || pkg.status === "ready" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-indigo-200 bg-indigo-50 text-indigo-700"}`}>
                        {pkg.status}
                      </span>
                    </div>
                    <BodyText muted className="mt-0.5 text-[13px]">{pkg.downloadCount} downloads</BodyText>
                  </div>
                  <div className="flex items-center gap-2">
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
              ))}
            </div>
          )}
        </div>
      )}

      <FormBuilderDialog
        open={formBuilderOpen}
        onOpenChange={(open) => { setFormBuilderOpen(open); if (!open) setEditingForm(null); }}
        projectId={id}
        onCreated={load}
        editForm={editingForm ?? undefined}
      />
    </StoriesShell>
  );
}
