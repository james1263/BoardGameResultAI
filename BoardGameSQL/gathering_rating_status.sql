-- 內部核心（SQL Editor 可測，前端不能呼叫）
create or replace function public._gathering_rating_status_core(p_gathering uuid)
returns table(
  out_user_id uuid,
  out_nickname text,
  out_contact text,
  out_source text,
  out_exempt boolean,
  out_is_admin boolean,
  out_game_count integer,
  out_rated_count integer,
  out_day_qualified boolean
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  return query
  select
    a.user_id,
    coalesce(p.nickname, '（未命名）'),
    c.contact_name,
    a.source,
    a.exempt,
    public.is_admin_user(a.user_id),
    (select count(*)
       from public.gathering_games gg
      where gg.gathering_id = p_gathering
        and gg.removed_at is null)::integer,
    (select count(*)
       from public.gathering_games gg
       join public.game_ratings r
         on r.user_id = a.user_id
        and r.bgg_name = gg.bgg_name
        and r.overall is not null
        and r.like_score is not null
        and r.player_impact_score is not null
        and r.communication_score is not null
        and r.change_score is not null
        and r.unique_score is not null
        and r.keep_score is not null
      where gg.gathering_id = p_gathering
        and gg.removed_at is null)::integer,
    coalesce(
      (select s.qualified
         from public.loyalty_day_status(a.user_id) s
        where s.day_date = g.gathered_on),
      false)
  from public.gathering_attendees a
  join public.gatherings g on g.id = a.gathering_id
  left join public.player_profiles p on p.id = a.user_id
  left join public.player_contacts c on c.user_id = a.user_id
  where a.gathering_id = p_gathering
  order by a.created_at;
end $$;

revoke all on function public._gathering_rating_status_core(uuid) from public, anon, authenticated;

-- 管理者包裝（前端呼叫）
create or replace function public.admin_get_gathering_rating_status(p_gathering uuid)
returns table(
  out_user_id uuid,
  out_nickname text,
  out_contact text,
  out_source text,
  out_exempt boolean,
  out_is_admin boolean,
  out_game_count integer,
  out_rated_count integer,
  out_day_qualified boolean
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception 'not admin';
  end if;
  return query select * from public._gathering_rating_status_core(p_gathering);
end $$;

revoke all on function public.admin_get_gathering_rating_status(uuid) from public, anon;
grant execute on function public.admin_get_gathering_rating_status(uuid) to authenticated;