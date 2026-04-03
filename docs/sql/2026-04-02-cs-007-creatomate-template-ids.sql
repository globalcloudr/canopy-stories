-- Add Creatomate template IDs to workspace API key storage.
-- video_template_id — the school's 15-second vertical story video template
-- image_template_id — the school's 1:1 highlight card image template
-- Both are optional. If not set, the corresponding asset type is skipped.

alter table public.workspace_api_keys
  add column if not exists video_template_id text,
  add column if not exists image_template_id text;
