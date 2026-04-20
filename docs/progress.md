# Canopy Stories — Progress and Current Work

Append new sessions at the top. Do not overwrite history.

---

## 2026-04-19 — Moved more shell ownership into @canopy/ui

- Updated Stories to `@canopy/ui` v0.1.10
- Switched the outer app layout to the shared shell-frame primitives:
  - `AppShellFrame`
  - `AppShellSidebar`
  - `AppShellContent`
- Removed local Canopy app font loading from `app/layout.tsx`
- Stories now imports `canopyFontVariables` from `@canopy/ui`, so the core app font stack is owned by the shared package instead of the product repo

### Verification

- `npm run build` passed
- `package-lock.json` now resolves `@canopy/ui` to `vendor/canopy-ui-0.1.10.tgz`

## 2026-04-08 — School-facing UX pass across dashboard, projects, and forms

### What changed

- Rewrote visible staff copy across Forms, Help, Settings, and project setup so the app reads like a school workflow instead of internal product/migration tooling
- Updated the dashboard hero to focus on adult education success stories instead of generic automation language
- Kept the dashboard metric row and moved the action-oriented guidance into a dismissible quick-start box above the hero
- Reworked project detail navigation to match the school workflow:
  - `Overview`
  - `Forms`
  - `Responses`
  - `Stories`
  - `Assets`
- Split project responses into their own tab instead of burying them inside the Forms tab
- Replaced the empty project workflow board with a state-aware setup/next-step panel when a project has no stories yet
- Promoted starter form templates on the Forms page with two launch paths on each template card:
  - `Use in existing project`
  - `Create project with this template`
- Added a template-first project creation path so choosing a starter template can launch the project dialog and carry that template into the guided setup flow

### Verification

- `npx tsc --noEmit --incremental false` passed

---

## 2026-04-06 — Bumped to @canopy/ui v0.1.4

- Updated `@canopy/ui` from v0.1.3 → v0.1.4
- Copied `canopy-ui-0.1.4.tgz` to `vendor/` and ran `npm install`
- New in v0.1.4: `Alert` component with `info`, `success`, `error`, `warning` variants
- `npx tsc --noEmit` passes clean

---

## 2026-04-03 — Workspace scoping, data leak fix, regenerate story, markdown rendering

### Super admin workspace redirect
- `StoriesShell` now detects when a platform operator loads any page without `?workspace=` in the URL and immediately redirects to add it
- Ensures all server-side data queries are scoped to the correct workspace from the first render
- School users are excluded from the redirect (they only have one workspace; RLS protects them)

### Data leak fix in `listSubmissionItems`
- `story_records` query was missing a workspace filter — all story records from all workspaces were returned when no workspace slug was present
- Added `workspace_id: eq.<workspaceIdFilter>` to the story_records query, matching the existing filter on submissions
- A super admin landing without `?workspace=` could see stories from other schools in pipeline counts and dashboard stats

### Regenerate story
- New `rerunStoryAutomation()` in `lib/stories-data.ts` — deletes existing content, assets, and package then re-runs the full pipeline
- New `POST /api/stories/[id]/regenerate` route — auth-gated, requires workspace access
- `RegenerateButton` client component on the story detail page — shows inline confirmation before firing, refreshes page on completion
- Allows staff to re-generate all AI content and video/card assets for any existing story

### Markdown rendering
- Added `react-markdown` dependency
- New `MarkdownBody` component at `app/_components/markdown-body.tsx`
- Blog posts, newsletter content, and press releases now render with proper headings, paragraphs, bold, lists, and blockquotes on both the package page and story detail page
- Social posts remain plain text (no markdown formatting applied)

### Verification
- `npx tsc --noEmit` passed

---

## 2026-04-03 — AI prompt quality improvement

Rewrote the AI content generation prompts in `lib/stories-automation.ts` to produce publication-ready adult education content instead of generic outputs.

### Per-story-type system context (`getStoryTypeContext`)
Each of the 7 story types now gets a dedicated system prompt that explains who the subject is, what the audience cares about, and what tone and emphasis to bring:
- **ESL** — immigrant/refugee learning English; language access as transformation; courage and connection
- **HSD/GED** — adult returning to finish school; second chances; proving it's never too late
- **CTE** — career training in healthcare, trades, or tech; practical outcomes; jobs and wages
- **EMPLOYER** — employer partner validating program quality; business benefit and community investment
- **STAFF** — instructor mission and student impact; purpose-driven work
- **PARTNER** — community org collaboration; shared mission and practical outcomes
- **OVERVIEW** — institutional history, programs, and impact; grounded in real outcomes

### Per-channel format guidance
Each content type now has explicit format rules in the prompt:
- **Blog post**: 600–900 words, narrative arc, vivid opening, one direct quote, forward-looking close
- **Newsletter**: 200–300 words, third person, conversational, flowing paragraphs (no bullets)
- **Press release**: 300–400 words, AP Style, dateline, news lead, attributed quote, boilerplate close
- **Facebook**: 100–180 words, community tone, mini story, call to action
- **Instagram**: 80–120 words + 8–12 hashtags, inspirational
- **Twitter/X**: Under 260 characters, one punchy line, 1–2 hashtags
- **LinkedIn**: 150–200 words, professional, workforce/career-focused

### Video highlights (`prepareVideoHighlights`)
- Three-line arc: Setup → Achievement → Inspiration
- 5–9 words per line, headline fragments (not full sentences)
- Rules enforced: no punctuation, no quotes, must feel human not marketing

### Form context (`buildFormContext`)
- Replaced `toPromptFields` — skips contact/media fields (name, email, phone, photoApproval, photoUpload)
- Maps raw field IDs to human-readable labels (e.g. `whyNow` → "Why Return to Education")

### Verification
- `npx tsc --noEmit` passed

---

## 2026-04-02 — Creatomate video integration and highlight card

Replaced json2video with Creatomate as the default video provider and added a highlight card image asset type.

### Creatomate video (`generateVideoAsset`)
- Submits a render to `POST https://api.creatomate.com/v1/renders` with the workspace's video template ID
- Polls up to 15 seconds for fast-completing renders; if still rendering, stores the Creatomate render ID as a `[creatomate:<id>]` placeholder and marks the asset `queued`
- Template variables: `Name`, `Highlight-1`, `Highlight-2`, `Highlight-3`, `Photo`
- json2video kept as a named legacy fallback (`video_api_provider = 'json2video'`); new workspaces default to `creatomate`

### Highlight card (`generateHighlightCard`)
- New asset type: a 1080×1080 social share card generated from a separate Creatomate image template
- Runs in parallel with video generation during `buildStoryArtifacts`
- Template variables: `Name`, `Quote`, `Photo`
- Appears in the story's asset library as a `graphic` asset alongside the video
- Only generated when Creatomate is the active provider and an image template ID is configured

### Settings UI
- Added "Video provider settings" section to the API Keys settings page
- Provider selector: Creatomate (default) or JSON2Video (legacy)
- Template ID inputs for video template and highlight card template, with variable documentation
- Saves independently from API key save/remove actions

### Data layer
- `WorkspaceApiKeys` type extended with `videoTemplateId` and `imageTemplateId`
- `workspace_api_keys` table extended via SQL migration `cs-007`

### Verification
- `npx tsc --noEmit` passed

---

## 2026-04-02 — Beta security hardening

Pre-beta security review and hardening pass. Stories changes:

### Auth guard on `/api/content`
- Added authentication and workspace access check to the content listing endpoint
- Previously unauthenticated callers could retrieve story content for any story ID
- Now looks up the story's workspace and calls `requireWorkspaceAccess` before returning content
- File: `app/api/content/route.ts`

### Rate limiting on public form submission
- Added IP-based rate limiting to `POST /api/forms/[id]/submit` (10 submissions per form per IP per hour)
- IP is SHA-256 hashed before storage — raw IPs are never persisted
- Backed by a new Supabase table: `form_submission_rate_limits`
- Added SQL migration: `docs/sql/2026-04-02-cs-006-form-submission-rate-limits.sql`
- Protects against bots driving up OpenAI/video API costs and spamming the submission pipeline

### Error message sanitization
- Fixed `toErrorResponse` in `lib/server-auth.ts` — non-auth errors now return the fallback message instead of `err.message`, and log the full error server-side
- This covers all routes that use `toErrorResponse`

### Verification
- `npx tsc --noEmit` passed

---

## 2026-04-02 — Workspace-context and entitlement-gating stabilization

### What was done

- Tightened Stories app-session resolution so platform operators only see workspaces where `stories_canopy` is actually enabled
- Hardened launcher-product resolution to merge entitlement rows across `organization_id`, `org_id`, and `workspace_id` instead of stopping early on partial legacy data
- Added shared workspace-aware link building so dashboard, projects, stories, forms, submissions, assets, and detail pages preserve `?workspace=<slug>` during in-app navigation
- Fixed Super Admin flows where opening a story, moving between nav items, or creating follow-on records could silently fall back to the first workspace

### Verification

- `npm run build` passed in `canopy-stories`

---

## 2026-04-02 — Private submission media and signed URL hardening

### What was done

- Replaced the public `story-photos` media model with private storage refs for new public-form uploads
- `/api/upload` now enforces image MIME type and 10MB max size server-side, writes to a private bucket, and returns:
  - a short-lived signed preview URL for the public form UI
  - a durable `storage://story-photos/...` ref for persistence
- Public submission creation now accepts only workspace-scoped storage refs for uploaded photos
- Stories asset reads now sign private storage refs on demand for story detail, package, and asset-library surfaces
- Added backward compatibility so older `story-photos` public URLs still resolve inside the app while the existing data set transitions
- Content status updates were also hardened to use the content record's real workspace on the server instead of a caller-supplied workspace id

### Verification

- `npm run build` passed in `canopy-stories`

---

## 2026-03-31 — Security hardening, launch exchange, and server-backed workspace context

### What was done

- Added shared Stories server auth so protected APIs validate the current user and workspace membership before using service-role access
- Locked the main project, story, settings, and content-management routes behind authenticated workspace access
- Updated client-side data writes to send the Supabase bearer token instead of relying on anonymous service-role routes
- Public upload flow now derives workspace from the target form instead of trusting a caller-supplied `workspaceId`
- Replaced Portal token-hash launch with a one-time handoff exchange
- Added `/api/app-session` so Stories resolves active workspace and accessible workspaces from a server-backed session source instead of mixed client-side fallbacks

### Verification

- `npm run build` passed in:
  - `canopy-stories`
  - `canopy-platform/apps/portal`

---

## 2026-03-29 — Per-workspace API key enforcement

### What was done

**AI pipeline now uses per-workspace API keys exclusively**
- `stories-automation.ts` previously read OpenAI and video API keys from env vars at module level, completely ignoring per-workspace keys stored in `workspace_api_keys`
- Removed module-level `openAiApiKey` constant
- `buildStoryArtifacts` now fetches the workspace's own keys via `getWorkspaceApiKeys(workspaceId)` at runtime
- `openAiApiKey` and `videoApiKey`/`videoApiProvider` threaded as explicit parameters through `generateTextContent`, `prepareVideoHighlights`, `generateVideoAsset`, and `requestOpenAi`
- If a workspace has no key configured, AI steps return plain-text fallback content and video returns `[Video generation not configured]` — no silent fallback to env vars
- Env var keys (`OPENAI_API_KEY`, `VIDEO_API_KEY`) are no longer used by any workspace pipeline run

---

## 2026-03-29 — Bug fixes, guided project creation wizard, and UX improvements

### What was done

**Bug fixes**
- Fixed "Unexpected end of JSON input" error when deleting a project — Supabase DELETE returns `204 No Content`; `requestJson()` now skips `.json()` for empty responses
- Fixed workspace selector appearing for school users in the Create Project dialog — now fetches only the user's own orgs and auto-selects the active workspace; selector only shown for operators with multiple orgs
- Fixed deleted projects persisting in Dashboard view after deletion — added `router.refresh()` after delete to invalidate Next.js router cache

**Dashboard polish**
- Replaced all placeholder grey squares and circles in stat cards, empty states, and recent project cards with meaningful inline SVG icons (folder, envelope, arrow-cycle, check-circle, clock, bar-chart, sparkles, folder-open)
- Removed "0 workspaces in the current Stories dataset" header meta — meaningless for school users

**Guided project creation wizard (3 steps)**
- Step 1: Create project (name, description, story goal, deadline) — unchanged fields, now transitions automatically to Step 2
- Step 2: Template picker — all 7 templates shown as selectable cards (3-column grid, 56rem wide dialog) with name, story type badge, and description; picking a template pre-fills the form title; "Skip — I'll add a form later" option available
- Step 3: Success screen — shows copyable shareable form link and a numbered "what happens next" guide; "Go to project" navigates to the new project

**Form customization (post-creation)**
- `updateFormById()` added to `lib/stories-data.ts` — PATCHes title, description, story type, and fields
- `PATCH /api/forms/[id]` endpoint added
- `FormBuilderDialog` extended with `editForm` prop — opens pre-populated with existing form data when editing; submit calls PATCH instead of POST; title and button label update to reflect edit mode
- "Customize" button added to each form row in the project Forms tab — opens the full form builder with all templates and field editor pre-loaded with that form's current data

**Photo upload scoping**
- Upload path changed from `uploads/{timestamp}.jpg` to `{workspaceId}/{timestamp}.jpg` — isolates each school's photos within the `story-photos` bucket
- `workspaceId` passed from `PublicFormExperience` to `/api/upload` via FormData

### Storage setup required
- Create `story-photos` bucket in Supabase Storage
- Current behavior expects the bucket to be private; the app will flip the bucket private on upload if it still exists as public

---

## 2026-03-29 — UX improvements: polish pass, API keys, and 5 UX features

### What was done

**Visual polish and UX language pass (all pages)**
- Pipeline stage labels, story type labels, content status labels, and package status labels all moved to shared helpers in `lib/stories-domain.ts` as a single source of truth
- Removed machine-language labels and raw JSON from all visible surfaces
- Stories list, assets library, submissions, and project pages converted from card grids to `divide-y` flat rows
- Dashboard metrics renamed to plain English
- Public intake form: button relabelled "Share your story"; success confirmation screen added after submission

**Settings page**
- Rewritten with two-column `label + controls` layout
- Static workspace fields displayed cleanly without fake input boxes

**Per-workspace API keys (Feature: client self-service)**
- `workspace_api_keys` table added (SQL: `cs-003`)
- Settings page: `ApiKeysSection` client component — masked key fields with "Key saved" / "Not configured" status pills; plain email input for notification address
- API keys are never sent to the browser; GET endpoint returns boolean flags only

**Feature #1 — Package ready email notifications**
- `lib/stories-email.ts` added; uses Resend API, fails silently if not configured
- `notification_email` column added to `workspace_api_keys` (SQL: `cs-004`)
- Email sent automatically after story is marked delivered in `runStoryAutomation`

**Feature #2 — Form response tracking**
- `submissionCount` added to `FlatForm` — fetched in one query alongside forms in `listFormsForProject`
- Response count badge shown on each form in the project Forms tab (green if > 0)
- "View responses" button per form: expands an inline list showing respondent name, email, date, pipeline stage, and link to story
- `GET /api/submissions?formId=xxx` endpoint added
- `listSubmissionsForForm()` helper added to `lib/stories-data.ts`

**Feature #3 — Content review / approval**
- `PATCH /api/content/[id]` endpoint added
- `updateContentStatus()` helper added to `lib/stories-data.ts`
- `ContentReviewButtons` client component: Approve (→ `approved`) and Flag for revision (→ `draft`) actions
- Approve/Flag buttons shown below each content piece body on the story detail page
- Approved content shows a green "Approved" pill with Undo link

**Feature #4 — In-app progress feedback**
- `StoryProgressBar` component: horizontal 6-step pipeline stepper; completed steps show checkmark, current step highlighted in blue, future steps muted
- Pipeline stepper shown at the top of each story detail page
- Project page stat row: "Delivery progress" bar with `X of Y delivered · N%` — updates every 5 seconds via existing polling

**Feature #5 — User guide / help**
- `/help` page added with four sections: how it works (6-step pipeline), getting started (5-step onboarding), FAQs (7 questions), quick links
- Help nav item added to the sidebar

### Pending
- Run SQL migrations `cs-003` and `cs-004` in Supabase dashboard
- Set env vars in Vercel: `RESEND_API_KEY`, `STORIES_EMAIL_FROM`, `NEXT_PUBLIC_APP_URL`

---

## 2026-03-28 — Documentation overhaul

Replaced 8 old docs with a consistent 4-file framework (CLAUDE.md, README.md, docs/PRD.md, docs/progress.md). All old docs moved to `docs/archive/`.

---

## Current Status (as of 2026-03-31)

Canopy Stories is live at `https://canopy-stories.vercel.app` and in beta. The full MVP workflow is built: intake forms → AI content generation → video generation → package delivery. The product is connected to the shared Supabase project, launched from the Canopy portal through a one-time launch exchange, and now resolves workspace context from a server-backed app session endpoint.

## What Was Recently Completed

- Full product rebuilt from the Replit reference implementation into a production Next.js app
- Connected to shared Supabase project with workspace-scoped data model
- AI pipeline (OpenAI) generating all content types on form submission with per-story-type system prompts and per-channel format guidance
- Creatomate integration for 15-second vertical video and 1:1 highlight card image generation
- Public intake form experience (no auth required for subjects)
- Package assembly and delivery with shareable download links
- Canopy portal launch integration hardened to a one-time handoff exchange
- Server-authenticated workspace access enforced across the main Stories APIs
- All predefined intake form templates implemented (ESL, CTE, Staff, Program Overview, Employer, Partner)
- Regenerate story — staff can re-run full AI pipeline on any existing story
- Markdown rendering for blog posts, press releases, and newsletter content in package and story detail views

## Open Items

### High priority
- **Beta stabilization** — review error handling in the AI pipeline; `ai_processing` failures need clear recovery paths

### Medium priority
- **Automated email delivery of form links** — currently staff copies and pastes the link manually; auto-send to subject is a planned improvement
- **Branded video** — Creatomate templates use plain branding; school logo and colors can be added to templates per workspace

### Low priority / future
- Cross-product push to Canopy Community and Canopy Reach
- PhotoVault integration for uploaded photo storage
- Story performance analytics (Canopy Insights)
- SQL migration files in `docs/sql/` should eventually move to `supabase/migrations/`

## Architecture Decisions (Locked)

- Product fully separate from `canopy-platform` — no product workflow code in the portal
- All data scoped by `workspace_id` at the table level
- Protected Stories APIs require authenticated server-side workspace access before using service-role data access
- Public form submissions require no auth — the form link IS the access mechanism
- `lib/stories-data.ts` is the only place Supabase is called — components don't write raw queries
- `@canopy/ui` vendored into `vendor/` so the product can evolve independently of the platform package
- Replit reference implementation archived in `canopy-platform/docs/archive/references/`
