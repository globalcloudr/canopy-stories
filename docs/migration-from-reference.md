# Migration From Reference Build

Date: 2026-03-27

## Reference Source

Current reference implementation:

- `/Users/zylstra/Code/canopy-platform/references/replit/success-story-engine`

## Current Recommendation

Do not copy the entire reference project into this repo all at once.

Instead:

1. keep the reference build as reference material
2. identify the product concepts and working slices worth promoting
3. migrate intentionally by subsystem

## High-Value Pieces To Reuse First

Likely candidates for early promotion:

- product workflow model
- project and submission lifecycle
- story pipeline stages
- package and deliverable model
- AI generation contract

## Pieces To Re-evaluate Before Promotion

These should be reviewed carefully instead of copied blindly:

- runtime framework choices
- deployment assumptions
- auth model
- storage integrations
- environment variable layout
- any Replit-specific infrastructure assumptions

## Schema Adaptation Notes

The reference schema is valuable, but two parts should be replaced instead of migrated directly:

- `users`
- `clients`

Replace them with:

- Canopy auth and session handling
- Canopy workspace context
- `workspace_id` as the top-level product boundary inside Canopy Stories

Keep and adapt:

- `projects`
- `forms`
- `submissions`
- `stories`
- `content`
- `assets`
- `packages`

Practical rule:

- do not recreate a parallel identity model in this repo
- do not recreate a parallel client/account model if Canopy workspace already provides that boundary
- adapt foreign keys and top-level queries so product data hangs off `workspace_id`

## Safe Migration Order

1. docs and product contract
2. canonical product data model
3. launch/integration contract with Canopy
4. product shell and core workflow
5. AI and asset generation modules
6. package delivery flows

## Rule

Promote only what clearly belongs in the active Canopy Stories product.

Leave exploratory, obsolete, or Replit-specific implementation details in the reference folder unless there is a strong reason to carry them forward.
