create extension if not exists pgcrypto;

create type public.reflection_status as enum ('pending', 'ambiguous', 'authorized', 'rejected');

create table public.participants (
  id uuid primary key default gen_random_uuid(),
  display_name text not null check (char_length(display_name) between 1 and 80),
  initials text not null check (char_length(initials) between 1 and 3),
  avatar_color text not null default '#4f86c6',
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.reading_days (
  id uuid primary key default gen_random_uuid(),
  reading_date date not null unique,
  timezone text not null default 'America/Monterrey',
  created_at timestamptz not null default now()
);

create table public.reading_passages (
  id uuid primary key default gen_random_uuid(),
  reading_day_id uuid not null references public.reading_days(id) on delete cascade,
  display_order smallint not null default 0,
  book_key text not null,
  book_name text not null,
  start_chapter smallint not null check (start_chapter > 0),
  end_chapter smallint check (end_chapter is null or end_chapter >= start_chapter),
  reference text not null,
  unique (reading_day_id, reference)
);

create table public.reflections (
  id uuid primary key default gen_random_uuid(),
  participant_id uuid not null references public.participants(id),
  reading_day_id uuid not null references public.reading_days(id),
  sent_at timestamptz not null,
  reading_date date not null,
  reference text not null,
  normalized_reference text not null,
  biblical_text text not null,
  reflection_text text not null,
  status public.reflection_status not null default 'pending',
  source_message_hash text not null unique,
  authorized_at timestamptz,
  created_at timestamptz not null default now(),
  constraint authorized_reflection_has_date check (status <> 'authorized' or authorized_at is not null)
);

create table public.resources (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  resource_type text not null,
  resource_url text,
  display_order smallint not null default 0,
  is_published boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.import_batches (
  id uuid primary key default gen_random_uuid(),
  source_file_hash text not null unique,
  timezone text not null default 'America/Monterrey',
  total_messages integer not null default 0,
  candidate_messages integer not null default 0,
  duplicate_messages integer not null default 0,
  ignored_messages integer not null default 0,
  imported_at timestamptz not null default now()
);

create table public.import_issues (
  id uuid primary key default gen_random_uuid(),
  import_batch_id uuid not null references public.import_batches(id) on delete cascade,
  source_message_hash text not null,
  issue_code text not null,
  created_at timestamptz not null default now(),
  unique (import_batch_id, source_message_hash, issue_code)
);

create index reflections_reading_date_idx on public.reflections(reading_date);
create index reflections_participant_idx on public.reflections(participant_id, reading_date desc);
create index reflections_reference_idx on public.reflections(normalized_reference);
create index reading_passages_day_idx on public.reading_passages(reading_day_id, display_order);

alter table public.participants enable row level security;
alter table public.reading_days enable row level security;
alter table public.reading_passages enable row level security;
alter table public.reflections enable row level security;
alter table public.resources enable row level security;
alter table public.import_batches enable row level security;
alter table public.import_issues enable row level security;

create policy "public can read active participants"
  on public.participants for select
  using (is_active = true);

create policy "public can read reading days"
  on public.reading_days for select
  using (true);

create policy "public can read reading passages"
  on public.reading_passages for select
  using (true);

create policy "public can read authorized reflections"
  on public.reflections for select
  using (status = 'authorized');

create policy "public can read published resources"
  on public.resources for select
  using (is_published = true);

grant usage on schema public to anon, authenticated;
grant select on public.participants, public.reading_days, public.reading_passages, public.reflections, public.resources to anon, authenticated;

-- No public policies or grants exist for import_batches/import_issues.
-- Inserts, reviews and publication must run with the service-role key in a private process.
