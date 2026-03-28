create table if not exists public.story_content (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.organizations(id) on delete cascade,
  story_id uuid not null references public.story_records(id) on delete cascade,
  channel text not null,
  content_type text not null,
  title text,
  body text not null,
  status text not null default 'draft' check (status in ('draft', 'ready', 'approved')),
  metadata_json jsonb,
  generated_at timestamptz not null default now()
);

create index if not exists story_content_workspace_idx on public.story_content (workspace_id);
create index if not exists story_content_story_idx on public.story_content (story_id);

create table if not exists public.story_assets (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.organizations(id) on delete cascade,
  story_id uuid not null references public.story_records(id) on delete cascade,
  asset_type text not null,
  file_name text not null,
  file_url text not null,
  platform text,
  dimensions text,
  file_size bigint,
  status text not null default 'queued' check (status in ('queued', 'generated', 'ready', 'failed')),
  metadata_json jsonb,
  created_at timestamptz not null default now()
);

create index if not exists story_assets_workspace_idx on public.story_assets (workspace_id);
create index if not exists story_assets_story_idx on public.story_assets (story_id);

create table if not exists public.story_packages (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.organizations(id) on delete cascade,
  project_id uuid not null references public.story_projects(id) on delete cascade,
  story_id uuid references public.story_records(id) on delete set null,
  name text not null,
  description text,
  status text not null default 'preparing' check (status in ('preparing', 'ready', 'delivered')),
  package_url text,
  download_count integer not null default 0,
  shareable_link text,
  expires_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists story_packages_workspace_idx on public.story_packages (workspace_id);
create index if not exists story_packages_project_idx on public.story_packages (project_id);
create index if not exists story_packages_story_idx on public.story_packages (story_id);

alter table public.story_content enable row level security;
alter table public.story_assets enable row level security;
alter table public.story_packages enable row level security;
