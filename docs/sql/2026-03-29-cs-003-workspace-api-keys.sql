-- Workspace API key storage for client-provided integrations.
-- Each workspace can store their own OpenAI and video generation keys.
-- Keys are stored encrypted-at-rest by Supabase; service role only.

create table if not exists public.workspace_api_keys (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.organizations(id) on delete cascade,
  openai_api_key text,
  video_api_key text,
  video_api_provider text default 'json2video',
  updated_at timestamptz not null default now(),
  constraint workspace_api_keys_workspace_unique unique (workspace_id)
);

create index if not exists workspace_api_keys_workspace_idx on public.workspace_api_keys (workspace_id);

-- RLS: only service role can read/write (keys never exposed to browser)
alter table public.workspace_api_keys enable row level security;

create policy "service role only" on public.workspace_api_keys
  using (false)
  with check (false);
