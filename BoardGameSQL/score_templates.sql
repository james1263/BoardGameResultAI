-- score_templates.sql（2026-11-25）計數／計分範本：資料表＋三個函式
-- 只走函式：資料表 RLS 全開、不給任何政策，anon／authenticated 沒有直接權限。
-- owner_id 外鍵 on delete cascade：admin_delete_member 刪 auth.users 時，該玩家建的範本一起消失，不需要改刪帳號函式。
-- rows 是 jsonb 陣列，每列：
--   { "id": 字串, "name": 1~20 字, "icon": 表情符號(≤12 字元), "kind": "count"|"hold"|"score",
--     "sign": 1 或 -1, "mult": 數字(-1000~1000), "init": 數字(0~9999) }
-- 可重複執行（if not exists／create or replace）。

create table if not exists public.score_templates (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 40),
  bgg_name text check (bgg_name is null or char_length(bgg_name) <= 200),
  is_official boolean not null default false,
  is_shared boolean not null default false,
  rows jsonb not null default '[]'::jsonb check (jsonb_typeof(rows) = 'array'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists score_templates_owner_idx
  on public.score_templates (owner_id);
create index if not exists score_templates_bgg_idx
  on public.score_templates (bgg_name) where bgg_name is not null;

alter table public.score_templates enable row level security;
revoke all on public.score_templates from anon, authenticated;

-- 讀取：只有 VIP／管理者；看得到自己的、別人開啟分享的、管理者標「官方」的
create or replace function public.get_score_templates(p_bgg_name text default null)
returns table (
  out_id uuid,
  out_title text,
  out_bgg_name text,
  out_is_official boolean,
  out_is_shared boolean,
  out_mine boolean,
  out_rows jsonb,
  out_updated_at timestamptz
)
language plpgsql
stable
security definer
set search_path = ''
as $$
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
$$;

-- 新增（p_id 為 null）或修改；一般 VIP 每人最多 20 份；「官方」只有管理者能設
create or replace function public.save_score_template(
  p_id uuid,
  p_title text,
  p_bgg_name text,
  p_rows jsonb,
  p_shared boolean,
  p_official boolean default false
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
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
$$;

-- 刪除：本人或管理者
create or replace function public.delete_score_template(p_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_owner uuid;
begin
  if auth.uid() is null then
    raise exception 'not signed in';
  end if;
  select owner_id into v_owner from public.score_templates where id = p_id;
  if not found then
    return;
  end if;
  if v_owner <> auth.uid() and not public.is_admin() then
    raise exception 'forbidden';
  end if;
  delete from public.score_templates where id = p_id;
end;
$$;

revoke all on function public.get_score_templates(text) from public, anon;
revoke all on function public.save_score_template(uuid, text, text, jsonb, boolean, boolean) from public, anon;
revoke all on function public.delete_score_template(uuid) from public, anon;
grant execute on function public.get_score_templates(text) to authenticated;
grant execute on function public.save_score_template(uuid, text, text, jsonb, boolean, boolean) to authenticated;
grant execute on function public.delete_score_template(uuid) to authenticated;