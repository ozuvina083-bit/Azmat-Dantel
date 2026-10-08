-- Tighten the initial schema without changing or deleting appointment data.
create index if not exists site_content_updated_by_idx on public.site_content(updated_by);

-- Authenticated users may test only their own admin membership; no client-side role changes.
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

drop policy if exists "public can read homepage content" on public.site_content;
create policy "public can read homepage content" on public.site_content
  for select to anon using (id like 'homepage_%');

drop policy if exists "public can submit appointments" on public.appointments;
create policy "public can submit appointments" on public.appointments
  for insert to anon with check (status = 'pending' and telegram_chat_id is null and telegram_sent_at is null);
drop policy if exists "public can read active appointment slots" on public.appointments;
create policy "public can read active appointment slots" on public.appointments
  for select to anon using (status in ('pending','confirmed'));

-- Anonymous role can read availability columns only, never patient details.
revoke select on public.appointments from anon;
grant select (appointment_date, appointment_time, status) on public.appointments to anon;
grant select on public.appointments to authenticated;

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
