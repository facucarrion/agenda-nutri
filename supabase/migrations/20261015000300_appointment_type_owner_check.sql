-- An appointment's patient and consultation type must belong to the same
-- nutritionist as the appointment.
create or replace function public.check_appointment_patient_owner()
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

  if new.appointment_type_id is not null and not exists (
    select 1 from public.appointment_types t
    where t.id = new.appointment_type_id
      and t.nutritionist_id = new.nutritionist_id
  ) then
    raise exception 'appointment type does not belong to this nutritionist';
  end if;

  return new;
end;
$$;

drop trigger appointments_patient_owner on public.appointments;

create trigger appointments_owner_check
  before insert or update of patient_id, appointment_type_id, nutritionist_id
  on public.appointments
  for each row execute function public.check_appointment_patient_owner();
