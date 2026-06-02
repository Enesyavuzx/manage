-- ============================================================
-- Manage - Supabase şeması
-- Supabase projenizde: SQL Editor > New query > bu dosyayı yapıştır > Run
-- ============================================================

-- Kullanıcı durumunu tek JSONB satırında tutar (cihaz başına anonim kullanıcı).
create table if not exists app_state (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  data       jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table app_state enable row level security;

-- Her kullanıcı yalnızca kendi satırını görür/yazar.
drop policy if exists "app_state_select" on app_state;
create policy "app_state_select" on app_state
  for select to authenticated
  using (auth.uid() = user_id);

drop policy if exists "app_state_insert" on app_state;
create policy "app_state_insert" on app_state
  for insert to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "app_state_update" on app_state;
create policy "app_state_update" on app_state
  for update to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- NOT: Anonim girişin çalışması için Supabase panelinde
-- Authentication > Providers > Anonymous sign-ins AÇIK olmalı.
