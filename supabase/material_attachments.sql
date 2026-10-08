-- Photos attached to material log entries.
-- Run once in the Supabase SQL editor. Files go in the existing `attachments`
-- storage bucket under `materials/<material_log_id>/...`.
-- Assumes material_logs.id is a uuid; change the type below if it isn't.

create table if not exists public.material_attachments (
  id uuid primary key default gen_random_uuid(),
  material_log_id uuid not null references public.material_logs (id) on delete cascade,
  path text not null,
  file_name text not null,
  file_type text not null,
  created_at timestamptz not null default now()
);

create index if not exists material_attachments_log_idx
  on public.material_attachments (material_log_id);

-- Same open access the app uses for its other tables (anon key, no login).
-- If transaction_attachments uses different policies, copy those instead.
alter table public.material_attachments enable row level security;

drop policy if exists "material_attachments_all" on public.material_attachments;
create policy "material_attachments_all" on public.material_attachments
  for all to anon, authenticated using (true) with check (true);
