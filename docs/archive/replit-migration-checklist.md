# Replit Migration Checklist

Date: 2026-03-28

## Purpose

This document corrects drift between the mature Replit Stories app and the current `canopy-stories` implementation.

Going forward, the Replit app should be treated as the product source of truth for:

- page structure
- operator workflows
- automation pipeline behavior
- AI generation behavior
- video generation behavior
- settings and operational surfaces

Canopy adaptation should be limited to:

- Canopy workspace context replacing `clients`
- Canopy/Supabase auth replacing the Replit auth model
- shared Supabase persistence replacing Replit/Neon-specific storage where needed

## Source Of Truth

Reference app:

- `/Users/zylstra/Code/canopy-platform/references/replit/success-story-engine`

Key reference pages:

- [Dashboard.tsx](/Users/zylstra/Code/canopy-platform/references/replit/success-story-engine/client/src/pages/Dashboard.tsx)
- [Projects.tsx](/Users/zylstra/Code/canopy-platform/references/replit/success-story-engine/client/src/pages/Projects.tsx)
- [ProjectDetail.tsx](/Users/zylstra/Code/canopy-platform/references/replit/success-story-engine/client/src/pages/ProjectDetail.tsx)
- [Stories.tsx](/Users/zylstra/Code/canopy-platform/references/replit/success-story-engine/client/src/pages/Stories.tsx)
- [StoryDetail.tsx](/Users/zylstra/Code/canopy-platform/references/replit/success-story-engine/client/src/pages/StoryDetail.tsx)
- [Assets.tsx](/Users/zylstra/Code/canopy-platform/references/replit/success-story-engine/client/src/pages/Assets.tsx)
- [Settings.tsx](/Users/zylstra/Code/canopy-platform/references/replit/success-story-engine/client/src/pages/Settings.tsx)
- [PublicForm.tsx](/Users/zylstra/Code/canopy-platform/references/replit/success-story-engine/client/src/pages/PublicForm.tsx)
- [PublicPackage.tsx](/Users/zylstra/Code/canopy-platform/references/replit/success-story-engine/client/src/pages/PublicPackage.tsx)

Key reference backend modules:

- [routes.ts](/Users/zylstra/Code/canopy-platform/references/replit/success-story-engine/server/routes.ts)
- [automation.ts](/Users/zylstra/Code/canopy-platform/references/replit/success-story-engine/server/automation.ts)
- [contentGeneration.ts](/Users/zylstra/Code/canopy-platform/references/replit/success-story-engine/server/contentGeneration.ts)
- [videoGeneration.ts](/Users/zylstra/Code/canopy-platform/references/replit/success-story-engine/server/videoGeneration.ts)
- [projectStatus.ts](/Users/zylstra/Code/canopy-platform/references/replit/success-story-engine/server/projectStatus.ts)
- [storage.ts](/Users/zylstra/Code/canopy-platform/references/replit/success-story-engine/server/storage.ts)
- [objectStorage.ts](/Users/zylstra/Code/canopy-platform/references/replit/success-story-engine/server/objectStorage.ts)

## Current Honest Status

Implemented in `canopy-stories`:

- separate product repo
- Canopy-aware data model foundation
- shared Supabase connection
- live `story_projects`, `story_forms`, `story_submissions`, and `story_records`
- public form submission
- linked story record creation
- live overview, projects, forms, submissions, and project detail pages
- reference template promotion into live forms

Not yet implemented from the real product:

- Replit dashboard layout and automation board fidelity
- Replit projects page UX fidelity
- stories library page
- story detail page
- assets page
- settings page
- automatic OpenAI content generation on submission
- automatic video generation on submission
- package creation and delivery flow
- object storage upload flow parity
- project status computation parity

## Non-Negotiable Product Rules

1. Do not redesign product behavior if the Replit app already solved it.
2. Do not invent a new Stories workflow if the Replit page or module already exists.
3. Preserve Canopy-specific integration changes only where required.
4. Migrate page-by-page and module-by-module, not by vague “feature area”.

## Adaptation Rules

Keep from Replit in concept:

- projects
- forms
- submissions
- stories
- content
- assets
- packages
- automation pipeline stages
- OpenAI generation flow
- video generation flow

Replace during migration:

- `clients` -> Canopy `workspace_id`
- Replit user/auth assumptions -> Canopy/Supabase auth
- Replit object-storage specifics only where infra changes require it

## Page Migration Checklist

### 1. Dashboard

Reference:

- [Dashboard.tsx](/Users/zylstra/Code/canopy-platform/references/replit/success-story-engine/client/src/pages/Dashboard.tsx)

Current `canopy-stories` target:

- [page.tsx](/Users/zylstra/Code/canopy-stories/app/page.tsx)

Status:

- partially implemented

What is already done:

- live counts
- overview metrics
- latest project/submission snapshot

What still needs to be aligned:

- stats-card structure closer to Replit
- automation pipeline board
- recent projects section matching the reference app
- “New Project” action pattern

### 2. Projects List

Reference:

- [Projects.tsx](/Users/zylstra/Code/canopy-platform/references/replit/success-story-engine/client/src/pages/Projects.tsx)

Current `canopy-stories` target:

- [page.tsx](/Users/zylstra/Code/canopy-stories/app/projects/page.tsx)

Status:

- partially implemented

What is already done:

- live project list
- real counts
- project detail entry point

What still needs to be aligned:

- search
- status filter
- create-project dialog/workflow
- richer project card parity

### 3. Project Detail

Reference:

- [ProjectDetail.tsx](/Users/zylstra/Code/canopy-platform/references/replit/success-story-engine/client/src/pages/ProjectDetail.tsx)

Current `canopy-stories` target:

- [page.tsx](/Users/zylstra/Code/canopy-stories/app/projects/[id]/page.tsx)

Status:

- early implementation

What is already done:

- forms, submissions, and linked stories for one project

What still needs to be aligned:

- closer layout fidelity
- actions and editing workflow
- package visibility
- richer project summary/state handling

### 4. Public Form

Reference:

- [PublicForm.tsx](/Users/zylstra/Code/canopy-platform/references/replit/success-story-engine/client/src/pages/PublicForm.tsx)

Current `canopy-stories` target:

- [page.tsx](/Users/zylstra/Code/canopy-stories/app/forms/[id]/page.tsx)
- [public-form-experience.tsx](/Users/zylstra/Code/canopy-stories/app/forms/[id]/public-form-experience.tsx)

Status:

- implemented, but simplified

What is already done:

- live form loading
- public submission
- story-record creation

What still needs to be aligned:

- closer field/UI fidelity
- photo upload flow
- success-state fidelity

### 5. Stories Library

Reference:

- [Stories.tsx](/Users/zylstra/Code/canopy-platform/references/replit/success-story-engine/client/src/pages/Stories.tsx)

Current `canopy-stories` target:

- not implemented yet

Status:

- missing

Must include:

- stories index
- search/filter
- project-linked records
- story status/pipeline visibility

### 6. Story Detail

Reference:

- [StoryDetail.tsx](/Users/zylstra/Code/canopy-platform/references/replit/success-story-engine/client/src/pages/StoryDetail.tsx)

Current `canopy-stories` target:

- not implemented yet

Status:

- missing

Must include:

- story summary
- generated content
- video assets
- package link
- source and metadata visibility

### 7. Assets

Reference:

- [Assets.tsx](/Users/zylstra/Code/canopy-platform/references/replit/success-story-engine/client/src/pages/Assets.tsx)

Current `canopy-stories` target:

- not implemented yet

Status:

- missing

Must include:

- asset counts
- video/image/graphic grouping
- search/filter
- generated asset visibility

### 8. Settings

Reference:

- [Settings.tsx](/Users/zylstra/Code/canopy-platform/references/replit/success-story-engine/client/src/pages/Settings.tsx)

Current `canopy-stories` target:

- not implemented yet

Status:

- missing

Must include:

- automation settings
- OpenAI configuration visibility
- video generation configuration visibility
- notification and branding sections where appropriate

### 9. Public Package

Reference:

- [PublicPackage.tsx](/Users/zylstra/Code/canopy-platform/references/replit/success-story-engine/client/src/pages/PublicPackage.tsx)

Current `canopy-stories` target:

- not implemented yet

Status:

- missing

Must include:

- package page
- asset download visibility
- video availability
- package readiness state

## Backend Migration Checklist

### 1. Route Behavior

Reference:

- [routes.ts](/Users/zylstra/Code/canopy-platform/references/replit/success-story-engine/server/routes.ts)

Current `canopy-stories` target:

- route handlers under `app/api/`
- server-side data layer in [stories-data.ts](/Users/zylstra/Code/canopy-stories/lib/stories-data.ts)

Status:

- partial

Already done:

- form creation from template
- public form submission

Missing:

- stories endpoints
- assets endpoints
- package endpoints
- project mutation flows
- upload-related endpoints

### 2. Automation Pipeline

Reference:

- [automation.ts](/Users/zylstra/Code/canopy-platform/references/replit/success-story-engine/server/automation.ts)

Status:

- missing

Required behavior:

- after submission, create story
- trigger content generation
- prepare video script
- attempt video generation
- create content rows
- create asset rows
- create package row
- advance story stage/status

### 3. OpenAI Content Generation

Reference:

- [contentGeneration.ts](/Users/zylstra/Code/canopy-platform/references/replit/success-story-engine/server/contentGeneration.ts)

Status:

- missing

Required behavior:

- generate:
  - blog
  - social posts
  - newsletter
  - press release
- use submission/source data as prompt input
- store outputs in product-owned content tables

### 4. Video Generation

Reference:

- [videoGeneration.ts](/Users/zylstra/Code/canopy-platform/references/replit/success-story-engine/server/videoGeneration.ts)

Status:

- missing

Required behavior:

- create video highlights/script
- generate 15-second vertical video
- support provider configuration
- create video asset rows
- preserve fallback behavior when provider is unavailable

### 5. Project Status Logic

Reference:

- [projectStatus.ts](/Users/zylstra/Code/canopy-platform/references/replit/success-story-engine/server/projectStatus.ts)

Status:

- not migrated

Required behavior:

- compute meaningful project state from forms, submissions, stories, and packages

### 6. Storage Layer

Reference:

- [storage.ts](/Users/zylstra/Code/canopy-platform/references/replit/success-story-engine/server/storage.ts)

Status:

- concept adapted, not fully migrated

Required behavior:

- standard query layer for all Stories entities
- product-wide consistency instead of ad hoc per-page data assembly

### 7. Object Storage / Uploads

Reference:

- [objectStorage.ts](/Users/zylstra/Code/canopy-platform/references/replit/success-story-engine/server/objectStorage.ts)

Status:

- missing

Required behavior:

- public form photo uploads
- durable asset storage
- story asset linkage

## Correction Plan

### Phase 1: Stop Drift

Do next:

1. use this checklist as the migration source of truth
2. stop creating new Stories pages without a corresponding Replit page reference
3. stop inventing alternate product behavior when the Replit app already defines it

### Phase 2: Restore Product Shape

Build in this order:

1. Dashboard fidelity
2. Projects list fidelity
3. Stories page
4. Story detail page
5. Assets page
6. Settings page

### Phase 3: Restore Product Automation

Build in this order:

1. content generation module
2. video generation module
3. automation orchestrator
4. package creation
5. public package view

### Phase 4: Restore Upload And Delivery Flow

Build:

1. photo upload path
2. asset persistence
3. package assembly and download flow

## Immediate Next Engineering Task

The next task should be:

- migrate the Replit dashboard and its automation-board behavior into `canopy-stories`

Why:

- it is the clearest visual/product mismatch today
- it reflects the automation-first identity of the app
- it will force the next implementation work to stay faithful to the source product

## Rule For Future Agents

When working on `canopy-stories`:

1. read this checklist first
2. read the matching Replit page/module before editing
3. preserve product behavior unless Canopy integration explicitly requires adaptation
4. document any intentional deviation from the Replit source before implementing it
