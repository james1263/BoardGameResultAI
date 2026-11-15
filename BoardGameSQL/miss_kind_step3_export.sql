-- miss_kind_step3_export.sql（2026-11-15）
-- 需先完成 step1、step2、search_rulebook_chunks_v10。
-- 內容：
--   1. public._export_miss_analysis_core(...)  核心（不檢查身分，只有 postgres／SQL Editor 能呼叫，已 revoke）
--   2. public.admin_export_miss_analysis(...)  對外函式（只有管理者能用），前端呼叫這個
-- 輸出：一份純文字，依序為 未命中詞／現有詞庫／候選段落／英文原文附錄／AI 分析任務。
-- 不含任何玩家帳號與完整搜尋問句；規則書文字只供管理者私人分析。

create or replace function public._export_miss_analysis_core(
  p_bgg_name text,
  p_include_appendix boolean,
  p_appendix_limit integer
) returns text
language plpgsql
stable
security definer
set search_path = ''
as $function$
declare
  v_limit int := greatest(5000, least(coalesce(p_appendix_limit, 60000), 200000));
  v_cand_limit constant int := 40000;
  v_misses text;
  v_gloss text;
  v_cand text := '';
  v_cand_cut boolean := false;
  v_app text := '';
  v_app_head text := '';
  v_piece text;
  v_term_total int;
  v_term_shown int := 0;
  v_found int;
  v_total int := 0;
  v_in int := 0;
  v_inc bigint[] := '{}';
  v_omit text;
  v_last_key text := '';
  v_key text;
  v_task text;
  v_out text;
  rec record;
  hit record;
  nb record;
begin
  if p_bgg_name is null or btrim(p_bgg_name) = '' then
    raise exception 'EMPTY_GAME';
  end if;

  -- 一、未命中詞（詞庫沒對應的詞，排除現在詞庫已涵蓋的；零結果全列）
  select coalesce(string_agg(
           m.zh_term
           || '｜' || case m.kind when 'glossary_miss' then '詞庫沒對應' else '搜尋零結果' end
           || '｜' || case m.source when 'admin' then '管理員' else '玩家' end
           || '｜' || m.hit_count::text || ' 次',
           E'\n' order by m.kind, m.hit_count desc, m.zh_term), '（目前沒有未命中詞）')
    into v_misses
    from public.game_glossary_misses m
   where m.bgg_name = p_bgg_name
     and (m.kind = 'search_zero_result'
          or not exists (select 1 from public.game_glossary g
                          where g.bgg_name = m.bgg_name
                            and (position(g.zh_term in m.zh_term) > 0
                              or position(m.zh_term in g.zh_term) > 0)));

  select count(distinct m.zh_term) into v_term_total
    from public.game_glossary_misses m
   where m.bgg_name = p_bgg_name
     and (m.kind = 'search_zero_result'
          or not exists (select 1 from public.game_glossary g
                          where g.bgg_name = m.bgg_name
                            and (position(g.zh_term in m.zh_term) > 0
                              or position(m.zh_term in g.zh_term) > 0)));

  -- 二、現有詞庫
  select coalesce(string_agg(
           g.zh_term || ' → ' || g.en_term
           || case when coalesce(g.confirmed, true) then '' else '（AI 建議，待確認）' end
           || case when coalesce(g.note, '') <> '' then '｜備註：' || g.note else '' end,
           E'\n' order by g.zh_term), '（這款遊戲目前沒有詞庫）')
    into v_gloss
    from public.game_glossary g
   where g.bgg_name = p_bgg_name;

  -- 三、候選段落：每個詞最多 2 段命中，各附前後一段；命中條件＝中文詞直接出現，
  --     或該詞與詞庫條目重疊時，詞庫的對應詞出現，或詞本身是英文字且出現
  for rec in
    select m.zh_term, sum(m.hit_count)::int as hits
      from public.game_glossary_misses m
     where m.bgg_name = p_bgg_name
       and (m.kind = 'search_zero_result'
            or not exists (select 1 from public.game_glossary g
                            where g.bgg_name = m.bgg_name
                              and (position(g.zh_term in m.zh_term) > 0
                                or position(m.zh_term in g.zh_term) > 0)))
     group by m.zh_term
     order by sum(m.hit_count) desc, m.zh_term
     limit 30
  loop
    v_found := 0;
    v_piece := '■ ' || rec.zh_term || '（共 ' || rec.hits::text || ' 次）' || E'\n';

    for hit in
      select c.id, c.document_id, c.index_version, c.chunk_index, c.page_number, c.content,
             d.title, d.language, d.content_scope, d.expansion_name
        from public.rulebook_chunks c
        join public.game_documents d
          on d.id = c.document_id and c.index_version = d.indexed_version
       where d.bgg_name = p_bgg_name
         and d.ai_indexed and d.index_status = 'completed'
         and (
           position(rec.zh_term in replace(c.content, ' ', '')) > 0
           or exists (select 1 from public.game_glossary g
                       where g.bgg_name = p_bgg_name
                         and (position(g.zh_term in rec.zh_term) > 0
                           or position(rec.zh_term in g.zh_term) > 0)
                         and position(lower(g.en_term) in lower(replace(c.content, ' ', ''))) > 0)
           or (rec.zh_term !~ '[\u4e00-\u9fff]'
               and position(lower(rec.zh_term) in lower(c.content)) > 0)
         )
       order by d.title, c.page_number, c.chunk_index
       limit 2
    loop
      v_found := v_found + 1;
      v_piece := v_piece || '[' || hit.title
        || '｜' || case hit.language when 'zh' then '中文' when 'en' then '英文' else '其他語言' end
        || '｜' || case hit.content_scope
                     when 'main' then '主遊戲'
                     when 'faq' then 'FAQ'
                     when 'expansion' then '擴充' || coalesce('：' || nullif(hit.expansion_name, ''), '')
                     when 'player_notes' then '玩家整理'
                     else coalesce(hit.content_scope, '') end
        || '｜第' || coalesce(hit.page_number::text, '?') || '頁]' || E'\n';

      select c2.content, c2.page_number into nb
        from public.rulebook_chunks c2
       where c2.document_id = hit.document_id
         and c2.index_version = hit.index_version
         and c2.chunk_index = hit.chunk_index - 1;
      if found then
        v_piece := v_piece || '（前一段，第' || coalesce(nb.page_number::text, '?') || '頁）'
                   || left(nb.content, 400) || E'\n';
      end if;

      v_piece := v_piece || '（命中段落）' || hit.content || E'\n';

      select c2.content, c2.page_number into nb
        from public.rulebook_chunks c2
       where c2.document_id = hit.document_id
         and c2.index_version = hit.index_version
         and c2.chunk_index = hit.chunk_index + 1;
      if found then
        v_piece := v_piece || '（後一段，第' || coalesce(nb.page_number::text, '?') || '頁）'
                   || left(nb.content, 400) || E'\n';
      end if;

      v_piece := v_piece || E'\n';
    end loop;

    if v_found = 0 then
      v_piece := v_piece || '沒有找到可提供的相關原文' || E'\n\n';
    end if;

    if length(v_cand) + length(v_piece) > v_cand_limit then
      v_cand_cut := true;
      exit;
    end if;
    v_cand := v_cand || v_piece;
    v_term_shown := v_term_shown + 1;
  end loop;

  if v_term_total = 0 then
    v_cand := '（沒有需要查找的未命中詞）' || E'\n';
  elsif v_term_shown < v_term_total then
    v_cand := v_cand || '（候選段落只列出前 ' || v_term_shown::text || ' 個詞，共 '
              || v_term_total::text || ' 個；其餘請對照第四節原文判斷）' || E'\n';
  end if;

  -- 四、原文附錄：已索引段落依 文件範圍／標題／頁碼 排列，超過字數上限就截斷並註明
  if p_include_appendix then
    select count(*) into v_total
      from public.rulebook_chunks c
      join public.game_documents d
        on d.id = c.document_id and c.index_version = d.indexed_version
     where d.bgg_name = p_bgg_name
       and d.ai_indexed and d.index_status = 'completed';

    for hit in
      select c.id, c.page_number, c.content,
             d.title, d.language, d.content_scope, d.expansion_name
        from public.rulebook_chunks c
        join public.game_documents d
          on d.id = c.document_id and c.index_version = d.indexed_version
       where d.bgg_name = p_bgg_name
         and d.ai_indexed and d.index_status = 'completed'
       order by case d.content_scope when 'main' then 0 when 'faq' then 1 when 'expansion' then 2 else 3 end,
                d.title, c.page_number, c.chunk_index
    loop
      v_key := hit.title || '|' || coalesce(hit.page_number::text, '?');
      v_piece := '';
      if v_key <> v_last_key then
        v_piece := '[' || hit.title
          || '｜' || case hit.language when 'zh' then '中文' when 'en' then '英文' else '其他語言' end
          || '｜' || case hit.content_scope
                       when 'main' then '主遊戲'
                       when 'faq' then 'FAQ'
                       when 'expansion' then '擴充' || coalesce('：' || nullif(hit.expansion_name, ''), '')
                       when 'player_notes' then '玩家整理'
                       else coalesce(hit.content_scope, '') end
          || '｜第' || coalesce(hit.page_number::text, '?') || '頁]' || E'\n';
      end if;
      v_piece := v_piece || hit.content || E'\n\n';
      if length(v_app) + length(v_piece) > v_limit then
        exit;
      end if;
      v_app := v_app || v_piece;
      v_inc := v_inc || hit.id;
      v_in := v_in + 1;
      v_last_key := v_key;
    end loop;

    if v_in < v_total then
      select string_agg(x.title || '（未放 ' || x.cnt::text || ' 段）', '、' order by x.title)
        into v_omit
        from (
          select d.title, count(*) as cnt
            from public.rulebook_chunks c
            join public.game_documents d
              on d.id = c.document_id and c.index_version = d.indexed_version
           where d.bgg_name = p_bgg_name
             and d.ai_indexed and d.index_status = 'completed'
             and c.id <> all (v_inc)
           group by d.title
        ) x;
      v_app_head := '（已截斷：共 ' || v_total::text || ' 段，只放前 ' || v_in::text
                    || ' 段，字數上限 ' || v_limit::text || '。未放入：' || coalesce(v_omit, '') || '）' || E'\n';
    else
      v_app_head := '（共 ' || v_total::text || ' 段，已全部放入）' || E'\n';
    end if;
    if v_total = 0 then
      v_app_head := '（這款遊戲目前沒有已索引的規則書文字）' || E'\n';
    end if;
  else
    v_app_head := '（匯出時已關閉原文附錄）' || E'\n';
  end if;

  -- 五、AI 分析任務
  v_task := $t$請你擔任桌遊規則助手的「搜尋品質分析員」。第一節的「未命中詞」是玩家或管理員在規則助手搜尋時沒有得到好結果的詞：
・詞庫沒對應＝輸入的中文詞，詞庫裡沒有對應的英文詞或同義詞。
・搜尋零結果＝這次搜尋完全沒有找到任何規則書段落。
請逐一分析每個詞，把原因歸成其中一類：
A. 規則書有明確對應的詞，只是詞庫缺少中英對應
B. 規則書有相關概念，但玩家用了不同說法，缺少同義詞
C. 規則書有相關內容，但網站搜尋沒有搜到（可能是簡繁字形、斷詞或權重問題）
D. 規則書沒有相關內容（這種不要硬塞進詞庫）
E. 規則書文字品質有問題（OCR 亂碼、漏字、頁碼或切段異常）
F. 資訊不足，無法判斷
規則：
1. 只能根據本檔提供的規則書文字判斷，不可自行編造規則、頁碼或英文詞。建議的英文對應詞必須是規則書文字中實際出現的字，大小寫與單複數照原文。
2. 每個詞都要附上文件名與頁碼，並逐字引用一小段原文當證據；找不到證據就歸 D 或 F。
3. 規則書可能是簡體字；第三節的候選段落只用原詞比對，簡體文件可能漏找，請對照第四節原文再判斷。
4. 「行動」「能力」這類太泛用的詞，不要建議加入詞庫。
5. 已在第二節「現有詞庫」裡的詞，不要重複建議。
輸出分兩部分：
【第一部分：分析】每個詞一行：詞｜分類｜頁碼｜原文證據｜建議處理。
【第二部分：可匯入詞庫的清單】只列你有把握的 A、B 類，純文字，每行一筆，格式固定為：{GAME}｜中文詞｜對應詞
第二部分不要加編號、標題、說明或程式碼框；沒把握的詞不要放進去。$t$;
  v_task := replace(v_task, '{GAME}', p_bgg_name);

  v_out :=
    'BoardGameResultAI｜搜尋未命中分析資料' || E'\n'
    || '遊戲：' || p_bgg_name || E'\n'
    || '匯出日期：' || to_char(now() at time zone 'Asia/Taipei', 'YYYY-MM-DD') || E'\n'
    || '本檔不含玩家帳號與完整搜尋問句；規則書文字僅供管理者私人分析，請勿公開轉貼。' || E'\n'
    || '（分析任務在最後第五節）' || E'\n\n'
    || '================================' || E'\n'
    || '一、未命中詞（詞｜類型｜來源｜次數）' || E'\n'
    || '================================' || E'\n'
    || v_misses || E'\n\n'
    || '================================' || E'\n'
    || '二、現有詞庫（中文詞 → 對應詞）' || E'\n'
    || '================================' || E'\n'
    || v_gloss || E'\n\n'
    || '================================' || E'\n'
    || '三、候選段落（每詞最多 2 段，附前後各一段）' || E'\n'
    || '================================' || E'\n'
    || v_cand || E'\n'
    || '================================' || E'\n'
    || '四、規則書原文附錄' || E'\n'
    || '================================' || E'\n'
    || v_app_head || E'\n'
    || v_app || E'\n'
    || '================================' || E'\n'
    || '五、AI 分析任務' || E'\n'
    || '================================' || E'\n'
    || v_task || E'\n';

  return v_out;
end;
$function$;

revoke all on function public._export_miss_analysis_core(text, boolean, integer) from public, anon, authenticated;

create or replace function public.admin_export_miss_analysis(
  p_bgg_name text,
  p_include_appendix boolean default true,
  p_appendix_limit integer default 60000
) returns text
language plpgsql
stable
security definer
set search_path = ''
as $function$
begin
  if not public.is_admin() then
    raise exception 'not admin';
  end if;
  return public._export_miss_analysis_core(p_bgg_name, p_include_appendix, p_appendix_limit);
end;
$function$;

revoke all on function public.admin_export_miss_analysis(text, boolean, integer) from public, anon;
grant execute on function public.admin_export_miss_analysis(text, boolean, integer) to authenticated;

-- 驗證（在 SQL Editor 直接呼叫核心函式，不需要登入身分；把 'Knarr' 換成有未命中詞的遊戲）：
-- select length(t) as chars, left(t, 5000) as preview
-- from (select public._export_miss_analysis_core('Knarr', true, 60000) as t) x;
-- 看完整內容：把 left(t, 5000) 換成 t，在結果格按「複製」。
