begin;

create table if not exists public.form_submission_rate_limits (
  id uuid primary key default gen_random_uuid(),
  form_id uuid not null,
  ip_hash text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_form_rate_limits_lookup
  on public.form_submission_rate_limits (form_id, ip_hash, created_at);

-- No RLS needed — only accessed via service role in the submit route.

commit;
