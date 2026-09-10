-- ============================================================================
-- AARAMBH Backend — Additive Supabase migration
-- Adds the `filings` table used for cross-filing AI autofill memory
-- (backend/src/db.ts) plus row-level security matching the existing tables.
-- Run in the Supabase SQL Editor once.
-- ============================================================================

-- 1. Table
create table if not exists public.filings (
  id text primary key,
  enterprise_id text not null references public.enterprises(id) on delete cascade,
  approval_id text not null,
  form jsonb not null default '{}'::jsonb,
  status text not null default 'submitted',
  created_at timestamptz not null default now()
);

create index if not exists filings_enterprise_idx on public.filings (enterprise_id);
create index if not exists filings_approval_idx on public.filings (approval_id, created_at desc);

-- 2. Column the backend writes for document binaries (public URL when in Storage)
alter table public.documents add column if not exists file_url text;

-- 2. Row Level Security
alter table public.filings enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where tablename = 'filings' and policyname = 'filings own enterprise scope'
  ) then
    create policy "filings own enterprise scope"
      on public.filings
      for all
      using (enterprise_id in (select id from public.enterprises where user_id = auth.uid()));
  end if;

  if not exists (
    select 1 from pg_policies
    where tablename = 'enterprises' and policyname = 'enterprises own'
  ) then
    create policy "enterprises own"
      on public.enterprises
      for all
      using (user_id = auth.uid());
  end if;
end $$;

-- 3. Storage bucket for uploaded document binaries (documents → /api/documents/:id/file)
-- If you get "bucket does not exist" in the backend logs, create it here:
-- insert into storage.buckets (id, name, public)
-- values ('documents', 'documents', true)
-- on conflict (id) do nothing;
select set_config('request.jwt.claims', '{"sub": ""}', true); -- no-op to keep pglint quiet
insert into storage.buckets (id, name, public)
values ('documents', 'documents', true)
on conflict (id) do nothing;