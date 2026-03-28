# Canopy Stories Current State

Date: 2026-03-27

This is the fastest entry point for understanding what this repo is for today.

Read these in order:

1. `../product-overview.md`
2. `../architecture.md`
3. `../data-model-migration-plan.md`
4. `../integration-with-canopy.md`
5. `../setup-and-provisioning.md`
6. `../migration-from-reference.md`

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
- copying the entire reference build blindly
- overcomplicating Canopy provisioning before the product contract is clear
