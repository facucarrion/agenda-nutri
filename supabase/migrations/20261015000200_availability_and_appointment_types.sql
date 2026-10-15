-- Minimum notice (hours) for public bookings.
alter table public.nutritionists
  add column min_notice_hours smallint not null default 12
    check (min_notice_hours between 0 and 720);

comment on column public.nutritionists.slot_minutes is
  'Grid step used to generate bookable start times; consultation length comes from appointment_types.';

-- No overlapping weekly windows for the same nutritionist and weekday.
alter table public.availability_rules
  add constraint availability_rules_no_overlap exclude using gist (
    nutritionist_id with =,
    weekday with =,
    tsrange(
      timestamp '2000-01-01' + start_time,
      timestamp '2000-01-01' + end_time
    ) with &&
  );

-- Consultation types, each with its own duration.
create table public.appointment_types (
  id uuid primary key default gen_random_uuid(),
  nutritionist_id uuid not null references public.nutritionists (id) on delete cascade,
  name text not null check (length(trim(name)) > 0),
  duration_minutes smallint not null check (duration_minutes between 10 and 240),
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create index appointment_types_nutritionist_idx
  on public.appointment_types (nutritionist_id);

alter table public.appointment_types enable row level security;

create policy appointment_types_all_own on public.appointment_types
  for all to authenticated
  using (nutritionist_id = (select auth.uid()))
  with check (nutritionist_id = (select auth.uid()));

alter table public.appointments
  add column appointment_type_id uuid
    references public.appointment_types (id) on delete set null;

create index appointments_type_idx on public.appointments (appointment_type_id);
