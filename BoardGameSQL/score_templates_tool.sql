-- score_templates_tool.sql
-- 拆成「資源計數器」與「計分表」兩個工具：範本表加 tool 欄位（resource／score），
-- get_score_templates 多回傳 out_tool，save_score_template 多一個 p_tool（預設 'score'）。
-- 還原用：score_templates_before_tool.sql
-- 請在 Supabase SQL Editor 一段一段貼上執行（每段單獨跑，不要整批）。
-- 舊前端在部署前仍可正常運作：舊的呼叫不帶 p_tool，會用預設值 'score'。

-- ───── 第 1 段：加欄位（舊的表單一律當計分表）─────
alter table public.score_templates
  add column if not exists tool text not null default 'score'
  constraint score_templates_tool_check check (tool in ('resource', 'score'));


-- ───── 第 2 段：get_score_templates（回傳欄位變了，要先 drop）─────
drop function if exists public.get_score_templates(text);

create function public.get_score_templates(p_bgg_name text default null::text)
 returns table(out_id uuid, out_title text, out_bgg_name text, out_is_official boolean, out_is_shared boolean, out_mine boolean, out_rows jsonb, out_updated_at timestamp with time zone, out_tool text)
 language plpgsql
 stable security definer
 set search_path to ''
as $function$
begin
  if auth.uid() is null or not (public.is_vip() or public.is_admin()) then
    return;
  end if;
  return query
  select t.id, t.title, t.bgg_name, t.is_official, t.is_shared,
         (t.owner_id = auth.uid()), t.rows, t.updated_at, t.tool
  from public.score_templates t
  where (t.owner_id = auth.uid() or t.is_shared or t.is_official)
    and (p_bgg_name is null or t.bgg_name = p_bgg_name)
  order by t.is_official desc, (t.owner_id = auth.uid()) desc, t.updated_at desc;
end;
$function$;

revoke execute on function public.get_score_templates(text) from public, anon;
grant execute on function public.get_score_templates(text) to authenticated, service_role;


-- ───── 第 3 段：save_score_template（多一個參數，要先 drop 舊簽名）─────
drop function if exists public.save_score_template(uuid, text, text, jsonb, boolean, boolean);

create or replace function public.save_score_template(p_id uuid, p_title text, p_bgg_name text, p_rows jsonb, p_shared boolean, p_official boolean default false, p_tool text default 'score'::text)
 returns uuid
 language plpgsql
 security definer
 set search_path to ''
as $function$
declare
  v_uid uuid := auth.uid();
  v_admin boolean;
  v_title text := btrim(coalesce(p_title, ''));
  v_bgg text := nullif(btrim(coalesce(p_bgg_name, '')), '');
  v_tool text := coalesce(nullif(btrim(coalesce(p_tool, '')), ''), 'score');
  v_row jsonb;
  v_owner uuid;
  v_id uuid;
begin
  if v_uid is null then
    raise exception 'not signed in';
  end if;
  v_admin := public.is_admin();
  if not (v_admin or public.is_vip()) then
    raise exception 'vip only';
  end if;
  if v_tool not in ('resource', 'score') then
    raise exception 'bad tool';
  end if;
  if char_length(v_title) < 1 or char_length(v_title) > 40 then
    raise exception 'bad title';
  end if;
  if v_bgg is not null and char_length(v_bgg) > 200 then
    raise exception 'bad bgg_name';
  end if;
  if coalesce(p_official, false) and not v_admin then
    raise exception 'official is admin only';
  end if;
  if coalesce(p_official, false) and v_bgg is null then
    raise exception 'official template needs a game';
  end if;
  if p_rows is null
     or jsonb_typeof(p_rows) <> 'array'
     or jsonb_array_length(p_rows) > 30
     or length(p_rows::text) > 20000 then
    raise exception 'bad rows';
  end if;

  for v_row in select value from jsonb_array_elements(p_rows) loop
    if coalesce(jsonb_typeof(v_row), '') <> 'object' then
      raise exception 'bad row';
    end if;
    if coalesce(v_row->>'kind', '') not in ('count', 'hold', 'score') then
      raise exception 'bad kind';
    end if;
    if char_length(btrim(coalesce(v_row->>'name', ''))) not between 1 and 20 then
      raise exception 'bad name';
    end if;
    if char_length(coalesce(v_row->>'icon', '')) > 12 then
      raise exception 'bad icon';
    end if;
    if coalesce(v_row->>'sign', '') not in ('1', '-1') then
      raise exception 'bad sign';
    end if;
    if coalesce(jsonb_typeof(v_row->'mult'), '') <> 'number'
       or (v_row->>'mult')::numeric not between -1000 and 1000 then
      raise exception 'bad mult';
    end if;
    if coalesce(jsonb_typeof(v_row->'init'), '') <> 'number'
       or (v_row->>'init')::numeric not between 0 and 9999 then
      raise exception 'bad init';
    end if;
  end loop;

  if p_id is null then
    if (select count(*) from public.score_templates where owner_id = v_uid) >= 20 then
      raise exception 'template limit reached';
    end if;
    insert into public.score_templates (owner_id, title, bgg_name, is_official, is_shared, rows, tool)
    values (v_uid, v_title, v_bgg, coalesce(p_official, false) and v_admin,
            coalesce(p_shared, false), p_rows, v_tool)
    returning id into v_id;
  else
    select owner_id into v_owner from public.score_templates where id = p_id;
    if not found then
      raise exception 'not found';
    end if;
    if v_owner <> v_uid and not v_admin then
      raise exception 'forbidden';
    end if;
    update public.score_templates
       set title = v_title,
           bgg_name = v_bgg,
           rows = p_rows,
           tool = v_tool,
           is_shared = coalesce(p_shared, false),
           is_official = case when v_admin then coalesce(p_official, false) else is_official end,
           updated_at = now()
     where id = p_id
    returning id into v_id;
  end if;
  return v_id;
end;
$function$;

revoke execute on function public.save_score_template(uuid, text, text, jsonb, boolean, boolean, text) from public, anon;
grant execute on function public.save_score_template(uuid, text, text, jsonb, boolean, boolean, text) to authenticated, service_role;


-- ───── 第 4 段：驗證（兩句分開跑）─────
-- (a) 應該回 1 列：tool、text、'score'::text
-- select column_name, data_type, column_default from information_schema.columns
--  where table_schema = 'public' and table_name = 'score_templates' and column_name = 'tool';
-- (b) 應該 3 列；save_score_template 只有 1 列（7 個參數）；
--     proacl 都是 {postgres=X/postgres,authenticated=X/postgres,service_role=X/postgres}（沒有 anon）
-- select proname, pg_get_function_identity_arguments(oid) as args, proacl
--   from pg_proc
--  where proname in ('get_score_templates', 'save_score_template', 'delete_score_template');
