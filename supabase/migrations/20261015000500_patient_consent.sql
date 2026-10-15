-- Evidence of the privacy notice the patient accepted when booking online.
alter table public.patients
  add column consent_at timestamptz,
  add column consent_version text;
