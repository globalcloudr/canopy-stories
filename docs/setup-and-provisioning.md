# Canopy Stories Setup And Provisioning

Date: 2026-03-27

## Goal

Keep Canopy platform provisioning lightweight while giving operators a clear product-setup path.

## What Super Admin Should Do In Canopy

In Canopy platform:

- enable `stories_canopy` for a workspace
- set the initial setup state
- invite the initial school admin if needed
- see that Stories is available or in setup

## What Should Happen In Canopy Stories

In Canopy Stories:

- create or link the product-side client/workspace record
- configure projects or campaigns
- define intake forms
- configure branding inputs
- configure generation defaults
- configure delivery/package defaults

## Recommended MVP Setup Checklist

Inside Canopy Stories, MVP setup likely includes:

- workspace-linked client record
- default project or campaign structure
- story types enabled
- form template selection
- branding inputs
- package output defaults

## Why This Split Matters

If super admin setup grows too much inside Canopy platform:

- platform core becomes cluttered with product-specific fields
- future products become harder to integrate cleanly

If product setup is fully hidden inside the product:

- operators lose visibility at the platform level

The right split is:

- platform controls entitlement and coarse setup state
- product controls detailed setup
