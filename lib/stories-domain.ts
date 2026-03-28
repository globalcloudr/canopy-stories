export const storyPipelineStages = [
  "form_sent",
  "submitted",
  "ai_processing",
  "asset_generation",
  "packaging",
  "delivered",
] as const;

export type StoryPipelineStage = (typeof storyPipelineStages)[number];

export const storyTypes = [
  "ESL",
  "HSD_GED",
  "CTE",
  "EMPLOYER",
  "STAFF",
  "PARTNER",
  "OVERVIEW",
] as const;

export type StoryType = (typeof storyTypes)[number];

export type WorkspaceContextRef = {
  workspaceId: string;
  workspaceSlug: string;
  workspaceName: string;
};

export type WorkspaceProject = {
  id: string;
  workspaceId: string;
  workspaceSlug: string;
  workspaceName: string;
  name: string;
  seasonLabel: string;
  status: "active" | "draft" | "paused";
  storyTypeMix: StoryType[];
  activeStories: number;
  deliveredPackages: number;
  updatedAt: string;
};

export type StoryForm = {
  id: string;
  projectId: string;
  workspaceId: string;
  title: string;
  description: string;
  storyType: StoryType;
  shareablePath: string;
  isActive: boolean;
  fields: IntakeFormField[];
};

export type StorySubmission = {
  id: string;
  workspaceId: string;
  projectId: string;
  formId: string;
  submitterName: string;
  submitterEmail: string;
  status: "submitted" | "reviewed" | "processing";
  submittedAt: string;
};

export type StoryRecord = {
  id: string;
  workspaceId: string;
  projectId: string;
  submissionId?: string;
  title: string;
  storyType: StoryType;
  subjectName: string;
  status: StoryPipelineStage;
  currentStage: StoryPipelineStage;
  updatedAt: string;
};

export type StoryContentArtifact = {
  id: string;
  workspaceId: string;
  storyId: string;
  channel: "blog" | "newsletter" | "social" | "press_release" | "email";
  contentType: "draft" | "caption" | "feature" | "script";
  title: string;
  status: "draft" | "ready" | "approved";
};

export type StoryAsset = {
  id: string;
  workspaceId: string;
  storyId: string;
  assetType: "image" | "graphic" | "video" | "document";
  fileName: string;
  status: "queued" | "generated" | "ready";
};

export type StoryPackage = {
  id: string;
  workspaceId: string;
  projectId: string;
  storyId?: string;
  name: string;
  status: "preparing" | "ready" | "delivered";
  createdAt: string;
};

export type StoryWorkflowSummary = {
  stage: StoryPipelineStage;
  count: number;
  label: string;
};

export type IntakeFormTemplate = {
  id: string;
  name: string;
  description: string;
  storyType: StoryType;
  fields: IntakeFormField[];
};

export type IntakeFieldType = "text" | "email" | "tel" | "textarea" | "select";

export type IntakeFormField = {
  id: string;
  type: IntakeFieldType;
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[];
};

export type PublishedIntakeForm = {
  id: string;
  projectId: string;
  workspaceId: string;
  title: string;
  description: string;
  storyType: StoryType;
  workspaceSlug: string;
  workspaceName: string;
  submissionCount: number;
  shareablePath: string;
  templateId: string;
  fields: IntakeFormField[];
};

export const sampleWorkspaces: WorkspaceContextRef[] = [
  {
    workspaceId: "ws_bas",
    workspaceSlug: "berkeley-adult-school",
    workspaceName: "Berkeley Adult School",
  },
  {
    workspaceId: "ws_smace",
    workspaceSlug: "smace",
    workspaceName: "SMACE",
  },
  {
    workspaceId: "ws_sjdt",
    workspaceSlug: "sjdt",
    workspaceName: "SJDT",
  },
];

export const sampleProjects: WorkspaceProject[] = [
  {
    id: "proj_fall_2026_bas",
    workspaceId: "ws_bas",
    workspaceSlug: "berkeley-adult-school",
    workspaceName: "Berkeley Adult School",
    name: "Fall 2026 Student Story Campaign",
    seasonLabel: "Fall 2026",
    status: "active",
    storyTypeMix: ["ESL", "CTE", "HSD_GED"],
    activeStories: 7,
    deliveredPackages: 3,
    updatedAt: "2026-03-27T17:00:00.000Z",
  },
  {
    id: "proj_spring_2026_smace",
    workspaceId: "ws_smace",
    workspaceSlug: "smace",
    workspaceName: "SMACE",
    name: "Spring Catalog Success Stories",
    seasonLabel: "Spring 2026",
    status: "active",
    storyTypeMix: ["OVERVIEW", "STAFF", "PARTNER"],
    activeStories: 4,
    deliveredPackages: 5,
    updatedAt: "2026-03-26T14:00:00.000Z",
  },
  {
    id: "proj_launch_sjdt",
    workspaceId: "ws_sjdt",
    workspaceSlug: "sjdt",
    workspaceName: "SJDT",
    name: "Launch Stories Pilot",
    seasonLabel: "Pilot",
    status: "draft",
    storyTypeMix: ["CTE", "EMPLOYER"],
    activeStories: 2,
    deliveredPackages: 0,
    updatedAt: "2026-03-24T10:30:00.000Z",
  },
];

export const sampleWorkflowSummaries: StoryWorkflowSummary[] = [
  { stage: "form_sent", count: 3, label: "Awaiting submission" },
  { stage: "submitted", count: 5, label: "Ready for review" },
  { stage: "ai_processing", count: 2, label: "Generating drafts" },
  { stage: "asset_generation", count: 2, label: "Building visuals" },
  { stage: "packaging", count: 1, label: "Packaging deliverables" },
  { stage: "delivered", count: 8, label: "Delivered recently" },
];

export const sampleIntakeTemplates: IntakeFormTemplate[] = [
  {
    id: "form_esl_spotlight",
    name: "ESL Student Spotlight",
    description: "Form for student language-learning journey and classroom impact stories.",
    storyType: "ESL",
    fields: [
      { id: "name", type: "text", label: "Full Name", placeholder: "Your full name", required: true },
      { id: "email", type: "email", label: "Contact Email", placeholder: "you@school.org", required: true },
      { id: "city", type: "text", label: "City, State", placeholder: "City, State", required: true },
      {
        id: "background",
        type: "textarea",
        label: "Your Story",
        placeholder: "Tell us about your background, what brought you to ESL, and what this journey has meant.",
        required: true,
      },
      {
        id: "goals",
        type: "textarea",
        label: "Future Goals",
        placeholder: "What are your goals now that your English is improving?",
        required: false,
      },
      {
        id: "photoApproval",
        type: "select",
        label: "Photo Permission",
        required: true,
        options: ["Yes - I approve photos", "No - Please no photos"],
      },
    ],
  },
  {
    id: "form_cte_pathway",
    name: "Career Pathway Success",
    description: "Form for workforce, CTE, and employer outcome stories.",
    storyType: "CTE",
    fields: [
      { id: "name", type: "text", label: "Full Name", placeholder: "Your full name", required: true },
      { id: "email", type: "email", label: "Contact Email", placeholder: "you@school.org", required: true },
      {
        id: "program",
        type: "text",
        label: "Program or Career Field",
        placeholder: "Medical Assistant, HVAC, Welding, Culinary, etc.",
        required: true,
      },
      {
        id: "training",
        type: "textarea",
        label: "Training Experience",
        placeholder: "Describe your training, the skills you gained, and what stood out.",
        required: true,
      },
      {
        id: "career",
        type: "textarea",
        label: "Career Plans",
        placeholder: "How is this program helping you move toward work or advancement?",
        required: false,
      },
      {
        id: "photoApproval",
        type: "select",
        label: "Photo Permission",
        required: true,
        options: ["Yes - I approve photos", "No - Please no photos"],
      },
    ],
  },
  {
    id: "form_staff_profile",
    name: "Staff Story Profile",
    description: "Form for teacher, counselor, and staff spotlight pieces.",
    storyType: "STAFF",
    fields: [
      { id: "name", type: "text", label: "Full Name", placeholder: "Your full name", required: true },
      { id: "title", type: "text", label: "Title or Role", placeholder: "Instructor, counselor, dean, etc.", required: true },
      { id: "email", type: "email", label: "Contact Email", placeholder: "you@school.org", required: true },
      {
        id: "background",
        type: "textarea",
        label: "Your Background",
        placeholder: "Tell us about your background and what brought you to adult education.",
        required: true,
      },
      {
        id: "impact",
        type: "textarea",
        label: "Student Impact",
        placeholder: "Share a story about the impact you have seen on students or programs.",
        required: false,
      },
      {
        id: "photoApproval",
        type: "select",
        label: "Photo Permission",
        required: true,
        options: ["Yes - I approve photos", "No - Please no photos"],
      },
    ],
  },
];

export const samplePublishedForms: PublishedIntakeForm[] = [
  {
    id: "pub_form_bas_esl_01",
    projectId: "proj_fall_2026_bas",
    workspaceId: "ws_bas",
    title: "Berkeley ESL Student Spotlight",
    description: "Public intake form for Berkeley Adult School ESL student success stories.",
    storyType: "ESL",
    workspaceSlug: "berkeley-adult-school",
    workspaceName: "Berkeley Adult School",
    submissionCount: 4,
    shareablePath: "/forms/pub_form_bas_esl_01",
    templateId: "form_esl_spotlight",
    fields: sampleIntakeTemplates[0].fields,
  },
  {
    id: "pub_form_smace_staff_01",
    projectId: "proj_spring_2026_smace",
    workspaceId: "ws_smace",
    title: "SMACE Staff Story Profile",
    description: "Staff and faculty story collection form for spring campaign work.",
    storyType: "STAFF",
    workspaceSlug: "smace",
    workspaceName: "SMACE",
    submissionCount: 2,
    shareablePath: "/forms/pub_form_smace_staff_01",
    templateId: "form_staff_profile",
    fields: sampleIntakeTemplates[2].fields,
  },
  {
    id: "pub_form_sjdt_cte_01",
    projectId: "proj_launch_sjdt",
    workspaceId: "ws_sjdt",
    title: "Career Pathway Pilot Intake",
    description: "Pilot form for workforce and employer outcome stories.",
    storyType: "CTE",
    workspaceSlug: "sjdt",
    workspaceName: "SJDT",
    submissionCount: 1,
    shareablePath: "/forms/pub_form_sjdt_cte_01",
    templateId: "form_cte_pathway",
    fields: sampleIntakeTemplates[1].fields,
  },
];

export function getProjectsForWorkspace(workspaceSlug?: string | null) {
  if (!workspaceSlug) {
    return sampleProjects;
  }

  return sampleProjects.filter((project) => project.workspaceSlug === workspaceSlug);
}

export function getPublishedFormsForWorkspace(workspaceSlug?: string | null) {
  if (!workspaceSlug) {
    return samplePublishedForms;
  }

  return samplePublishedForms.filter((form) => form.workspaceSlug === workspaceSlug);
}

export function getPublishedFormById(formId: string) {
  return samplePublishedForms.find((form) => form.id === formId) ?? null;
}

export function formatRelativeDate(value: string) {
  const date = new Date(value);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
