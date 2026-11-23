-- 還原用：集點「保留點」改版（2026-11-23）之前的函式定義。
-- 內容取自改版前從線上匯出的定義。要還原時整段貼到 Supabase SQL Editor 執行。
-- 前端已經有呼叫 get_my_loyalty_carry / admin_get_loyalty_carry，
-- 還原後那兩個函式可以留著（不影響），或最後面 drop 掉。

CREATE OR REPLACE FUNCTION public.loyalty_point_days(p_user uuid)
 RETURNS TABLE(day_date date, month_start date, month_rank integer)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
  select q.day_date,
         date_trunc('month', q.day_date::timestamp)::date,
         (row_number() over (
            partition by date_trunc('month', q.day_date::timestamp)
            order by q.day_date))::int
  from public.loyalty_qualified_days(p_user) q
  where not exists (
    select 1 from public.loyalty_redemptions r
    where r.user_id = p_user and r.used_on = q.day_date
  );
$function$;

CREATE OR REPLACE FUNCTION public.loyalty_adjust_vouchers(p_user uuid)
 RETURNS integer
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
  with pd as (
    select month_start as m, count(*)::int as n
    from public.loyalty_point_days(p_user)
    group by month_start
  ), adj as (
    select adj_month as m, sum(delta)::int as d
    from public.loyalty_adjustments
    where user_id = p_user and kind = 'point'
    group by adj_month
  ), mm as (
    select coalesce(pd.m, adj.m) as m, coalesce(pd.n, 0) as n, coalesce(adj.d, 0) as d
    from pd full join adj on pd.m = adj.m
  )
  select (coalesce((select sum(greatest(n + d, 0) / 2 - n / 2) from mm), 0)
        + coalesce((select sum(delta) from public.loyalty_adjustments
                    where user_id = p_user and kind = 'voucher'), 0))::int;
$function$;

CREATE OR REPLACE FUNCTION public.loyalty_totals(p_user uuid)
 RETURNS TABLE(total_points integer, month_points integer, earned_vouchers integer, usable_vouchers integer)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
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
       av as (select public.loyalty_adjust_vouchers(p_user) as n)
  select
    greatest((select count(*) from pd)::int + (select n from pa), 0),
    greatest((select count(*) from pd, t
              where pd.month_start = date_trunc('month', t.today::timestamp)::date)::int
             + (select n from pc), 0) % 2,
    (select count(*) from pd where pd.month_rank % 2 = 0)::int
      + (select n from g) + (select n from av),
    (select count(*) from pd, t
       where pd.month_rank % 2 = 0 and pd.day_date < t.today)::int
      + (select n from g) + (select n from av);
$function$;
