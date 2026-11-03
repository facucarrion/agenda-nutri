-- Multi-nutritionist sign-up: accounts are created only with an invitation
-- code, and each account can show a business name in the dashboard header.

-- Name of the practice or company. When empty the UI shows full_name.
alter table public.nutritionists
  add column business_name text
  check (business_name is null or char_length(business_name) between 1 and 120);

comment on column public.nutritionists.business_name is
  'Practice or company name shown in the dashboard header; falls back to full_name.';

-- One code per account, created by the team from the SQL editor:
--   insert into public.invitation_codes (code, business_name)
--   values ('NS-AB12-CD34', 'Consultorio Ejemplo');
create table public.invitation_codes (
  code text primary key check (code ~ '^[A-Z0-9-]{6,32}$'),
  business_name text
    check (business_name is null or char_length(business_name) between 1 and 120),
  note text,
  created_at timestamptz not null default now(),
  used_at timestamptz,
  used_by uuid references public.nutritionists (id) on delete set null
);

-- RLS on and no policies: only the service role and the sign-up trigger
-- (security definer) can read or change codes.
alter table public.invitation_codes enable row level security;
revoke all on public.invitation_codes from anon, authenticated;

-- Sign-up now consumes a valid, unused code (sent as invite_code in the user
-- metadata) and copies its business name. Without one the sign-up fails.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_code text := upper(btrim(coalesce(new.raw_user_meta_data ->> 'invite_code', '')));
  v_business text;
begin
  -- The row lock makes two sign-ups with the same code impossible.
  update public.invitation_codes
     set used_at = now()
   where code = v_code
     and used_at is null
  returning business_name into v_business;

  if not found then
    raise exception 'invalid invitation code' using errcode = 'P0001';
  end if;

  insert into public.nutritionists (id, full_name, business_name, slug)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    v_business,
    'n-' || substr(replace(gen_random_uuid()::text, '-', ''), 1, 10)
  );

  update public.invitation_codes set used_by = new.id where code = v_code;

  return new;
end;
$$;

revoke execute on function public.handle_new_user() from public, anon, authenticated;
