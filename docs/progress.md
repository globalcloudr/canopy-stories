# Canopy Stories — Progress and Current Work

Append new sessions at the top. Do not overwrite history.

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
