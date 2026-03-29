import type {
  StoryAssetRecord,
  StoryContentRecord,
  StoryFormField,
  StoryFormRecord,
  StoryPackageRecord,
  StoryPipelineStage,
  StoryProjectRecord,
  StoryRecord,
  StorySubmissionRecord,
  StoryType,
} from "@/lib/stories-schema";
import { storyPipelineStages, storyTypes } from "@/lib/stories-schema";

export { storyPipelineStages, storyTypes };

export type WorkspaceContextRef = {
  workspaceId: string;
  workspaceSlug: string;
  workspaceName: string;
};

export type WorkspaceProject = StoryProjectRecord & {
  workspaceSlug: string;
  workspaceName: string;
  seasonLabel: string;
  storyTypeMix: StoryType[];
  activeStories: number;
  deliveredPackages: number;
};

export type StoryForm = StoryFormRecord & {
  shareablePath: string;
};

export type StorySubmission = StorySubmissionRecord;

export type StoryContentArtifact = StoryContentRecord;

export type StoryAsset = StoryAssetRecord;

export type StoryPackage = StoryPackageRecord;

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
  fields: StoryFormField[];
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
  fields: StoryFormField[];
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
    description: "Student and pathway success stories for seasonal campaign delivery.",
    seasonLabel: "Fall 2026",
    status: "active",
    storyCountTarget: 12,
    deadlineAt: "2026-11-15T00:00:00.000Z",
    storyTypeMix: ["ESL", "CTE", "HSD_GED"],
    activeStories: 7,
    deliveredPackages: 3,
    createdAt: "2026-02-01T08:00:00.000Z",
    updatedAt: "2026-03-27T17:00:00.000Z",
  },
  {
    id: "proj_spring_2026_smace",
    workspaceId: "ws_smace",
    workspaceSlug: "smace",
    workspaceName: "SMACE",
    name: "Spring Catalog Success Stories",
    description: "Staff, program, and partner stories supporting spring catalog outreach.",
    seasonLabel: "Spring 2026",
    status: "active",
    storyCountTarget: 8,
    deadlineAt: "2026-05-20T00:00:00.000Z",
    storyTypeMix: ["OVERVIEW", "STAFF", "PARTNER"],
    activeStories: 4,
    deliveredPackages: 5,
    createdAt: "2026-01-18T09:30:00.000Z",
    updatedAt: "2026-03-26T14:00:00.000Z",
  },
  {
    id: "proj_launch_sjdt",
    workspaceId: "ws_sjdt",
    workspaceSlug: "sjdt",
    workspaceName: "SJDT",
    name: "Launch Stories Pilot",
    description: "Pilot story intake and production workflow for initial launch testing.",
    seasonLabel: "Pilot",
    status: "planning",
    storyCountTarget: 3,
    deadlineAt: null,
    storyTypeMix: ["CTE", "EMPLOYER"],
    activeStories: 2,
    deliveredPackages: 0,
    createdAt: "2026-03-01T10:00:00.000Z",
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

export const sampleSubmissions: StorySubmission[] = [
  {
    id: "sub_bas_esl_001",
    workspaceId: "ws_bas",
    projectId: "proj_fall_2026_bas",
    formId: "pub_form_bas_esl_01",
    submitterName: "Maria R.",
    submitterEmail: "maria@example.org",
    data: {
      city: "Berkeley, CA",
      background: "Returned to school to improve English and support my children.",
      goals: "Earn my certificate and help new students feel confident.",
    },
    photoUrls: ["/sample-assets/maria-portrait.jpg"],
    status: "submitted",
    submittedAt: "2026-03-25T16:00:00.000Z",
  },
  {
    id: "sub_smace_staff_001",
    workspaceId: "ws_smace",
    projectId: "proj_spring_2026_smace",
    formId: "pub_form_smace_staff_01",
    submitterName: "Anna Teacher",
    submitterEmail: "anna@example.org",
    data: {
      title: "Lead ESL Instructor",
      impact: "Built a mentoring rhythm that improved retention.",
    },
    photoUrls: [],
    status: "reviewed",
    submittedAt: "2026-03-22T12:30:00.000Z",
  },
];

export const sampleStories: StoryRecord[] = [
  {
    id: "story_bas_001",
    workspaceId: "ws_bas",
    projectId: "proj_fall_2026_bas",
    submissionId: "sub_bas_esl_001",
    title: "Maria finds confidence through Berkeley ESL",
    storyType: "ESL",
    subjectName: "Maria R.",
    status: "asset_generation",
    currentStage: "asset_generation",
    sourceData: {
      submissionId: "sub_bas_esl_001",
      photoCount: 1,
    },
    errorMessage: null,
    createdAt: "2026-03-25T16:05:00.000Z",
    updatedAt: "2026-03-27T10:30:00.000Z",
  },
  {
    id: "story_smace_001",
    workspaceId: "ws_smace",
    projectId: "proj_spring_2026_smace",
    submissionId: "sub_smace_staff_001",
    title: "How mentorship is changing retention at SMACE",
    storyType: "STAFF",
    subjectName: "Anna Teacher",
    status: "delivered",
    currentStage: "delivered",
    sourceData: {
      submissionId: "sub_smace_staff_001",
      photoCount: 0,
    },
    errorMessage: null,
    createdAt: "2026-03-22T12:45:00.000Z",
    updatedAt: "2026-03-26T15:00:00.000Z",
  },
];

export const sampleContentArtifacts: StoryContentArtifact[] = [
  {
    id: "content_bas_blog_001",
    workspaceId: "ws_bas",
    storyId: "story_bas_001",
    channel: "blog",
    contentType: "feature",
    title: "Maria finds confidence through Berkeley ESL",
    body: "Draft blog content placeholder.",
    status: "ready",
    metadata: { wordCount: 620 },
    generatedAt: "2026-03-25T16:12:00.000Z",
  },
  {
    id: "content_smace_news_001",
    workspaceId: "ws_smace",
    storyId: "story_smace_001",
    channel: "newsletter",
    contentType: "feature",
    title: "Mentorship and retention at SMACE",
    body: "Newsletter feature placeholder.",
    status: "approved",
    metadata: { wordCount: 240 },
    generatedAt: "2026-03-22T13:10:00.000Z",
  },
];

export const sampleAssets: StoryAsset[] = [
  {
    id: "asset_bas_social_001",
    workspaceId: "ws_bas",
    storyId: "story_bas_001",
    assetType: "graphic",
    fileName: "maria-social-quote.png",
    fileUrl: "/sample-assets/maria-social-quote.png",
    platform: "instagram",
    dimensions: "1080x1080",
    fileSize: 482120,
    status: "generated",
    metadata: null,
    createdAt: "2026-03-27T10:42:00.000Z",
  },
];

export const samplePackages: StoryPackage[] = [
  {
    id: "pkg_smace_001",
    workspaceId: "ws_smace",
    projectId: "proj_spring_2026_smace",
    storyId: "story_smace_001",
    name: "SMACE mentorship package",
    description: "Delivered story package with newsletter and social assets.",
    status: "delivered",
    packageUrl: "/sample-assets/smace-package.zip",
    downloadCount: 3,
    shareableLink: "/packages/pkg_smace_001",
    expiresAt: "2026-06-30T00:00:00.000Z",
    createdAt: "2026-03-26T15:10:00.000Z",
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

export function pipelineStageLabel(stage: string): string {
  switch (stage) {
    case "form_sent": return "Waiting for response";
    case "submitted": return "Story received";
    case "ai_processing": return "Writing content…";
    case "asset_generation": return "Creating graphics…";
    case "packaging": return "Preparing delivery";
    case "delivered": return "Ready to use";
    default: return stage;
  }
}

export function storyTypeLabel(type: string): string {
  switch (type) {
    case "ESL": return "ESL";
    case "HSD_GED": return "HSD / GED";
    case "CTE": return "CTE";
    case "EMPLOYER": return "Employer";
    case "STAFF": return "Staff";
    case "PARTNER": return "Partner";
    case "OVERVIEW": return "Overview";
    default: return type;
  }
}

export function contentStatusLabel(status: string): string {
  switch (status) {
    case "draft": return "Draft";
    case "ready": return "Ready to use";
    case "approved": return "Approved";
    default: return status;
  }
}

export function packageStatusLabel(status: string): string {
  switch (status) {
    case "preparing": return "Preparing…";
    case "ready": return "Ready to download";
    case "delivered": return "Delivered";
    default: return status;
  }
}
