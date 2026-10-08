-- General site notes (Notes tab), with optional photos / PDFs.
-- Run once in the Supabase SQL editor. Files go in the existing `attachments`
-- storage bucket under `notes/<note_id>/...`.

create table if not exists public.notes (
  id uuid primary key default gen_random_uuid(),
  title text not null default '',
  body text not null default '',
  pinned boolean not null default false,
  created_by text,
  updated_by text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.note_attachments (
  id uuid primary key default gen_random_uuid(),
  note_id uuid not null references public.notes (id) on delete cascade,
  path text not null,
  file_name text not null,
  file_type text not null,
  created_at timestamptz not null default now()
);

create index if not exists note_attachments_note_idx on public.note_attachments (note_id);

-- Same open access the app uses for its other tables (anon key, no login).
alter table public.notes enable row level security;
alter table public.note_attachments enable row level security;

drop policy if exists "notes_all" on public.notes;
create policy "notes_all" on public.notes
  for all to anon, authenticated using (true) with check (true);

drop policy if exists "note_attachments_all" on public.note_attachments;
create policy "note_attachments_all" on public.note_attachments
  for all to anon, authenticated using (true) with check (true);
