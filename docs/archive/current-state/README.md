# Canopy Stories Current State

Date: 2026-03-27

This is the fastest entry point for understanding what this repo is for today.

Read these in order:

1. `../replit-migration-checklist.md`
2. `../product-overview.md`
3. `../architecture.md`
4. `../data-model-migration-plan.md`
5. `../integration-with-canopy.md`
6. `../setup-and-provisioning.md`
7. `../migration-from-reference.md`

## Current Reality

- `canopy-stories` is a new product repo and planning home
- PhotoVault is the UI and interaction standard for the Stories app shell and product surfaces
- the current implementation reference is in:
  - `/Users/zylstra/Code/canopy-platform/references/replit/success-story-engine`
- Canopy platform is already live enough to provide:
  - auth entry
  - workspace context
  - entitlements
  - provisioning
  - invitations
  - cross-product launch

## Current Goal

Turn Canopy Stories into the second connected product without:

- moving product workflows into `canopy-platform`
- drifting away from the mature Replit product without an explicit reason
- overcomplicating Canopy provisioning before the product contract is clear
