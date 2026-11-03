-- Integration test for the schema constraints and RLS isolation.
-- Run in the Supabase SQL editor (or via execute_sql). It always ends with an
-- exception on purpose, so nothing is persisted; the message lists results.
-- Every line must end in "ok" or match its "(expected N)".

do $$
declare
  a uuid := gen_random_uuid();
  b uuid := gen_random_uuid();
  pa uuid; pb uuid; ta uuid; tb uuid;
  res text := '';
  n int;
begin
  -- Sign-up needs an unused invitation code (consumed by the trigger).
  insert into public.invitation_codes (code, business_name)
  values ('TEST-A-' || upper(substr(a::text, 1, 8)), 'Consultorio A'),
         ('TEST-B-' || upper(substr(b::text, 1, 8)), null);

  insert into auth.users (id, email, aud, role, raw_user_meta_data)
  values (a, 'a-' || a || '@test.local', 'authenticated', 'authenticated',
          jsonb_build_object('full_name', 'A', 'invite_code', 'TEST-A-' || upper(substr(a::text, 1, 8)))),
         (b, 'b-' || b || '@test.local', 'authenticated', 'authenticated',
          jsonb_build_object('full_name', 'B', 'invite_code', 'TEST-B-' || upper(substr(b::text, 1, 8))));

  select count(*) into n from public.nutritionists where id in (a, b);
  res := res || 'profiles created by trigger: ' || n || E' (expected 2)\n';

  select count(*) into n from public.nutritionists where id = a and business_name = 'Consultorio A';
  res := res || 'business name copied from code: ' || n || E' (expected 1)\n';

  select count(*) into n from public.invitation_codes where used_by in (a, b) and used_at is not null;
  res := res || 'invitation codes consumed: ' || n || E' (expected 2)\n';

  begin
    insert into auth.users (id, email, aud, role, raw_user_meta_data)
    values (gen_random_uuid(), 'c@test.local', 'authenticated', 'authenticated',
            jsonb_build_object('full_name', 'C', 'invite_code', 'TEST-A-' || upper(substr(a::text, 1, 8))));
    res := res || E'reused invitation code: FAIL (was accepted)\n';
  exception when others then
    res := res || E'reused invitation code rejected: ok\n';
  end;

  insert into public.patients (nutritionist_id, first_name, last_name, email) values (a, 'Pa', 'A', 'x@x.com') returning id into pa;
  insert into public.patients (nutritionist_id, first_name, last_name, email) values (b, 'Pb', 'B', 'x@x.com') returning id into pb;
  res := res || E'same email for different nutritionists: ok\n';

  insert into public.appointment_types (nutritionist_id, name, duration_minutes) values (a, 'Control', 30) returning id into ta;
  insert into public.appointment_types (nutritionist_id, name, duration_minutes) values (b, 'Control', 30) returning id into tb;

  insert into public.appointments (nutritionist_id, patient_id, appointment_type_id, starts_at, ends_at)
  values (a, pa, ta, '2030-01-01 10:00+00', '2030-01-01 10:30+00');

  begin
    insert into public.appointments (nutritionist_id, patient_id, appointment_type_id, starts_at, ends_at)
    values (a, pa, ta, '2030-01-01 10:15+00', '2030-01-01 10:45+00');
    res := res || E'overlap: NOT BLOCKED (bad)\n';
  exception when exclusion_violation then
    res := res || E'overlap blocked: ok\n';
  end;

  insert into public.appointments (nutritionist_id, patient_id, appointment_type_id, starts_at, ends_at)
  values (a, pa, ta, '2030-01-01 10:30+00', '2030-01-01 11:00+00');
  res := res || E'back-to-back allowed: ok\n';

  update public.appointments set status = 'cancelled'
  where nutritionist_id = a and starts_at = '2030-01-01 10:00+00';
  insert into public.appointments (nutritionist_id, patient_id, appointment_type_id, starts_at, ends_at)
  values (a, pa, ta, '2030-01-01 10:00+00', '2030-01-01 10:30+00');
  res := res || E'slot reusable after cancel: ok\n';

  begin
    insert into public.appointments (nutritionist_id, patient_id, starts_at, ends_at)
    values (a, pb, '2030-02-01 10:00+00', '2030-02-01 10:30+00');
    res := res || E'foreign patient: NOT BLOCKED (bad)\n';
  exception when others then
    res := res || E'foreign patient blocked: ok\n';
  end;

  begin
    insert into public.appointments (nutritionist_id, patient_id, appointment_type_id, starts_at, ends_at)
    values (a, pa, tb, '2030-02-01 10:00+00', '2030-02-01 10:30+00');
    res := res || E'foreign type: NOT BLOCKED (bad)\n';
  exception when others then
    res := res || E'foreign type blocked: ok\n';
  end;

  -- RLS: act as nutritionist A
  perform set_config('request.jwt.claims',
    json_build_object('sub', a, 'role', 'authenticated')::text, true);
  set local role authenticated;

  select count(*) into n from public.patients;
  res := res || 'A sees patients: ' || n || E' (expected 1)\n';
  select count(*) into n from public.patients where id = pb;
  res := res || 'A sees B patient: ' || n || E' (expected 0)\n';
  update public.patients set first_name = 'hacked' where id = pb;
  get diagnostics n = row_count;
  res := res || 'A updates B patient rows: ' || n || E' (expected 0)\n';
  begin
    insert into public.patients (nutritionist_id, first_name, last_name) values (b, 'x', 'y');
    res := res || E'A inserts as B: NOT BLOCKED (bad)\n';
  exception when others then
    res := res || E'A inserts as B blocked: ok\n';
  end;
  reset role;

  raise exception E'TEST RESULTS (rolled back)\n%', res;
end $$;
