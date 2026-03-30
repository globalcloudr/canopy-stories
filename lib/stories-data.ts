import {
  getPublishedFormById as getSamplePublishedFormById,
  getPublishedFormsForWorkspace as getSamplePublishedFormsForWorkspace,
  samplePackages,
  sampleStories,
  sampleSubmissions,
  sampleProjects,
  samplePublishedForms,
  sampleWorkflowSummaries,
  sampleContentArtifacts,
  sampleAssets,
  sampleWorkspaces,
} from "@/lib/stories-domain";
import type { PublishedIntakeForm, StorySubmission, StoryWorkflowSummary } from "@/lib/stories-domain";
import { buildStoryArtifacts } from "@/lib/stories-automation";
import { sendPackageReadyEmail } from "@/lib/stories-email";
import type {
  StoryAssetStatus,
  StoryAssetType,
  StoryAssetRecord,
  StoryContentRecord,
  StoryContentStatus,
  StoryFormField,
  StoryPackageRecord,
  StoryPackageStatus,
  StoryProjectStatus,
  StoryRecord,
  StoryType,
} from "@/lib/stories-schema";
import { getReferenceTemplateById } from "@/lib/reference-form-templates";

type StoriesServiceEnv = {
  supabaseUrl: string;
  serviceRoleKey: string;
};

type StoryFormRow = {
  id: string;
  workspace_id: string;
  project_id: string;
  title: string;
  description: string | null;
  story_type: string;
  fields_json: StoryFormField[];
  public_slug: string;
  is_active: boolean;
};

type StoryProjectRow = {
  id: string;
  workspace_id: string;
  name: string;
  description?: string | null;
  status?: string;
  story_count_target?: number | null;
  deadline_at?: string | null;
  created_at?: string;
  updated_at?: string;
};

type OrganizationRow = {
  id: string;
  name: string | null;
  slug: string | null;
};

type StorySubmissionRow = {
  id: string;
  workspace_id: string;
  project_id: string;
  form_id: string;
  submitter_name: string | null;
  submitter_email: string | null;
  submission_data_json: Record<string, unknown>;
  photo_urls: string[] | null;
  status: StorySubmission["status"];
  submitted_at: string;
};

type StoryRecordRow = {
  id: string;
  workspace_id: string;
  project_id: string;
  submission_id: string | null;
  title: string;
  story_type: StoryRecord["storyType"];
  subject_name: string | null;
  status: StoryRecord["status"];
  current_stage: StoryRecord["currentStage"];
  source_data_json: Record<string, unknown> | null;
  error_message: string | null;
  created_at: string;
  updated_at: string;
};

type StoryContentRow = {
  id: string;
  workspace_id: string;
  story_id: string;
  channel: string;
  content_type: string;
  title: string | null;
  body: string;
  status: string;
  metadata_json: Record<string, unknown> | null;
  generated_at: string;
};

type StoryAssetRow = {
  id: string;
  workspace_id: string;
  story_id: string;
  asset_type: string;
  file_name: string;
  file_url: string;
  platform: string | null;
  dimensions: string | null;
  file_size: number | null;
  status: string;
  metadata_json: Record<string, unknown> | null;
  created_at: string;
};

type StoryPackageRow = {
  id: string;
  workspace_id: string;
  project_id: string;
  story_id: string | null;
  name: string;
  description: string | null;
  status: string;
  package_url: string | null;
  download_count: number;
  shareable_link: string | null;
  expires_at: string | null;
  created_at: string;
};

export type SubmissionListItem = {
  submission: StorySubmission;
  story: StoryRecord | null;
  formTitle: string;
  projectName: string;
  workspaceName: string;
  workspaceSlug: string;
};

export type PublicSubmissionInput = {
  submitterName: string | null;
  submitterEmail: string | null;
  data: Record<string, unknown>;
  photoUrls?: string[];
};

export type ManualStoryCreationInput = {
  projectId: string;
  title: string;
  storyType: StoryType;
  subjectName: string | null;
  background: string;
  details?: string | null;
  photoUrls?: string[];
};

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

export type LiveProjectOption = {
  id: string;
  workspaceId: string;
  name: string;
  source: "live" | "reference";
};

export type ProjectDashboardItem = {
  id: string;
  workspaceId: string;
  workspaceSlug: string;
  workspaceName: string;
  name: string;
  description: string;
  status: StoryProjectStatus;
  updatedAt: string;
  deadlineAt: string | null;
  storyCountTarget: number | null;
  intakeForms: number;
  activeStories: number;
  deliveredStories: number;
  storyTypeMix: StoryType[];
};

export type StoriesOverviewSnapshot = {
  activeProjectCount: number;
  projectCount: number;
  formCount: number;
  submissionCount: number;
  storyCount: number;
  storiesInProductionCount: number;
  deliveredCount: number;
  workspaceCount: number;
  latestProject: ProjectDashboardItem | null;
  latestSubmission: SubmissionListItem | null;
  recentProjects: Array<
    ProjectDashboardItem & {
      formsSubmitted: number;
    }
  >;
  pipelineStories: Array<{
    id: string;
    title: string;
    subject: string;
    type: StoryType;
    stage: StoryRecord["currentStage"];
  }>;
  workflow: StoryWorkflowSummary[];
};

export type StoryLibraryItem = {
  story: StoryRecord;
  excerpt: string;
  contentCount: number;
  hasAssets: boolean;
};

export type AssetLibraryItem = StoryAssetRecord & {
  storyTitle: string;
};

export type ProjectDetailSnapshot = {
  project: ProjectDashboardItem;
  forms: PublishedIntakeForm[];
  submissions: SubmissionListItem[];
  stories: StoryRecord[];
  packages: StoryPackageRecord[];
};

export type StoryDetailSnapshot = {
  story: StoryRecord;
  projectName: string;
  workspaceName: string;
  workspaceSlug: string;
  submission: StorySubmission | null;
  contents: StoryContentRecord[];
  assets: StoryAssetRecord[];
  storyPackage: StoryPackageRecord | null;
};

export type PackageDetailSnapshot = {
  storyPackage: StoryPackageRecord;
  story: StoryRecord | null;
  projectName: string;
  workspaceName: string;
  contents: StoryContentRecord[];
  assets: StoryAssetRecord[];
};

function getStoriesServiceEnv(): StoriesServiceEnv | null {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return null;
  }

  return { supabaseUrl, serviceRoleKey };
}

function isStoriesPersistenceEnabled() {
  return !!getStoriesServiceEnv();
}

async function requestJson<T>(
  path: string,
  searchParams?: URLSearchParams,
  init?: { method?: "GET" | "POST" | "PATCH" | "DELETE"; body?: unknown; prefer?: string }
): Promise<T> {
  const env = getStoriesServiceEnv();
  if (!env) {
    throw new Error("Missing Stories Supabase environment variables.");
  }

  const url = new URL(path, env.supabaseUrl);
  if (searchParams) {
    url.search = searchParams.toString();
  }

  const response = await fetch(url.toString(), {
    method: init?.method ?? "GET",
    headers: {
      apikey: env.serviceRoleKey,
      Authorization: `Bearer ${env.serviceRoleKey}`,
      "Content-Type": "application/json",
      ...(init?.prefer ? { Prefer: init.prefer } : {}),
    },
    cache: "no-store",
    body: init?.body ? JSON.stringify(init.body) : undefined,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Stories Supabase request failed (${response.status}): ${text}`);
  }

  if (response.status === 204 || response.headers.get("content-length") === "0") {
    return undefined as T;
  }

  return (await response.json()) as T;
}

async function requestJsonOrEmpty<T>(path: string, searchParams?: URLSearchParams) {
  try {
    return await requestJson<T>(path, searchParams);
  } catch (error) {
    if (
      error instanceof Error &&
      (error.message.includes("42P01") || error.message.includes("PGRST205"))
    ) {
      return [] as unknown as T;
    }
    throw error;
  }
}

async function getProjectsByIds(projectIds: string[]) {
  if (projectIds.length === 0) {
    return [];
  }

  return requestJson<StoryProjectRow[]>(
    "/rest/v1/story_projects",
    new URLSearchParams({
      select: "id,workspace_id,name,description,status,story_count_target,deadline_at,created_at,updated_at",
      id: `in.(${projectIds.join(",")})`,
    })
  );
}

async function getOrganizationsByIds(ids: string[]) {
  if (ids.length === 0) {
    return [];
  }

  return requestJson<OrganizationRow[]>(
    "/rest/v1/organizations",
    new URLSearchParams({
      select: "id,name,slug",
      id: `in.(${ids.join(",")})`,
    })
  );
}

async function getOrganizationsBySlugs(slugs: string[]) {
  if (slugs.length === 0) {
    return [];
  }

  return requestJson<OrganizationRow[]>(
    "/rest/v1/organizations",
    new URLSearchParams({
      select: "id,name,slug",
      slug: `in.(${slugs.join(",")})`,
    })
  );
}

async function getSubmissionCountsByForm(formIds: string[]) {
  if (formIds.length === 0) {
    return [];
  }

  return requestJson<Array<{ form_id: string }>>(
    "/rest/v1/story_submissions",
    new URLSearchParams({
      select: "form_id",
      form_id: `in.(${formIds.join(",")})`,
    })
  );
}

function toPublishedForm(
  form: StoryFormRow,
  projectMap: Map<string, StoryProjectRow>,
  workspaceMap: Map<string, OrganizationRow>,
  submissionCount: number
): PublishedIntakeForm {
  const workspace = workspaceMap.get(form.workspace_id);

  return {
    id: form.id,
    projectId: form.project_id,
    workspaceId: form.workspace_id,
    title: form.title,
    description: form.description ?? "",
    storyType: form.story_type as PublishedIntakeForm["storyType"],
    workspaceSlug: workspace?.slug ?? "workspace",
    workspaceName: workspace?.name ?? "Workspace",
    submissionCount,
    shareablePath: `/forms/${form.public_slug}`,
    templateId: form.id,
    fields: form.fields_json ?? [],
  };
}

function createEmptyWorkflowSummary() {
  return new Map<StoryWorkflowSummary["stage"], number>([
    ["form_sent", 0],
    ["submitted", 0],
    ["ai_processing", 0],
    ["asset_generation", 0],
    ["packaging", 0],
    ["delivered", 0],
  ]);
}

function toProjectStatus(value: string | undefined | null): StoryProjectStatus {
  if (value === "active" || value === "paused" || value === "delivered") {
    return value;
  }

  return "planning";
}

function toStoryRecord(row: StoryRecordRow): StoryRecord {
  return {
    id: row.id,
    workspaceId: row.workspace_id,
    projectId: row.project_id,
    submissionId: row.submission_id,
    title: row.title,
    storyType: row.story_type,
    subjectName: row.subject_name,
    status: row.status,
    currentStage: row.current_stage,
    sourceData: row.source_data_json,
    errorMessage: row.error_message,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function toStoryContentRecord(row: StoryContentRow): StoryContentRecord {
  return {
    id: row.id,
    workspaceId: row.workspace_id,
    storyId: row.story_id,
    channel: row.channel as StoryContentRecord["channel"],
    contentType: row.content_type as StoryContentRecord["contentType"],
    title: row.title,
    body: row.body,
    status: row.status as StoryContentStatus,
    metadata: row.metadata_json,
    generatedAt: row.generated_at,
  };
}

function toStoryAssetRecord(row: StoryAssetRow): StoryAssetRecord {
  return {
    id: row.id,
    workspaceId: row.workspace_id,
    storyId: row.story_id,
    assetType: row.asset_type as StoryAssetType,
    fileName: row.file_name,
    fileUrl: row.file_url,
    platform: row.platform,
    dimensions: row.dimensions,
    fileSize: row.file_size,
    status: row.status as StoryAssetStatus,
    metadata: row.metadata_json,
    createdAt: row.created_at,
  };
}

function toStoryPackageRecord(row: StoryPackageRow): StoryPackageRecord {
  return {
    id: row.id,
    workspaceId: row.workspace_id,
    projectId: row.project_id,
    storyId: row.story_id,
    name: row.name,
    description: row.description,
    status: row.status as StoryPackageStatus,
    packageUrl: row.package_url,
    downloadCount: row.download_count,
    shareableLink: row.shareable_link,
    expiresAt: row.expires_at,
    createdAt: row.created_at,
  };
}

async function patchStoryRecord(storyId: string, body: Record<string, unknown>) {
  return requestJson<StoryRecordRow[]>(`/rest/v1/story_records?id=eq.${storyId}&select=*`, undefined, {
    method: "PATCH",
    prefer: "return=representation",
    body,
  });
}

async function patchSubmissionRecord(submissionId: string, body: Record<string, unknown>) {
  return requestJson<StorySubmissionRow[]>(`/rest/v1/story_submissions?id=eq.${submissionId}&select=*`, undefined, {
    method: "PATCH",
    prefer: "return=representation",
    body,
  });
}

async function runStoryAutomation(story: StoryRecord) {
  await patchStoryRecord(story.id, {
    status: "ai_processing",
    current_stage: "ai_processing",
    updated_at: new Date().toISOString(),
    error_message: null,
  });

  try {
    const artifacts = await buildStoryArtifacts({
      workspaceId: story.workspaceId,
      projectId: story.projectId,
      storyId: story.id,
      title: story.title,
      storyType: story.storyType,
      subjectName: story.subjectName,
      sourceData: story.sourceData,
    });

    if (artifacts.contents.length > 0) {
      await requestJson<StoryContentRow[]>("/rest/v1/story_content?select=*", undefined, {
        method: "POST",
        prefer: "return=representation",
        body: artifacts.contents.map((content) => ({
          workspace_id: content.workspaceId,
          story_id: content.storyId,
          channel: content.channel,
          content_type: content.contentType,
          title: content.title,
          body: content.body,
          status: content.status,
          metadata_json: content.metadata,
        })),
      });
    }

    await patchStoryRecord(story.id, {
      status: "asset_generation",
      current_stage: "asset_generation",
      updated_at: new Date().toISOString(),
    });

    if (artifacts.assets.length > 0) {
      await requestJson<StoryAssetRow[]>("/rest/v1/story_assets?select=*", undefined, {
        method: "POST",
        prefer: "return=representation",
        body: artifacts.assets.map((asset) => ({
          workspace_id: asset.workspaceId,
          story_id: asset.storyId,
          asset_type: asset.assetType,
          file_name: asset.fileName,
          file_url: asset.fileUrl,
          platform: asset.platform,
          dimensions: asset.dimensions,
          file_size: asset.fileSize,
          status: asset.status,
          metadata_json: asset.metadata,
        })),
      });
    }

    await requestJson<StoryPackageRow[]>("/rest/v1/story_packages?select=*", undefined, {
      method: "POST",
      prefer: "return=representation",
      body: {
        workspace_id: artifacts.storyPackage.workspaceId,
        project_id: artifacts.storyPackage.projectId,
        story_id: artifacts.storyPackage.storyId,
        name: artifacts.storyPackage.name,
        description: artifacts.storyPackage.description,
        status: artifacts.storyPackage.status,
        package_url: artifacts.storyPackage.packageUrl,
        download_count: artifacts.storyPackage.downloadCount,
        shareable_link: artifacts.storyPackage.shareableLink,
        expires_at: artifacts.storyPackage.expiresAt,
      },
    });

    await patchStoryRecord(story.id, {
      status: "delivered",
      current_stage: "delivered",
      updated_at: new Date().toISOString(),
      error_message: null,
    });

    if (story.submissionId) {
      await patchSubmissionRecord(story.submissionId, {
        status: "reviewed",
      });
    }

    // Send package-ready email if workspace has a notification address configured
    try {
      const keys = await getWorkspaceApiKeys(story.workspaceId);
      if (keys?.notificationEmail) {
        const workspaces = await getOrganizationsByIds([story.workspaceId]);
        await sendPackageReadyEmail({
          to: keys.notificationEmail,
          subjectName: story.subjectName,
          storyTitle: story.title,
          storyId: story.id,
          workspaceName: workspaces[0]?.name ?? "your workspace",
        });
      }
    } catch {
      // Email failure is non-fatal
    }
  } catch (error) {
    await patchStoryRecord(story.id, {
      status: "blocked",
      current_stage: "submitted",
      updated_at: new Date().toISOString(),
      error_message: error instanceof Error ? error.message : "Automation failed.",
    });
    // Automation failure is non-fatal — submission already saved successfully
  }
}

export async function listProjectDashboard() {
  if (!isStoriesPersistenceEnabled()) {
    return {
      projects: sampleProjects.map((project) => ({
        id: project.id,
        workspaceId: project.workspaceId,
        workspaceSlug: project.workspaceSlug,
        workspaceName: project.workspaceName,
        name: project.name,
        description: project.description ?? "",
        status: project.status,
        updatedAt: project.updatedAt,
        deadlineAt: project.deadlineAt,
        storyCountTarget: project.storyCountTarget,
        intakeForms: samplePublishedForms.filter((form) => form.projectId === project.id).length,
        activeStories: project.activeStories,
        deliveredStories: project.deliveredPackages,
        storyTypeMix: project.storyTypeMix,
      })),
      workflow: sampleWorkflowSummaries,
    };
  }

  const projects = await requestJson<StoryProjectRow[]>(
    "/rest/v1/story_projects",
    new URLSearchParams({
      select: "id,workspace_id,name,description,status,story_count_target,deadline_at,created_at,updated_at",
      order: "updated_at.desc",
    })
  );

  if (projects.length === 0) {
    return {
      projects: [] as ProjectDashboardItem[],
      workflow: sampleWorkflowSummaries.map((summary) => ({ ...summary, count: 0 })),
    };
  }

  const projectIds = [...new Set(projects.map((project) => project.id))];
  const workspaceIds = [...new Set(projects.map((project) => project.workspace_id))];

  const [forms, stories, workspaces] = await Promise.all([
    requestJson<StoryFormRow[]>(
      "/rest/v1/story_forms",
      new URLSearchParams({
        select: "id,workspace_id,project_id,title,description,story_type,fields_json,public_slug,is_active",
        project_id: `in.(${projectIds.join(",")})`,
      })
    ),
    requestJson<StoryRecordRow[]>(
      "/rest/v1/story_records",
      new URLSearchParams({
        select: "id,workspace_id,project_id,submission_id,title,story_type,subject_name,status,current_stage,source_data_json,error_message,created_at,updated_at",
        project_id: `in.(${projectIds.join(",")})`,
      })
    ),
    getOrganizationsByIds(workspaceIds),
  ]);

  const formsByProjectId = new Map<string, StoryFormRow[]>();
  const storiesByProjectId = new Map<string, StoryRecordRow[]>();
  const workflowCounts = createEmptyWorkflowSummary();

  for (const form of forms) {
    formsByProjectId.set(form.project_id, [...(formsByProjectId.get(form.project_id) ?? []), form]);
  }

  for (const story of stories) {
    storiesByProjectId.set(story.project_id, [...(storiesByProjectId.get(story.project_id) ?? []), story]);
    workflowCounts.set(story.current_stage, (workflowCounts.get(story.current_stage) ?? 0) + 1);
  }

  const workspaceMap = new Map(workspaces.map((workspace) => [workspace.id, workspace]));

  return {
    projects: projects.map<ProjectDashboardItem>((project) => {
      const projectForms = formsByProjectId.get(project.id) ?? [];
      const projectStories = storiesByProjectId.get(project.id) ?? [];
      const workspace = workspaceMap.get(project.workspace_id);
      const storyTypeMix = [...new Set(projectForms.map((form) => form.story_type as StoryType))];
      const deliveredStories = projectStories.filter((story) => story.current_stage === "delivered").length;
      const activeStories = projectStories.filter((story) => story.current_stage !== "delivered").length;

      return {
        id: project.id,
        workspaceId: project.workspace_id,
        workspaceSlug: workspace?.slug ?? "workspace",
        workspaceName: workspace?.name ?? "Workspace",
        name: project.name,
        description: project.description ?? "",
        status: toProjectStatus(project.status),
        updatedAt: project.updated_at ?? project.created_at ?? new Date().toISOString(),
        deadlineAt: project.deadline_at ?? null,
        storyCountTarget: project.story_count_target ?? null,
        intakeForms: projectForms.length,
        activeStories,
        deliveredStories,
        storyTypeMix,
      };
    }),
    workflow: sampleWorkflowSummaries.map((summary) => ({
      ...summary,
      count: workflowCounts.get(summary.stage) ?? 0,
    })),
  };
}

export async function getStoriesOverviewSnapshot(): Promise<StoriesOverviewSnapshot> {
  const [{ projects, workflow }, submissions, forms] = await Promise.all([
    listProjectDashboard(),
    listSubmissionItems(),
    listPublishedForms(),
  ]);

  const storyCount = workflow.reduce((sum, item) => sum + item.count, 0);
  const deliveredCount = workflow.find((item) => item.stage === "delivered")?.count ?? 0;
  const workspaceCount = new Set(projects.map((project) => project.workspaceId)).size;
  const activeProjectCount = projects.filter((project) => project.status === "active").length;
  const storiesInProductionCount =
    (workflow.find((item) => item.stage === "ai_processing")?.count ?? 0) +
    (workflow.find((item) => item.stage === "asset_generation")?.count ?? 0) +
    (workflow.find((item) => item.stage === "packaging")?.count ?? 0);

  const formsSubmittedByProjectId = new Map<string, number>();
  const seenStoryIds = new Set<string>();
  const pipelineStories: StoriesOverviewSnapshot["pipelineStories"] = [];

  for (const item of submissions) {
    formsSubmittedByProjectId.set(
      item.submission.projectId,
      (formsSubmittedByProjectId.get(item.submission.projectId) ?? 0) + 1
    );

    if (item.story && !seenStoryIds.has(item.story.id)) {
      seenStoryIds.add(item.story.id);
      pipelineStories.push({
        id: item.story.id,
        title: item.story.title,
        subject: item.story.subjectName || item.submission.submitterName || "Unknown",
        type: item.story.storyType,
        stage: item.story.currentStage,
      });
    }
  }

  return {
    activeProjectCount,
    projectCount: projects.length,
    formCount: forms.length,
    submissionCount: submissions.length,
    storyCount,
    storiesInProductionCount,
    deliveredCount,
    workspaceCount,
    latestProject: projects[0] ?? null,
    latestSubmission: submissions[0] ?? null,
    recentProjects: projects.slice(0, 3).map((project) => ({
      ...project,
      formsSubmitted: formsSubmittedByProjectId.get(project.id) ?? 0,
    })),
    pipelineStories: pipelineStories.slice(0, 8),
    workflow,
  };
}

export async function getProjectDetailSnapshot(projectId: string): Promise<ProjectDetailSnapshot | null> {
  const [{ projects }, forms, submissions, packages] = await Promise.all([
    listProjectDashboard(),
    listPublishedForms(),
    listSubmissionItems(),
    isStoriesPersistenceEnabled()
      ? requestJsonOrEmpty<StoryPackageRow[]>(
          "/rest/v1/story_packages",
          new URLSearchParams({
            select:
              "id,workspace_id,project_id,story_id,name,description,status,package_url,download_count,shareable_link,expires_at,created_at",
            project_id: `eq.${projectId}`,
            order: "created_at.desc",
          })
        )
      : Promise.resolve(samplePackages.filter((item) => item.projectId === projectId)),
  ]);

  const project = projects.find((item) => item.id === projectId) ?? null;

  if (!project) {
    return null;
  }

  const projectForms = forms.filter((form) => form.projectId === projectId);
  const projectSubmissions = submissions.filter((item) => item.submission.projectId === projectId);
  const stories = projectSubmissions
    .map((item) => item.story)
    .filter((story): story is StoryRecord => story !== null);

  return {
    project,
    forms: projectForms,
    submissions: projectSubmissions,
    stories,
    packages: isStoriesPersistenceEnabled()
      ? (packages as StoryPackageRow[]).map(toStoryPackageRecord)
      : (packages as StoryPackageRecord[]),
  };
}

export async function listPublishedForms(workspaceSlug?: string | null) {
  if (!isStoriesPersistenceEnabled()) {
    return getSamplePublishedFormsForWorkspace(workspaceSlug);
  }

  let workspaceIdFilter: string | null = null;

  if (workspaceSlug) {
    const organizations = await requestJson<OrganizationRow[]>(
      "/rest/v1/organizations",
      new URLSearchParams({
        select: "id,name,slug",
        slug: `eq.${workspaceSlug}`,
        limit: "1",
      })
    );
    workspaceIdFilter = organizations[0]?.id ?? null;

    if (!workspaceIdFilter) {
      return [];
    }
  }

  const forms = await requestJson<StoryFormRow[]>(
    "/rest/v1/story_forms",
    new URLSearchParams({
      select: "id,workspace_id,project_id,title,description,story_type,fields_json,public_slug,is_active",
      is_active: "eq.true",
      ...(workspaceIdFilter ? { workspace_id: `eq.${workspaceIdFilter}` } : {}),
      order: "created_at.desc",
    })
  );

  if (forms.length === 0) {
    return [];
  }

  const [projects, organizations, submissionRefs] = await Promise.all([
    getProjectsByIds([...new Set(forms.map((form) => form.project_id))]),
    getOrganizationsByIds([...new Set(forms.map((form) => form.workspace_id))]),
    getSubmissionCountsByForm(forms.map((form) => form.id)),
  ]);

  const projectMap = new Map(projects.map((project) => [project.id, project]));
  const workspaceMap = new Map(organizations.map((workspace) => [workspace.id, workspace]));
  const countsByFormId = new Map<string, number>();

  for (const row of submissionRefs) {
    countsByFormId.set(row.form_id, (countsByFormId.get(row.form_id) ?? 0) + 1);
  }

  return forms.map((form) =>
    toPublishedForm(form, projectMap, workspaceMap, countsByFormId.get(form.id) ?? 0)
  );
}

export async function listLiveProjectOptions() {
  if (!isStoriesPersistenceEnabled()) {
    return sampleProjects.map((row) => ({
      id: `sample:${row.id}`,
      workspaceId: row.workspaceId,
      name: row.name,
      source: "reference" as const,
    }));
  }

  const [rows, workspaces] = await Promise.all([
    requestJson<StoryProjectRow[]>(
      "/rest/v1/story_projects",
      new URLSearchParams({
        select: "id,workspace_id,name,updated_at",
        order: "updated_at.desc",
      })
    ),
    getOrganizationsBySlugs([...new Set(sampleProjects.map((project) => project.workspaceSlug))]),
  ]);

  const liveOptions = rows.map((row) => ({
    id: row.id,
    workspaceId: row.workspace_id,
    name: row.name,
    source: "live" as const,
  }));

  const existingKeys = new Set(liveOptions.map((row) => row.name));
  const workspaceBySlug = new Map(workspaces.map((workspace) => [workspace.slug ?? "", workspace]));

  const referenceOptions = sampleProjects
    .filter((project) => !existingKeys.has(project.name))
    .filter((project) => workspaceBySlug.has(project.workspaceSlug))
    .map((project) => ({
      id: `sample:${project.id}`,
      workspaceId: workspaceBySlug.get(project.workspaceSlug)?.id ?? "",
      name: `${project.name} (Reference)`,
      source: "reference" as const,
    }));

  return [...liveOptions, ...referenceOptions];
}

async function ensureLiveProject(projectId: string) {
  if (!isStoriesPersistenceEnabled()) {
    throw new Error("Stories persistence is not configured yet.");
  }

  if (!projectId.startsWith("sample:")) {
    const rows = await requestJson<StoryProjectRow[]>(
      "/rest/v1/story_projects",
      new URLSearchParams({
        select: "id,workspace_id,name",
        id: `eq.${projectId}`,
        limit: "1",
      })
    );

    return rows[0] ?? null;
  }

  const sampleId = projectId.replace(/^sample:/, "");
  const sampleProject = sampleProjects.find((project) => project.id === sampleId);

  if (!sampleProject) {
    throw new Error("Reference project not found.");
  }

  const organizations = await getOrganizationsBySlugs([sampleProject.workspaceSlug]);
  const workspace = organizations[0];

  if (!workspace) {
    throw new Error(`Workspace slug '${sampleProject.workspaceSlug}' was not found in organizations.`);
  }

  const existingRows = await requestJson<StoryProjectRow[]>(
    "/rest/v1/story_projects",
    new URLSearchParams({
      select: "id,workspace_id,name,description,status,story_count_target,deadline_at,created_at,updated_at",
      workspace_id: `eq.${workspace.id}`,
      name: `eq.${sampleProject.name}`,
      limit: "1",
    })
  );

  if (existingRows[0]) {
    return existingRows[0];
  }

  const createdRows = await requestJson<StoryProjectRow[]>(
    "/rest/v1/story_projects?select=*",
    undefined,
    {
      method: "POST",
      prefer: "return=representation",
      body: {
        workspace_id: workspace.id,
        name: sampleProject.name,
        description: sampleProject.description,
        status: sampleProject.status,
        story_count_target: sampleProject.storyCountTarget,
        deadline_at: sampleProject.deadlineAt,
      },
    }
  );

  return createdRows[0] ?? null;
}

export async function getPublishedFormById(formId: string) {
  if (!isStoriesPersistenceEnabled()) {
    return getSamplePublishedFormById(formId);
  }

  const baseLookupParams = {
    select: "id,workspace_id,project_id,title,description,story_type,fields_json,public_slug,is_active",
    is_active: "eq.true",
    limit: "1",
  };

  let form: StoryFormRow | null = null;

  if (!isUuid(formId)) {
    const slugRows = await requestJson<StoryFormRow[]>(
      "/rest/v1/story_forms",
      new URLSearchParams({
        ...baseLookupParams,
        public_slug: `eq.${formId}`,
      })
    );

    form = slugRows[0] ?? null;
  }

  if (!form && isUuid(formId)) {
    const idRows = await requestJson<StoryFormRow[]>(
      "/rest/v1/story_forms",
      new URLSearchParams({
        ...baseLookupParams,
        id: `eq.${formId}`,
      })
    );

    form = idRows[0] ?? null;
  }

  if (!form) {
    return null;
  }

  const [projects, workspaces, submissionRefs] = await Promise.all([
    getProjectsByIds([form.project_id]),
    getOrganizationsByIds([form.workspace_id]),
    getSubmissionCountsByForm([form.id]),
  ]);

  const count = submissionRefs.filter((row) => row.form_id === form.id).length;

  return toPublishedForm(
    form,
    new Map(projects.map((project) => [project.id, project])),
    new Map(workspaces.map((workspace) => [workspace.id, workspace])),
    count
  );
}

function validateSubmissionFields(form: PublishedIntakeForm, payload: PublicSubmissionInput) {
  const missingFields = form.fields.filter((field) => {
    if (!field.required) {
      return false;
    }

    const rawValue = payload.data[field.id];
    if (typeof rawValue === "string") {
      return rawValue.trim().length === 0;
    }

    return rawValue === null || rawValue === undefined;
  });

  return missingFields;
}

export async function createSubmissionFromPublicForm(formId: string, payload: PublicSubmissionInput) {
  const form = await getPublishedFormById(formId);

  if (!form) {
    throw new Error("Form not found.");
  }

  const missingFields = validateSubmissionFields(form, payload);
  if (missingFields.length > 0) {
    throw new Error(`Missing required fields: ${missingFields.map((field) => field.label).join(", ")}`);
  }

  const storySourceData = {
    ...payload.data,
    photoUrls: payload.photoUrls ?? [],
    submitterName: payload.submitterName,
    submitterEmail: payload.submitterEmail,
  };

  if (!isStoriesPersistenceEnabled()) {
    const storyId = `story_preview_${Date.now()}`;
    const submissionId = `submission_preview_${Date.now()}`;

    return {
      submission: {
        id: submissionId,
        workspaceId: form.workspaceId,
        projectId: form.projectId,
        formId: form.id,
        submitterName: payload.submitterName,
        submitterEmail: payload.submitterEmail,
        data: payload.data,
        photoUrls: payload.photoUrls ?? [],
        status: "submitted" as const,
        submittedAt: new Date().toISOString(),
      },
      story: {
        id: storyId,
        workspaceId: form.workspaceId,
        projectId: form.projectId,
        submissionId,
        title: `${form.title} submission`,
        storyType: form.storyType,
        subjectName: payload.submitterName,
        status: "submitted" as const,
        currentStage: "submitted" as const,
        sourceData: storySourceData,
        errorMessage: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    };
  }

  const submissionRows = await requestJson<StorySubmissionRow[]>(
    "/rest/v1/story_submissions?select=*",
    undefined,
    {
      method: "POST",
      prefer: "return=representation",
      body: {
        workspace_id: form.workspaceId,
        project_id: form.projectId,
        form_id: form.id,
        submitter_name: payload.submitterName,
        submitter_email: payload.submitterEmail,
        submission_data_json: payload.data,
        photo_urls: payload.photoUrls ?? [],
        status: "submitted",
      },
    }
  );

  const submission = submissionRows[0];
  if (!submission) {
    throw new Error("Submission could not be created.");
  }

  const storyRows = await requestJson<StoryRecordRow[]>(
    "/rest/v1/story_records?select=*",
    undefined,
    {
      method: "POST",
      prefer: "return=representation",
      body: {
        workspace_id: form.workspaceId,
        project_id: form.projectId,
        submission_id: submission.id,
        title: `${form.title} submission`,
        story_type: form.storyType,
        subject_name: payload.submitterName,
        status: "submitted",
        current_stage: "submitted",
        source_data_json: storySourceData,
      },
    }
  );

  const story = storyRows[0];

  if (!story) {
    throw new Error("Story record could not be created.");
  }

  const storyRecord = toStoryRecord(story);

  await runStoryAutomation(storyRecord);

  await requestJson<StoryProjectRow[]>(
    "/rest/v1/story_projects?id=eq." + form.projectId,
    undefined,
    {
      method: "PATCH",
      prefer: "return=representation",
      body: {
        updated_at: new Date().toISOString(),
      },
    }
  );

  return {
    submission: {
      id: submission.id,
      workspaceId: submission.workspace_id,
      projectId: submission.project_id,
      formId: submission.form_id,
      submitterName: submission.submitter_name,
      submitterEmail: submission.submitter_email,
      data: submission.submission_data_json,
      photoUrls: submission.photo_urls ?? [],
      status: submission.status,
      submittedAt: submission.submitted_at,
    },
      story: {
        ...storyRecord,
      },
    };
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

export async function createFormFromReferenceTemplate(projectId: string, templateId: string) {
  const template = getReferenceTemplateById(templateId);

  if (!template) {
    throw new Error("Template not found.");
  }

  if (!isStoriesPersistenceEnabled()) {
    throw new Error("Stories persistence is not configured yet.");
  }

  const project = await ensureLiveProject(projectId);
  if (!project) {
    throw new Error("Project not found.");
  }

  const baseSlug = slugify(`${project.name}-${template.name}`);
  const publicSlug = `${baseSlug}-${Date.now().toString().slice(-6)}`;

  const createdRows = await requestJson<StoryFormRow[]>(
    "/rest/v1/story_forms?select=*",
    undefined,
    {
      method: "POST",
      prefer: "return=representation",
      body: {
        workspace_id: project.workspace_id,
        project_id: project.id,
        title: template.name,
        description: template.description,
        story_type: template.storyType,
        fields_json: template.fields,
        public_slug: publicSlug,
        is_active: true,
      },
    }
  );

  const created = createdRows[0];
  if (!created) {
    throw new Error("Form could not be created.");
  }

  return created;
}

export async function createStoryManually(input: ManualStoryCreationInput) {
  if (!isStoriesPersistenceEnabled()) {
    throw new Error("Stories persistence is not configured yet.");
  }

  const project = await ensureLiveProject(input.projectId);
  if (!project) {
    throw new Error("Project not found.");
  }

  const storySourceData = {
    background: input.background,
    details: input.details?.trim() || null,
    photoUrls: input.photoUrls ?? [],
  };

  const storyRows = await requestJson<StoryRecordRow[]>(
    "/rest/v1/story_records?select=*",
    undefined,
    {
      method: "POST",
      prefer: "return=representation",
      body: {
        workspace_id: project.workspace_id,
        project_id: project.id,
        submission_id: null,
        title: input.title.trim(),
        story_type: input.storyType,
        subject_name: input.subjectName?.trim() || null,
        status: "submitted",
        current_stage: "submitted",
        source_data_json: storySourceData,
      },
    }
  );

  const story = storyRows[0];
  if (!story) {
    throw new Error("Story could not be created.");
  }

  const storyRecord = toStoryRecord(story);
  await runStoryAutomation(storyRecord);

  await requestJson<StoryProjectRow[]>(
    "/rest/v1/story_projects?id=eq." + project.id,
    undefined,
    {
      method: "PATCH",
      prefer: "return=representation",
      body: {
        updated_at: new Date().toISOString(),
      },
    }
  );

  return storyRecord;
}

export async function listSubmissionItems() {
  if (!isStoriesPersistenceEnabled()) {
    return sampleSubmissions.map((submission) => {
      const story = sampleStories.find((item) => item.submissionId === submission.id) ?? null;
      const project = sampleProjects.find((item) => item.id === submission.projectId);
      const form = getSamplePublishedFormById(submission.formId);

      return {
        submission,
        story,
        formTitle: form?.title ?? "Form",
        projectName: project?.name ?? "Project",
        workspaceName: project?.workspaceName ?? "Workspace",
        workspaceSlug: project?.workspaceSlug ?? "workspace",
      };
    });
  }

  const [submissions, stories] = await Promise.all([
    requestJson<StorySubmissionRow[]>(
      "/rest/v1/story_submissions",
      new URLSearchParams({
        select: "id,workspace_id,project_id,form_id,submitter_name,submitter_email,submission_data_json,photo_urls,status,submitted_at",
        order: "submitted_at.desc",
      })
    ),
    requestJson<StoryRecordRow[]>(
      "/rest/v1/story_records",
      new URLSearchParams({
        select: "id,workspace_id,project_id,submission_id,title,story_type,subject_name,status,current_stage,source_data_json,error_message,created_at,updated_at",
        order: "created_at.desc",
      })
    ),
  ]);

  if (submissions.length === 0) {
    return [];
  }

  const [projects, forms, workspaces] = await Promise.all([
    getProjectsByIds([...new Set(submissions.map((submission) => submission.project_id))]),
    requestJson<StoryFormRow[]>(
      "/rest/v1/story_forms",
      new URLSearchParams({
        select: "id,workspace_id,project_id,title,description,story_type,fields_json,public_slug,is_active",
        id: `in.(${[...new Set(submissions.map((submission) => submission.form_id))].join(",")})`,
      })
    ),
    getOrganizationsByIds([...new Set(submissions.map((submission) => submission.workspace_id))]),
  ]);

  const storyBySubmissionId = new Map(stories.filter((story) => story.submission_id).map((story) => [story.submission_id as string, story]));
  const projectMap = new Map(projects.map((project) => [project.id, project]));
  const formMap = new Map(forms.map((form) => [form.id, form]));
  const workspaceMap = new Map(workspaces.map((workspace) => [workspace.id, workspace]));

  return submissions.map<SubmissionListItem>((submission) => {
    const story = storyBySubmissionId.get(submission.id) ?? null;
    const project = projectMap.get(submission.project_id);
    const form = formMap.get(submission.form_id);
    const workspace = workspaceMap.get(submission.workspace_id);

    return {
      submission: {
        id: submission.id,
        workspaceId: submission.workspace_id,
        projectId: submission.project_id,
        formId: submission.form_id,
        submitterName: submission.submitter_name,
        submitterEmail: submission.submitter_email,
        data: submission.submission_data_json,
        photoUrls: submission.photo_urls ?? [],
        status: submission.status,
        submittedAt: submission.submitted_at,
      },
      story: story
        ? toStoryRecord(story)
        : null,
      formTitle: form?.title ?? "Form",
      projectName: project?.name ?? "Project",
      workspaceName: workspace?.name ?? "Workspace",
      workspaceSlug: workspace?.slug ?? "workspace",
    };
  });
}

export type FormSubmissionItem = {
  id: string;
  submitterName: string | null;
  submitterEmail: string | null;
  status: string;
  submittedAt: string;
  storyId: string | null;
  storyStage: string | null;
};

export async function listSubmissionsForForm(formId: string): Promise<FormSubmissionItem[]> {
  if (!isStoriesPersistenceEnabled()) return [];

  const submissions = await requestJsonOrEmpty<StorySubmissionRow[]>(
    "/rest/v1/story_submissions",
    new URLSearchParams({
      select: "id,submitter_name,submitter_email,status,submitted_at",
      form_id: `eq.${formId}`,
      order: "submitted_at.desc",
    })
  );

  if (submissions.length === 0) return [];

  const submissionIds = submissions.map((s) => s.id);
  const stories = await requestJsonOrEmpty<{ id: string; submission_id: string | null; current_stage: string }[]>(
    "/rest/v1/story_records",
    new URLSearchParams({
      select: "id,submission_id,current_stage",
      submission_id: `in.(${submissionIds.join(",")})`,
    })
  );

  const storyBySubmission = new Map(
    stories.filter((s) => s.submission_id).map((s) => [s.submission_id!, s])
  );

  return submissions.map((row) => {
    const story = storyBySubmission.get(row.id) ?? null;
    return {
      id: row.id,
      submitterName: row.submitter_name,
      submitterEmail: row.submitter_email,
      status: row.status,
      submittedAt: row.submitted_at,
      storyId: story?.id ?? null,
      storyStage: story?.current_stage ?? null,
    };
  });
}

export async function listStoryLibraryItems(): Promise<StoryLibraryItem[]> {
  if (!isStoriesPersistenceEnabled()) {
    return sampleStories.map<StoryLibraryItem>((story) => ({
      story,
      excerpt:
        sampleContentArtifacts.find((item) => item.storyId === story.id)?.body.slice(0, 200) ??
        "Content is being generated...",
      contentCount: sampleContentArtifacts.filter((item) => item.storyId === story.id).length,
      hasAssets: sampleAssets.some((item) => item.storyId === story.id),
    }));
  }

  const [stories, contents, assets] = await Promise.all([
    requestJson<StoryRecordRow[]>(
      "/rest/v1/story_records",
      new URLSearchParams({
        select:
          "id,workspace_id,project_id,submission_id,title,story_type,subject_name,status,current_stage,source_data_json,error_message,created_at,updated_at",
        order: "created_at.desc",
      })
    ),
    requestJsonOrEmpty<StoryContentRow[]>(
      "/rest/v1/story_content",
      new URLSearchParams({
        select: "id,workspace_id,story_id,channel,content_type,title,body,status,metadata_json,generated_at",
      })
    ),
    requestJsonOrEmpty<StoryAssetRow[]>(
      "/rest/v1/story_assets",
      new URLSearchParams({
        select:
          "id,workspace_id,story_id,asset_type,file_name,file_url,platform,dimensions,file_size,status,metadata_json,created_at",
      })
    ),
  ]);

  const contentByStoryId = new Map<string, StoryContentRow[]>();
  const assetStoryIds = new Set<string>();

  for (const content of contents) {
    contentByStoryId.set(content.story_id, [...(contentByStoryId.get(content.story_id) ?? []), content]);
  }

  for (const asset of assets) {
    assetStoryIds.add(asset.story_id);
  }

  return stories.map<StoryLibraryItem>((row) => {
    const story = toStoryRecord(row);
    const relatedContent = contentByStoryId.get(row.id) ?? [];
    const excerptSource = relatedContent[0]?.body ?? "Content is being generated...";

    return {
      story,
      excerpt: excerptSource.slice(0, 200),
      contentCount: relatedContent.length,
      hasAssets: assetStoryIds.has(row.id),
    };
  });
}

export async function listAssetLibraryItems(): Promise<AssetLibraryItem[]> {
  if (!isStoriesPersistenceEnabled()) {
    return sampleAssets.map<AssetLibraryItem>((asset) => ({
      ...asset,
      storyTitle: sampleStories.find((story) => story.id === asset.storyId)?.title ?? "Story",
    }));
  }

  const [assets, stories] = await Promise.all([
    requestJsonOrEmpty<StoryAssetRow[]>(
      "/rest/v1/story_assets",
      new URLSearchParams({
        select:
          "id,workspace_id,story_id,asset_type,file_name,file_url,platform,dimensions,file_size,status,metadata_json,created_at",
        order: "created_at.desc",
      })
    ),
    requestJson<StoryRecordRow[]>(
      "/rest/v1/story_records",
      new URLSearchParams({
        select:
          "id,workspace_id,project_id,submission_id,title,story_type,subject_name,status,current_stage,source_data_json,error_message,created_at,updated_at",
      })
    ),
  ]);

  const storyTitleById = new Map(stories.map((story) => [story.id, story.title]));

  return assets.map<AssetLibraryItem>((asset) => ({
    ...toStoryAssetRecord(asset),
    storyTitle: storyTitleById.get(asset.story_id) ?? "Story",
  }));
}

export async function getStoryDetailSnapshot(storyId: string): Promise<StoryDetailSnapshot | null> {
  if (!isStoriesPersistenceEnabled()) {
    const story = sampleStories.find((item) => item.id === storyId) ?? null;
    if (!story) {
      return null;
    }

    const project = sampleProjects.find((item) => item.id === story.projectId);
    const submission = sampleSubmissions.find((item) => item.id === story.submissionId) ?? null;
    const contents = sampleContentArtifacts.filter((item) => item.storyId === storyId);
    const assets = sampleAssets.filter((item) => item.storyId === storyId);
    const storyPackage = samplePackages.find((item) => item.storyId === storyId) ?? null;

    return {
      story,
      projectName: project?.name ?? "Project",
      workspaceName: project?.workspaceName ?? "Workspace",
      workspaceSlug: project?.workspaceSlug ?? "workspace",
      submission,
      contents,
      assets,
      storyPackage,
    };
  }

  const storyRows = await requestJson<StoryRecordRow[]>(
    "/rest/v1/story_records",
    new URLSearchParams({
      select:
        "id,workspace_id,project_id,submission_id,title,story_type,subject_name,status,current_stage,source_data_json,error_message,created_at,updated_at",
      id: `eq.${storyId}`,
      limit: "1",
    })
  );

  const row = storyRows[0];
  if (!row) {
    return null;
  }

  const [projects, workspaces, submissions, contents, assets, packages] = await Promise.all([
    getProjectsByIds([row.project_id]),
    getOrganizationsByIds([row.workspace_id]),
    row.submission_id
      ? requestJson<StorySubmissionRow[]>(
          "/rest/v1/story_submissions",
          new URLSearchParams({
            select: "id,workspace_id,project_id,form_id,submitter_name,submitter_email,submission_data_json,photo_urls,status,submitted_at",
            id: `eq.${row.submission_id}`,
            limit: "1",
          })
        )
      : Promise.resolve([]),
    requestJsonOrEmpty<StoryContentRow[]>(
      "/rest/v1/story_content",
      new URLSearchParams({
        select: "id,workspace_id,story_id,channel,content_type,title,body,status,metadata_json,generated_at",
        story_id: `eq.${storyId}`,
        order: "generated_at.asc",
      })
    ),
    requestJsonOrEmpty<StoryAssetRow[]>(
      "/rest/v1/story_assets",
      new URLSearchParams({
        select:
          "id,workspace_id,story_id,asset_type,file_name,file_url,platform,dimensions,file_size,status,metadata_json,created_at",
        story_id: `eq.${storyId}`,
        order: "created_at.asc",
      })
    ),
    requestJsonOrEmpty<StoryPackageRow[]>(
      "/rest/v1/story_packages",
      new URLSearchParams({
        select:
          "id,workspace_id,project_id,story_id,name,description,status,package_url,download_count,shareable_link,expires_at,created_at",
        story_id: `eq.${storyId}`,
        order: "created_at.desc",
      })
    ),
  ]);

  const project = projects[0];
  const workspace = workspaces[0];
  const submissionRow = submissions[0] ?? null;

  return {
    story: toStoryRecord(row),
    projectName: project?.name ?? "Project",
    workspaceName: workspace?.name ?? "Workspace",
    workspaceSlug: workspace?.slug ?? "workspace",
    submission: submissionRow
      ? {
          id: submissionRow.id,
          workspaceId: submissionRow.workspace_id,
          projectId: submissionRow.project_id,
          formId: submissionRow.form_id,
          submitterName: submissionRow.submitter_name,
          submitterEmail: submissionRow.submitter_email,
          data: submissionRow.submission_data_json,
          photoUrls: submissionRow.photo_urls ?? [],
          status: submissionRow.status,
          submittedAt: submissionRow.submitted_at,
        }
      : null,
    contents: contents.map(toStoryContentRecord),
    assets: assets.map(toStoryAssetRecord),
    storyPackage: packages[0] ? toStoryPackageRecord(packages[0]) : null,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Organizations
// ─────────────────────────────────────────────────────────────────────────────

export async function listAllOrganizations() {
  if (!isStoriesPersistenceEnabled()) {
    return sampleWorkspaces.map((ws) => ({
      id: ws.workspaceId,
      name: ws.workspaceName,
      slug: ws.workspaceSlug,
    }));
  }
  return requestJsonOrEmpty<OrganizationRow[]>(
    "/rest/v1/organizations",
    new URLSearchParams({ select: "id,name,slug", order: "name.asc" })
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Projects — flat API list
// ─────────────────────────────────────────────────────────────────────────────

export type FlatProject = {
  id: string;
  workspaceId: string;
  workspaceName: string;
  workspaceSlug: string;
  name: string;
  description: string;
  status: StoryProjectStatus;
  storyCountTarget: number | null;
  deadlineAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export async function listAllProjects(): Promise<FlatProject[]> {
  if (!isStoriesPersistenceEnabled()) {
    return sampleProjects.map((p) => ({
      id: p.id,
      workspaceId: p.workspaceId,
      workspaceName: p.workspaceName,
      workspaceSlug: p.workspaceSlug,
      name: p.name,
      description: p.description ?? "",
      status: p.status,
      storyCountTarget: p.storyCountTarget,
      deadlineAt: p.deadlineAt,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    }));
  }

  const rows = await requestJsonOrEmpty<StoryProjectRow[]>(
    "/rest/v1/story_projects",
    new URLSearchParams({
      select: "id,workspace_id,name,description,status,story_count_target,deadline_at,created_at,updated_at",
      order: "updated_at.desc",
    })
  );

  if (rows.length === 0) return [];

  const workspaceIds = [...new Set(rows.map((r) => r.workspace_id))];
  const organizations = await getOrganizationsByIds(workspaceIds);
  const workspaceMap = new Map(organizations.map((org) => [org.id, org]));

  return rows.map((row) => {
    const ws = workspaceMap.get(row.workspace_id);
    return {
      id: row.id,
      workspaceId: row.workspace_id,
      workspaceName: ws?.name ?? "Workspace",
      workspaceSlug: ws?.slug ?? "workspace",
      name: row.name,
      description: row.description ?? "",
      status: toProjectStatus(row.status),
      storyCountTarget: row.story_count_target ?? null,
      deadlineAt: row.deadline_at ?? null,
      createdAt: row.created_at ?? new Date().toISOString(),
      updatedAt: row.updated_at ?? new Date().toISOString(),
    };
  });
}

export async function getFlatProjectById(projectId: string): Promise<FlatProject | null> {
  if (!isStoriesPersistenceEnabled()) {
    const p = sampleProjects.find((item) => item.id === projectId);
    if (!p) return null;
    return {
      id: p.id,
      workspaceId: p.workspaceId,
      workspaceName: p.workspaceName,
      workspaceSlug: p.workspaceSlug,
      name: p.name,
      description: p.description ?? "",
      status: p.status,
      storyCountTarget: p.storyCountTarget,
      deadlineAt: p.deadlineAt,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    };
  }

  const rows = await requestJsonOrEmpty<StoryProjectRow[]>(
    "/rest/v1/story_projects",
    new URLSearchParams({
      select: "id,workspace_id,name,description,status,story_count_target,deadline_at,created_at,updated_at",
      id: `eq.${projectId}`,
      limit: "1",
    })
  );

  const row = rows[0];
  if (!row) return null;

  const organizations = await getOrganizationsByIds([row.workspace_id]);
  const ws = organizations[0];

  return {
    id: row.id,
    workspaceId: row.workspace_id,
    workspaceName: ws?.name ?? "Workspace",
    workspaceSlug: ws?.slug ?? "workspace",
    name: row.name,
    description: row.description ?? "",
    status: toProjectStatus(row.status),
    storyCountTarget: row.story_count_target ?? null,
    deadlineAt: row.deadline_at ?? null,
    createdAt: row.created_at ?? new Date().toISOString(),
    updatedAt: row.updated_at ?? new Date().toISOString(),
  };
}

export async function createProject(input: {
  workspaceId: string;
  name: string;
  description?: string | null;
  storyCountTarget?: number | null;
  deadlineAt?: string | null;
}): Promise<{ id: string; name: string }> {
  if (!isStoriesPersistenceEnabled()) {
    throw new Error("Stories persistence is not configured yet.");
  }

  const rows = await requestJson<StoryProjectRow[]>("/rest/v1/story_projects?select=*", undefined, {
    method: "POST",
    prefer: "return=representation",
    body: {
      workspace_id: input.workspaceId,
      name: input.name,
      description: input.description ?? null,
      story_count_target: input.storyCountTarget ?? null,
      deadline_at: input.deadlineAt ?? null,
      status: "planning",
    },
  });

  const row = rows[0];
  if (!row) throw new Error("Failed to create project.");
  return { id: row.id, name: row.name };
}

export async function deleteProjectById(projectId: string): Promise<void> {
  if (!isStoriesPersistenceEnabled()) {
    throw new Error("Stories persistence is not configured.");
  }

  const forms = await requestJsonOrEmpty<{ id: string }[]>(
    "/rest/v1/story_forms",
    new URLSearchParams({ select: "id", project_id: `eq.${projectId}`, limit: "1" })
  );
  if (forms.length > 0) {
    throw new Error("Cannot delete a project that has forms. Delete forms first.");
  }

  await requestJson(
    `/rest/v1/story_projects?id=eq.${projectId}`,
    undefined,
    { method: "DELETE" }
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Forms — project-scoped
// ─────────────────────────────────────────────────────────────────────────────

export type FlatForm = {
  id: string;
  projectId: string;
  workspaceId: string;
  title: string;
  description: string | null;
  storyType: string;
  fields: StoryFormField[];
  publicSlug: string;
  isActive: boolean;
  shareableLink: string;
  createdAt: string;
  submissionCount: number;
};

export async function listFormsForProject(projectId: string): Promise<FlatForm[]> {
  if (!isStoriesPersistenceEnabled()) {
    return samplePublishedForms
      .filter((f) => f.projectId === projectId)
      .map((f) => ({
        id: f.id,
        projectId: f.projectId,
        workspaceId: f.workspaceId,
        title: f.title,
        description: f.description || null,
        storyType: f.storyType,
        fields: f.fields,
        publicSlug: f.id,
        isActive: true,
        shareableLink: f.shareablePath,
        createdAt: new Date().toISOString(),
        submissionCount: 0,
      }));
  }

  const rows = await requestJsonOrEmpty<StoryFormRow[]>(
    "/rest/v1/story_forms",
    new URLSearchParams({
      select: "id,workspace_id,project_id,title,description,story_type,fields_json,public_slug,is_active,created_at",
      project_id: `eq.${projectId}`,
      order: "created_at.asc",
    })
  );

  if (rows.length === 0) return [];

  // Fetch submission counts for all forms in one query
  const formIds = rows.map((r) => r.id);
  const submissionRows = await requestJsonOrEmpty<{ form_id: string }[]>(
    "/rest/v1/story_submissions",
    new URLSearchParams({
      select: "form_id",
      form_id: `in.(${formIds.join(",")})`,
    })
  );
  const countByFormId = new Map<string, number>();
  for (const s of submissionRows) {
    countByFormId.set(s.form_id, (countByFormId.get(s.form_id) ?? 0) + 1);
  }

  return rows.map((row) => ({
    id: row.id,
    projectId: row.project_id,
    workspaceId: row.workspace_id,
    title: row.title,
    description: row.description,
    storyType: row.story_type,
    fields: row.fields_json ?? [],
    publicSlug: row.public_slug,
    isActive: row.is_active,
    shareableLink: `/forms/${row.public_slug}`,
    createdAt: (row as any).created_at ?? new Date().toISOString(),
    submissionCount: countByFormId.get(row.id) ?? 0,
  }));
}

export async function createFormFromBuilder(input: {
  projectId: string;
  title: string;
  description?: string | null;
  storyType: string;
  fields: StoryFormField[];
  isActive?: boolean;
}): Promise<{ id: string; shareableLink: string }> {
  if (!isStoriesPersistenceEnabled()) {
    throw new Error("Stories persistence is not configured yet.");
  }

  // Get workspace_id from project
  const projects = await requestJsonOrEmpty<StoryProjectRow[]>(
    "/rest/v1/story_projects",
    new URLSearchParams({ select: "id,workspace_id", id: `eq.${input.projectId}`, limit: "1" })
  );
  const project = projects[0];
  if (!project) throw new Error("Project not found.");

  const slug = `${input.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}-${Date.now()}`;

  const rows = await requestJson<StoryFormRow[]>("/rest/v1/story_forms?select=*", undefined, {
    method: "POST",
    prefer: "return=representation",
    body: {
      workspace_id: project.workspace_id,
      project_id: input.projectId,
      title: input.title,
      description: input.description ?? null,
      story_type: input.storyType,
      fields_json: input.fields,
      public_slug: slug,
      is_active: input.isActive ?? true,
    },
  });

  const row = rows[0];
  if (!row) throw new Error("Failed to create form.");
  return { id: row.id, shareableLink: `/forms/${row.public_slug}` };
}

export async function updateFormById(
  formId: string,
  input: { title: string; description?: string | null; storyType: string; fields: StoryFormField[] }
): Promise<void> {
  if (!isStoriesPersistenceEnabled()) {
    throw new Error("Stories persistence is not configured.");
  }
  await requestJson(`/rest/v1/story_forms?id=eq.${formId}`, undefined, {
    method: "PATCH",
    prefer: "return=minimal",
    body: {
      title: input.title,
      description: input.description ?? null,
      story_type: input.storyType,
      fields_json: input.fields,
    },
  });
}

export async function deleteFormById(formId: string): Promise<void> {
  if (!isStoriesPersistenceEnabled()) {
    throw new Error("Stories persistence is not configured.");
  }
  await requestJson(`/rest/v1/story_forms?id=eq.${formId}`, undefined, { method: "DELETE" });
}

// ─────────────────────────────────────────────────────────────────────────────
// Stories — flat API list
// ─────────────────────────────────────────────────────────────────────────────

export async function listAllStoriesFlat(): Promise<StoryRecord[]> {
  if (!isStoriesPersistenceEnabled()) {
    return sampleStories;
  }

  const rows = await requestJsonOrEmpty<StoryRecordRow[]>(
    "/rest/v1/story_records",
    new URLSearchParams({
      select: "id,workspace_id,project_id,submission_id,title,story_type,subject_name,status,current_stage,source_data_json,error_message,created_at,updated_at",
      order: "created_at.desc",
    })
  );

  return rows.map(toStoryRecord);
}

export async function listStoriesForProject(projectId: string): Promise<StoryRecord[]> {
  if (!isStoriesPersistenceEnabled()) {
    return sampleStories.filter((s) => s.projectId === projectId);
  }

  const rows = await requestJsonOrEmpty<StoryRecordRow[]>(
    "/rest/v1/story_records",
    new URLSearchParams({
      select: "id,workspace_id,project_id,submission_id,title,story_type,subject_name,status,current_stage,source_data_json,error_message,created_at,updated_at",
      project_id: `eq.${projectId}`,
      order: "created_at.desc",
    })
  );

  return rows.map(toStoryRecord);
}

export async function getStoryById(storyId: string): Promise<StoryRecord | null> {
  if (!isStoriesPersistenceEnabled()) {
    return sampleStories.find((s) => s.id === storyId) ?? null;
  }

  const rows = await requestJsonOrEmpty<StoryRecordRow[]>(
    "/rest/v1/story_records",
    new URLSearchParams({
      select: "id,workspace_id,project_id,submission_id,title,story_type,subject_name,status,current_stage,source_data_json,error_message,created_at,updated_at",
      id: `eq.${storyId}`,
      limit: "1",
    })
  );

  return rows[0] ? toStoryRecord(rows[0]) : null;
}

export async function deleteStoryById(storyId: string): Promise<void> {
  if (!isStoriesPersistenceEnabled()) {
    throw new Error("Stories persistence is not configured.");
  }
  await requestJson(`/rest/v1/story_records?id=eq.${storyId}`, undefined, { method: "DELETE" });
}

// ─────────────────────────────────────────────────────────────────────────────
// Packages
// ─────────────────────────────────────────────────────────────────────────────

export async function listPackagesForProject(projectId: string): Promise<StoryPackageRecord[]> {
  if (!isStoriesPersistenceEnabled()) {
    return samplePackages.filter((p) => p.projectId === projectId);
  }

  const rows = await requestJsonOrEmpty<StoryPackageRow[]>(
    "/rest/v1/story_packages",
    new URLSearchParams({
      select: "id,workspace_id,project_id,story_id,name,description,status,package_url,download_count,shareable_link,expires_at,created_at",
      project_id: `eq.${projectId}`,
      order: "created_at.desc",
    })
  );

  return rows.map(toStoryPackageRecord);
}

export async function deletePackageById(packageId: string): Promise<void> {
  if (!isStoriesPersistenceEnabled()) {
    throw new Error("Stories persistence is not configured.");
  }
  await requestJson(`/rest/v1/story_packages?id=eq.${packageId}`, undefined, { method: "DELETE" });
}

// ─────────────────────────────────────────────────────────────────────────────
// Content & Assets
// ─────────────────────────────────────────────────────────────────────────────

export async function listContentForStory(storyId: string): Promise<StoryContentRecord[]> {
  if (!isStoriesPersistenceEnabled()) {
    return sampleContentArtifacts.filter((c) => c.storyId === storyId);
  }

  const rows = await requestJsonOrEmpty<StoryContentRow[]>(
    "/rest/v1/story_content",
    new URLSearchParams({
      select: "id,workspace_id,story_id,channel,content_type,title,body,status,metadata_json,generated_at",
      story_id: `eq.${storyId}`,
      order: "generated_at.asc",
    })
  );

  return rows.map(toStoryContentRecord);
}

export async function listAssetsForStory(storyId: string): Promise<StoryAssetRecord[]> {
  if (!isStoriesPersistenceEnabled()) {
    return sampleAssets.filter((a) => a.storyId === storyId);
  }

  const rows = await requestJsonOrEmpty<StoryAssetRow[]>(
    "/rest/v1/story_assets",
    new URLSearchParams({
      select: "id,workspace_id,story_id,asset_type,file_name,file_url,platform,dimensions,file_size,status,metadata_json,created_at",
      story_id: `eq.${storyId}`,
      order: "created_at.asc",
    })
  );

  return rows.map(toStoryAssetRecord);
}

export async function listAllAssetsFlat(): Promise<Array<StoryAssetRecord & { storyTitle: string }>> {
  if (!isStoriesPersistenceEnabled()) {
    return sampleAssets.map((a) => ({
      ...a,
      storyTitle: sampleStories.find((s) => s.id === a.storyId)?.title ?? "Story",
    }));
  }

  const [assetRows, storyRows] = await Promise.all([
    requestJsonOrEmpty<StoryAssetRow[]>(
      "/rest/v1/story_assets",
      new URLSearchParams({
        select: "id,workspace_id,story_id,asset_type,file_name,file_url,platform,dimensions,file_size,status,metadata_json,created_at",
        order: "created_at.desc",
      })
    ),
    requestJsonOrEmpty<StoryRecordRow[]>(
      "/rest/v1/story_records",
      new URLSearchParams({ select: "id,title", order: "created_at.desc" })
    ),
  ]);

  const storyTitleMap = new Map(storyRows.map((s) => [s.id, s.title]));

  return assetRows.map((row) => ({
    ...toStoryAssetRecord(row),
    storyTitle: storyTitleMap.get(row.story_id) ?? "Story",
  }));
}

export async function getPackageDetailSnapshot(packageId: string): Promise<PackageDetailSnapshot | null> {
  if (!isStoriesPersistenceEnabled()) {
    const storyPackage = samplePackages.find((item) => item.id === packageId) ?? null;
    if (!storyPackage) {
      return null;
    }

    const story = storyPackage.storyId ? sampleStories.find((item) => item.id === storyPackage.storyId) ?? null : null;
    const project = sampleProjects.find((item) => item.id === storyPackage.projectId) ?? null;
    const contents = story ? sampleContentArtifacts.filter((item) => item.storyId === story.id) : [];
    const assets = story ? sampleAssets.filter((item) => item.storyId === story.id) : [];

    return {
      storyPackage,
      story,
      projectName: project?.name ?? "Project",
      workspaceName: project?.workspaceName ?? "Workspace",
      contents,
      assets,
    };
  }

  const packageRows = await requestJsonOrEmpty<StoryPackageRow[]>(
    "/rest/v1/story_packages",
    new URLSearchParams({
      select:
        "id,workspace_id,project_id,story_id,name,description,status,package_url,download_count,shareable_link,expires_at,created_at",
      id: `eq.${packageId}`,
      limit: "1",
    })
  );

  const packageRow = packageRows[0];
  if (!packageRow) {
    return null;
  }

  const [projects, workspaces, storyRows, contents, assets] = await Promise.all([
    getProjectsByIds([packageRow.project_id]),
    getOrganizationsByIds([packageRow.workspace_id]),
    packageRow.story_id
      ? requestJson<StoryRecordRow[]>(
          "/rest/v1/story_records",
          new URLSearchParams({
            select:
              "id,workspace_id,project_id,submission_id,title,story_type,subject_name,status,current_stage,source_data_json,error_message,created_at,updated_at",
            id: `eq.${packageRow.story_id}`,
            limit: "1",
          })
        )
      : Promise.resolve([]),
    packageRow.story_id
      ? requestJsonOrEmpty<StoryContentRow[]>(
          "/rest/v1/story_content",
          new URLSearchParams({
            select: "id,workspace_id,story_id,channel,content_type,title,body,status,metadata_json,generated_at",
            story_id: `eq.${packageRow.story_id}`,
            order: "generated_at.asc",
          })
        )
      : Promise.resolve([]),
    packageRow.story_id
      ? requestJsonOrEmpty<StoryAssetRow[]>(
          "/rest/v1/story_assets",
          new URLSearchParams({
            select:
              "id,workspace_id,story_id,asset_type,file_name,file_url,platform,dimensions,file_size,status,metadata_json,created_at",
            story_id: `eq.${packageRow.story_id}`,
            order: "created_at.asc",
          })
        )
      : Promise.resolve([]),
  ]);

  const project = projects[0];
  const workspace = workspaces[0];
  const story = storyRows[0] ? toStoryRecord(storyRows[0]) : null;

  return {
    storyPackage: toStoryPackageRecord(packageRow),
    story,
    projectName: project?.name ?? "Project",
    workspaceName: workspace?.name ?? "Workspace",
    contents: contents.map(toStoryContentRecord),
    assets: assets.map(toStoryAssetRecord),
  };
}

// ── Workspace API keys ────────────────────────────────────────────────────────

type WorkspaceApiKeyRow = {
  id: string;
  workspace_id: string;
  openai_api_key: string | null;
  video_api_key: string | null;
  video_api_provider: string | null;
  notification_email: string | null;
  updated_at: string;
};

export type WorkspaceApiKeys = {
  openaiApiKey: string | null;
  videoApiKey: string | null;
  videoApiProvider: string | null;
  notificationEmail: string | null;
};

export async function getWorkspaceApiKeys(workspaceId: string): Promise<WorkspaceApiKeys | null> {
  const env = getStoriesServiceEnv();
  if (!env) return null;
  const rows = await requestJsonOrEmpty<WorkspaceApiKeyRow[]>(
    "/rest/v1/workspace_api_keys",
    new URLSearchParams({
      select: "id,workspace_id,openai_api_key,video_api_key,video_api_provider,notification_email,updated_at",
      workspace_id: `eq.${workspaceId}`,
      limit: "1",
    })
  );
  const row = rows[0];
  if (!row) return null;
  return {
    openaiApiKey: row.openai_api_key,
    videoApiKey: row.video_api_key,
    videoApiProvider: row.video_api_provider,
    notificationEmail: row.notification_email,
  };
}

export async function upsertWorkspaceApiKeys(
  workspaceId: string,
  keys: Partial<WorkspaceApiKeys>
): Promise<void> {
  const env = getStoriesServiceEnv();
  if (!env) throw new Error("Missing service env");

  const body: Record<string, unknown> = {
    workspace_id: workspaceId,
    updated_at: new Date().toISOString(),
  };
  if (keys.openaiApiKey !== undefined) body.openai_api_key = keys.openaiApiKey || null;
  if (keys.videoApiKey !== undefined) body.video_api_key = keys.videoApiKey || null;
  if (keys.videoApiProvider !== undefined) body.video_api_provider = keys.videoApiProvider || null;
  if (keys.notificationEmail !== undefined) body.notification_email = keys.notificationEmail || null;

  const url = new URL("/rest/v1/workspace_api_keys", env.supabaseUrl);
  const res = await fetch(url.toString(), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: env.serviceRoleKey,
      Authorization: `Bearer ${env.serviceRoleKey}`,
      Prefer: "resolution=merge-duplicates",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to save API keys: ${text}`);
  }
}

export async function updateContentStatus(
  contentId: string,
  workspaceId: string,
  status: "draft" | "ready" | "approved"
): Promise<void> {
  const params = new URLSearchParams({ id: `eq.${contentId}`, workspace_id: `eq.${workspaceId}` });
  await requestJson<unknown>(`/rest/v1/story_content?${params.toString()}`, undefined, {
    method: "PATCH",
    body: { status },
  });
}
