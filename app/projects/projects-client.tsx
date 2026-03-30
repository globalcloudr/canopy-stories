"use client";

import { useState, useEffect } from "react";
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
  const [projects, setProjects] = useState<FlatProject[]>(initial);
  const [orgs, setOrgs] = useState<Org[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    workspaceId: "",
    name: "",
    description: "",
    storyCountTarget: "",
    deadlineAt: "",
  });

  // Load organizations for the create dialog
  useEffect(() => {
    fetch("/api/organizations")
      .then((r) => r.json())
      .then((data: Org[]) => {
        setOrgs(data);
        // Auto-select: prefer the shell's active org from localStorage, else the only org
        const stored = (() => { try { return window.localStorage.getItem("cs_active_org_id_v1"); } catch { return null; } })();
        const active = (stored && data.find((o) => o.id === stored)) ? stored : data.length === 1 ? data[0].id : "";
        if (active) setForm((f) => ({ ...f, workspaceId: active }));
      })
      .catch(() => {});
  }, []);

  async function refreshProjects() {
    try {
      const res = await fetch("/api/projects");
      if (res.ok) setProjects(await res.json());
    } catch {}
  }

  async function handleCreate() {
    if (!form.workspaceId) { setError("Please select a workspace."); return; }
    if (!form.name.trim()) { setError("Project name is required."); return; }
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/projects", {
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
      setForm({ workspaceId: "", name: "", description: "", storyCountTarget: "", deadlineAt: "" });
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
      const res = await fetch(`/api/projects/${project.id}`, { method: "DELETE" });
      const payload = (await res.json()) as { error?: string };
      if (!res.ok) {
        window.alert(payload.error ?? "Failed to delete project.");
        return;
      }
      await refreshProjects();
    } catch {
      window.alert("Failed to delete project.");
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
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-44">
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
        <Card padding="md" className="py-12 text-center sm:p-12">
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
            <Card key={project.id} padding="sm" className="flex flex-col rounded-[24px]">
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
                  <Link href={`/projects/${project.id}`}>Open project</Link>
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
    </>
  );
}
