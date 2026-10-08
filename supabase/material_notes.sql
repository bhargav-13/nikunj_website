-- Free-form notes per material type (e.g. supplier, phone, rate).
-- Run once in the Supabase SQL editor. One row per material id from src/lib/materials.js.

create table if not exists public.material_notes (
  material_id text primary key,
  note text not null default '',
  updated_by text,
  updated_at timestamptz not null default now()
);

-- Same open access the app uses for its other tables (anon key, no login).
alter table public.material_notes enable row level security;

drop policy if exists "material_notes_all" on public.material_notes;
create policy "material_notes_all" on public.material_notes
  for all to anon, authenticated using (true) with check (true);
