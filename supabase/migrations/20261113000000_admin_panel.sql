-- Owner panel (/admin): audit log and account statistics.
--
-- Both are only reachable with the service_role key, from server code that has
-- already checked the caller is an admin. Neither exposes patient data.

-- ----------------------------------------------------------------- audit log
-- Who did what in the panel. Append-only: nobody can update or delete rows,
-- not even the service role.
create table public.admin_log (
  id bigint generated always as identity primary key,
  admin_email text not null,
  action text not null check (char_length(action) between 1 and 60),
  target text check (target is null or char_length(target) <= 200),
  detail jsonb,
  created_at timestamptz not null default now()
);

alter table public.admin_log enable row level security;
-- RLS on and no policies: anon and authenticated see nothing.
revoke all on public.admin_log from public, anon, authenticated;
revoke all on public.admin_log from service_role;
grant select, insert on public.admin_log to service_role;

-- ------------------------------------------------------------ account stats
-- Counts per account for the panel. Only aggregates: no names, no dates of
-- individual appointments, nothing about a patient.
create or replace function public.admin_account_stats()
returns table (
  nutritionist_id uuid,
  patients_count bigint,
  appointments_count bigint,
  last_appointment_at timestamptz
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    n.id,
    (select count(*) from public.patients p where p.nutritionist_id = n.id),
    (select count(*) from public.appointments a where a.nutritionist_id = n.id),
    (select max(a.starts_at) from public.appointments a where a.nutritionist_id = n.id)
  from public.nutritionists n;
$$;

revoke execute on function public.admin_account_stats() from public, anon, authenticated;
grant execute on function public.admin_account_stats() to service_role;
