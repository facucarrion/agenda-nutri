-- Modality: each weekly window says whether it is attended in person, online
-- or both, and each turno records how it will take place.

create type public.appointment_modality as enum ('in_person', 'virtual');
create type public.availability_modality as enum ('in_person', 'virtual', 'both');

-- Existing windows keep working as before: both modalities allowed.
alter table public.availability_rules
  add column modality public.availability_modality not null default 'both';

-- Null for turnos created before this column existed.
alter table public.appointments
  add column modality public.appointment_modality;
