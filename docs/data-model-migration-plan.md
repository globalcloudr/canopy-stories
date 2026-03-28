# Canopy Stories Data Model Migration Plan

Date: 2026-03-28

## Purpose

This document translates the mature Replit reference app into a Canopy-native product data model for `canopy-stories`.

Reference source:

- `/Users/zylstra/Code/canopy-platform/references/replit/success-story-engine`

The goal is not to recreate the reference stack exactly. The goal is to preserve the working product model while adapting it to:

- Canopy-owned identity
- Canopy-owned workspace context
- Canopy-owned entitlement and launch
- Stories-owned product workflows

## What The Reference App Already Proves

From the reference schema, routes, and pages, the product already has a real workflow for:

- projects
- forms
- submissions
- stories
- content
- assets
- packages
- public intake
- automation pipeline

Primary source files:

- [shared/schema.ts](/Users/zylstra/Code/canopy-platform/references/replit/success-story-engine/shared/schema.ts)
- [server/routes.ts](/Users/zylstra/Code/canopy-platform/references/replit/success-story-engine/server/routes.ts)
- [replit.md](/Users/zylstra/Code/canopy-platform/references/replit/success-story-engine/replit.md)

That means the migration should start from the product model that already works, not from a blank app scaffold.

## Top-Level Adaptation Rule

Do **not** migrate these reference tables directly:

- `users`
- `clients`

Reason:

- Canopy already owns identity, authentication, and memberships
- Canopy already owns the customer-account boundary through `workspace`

So the Stories product should use:

- Canopy session/auth
- Canopy workspace context
- `workspace_id` as the top-level product boundary

## Source Of Truth Matrix

Canopy owns:

- user identity
- memberships
- platform roles
- workspace selection before launch
- product entitlements

Canopy Stories owns:

- projects
- forms
- submissions
- stories
- generated content
- product assets
- packages
- product-side setup and operational state

## Reference Table Mapping

### Replace

`users`

- Do not recreate locally.
- Use Canopy auth/session identity.

`clients`

- Do not recreate as a separate account model.
- Use Canopy workspace context instead.

### Keep And Adapt

`projects`

- Add `workspace_id`
- Remove dependency on `client_id`
- Keep name, description, status, counts, deadlines, created/updated timestamps

`forms`

- Keep relationship to project
- Keep title, description, story type, fields, active state
- Keep public/shareable link concept

`submissions`

- Keep relationship to form and project
- Keep submitter metadata, structured form data, photos, status, submitted timestamp

`stories`

- Keep relationship to project and optional submission
- Keep title, subject, story type, status, pipeline stage, source data, error state

`content`

- Keep relationship to story
- Keep channel, content type, title, body, status, metadata, generated timestamp

`assets`

- Keep relationship to story
- Keep type, file details, platform, dimensions, status, metadata

`packages`

- Keep relationship to project and optional story
- Keep package URL, status, shareable link, expiry, download count

## Recommended Product Tables

The clean Canopy Stories model should start with these product-owned tables:

- `story_projects`
- `story_forms`
- `story_submissions`
- `story_records`
- `story_content_items`
- `story_assets`
- `story_packages`

Notes:

- Table naming can stay simpler if you prefer, but prefixing helps avoid collisions in a shared database.
- Every top-level product query should be constrained by `workspace_id`.

## Recommended First-Pass Fields

### `story_projects`

- `id`
- `workspace_id`
- `name`
- `description`
- `status`
- `story_count_target`
- `deadline_at`
- `created_at`
- `updated_at`

### `story_forms`

- `id`
- `workspace_id`
- `project_id`
- `title`
- `description`
- `story_type`
- `fields_json`
- `public_slug`
- `is_active`
- `created_at`
- `updated_at`

### `story_submissions`

- `id`
- `workspace_id`
- `project_id`
- `form_id`
- `submitter_name`
- `submitter_email`
- `submission_data_json`
- `photo_urls`
- `status`
- `submitted_at`

### `story_records`

- `id`
- `workspace_id`
- `project_id`
- `submission_id`
- `title`
- `story_type`
- `subject_name`
- `status`
- `current_stage`
- `source_data_json`
- `error_message`
- `created_at`
- `updated_at`

### `story_content_items`

- `id`
- `workspace_id`
- `story_id`
- `channel`
- `content_type`
- `title`
- `body`
- `status`
- `metadata_json`
- `generated_at`

### `story_assets`

- `id`
- `workspace_id`
- `story_id`
- `asset_type`
- `file_name`
- `file_url`
- `platform`
- `dimensions`
- `file_size`
- `status`
- `metadata_json`
- `created_at`

### `story_packages`

- `id`
- `workspace_id`
- `project_id`
- `story_id`
- `name`
- `description`
- `status`
- `package_url`
- `download_count`
- `shareable_link`
- `expires_at`
- `created_at`

## Migration Order

### Phase 1: Product Schema

Define the Canopy-native Stories schema first.

Deliverables:

- product tables
- type definitions
- workspace-aware query assumptions

Do not start with automation or video generation.

### Phase 2: Public Intake Loop

Bring over the most proven working loop:

1. public form
2. submission save
3. create story record from submission

This is the first true product loop that should work in `canopy-stories`.

### Phase 3: Operator Product Surfaces

Port these in order:

1. Projects
2. Forms
3. Submissions / Stories list
4. Story detail

Keep the existing PhotoVault-style shell standard while doing this.

### Phase 4: Asset And Package Flow

After the data loop is stable:

- asset uploads
- asset tracking
- package creation
- public package access

### Phase 5: Automation And AI

Migrate last:

- automation pipeline
- content generation
- video generation

These are the most integration-heavy pieces and should come after the product data model is stable.

## What Not To Port Directly

Re-evaluate before copying:

- Express runtime structure
- Neon-specific assumptions
- Drizzle-specific patterns if they fight the target stack
- Replit object storage assumptions
- local auth model
- any UI assumptions that conflict with the PhotoVault standard

## Smallest Safe Next Build Step

The next implementation step should be:

1. create the real Stories schema/types in this repo
2. wire one public form to real submission persistence
3. create one operator-facing submissions/stories view

That gives `canopy-stories` a real working product loop while staying aligned with Canopy architecture.
