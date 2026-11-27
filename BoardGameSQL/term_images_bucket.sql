-- 名詞圖片：私有 bucket（term-images），只有 VIP／管理者讀得到；網站上沒有任何人能上傳或刪除（上傳走 Supabase 後台）。
-- 先在 Supabase 後台 Storage 建好名為 term-images 的 bucket（Public 關閉），再執行下面。可重跑。
-- 注意：SQL Editor 沒有登入身分，這個政策要等網站上用 VIP 帳號開圖才算驗證。

drop policy if exists "term images vip read" on storage.objects;

create policy "term images vip read"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'term-images'
  and (public.is_vip() or public.is_admin())
);

-- 驗證：應回 1 列（政策存在）
select policyname, cmd, roles
from pg_policies
where schemaname = 'storage' and tablename = 'objects' and policyname = 'term images vip read';
