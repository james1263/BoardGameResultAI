-- score_templates_before_tool.sql
-- 加 tool 欄位之前，get_score_templates／save_score_template 的線上定義（2026-11-25 使用者貼上）。
-- 還原步驟：先 drop 新版（見下面兩句），再貼下面兩個舊定義，最後重新 revoke／grant。
-- 注意：欄位 tool 不用刪，留著不影響舊函式。

-- drop function if exists public.get_score_templates(text);
-- drop function if exists public.save_score_template(uuid, text, text, jsonb, boolean, boolean, text);

CREATE OR REPLACE FUNCTION public.get_score_templates(p_bgg_name text DEFAULT NULL::text)
 RETURNS TABLE(out_id uuid, out_title text, out_bgg_name text, out_is_official boolean, out_is_shared boolean, out_mine boolean, out_rows jsonb, out_updated_at timestamp with time zone)
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
begin
  if auth.uid() is null or not (public.is_vip() or public.is_admin()) then
    return;
  end if;
  return query
  select t.id, t.title, t.bgg_name, t.is_official, t.is_shared,
         (t.owner_id = auth.uid()), t.rows, t.updated_at
  from public.score_templates t
  where (t.owner_id = auth.uid() or t.is_shared or t.is_official)
    and (p_bgg_name is null or t.bgg_name = p_bgg_name)
  order by t.is_official desc, (t.owner_id = auth.uid()) desc, t.updated_at desc;
end;
$function$;

CREATE OR REPLACE FUNCTION public.save_score_template(p_id uuid, p_title text, p_bgg_name text, p_rows jsonb, p_shared boolean, p_official boolean DEFAULT false)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  v_uid uuid := auth.uid();
  v_admin boolean;
  v_title text := btrim(coalesce(p_title, ''));
  v_bgg text := nullif(btrim(coalesce(p_bgg_name, '')), '');
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
    insert into public.score_templates (owner_id, title, bgg_name, is_official, is_shared, rows)
    values (v_uid, v_title, v_bgg, coalesce(p_official, false) and v_admin,
            coalesce(p_shared, false), p_rows)
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
           is_shared = coalesce(p_shared, false),
           is_official = case when v_admin then coalesce(p_official, false) else is_official end,
           updated_at = now()
     where id = p_id
    returning id into v_id;
  end if;
  return v_id;
end;
$function$;

-- 還原後重新設定權限（原本只有 postgres、authenticated、service_role）
-- revoke execute on function public.get_score_templates(text) from public, anon;
-- grant execute on function public.get_score_templates(text) to authenticated, service_role;
-- revoke execute on function public.save_score_template(uuid, text, text, jsonb, boolean, boolean) from public, anon;
-- grant execute on function public.save_score_template(uuid, text, text, jsonb, boolean, boolean) to authenticated, service_role;
