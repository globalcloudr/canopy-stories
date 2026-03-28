# Canopy Stories Integration With Canopy Platform

Date: 2026-03-27

## Product Key

Recommended Canopy product key:

- `stories_canopy`

## What Canopy Platform Should Own

Canopy should own:

- entitlement state for `stories_canopy`
- launch visibility in the portal
- workspace selection before launch
- invitation and membership setup
- high-level setup status such as:
  - `not_started`
  - `in_setup`
  - `ready`
  - `blocked`

## What Canopy Stories Should Own

Canopy Stories should own:

- product-specific onboarding steps
- form templates
- client/project setup
- AI configuration
- video generation settings
- package and delivery logic

## Launch Contract

Recommended product launch flow:

1. user signs in through Canopy
2. Canopy resolves active workspace
3. Canopy checks `stories_canopy` entitlement
4. Canopy launches Canopy Stories with explicit workspace context
5. Canopy Stories verifies session and workspace access

## Provisioning Contract

Canopy provisioning should only create or update:

- workspace-level entitlement for `stories_canopy`
- optional high-level setup state
- optional lightweight notes for operator visibility

Detailed product setup should happen inside Canopy Stories.

## Setup State Recommendation

Use the portal to show whether the product is:

- entitled
- still in setup
- ready to launch

Do not store deep product setup fields in `canopy-platform` unless they are truly shared platform concerns.
