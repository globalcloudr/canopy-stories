# Canopy Stories

Date: 2026-03-27

Canopy Stories is the success-story production product in the Canopy platform.

It should remain a distinct product repo with its own:

- product workflows
- AI and media pipeline
- operator setup requirements
- deployment/runtime decisions
- product-specific data model

Canopy platform owns:

- sign-in entry
- workspace context
- product entitlements
- provisioning and invitations
- product launch

Canopy Stories owns:

- story intake and submission workflow
- AI content generation
- asset and video generation
- package assembly and delivery
- product-specific setup and operations

## Read First

1. `docs/current-state/README.md`
2. `docs/agent-onboarding.md`
3. `docs/product-overview.md`
4. `docs/integration-with-canopy.md`

## Repo Shape

This repo now includes:

- a minimal Next.js product scaffold in `app/`
- product docs in `docs/`
- an environment example in `.env.example`

This is intentionally a small starting point, not a full migration of the reference build.

## Current Repo Intent

This repo starts as the product planning and migration home for the next connected Canopy product.

Reference implementation source:

- `/Users/zylstra/Code/canopy-platform/references/replit/success-story-engine`

That reference should stay reference-only until pieces are intentionally promoted into active product work.
