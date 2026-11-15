-- miss_kind_step1.sql（2026-11-15）
-- 已在 Supabase 執行並驗證，僅留存紀錄，不要重跑（重跑會因為約束已存在而出錯）。
-- 用途：game_glossary_misses 加上 kind（glossary_miss／search_zero_result）與 source（user／admin），
--       主鍵改成 (bgg_name, zh_term, kind, source)。

alter table public.game_glossary_misses
  add column if not exists kind text not null default 'glossary_miss',
  add column if not exists source text not null default 'user';

alter table public.game_glossary_misses
  add constraint game_glossary_misses_kind_check
    check (kind in ('glossary_miss', 'search_zero_result')),
  add constraint game_glossary_misses_source_check
    check (source in ('user', 'admin'));

alter table public.game_glossary_misses
  drop constraint game_glossary_misses_pkey;

alter table public.game_glossary_misses
  add primary key (bgg_name, zh_term, kind, source);

-- 驗證：
-- select conname, pg_get_constraintdef(oid)
-- from pg_constraint
-- where conrelid = 'public.game_glossary_misses'::regclass;
