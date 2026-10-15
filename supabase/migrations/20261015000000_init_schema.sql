-- Initial schema: nutritionists, patients, availability, appointments.
-- Isolation per nutritionist via RLS. Public booking goes through server-side
-- route handlers using the service_role key (never exposed to the client).

create extension if not exists btree_gist;

-- ---------------------------------------------------------------- nutritionists
create table public.nutritionists (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null default '',
  slug text not null unique,
  slot_minutes smallint not null default 45 check (slot_minutes between 10 and 240),
  timezone text not null default 'America/Argentina/Buenos_Aires',
  created_at timestamptz not null default now()
);

-- Create the profile row automatically on sign-up.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.nutritionists (id, full_name, slug)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    'n-' || substr(replace(gen_random_uuid()::text, '-', ''), 1, 10)
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------- patients
create table public.patients (
  id uuid primary key default gen_random_uuid(),
  nutritionist_id uuid not null references public.nutritionists (id) on delete cascade,
  first_name text not null,
  last_name text not null,
  email text,
  phone text,
  birth_date date,
  dni text,
  notes text,
  weight_kg numeric(5, 2) check (weight_kg > 0),
  height_cm numeric(5, 1) check (height_cm > 0),
  created_at timestamptz not null default now()
);

create index patients_nutritionist_idx on public.patients (nutritionist_id);
create unique index patients_email_uniq
  on public.patients (nutritionist_id, lower(email)) where email is not null;

-- ---------------------------------------------------------------- availability
-- Weekly recurring windows. weekday: 0 = Sunday ... 6 = Saturday.
create table public.availability_rules (
  id uuid primary key default gen_random_uuid(),
  nutritionist_id uuid not null references public.nutritionists (id) on delete cascade,
  weekday smallint not null check (weekday between 0 and 6),
  start_time time not null,
  end_time time not null,
  check (end_time > start_time)
);

create index availability_rules_nutritionist_idx
  on public.availability_rules (nutritionist_id, weekday);

-- One-off blocks (holidays, time off).
create table public.availability_blocks (
  id uuid primary key default gen_random_uuid(),
  nutritionist_id uuid not null references public.nutritionists (id) on delete cascade,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  reason text,
  check (ends_at > starts_at)
);

create index availability_blocks_nutritionist_idx
  on public.availability_blocks (nutritionist_id, starts_at);

-- ---------------------------------------------------------------- appointments
create type public.appointment_status as enum
  ('pending', 'confirmed', 'cancelled', 'completed', 'no_show');

create type public.appointment_source as enum ('manual', 'public');

create table public.appointments (
  id uuid primary key default gen_random_uuid(),
  nutritionist_id uuid not null references public.nutritionists (id) on delete cascade,
  patient_id uuid not null references public.patients (id) on delete cascade,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  status public.appointment_status not null default 'confirmed',
  source public.appointment_source not null default 'manual',
  -- Public bookings stay 'pending' until the patient confirms via email.
  confirmation_token_hash text,
  pending_expires_at timestamptz,
  reminder_sent_at timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  check (ends_at > starts_at),
  -- No overlapping active appointments for the same nutritionist.
  constraint appointments_no_overlap exclude using gist (
    nutritionist_id with =,
    tstzrange(starts_at, ends_at) with &&
  ) where (status in ('pending', 'confirmed'))
);

create index appointments_agenda_idx
  on public.appointments (nutritionist_id, starts_at);
create index appointments_patient_idx on public.appointments (patient_id);

-- A patient and an appointment must belong to the same nutritionist.
create function public.check_appointment_patient_owner()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if not exists (
    select 1 from public.patients p
    where p.id = new.patient_id and p.nutritionist_id = new.nutritionist_id
  ) then
    raise exception 'patient does not belong to this nutritionist';
  end if;
  return new;
end;
$$;

create trigger appointments_patient_owner
  before insert or update of patient_id, nutritionist_id on public.appointments
  for each row execute function public.check_appointment_patient_owner();

-- ---------------------------------------------------------------- RLS
alter table public.nutritionists enable row level security;
alter table public.patients enable row level security;
alter table public.availability_rules enable row level security;
alter table public.availability_blocks enable row level security;
alter table public.appointments enable row level security;

create policy nutritionists_select_own on public.nutritionists
  for select to authenticated using (id = (select auth.uid()));
create policy nutritionists_update_own on public.nutritionists
  for update to authenticated
  using (id = (select auth.uid())) with check (id = (select auth.uid()));

create policy patients_all_own on public.patients
  for all to authenticated
  using (nutritionist_id = (select auth.uid()))
  with check (nutritionist_id = (select auth.uid()));

create policy availability_rules_all_own on public.availability_rules
  for all to authenticated
  using (nutritionist_id = (select auth.uid()))
  with check (nutritionist_id = (select auth.uid()));

create policy availability_blocks_all_own on public.availability_blocks
  for all to authenticated
  using (nutritionist_id = (select auth.uid()))
  with check (nutritionist_id = (select auth.uid()));

create policy appointments_all_own on public.appointments
  for all to authenticated
  using (nutritionist_id = (select auth.uid()))
  with check (nutritionist_id = (select auth.uid()));

-- No policies for anon: the public booking flow runs server-side with the
-- service_role key and only exposes free slots, never other patients' data.
