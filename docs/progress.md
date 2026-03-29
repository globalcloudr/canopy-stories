# Canopy Stories — Progress and Current Work

Append new sessions at the top. Do not overwrite history.

---

## 2026-03-28 — Documentation overhaul

Replaced 8 old docs with a consistent 4-file framework (CLAUDE.md, README.md, docs/PRD.md, docs/progress.md). All old docs moved to `docs/archive/`.

---

## Current Status (as of 2026-03-28)

Canopy Stories is live at `https://canopy-stories.vercel.app` and in beta. The full MVP workflow is built: intake forms → AI content generation → video generation → package delivery. The product is connected to the shared Supabase project and launched from the Canopy portal.

## What Was Recently Completed

- Full product rebuilt from the Replit reference implementation into a production Next.js app
- Connected to shared Supabase project with workspace-scoped data model
- AI pipeline (OpenAI) generating all content types on form submission
- JSON2Video integration for 15-second video generation
- Public intake form experience (no auth required for subjects)
- Package assembly and delivery with shareable download links
- Canopy portal launch integration (`/auth/launch/stories` token handoff)
- All predefined intake form templates implemented (ESL, CTE, Staff, Program Overview, Employer, Partner)

## Open Items

### High priority
- **Production URL in portal** — `STORIES_APP_URL` in canopy-platform Vercel env needs to be set to `https://canopy-stories.vercel.app` (currently defaults to `localhost:3001`)
- **Beta stabilization** — review error handling in the AI pipeline; `ai_processing` failures need clear recovery paths

### Medium priority
- **Automated email delivery of form links** — currently staff copies and pastes the link manually; auto-send to subject is a planned improvement
- **Branded video** — video generation uses plain branding; school logo and colors integration is planned

### Low priority / future
- Cross-product push to Canopy Community and Canopy Reach
- PhotoVault integration for uploaded photo storage
- Story performance analytics (Canopy Insights)
- SQL migration files in `docs/sql/` should eventually move to `supabase/migrations/`

## Architecture Decisions (Locked)

- Product fully separate from `canopy-platform` — no product workflow code in the portal
- All data scoped by `workspace_id` at the table level
- Public form submissions require no auth — the form link IS the access mechanism
- `lib/stories-data.ts` is the only place Supabase is called — components don't write raw queries
- `@canopy/ui` vendored into `vendor/` so the product can evolve independently of the platform package
- Replit reference implementation archived in `canopy-platform/docs/archive/references/`
