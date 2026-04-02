create extension if not exists pgcrypto;

create table if not exists public.shared_calculations (
  id uuid primary key default gen_random_uuid(),
  schema_version integer not null,
  app_name text not null,
  payload jsonb not null,
  created_at timestamptz not null default timezone('utc', now())
);

comment on table public.shared_calculations is 'Shared snapshots for iUnitRadar unit economics calculator.';

alter table public.shared_calculations enable row level security;

create policy if not exists "public can create shared calculations"
  on public.shared_calculations
  for insert
  to anon, authenticated
  with check (true);

create policy if not exists "public can read shared calculations by id"
  on public.shared_calculations
  for select
  to anon, authenticated
  using (true);

create index if not exists shared_calculations_created_at_idx on public.shared_calculations (created_at desc);
