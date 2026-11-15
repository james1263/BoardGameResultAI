-- miss_kind_step2.sql（2026-11-15）
-- 在 Supabase SQL Editor 執行（需先完成 step1）。
-- 內容：內部記錄函式 _log_search_misses、改寫三個既有 admin 函式（回傳欄位不變）、新增三個 admin 函式。

create or replace function public._log_search_misses(p_bgg_name text, p_text text, p_source text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  with zh as (
    select distinct (m)[1] as t
      from regexp_matches(p_text, '([\u4e00-\u9fff]+)', 'g') as m
  ),
  en as (
    select distinct lower(x) as t
      from unnest(regexp_split_to_array(
             regexp_replace(p_text, '[\u4e00-\u9fff]+', ' ', 'g'), '[^[:alnum:]]+')) as x
     where length(x) between 3 and 30
       and lower(x) <> all (array['the','and','for','can','are','was','not','you','with','that','this','from','have','has','what','who','how','does','did','may','any','its','but','one','all','out'])
     limit 5
  )
  insert into public.game_glossary_misses (bgg_name, zh_term, kind, source)
  select p_bgg_name, q.t, 'search_zero_result', p_source
    from (
      select t from zh where length(t) between 2 and 30
      union
      select t from en
    ) q
  on conflict (bgg_name, zh_term, kind, source) do update
    set hit_count = public.game_glossary_misses.hit_count + 1,
        last_seen = now();
end;
$$;

revoke all on function public._log_search_misses(text, text, text) from public, anon, authenticated;

-- 原有三個函式：回傳欄位不變，只看 glossary_miss，並合併 user／admin 次數
create or replace function public.admin_get_glossary_misses(p_bgg_name text default null::text)
 returns table(bgg_name text, zh_term text, hit_count integer, last_seen timestamp with time zone)
 language plpgsql
 stable security definer
 set search_path to ''
as $function$
begin
  if not public.is_admin() then raise exception 'not admin'; end if;
  return query
  select m.bgg_name, m.zh_term, sum(m.hit_count)::int, max(m.last_seen)
    from public.game_glossary_misses m
   where m.kind = 'glossary_miss'
     and (p_bgg_name is null or m.bgg_name = p_bgg_name)
     and not exists (select 1 from public.game_glossary g
                      where g.bgg_name = m.bgg_name
                        and (position(g.zh_term in m.zh_term) > 0
                          or position(m.zh_term in g.zh_term) > 0))
   group by m.bgg_name, m.zh_term
   order by m.bgg_name, sum(m.hit_count) desc, max(m.last_seen) desc;
end;
$function$;

create or replace function public.admin_delete_glossary_miss(p_bgg_name text, p_zh_term text)
 returns void
 language plpgsql
 security definer
 set search_path to ''
as $function$
begin
  if not public.is_admin() then raise exception 'not admin'; end if;
  delete from public.game_glossary_misses
   where bgg_name = p_bgg_name and zh_term = p_zh_term and kind = 'glossary_miss';
end;
$function$;

create or replace function public.admin_clear_glossary_misses()
 returns void
 language plpgsql
 security definer
 set search_path to ''
as $function$
begin
  if not public.is_admin() then raise exception 'not admin'; end if;
  delete from public.game_glossary_misses where kind = 'glossary_miss';
end;
$function$;

-- 新增：讀取所有類型（含零結果），不套用詞庫排除
create or replace function public.admin_get_search_misses(p_bgg_name text default null)
 returns table(bgg_name text, zh_term text, kind text, source text, hit_count integer, last_seen timestamp with time zone)
 language plpgsql
 stable security definer
 set search_path to ''
as $function$
begin
  if not public.is_admin() then raise exception 'not admin'; end if;
  return query
  select m.bgg_name, m.zh_term, m.kind, m.source, m.hit_count, m.last_seen
    from public.game_glossary_misses m
   where (p_bgg_name is null or m.bgg_name = p_bgg_name)
   order by m.bgg_name, m.kind, m.hit_count desc, m.last_seen desc;
end;
$function$;

create or replace function public.admin_delete_search_miss(p_bgg_name text, p_zh_term text, p_kind text)
 returns void
 language plpgsql
 security definer
 set search_path to ''
as $function$
begin
  if not public.is_admin() then raise exception 'not admin'; end if;
  delete from public.game_glossary_misses
   where bgg_name = p_bgg_name and zh_term = p_zh_term and kind = p_kind;
end;
$function$;

create or replace function public.admin_clear_search_misses()
 returns void
 language plpgsql
 security definer
 set search_path to ''
as $function$
begin
  if not public.is_admin() then raise exception 'not admin'; end if;
  delete from public.game_glossary_misses where kind = 'search_zero_result';
end;
$function$;

revoke all on function public.admin_get_search_misses(text) from public, anon;
revoke all on function public.admin_delete_search_miss(text, text, text) from public, anon;
revoke all on function public.admin_clear_search_misses() from public, anon;
grant execute on function public.admin_get_search_misses(text) to authenticated;
grant execute on function public.admin_delete_search_miss(text, text, text) to authenticated;
grant execute on function public.admin_clear_search_misses() to authenticated;
