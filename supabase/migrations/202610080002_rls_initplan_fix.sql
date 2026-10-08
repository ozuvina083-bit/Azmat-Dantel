-- Evaluate the auth uid once per query instead of once per row.
drop policy if exists "users can read own admin membership" on public.admin_users;
create policy "users can read own admin membership" on public.admin_users
  for select to authenticated using (user_id = (select auth.uid()));
