create or replace function public.admin_room_timer_setup(
  p_gathering uuid, p_mode text, p_turn int, p_pool int,
  p_byo int, p_periods int, p_order uuid[]
) returns public.room_timers
language plpgsql security definer set search_path = '' as $$
declare
  r public.room_timers;
  rem jsonb := '{}'::jsonb;
  u uuid;
begin
  if not (select public.is_admin()) then
    raise exception 'admin only';
  end if;
  if exists (
    select 1 from unnest(coalesce(p_order, '{}'::uuid[])) x
    where not exists (
      select 1 from public.gathering_attendees a
      where a.gathering_id = p_gathering and a.user_id = x
    )
  ) then
    raise exception 'order contains non-attendee';
  end if;
  foreach u in array coalesce(p_order, '{}'::uuid[]) loop
    rem := rem || jsonb_build_object(u::text,
      jsonb_build_object('pool', p_pool, 'periods', p_periods));
  end loop;
  insert into public.room_timers as t (
    gathering_id, mode, turn_seconds, pool_seconds, byoyomi_seconds,
    byoyomi_periods, order_user_ids, current_index, running,
    turn_started_at, remaining, updated_at, updated_by)
  values (
    p_gathering, p_mode, p_turn, p_pool, p_byo, p_periods,
    coalesce(p_order, '{}'::uuid[]), 0, false, null, rem, now(), auth.uid())
  on conflict (gathering_id) do update set
    mode = excluded.mode, turn_seconds = excluded.turn_seconds,
    pool_seconds = excluded.pool_seconds,
    byoyomi_seconds = excluded.byoyomi_seconds,
    byoyomi_periods = excluded.byoyomi_periods,
    order_user_ids = excluded.order_user_ids, current_index = 0,
    running = false, turn_started_at = null, remaining = excluded.remaining,
    updated_at = now(), updated_by = auth.uid()
  returning * into r;
  return r;
end $$;

create or replace function public.room_timer_act(p_gathering uuid, p_action text)
returns public.room_timers
language plpgsql security definer set search_path = '' as $$
declare
  t public.room_timers;
  v_n int;
  v_cur uuid;
  v_elapsed int := 0;
  v_rem jsonb;
  v_entry jsonb;
  v_pool int;
  v_periods int;
begin
  if p_action not in ('start', 'pause', 'next') then
    raise exception 'bad action';
  end if;
  select * into t from public.room_timers
    where gathering_id = p_gathering for update;
  if not found then raise exception 'no timer'; end if;
  v_n := coalesce(array_length(t.order_user_ids, 1), 0);
  if v_n = 0 then raise exception 'empty order'; end if;
  v_cur := t.order_user_ids[t.current_index + 1];
  if not ((select public.is_admin()) or v_cur = auth.uid()) then
    raise exception 'not allowed';
  end if;

  if t.running and t.turn_started_at is not null then
    v_elapsed := greatest(0, floor(extract(epoch from (now() - t.turn_started_at)))::int);
  end if;

  v_rem := t.remaining;
  if t.running and t.mode <> 'turn' and p_action in ('pause', 'next') then
    v_entry := coalesce(v_rem -> v_cur::text,
      jsonb_build_object('pool', t.pool_seconds, 'periods', t.byoyomi_periods));
    v_pool := (v_entry ->> 'pool')::int;
    v_periods := (v_entry ->> 'periods')::int;
    if t.mode = 'pool' then
      v_pool := greatest(0, v_pool - v_elapsed);
    elsif v_pool > 0 then
      v_pool := greatest(0, v_pool - v_elapsed);
    elsif v_elapsed > t.byoyomi_seconds and v_periods > 0 then
      v_periods := v_periods - 1;
    end if;
    v_rem := jsonb_set(v_rem, array[v_cur::text],
      jsonb_build_object('pool', v_pool, 'periods', v_periods), true);
  end if;

  if p_action = 'start' then
    if t.running then return t; end if;
    update public.room_timers set running = true, turn_started_at = now(),
      updated_at = now(), updated_by = auth.uid()
      where gathering_id = p_gathering returning * into t;
  elsif p_action = 'pause' then
    update public.room_timers set running = false, turn_started_at = null,
      remaining = v_rem, updated_at = now(), updated_by = auth.uid()
      where gathering_id = p_gathering returning * into t;
  else
    update public.room_timers set
      current_index = (t.current_index + 1) % v_n,
      running = true, turn_started_at = now(), remaining = v_rem,
      updated_at = now(), updated_by = auth.uid()
      where gathering_id = p_gathering returning * into t;
  end if;
  return t;
end $$;

revoke all on function public.admin_room_timer_setup(uuid, text, int, int, int, int, uuid[]) from public, anon;
revoke all on function public.room_timer_act(uuid, text) from public, anon;
grant execute on function public.admin_room_timer_setup(uuid, text, int, int, int, int, uuid[]) to authenticated;
grant execute on function public.room_timer_act(uuid, text) to authenticated;

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public' and tablename = 'room_timers'
  ) then
    alter publication supabase_realtime add table public.room_timers;
  end if;
end $$;