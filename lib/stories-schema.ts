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

export const storyProjectStatuses = ["planning", "active", "paused", "delivered"] as const;
export type StoryProjectStatus = (typeof storyProjectStatuses)[number];

export const storyFormFieldTypes = ["text", "email", "tel", "textarea", "select"] as const;
export type StoryFormFieldType = (typeof storyFormFieldTypes)[number];

export const storySubmissionStatuses = ["submitted", "reviewed", "processing", "archived"] as const;
export type StorySubmissionStatus = (typeof storySubmissionStatuses)[number];

export const storyPipelineStages = [
  "form_sent",
  "submitted",
  "ai_processing",
  "asset_generation",
  "packaging",
  "delivered",
] as const;

export type StoryPipelineStage = (typeof storyPipelineStages)[number];

export const storyRecordStatuses = [
  "form_sent",
  "submitted",
  "ai_processing",
  "asset_generation",
  "packaging",
  "delivered",
  "blocked",
] as const;

export type StoryRecordStatus = (typeof storyRecordStatuses)[number];

export const storyContentChannels = ["blog", "newsletter", "social", "press_release", "email"] as const;
export type StoryContentChannel = (typeof storyContentChannels)[number];

export const storyContentTypes = ["draft", "caption", "feature", "script"] as const;
export type StoryContentType = (typeof storyContentTypes)[number];

export const storyContentStatuses = ["draft", "ready", "approved"] as const;
export type StoryContentStatus = (typeof storyContentStatuses)[number];

export const storyAssetTypes = ["image", "graphic", "video", "document"] as const;
export type StoryAssetType = (typeof storyAssetTypes)[number];

export const storyAssetStatuses = ["queued", "generated", "ready", "failed"] as const;
export type StoryAssetStatus = (typeof storyAssetStatuses)[number];

export const storyPackageStatuses = ["preparing", "ready", "delivered"] as const;
export type StoryPackageStatus = (typeof storyPackageStatuses)[number];

export type WorkspaceScopedRecord = {
  workspaceId: string;
};

export type StoryProjectRecord = WorkspaceScopedRecord & {
  id: string;
  name: string;
  description: string | null;
  status: StoryProjectStatus;
  storyCountTarget: number | null;
  deadlineAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type StoryFormField = {
  id: string;
  type: StoryFormFieldType;
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[];
};

export type StoryFormRecord = WorkspaceScopedRecord & {
  id: string;
  projectId: string;
  title: string;
  description: string | null;
  storyType: StoryType;
  fields: StoryFormField[];
  publicSlug: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type StorySubmissionRecord = WorkspaceScopedRecord & {
  id: string;
  projectId: string;
  formId: string;
  submitterName: string | null;
  submitterEmail: string | null;
  data: Record<string, unknown>;
  photoUrls: string[];
  status: StorySubmissionStatus;
  submittedAt: string;
};

export type StoryRecord = WorkspaceScopedRecord & {
  id: string;
  projectId: string;
  submissionId: string | null;
  title: string;
  storyType: StoryType;
  subjectName: string | null;
  status: StoryRecordStatus;
  currentStage: StoryPipelineStage;
  sourceData: Record<string, unknown> | null;
  errorMessage: string | null;
  createdAt: string;
  updatedAt: string;
};

export type StoryContentRecord = WorkspaceScopedRecord & {
  id: string;
  storyId: string;
  channel: StoryContentChannel;
  contentType: StoryContentType;
  title: string | null;
  body: string;
  status: StoryContentStatus;
  metadata: Record<string, unknown> | null;
  generatedAt: string;
};

export type StoryAssetRecord = WorkspaceScopedRecord & {
  id: string;
  storyId: string;
  assetType: StoryAssetType;
  fileName: string;
  fileUrl: string;
  platform: string | null;
  dimensions: string | null;
  fileSize: number | null;
  status: StoryAssetStatus;
  metadata: Record<string, unknown> | null;
  createdAt: string;
};

export type StoryPackageRecord = WorkspaceScopedRecord & {
  id: string;
  projectId: string;
  storyId: string | null;
  name: string;
  description: string | null;
  status: StoryPackageStatus;
  packageUrl: string | null;
  downloadCount: number;
  shareableLink: string | null;
  expiresAt: string | null;
  createdAt: string;
};
