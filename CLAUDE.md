# Canopy Stories — Agent Guide

Canopy Stories is the AI-powered success story production product in the Canopy platform. It is a **standalone Next.js app** — not embedded in the portal. Users launch it from the Canopy portal and it receives workspace context via the Canopy handoff protocol.

Read `README.md` for current implementation status. Read `docs/PRD.md` for full product scope.

## Repos

| Repo | Purpose |
|---|---|
| `canopy-stories` | This repo — Canopy Stories product |
| `canopy-platform` | Portal, identity, entitlements, provisioning, launch |
| `photovault` | PhotoVault by Canopy product |

All three repos share one Supabase project.

## Tech Stack

- **Framework**: Next.js 15 (App Router), React 19, TypeScript, Node 20
- **Styling**: Tailwind CSS v4
- **Auth/DB**: Supabase (shared project with canopy-platform and photovault)
- **AI**: OpenAI (content generation — blog, social, newsletter, press release)
- **Video**: JSON2Video API (15-second short-form video generation)
- **Design system**: `@canopy/ui` (vendored into `vendor/`)
- **Deployment**: Vercel

## App Structure

```
canopy-stories/
  app/                  — Next.js App Router pages and API routes
  lib/                  — Data layer, domain types, automation
  vendor/               — @canopy/ui (vendored copy of shared UI)
  docs/                 — Product docs
```

## Key Source Files

| File | Purpose |
|---|---|
| `lib/stories-schema.ts` | All TypeScript types and enums for the product domain |
| `lib/stories-data.ts` | All data operations — Supabase reads/writes, server functions |
| `lib/stories-automation.ts` | AI pipeline — OpenAI content generation + video generation |
| `lib/stories-domain.ts` | Domain helpers and sample/seed data |
| `lib/reference-form-templates.ts` | Predefined intake form templates per story type |
| `lib/supabase-client.ts` | Supabase client singleton (lazy-loaded) |
| `app/_components/stories-shell.tsx` | Main app shell — nav bar, workspace switcher, layout |
| `app/layout.tsx` | Root layout |

## Routes

### Pages
| Route | Description |
|---|---|
| `/` | Dashboard — pipeline overview and metrics |
| `/projects` | Projects list |
| `/projects/[id]` | Project detail |
| `/stories` | Stories library |
| `/stories/[id]` | Story detail with content and assets |
| `/stories/create` | Manual story creation |
| `/forms` | Forms list |
| `/forms/[id]` | Form detail + public intake form experience |
| `/assets` | Asset library |
| `/package/[id]` | Package detail and delivery |
| `/settings` | Product settings |

### API Routes
| Route | Description |
|---|---|
| `GET/POST /api/projects` | List / create projects |
| `GET/PATCH/DELETE /api/projects/[id]` | Project operations |
| `GET/POST /api/forms` | List / create forms |
| `GET /api/forms/[id]` | Get form |
| `POST /api/forms/[id]/submit` | Public form submission (no auth required) |
| `POST /api/forms/create-from-template` | Create form from predefined template |
| `GET/POST /api/stories` | List / create stories |
| `GET /api/stories/[id]` | Story detail |
| `POST /api/stories/create` | Manual story creation |
| `GET/POST /api/content` | Content item operations |
| `GET/POST /api/assets` | Asset operations |
| `GET/POST /api/packages` | Package operations |
| `GET /api/packages/[id]` | Package detail |
| `GET /api/organizations` | Workspace context lookup |
| `POST /api/upload` | Public-form image upload — returns signed preview + private storage ref |

## Data Model (Supabase Tables — Product-Owned)

All tables are scoped by `workspace_id`.

| Table | Purpose |
|---|---|
| `story_projects` | Project groupings (a school's story campaign) |
| `story_forms` | Intake form definitions per project |
| `story_submissions` | Raw form submission data from subjects |
| `story_records` | Core story entity — tracks pipeline stage |
| `story_content_items` | AI-generated content (blog, social, newsletter, press release) |
| `story_assets` | Generated images, graphics, video |
| `story_packages` | Bundled deliverables for download/sharing |

**Shared table reference**: `organizations` (from canopy-platform's Supabase project — used for workspace context)

## Domain Types (from `stories-schema.ts`)

```typescript
StoryType: "ESL" | "HSD_GED" | "CTE" | "EMPLOYER" | "STAFF" | "PARTNER" | "OVERVIEW"

StoryPipelineStage:
  "form_sent" → "submitted" → "ai_processing" → "asset_generation" → "packaging" → "delivered"

StoryContentChannel: "blog" | "newsletter" | "social" | "press_release" | "email"

StoryAssetType: "image" | "graphic" | "video" | "document"
```

## Canopy Platform Integration

**Product key**: `stories_canopy`

**Launch flow**:
1. User signs in through Canopy portal
2. Portal checks `stories_canopy` entitlement for active workspace
3. Portal creates a short-lived single-use launch handoff and redirects to `/auth/launch/stories`
4. Canopy Stories exchanges the handoff code through `/api/auth/exchange-handoff` before setting the Supabase session
5. Stories resolves workspace context from `/api/app-session`, verifies session and membership, and applies `?workspace=<slug>` when present
6. User lands on Stories dashboard in correct workspace context

**Switcher flow**:
- in-app product switching submits back to Portal through `POST /auth/product-launch`
- returning to Portal submits through `POST /auth/portal-return`
- Portal restores its own cookies and issues the next redirect using `303` semantics so the destination app receives a normal `GET`

**Environment variable for portal URL**: `NEXT_PUBLIC_PORTAL_URL` (default: `https://usecanopy.school`)

## AI Pipeline

When a form is submitted:
1. `story_submissions` row created
2. `createStoryFromSubmission()` creates a `story_records` row
3. `buildStoryArtifacts()` in `stories-automation.ts` runs the pipeline:
   - Extracts story background from submission data
   - Calls OpenAI to generate: blog post, newsletter feature, social posts (4 platforms), press release
   - Calls JSON2Video API for 15-second vertical video
   - Creates `story_content_items` and `story_assets` rows
   - Creates `story_packages` row with download bundle
   - Submission photos persist as storage refs and are signed when the app reads them back

## Architecture Rules

**This repo owns:**
- Story projects, forms, submissions, records, content, assets, packages
- Intake form templates and form builder
- AI content generation pipeline
- Video generation pipeline
- Package creation and delivery
- Product-specific settings

**This repo does NOT own:**
- User identity or authentication (that's Canopy portal)
- Workspace creation or membership (that's Canopy portal)
- Product entitlements (that's Canopy portal)
- PhotoVault asset storage (that's PhotoVault)

**Rules for working here:**
- All data queries must be scoped by `workspace_id`
- Do not re-implement auth or workspace management — consume it from the Canopy handoff
- Use `lib/stories-data.ts` as the data access layer; do not write raw Supabase calls in components
- Use `@canopy/ui` components (from `vendor/`) for shell and common UI
- The public intake form (`/forms/[id]`) requires NO auth — subjects fill it out without logging in
- Public-form photo uploads should persist private storage refs, not permanent public bucket URLs

## Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
DATABASE_URL=
OPENAI_API_KEY=
VIDEO_API_KEY=
VIDEO_API_PROVIDER=json2video
NEXT_PUBLIC_PORTAL_URL=https://usecanopy.school
```
