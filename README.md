# Canopy Stories

AI-powered success story production product for the Canopy platform.

**Live URL**: https://canopy-stories.vercel.app
**Status**: Beta

## What Is Built and Live

### Core Workflow

- **Projects** — schools organize story production into projects with targets and deadlines
- **Form builder** — create intake forms from predefined templates (ESL, CTE, Staff, Program Overview, Employer, Partner) or custom fields
- **Public intake forms** — shareable links; subjects fill out forms with no login required; photo upload supported
- **Form response tracking** — per-form submission counts shown in project forms tab; expandable inline response list per form
- **AI content generation** — on form submission, OpenAI generates: blog post, newsletter feature, social posts (Facebook, Instagram, LinkedIn, X), press release
- **Video generation** — 15-second vertical short-form video via JSON2Video or Creatomate API
- **Asset library** — generated images, graphics, and video stored and browsable
- **Content review** — staff can approve or flag each AI-generated content piece before packaging
- **Package delivery** — all content bundled into a downloadable package with shareable link
- **Pipeline tracking** — stories move through stages: form_sent → submitted → ai_processing → asset_generation → packaging → delivered; visual stepper shown on each story detail page
- **Project delivery progress** — progress bar on the project page shows delivered vs. story goal
- **Package ready notifications** — email sent to a configured address when a story package is ready (via Resend)
- **Dashboard** — overview metrics and pipeline status
- **Help / user guide** — in-app guide covering workflow, setup, and FAQs at `/help`

### API Keys (Per Workspace)

Each school workspace adds its own API keys in Settings:

- **OpenAI API key** — powers all content generation
- **Video generation API key** — supports JSON2Video and Creatomate
- **Package ready notification email** — address that receives delivery notifications

### Platform Integration

- Launched from Canopy portal via `/auth/launch/stories` token handoff
- Workspace context received from Canopy — no separate login required once signed into Canopy
- Product key: `stories_canopy`

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
NEXT_PUBLIC_PORTAL_URL=https://usecanopy.school

# Email notifications (optional — silent fallback if not set)
RESEND_API_KEY=
STORIES_EMAIL_FROM=Canopy Stories <notifications@usecanopy.school>
NEXT_PUBLIC_APP_URL=https://canopy-stories.vercel.app
```

> **Note**: OpenAI and video API keys are now stored per-workspace in the database (Settings page), not in environment variables. The env-level `OPENAI_API_KEY` and `VIDEO_API_KEY` are only used as system-level fallbacks.

## Database

Shared Supabase project with canopy-platform and photovault.

Product-owned tables: `story_projects`, `story_forms`, `story_submissions`, `story_records`, `story_content`, `story_assets`, `story_packages`, `workspace_api_keys`

Migration SQL files are in `docs/sql/`.
