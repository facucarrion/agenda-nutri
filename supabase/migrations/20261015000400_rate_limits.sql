-- Fixed-window rate limiter backed by Postgres (serverless-safe, no extra infra).
create table public.rate_limits (
  key text primary key,
  window_start timestamptz not null default now(),
  count integer not null default 0
);

-- RLS on with no policies: only the service_role can touch it.
alter table public.rate_limits enable row level security;

create function public.rate_limit_hit(
  p_key text,
  p_max integer,
  p_window_seconds integer
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  hits integer;
begin
  insert into public.rate_limits as r (key, window_start, count)
  values (p_key, now(), 1)
  on conflict (key) do update
    set count = case
          when r.window_start < now() - make_interval(secs => p_window_seconds)
          then 1 else r.count + 1 end,
        window_start = case
          when r.window_start < now() - make_interval(secs => p_window_seconds)
          then now() else r.window_start end
  returning r.count into hits;

  -- Opportunistic cleanup of stale counters.
  if random() < 0.01 then
    delete from public.rate_limits where window_start < now() - interval '1 day';
  end if;

  return hits <= p_max;
end;
$$;

revoke execute on function public.rate_limit_hit(text, integer, integer)
  from public, anon, authenticated;
grant execute on function public.rate_limit_hit(text, integer, integer)
  to service_role;
