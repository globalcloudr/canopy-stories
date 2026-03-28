create extension if not exists pgcrypto;

create table if not exists public.story_projects (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  description text,
  status text not null default 'planning' check (status in ('planning', 'active', 'paused', 'delivered')),
  story_count_target integer,
  deadline_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists story_projects_workspace_idx on public.story_projects (workspace_id);

create table if not exists public.story_forms (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.organizations(id) on delete cascade,
  project_id uuid not null references public.story_projects(id) on delete cascade,
  title text not null,
  description text,
  story_type text not null,
  fields_json jsonb not null default '[]'::jsonb,
  public_slug text not null unique,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists story_forms_workspace_idx on public.story_forms (workspace_id);
create index if not exists story_forms_project_idx on public.story_forms (project_id);

create table if not exists public.story_submissions (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.organizations(id) on delete cascade,
  project_id uuid not null references public.story_projects(id) on delete cascade,
  form_id uuid not null references public.story_forms(id) on delete cascade,
  submitter_name text,
  submitter_email text,
  submission_data_json jsonb not null default '{}'::jsonb,
  photo_urls text[] not null default '{}'::text[],
  status text not null default 'submitted' check (status in ('submitted', 'reviewed', 'processing', 'archived')),
  submitted_at timestamptz not null default now()
);

create index if not exists story_submissions_workspace_idx on public.story_submissions (workspace_id);
create index if not exists story_submissions_project_idx on public.story_submissions (project_id);
create index if not exists story_submissions_form_idx on public.story_submissions (form_id);

create table if not exists public.story_records (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.organizations(id) on delete cascade,
  project_id uuid not null references public.story_projects(id) on delete cascade,
  submission_id uuid references public.story_submissions(id) on delete set null,
  title text not null,
  story_type text not null,
  subject_name text,
  status text not null default 'submitted' check (status in ('form_sent', 'submitted', 'ai_processing', 'asset_generation', 'packaging', 'delivered', 'blocked')),
  current_stage text not null default 'submitted' check (current_stage in ('form_sent', 'submitted', 'ai_processing', 'asset_generation', 'packaging', 'delivered')),
  source_data_json jsonb,
  error_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists story_records_workspace_idx on public.story_records (workspace_id);
create index if not exists story_records_project_idx on public.story_records (project_id);
create index if not exists story_records_submission_idx on public.story_records (submission_id);

alter table public.story_projects enable row level security;
alter table public.story_forms enable row level security;
alter table public.story_submissions enable row level security;
alter table public.story_records enable row level security;
