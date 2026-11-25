
-- 4b-1 第一段：遊戲桌三張表（讀取走出席者規則，寫入之後走函式）

create table if not exists public.game_tables (
  id uuid primary key default gen_random_uuid(),
  gathering_id uuid not null references public.gatherings(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 40),
  bgg_name text,
  phase text not null default 'setup' check (phase in ('setup', 'play')),
  closed boolean not null default false,
  tools text[] not null default '{resource,score}',
  disabled text[] not null default '{}',
  res_rows jsonb not null default '[]'::jsonb,
  score_rows jsonb not null default '[]'::jsonb,
  hold_sets text[] not null default '{}',
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists game_tables_gathering_idx on public.game_tables (gathering_id);

create table if not exists public.game_table_players (
  id uuid primary key default gen_random_uuid(),
  table_id uuid not null references public.game_tables(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 20),
  user_id uuid references auth.users(id) on delete set null,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists game_table_players_table_idx on public.game_table_players (table_id);
create unique index if not exists game_table_players_one_user
  on public.game_table_players (table_id, user_id) where user_id is not null;

create table if not exists public.game_table_values (
  table_id uuid not null references public.game_tables(id) on delete cascade,
  player_id uuid not null references public.game_table_players(id) on delete cascade,
  kind text not null check (kind in ('res', 'score', 'hold')),
  item_id text not null check (char_length(item_id) between 1 and 60),
  value int not null default 0 check (value between 0 and 999999),
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id) on delete set null,
  primary key (player_id, kind, item_id)
);
create index if not exists game_table_values_table_idx on public.game_table_values (table_id);

-- 判斷「我能不能看這一桌」：管理者，或該場聚會的出席者
create or replace function public.game_table_visible(p_table uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(public.is_admin(), false)
      or exists (
        select 1
        from public.game_tables t
        join public.gathering_attendees a on a.gathering_id = t.gathering_id
        where t.id = p_table and a.user_id = auth.uid()
      );
$$;
revoke all on function public.game_table_visible(uuid) from public, anon;
grant execute on function public.game_table_visible(uuid) to authenticated;

alter table public.game_tables enable row level security;
alter table public.game_table_players enable row level security;
alter table public.game_table_values enable row level security;

drop policy if exists "attendee read table" on public.game_tables;
create policy "attendee read table" on public.game_tables
  for select to authenticated using (public.game_table_visible(id));

drop policy if exists "attendee read table players" on public.game_table_players;
create policy "attendee read table players" on public.game_table_players
  for select to authenticated using (public.game_table_visible(table_id));

drop policy if exists "attendee read table values" on public.game_table_values;
create policy "attendee read table values" on public.game_table_values
  for select to authenticated using (public.game_table_visible(table_id));

-- 前端不能直接寫，只能讀
revoke all on public.game_tables, public.game_table_players, public.game_table_values from anon, authenticated;
grant select on public.game_tables, public.game_table_players, public.game_table_values to authenticated;

-- 刪除事件也要帶得出桌子 id，Realtime 才能依桌過濾
alter table public.game_table_players replica identity full;
alter table public.game_table_values replica identity full;

do $$
declare t text;
begin
  foreach t in array array['game_tables', 'game_table_players', 'game_table_values'] loop
    if not exists (
      select 1 from pg_publication_tables
      where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = t
    ) then
      execute format('alter publication supabase_realtime add table public.%I', t);
    end if;
  end loop;
end $$;