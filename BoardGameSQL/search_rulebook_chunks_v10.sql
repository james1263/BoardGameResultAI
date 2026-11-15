-- search_rulebook_chunks_v10.sql（2026-11-15）
-- 需先完成 step1 與 step2（函式會呼叫 public._log_search_misses）。
-- 與 v9 的差異只有四處，皆標 -- v10：
--   1. 宣告 v_src（來源 user／admin）
--   2. 未對應詞寫入加上 source，on conflict 改四欄
--   3. 兩處提早 return 前呼叫 _log_search_misses（記零結果）
-- 其餘與線上 v9 逐字相同。
-- 驗證：用管理者帳號搜「量子香蕉」，再查
--   select bgg_name, zh_term, kind, source, hit_count
--   from public.game_glossary_misses order by last_seen desc limit 10;
-- 應看到 glossary_miss／admin 與 search_zero_result／admin 兩列；再搜一個正常有結果的詞，確認顯示與扣次數和以前一樣。

CREATE OR REPLACE FUNCTION public.search_rulebook_chunks(p_bgg_name text, p_query text, p_alt text DEFAULT NULL::text)
 RETURNS TABLE(doc_id uuid, doc_title text, doc_kind text, doc_lang text, page_number integer, section_title text, content text, score real, doc_scope text, doc_expansion text)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  v_uid uuid := auth.uid();
  v_q tsquery;
  v_start timestamptz;
  v_used int;
  v_text text;
  v_alt text := '';
  v_rest text;
  v_eng text;
  v_cjk text[] := '{}';
  v_syn text[] := '{}';
  v_hits text[] := '{}';
  v_gl text[] := '{}';
  v_key text[] := '{}';
  v_words text[] := '{}';
  v_enw text[] := '{}';
  v_glw text[] := '{}';
  v_rare text[] := '{}';
  v_src text;  -- v10
  rec record;
begin
  if v_uid is null or not public.is_vip() then
    raise exception 'NOT_VIP';
  end if;

  v_src := case when public.is_admin() then 'admin' else 'user' end;  -- v10

  v_text := left(btrim(coalesce(p_query, '')), 200);
  if v_text = '' then
    raise exception 'EMPTY_QUERY';
  end if;

  -- v9：p_alt＝前端轉好的簡體版問句，只用來找中文詞，不進未對應詞與統計
  v_alt := left(btrim(coalesce(p_alt, '')), 200);

  perform pg_advisory_xact_lock(hashtextextended(v_uid::text, 0));

  delete from public.rulebook_search_log
   where created_at < now() - interval '7 days';
  delete from public.game_glossary_misses
   where last_seen < now() - interval '90 days';

  if not public.is_admin() then
    v_start := date_trunc('day', now() at time zone 'Asia/Taipei') at time zone 'Asia/Taipei';
    select count(*) into v_used
      from public.rulebook_search_log l
     where l.user_id = v_uid and l.created_at >= v_start;
    if v_used >= 50 then
      raise exception 'DAILY_LIMIT';
    end if;
  end if;

  v_eng := btrim(regexp_replace(v_text, '[\u4e00-\u9fff]+', ' ', 'g'));
  v_rest := v_text;

  for rec in
    select g.zh_term, g.en_term
      from public.game_glossary g
     where g.bgg_name = p_bgg_name
       and position(g.zh_term in v_text) > 0
     order by length(g.zh_term) desc, g.zh_term
  loop
    if not (rec.zh_term = any(v_hits)) then
      if position(rec.zh_term in v_rest) = 0 then
        continue;
      end if;
      v_rest := replace(v_rest, rec.zh_term, ' ');
      v_hits := v_hits || rec.zh_term;
    end if;
    if rec.en_term ~ '[\u4e00-\u9fff]' then
      v_syn := v_syn || rec.en_term;
    else
      v_gl := v_gl || rec.en_term;
    end if;
  end loop;

  if array_length(v_gl, 1) > 0 then
    v_eng := btrim(v_eng || ' ' || array_to_string(v_gl, ' '));
  end if;

  select coalesce(array_agg(distinct s.w), '{}') into v_words
    from (
      select lower(x) as w
        from unnest(regexp_split_to_array(v_eng, '[^[:alnum:]]+')) as x
       where length(x) >= 3
      union
      select lower(y) as w
        from unnest(v_gl) as y
       where length(y) >= 3
    ) s;

  -- 英文搜尋詞（單字、略過常見虛字）與詞庫帶出的英文單字
  select coalesce(array_agg(distinct lower(x)), '{}') into v_enw
    from unnest(regexp_split_to_array(v_eng, '[^[:alnum:]]+')) as x
   where length(x) >= 3
     and lower(x) <> all (array['the','and','for','can','are','was','not','you','with','that','this','from','have','has','what','who','how','does','did','may','any','its','but','one','all','out']);

  select coalesce(array_agg(distinct lower(x)), '{}') into v_glw
    from unnest(regexp_split_to_array(array_to_string(v_gl, ' '), '[^[:alnum:]]+')) as x
   where length(x) >= 3;

  -- v10：未對應詞加上來源（kind 用預設 glossary_miss）
  insert into public.game_glossary_misses (bgg_name, zh_term, source)
  select p_bgg_name, r.run, v_src
    from (select distinct (x)[1] as run
            from regexp_matches(v_text, '([\u4e00-\u9fff]+)', 'g') as x) r
   where length(r.run) between 2 and 30
     and not exists (select 1 from public.game_glossary g
                      where g.bgg_name = p_bgg_name
                        and (position(g.zh_term in r.run) > 0
                          or position(r.run in g.zh_term) > 0))
  on conflict (bgg_name, zh_term, kind, source) do update
    set hit_count = public.game_glossary_misses.hit_count + 1,
        last_seen = now();

  if v_eng <> '' then
    v_q := nullif(replace(plainto_tsquery('english', v_eng)::text, ' & ', ' | '), '')::tsquery;
  end if;

  select coalesce(array_agg(t.term order by t.pos), '{}') into v_cjk
    from (
      select q.term, min(q.pos) as pos
        from (
          select case when length(m.run) <= 3 then m.run else substr(m.run, i.n, 2) end as term,
                 m.ord * 1000 + i.n as pos
            from (select (x.g)[1] as run, x.ord
                    from regexp_matches(v_rest || ' ' || v_alt, '([\u4e00-\u9fff]+)', 'g')
                         with ordinality as x(g, ord)) m
            cross join lateral generate_series(
                   1, case when length(m.run) <= 3 then 1 else length(m.run) - 1 end) as i(n)
           where length(m.run) >= 2
        ) q
       where q.term !~ '^[的了是會能有在和跟或要我你他這那個被把就都也不嗎呢吧]+$'
         and not (length(q.term) = 2 and q.term ~ '[的了嗎呢吧]')
       group by q.term
       order by min(q.pos)
       limit 60
    ) t;

  -- 詞庫命中的詞與中文同義詞（評分時權重較高）
  v_key := v_syn || array(select h from unnest(v_hits) as h where length(h) >= 2);

  select coalesce(array_agg(distinct a), '{}') into v_cjk
    from unnest(
           v_cjk
           || v_syn
           || array(select h from unnest(v_hits) as h where length(h) >= 2)
         ) as a;

  if v_q is null
     and coalesce(array_length(v_cjk, 1), 0) = 0
     and coalesce(array_length(v_words, 1), 0) = 0 then
    perform public._log_search_misses(p_bgg_name, v_text, v_src);  -- v10
    return;
  end if;

  if not exists (
    select 1
      from public.rulebook_chunks c
      join public.game_documents d
        on d.id = c.document_id and c.index_version = d.indexed_version
     where d.bgg_name = p_bgg_name
       and d.ai_indexed and d.index_status = 'completed'
       and (
         (v_q is not null and to_tsvector('english', c.content) @@ v_q)
         or exists (select 1 from unnest(v_cjk) as t(term)
                     where position(t.term in replace(c.content, ' ', '')) > 0)
         or (d.language = 'other'
             and exists (select 1 from unnest(v_words) as w(word)
                          where position(w.word in lower(c.content)) > 0))
       )
  ) then
    perform public._log_search_misses(p_bgg_name, v_text, v_src);  -- v10
    return;
  end if;

  insert into public.rulebook_search_log (user_id, bgg_name, created_at)
  values (v_uid, p_bgg_name, now());

  if not public.is_admin() then
    insert into public.rule_search_daily_stats (bgg_name, day, search_count)
    values (p_bgg_name, (now() at time zone 'Asia/Taipei')::date, 1)
    on conflict (bgg_name, day) do update
      set search_count = public.rule_search_daily_stats.search_count + 1;

    insert into public.rule_search_keyword_stats (bgg_name, day, keyword, search_count)
    select distinct p_bgg_name, (now() at time zone 'Asia/Taipei')::date, k, 1
      from unnest(
             array(select h from unnest(v_hits) as h where length(h) >= 2)
             || case when length(v_text) <= 8 then array[lower(v_text)] else array[]::text[] end
           ) as k
    on conflict (bgg_name, day, keyword) do update
      set search_count = public.rule_search_keyword_stats.search_count + 1;

    delete from public.rule_search_daily_stats
     where day < (now() at time zone 'Asia/Taipei')::date - 400;
    delete from public.rule_search_keyword_stats
     where day < (now() at time zone 'Asia/Taipei')::date - 400;
  end if;

  -- v8b：稀有詞（在這款遊戲已索引的段落中出現在 4 段以內）權重加倍以上
  select coalesce(array_agg(w.word), '{}') into v_rare
    from unnest(v_enw) as w(word)
   where (select count(*)
            from public.rulebook_chunks c2
            join public.game_documents d2
              on d2.id = c2.document_id and c2.index_version = d2.indexed_version
           where d2.bgg_name = p_bgg_name
             and d2.ai_indexed and d2.index_status = 'completed'
             and lower(c2.content) ~ ('\m' || w.word)) <= 4;

  -- 每種語言各取前 5 段（最多 10 段）；範圍加分 FAQ > 玩家整理 > 主遊戲 > 擴充，只用來打破平手
  return query
  select s.id, s.title, s.doc_type, s.language, s.page_number, s.section_title,
         left(s.content, 1300), (s.bs + s.bonus)::real, s.content_scope, s.expansion_name
    from (
      select r.*,
             row_number() over (partition by r.language order by (r.bs + r.bonus) desc) as rn
        from (
          select d.id, d.title, d.doc_type, d.language,
                 c.page_number, c.section_title, c.content,
                 d.content_scope, d.expansion_name,
                 (coalesce(case when v_q is not null
                                then ts_rank_cd(to_tsvector('english', c.content), v_q) end, 0)
                  -- 中文詞命中：詞庫詞與同義詞 +2、3 字以上 +1、2 字滑動詞 +0.5
                  + (select coalesce(sum(case when t.term = any(v_key) then 2
                                              when length(t.term) >= 3 then 1
                                              else 0.5 end), 0)
                       from unnest(v_cjk) as t(term)
                      where position(t.term in z.ns) > 0)
                  -- 同分時看出現次數：每次 +0.05，最多 +0.5
                  + least(0.5, 0.05 * (select coalesce(sum((length(z.ns) - length(replace(z.ns, t.term, ''))) / length(t.term)), 0)
                                         from unnest(v_cjk) as t(term)
                                        where position(t.term in z.ns) > 0))
                  -- 英文／其他語言：稀有詞 +4、詞庫帶出的英文詞 +1.5、其他搜尋詞 +1
                  + case when d.language = 'zh' then 0
                         else (select coalesce(sum(case when w.word = any(v_rare) then 4
                                                        when w.word = any(v_glw) then 1.5
                                                        else 1 end), 0)
                                 from unnest(v_enw) as w(word)
                                where z.lc ~ ('\m' || w.word)) end
                 )::real as bs,
                 (case d.content_scope when 'faq' then 0.3
                                       when 'player_notes' then 0.2
                                       when 'main' then 0.1
                                       else 0 end)::real as bonus
            from public.rulebook_chunks c
            join public.game_documents d
              on d.id = c.document_id and c.index_version = d.indexed_version
           cross join lateral (select replace(c.content, ' ', '') as ns,
                                      lower(c.content) as lc) z
           where d.bgg_name = p_bgg_name
             and d.ai_indexed and d.index_status = 'completed'
        ) r
       where r.bs > 0
    ) s
   where s.rn <= 5
   order by (s.bs + s.bonus) desc;
end;
$function$;
