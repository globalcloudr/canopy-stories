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

// ─── Field label mapping ───────────────────────────────────────────────────
// Maps raw form field IDs to human-readable labels for prompt context.
// Contact/media fields are excluded — they add noise without content value.

const SKIP_FIELDS = new Set(["name", "email", "phone", "city", "photoApproval", "photoUpload", "photoUrls"]);

const FIELD_LABELS: Record<string, string> = {
  // ESL
  nativeLanguage: "Native Language",
  educationLevel: "Education Level in Home Country",
  background: "Personal Story",
  challenges: "Challenges Overcome",
  achievements: "Achievements & Progress",
  goals: "Future Goals",
  // HSD/GED
  age: "Age",
  whyNow: "Why Return to Education",
  support: "How the Program Helped",
  nextSteps: "Next Steps & Goals",
  // CTE
  program: "Career Field / Program",
  training: "Training Experience",
  handson: "Hands-On Experience",
  career: "Career Plans",
  advice: "Advice for Others",
  // EMPLOYER
  title: "Title / Position",
  company: "Company",
  organization: "Organization",
  partnership: "Partnership with Institution",
  quality: "Quality of Training",
  graduates: "Experience with Graduates",
  value: "Value to Business",
  // STAFF
  role: "Role & Responsibilities",
  impact: "Student Impact",
  rewarding: "Most Rewarding Aspects",
  future: "Vision for the Future",
  // PARTNER
  partnershipType: "Type of Partnership",
  sharedGoals: "Shared Goals",
  communityImpact: "Community Impact",
  success: "Success Stories",
  // OVERVIEW
  history: "Institution History",
  currentPrograms: "Current Programs",
  futurePlans: "Future Plans",
};

function getPhotoUrls(sourceData: Record<string, unknown> | null) {
  if (!sourceData) return [] as string[];
  const value = sourceData.photoUrls;
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string" && item.length > 0);
}

function buildFormContext(sourceData: Record<string, unknown> | null): string {
  if (!sourceData) return "No form responses provided.";

  const rows = Object.entries(sourceData)
    .filter(([key, value]) => !SKIP_FIELDS.has(key) && typeof value === "string" && (value as string).trim().length > 0)
    .map(([key, value]) => {
      const label = FIELD_LABELS[key] ?? key.replace(/([A-Z])/g, " $1").trim();
      return `${label}: ${(value as string).trim()}`;
    });

  return rows.length > 0 ? rows.join("\n") : "No additional form responses provided.";
}

// ─── Story-type system prompts ────────────────────────────────────────────────
// Each prompt gives the AI clear context about who the subject is, what the
// audience cares about, and what tone and emphasis to bring to adult education.

function getStoryTypeContext(storyType: StoryType): string {
  switch (storyType) {
    case "ESL":
      return `You are writing about an adult ESL (English as a Second Language) student at a community adult education program. These students are often immigrants or refugees who came to the US as adults and are learning English while navigating a new country, raising families, and pursuing careers. Their stories are about courage, resilience, and the profound impact that language access has on every part of life — from helping children with homework to advancing in a job, qualifying for citizenship, or simply being heard. The emotional core is transformation: a person who felt invisible or limited by language barriers finding voice, connection, and opportunity. Write with warmth and deep respect for the challenge of learning a language as an adult.`;
    case "HSD_GED":
      return `You are writing about an adult who earned their high school diploma or GED through an adult education program. These students left school years or decades ago — often because of family hardship, poverty, pregnancy, or circumstance — and made the decision as adults to come back and finish. Many are parents who want to model education for their children, workers who need a diploma to advance, or individuals who have carried the weight of not finishing for years. Their stories are about second chances, persistence in the face of self-doubt, and proving — to themselves above all — that it is never too late. Write with honesty about the barriers and deep pride in what they achieved.`;
    case "CTE":
      return `You are writing about a Career and Technical Education (CTE) student at an adult education program. These students are adults training for careers in fields like healthcare (medical assistant, phlebotomy, CNA), skilled trades (HVAC, welding, electrical), technology, or business. Many are career changers, displaced workers, or people entering the workforce for the first time. CTE programs give them hands-on, job-ready skills in months — not years — and the stories are about practical transformation: a person who found a career path, gained real skills, and can now support themselves and their family. Emphasize the concrete outcomes: certifications earned, jobs obtained, wages improved. Write with clarity and pride in skilled work.`;
    case "EMPLOYER":
      return `You are writing about an employer partner who hires graduates from or provides externship opportunities to an adult education program. These employers have seen firsthand the quality of the school's training and the dedication of its graduates. Their stories validate the program's real-world value — graduates who show up motivated, trained, and ready to contribute. The audience for this content is other employers considering a partnership and prospective students who want to know that the training leads to real jobs. Write in a professional but genuine tone that reflects a business relationship grounded in mutual benefit and community investment.`;
    case "STAFF":
      return `You are writing about a teacher, instructor, or staff member at an adult education program. Adult education staff often choose this field because they are deeply motivated by mission — they work with students who face real hardship and come to class anyway. The stories are about purpose, the small moments that make the work meaningful, and the long-term impact of education on individual lives and whole communities. Readers are prospective students, donors, and community partners who want to understand the human heart of the institution. Write with authenticity and mission-driven warmth.`;
    case "PARTNER":
      return `You are writing about a community organization or agency that partners with an adult education program. Partners might be workforce agencies, healthcare systems, libraries, nonprofits, or government programs. The story is about how the partnership serves students and the broader community — what each organization brings, what outcomes it creates, and why collaboration matters. The audience is other potential partners, funders, and policymakers. Write with clarity about the shared mission and the practical impact of working together.`;
    case "OVERVIEW":
      return `You are writing about an adult education institution — its history, programs, and community impact. The subject is typically an administrator or director who can speak to the institution's mission, what makes it distinctive, and where it is headed. The audience includes prospective students, community members, funders, and partners. Write with institutional pride and clarity, grounding the story in real programs and real outcomes rather than generic mission language.`;
  }
}

async function requestOpenAi(system: string, user: string, json = false, apiKey = "") {
  if (!apiKey) {
    throw new Error("OpenAI API key is not configured for this workspace.");
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
  const storyContext = getStoryTypeContext(input.storyType);
  const formContext = buildFormContext(input.sourceData);

  const storyBlock = `Story title: ${input.title}\nSubject: ${subjectName}\n\nForm responses:\n${formContext}`;

  const [blogPost, socialJson, newsletter, pressRelease] = await Promise.all([
    requestOpenAi(
      `${storyContext}\n\nYou write compelling feature stories in markdown for adult education programs. Your blog posts are 600–900 words, told in narrative form with a clear arc: where the person started, the challenges they faced, how the program helped, and where they are now. Use a warm, human tone. Lead with a vivid opening that draws the reader in. Include at least one direct quote (you may compose a realistic quote from the form responses). End with a forward-looking sentence about their future. Do not use generic education clichés.`,
      `Write a blog feature story for this submission.\n\n${storyBlock}`,
      false, openAiApiKey
    ),
    requestOpenAi(
      `${storyContext}\n\nYou write social media copy for adult education programs. Return valid JSON with keys: facebook, instagram, twitter, linkedin. Follow these guidelines for each platform:\n- facebook: 100–180 words. Warm, community tone. Tell a mini version of the story. End with a gentle call to action (e.g., "Learn more about our programs" or "Could this be your story too?").\n- instagram: 80–120 words of caption text followed by a line break and 8–12 relevant hashtags (e.g., #AdultEducation #ESL #NewBeginnings #CommunityCollege). Inspirational tone, visual and personal.\n- twitter: Under 260 characters. One punchy line capturing the heart of the story. May include 1–2 hashtags.\n- linkedin: 150–200 words. Professional tone focused on career outcomes, workforce development, or institutional impact. Appropriate for workforce partners, employers, and community stakeholders.`,
      `Write social media copy for this story. Return only valid JSON.\n\n${storyBlock}`,
      true, openAiApiKey
    ),
    requestOpenAi(
      `${storyContext}\n\nYou write newsletter features for adult education programs. Newsletter sections are 200–300 words, conversational and warm. They are written in third person and feel like a personal highlight from the school community. Include the subject's name, a key detail from their journey, and a sentence that invites readers to celebrate with the community. Do not use bullet points — write in flowing paragraphs.`,
      `Write a newsletter feature for this story.\n\n${storyBlock}`,
      false, openAiApiKey
    ),
    requestOpenAi(
      `${storyContext}\n\nYou write press releases for adult education programs in standard AP Style newswire format. Press releases are 300–400 words, written in third person. They open with a dateline and a strong news lead (who, what, where, when, why). Include one attributed quote from the subject or a program representative. Close with a standard boilerplate paragraph about the institution. Use formal language appropriate for media distribution.`,
      `Write a press release for this story.\n\n${storyBlock}`,
      false, openAiApiKey
    ),
  ]);

  if (!blogPost?.trim() || !newsletter?.trim() || !pressRelease?.trim()) {
    throw new Error("OpenAI returned empty content for one or more generated drafts.");
  }

  if (!socialJson?.trim()) {
    throw new Error("OpenAI returned empty social copy.");
  }

  let parsedSocial: Record<string, string>;
  try {
    parsedSocial = JSON.parse(socialJson) as Record<string, string>;
  } catch {
    throw new Error("OpenAI returned invalid JSON for social copy.");
  }

  const facebook = parsedSocial.facebook?.trim();
  const instagram = parsedSocial.instagram?.trim();
  const twitter = parsedSocial.twitter?.trim();
  const linkedin = parsedSocial.linkedin?.trim();

  if (!facebook || !instagram || !twitter || !linkedin) {
    throw new Error("OpenAI returned incomplete social copy.");
  }

  return {
    blogPost,
    socialPosts: {
      facebook,
      instagram,
      twitter,
      linkedin,
    },
    newsletter,
    pressRelease,
  };
}

async function prepareVideoHighlights(input: StoryAutomationInput, openAiApiKey: string) {
  const subjectName = input.subjectName || "Student";
  const formContext = buildFormContext(input.sourceData);
  const fallback = [
    `Meet ${subjectName}`,
    `A story of courage and education`,
    `Made possible by adult education`,
  ];

  if (!openAiApiKey) {
    throw new Error("OpenAI API key is not configured for this workspace.");
  }

  const result = await requestOpenAi(
    `You write on-screen text lines for short vertical promo videos for adult education programs. Return valid JSON with a 'highlights' array of exactly 3 strings following a three-line arc:\n- Line 1 (Setup): Who is this person or where did they start? 5–8 words. Personal and grounding.\n- Line 2 (Achievement): What did they accomplish or overcome? 5–8 words. Specific and proud.\n- Line 3 (Inspiration): Where are they headed, or what does this mean? 5–9 words. Forward-looking and hopeful.\n\nRules: Each line stands alone on screen. No punctuation at the end. No quotes. No full sentences — these are headline fragments. Must feel human, not like marketing copy.`,
    `Write 3 video highlight lines for this story.\n\nSubject: ${subjectName}\nStory type: ${input.storyType}\n\nForm responses:\n${formContext}`,
    true, openAiApiKey
  );

  if (!result) {
    throw new Error("OpenAI returned empty video highlight content.");
  }

  const parsed = JSON.parse(result) as { highlights?: string[] };
  const highlights = parsed.highlights?.filter((item) => typeof item === "string" && item.trim().length > 0) ?? [];
  return highlights.length > 0 ? highlights.slice(0, 3) : fallback;
}

type CreatomateRender = {
  id: string;
  status: string;
  url?: string;
  snapshot_url?: string;
};

async function pollCreatomateRender(
  apiKey: string,
  renderId: string,
  maxWaitMs: number
): Promise<CreatomateRender | null> {
  const interval = 3000;
  const attempts = Math.ceil(maxWaitMs / interval);
  for (let i = 0; i < attempts; i++) {
    await new Promise<void>((resolve) => setTimeout(resolve, interval));
    try {
      const res = await fetch(`https://api.creatomate.com/v1/renders/${renderId}`, {
        headers: { Authorization: `Bearer ${apiKey}` },
      });
      if (!res.ok) break;
      const render = (await res.json()) as CreatomateRender;
      if (render.status === "succeeded" || render.status === "done" || render.status === "failed") {
        return render;
      }
    } catch {
      break;
    }
  }
  return null;
}

async function submitCreatomateRender(
  apiKey: string,
  templateId: string,
  modifications: Record<string, string>
): Promise<CreatomateRender | null> {
  try {
    const res = await fetch("https://api.creatomate.com/v1/renders", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ template_id: templateId, modifications }),
    });
    if (!res.ok) return null;
    const renders = (await res.json()) as CreatomateRender[];
    return renders[0] ?? null;
  } catch {
    return null;
  }
}

async function generateVideoAsset(
  input: StoryAutomationInput,
  highlights: string[],
  videoApiKey: string,
  videoApiProvider: string,
  videoTemplateId: string
): Promise<VideoGenerationResult> {
  const photoRef = getPhotoUrls(input.sourceData)[0] ?? null;
  const imageUrl = await resolveStoryMediaUrl(photoRef);
  const subjectName = input.subjectName || "Student";
  const provider = videoApiProvider || "creatomate";

  if (!videoApiKey) {
    return {
      videoUrl: "[Video generation not configured]",
      thumbnailUrl: photoRef || "[Thumbnail not available]",
      duration: 15,
      status: "queued",
    };
  }

  if (provider === "creatomate") {
    if (!videoTemplateId) {
      return {
        videoUrl: "[Video template not configured — add a Creatomate video template ID in Settings]",
        thumbnailUrl: photoRef || "[Thumbnail not available]",
        duration: 15,
        status: "queued",
      };
    }

    const modifications: Record<string, string> = {
      Name: subjectName,
      "Highlight 1": highlights[0] ?? "",
      "Highlight 2": highlights[1] ?? "",
      "Highlight 3": highlights[2] ?? "",
    };
    // Only pass the photo if it's a plain public URL — Creatomate cannot access
    // signed Supabase storage URLs (they require auth headers Creatomate won't send)
    if (imageUrl && !imageUrl.includes("/object/sign/") && !imageUrl.includes("token=")) {
      modifications.Photo = imageUrl;
    }

    const render = await submitCreatomateRender(videoApiKey, videoTemplateId, modifications);
    if (!render) {
      return {
        videoUrl: "[Video generation failed]",
        thumbnailUrl: imageUrl || "[Thumbnail not available]",
        duration: 15,
        status: "failed",
      };
    }

    // Poll up to 15 seconds for fast-completing renders
    const completed = render.status === "succeeded" || render.status === "done" || render.status === "failed"
      ? render
      : await pollCreatomateRender(videoApiKey, render.id, 15000);

    if ((completed?.status === "succeeded" || completed?.status === "done") && completed.url) {
      return {
        videoUrl: completed.url,
        thumbnailUrl: completed.snapshot_url || imageUrl || "[Thumbnail not available]",
        duration: 15,
        status: "ready",
      };
    }

    // Still rendering — store render ID so the asset can be resolved later
    return {
      videoUrl: `[creatomate:${render.id}]`,
      thumbnailUrl: imageUrl || "[Thumbnail not available]",
      duration: 15,
      status: "queued",
    };
  }

  // Legacy json2video fallback
  if (provider === "json2video") {
    try {
      const scenes = highlights.map((highlight, index) => ({
        "background-color": "#1e40af",
        elements: [
          ...(imageUrl && index === 0
            ? [{ type: "image", src: imageUrl, duration: 5, start: 0, width: 972, height: 768, top: 360, left: 54 }]
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
        headers: { "x-api-key": videoApiKey, "Content-Type": "application/json" },
        body: JSON.stringify({ resolution: "instagram-story", quality: "high", scenes }),
      });

      if (!response.ok) {
        return { videoUrl: "[Video generation failed]", thumbnailUrl: imageUrl || "[Thumbnail not available]", duration: 15, status: "failed" };
      }

      const result = (await response.json()) as Record<string, unknown>;
      const videoUrl =
        (typeof result.movie_url === "string" && result.movie_url) ||
        (typeof result.url === "string" && result.url) ||
        "[Video URL unavailable]";
      const thumbnailUrl =
        (typeof result.thumbnail_url === "string" && result.thumbnail_url) || photoRef || "[Thumbnail not available]";
      return { videoUrl, thumbnailUrl, duration: 15, status: videoUrl.startsWith("[") ? "failed" : "ready" };
    } catch {
      return { videoUrl: "[Video generation failed]", thumbnailUrl: photoRef || "[Thumbnail not available]", duration: 15, status: "failed" };
    }
  }

  return {
    videoUrl: `[${provider} video generation not supported]`,
    thumbnailUrl: photoRef || "[Thumbnail not available]",
    duration: 15,
    status: "queued",
  };
}

type HighlightCardResult = {
  imageUrl: string;
  status: "ready" | "queued" | "failed";
};

async function generateHighlightCard(
  input: StoryAutomationInput,
  highlights: string[],
  videoApiKey: string,
  videoApiProvider: string,
  imageTemplateId: string
): Promise<HighlightCardResult | null> {
  if (!videoApiKey || (videoApiProvider || "creatomate") !== "creatomate" || !imageTemplateId) {
    return null;
  }

  const photoRef = getPhotoUrls(input.sourceData)[0] ?? null;
  const imageUrl = await resolveStoryMediaUrl(photoRef);
  const subjectName = input.subjectName || "Student";

  const modifications: Record<string, string> = {
    Name: subjectName,
    Quote: highlights[0] ?? "",
  };
  if (imageUrl && !imageUrl.includes("/object/sign/") && !imageUrl.includes("token=")) {
    modifications.Photo = imageUrl;
  }

  const render = await submitCreatomateRender(videoApiKey, imageTemplateId, modifications);
  if (!render) return { imageUrl: "[Highlight card generation failed]", status: "failed" };

  const completed = render.status === "succeeded" || render.status === "done" || render.status === "failed"
    ? render
    : await pollCreatomateRender(videoApiKey, render.id, 10000);

  if ((completed?.status === "succeeded" || completed?.status === "done") && completed.url) {
    return { imageUrl: completed.url, status: "ready" };
  }

  return { imageUrl: `[creatomate:${render.id}]`, status: "queued" };
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
  const videoApiProvider = workspaceKeys?.videoApiProvider ?? "creatomate";
  const videoTemplateId = workspaceKeys?.videoTemplateId ?? "";
  const imageTemplateId = workspaceKeys?.imageTemplateId ?? "";

  const textContent = await generateTextContent(input, openAiApiKey);
  const highlights = await prepareVideoHighlights(input, openAiApiKey);
  const [video, highlightCard] = await Promise.all([
    generateVideoAsset(input, highlights, videoApiKey, videoApiProvider, videoTemplateId),
    generateHighlightCard(input, highlights, videoApiKey, videoApiProvider, imageTemplateId),
  ]);
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

  if (highlightCard && !highlightCard.imageUrl.startsWith("[")) {
    assets.push({
      workspaceId: input.workspaceId,
      storyId: input.storyId,
      assetType: "graphic",
      fileName: `${subjectName.toLowerCase().replace(/[^a-z0-9]+/g, "-") || "story"}-highlight-card.jpg`,
      fileUrl: highlightCard.imageUrl,
      platform: "social",
      dimensions: "1080x1080",
      fileSize: null,
      status: highlightCard.status,
      metadata: { generated: true, type: "highlight_card" },
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
