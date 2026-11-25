-- 4b-1 第二段：遊戲桌寫入函式（前端不直接寫表，全部走這裡）

-- 開桌（只有管理者；同一場聚會最多 10 桌）
create or replace function public.game_table_create(p_gathering uuid, p_title text, p_bgg text default null)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare v_id uuid;
begin
  if not coalesce(public.is_admin(), false) then raise exception 'admin only'; end if;
  if not exists (select 1 from public.gatherings where id = p_gathering) then
    raise exception 'gathering not found';
  end if;
  if char_length(btrim(coalesce(p_title, ''))) not between 1 and 40 then
    raise exception 'bad title';
  end if;
  if (select count(*) from public.game_tables where gathering_id = p_gathering) >= 10 then
    raise exception 'too many tables';
  end if;
  insert into public.game_tables (gathering_id, title, bgg_name, created_by)
  values (p_gathering, btrim(p_title), nullif(btrim(coalesce(p_bgg, '')), ''), auth.uid())
  returning id into v_id;
  return v_id;
end $$;

-- 存設定（階段、工具、停用、資源列、計分列、旭日組別、結束桌）
create or replace function public.game_table_save_setup(
  p_table uuid, p_phase text, p_closed boolean,
  p_tools text[], p_disabled text[],
  p_res_rows jsonb, p_score_rows jsonb, p_hold_sets text[]
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare v_all text[] := array['resource', 'score', 'dice', 'timer'];
begin
  if not coalesce(public.is_admin(), false) then raise exception 'admin only'; end if;
  if p_phase not in ('setup', 'play') then raise exception 'bad phase'; end if;
  if not (coalesce(p_tools, '{}') <@ v_all) or not (coalesce(p_disabled, '{}') <@ v_all) then
    raise exception 'bad tools';
  end if;
  if jsonb_typeof(p_res_rows) <> 'array' or jsonb_array_length(p_res_rows) > 30
     or jsonb_typeof(p_score_rows) <> 'array' or jsonb_array_length(p_score_rows) > 30 then
    raise exception 'bad rows';
  end if;
  if coalesce(array_length(p_hold_sets, 1), 0) > 20 then raise exception 'bad sets'; end if;
  update public.game_tables
     set phase = p_phase, closed = coalesce(p_closed, false),
         tools = coalesce(p_tools, '{}'), disabled = coalesce(p_disabled, '{}'),
         res_rows = p_res_rows, score_rows = p_score_rows,
         hold_sets = coalesce(p_hold_sets, '{}'), updated_at = now()
   where id = p_table;
  if not found then raise exception 'table not found'; end if;
end $$;

-- 加玩家格（可綁定一位這場聚會的出席者；最多 12 格）
create or replace function public.game_table_add_player(p_table uuid, p_name text, p_user uuid default null)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare v_g uuid; v_id uuid;
begin
  if not coalesce(public.is_admin(), false) then raise exception 'admin only'; end if;
  select gathering_id into v_g from public.game_tables where id = p_table;
  if v_g is null then raise exception 'table not found'; end if;
  if char_length(btrim(coalesce(p_name, ''))) not between 1 and 20 then raise exception 'bad name'; end if;
  if (select count(*) from public.game_table_players where table_id = p_table) >= 12 then
    raise exception 'too many players';
  end if;
  if p_user is not null and not exists (
    select 1 from public.gathering_attendees where gathering_id = v_g and user_id = p_user
  ) then
    raise exception 'user not in gathering';
  end if;
  insert into public.game_table_players (table_id, name, user_id, sort_order)
  values (p_table, btrim(p_name), p_user,
          coalesce((select max(sort_order) + 1 from public.game_table_players where table_id = p_table), 0))
  returning id into v_id;
  update public.game_tables set updated_at = now() where id = p_table;
  return v_id;
end $$;

-- 改玩家格（名稱、綁定者、順序；p_user 傳 null＝解除綁定）
create or replace function public.game_table_update_player(p_player uuid, p_name text, p_user uuid, p_sort int)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare v_t uuid; v_g uuid;
begin
  if not coalesce(public.is_admin(), false) then raise exception 'admin only'; end if;
  select p.table_id, t.gathering_id into v_t, v_g
    from public.game_table_players p join public.game_tables t on t.id = p.table_id
   where p.id = p_player;
  if v_t is null then raise exception 'player not found'; end if;
  if char_length(btrim(coalesce(p_name, ''))) not between 1 and 20 then raise exception 'bad name'; end if;
  if p_user is not null and not exists (
    select 1 from public.gathering_attendees where gathering_id = v_g and user_id = p_user
  ) then
    raise exception 'user not in gathering';
  end if;
  update public.game_table_players
     set name = btrim(p_name), user_id = p_user, sort_order = coalesce(p_sort, sort_order)
   where id = p_player;
  update public.game_tables set updated_at = now() where id = v_t;
end $$;

-- 刪玩家格（他的數字一起刪）
create or replace function public.game_table_remove_player(p_player uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare v_t uuid;
begin
  if not coalesce(public.is_admin(), false) then raise exception 'admin only'; end if;
  delete from public.game_table_players where id = p_player returning table_id into v_t;
  if v_t is null then raise exception 'player not found'; end if;
  update public.game_tables set updated_at = now() where id = v_t;
end $$;

-- 改一格數字：管理者改全部；玩家只能改自己綁定的那一格；桌子結束後誰都不能改
create or replace function public.game_table_set_value(p_player uuid, p_kind text, p_item text, p_value int)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare v_t uuid; v_user uuid; v_closed boolean; v_val int;
begin
  if auth.uid() is null then raise exception 'not signed in'; end if;
  if p_kind not in ('res', 'score', 'hold') then raise exception 'bad kind'; end if;
  if char_length(coalesce(p_item, '')) not between 1 and 60 then raise exception 'bad item'; end if;
  select p.table_id, p.user_id, t.closed into v_t, v_user, v_closed
    from public.game_table_players p join public.game_tables t on t.id = p.table_id
   where p.id = p_player;
  if v_t is null then raise exception 'player not found'; end if;
  if v_closed then raise exception 'table closed'; end if;
  if not coalesce(public.is_admin(), false) then
    if v_user is null or v_user <> auth.uid() or not public.game_table_visible(v_t) then
      raise exception 'not your slot';
    end if;
  end if;
  v_val := greatest(0, least(999999, coalesce(p_value, 0)));
  insert into public.game_table_values (table_id, player_id, kind, item_id, value, updated_by)
  values (v_t, p_player, p_kind, p_item, v_val, auth.uid())
  on conflict (player_id, kind, item_id)
  do update set value = excluded.value, updated_at = now(), updated_by = auth.uid();
end $$;

-- 刪整桌（數字、玩家格一起刪）
create or replace function public.game_table_delete(p_table uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not coalesce(public.is_admin(), false) then raise exception 'admin only'; end if;
  delete from public.game_tables where id = p_table;
end $$;

-- 權限：只有登入者能呼叫，anon 不行
do $$
declare r record;
begin
  for r in
    select p.oid::regprocedure as sig
    from pg_proc p join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public' and p.proname in (
      'game_table_create', 'game_table_save_setup', 'game_table_add_player',
      'game_table_update_player', 'game_table_remove_player',
      'game_table_set_value', 'game_table_delete'
    )
  loop
    execute format('revoke all on function %s from public, anon', r.sig);
    execute format('grant execute on function %s to authenticated', r.sig);
  end loop;
end $$;
