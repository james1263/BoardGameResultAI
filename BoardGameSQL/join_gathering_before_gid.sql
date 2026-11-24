-- join_gathering 舊版（只回 result_status、result_date），還原用：先 drop 新版再執行這份
-- drop function if exists public.join_gathering(text);

create or replace function public.join_gathering(p_token text)
 returns table(result_status text, result_date date)
 language plpgsql
 security definer
 set search_path to ''
as $function$
declare
  v_uid uuid := auth.uid();
  v_check public.gathering_checkins%rowtype;
  v_date date;
  v_today date := (now() at time zone 'Asia/Taipei')::date;
  v_count integer;
begin
  if v_uid is null then
    return query select 'not_logged_in'::text, null::date;
    return;
  end if;

  select * into v_check
  from public.gathering_checkins c
  where c.token = btrim(coalesce(p_token, ''));

  if not found then
    return query select 'invalid'::text, null::date;
    return;
  end if;

  select g.gathered_on into v_date
  from public.gatherings g
  where g.id = v_check.gathering_id
  for update;

  if v_date > v_today then
    return query select 'not_started'::text, v_date;
    return;
  end if;

  if v_date < v_today then
    return query select 'ended'::text, v_date;
    return;
  end if;

  if exists (
    select 1 from public.gathering_attendees a
    where a.gathering_id = v_check.gathering_id and a.user_id = v_uid
  ) then
    return query select 'already'::text, v_date;
    return;
  end if;

  if not v_check.is_open then
    return query select 'closed'::text, v_date;
    return;
  end if;

  if not exists (select 1 from public.player_profiles p where p.id = v_uid) then
    return query select 'no_profile'::text, v_date;
    return;
  end if;

  if not exists (select 1 from public.player_contacts pc where pc.user_id = v_uid) then
    return query select 'no_contact'::text, v_date;
    return;
  end if;

  if v_check.capacity is not null then
    select count(*) into v_count
    from public.gathering_attendees a
    where a.gathering_id = v_check.gathering_id;

    if v_count >= v_check.capacity then
      return query select 'full'::text, v_date;
      return;
    end if;
  end if;

  insert into public.gathering_attendees (gathering_id, user_id, source)
  values (v_check.gathering_id, v_uid, 'self');

  return query select 'joined'::text, v_date;
end;
$function$;

revoke all on function public.join_gathering(text) from public, anon;
grant execute on function public.join_gathering(text) to authenticated, service_role;
