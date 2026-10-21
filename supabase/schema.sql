-- Iglesia de Torreon - esquema inicial de Supabase
-- Ejecutar una vez en SQL Editor sobre un proyecto nuevo.
-- La interfaz publica solo tiene permisos de lectura sobre contenido autorizado.

begin;

create extension if not exists pgcrypto;

do $$
begin
  create type public.reflection_status as enum ('pending', 'ambiguous', 'authorized', 'rejected');
exception
  when duplicate_object then null;
end
$$;

create table if not exists public.participants (
  id uuid primary key default gen_random_uuid(),
  display_name text not null check (char_length(trim(display_name)) between 1 and 80),
  initials text not null check (char_length(trim(initials)) between 1 and 3),
  avatar_color text not null default '#4f86c6' check (avatar_color ~ '^#[0-9A-Fa-f]{6}$'),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.reading_days (
  id uuid primary key default gen_random_uuid(),
  reading_date date not null unique,
  timezone text not null default 'America/Monterrey',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, reading_date)
);

create table if not exists public.reading_passages (
  id uuid primary key default gen_random_uuid(),
  reading_day_id uuid not null references public.reading_days(id) on delete cascade,
  display_order smallint not null default 0 check (display_order >= 0),
  book_key text not null,
  book_name text not null,
  start_chapter smallint not null check (start_chapter > 0),
  end_chapter smallint check (end_chapter is null or end_chapter >= start_chapter),
  start_verse smallint check (start_verse is null or start_verse > 0),
  end_verse smallint check (
    end_verse is null or (start_verse is not null and end_verse >= start_verse)
  ),
  reference text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (reading_day_id, reference)
);

create table if not exists public.reflections (
  id uuid primary key default gen_random_uuid(),
  participant_id uuid not null references public.participants(id) on delete restrict,
  reading_day_id uuid not null,
  sent_at timestamptz not null,
  reading_date date not null,
  reference text not null,
  normalized_reference text not null,
  book_key text not null,
  start_chapter smallint not null check (start_chapter > 0),
  end_chapter smallint check (end_chapter is null or end_chapter >= start_chapter),
  start_verse smallint check (start_verse is null or start_verse > 0),
  end_verse smallint check (
    end_verse is null or (start_verse is not null and end_verse >= start_verse)
  ),
  biblical_text text not null,
  reflection_text text not null,
  status public.reflection_status not null default 'pending',
  source_message_hash text not null unique check (source_message_hash ~ '^[0-9a-f]{64}$'),
  authorized_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint reflections_reading_day_date_fk
    foreign key (reading_day_id, reading_date)
    references public.reading_days(id, reading_date)
    on delete restrict,
  constraint authorized_reflection_has_date
    check (status <> 'authorized' or authorized_at is not null)
);

create table if not exists public.resources (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(trim(title)) between 1 and 140),
  description text not null default '',
  resource_type text not null check (resource_type in ('pdf', 'link', 'video', 'study', 'guide', 'other')),
  resource_url text,
  display_order smallint not null default 0 check (display_order >= 0),
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.weekly_recitations (
  id uuid primary key default gen_random_uuid(),
  week_start date not null unique check (extract(isodow from week_start) = 1),
  timezone text not null default 'America/Monterrey',
  reference text not null,
  normalized_reference text not null,
  book_key text not null,
  start_chapter smallint not null check (start_chapter > 0),
  end_chapter smallint check (end_chapter is null or end_chapter >= start_chapter),
  start_verse smallint check (start_verse is null or start_verse > 0),
  end_verse smallint check (
    end_verse is null or (start_verse is not null and end_verse >= start_verse)
  ),
  biblical_text text not null,
  translation text not null default 'Reina-Valera 1960',
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.import_batches (
  id uuid primary key default gen_random_uuid(),
  source_file_hash text not null unique check (source_file_hash ~ '^[0-9a-f]{64}$'),
  timezone text not null default 'America/Monterrey',
  status text not null default 'pending' check (status in ('pending', 'reviewed', 'imported', 'failed')),
  total_messages integer not null default 0 check (total_messages >= 0),
  candidate_messages integer not null default 0 check (candidate_messages >= 0),
  duplicate_messages integer not null default 0 check (duplicate_messages >= 0),
  ignored_messages integer not null default 0 check (ignored_messages >= 0),
  imported_at timestamptz not null default now()
);

create table if not exists public.import_issues (
  id uuid primary key default gen_random_uuid(),
  import_batch_id uuid not null references public.import_batches(id) on delete cascade,
  source_message_hash text not null check (source_message_hash ~ '^[0-9a-f]{64}$'),
  issue_code text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (import_batch_id, source_message_hash, issue_code)
);

comment on table public.import_batches is
  'Metadatos privados de cada archivo TXT importado. No guarda el contenido descartado.';
comment on table public.import_issues is
  'Incidencias privadas identificadas solo por hash. metadata nunca debe contener el mensaje original.';

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists participants_set_updated_at on public.participants;
create trigger participants_set_updated_at
before update on public.participants
for each row execute function public.set_updated_at();

drop trigger if exists reading_days_set_updated_at on public.reading_days;
create trigger reading_days_set_updated_at
before update on public.reading_days
for each row execute function public.set_updated_at();

drop trigger if exists reading_passages_set_updated_at on public.reading_passages;
create trigger reading_passages_set_updated_at
before update on public.reading_passages
for each row execute function public.set_updated_at();

drop trigger if exists reflections_set_updated_at on public.reflections;
create trigger reflections_set_updated_at
before update on public.reflections
for each row execute function public.set_updated_at();

drop trigger if exists resources_set_updated_at on public.resources;
create trigger resources_set_updated_at
before update on public.resources
for each row execute function public.set_updated_at();

drop trigger if exists weekly_recitations_set_updated_at on public.weekly_recitations;
create trigger weekly_recitations_set_updated_at
before update on public.weekly_recitations
for each row execute function public.set_updated_at();

create index if not exists reading_passages_day_idx
  on public.reading_passages(reading_day_id, display_order);
create index if not exists reflections_reading_day_idx
  on public.reflections(reading_day_id, status);
create index if not exists reflections_reading_date_idx
  on public.reflections(reading_date desc, status);
create index if not exists reflections_participant_idx
  on public.reflections(participant_id, reading_date desc, sent_at desc);
create index if not exists reflections_reference_idx
  on public.reflections(book_key, start_chapter, normalized_reference);
create index if not exists reflections_search_idx
  on public.reflections using gin (
    to_tsvector('spanish', coalesce(reference, '') || ' ' || coalesce(reflection_text, ''))
  );
create index if not exists resources_published_order_idx
  on public.resources(is_published, display_order);
create index if not exists weekly_recitations_published_week_idx
  on public.weekly_recitations(is_published, week_start desc);
create index if not exists import_issues_batch_idx
  on public.import_issues(import_batch_id, created_at);

alter table public.participants enable row level security;
alter table public.reading_days enable row level security;
alter table public.reading_passages enable row level security;
alter table public.reflections enable row level security;
alter table public.resources enable row level security;
alter table public.weekly_recitations enable row level security;
alter table public.import_batches enable row level security;
alter table public.import_issues enable row level security;

drop policy if exists "public can read active participants" on public.participants;
create policy "public can read active participants"
  on public.participants for select
  to anon, authenticated
  using (is_active = true);

drop policy if exists "public can read reading days" on public.reading_days;
create policy "public can read reading days"
  on public.reading_days for select
  to anon, authenticated
  using (true);

drop policy if exists "public can read reading passages" on public.reading_passages;
create policy "public can read reading passages"
  on public.reading_passages for select
  to anon, authenticated
  using (true);

drop policy if exists "public can read authorized reflections" on public.reflections;
create policy "public can read authorized reflections"
  on public.reflections for select
  to anon, authenticated
  using (status = 'authorized');

drop policy if exists "public can read published resources" on public.resources;
create policy "public can read published resources"
  on public.resources for select
  to anon, authenticated
  using (is_published = true);

drop policy if exists "public can read published weekly recitations" on public.weekly_recitations;
create policy "public can read published weekly recitations"
  on public.weekly_recitations for select
  to anon, authenticated
  using (is_published = true);

revoke all on public.import_batches, public.import_issues from anon, authenticated;
revoke insert, update, delete on
  public.participants,
  public.reading_days,
  public.reading_passages,
  public.reflections,
  public.resources,
  public.weekly_recitations
from anon, authenticated;

grant usage on schema public to anon, authenticated;
grant usage on type public.reflection_status to anon, authenticated;
grant select on
  public.participants,
  public.reading_days,
  public.reading_passages,
  public.reflections,
  public.resources,
  public.weekly_recitations
to anon, authenticated;

revoke all on function public.set_updated_at() from public;

notify pgrst, 'reload schema';

commit;
