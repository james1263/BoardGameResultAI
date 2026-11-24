-- 歷史聚會「誰沒評分」列表摘要（管理者唯讀）
-- 依賴 gathering_rating_status.sql 的 _gathering_rating_status_core

create or replace function public._gatherings_rating_summary_core()
returns table(
  out_gathering_id uuid,
  out_eligible integer,
  out_unrated integer
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  return query
  select
    g.id,
    (count(*) filter (
      where not s.out_is_admin and not s.out_exempt and s.out_game_count > 0
    ))::integer,
    (count(*) filter (
      where not s.out_is_admin and not s.out_exempt and s.out_game_count > 0
        and s.out_rated_count = 0 and not s.out_day_qualified
    ))::integer
  from public.gatherings g
  cross join lateral public._gathering_rating_status_core(g.id) s
  group by g.id;
end $$;

revoke all on function public._gatherings_rating_summary_core() from public, anon, authenticated;

create or replace function public.admin_get_gatherings_rating_summary()
returns table(
  out_gathering_id uuid,
  out_eligible integer,
  out_unrated integer
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
  return query select * from public._gatherings_rating_summary_core();
end $$;

revoke all on function public.admin_get_gatherings_rating_summary() from public, anon;
grant execute on function public.admin_get_gatherings_rating_summary() to authenticated;
