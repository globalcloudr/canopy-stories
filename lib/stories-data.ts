import {
  getPublishedFormById as getSamplePublishedFormById,
  getPublishedFormsForWorkspace as getSamplePublishedFormsForWorkspace,
  sampleStories,
  sampleSubmissions,
  sampleProjects,
} from "@/lib/stories-domain";
import type { PublishedIntakeForm, StorySubmission } from "@/lib/stories-domain";
import type { StoryFormField, StoryRecord } from "@/lib/stories-schema";

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
  init?: { method?: "GET" | "POST" | "PATCH"; body?: unknown; prefer?: string }
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

  return (await response.json()) as T;
}

async function getProjectsByIds(projectIds: string[]) {
  if (projectIds.length === 0) {
    return [];
  }

  return requestJson<StoryProjectRow[]>(
    "/rest/v1/story_projects",
    new URLSearchParams({
      select: "id,workspace_id,name",
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

export async function getPublishedFormById(formId: string) {
  if (!isStoriesPersistenceEnabled()) {
    return getSamplePublishedFormById(formId);
  }

  const rows = await requestJson<StoryFormRow[]>(
    "/rest/v1/story_forms",
    new URLSearchParams({
      select: "id,workspace_id,project_id,title,description,story_type,fields_json,public_slug,is_active",
      or: `(id.eq.${formId},public_slug.eq.${formId})`,
      is_active: "eq.true",
      limit: "1",
    })
  );

  const form = rows[0];
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
        sourceData: payload.data,
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
        source_data_json: payload.data,
      },
    }
  );

  const story = storyRows[0];

  if (!story) {
    throw new Error("Story record could not be created.");
  }

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
      id: story.id,
      workspaceId: story.workspace_id,
      projectId: story.project_id,
      submissionId: story.submission_id,
      title: story.title,
      storyType: story.story_type,
      subjectName: story.subject_name,
      status: story.status,
      currentStage: story.current_stage,
      sourceData: story.source_data_json,
      errorMessage: story.error_message,
      createdAt: story.created_at,
      updatedAt: story.updated_at,
    },
  };
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
        ? {
            id: story.id,
            workspaceId: story.workspace_id,
            projectId: story.project_id,
            submissionId: story.submission_id,
            title: story.title,
            storyType: story.story_type,
            subjectName: story.subject_name,
            status: story.status,
            currentStage: story.current_stage,
            sourceData: story.source_data_json,
            errorMessage: story.error_message,
            createdAt: story.created_at,
            updatedAt: story.updated_at,
          }
        : null,
      formTitle: form?.title ?? "Form",
      projectName: project?.name ?? "Project",
      workspaceName: workspace?.name ?? "Workspace",
      workspaceSlug: workspace?.slug ?? "workspace",
    };
  });
}
