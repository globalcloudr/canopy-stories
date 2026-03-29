# Canopy Stories Architecture

Date: 2026-03-27

## Recommended Near-Term Shape

Build Canopy Stories as its own product application with:

- its own repo
- its own product codebase
- its own product-specific runtime and deployment
- a clear Canopy integration contract

## Product Layers

### 1. Product Shell

Responsibilities:

- story workspace UI
- project navigation
- operator and client-facing product screens

### 2. Workflow Engine

Responsibilities:

- project creation
- form management
- submission intake
- pipeline stage transitions

### 3. Generation Layer

Responsibilities:

- AI content generation
- asset generation
- video generation
- package assembly

### 4. Delivery Layer

Responsibilities:

- package viewing
- package download
- future handoff to other products such as Community, Reach, or Publish

## Data Ownership

Canopy Stories should own product-specific tables for:

- projects
- forms
- submissions
- stories
- content artifacts
- assets
- packages

Canopy platform should continue to own:

- identity
- memberships
- entitlements
- product launch eligibility

## Reference Schema Adaptation

The Replit reference includes two top-level concepts that should not come into Canopy Stories as-is:

- `users`
- `clients`

Reason:

- Canopy already owns identity and authentication
- Canopy already owns workspace and account context

So the product-side adaptation should be:

- use Canopy auth and session context
- use `workspace_id` from Canopy as the top-level product boundary
- start product-owned schema from `projects` downward

Recommended product-owned model:

- `projects`
  - belongs to `workspace_id`
- `forms`
  - belongs to a project
- `submissions`
  - belongs to a form and project
- `stories`
  - belongs to a project and optionally a submission
- `content`
  - belongs to a story
- `assets`
  - belongs to a story
- `packages`
  - belongs to a project and optionally a story

## Recommended Bias

Near term, prefer:

- a clean product contract with Canopy
- explicit launch and workspace context
- minimal required provisioning metadata in Canopy

Avoid:

- coupling product schema directly into `canopy-platform`
- storing deep product configuration in platform tables
