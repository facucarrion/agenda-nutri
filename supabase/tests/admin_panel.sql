-- Integration test for the owner panel's database objects (admin_log and
-- admin_account_stats). Run in the Supabase SQL editor (or via execute_sql).
-- It always ends with an exception on purpose, so nothing is persisted; the
-- message lists results. Every line must end in "ok" or match "(expected N)".

do $$
declare
  res text := '';
begin
  -- The service role (server code of the panel) can write and read the log...
  set local role service_role;
  begin
    insert into public.admin_log (admin_email, action, target) values ('test@test.local', 'test', 'x');
    res := res || E'service_role insert log: ok\n';
  exception when others then
    res := res || E'service_role insert log: FAIL\n';
  end;
  begin
    perform count(*) from public.admin_log;
    res := res || E'service_role read log: ok\n';
  exception when others then
    res := res || E'service_role read log: FAIL\n';
  end;

  -- ...but never rewrite history.
  begin
    update public.admin_log set action = 'changed';
    res := res || E'service_role update log: NOT BLOCKED (bad)\n';
  exception when others then
    res := res || E'service_role update blocked: ok\n';
  end;
  begin
    delete from public.admin_log;
    res := res || E'service_role delete log: NOT BLOCKED (bad)\n';
  exception when others then
    res := res || E'service_role delete blocked: ok\n';
  end;
  begin
    perform * from public.admin_account_stats();
    res := res || E'service_role stats: ok\n';
  exception when others then
    res := res || E'service_role stats: FAIL\n';
  end;
  reset role;

  -- Signed-in nutritionists and visitors reach none of it.
  set local role authenticated;
  begin
    perform count(*) from public.admin_log;
    res := res || E'authenticated read log: NOT BLOCKED (bad)\n';
  exception when others then
    res := res || E'authenticated read log blocked: ok\n';
  end;
  begin
    insert into public.admin_log (admin_email, action) values ('x@x.com', 'x');
    res := res || E'authenticated insert log: NOT BLOCKED (bad)\n';
  exception when others then
    res := res || E'authenticated insert log blocked: ok\n';
  end;
  begin
    perform * from public.admin_account_stats();
    res := res || E'authenticated stats: NOT BLOCKED (bad)\n';
  exception when others then
    res := res || E'authenticated stats blocked: ok\n';
  end;
  reset role;

  set local role anon;
  begin
    perform count(*) from public.admin_log;
    res := res || E'anon read log: NOT BLOCKED (bad)\n';
  exception when others then
    res := res || E'anon read log blocked: ok\n';
  end;
  begin
    perform * from public.admin_account_stats();
    res := res || E'anon stats: NOT BLOCKED (bad)\n';
  exception when others then
    res := res || E'anon stats blocked: ok\n';
  end;
  reset role;

  raise exception E'TEST RESULTS (rolled back)\n%', res;
end $$;
