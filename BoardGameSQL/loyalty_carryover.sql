-- 集點規則：同月出席 >=4 次（含用券日），月底剩下的 1 點保留到下個月（只留一個月）
-- 2026-11-23。還原用：loyalty_before_carryover.sql（改之前的函式定義）

-- 1) 每月月初帶進來的點數
create or replace function public.loyalty_month_carry(p_user uuid)
 returns table(month_start date, carry_in integer)
 language sql
 stable security definer
 set search_path to ''
as $function$
  with recursive
  q as (
    select date_trunc('month', d.day_date::timestamp)::date as m,
           exists (select 1 from public.loyalty_redemptions r
                   where r.user_id = p_user and r.used_on = d.day_date) as redeemed
    from public.loyalty_qualified_days(p_user) d
  ),
  mon as (
    select q.m, count(*)::int as visits,
           (count(*) filter (where not q.redeemed))::int as n
    from q group by q.m
  ),
  adj as (
    select a.adj_month as m, sum(a.delta)::int as d
    from public.loyalty_adjustments a
    where a.user_id = p_user and a.kind = 'point'
    group by a.adj_month
  ),
  bounds as (
    select least((select min(mon.m) from mon), (select min(adj.m) from adj)) as lo,
           date_trunc('month', (now() at time zone 'Asia/Taipei'))::date as hi
  ),
  chain as (
    select b.lo as m, 0 as c from bounds b where b.lo is not null
    union all
    select (ch.m + interval '1 month')::date,
           case when coalesce(mo.visits, 0) >= 4
                 and greatest(coalesce(mo.n, 0) + ch.c + coalesce(ad.d, 0), 0) % 2 = 1
                 and coalesce(mo.n, 0) + coalesce(ad.d, 0) >= 1
                then 1 else 0 end
    from chain ch
    left join mon mo on mo.m = ch.m
    left join adj ad on ad.m = ch.m
    where ch.m < (select hi from bounds)
  )
  select chain.m, chain.c from chain;
$function$;

-- 2) 月內編號加上保留點
create or replace function public.loyalty_point_days(p_user uuid)
 returns table(day_date date, month_start date, month_rank integer)
 language sql
 stable security definer
 set search_path to ''
as $function$
  select x.day_date, x.ms, x.rk + coalesce(c.carry_in, 0)
  from (
    select q.day_date,
           date_trunc('month', q.day_date::timestamp)::date as ms,
           (row_number() over (
              partition by date_trunc('month', q.day_date::timestamp)
              order by q.day_date))::int as rk
    from public.loyalty_qualified_days(p_user) q
    where not exists (
      select 1 from public.loyalty_redemptions r
      where r.user_id = p_user and r.used_on = q.day_date
    )
  ) x
  left join public.loyalty_month_carry(p_user) c on c.month_start = x.ms;
$function$;

-- 3) 管理者調點的券數對齊
create or replace function public.loyalty_adjust_vouchers(p_user uuid)
 returns integer
 language sql
 stable security definer
 set search_path to ''
as $function$
  with pd as (
    select p.month_start as m, count(*)::int as n
    from public.loyalty_point_days(p_user) p
    group by p.month_start
  ), adj as (
    select a.adj_month as m, sum(a.delta)::int as d
    from public.loyalty_adjustments a
    where a.user_id = p_user and a.kind = 'point'
    group by a.adj_month
  ), cy as (
    select k.month_start as m, k.carry_in as cin
    from public.loyalty_month_carry(p_user) k
  ), ml as (
    select pd.m from pd
    union select adj.m from adj
    union select cy.m from cy
  ), mm as (
    select ml.m,
           coalesce(pd.n, 0) as n,
           coalesce(adj.d, 0) as d,
           coalesce(cy.cin, 0) as c
    from ml
    left join pd on pd.m = ml.m
    left join adj on adj.m = ml.m
    left join cy on cy.m = ml.m
  )
  select (coalesce((select sum(greatest(mm.n + mm.c + mm.d, 0) / 2 - (mm.n + mm.c) / 2) from mm), 0)
        + coalesce((select sum(delta) from public.loyalty_adjustments
                    where user_id = p_user and kind = 'voucher'), 0))::int;
$function$;

-- 4) 本月點數把保留點算進去
create or replace function public.loyalty_totals(p_user uuid)
 returns table(total_points integer, month_points integer, earned_vouchers integer, usable_vouchers integer)
 language sql
 stable security definer
 set search_path to ''
as $function$
  with pd as (select * from public.loyalty_point_days(p_user)),
       t as (select (now() at time zone 'Asia/Taipei')::date as today),
       g as (select coalesce(sum(quantity), 0)::int as n
             from public.loyalty_grants where user_id = p_user),
       pa as (select coalesce(sum(delta), 0)::int as n
              from public.loyalty_adjustments
              where user_id = p_user and kind = 'point'),
       pc as (select coalesce(sum(a.delta), 0)::int as n
              from public.loyalty_adjustments a, t
              where a.user_id = p_user and a.kind = 'point'
                and a.adj_month = date_trunc('month', t.today::timestamp)::date),
       cn as (select coalesce(sum(k.carry_in), 0)::int as n
              from public.loyalty_month_carry(p_user) k, t
              where k.month_start = date_trunc('month', t.today::timestamp)::date),
       av as (select public.loyalty_adjust_vouchers(p_user) as n)
  select
    greatest((select count(*) from pd)::int + (select n from pa), 0),
    greatest((select count(*) from pd, t
              where pd.month_start = date_trunc('month', t.today::timestamp)::date)::int
             + (select n from pc) + (select n from cn), 0) % 2,
    (select count(*) from pd where pd.month_rank % 2 = 0)::int
      + (select n from g) + (select n from av),
    (select count(*) from pd, t
       where pd.month_rank % 2 = 0 and pd.day_date < t.today)::int
      + (select n from g) + (select n from av);
$function$;

-- 5) 前端用：本月保留點與本月出席次數
create or replace function public.get_my_loyalty_carry()
 returns table(carry_in integer, month_visits integer)
 language sql
 stable security definer
 set search_path to ''
as $function$
  select
    coalesce((select k.carry_in
              from public.loyalty_month_carry((select auth.uid())) k
              where k.month_start = date_trunc('month', (now() at time zone 'Asia/Taipei'))::date
              limit 1), 0)::int,
    (select count(*)::int
       from public.loyalty_qualified_days((select auth.uid())) q
       where date_trunc('month', q.day_date::timestamp)::date
             = date_trunc('month', (now() at time zone 'Asia/Taipei'))::date);
$function$;

create or replace function public.admin_get_loyalty_carry()
 returns table(user_id uuid, carry_in integer, month_visits integer)
 language plpgsql
 stable security definer
 set search_path to ''
as $function$
declare
  v_m date := date_trunc('month', (now() at time zone 'Asia/Taipei'))::date;
begin
  if not public.is_admin() then
    raise exception 'not allowed';
  end if;
  return query
    select a.uid,
           coalesce((select k.carry_in from public.loyalty_month_carry(a.uid) k
                     where k.month_start = v_m limit 1), 0)::int,
           (select count(*)::int from public.loyalty_qualified_days(a.uid) q
              where date_trunc('month', q.day_date::timestamp)::date = v_m)
    from (select distinct x.user_id as uid from public.gathering_attendees x) a
    where not public.is_admin_user(a.uid);
end;
$function$;

-- 權限：內部函式不開放給前端直接呼叫；前端用的兩個只給登入者
revoke all on function public.loyalty_month_carry(uuid) from public, anon, authenticated;
revoke all on function public.get_my_loyalty_carry() from public, anon;
grant execute on function public.get_my_loyalty_carry() to authenticated;
revoke all on function public.admin_get_loyalty_carry() from public, anon;
grant execute on function public.admin_get_loyalty_carry() to authenticated;
