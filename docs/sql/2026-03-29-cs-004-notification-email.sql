-- Add notification email to workspace API key settings.
-- This is the address that receives package-ready notifications.

alter table public.workspace_api_keys
  add column if not exists notification_email text;
