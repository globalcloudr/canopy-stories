# Canopy Stories

AI-powered success story production product for the Canopy platform.

**Live URL**: https://canopy-stories.vercel.app
**Status**: Beta

## What Is Built and Live

### Core Workflow

- **Projects** — schools organize story production into projects with targets and deadlines
- **Guided project creation** — 3-step wizard: create project → pick intake form template → get shareable link with next-steps guide
- **Starter template gallery** — browse all available intake form templates from the Forms page, use one in an existing project, or start a new project directly from a template
- **Form builder** — create intake forms from predefined templates (ESL, CTE, Staff, Program Overview, Employer, Partner) or custom fields; existing forms editable via Customize button on the project Forms tab
- **Public intake forms** — shareable links; subjects fill out forms with no login required; photo upload supported through private per-workspace `story-photos` storage paths with signed preview/download URLs
- **Project workflow tabs** — project detail now follows the school workflow: Overview, Forms, Responses, Stories, Assets
- **Form response tracking** — per-form submission counts shown in the project Forms tab, with a dedicated project Responses tab that aggregates replies across all forms in the project
- **AI content generation** — on form submission, OpenAI generates: blog post, newsletter feature, social posts (Facebook, Instagram, LinkedIn, X), press release
- **Video generation** — 15-second vertical short-form video via Creatomate (default); JSON2Video supported as legacy provider
- **Highlight card** — 1:1 social share graphic generated alongside the video from a separate Creatomate image template
- **Regenerate story** — staff can re-run the full AI pipeline on any existing story to replace all content and assets with a fresh generation
- **Asset library** — generated images, graphics, and video stored and browsable
- **Content review** — staff can approve or flag each AI-generated content piece before packaging
- **Package delivery** — all content bundled into a downloadable package with shareable link
- **Pipeline tracking** — stories move through stages: form_sent → submitted → ai_processing → asset_generation → packaging → delivered; visual stepper shown on each story detail page
- **Project delivery progress** — progress bar on the project page shows delivered vs. story goal
- **Package ready notifications** — email sent to a configured address when a story package is ready (via Resend)
- **State-aware project overview** — empty projects show a next-step setup panel with share actions instead of an empty workflow board; active projects switch to the workflow board automatically once stories exist
- **Dashboard** — overview metrics, dismissible quick-start guidance, and refreshed success-story messaging on the home page
- **Help / user guide** — in-app guide covering workflow, setup, and FAQs at `/help`

### API Keys (Per Workspace)

Each school workspace adds its own API keys in Settings:

- **OpenAI API key** — powers all content generation (required; pipeline produces plain-text fallback if not set)
- **Video generation API key** — Creatomate API key (optional; skipped if not set)
- **Video provider** — `creatomate` (default) or `json2video` (legacy)
- **Video template ID** — Creatomate template ID for 15-second vertical story video (variables: Name, Highlight 1, Highlight 2, Highlight 3, Photo)
- **Highlight card template ID** — Creatomate template ID for 1:1 social share card (variables: Name, Quote, Photo)
- **Package ready notification email** — address that receives delivery notifications

> Each workspace's pipeline runs exclusively with that workspace's own keys. No shared or system-level API keys are used.

### Platform Integration

- Launched from Canopy portal via `/auth/launch/stories` one-time handoff exchange
- Workspace context resolved from a server-backed app session endpoint — no separate login required once signed into Canopy
- Product key: `stories_canopy`
- Main Stories APIs now enforce authenticated workspace access server-side
- In-app product switching and Portal return route back through Portal handoff endpoints so cross-product navigation restores the correct workspace/session state
- Stories now filters in-app workspace options to schools where `stories_canopy` is actually enabled
- Internal Stories navigation preserves `?workspace=<slug>` for platform operators so dashboard, projects, stories, forms, submissions, assets, and detail pages stay in the selected school
- Submission photos now persist as private storage refs and are signed on read; older public bucket URLs are still supported during the transition

### UI Foundation

- `@globalcloudr/canopy-ui` v0.2.9 — the shared Canopy design system installed from npm across all products
- Design tokens: `--ink`, `--ink-2`, `--faint`, `--text-muted`, `--foreground`, `--surface`, `--surface-muted`, `--accent`, `--rule`, `--border` — replacing all hardcoded hex colors
- Per-product accent colors via `.product-stories` class; Stories accent is brand-aligned
- Stories consumes the shared shell frame from `@canopy/ui` for the outer app layout (`AppShellFrame`, `AppShellSidebar`, `AppShellContent`)
- Core Canopy app fonts (Plus Jakarta Sans, Maven Pro, Source Serif 4) are now owned by `@canopy/ui` via `canopyFontVariables`
- All product sidebars now structurally identical: `AppSidebarPanel`, `AppSidebarSection`, `border-l-2` left-border nav indicators

## What Is Not Done Yet

- Automated email delivery of form links (staff copies and sends the link manually at MVP)
- Direct push to Canopy Community or Canopy Reach (cross-product handoff planned)
- Branded video with school-specific logo and colors (plain branding at MVP)
- Consent and release management beyond basic acknowledgment
- Analytics dashboard for story performance (future: Canopy Insights)
- Multi-language form and content support

## How to Run

```bash
npm install
npm run dev     # runs at localhost:3001 (to avoid conflict with canopy-platform on 3000)
```

## Environment Variables

Create `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
DATABASE_URL=
NEXT_PUBLIC_PORTAL_URL=https://app.usecanopy.school

# Email notifications (optional — silent fallback if not set)
RESEND_API_KEY=
STORIES_EMAIL_FROM=Canopy Stories <notifications@usecanopy.school>
NEXT_PUBLIC_APP_URL=https://canopy-stories.vercel.app
```

> **Note**: OpenAI and video API keys are stored per-workspace in the `workspace_api_keys` table (Settings page), not in environment variables.

## Database

Shared Supabase project with canopy-platform, photovault, and canopy-reach.

Product-owned tables: `story_projects`, `story_forms`, `story_submissions`, `story_records`, `story_content`, `story_assets`, `story_packages`, `workspace_api_keys`

Migration SQL files are in `docs/sql/`.

## Storage Notes

- Public form uploads write into the `story-photos` bucket under `{workspaceId}/...`
- New uploads are stored as private storage refs, not permanent public URLs
- Stories signs asset URLs on read for story detail, package, and asset-library surfaces
- Older `story-photos` public URLs remain readable in-app during the migration period
