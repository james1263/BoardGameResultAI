-- admin_database_size.sql
-- 用途：管理中心「上傳檔案 → PDF」分頁的資源用量顯示（資料庫大小）。
-- 回傳 bigint（位元組）。只有管理者能呼叫；非管理者會丟 'forbidden'。
-- 可重跑：create or replace，不會出現「already exists」。
-- 注意：SQL Editor 沒有登入身分，直接 select 這個函式會失敗，這是正常的；
--       要在網站（管理者登入）上看結果。
-- 已於 2026-11-16 在 Supabase 執行。

create or replace function public.admin_database_size()
returns bigint
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception 'forbidden';
  end if;
  return pg_database_size(current_database());
end;
$$;

revoke all on function public.admin_database_size() from public, anon;
grant execute on function public.admin_database_size() to authenticated;

-- 驗證（存在時一定有一列）：
-- select proname from pg_proc where proname = 'admin_database_size';
