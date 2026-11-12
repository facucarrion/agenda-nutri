-- The read-only mode of an expired trial, enforced by the database too.
--
-- Until now only the Server Actions checked the plan, so an expired account
-- could still write through the REST API with its own session. Every policy
-- that lets a nutritionist create, change or delete rows now also requires
-- write access. Reading stays open, and so does deleting a patient (erasure
-- is a right under Ley 25.326; the appointments go with it by cascade).
-- The service_role (cron jobs, public booking, admin panel) bypasses RLS.

-- Mirrors accessState() in src/lib/access.ts: an unknown plan or a missing
-- date means no access, so a mistake never grants it.
create or replace function public.has_write_access()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce((
    select (n.plan = 'active' and (n.active_until is null or n.active_until > now()))
        or (n.plan = 'trial' and n.trial_ends_at is not null and n.trial_ends_at > now())
      from public.nutritionists n
     where n.id = (select auth.uid())
  ), false);
$$;

revoke execute on function public.has_write_access() from public, anon;
grant execute on function public.has_write_access() to authenticated;

-- ------------------------------------------------------------- nutritionists
-- Own profile (slug, booking settings): editable only with write access.
drop policy nutritionists_update_own on public.nutritionists;
create policy nutritionists_update_own on public.nutritionists
  for update to authenticated
  using (id = (select auth.uid()) and (select public.has_write_access()))
  with check (id = (select auth.uid()) and (select public.has_write_access()));

-- ------------------------------------------------------------------ patients
drop policy patients_all_own on public.patients;
create policy patients_select_own on public.patients
  for select to authenticated
  using (nutritionist_id = (select auth.uid()));
create policy patients_insert_own on public.patients
  for insert to authenticated
  with check (nutritionist_id = (select auth.uid()) and (select public.has_write_access()));
create policy patients_update_own on public.patients
  for update to authenticated
  using (nutritionist_id = (select auth.uid()) and (select public.has_write_access()))
  with check (nutritionist_id = (select auth.uid()) and (select public.has_write_access()));
-- No write-access check: erasure must work after the trial too.
create policy patients_delete_own on public.patients
  for delete to authenticated
  using (nutritionist_id = (select auth.uid()));

-- ------------------------------------------- the rest: read always, write gated
do $$
declare
  t text;
begin
  foreach t in array array['appointments', 'availability_rules', 'availability_blocks', 'appointment_types']
  loop
    execute format('drop policy %I on public.%I', t || '_all_own', t);
    execute format(
      'create policy %I on public.%I for select to authenticated
         using (nutritionist_id = (select auth.uid()))',
      t || '_select_own', t);
    execute format(
      'create policy %I on public.%I for insert to authenticated
         with check (nutritionist_id = (select auth.uid()) and (select public.has_write_access()))',
      t || '_insert_own', t);
    execute format(
      'create policy %I on public.%I for update to authenticated
         using (nutritionist_id = (select auth.uid()) and (select public.has_write_access()))
         with check (nutritionist_id = (select auth.uid()) and (select public.has_write_access()))',
      t || '_update_own', t);
    execute format(
      'create policy %I on public.%I for delete to authenticated
         using (nutritionist_id = (select auth.uid()) and (select public.has_write_access()))',
      t || '_delete_own', t);
  end loop;
end $$;
