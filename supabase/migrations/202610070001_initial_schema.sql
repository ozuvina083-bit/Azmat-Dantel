-- Azamat Dental dashboard schema; least-privilege public booking and availability.
create extension if not exists pgcrypto;

create table if not exists public.site_content (
  id text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id)
);
create index if not exists site_content_updated_by_idx on public.site_content(updated_by);

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique,
  service text not null,
  doctor text not null,
  appointment_date date not null,
  appointment_time time not null,
  patient_name text not null,
  phone text not null,
  comment text not null default '',
  language text not null default 'uz' check (language in ('uz','ru','en')),
  status text not null default 'pending' check (status in ('pending','confirmed','cancelled','completed')),
  telegram_chat_id text,
  telegram_connected_at timestamptz,
  telegram_sent_at timestamptz,
  telegram_link_token text unique,
  admin_note text not null default '',
  created_at timestamptz not null default now()
);

-- Only pending/confirmed appointments reserve a slot. An admin cancellation releases it.
create unique index if not exists appointments_active_slot_unique
  on public.appointments (appointment_date, appointment_time)
  where status in ('pending','confirmed');
create index if not exists appointments_date_status_idx
  on public.appointments (appointment_date, status);

alter table public.site_content enable row level security;
alter table public.admin_users enable row level security;
alter table public.appointments enable row level security;

-- A signed-in user can check only their own admin membership. Admin membership is managed server-side.
revoke all on public.admin_users from anon, authenticated;
grant select on public.admin_users to authenticated;
drop policy if exists "users can read own admin membership" on public.admin_users;
create policy "users can read own admin membership" on public.admin_users
  for select to authenticated using (user_id = (select auth.uid()));

create or replace function public.is_admin()
returns boolean
language sql
stable
security invoker
set search_path = public
as $$
  select exists (select 1 from public.admin_users where user_id = auth.uid());
$$;
revoke all on function public.is_admin() from public;
revoke all on function public.is_admin() from anon;
grant execute on function public.is_admin() to authenticated;

-- Public visitors are anonymous; signed-in dashboard users are handled by the admin policy only.
drop policy if exists "public can read homepage content" on public.site_content;
create policy "public can read homepage content" on public.site_content
  for select to anon using (id like 'homepage_%');
drop policy if exists "authenticated admins manage homepage content" on public.site_content;
create policy "authenticated admins manage homepage content" on public.site_content
  for all to authenticated using (public.is_admin())
  with check (public.is_admin());

-- Patient records are never publicly readable. Anonymous users can submit bookings.
drop policy if exists "public can submit appointments" on public.appointments;
create policy "public can submit appointments" on public.appointments
  for insert to anon with check (status = 'pending' and telegram_chat_id is null and telegram_sent_at is null);
drop policy if exists "public can read active appointment slots" on public.appointments;
create policy "public can read active appointment slots" on public.appointments
  for select to anon using (status in ('pending','confirmed'));
drop policy if exists "authenticated admins manage appointments" on public.appointments;
create policy "authenticated admins manage appointments" on public.appointments
  for all to authenticated using (public.is_admin())
  with check (public.is_admin());

-- Anonymous visitors may read only the slot columns, never patient or contact fields.
revoke select on public.appointments from anon;
grant select (appointment_date, appointment_time, status) on public.appointments to anon;
grant select on public.appointments to authenticated;

-- Safe availability RPC; SECURITY INVOKER respects the anonymous role's column grants and RLS policy.
create or replace function public.get_booked_slots(p_date date)
returns table(slot_time time)
language sql
stable
security invoker
set search_path = public
as $$
  select a.appointment_time
  from public.appointments a
  where a.appointment_date = p_date and a.status in ('pending','confirmed');
$$;
revoke all on function public.get_booked_slots(date) from public;
revoke all on function public.get_booked_slots(date) from authenticated;
grant execute on function public.get_booked_slots(date) to anon;

-- Publicly display doctor portraits/certificates; restrict uploads and edits to allowlisted admins.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('doctor-assets', 'doctor-assets', true, 8388608, array['image/jpeg','image/png','image/webp','application/pdf'])
on conflict (id) do nothing;
drop policy if exists "public can view doctor assets" on storage.objects;
create policy "public can view doctor assets" on storage.objects
  for select to anon, authenticated using (bucket_id = 'doctor-assets');
drop policy if exists "authenticated admins manage doctor assets" on storage.objects;
create policy "authenticated admins manage doctor assets" on storage.objects
  for all to authenticated using (bucket_id = 'doctor-assets' and public.is_admin())
  with check (bucket_id = 'doctor-assets' and public.is_admin());
