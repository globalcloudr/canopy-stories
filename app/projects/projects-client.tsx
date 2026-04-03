"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase-client";
import { apiFetch } from "@/lib/api-client";
import { useStoriesWorkspaceId } from "@/lib/workspace-client";
import { buildWorkspaceHref } from "@/lib/workspace-href";
import { referenceIntakeTemplates } from "@/lib/reference-form-templates";
import Link from "next/link";
import {
  BodyText,
  Button,
  Card,
  CardTitle,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  FieldLabel,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
} from "@canopy/ui";
import type { FlatProject } from "@/lib/stories-data";

type Org = { id: string; name: string; slug: string };

const templateTypeColors: Record<string, string> = {
  ESL: "bg-blue-100 text-blue-800",
  HSD_GED: "bg-green-100 text-green-800",
  CTE: "bg-purple-100 text-purple-800",
  EMPLOYER: "bg-orange-100 text-orange-800",
  STAFF: "bg-pink-100 text-pink-800",
  PARTNER: "bg-teal-100 text-teal-800",
  OVERVIEW: "bg-gray-100 text-gray-800",
};

function statusClass(status: string) {
  if (status === "active") return "border-emerald-200 bg-emerald-50 text-emerald-700";
  if (status === "paused") return "border-amber-200 bg-amber-50 text-amber-700";
  if (status === "delivered") return "border-blue-200 bg-blue-50 text-blue-700";
  return "border-indigo-200 bg-indigo-50 text-indigo-700";
}

function formatDeadline(value: string | null) {
  if (!value) return "No deadline";
  return new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function ProjectsClient({ initial }: { initial: FlatProject[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const workspaceSlug = searchParams.get("workspace")?.trim() || null;
  const activeWorkspaceId = useStoriesWorkspaceId();
  const [projects, setProjects] = useState<FlatProject[]>(initial);
  const [orgs, setOrgs] = useState<Org[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Wizard state
  const [wizardProjectId, setWizardProjectId] = useState<string | null>(null);
  const [step2Open, setStep2Open] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [formTitle, setFormTitle] = useState("");
  const [step2Submitting, setStep2Submitting] = useState(false);
  const [step2Error, setStep2Error] = useState<string | null>(null);
  const [step3Open, setStep3Open] = useState(false);
  const [wizardFormSlug, setWizardFormSlug] = useState<string | null>(null);

  const [form, setForm] = useState({
    workspaceId: "",
    name: "",
    description: "",
    storyCountTarget: "",
    deadlineAt: "",
  });

  useEffect(() => {
    setProjects(initial);
  }, [initial]);

  // Load only the user's own orgs for the create dialog
  useEffect(() => {
    async function loadOrgs() {
      try {
        const { data: userData } = await supabase.auth.getUser();
        const user = userData.user;
        if (!user) return;

        const { data: profileData } = await supabase
          .from("profiles")
          .select("is_super_admin,platform_role")
          .eq("user_id", user.id)
          .single() as { data: { is_super_admin?: boolean; platform_role?: string } | null };

        const isOperator =
          profileData?.is_super_admin === true ||
          profileData?.platform_role === "super_admin" ||
          profileData?.platform_role === "platform_staff";

        let loadedOrgs: Org[] = [];
        if (isOperator) {
          const { data } = await supabase.from("organizations").select("id,name,slug").order("name");
          loadedOrgs = (data ?? []) as Org[];
        } else {
          const { data: memberships } = await supabase
            .from("memberships")
            .select("org_id")
            .eq("user_id", user.id) as { data: { org_id: string }[] | null };
          const ids = [...new Set((memberships ?? []).map((m) => m.org_id).filter(Boolean))];
          if (ids.length > 0) {
            const { data } = await supabase.from("organizations").select("id,name,slug").in("id", ids).order("name");
            loadedOrgs = (data ?? []) as Org[];
          }
        }

        setOrgs(loadedOrgs);
        const stored = activeWorkspaceId ?? (() => { try { return window.localStorage.getItem("cs_active_org_id_v1"); } catch { return null; } })();
        const active = (stored && loadedOrgs.find((o) => o.id === stored)) ? stored : loadedOrgs.length === 1 ? loadedOrgs[0].id : "";
        if (active) setForm((f) => ({ ...f, workspaceId: active }));
      } catch { /* silent */ }
    }
    void loadOrgs();
  }, [activeWorkspaceId]);

  useEffect(() => {
    if (activeWorkspaceId) {
      setForm((current) => ({ ...current, workspaceId: activeWorkspaceId }));
    }
  }, [activeWorkspaceId]);

  async function refreshProjects() {
    try {
      const target = activeWorkspaceId
        ? `/api/projects?workspaceId=${encodeURIComponent(activeWorkspaceId)}`
        : "/api/projects";
      const res = await apiFetch(target);
      if (res.ok) setProjects(await res.json());
    } catch {}
  }

  async function handleCreate() {
    if (!form.workspaceId) { setError("Please select a workspace."); return; }
    if (!form.name.trim()) { setError("Project name is required."); return; }
    setSubmitting(true);
    setError(null);
    try {
      const res = await apiFetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workspaceId: form.workspaceId,
          name: form.name.trim(),
          description: form.description.trim() || null,
          storyCountTarget: form.storyCountTarget ? parseInt(form.storyCountTarget) : null,
          deadlineAt: form.deadlineAt || null,
        }),
      });
      const payload = (await res.json()) as { error?: string; id?: string };
      if (!res.ok) throw new Error(payload.error ?? "Failed to create project.");
      setDialogOpen(false);
      setForm((f) => ({ workspaceId: f.workspaceId, name: "", description: "", storyCountTarget: "", deadlineAt: "" }));
      setWizardProjectId(payload.id ?? null);
      setSelectedTemplateId("");
      setFormTitle("");
      setStep2Open(true);
      await refreshProjects();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create project.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(project: FlatProject) {
    if (!window.confirm(`Delete "${project.name}"? This cannot be undone.`)) return;
    try {
      const res = await apiFetch(`/api/projects/${project.id}`, { method: "DELETE" });
      const payload = (await res.json()) as { error?: string };
      if (!res.ok) {
        window.alert(payload.error ?? "Failed to delete project.");
        return;
      }
      await refreshProjects();
      router.refresh();
    } catch {
      window.alert("Failed to delete project.");
    }
  }

  async function handleStep2Submit() {
    if (!selectedTemplateId) { setStep2Error("Please select a template to continue."); return; }
    if (!formTitle.trim()) { setStep2Error("Form title is required."); return; }
    setStep2Submitting(true);
    setStep2Error(null);
    try {
      const template = referenceIntakeTemplates.find((t) => t.id === selectedTemplateId);
      if (!template) throw new Error("Template not found.");
      const res = await apiFetch("/api/forms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: wizardProjectId,
          title: formTitle.trim(),
          description: template.description,
          storyType: template.storyType,
          fields: template.fields,
        }),
      });
      const payload = (await res.json()) as { error?: string; publicSlug?: string };
      if (!res.ok) throw new Error(payload.error ?? "Failed to create form.");
      setWizardFormSlug(payload.publicSlug ?? null);
      setStep2Open(false);
      setStep3Open(true);
    } catch (err) {
      setStep2Error(err instanceof Error ? err.message : "Failed to create form.");
    } finally {
      setStep2Submitting(false);
    }
  }

  const filtered = projects.filter((p) => {
    const matchSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.workspaceName.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || p.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <>
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
            placeholder="Search by school or project name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border-[#dfe7f4] bg-transparent pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-44 border-[#dfe7f4] bg-transparent">
            <SelectValue>
              {statusFilter === "all" ? "All Status" : statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="planning">Planning</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="paused">Paused</SelectItem>
            <SelectItem value="delivered">Delivered</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Project cards */}
      {filtered.length === 0 ? (
        <Card padding="md" className="border border-[#dfe7f4] bg-transparent py-12 text-center shadow-none sm:p-12">
          <CardTitle>
            {search || statusFilter !== "all" ? "No projects match your filters" : "No projects yet"}
          </CardTitle>
          <BodyText muted className="mt-2">
            {search || statusFilter !== "all"
              ? "Try clearing your search or status filter."
              : "Create your first project to start collecting stories."}
          </BodyText>
          {!search && statusFilter === "all" && (
            <div className="mt-5">
              <Button variant="primary" onClick={() => setDialogOpen(true)}>
                Create Project
              </Button>
            </div>
          )}
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((project) => (
            <Card key={project.id} padding="sm" className="flex flex-col rounded-[24px] border border-[#dfe7f4] bg-transparent shadow-none transition hover:border-[#c8d7eb] hover:bg-white/65">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <BodyText muted className="text-[12px]">{project.workspaceName}</BodyText>
                  <CardTitle className="mt-1 text-base leading-snug">{project.name}</CardTitle>
                </div>
                <span
                  className={`shrink-0 rounded-full border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.06em] ${statusClass(project.status)}`}
                >
                  {project.status}
                </span>
              </div>

              {project.description ? (
                <BodyText muted className="mt-1.5 line-clamp-2 text-[13px]">
                  {project.description}
                </BodyText>
              ) : null}

              <div className="mt-3 flex gap-4 text-[13px] text-[var(--text-muted)]">
                {project.storyCountTarget ? <span>{project.storyCountTarget} stories</span> : null}
                <span>{formatDeadline(project.deadlineAt)}</span>
              </div>

              <div className="mt-4 flex items-center gap-2">
                <Button asChild variant="primary" size="sm" className="flex-1">
                  <Link href={buildWorkspaceHref(`/projects/${project.id}`, workspaceSlug)}>Open project</Link>
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleDelete(project)}
                  className="text-rose-600 hover:bg-rose-50"
                >
                  Delete
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create project dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
            <DialogDescription>
              Set up a new success story campaign for a school or program.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-3">
            {orgs.length > 1 && (
              <div className="space-y-2">
                <FieldLabel>Workspace (School / Organization)</FieldLabel>
                <Select value={form.workspaceId} onValueChange={(v) => setForm({ ...form, workspaceId: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a workspace" />
                  </SelectTrigger>
                  <SelectContent>
                    {orgs.map((org) => (
                      <SelectItem key={org.id} value={org.id}>
                        {org.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <FieldLabel>Project Name</FieldLabel>
              <Input
                placeholder="e.g., Spring 2026 Success Stories"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <FieldLabel>Description</FieldLabel>
              <Textarea
                placeholder="Brief description of the campaign goals and story types"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <FieldLabel>Number of Stories</FieldLabel>
                <Input
                  type="number"
                  placeholder="12"
                  value={form.storyCountTarget}
                  onChange={(e) => setForm({ ...form, storyCountTarget: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <FieldLabel>Deadline</FieldLabel>
                <Input
                  type="date"
                  value={form.deadlineAt}
                  onChange={(e) => setForm({ ...form, deadlineAt: e.target.value })}
                />
              </div>
            </div>

            {error && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {error}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="secondary" onClick={() => { setDialogOpen(false); setError(null); }}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleCreate} disabled={submitting}>
              {submitting ? "Creating..." : "Create Project"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Floating create button trigger — used from parent */}
      <button id="open-create-project" className="hidden" onClick={() => setDialogOpen(true)} />

      {/* Step 2 — Choose a template */}
      <Dialog open={step2Open} onOpenChange={(open) => { if (!open) { setStep2Open(false); setStep2Error(null); } }}>
        <DialogContent className="w-[min(92vw,56rem)]">
          <DialogHeader>
            <DialogTitle>
              <span className="text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)]">Step 2 of 3</span>
              <br />
              Choose an intake form template
            </DialogTitle>
            <DialogDescription>
              Pick the template that best fits your story type. All fields are pre-filled — you can customize them later from the project page.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 py-2">
            {/* Template grid */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {referenceIntakeTemplates.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => { setSelectedTemplateId(t.id); setFormTitle(t.name); setStep2Error(null); }}
                  className={`w-full rounded-2xl border p-4 text-left transition ${
                    selectedTemplateId === t.id
                      ? "border-indigo-400 bg-indigo-50 ring-1 ring-indigo-400"
                      : "border-[var(--border)] bg-white hover:border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-semibold text-[var(--foreground)]">{t.name}</span>
                    <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${templateTypeColors[t.storyType] ?? "bg-gray-100 text-gray-700"}`}>
                      {t.storyType.replace("_", "/")}
                    </span>
                  </div>
                  <p className="mt-1.5 text-[13px] text-[var(--text-muted)]">{t.description}</p>
                </button>
              ))}
            </div>

            {/* Form title */}
            {selectedTemplateId && (
              <div className="space-y-2">
                <FieldLabel>Form title</FieldLabel>
                <Input
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g., ESL Student Success Form"
                />
              </div>
            )}

            {step2Error && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {step2Error}
              </div>
            )}
          </div>

          <DialogFooter className="items-center">
            <button
              type="button"
              onClick={() => { setStep2Open(false); setStep2Error(null); }}
              className="text-sm text-[var(--text-muted)] underline-offset-2 hover:underline"
            >
              Skip — I&apos;ll add a form later
            </button>
            <Button variant="primary" onClick={handleStep2Submit} disabled={step2Submitting || !selectedTemplateId}>
              {step2Submitting ? "Creating form..." : "Create Form"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Step 3 — You're all set */}
      <Dialog open={step3Open} onOpenChange={setStep3Open}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              <span className="text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)]">Step 3 of 3</span>
              <br />
              Your project is ready
            </DialogTitle>
            <DialogDescription>
              Here&apos;s your intake form link. Share it with students or subjects — no login required.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 py-2">
            {/* Shareable link */}
            {wizardFormSlug && (
              <div className="space-y-2">
                <FieldLabel>Shareable form link</FieldLabel>
                <div className="flex items-center gap-2">
                  <div className="flex-1 truncate rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-2 text-sm font-mono text-[var(--foreground)]">
                    {typeof window !== "undefined" ? `${window.location.origin}/forms/${wizardFormSlug}` : `/forms/${wizardFormSlug}`}
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => navigator.clipboard.writeText(`${window.location.origin}/forms/${wizardFormSlug}`)}
                  >
                    Copy
                  </Button>
                </div>
              </div>
            )}

            {/* Next steps */}
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] p-4">
              <p className="mb-3 text-sm font-semibold text-[var(--foreground)]">What happens next</p>
              <ol className="space-y-3">
                {[
                  { n: "1", text: "Share the form link with students, staff, or partners — they fill it out with no login required." },
                  { n: "2", text: "When they submit, Canopy Stories automatically generates a blog post, social media content, newsletter feature, and press release." },
                  { n: "3", text: "Review the generated content in your project, then download and share the final package." },
                ].map((step) => (
                  <li key={step.n} className="flex gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700">
                      {step.n}
                    </span>
                    <span className="text-sm text-[var(--text-muted)]">{step.text}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="primary"
              onClick={() => { setStep3Open(false); router.push(`/projects/${wizardProjectId}`); }}
            >
              Go to project
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
