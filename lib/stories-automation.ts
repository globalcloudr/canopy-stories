import type {
  StoryAssetRecord,
  StoryAssetStatus,
  StoryContentRecord,
  StoryContentStatus,
  StoryPackageRecord,
  StoryPackageStatus,
  StoryType,
} from "@/lib/stories-schema";
import { getWorkspaceApiKeys } from "@/lib/stories-data";
import { resolveStoryMediaUrl } from "@/lib/stories-storage";

type StoryAutomationInput = {
  workspaceId: string;
  projectId: string;
  storyId: string;
  title: string;
  storyType: StoryType;
  subjectName: string | null;
  sourceData: Record<string, unknown> | null;
};

type GeneratedStoryArtifacts = {
  contents: Array<Omit<StoryContentRecord, "id" | "generatedAt">>;
  assets: Array<Omit<StoryAssetRecord, "id" | "createdAt">>;
  storyPackage: Omit<StoryPackageRecord, "id" | "createdAt">;
};

type VideoGenerationResult = {
  videoUrl: string;
  thumbnailUrl: string;
  duration: number;
  status: StoryAssetStatus;
};

const openAiBaseUrl = process.env.AI_INTEGRATIONS_OPENAI_BASE_URL || "https://api.openai.com/v1";
const openAiModel = process.env.AI_INTEGRATIONS_OPENAI_MODEL || process.env.OPENAI_MODEL || "gpt-5";

function getStoryBackground(sourceData: Record<string, unknown> | null) {
  if (!sourceData) {
    return "";
  }

  const preferredKeys = ["background", "story", "training", "impact", "goals", "career"];
  for (const key of preferredKeys) {
    const value = sourceData[key];
    if (typeof value === "string" && value.trim().length > 0) {
      return value.trim();
    }
  }

  return Object.entries(sourceData)
    .filter(([, value]) => typeof value === "string" && value.trim().length > 0)
    .map(([key, value]) => `${key}: ${value}`)
    .join("\n");
}

function getPhotoUrls(sourceData: Record<string, unknown> | null) {
  if (!sourceData) {
    return [] as string[];
  }

  const value = sourceData.photoUrls;
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is string => typeof item === "string" && item.length > 0);
}

function toPromptFields(sourceData: Record<string, unknown> | null) {
  if (!sourceData) {
    return "No extra form fields provided.";
  }

  const rows = Object.entries(sourceData)
    .filter(([key]) => key !== "photoUrls")
    .map(([key, value]) => `${key}: ${typeof value === "string" ? value : JSON.stringify(value)}`);

  return rows.length > 0 ? rows.join("\n") : "No extra form fields provided.";
}

async function requestOpenAi(system: string, user: string, json = false, apiKey = "") {
  if (!apiKey) {
    return null;
  }

  const response = await fetch(`${openAiBaseUrl.replace(/\/$/, "")}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: openAiModel,
      max_completion_tokens: 4000,
      ...(json ? { response_format: { type: "json_object" } } : {}),
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI request failed (${response.status}): ${errorText}`);
  }

  const result = (await response.json()) as {
    choices?: Array<{
      message?: {
        content?: string | null;
      };
    }>;
  };

  return result.choices?.[0]?.message?.content?.trim() ?? null;
}

async function generateTextContent(input: StoryAutomationInput, openAiApiKey: string) {
  const subjectName = input.subjectName || "Student";
  const background = getStoryBackground(input.sourceData);
  const detailBlock = toPromptFields(input.sourceData);

  const fallback = {
    blogPost: `# ${input.title}\n\n${subjectName} shared a ${input.storyType.replace(/_/g, " ").toLowerCase()} story through Canopy Stories.\n\n${background || "This story submission is ready for editorial review."}\n\n## Highlights\n\n${detailBlock}`,
    socialPosts: {
      facebook: `${subjectName}'s story is now in production for ${input.storyType.replace(/_/g, "/")}.`,
      instagram: `${subjectName}'s story is moving through the Canopy Stories pipeline. #AdultEducation #SuccessStory`,
      twitter: `${subjectName}'s story is now in production. #AdultEducation #SuccessStory`,
      linkedin: `${subjectName}'s success story has entered production in Canopy Stories.`,
    },
    newsletter: `${subjectName}'s story has entered the production pipeline. ${background || "Editors can now review and refine the generated draft."}`,
    pressRelease: `${subjectName}'s story is being prepared as a formal success-story package for distribution.`,
  };

  if (!openAiApiKey) {
    return fallback;
  }

  try {
    const [blogPost, socialJson, newsletter, pressRelease] = await Promise.all([
      requestOpenAi(
        "You write compelling adult-education success stories in markdown.",
        `Write a blog feature for this story.\n\nTitle: ${input.title}\nSubject: ${subjectName}\nType: ${input.storyType}\nBackground: ${background}\n\nForm details:\n${detailBlock}`,
        false, openAiApiKey
      ),
      requestOpenAi(
        "You generate concise social copy for adult education marketing. Return valid JSON.",
        `Return JSON with keys facebook, instagram, twitter, linkedin for this story.\n\nTitle: ${input.title}\nSubject: ${subjectName}\nType: ${input.storyType}\nBackground: ${background}\n\nForm details:\n${detailBlock}`,
        true, openAiApiKey
      ),
      requestOpenAi(
        "You write newsletter copy for adult education programs.",
        `Write a newsletter section for this story.\n\nTitle: ${input.title}\nSubject: ${subjectName}\nType: ${input.storyType}\nBackground: ${background}\n\nForm details:\n${detailBlock}`,
        false, openAiApiKey
      ),
      requestOpenAi(
        "You write formal education press releases in markdown.",
        `Write a short press release for this story.\n\nTitle: ${input.title}\nSubject: ${subjectName}\nType: ${input.storyType}\nBackground: ${background}\n\nForm details:\n${detailBlock}`,
        false, openAiApiKey
      ),
    ]);

    let socialPosts = fallback.socialPosts;
    if (socialJson) {
      try {
        const parsed = JSON.parse(socialJson) as Record<string, string>;
        socialPosts = {
          facebook: parsed.facebook || fallback.socialPosts.facebook,
          instagram: parsed.instagram || fallback.socialPosts.instagram,
          twitter: parsed.twitter || fallback.socialPosts.twitter,
          linkedin: parsed.linkedin || fallback.socialPosts.linkedin,
        };
      } catch {
        socialPosts = fallback.socialPosts;
      }
    }

    return {
      blogPost: blogPost || fallback.blogPost,
      socialPosts,
      newsletter: newsletter || fallback.newsletter,
      pressRelease: pressRelease || fallback.pressRelease,
    };
  } catch {
    return fallback;
  }
}

async function prepareVideoHighlights(input: StoryAutomationInput, openAiApiKey: string) {
  const subjectName = input.subjectName || "Student";
  const background = getStoryBackground(input.sourceData);
  const fallback = [
    `${subjectName}'s story is now in production.`,
    `${input.storyType.replace(/_/g, "/")} success stories help highlight real outcomes.`,
    background || `${subjectName}'s submission is ready for review.`,
  ].slice(0, 3);

  if (!openAiApiKey) {
    return fallback;
  }

  try {
    const result = await requestOpenAi(
      "You prepare short on-screen video highlight lines. Return valid JSON.",
      `Return JSON with a 'highlights' array of 3 short lines for a vertical promo video.\n\nTitle: ${input.title}\nSubject: ${subjectName}\nType: ${input.storyType}\nBackground: ${background}\n\nForm details:\n${toPromptFields(input.sourceData)}`,
      true, openAiApiKey
    );

    if (!result) {
      return fallback;
    }

    const parsed = JSON.parse(result) as { highlights?: string[] };
    const highlights = parsed.highlights?.filter((item) => typeof item === "string" && item.trim().length > 0) ?? [];
    return highlights.length > 0 ? highlights.slice(0, 5) : fallback;
  } catch {
    return fallback;
  }
}

async function generateVideoAsset(input: StoryAutomationInput, highlights: string[], videoApiKey: string, videoApiProvider: string): Promise<VideoGenerationResult> {
  const apiKey = videoApiKey;
  const provider = videoApiProvider || "json2video";
  const photoRef = getPhotoUrls(input.sourceData)[0] ?? null;
  const imageUrl = await resolveStoryMediaUrl(photoRef);

  if (!apiKey) {
    return {
      videoUrl: "[Video generation not configured]",
      thumbnailUrl: photoRef || "[Thumbnail not available]",
      duration: 15,
      status: "queued",
    };
  }

  if (provider !== "json2video") {
    return {
      videoUrl: `[${provider} video generation not implemented yet]`,
      thumbnailUrl: photoRef || "[Thumbnail not available]",
      duration: 15,
      status: "queued",
    };
  }

  try {
    const scenes = highlights.map((highlight, index) => ({
      "background-color": "#1e40af",
      elements: [
        ...(imageUrl && index === 0
          ? [
              {
                type: "image",
                src: imageUrl,
                duration: 5,
                start: 0,
                width: 972,
                height: 768,
                top: 360,
                left: 54,
              },
            ]
          : []),
        {
          type: "text",
          text: highlight,
          duration: 5,
          start: 0,
          style: "003",
          "font-size": 48,
          color: "#ffffff",
          "text-align": "center",
          top: imageUrl && index === 0 ? 1360 : 900,
          width: 918,
          left: 81,
        },
      ],
    }));

    const response = await fetch("https://api.json2video.com/v2/movies", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        resolution: "instagram-story",
        quality: "high",
        scenes,
      }),
    });

    if (!response.ok) {
      return {
        videoUrl: "[Video generation failed]",
        thumbnailUrl: imageUrl || "[Thumbnail not available]",
        duration: 15,
        status: "failed",
      };
    }

    const result = (await response.json()) as Record<string, unknown>;
    const videoUrl =
      (typeof result.movie_url === "string" && result.movie_url) ||
      (typeof result.url === "string" && result.url) ||
      "[Video URL unavailable]";
    const thumbnailUrl =
      (typeof result.thumbnail_url === "string" && result.thumbnail_url) || photoRef || "[Thumbnail not available]";

    return {
      videoUrl,
      thumbnailUrl,
      duration: 15,
      status: videoUrl.startsWith("[") ? "failed" : "ready",
    };
  } catch {
    return {
      videoUrl: "[Video generation failed]",
      thumbnailUrl: photoRef || "[Thumbnail not available]",
      duration: 15,
      status: "failed",
    };
  }
}

function createContentRecord(
  input: StoryAutomationInput,
  channel: StoryContentRecord["channel"],
  contentType: StoryContentRecord["contentType"],
  title: string | null,
  body: string,
  status: StoryContentStatus = "ready"
): Omit<StoryContentRecord, "id" | "generatedAt"> {
  return {
    workspaceId: input.workspaceId,
    storyId: input.storyId,
    channel,
    contentType,
    title,
    body,
    status,
    metadata: null,
  };
}

export async function buildStoryArtifacts(input: StoryAutomationInput): Promise<GeneratedStoryArtifacts> {
  const subjectName = input.subjectName || "Student";

  const workspaceKeys = await getWorkspaceApiKeys(input.workspaceId);
  const openAiApiKey = workspaceKeys?.openaiApiKey ?? "";
  const videoApiKey = workspaceKeys?.videoApiKey ?? "";
  const videoApiProvider = workspaceKeys?.videoApiProvider ?? "json2video";

  const textContent = await generateTextContent(input, openAiApiKey);
  const highlights = await prepareVideoHighlights(input, openAiApiKey);
  const video = await generateVideoAsset(input, highlights, videoApiKey, videoApiProvider);
  const photoUrls = getPhotoUrls(input.sourceData);

  const contents: Array<Omit<StoryContentRecord, "id" | "generatedAt">> = [
    createContentRecord(input, "blog", "feature", input.title, textContent.blogPost),
    createContentRecord(input, "social", "caption", "Facebook Post", textContent.socialPosts.facebook),
    createContentRecord(input, "social", "caption", "Instagram Caption", textContent.socialPosts.instagram),
    createContentRecord(input, "social", "caption", "Twitter / X Post", textContent.socialPosts.twitter),
    createContentRecord(input, "social", "caption", "LinkedIn Post", textContent.socialPosts.linkedin),
    createContentRecord(input, "newsletter", "feature", `${subjectName} Newsletter Feature`, textContent.newsletter),
    createContentRecord(input, "press_release", "draft", `${subjectName} Press Release`, textContent.pressRelease),
    createContentRecord(input, "social", "script", `${subjectName} Video Script`, highlights.join("\n")),
  ];

  const assets: Array<Omit<StoryAssetRecord, "id" | "createdAt">> = photoUrls.map((photoUrl, index) => ({
    workspaceId: input.workspaceId,
    storyId: input.storyId,
    assetType: "image",
    fileName: `${subjectName.toLowerCase().replace(/[^a-z0-9]+/g, "-") || "story"}-photo-${index + 1}.jpg`,
    fileUrl: photoUrl,
    platform: "source",
    dimensions: null,
    fileSize: null,
    status: "ready",
    metadata: { source: "submission" },
  }));

  if (!video.videoUrl.startsWith("[")) {
    assets.push({
      workspaceId: input.workspaceId,
      storyId: input.storyId,
      assetType: "video",
      fileName: `${subjectName.toLowerCase().replace(/[^a-z0-9]+/g, "-") || "story"}-story-video.mp4`,
      fileUrl: video.videoUrl,
      platform: "instagram-story",
      dimensions: "1080x1920",
      fileSize: null,
      status: video.status,
      metadata: { duration: video.duration },
    });
  }

  if (video.thumbnailUrl && !video.thumbnailUrl.startsWith("[") && video.thumbnailUrl !== video.videoUrl) {
    assets.push({
      workspaceId: input.workspaceId,
      storyId: input.storyId,
      assetType: "image",
      fileName: `${subjectName.toLowerCase().replace(/[^a-z0-9]+/g, "-") || "story"}-thumbnail.jpg`,
      fileUrl: video.thumbnailUrl,
      platform: "social",
      dimensions: "1080x1920",
      fileSize: null,
      status: video.status === "ready" ? "ready" : "queued",
      metadata: { generated: true },
    });
  }

  const packageStatus: StoryPackageStatus = video.status === "ready" || video.status === "queued" ? "ready" : "preparing";

  return {
    contents,
    assets,
    storyPackage: {
      workspaceId: input.workspaceId,
      projectId: input.projectId,
      storyId: input.storyId,
      name: `${subjectName} Success Story Package`,
      description: `Generated story package for ${subjectName}`,
      status: packageStatus,
      packageUrl: null,
      downloadCount: 0,
      shareableLink: `/stories/${input.storyId}`,
      expiresAt: null,
    },
  };
}
