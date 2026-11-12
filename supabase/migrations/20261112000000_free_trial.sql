-- Free trial. Each invitation code says how many trial days it gives; the
-- sign-up trigger starts the clock. When the trial ends the app blocks
-- changes (it never deletes data). Billing itself is handled by hand for now:
-- an account is activated by setting plan = 'active'.

-- Days of free trial the code gives. 0 = full access with no end date (for
-- someone who already pays, or for the team).
alter table public.invitation_codes
  add column trial_days integer not null default 14
    check (trial_days between 0 and 365);

comment on column public.invitation_codes.trial_days is
  'Days of free trial. 0 means the account starts active, with no end date.';

-- plan = 'trial': full access until trial_ends_at.
-- plan = 'active': full access until active_until (null = no end date).
alter table public.nutritionists
  add column plan text not null default 'trial'
    check (plan in ('trial', 'active')),
  add column trial_ends_at timestamptz,
  add column active_until timestamptz;

-- Accounts created before the trial existed keep full access.
update public.nutritionists set plan = 'active';

-- A nutritionist may edit her own row, but never the plan or its dates:
-- otherwise she could extend her own trial through the REST API.
revoke update on public.nutritionists from public, anon, authenticated;
grant update (full_name, slug, slot_minutes, min_notice_hours, timezone)
  on public.nutritionists to authenticated;

-- Sign-up now also copies the trial length from the code.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_code text := upper(btrim(coalesce(new.raw_user_meta_data ->> 'invite_code', '')));
  v_business text;
  v_trial integer;
begin
  -- The row lock makes two sign-ups with the same code impossible.
  update public.invitation_codes
     set used_at = now()
   where code = v_code
     and used_at is null
  returning business_name, trial_days into v_business, v_trial;

  if not found then
    raise exception 'invalid invitation code' using errcode = 'P0001';
  end if;

  insert into public.nutritionists
    (id, full_name, business_name, slug, plan, trial_ends_at)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    v_business,
    'n-' || substr(replace(gen_random_uuid()::text, '-', ''), 1, 10),
    case when v_trial = 0 then 'active' else 'trial' end,
    case when v_trial > 0 then now() + make_interval(days => v_trial) end
  );

  update public.invitation_codes set used_by = new.id where code = v_code;

  return new;
end;
$$;

revoke execute on function public.handle_new_user() from public, anon, authenticated;
