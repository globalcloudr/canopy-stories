"use client"
export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { BodyText, Button, Card, CardTitle } from "@canopy/ui";
import { StoriesShell } from "@/app/_components/stories-shell";
import { ProjectsClient } from "@/app/projects/projects-client";
import { apiFetchArray } from "@/lib/api-client";
import type { FlatProject } from "@/lib/stories-data";

export default function ProjectsPage() {
  const [projects, setProjects] = useState<FlatProject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetchArray<FlatProject>("/api/projects")
      .then((data) => { setProjects(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <StoriesShell
      activeNav="projects"
      eyebrow="Projects"
      title="Projects"
      subtitle="Manage campaigns and track automated story production"
      headerMeta={loading ? undefined : `${projects.length} project${projects.length === 1 ? "" : "s"}`}
      headerActions={
        <Button
          variant="primary"
          type="button"
          onClick={() => {
            document.getElementById("open-create-project")?.click();
          }}
        >
          Create Project
        </Button>
      }
    >
      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} padding="sm" className="h-48 animate-pulse rounded-[24px] border border-[#dfe7f4] bg-[#f3f6fb]" />
          ))}
        </div>
      ) : (
        <ProjectsClient initial={projects} />
      )}
    </StoriesShell>
  );
}
