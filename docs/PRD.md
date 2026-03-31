# Canopy Stories — Product Requirements

## What Canopy Stories Is

Canopy Stories automates success story production for adult education schools. A student fills out an intake form, and within minutes the school has a complete content package: blog post, social media posts, newsletter feature, press release, and a 15-second video.

This replaces a manual production workflow (interviews → writing → formatting → delivery) that previously took days. The product competes directly with traditional success story services like N&R Publications.

## Who Uses It

**School staff** — initiate story requests, review AI-generated content, download and publish packages

**Story subjects** (students, staff, employers, partners) — fill out public intake forms with no login required

**Canopy operators** — manage story production on behalf of schools as a managed service

## Story Types

| Type | Description |
|---|---|
| ESL | English language learner success stories |
| HSD/GED | High school equivalency graduate stories |
| CTE | Career and technical education outcomes |
| Employer | Employer partnership and hiring outcomes |
| Staff | Instructor and program coordinator features |
| Partner | Community partner spotlights |
| Program Overview | General awareness and enrollment content |

## Core Workflow

1. Staff starts a story request — selects story type, enters subject's name and email
2. System generates a shareable intake form link using the matching template
3. Staff sends the link to the subject (or Canopy sends it as a managed service)
4. Subject fills out the form on any device — no login required — and optionally uploads a photo
5. AI pipeline generates all content within minutes
6. Staff reviews, edits if needed, approves
7. Package assembled and available for download
8. Staff publishes content directly or hands off to their team

## Content Generated Per Story

- **Blog post** (500–800 words) — fully written, publication-ready
- **Social media posts** — platform-specific versions for Facebook, Instagram, LinkedIn, X
- **Newsletter feature** (200–300 words) — formatted for direct use in newsletters
- **Press release** (400–600 words) — formatted for media distribution
- **15-second short-form video** — vertical format (9:16), dynamic text overlays, photo-based

## MVP Scope

### In Scope (Built)

- Story project creation and management
- Intake form templates (one per story type)
- Form builder (create/edit custom forms)
- Public shareable form links with photo upload
- AI content generation (OpenAI) for all channels
- 15-second video generation (JSON2Video)
- Content review and editing before packaging
- Content package download (all formats)
- Pipeline status tracking
- Asset library
- Platform dashboard with pipeline overview
- Canopy platform integration (workspace context, entitlements, launch exchange)

### Out of Scope (Not Yet Built)

- Automated email delivery of form links to subjects
- Direct push to Canopy Community (newsletter) or Canopy Reach (social)
- Branded video with school logo and colors
- Consent and release management system
- Story performance analytics (Canopy Insights)
- Multi-language support
- Public-facing story showcase or archive

## Delivery Modes

**Self-serve**: School staff manage their own story production in the Canopy Stories product.

**Managed service**: Canopy staff manage story production on behalf of the school. Canopy operators have backstage access to any workspace's story pipeline. Visible in the portal as a service offering (`communications_support`).

## Platform Integration

- **Product key**: `stories_canopy`
- **Launch**: Canopy portal → `/auth/launch/stories` → one-time launch code exchange in Stories
- **Workspace context**: Resolved inside Stories from a server-backed app session endpoint, seeded by `?workspace=` from Portal
- **Portal URL env var**: `NEXT_PUBLIC_PORTAL_URL`

Cross-product integrations (planned, not yet built):
- **Canopy Community** — newsletter feature content pushed directly into newsletter composer
- **Canopy Reach** — social posts pushed directly into social scheduler
- **PhotoVault** — uploaded photos stored as approved brand assets
- **Canopy Website** — blog posts published directly to school website
