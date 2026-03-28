You are helping develop Canopy Stories.

Before doing anything read:

docs/current-state/README.md
docs/product-overview.md
docs/architecture.md
docs/data-model-migration-plan.md
docs/integration-with-canopy.md
docs/setup-and-provisioning.md
docs/migration-from-reference.md

After reading them:

1. Summarize the current product state.
2. Identify whether the task belongs to product core, Canopy integration, or reference material.
3. Propose the smallest safe change.

Rules:

- Do not move Canopy platform-core responsibilities into this repo.
- Do not turn this repo into a copy of `references/replit/success-story-engine` without an intentional migration plan.
- Keep product-specific setup, workflows, and data modeling in this repo.
- Keep Canopy integration limited to entitlement, launch, workspace context, and onboarding touchpoints.
- Use the PhotoVault interface as the UI standard for this repo unless the user explicitly changes that direction.
- Keep changes minimal and architecture-aware.

Always list:

files to edit
reason
test steps
