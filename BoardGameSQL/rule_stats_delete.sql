-- 規則助手熱搜統計：管理者手動刪除「單一關鍵字」（所有遊戲、所有日期）
-- 刪「某款遊戲的全部統計」沿用既有的 admin_delete_rule_stats(p_bgg_name)，不動它。
create or replace function public.admin_delete_rule_keyword(p_keyword text)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_n integer;
begin
  if auth.uid() is null or not public.is_admin() then
    raise exception 'not admin';
  end if;
  if p_keyword is null or length(btrim(p_keyword)) = 0 then
    return 0;
  end if;
  delete from public.rule_search_keyword_stats where keyword = p_keyword;
  get diagnostics v_n = row_count;
  return v_n;
end;
$$;

revoke all on function public.admin_delete_rule_keyword(text) from public, anon;
grant execute on function public.admin_delete_rule_keyword(text) to authenticated;

-- 檢查（SQL Editor 沒有登入身分，這裡只確認函式存在且 anon 無權限）：
select proname, has_function_privilege('anon', oid, 'execute') as anon_can_run
from pg_proc
where pronamespace = 'public'::regnamespace and proname = 'admin_delete_rule_keyword';
