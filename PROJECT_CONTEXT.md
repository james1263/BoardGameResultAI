# 玩桌遊｜BoardGame（桌遊規則助手，BoardGameResultAI）— 專案參考文件（合併精簡版）

> 給接手 AI。**先讀 `QUICKSTART.md`（現況、待辦、使用者決定、合作規則、陷阱），再讀本檔（架構、資料庫、功能規則、規則助手設計），再讀 `未來目標.md`、`連帶關係圖.md`、`畫面改版.md`，最後讀 `生成後.md`（本版之後的修改紀錄，衝突時以它為準）。**
> 最後更新：2026-11-15（**第七次合併版＋英文詞候選查證**：併入搜尋未命中分析（`kind`／`source`、v10、匯出給 AI 分析）、熱搜管理者刪除、垃圾桶清理補零結果詞、詞庫 `confirmed`／`note` 欄位已驗證、英文詞候選功能的發現；**未完成的設計保留**，待辦見 QUICKSTART 第 4 節與 `未來目標.md`）。AI 沒看到的細節標［未驗證］，改之前請使用者貼檔案或匯出定義。

## 1. 專案簡介與技術架構
- **目標**：桌遊收藏與規則查詢網站（約 106～111 款，Notion 整理後匯出 CSV）；公開瀏覽，只有管理者能編輯；朋友圈是主要玩家；VIP 可查規則書（第 6 節）。
- 前端 React + TypeScript + Vite；後端 **Supabase（免費方案，首爾）**：資料庫、Google 登入、Storage、Edge Function、pg_cron。專案 ID `hgeuockbjrzayfdylavq`，URL `https://hgeuockbjrzayfdylavq.supabase.co`（不加 `/rest/v1/`）。前端只用 **Publishable key**；Secret／service_role key 絕不放前端或貼給任何人。免費方案閒置一週暫停。
- 部署：GitHub → Vercel，正式分支 `master`。環境變數（`.env.local` 不在 Git、Vercel 後台都要有）：`VITE_SUPABASE_URL`、`VITE_SUPABASE_PUBLISHABLE_KEY`。**地雷**：Vercel 對 `VITE_` 變數要選 **Config**（不是 Secret）；名稱錯一字母會悄悄退回本機備用資料；改環境變數要重新部署；Publishable key 帶入非英數字元會造成紅字錯誤。
- 指令：`npm.cmd run dev`（`http://localhost:5173/`）、`npm.cmd run build`（成功顯示 `✓ built in ...`；chunk > 500 kB 警告可忽略）。dev 中斷時 PDF 上傳也會失敗。
- 資料更新：Notion → 匯出 CSV → 頁尾管理者登入 →「匯入 CSV」→ 預覽 →「確認匯入」（改資料、封面、SQL 不需 push）。
- **SQL 檔**：2026-11-15 起放專案根目錄 `BoardGameSQL/`（進 repo，名稱維持現狀）：`miss_kind_step1.sql`（**不可重跑**）、`miss_kind_step2.sql`、`miss_kind_step3_export.sql`、`search_rulebook_chunks_v10.sql`、`rule_stats_delete.sql`；更早的 SQL 仍在使用者自己電腦。
- **不要上傳到 Git**：`boardgame_source.zip`、`supabase_import.sql`、`make_supabase_import.py`、`boardgames.csv`、`categories_check.txt`、`covers_needed.txt`、`list_categories.py`、`generate_boardgames.backup.py`、`.env.local`、`App.css.bak`、`client_secret_*.json`、`rulebooks/`、`.vs/`、用完的 `patch_*.py`、`新增 文字文件.txt`、`trash-step/`、重複檔（`*_1.css`、`*_1.tsx`、`miss_kind_step2_1.sql`）。`.gitignore` 曾有黏行，用 `git check-ignore -v .env.local boardgames.csv` 確認。
- **程式結構**：`src/App.css` 只有 `@import`，**順序有影響不要調換**（`tokens`、`base`、`topbar`、`hero`、`library`、`filter`、`cards`、`modal`、`admin`、`mylist`、`footer`、`trash`、`docs`、`backtotop`、`tabs`、`ratings`、`leaderboard`、`loyalty`、`loyalty-card`、`loyalty-admin`、`account`、`sitebar`；`vip.css` 最後載入）。多數元件自己 import 樣式。**`src/App.tsx` 最後依序 import `dark-theme*.css`（一直到 `dark-theme-12.css`，另有 `dark-theme-all.css` 管 `askConfirm` 的 `ac-*`）。** `App.tsx` 只留 `Library` 的狀態與篩選／排序，導覽用單一 `activePage`（`NavPage` 定義在 `TopBar.tsx`；key：桌遊收藏、排行榜〔統計中心〕、`'loyalty'`〔聚會．留言〕、`'mylist'`〔俱樂部〕、`'admin'`、`'rules'`）。`src/components/` 為元件、`src/lib/` 為 hook 與工具（**含 `gameCleanup.ts`、`askConfirm.tsx`**），**`AdminPanel.tsx`、`PlayerPanel.tsx`、`MyList.tsx`、`LoyaltyAdmin.tsx`、`GameDocuments.tsx` 在 `src/` 底下**。`supabase/functions/` 放 Edge Function 原始碼（不進 `src`）。
- `src/data/boardGames.generated.ts`：備用資料與 `BoardGame` 型別，**不要手改、不要刪**；`public/covers/` 是舊封面備援。
- 空間用量（2026-11-14）：`rulebooks` 約 410 MB（上傳 PDF 286 份，免費 1 GiB 上限，上傳大量規則書時盯後台 Usage）。

## 2. 資料庫、儲存與權限（Supabase）
**通則**：RLS 全開；「Allow new users to sign up」已開，所以**寫入政策只能是 `auth.uid()` 等於本人，或 `is_admin()`**。管理者以 `admin_users`＋`is_admin()` 判斷（id 欄位名稱未確認，用 `coalesce(to_jsonb(au)->>'user_id', to_jsonb(au)->>'id')::uuid`；管理者 james id `fe8a6ab8-970a-4866-bd82-e242ed3b9bf9`）。新建資料表：只走函式的表 `revoke all on 表 from anon, authenticated`；其餘至少 `revoke all ... from anon; revoke truncate, references, trigger ... from authenticated;`，並用 `information_schema.role_table_grants` 確認 `anon` 無權限。security definer 函式一律 `set search_path = ''`、`revoke ... from public, anon`、需要才 `grant execute ... to authenticated`。**刻意不對 `board_games` 加外鍵**（玩家資料以 `bgg_name` 對應）。含 `bgg_name` 的表：`board_games`、`game_documents`（有外鍵 cascade）、`game_play_sessions`、`game_ratings`、`gathering_games`、`gathering_notes`、`game_notes`、`planned_gathering_games`、`user_game_status`、`game_errata`、`game_glossary`、`game_glossary_misses`、`game_expansions`、`game_backgrounds`、`rule_submissions`、兩張熱搜統計表、`favorite_games`（本命桌遊）、`rule_term_candidates`（英文詞候選）；沒有外鍵的表要靠 `cleanupGameData` 清。

| 資料表 | 重點 |
|---|---|
| `board_games`（主鍵 `bgg_name`，`cover_slug` 唯一） | `reference_only`、`name, cover_slug, category(text[])`、`bgg_score/difficulty/time`、`min/max_players`、`best_players/recommend_players(int[])`、排名欄位（`ranking_engine, classic_game_ranking, score_rank` 與四個其他排名）、七個 `*_degree`、七個 `*_emoji`、`created_at`、`removed_at`、`removed_reason`、`description`(≤300)。SELECT 所有人，寫入只有管理者。 |
| `game_documents` | 規則書／FAQ；**任何人可讀，所以規則書文字絕不能放這裡**。`doc_type`、`language`（zh/en/other，上傳後由 `admin_auto_doc_language` 改寫）、`title`、`source_type`、`external_url`、`storage_path`、`ai_indexed`、`index_status`（none／pending／processing／completed／failed；線上實際只有 none/false 與 completed/true）、`indexed_version`、`page_count`、`content_scope`（main／expansion／faq／player_notes）、`expansion_name` 等。 |
| `user_game_status` | 主鍵 `(user_id, bgg_name)`：`want_to_play`、`played`、`note`(≤500)、`play_count`（無日期次數 0～999）、`want_first_at`／`played_first_at`。RLS 只有本人。 |
| `game_play_sessions` | `id, user_id, bgg_name, played_on, player_count, note(≤200), source（manual／rating／admin_gathering／admin_backfill）, gathering_id`（set null）。**總次數＝`play_count`＋紀錄筆數**。 |
| `game_ratings` | 主鍵 `(user_id, bgg_name)`：`overall`(1～10)、六項(1～5)、`keep_score`；整體與 `keep_score` 必填。公開管道＝`get_rating_summaries()`（5 人門檻）與 `get_player_stats()`。 |
| `player_profiles` | **主鍵是 `id`**，`nickname`、`public_id`、`hide_in_lists`。`player_contacts`：LINE／FB 名字（敏感，永不給 VIP）。 |
| `gatherings` / `gathering_attendees` / `gathering_games` / `gathering_checkins` | 聚會、出席（`exempt`、`source` admin/self、`confirmed_at`）、指定遊戲（`removed_at` 軟移除）、連結 token＋`capacity`（1～500）。觸發器 `attendee_makes_vip`。 |
| `gathering_notes` / `game_notes` / `note_likes` | 場次心得（私人＋公開欄、唯一 `(user_id, gathering_id, bgg_name)`）、遊戲公開留言（每人每款 ≤10）、按讚（`note_id` 無外鍵）。只走函式。 |
| `planned_gatherings`／`_games`／`_votes` | 預計聚會；**過期（`planned_on` < 台北今天）由 `cleanup_past_planned()` 每日 00:10 清除（pg_cron，先刪 votes、games）**。 |
| `loyalty_redemptions`／`loyalty_grants`（空表仍被引用）／`loyalty_adjustments`／`loyalty_earned_days`／`test_gathering_ratings` | 券使用、舊贈送、管理者調整、已得點日子（只有函式能寫）、測試場新建評分（欄位、RLS 未看過［未驗證］）。 |
| `vip_members` | `granted_by`＝password／checkin／admin；只有管理者可讀寫。 |
| `rulebook_chunks` / `rulebook_search_log` | 段落（不存 `bgg_name`；有 `document_id`、`index_version`、`chunk_index`、`page_number`、`section_title`、`content`）、搜尋紀錄（只存 user、遊戲、時間，7 天）。 |
| `game_glossary` | **欄位（2026-11-15 已驗證）：`id`(uuid)、`bgg_name`、`zh_term`(≤30)、`en_term`(≤60，可存中文同義詞)、`note`(text)、`created_at`、`confirmed`(boolean)**。`confirmed=false` 代表「AI 建議，待確認」；匯出函式用 `coalesce(confirmed, true)`。前端 `admin_save_glossary`／`admin_get_glossary` 是否已讀寫 `confirmed`、「貼上 AI 回覆」是否寫成 `false`［未驗證］；改前先匯出線上定義。 |
| `game_glossary_misses` | **主鍵 `(bgg_name, zh_term, kind, source)`**；`kind`＝`glossary_miss`（詞庫沒對應）／`search_zero_result`（搜尋零結果）；`source`＝`user`／`admin`；另有 `hit_count`、`last_seen`；只記詞與次數，90 天由 `search_rulebook_chunks` 內刪除。 |
| `rule_term_candidates`（英文詞候選，2026-11-15 已查證） | `id, bgg_name, zh_term, en_term, pick_count, status(pending／rejected 等), first_at, last_at`，無 `user_id`；RLS 開、無政策、`anon`／`authenticated` 無權限，只走函式：`report_term_pick`（VIP／管理者寫入、不記帳號）、`admin_get_term_candidates`、`admin_set_term_candidate_status(p_id, p_status)`（前端沒呼叫）、`admin_delete_term_candidates(p_bgg_name)`（垃圾桶第 8 步）。`privacy.html` 第 72 行已涵蓋。 |
| `game_errata` / `rule_submissions` | 玩錯紀錄（`kind` errata／ai_answer，status pending／approved／rejected）、連結／詞庫投稿。 |
| `game_expansions` / `game_backgrounds` | 擴充（≤5 連結、備註≤100）、背景（≤5000 字、≤10 連結）；anon 只有 SELECT。 |
| **本命桌遊表**（`favorites_and_limit50.sql`） | 每人三款（冠亞季）；`get_favorite_boards` 等三個函式、`admin_delete_favorite_games(p_bgg_name)`；表名 `favorite_games`，`user_id` 外鍵 `on delete cascade`（刪帳號自動連動）；欄位、RLS、`privacy.html` 未確認［未驗證］；**垃圾桶已清（`gameCleanup` 第 9 步）**。 |
| `rule_search_daily_stats` / `rule_search_keyword_stats` | 熱搜統計，無 `user_id`，保留 400 天；`keyword_stats` 欄位 `bgg_name, day, keyword, search_count`。 |

**函式**（改前請使用者匯出線上定義）：
- **身分**：`is_admin()`、`is_vip()`、`is_admin_user(uuid)`。
- **評分／統計**：`get_rating_summaries()`、`get_community_stats()`、`get_game_people`、`admin_get_all_ratings`、`get_player_stats()`（**2026-11-14 起隱藏暱稱者仍列入、顯示「匿名玩家」，管理者仍看得到本人；`get_game_people` 同步**）。
- **集點**：`loyalty_day_status`、`loyalty_qualified_days`、`loyalty_point_days`、`loyalty_totals`、`settle_vouchers`、`get_my_loyalty_summary`／`_days`、`admin_get_loyalty_overview`／`_days`、`admin_adjust_loyalty`／`admin_revoke_adjustment`／`admin_get_adjustments`、`confirm_my_attendance()`、`get_my_pending_confirm()`、`admin_get_auto_sessions`。規則：贈送點算當月、湊 2 點變券；扣除點最多扣到當月 0；扣除券最多扣到可用券 0；撤銷若會讓已用券不夠則拒絕；數量 1～50。**點數保留**：`loyalty_earned_days` ∪ 現在合格；觸發器 `bk_loyalty_keep_rating`／`_attendee`／`_game`／`_gathering`／`_date` 在刪評分、改不完整、移出名單、刪指定遊戲、刪正式聚會前先結算；改聚會日期→點搬到新日期；刪「測試」開頭聚會→該場得點一起刪。
- **已玩／日期**：`add_play_date`（先 insert 再 update −1，順序不可反）、`delete_play_date`（只刪 manual，+1）、`set_play_date_note`、`record_gathering_play(p_bgg_name)`、`unplay_game(p_bgg_name)`（有日期紀錄擋住；否則刪公開留言與評分、次數 0、取消已玩，私人心得保留）、`delete_my_ratings(p_names text[])`；觸發器 `unplay_when_empty`（`play_count` >0→0、無日期紀錄、**無評分**→取消已玩）、`played_default_count`（前端 `upsert` 先跑 BEFORE INSERT，已加「該列已存在不補」條件）、`mark_played_from_activity`、`add_session_from_rating`（七項第一次完整、非測試場、出席、當天指定；是否與 `record_gathering_play` 重複、插入是否已停用［未驗證］，請貼 `pg_get_functiondef('public.add_session_from_rating()'::regprocedure)`）。
- **刪聚會** `cleanup_test_gathering()`（BEFORE DELETE，名稱順序 `aa_cleanup_test_gathering` → `admin_sessions_before_gathering_delete` → `bk_loyalty_keep_gathering`）：測試場全刪；正式場公開留言搬 `game_notes`（沿用 id；同款已有 ≥10 則先刪最舊的被隱藏留言騰位，仍滿則略過）、私人心得接在整體心得後並註記（≤500 字）、日期紀錄全刪、總次數 0 才刪評分並取消已玩；點券保留。
- **集點明細**：`get_my_loyalty_days()`、`admin_get_loyalty_days(p_user)` 為 `loyalty_day_status` 與 `loyalty_earned_days` 全連接。
- **報到／VIP／成員**：`join_gathering(p_token)`（當天有效；名額含管理者與手動加入）、`redeem_vip_code`、`admin_set_vip_code`、`admin_set_vip`、`admin_list_members`、`get_hide_in_lists`／`set_hide_in_lists`、`admin_delete_member`（刪 `auth.users`，連動刪多表；函式只明確刪幾張表，其餘靠 `on delete cascade`（`favorite_games`、`game_notes`、`gathering_notes`、`game_errata`、`rule_submissions`、`planned_gathering_votes`、`loyalty_earned_days`、`test_gathering_ratings` 等）；英文詞候選無 `user_id`，不需連動）。
- **場次與心得**：`get_my_gatherings()`、`get_gathering_detail`、`save_gathering_note`、`get_my_gathering_notes`、`get_my_gathering_games`、`get_gathering_note_status`、`get_my_game_changes`；`add_game_note`、`update_my_game_note`、`get_my_game_notes`、`get_my_all_game_notes`、`get_public_gathering_notes`（回 `gathering_id, gathering_date, gathering_title`）、`delete_my_public_note`、`admin_hide_gathering_note`、`toggle_note_like`、`get_notes_unseen_count`。
- **紀錄／預計聚會／玩錯紀錄／投稿**：`get_game_play_history`（排除測試場，4.14.2 SQL 是否已執行［未驗證］）、預計聚會一組函式、玩錯紀錄一組函式（`get_game_errata`、`admin_save_game_errata`、`admin_delete_game_errata` 等五個定義沒看過）、`submit_rule_submission` 等、`admin_pending_count()`。
- **規則助手**：`search_rulebook_chunks(p_bgg_name, p_query, p_alt)`（**現行 v10**）、`admin_auto_doc_language`、`rulebook_search_remaining`（**50 次**）、`rulebook_has_index`、`rulebook_indexed_games`、`admin_replace_rulebook_chunks`、`admin_rulebook_storage_usage()`、詞庫函式（`admin_get_glossary`、`admin_save_glossary`、`admin_delete_glossary`）。
- **搜尋未命中（2026-11-15）**：`_log_search_misses(p_bgg_name, p_text, p_source)`（內部，只記零結果；中文 2～30 字、英文 3～30 字去停用字、最多 5 個）；只動 `glossary_miss`：`admin_get_glossary_misses(p_bgg_name)`（排除詞庫已涵蓋者、合併 user／admin 次數）、`admin_delete_glossary_miss(p_bgg_name, p_zh_term)`、`admin_clear_glossary_misses()`；含零結果：`admin_get_search_misses(p_bgg_name)`（回 `bgg_name, zh_term, kind, source, hit_count, last_seen`）、`admin_delete_search_miss(p_bgg_name, p_zh_term, p_kind)`（不分 source 一起刪）、`admin_clear_search_misses()`（只清零結果）；匯出：`_export_miss_analysis_core(p_bgg_name, p_include_appendix, p_appendix_limit)`（內部，SQL Editor 可測）＋`admin_export_miss_analysis(...)`（管理者；附錄上限夾在 5,000～200,000，預設 60,000）。
- **熱搜統計**：`admin_delete_rule_keyword(p_keyword)`（刪該關鍵字所有遊戲、所有日期，回刪除列數）、`admin_delete_rule_stats(p_bgg_name)`（刪整款遊戲統計）；統計函式排除管理者與 `reference_only`。
- **其他**：`cleanup_past_planned()`（pg_cron；`select jobname, schedule from cron.job;` 可確認排程）。

**Storage**：公開 bucket `covers`（檔名 `{coverSlug}.webp`，ASCII；擴充圖在 `covers/expansions/`）；私有 bucket `rulebooks`（PDF、50 MB、只有管理者讀寫，檔名 `{docId}.pdf`）。**Edge Function `video-title`**（`supabase/functions/video-title/index.ts`）：Bilibili 封鎖 Supabase IP（API -412、網頁 412），自動抓標題已放棄，前端不再呼叫；原始碼留當備份。

## 3. 前端欄位與 CSV 匯入
- **`BoardGame` 型別**：`id`、`name`、`bggName`、`slug`、`coverSlug`、`links`、`category[]`、`bggScore/bggDifficulty/bggTime`、`minPlayers/maxPlayers`、`bestPlayers/recommendPlayers`、`rankingEngine`、`classicGameRanking`、`scoreRank`、四個其他排名、七個 `*Degree`／`*Emoji`、`referenceOnly`。
- **CSV 必要欄位**（缺任一個預覽報錯）：`屬性`、`bggName`、`類型`、`bgg網站`、`BGG分數`、`BGG時間`、`BGG難度`、`Ranking engine`、`分數_排名`、`人數上限`、`人數下限`、`推薦人數`、`最佳人數`、`喜歡度`、`快速性`、`溝通性`、`獨特性`、`玩家影響性`、`複雜性`、`變化性`；選填 `簡介`。`parseCsv.ts` 的 `stripExpansionTag` 只對 `name` 去掉「(含擴)」，**絕不動 `bggName`**。墨敵賽無網路資料，保留 `null`，不要編造。
- **不要揭露「綜合分數排名」計算方式**。排序：Ranking engine、常玩遊戲排名、綜合分數（700 − `score_rank`）、名稱、BGG 分數／難度／時間。難度五級：入門 < 1.8／輕度 < 2.6／中度 < 3.2／中重 < 3.8／重度。
- **封面**：`coverSlug` 由 `bggName` 轉換（ASCII）；顯示順序 Storage → `public/covers/` → 🎲。
- **匯入行為**（`src/AdminPanel.tsx`）：upsert → 上傳封面 → 把「資料庫有、CSV 沒有」的遊戲移到垃圾桶（並 `cleanupGameData`）。移超過 5 款要輸入「移除」。**CSV 不完整會連規則書一起刪，匯入前看預覽。**
- **地雷：在 Notion 改 `bggName`** → 舊的進垃圾桶、新的當新遊戲，玩家紀錄失聯。

## 4. 身分、VIP、聚會、集點、報到
- **層級**：訪客 → 一般登入 → VIP → 管理者（也算 VIP，不集點）。
- **登入**：只用 Google OAuth（專案 `board-game-site`，已發布正式版）。管理者 Gmail 同時登入會對到管理者帳號，測玩家要用另一個 Google 帳號。**LINE／FB 內建瀏覽器不能 Google 登入**：走 `googleLogin.ts` 的 `signInWithGoogle()`，偵測後顯示 `InAppBrowserNotice`；聚會連結結尾加 `&openExternalBrowser=1`。
- **登入後視窗順序（`VipGate.tsx`、`PlayerPanel.tsx`）**：未登入 → `WelcomeDialog` →（登入後）暱稱視窗 → 若從歡迎視窗登入且不是 VIP 則 `VipUpgradeDialog`；旗標 `boardgame-from-welcome`、`boardgame-welcome-skip`；登入視窗一次只開一層。
- **玩家選單**：暱稱 ▾ →「修改暱稱與聯絡方式／**外觀（深色／淺色／跟隨系統）**／登出」；管理者頂端不再有獨立登出鈕（從選單登出）。
- **VIP 取得**：①列入出席名單；②通關密碼；③導覽列「🔑 加入 VIP」。
- **聚會連結**：`https://網址/?join=隨機碼&openExternalBrowser=1`，只在聚會當天（台北）有效；需先指定至少一款遊戲＋人數上限。風險：連結傳進群組後當天收到的人都能變 VIP。
- **報到流程**：連結 → Google 登入 → 暱稱 → 自動報到（有券又有來當天自動用券）→ `TodayRatingFlow`（pick 勾選今天玩過的 → rate 逐款評分，存檔後 `record_gathering_play` → finish）→ 集點卡；得點／券／用券獎勵視窗（`rewardNotice.ts`，`boardgame-reward-off:`／`boardgame-reward-seen:`）；管理者手動加入且非免評分者要跑完流程（`confirm_my_attendance`）才得點，**事後沒有補走入口［使用者尚未決定要不要做］**；完成後聚會詢問卡（`PostGatheringNotes`，每場只問一次，`boardgame-note-ask:<uid>`，15 秒收起）→選擇視窗／單款直達寫作畫面。
- **集點規則**：出席且當天指定任一款七項評分完整得 1 點；一天只算 1 點；管理者回空；免費券 v2（同月第 2 點變券、月點數歸零、券隔天起可用、用券當天不集點）。
- **管理者集點狀況**（`LoyaltyAdmin.tsx`）：成員列（本月 N/2、總點、券、已用）＋「明細」＋四顆按鈕；聚會設定（預計聚會、聚會管理、`NewGatheringWizard`：測試場勾選、四步驟）；**手動加入參加者清單已勾選者置頂**；人數上限框固定寬度。想玩提示只給管理者。
- **名單隱私**：預設只顯示人數；VIP 看暱稱；管理者看「暱稱（LINE／FB）」；**隱藏暱稱者顯示「匿名玩家」但仍列入榜單**。

## 5. 前端主要功能
- **導覽**：桌遊收藏、統計中心、「聚會．留言」（VIP 非管理者）、俱樂部（管理者第三顆是「⚙ 管理」）、VIP／管理者另有「✦ 規則助手」；桌面在頂端、手機在底部。
- **主畫面**：搜尋、篩選抽屜（顯示設定含三種檢視）、類型膠囊、新加入桌遊區（`NewArrivals`）、排序在標題旁、「我的統計 ›」（`openMyStats()`，`jumpView 'stats'`）；三種檢視 `list`（**詳細資料式表格**，`card-list.css`）／`grid-4`／`grid-9`；新遊戲置頂（15 天）、NEW 30 天。
- **詳細視窗 `GameModal` v2**（`gm-v2`，`game-modal-v2.css`、`GameInfoSheet.tsx`）：大封面頂部；概覽最前面資訊格；簡介三行可展開；2×2 入口卡片（規則連結／遊戲背景／擴充／玩錯紀錄）＋底部彈窗（一次一個；Esc／返回先關彈窗；換遊戲自動關）；權限：規則連結所有人、背景與擴充管理者永遠有（其他人有資料才有）、玩錯紀錄 `(vip||admin) && !referenceOnly`；**彈窗內**：管理者「＋ 新增連結／上傳 PDF（`GamePdfUpload`，依內容猜範圍）／新增玩錯紀錄」，VIP「＋ 投稿規則連結／影片」「投稿玩錯紀錄」（`UploadModal`）；貼 YouTube 自動帶標題、Bilibili 手填；評分分頁摘要＋「前往我的評分」（評分彈窗頂部放封面，`game-rate-sheet.css`）；討論、紀錄分頁。層級 `.modal-backdrop` 1220。
- **想玩／已玩**（`usePersonalCollection.ts`）：訪客存 `localStorage`，登入後以雲端為準；取消已玩走 `runUnplayFlow`（`unplayFlow.ts`）。
- **俱樂部（`MyList.tsx`）**：`view`＝`home | stats | gatherings | notes | board | ratings | submissions | card`；首頁功能總覽（`ClubIcons.tsx`、`club-home.css`）、大卡（免費券、本月點數）、**本命桌遊頒獎台**（`FavoriteGames.tsx`、`favorites.css`）。我的統計（概況／想玩／已玩／評分／分布圖；補日期 `PlayedGameRecord`；封面點擊開詳細視窗）；我的評分（`MyRatingsHub`，勾選刪除）；我的心得（`MyNotes`＋`NoteForm`：遊戲管理與發表紀錄兩分頁、勾選刪除、「儲存全部」；**自己按「＋ 寫心得／留言」開的寫作畫面 ✕／返回只收起該畫面**）；**我的聚會（`MyGatherings.tsx`、`my-gatherings-v2.css`、`mg-choose.css`）**；留言板（`ClubBoard`，一般 VIP 在「聚會．留言」第三分頁；**從留言板發表→返回回留言板，`fromBoard`**）；我的投稿（`MySubmissions`，網址→標題→遊戲，貼 YouTube 自動帶標題並依標題選遊戲）；集點卡（非 VIP）。
- **統計中心（`Leaderboard.tsx`）**：遊戲榜（想玩／已玩／整體／留下來／綜合分數；搜尋＋最高／最低收進搜尋框）、玩家榜（**含「本命桌遊」分頁**）、規則助手熱搜（`RuleStatsBoard`；**管理者每列「刪除」鈕**，一般 VIP 看不到）、統計表（`StatsTables`，全螢幕）、分布圖（`ScatterChart`，手機預設 `touch-action: pan-y`，「拖曳縮放」開關，點空白收起浮卡）。
- **管理中心（`AdminCenter.tsx`）**：成員／集點聚會／**上傳檔案（`RulebookBatchUpload.tsx`、`upload-center.css`、`upload-row.css`）**／資料匯入。上傳檔案四分頁：PDF（搜尋列置頂 sticky、PDF 份數與總容量在搜尋欄下、篩選可摺疊、「缺少」篩選、依遊戲分組；上傳視窗 `PdfUploadModal` z-index 1270，依檔名＋內容猜範圍，`scopeManual`）、連結（原地編輯、列顯示影片標題、貼連結預覽顯示遊戲與影片名稱、「＋」視窗）、玩錯紀錄（待審核在搜尋列上方）、詞庫（「貼上 AI 回覆」每行 `遊戲名｜中文詞｜對應詞`，標「AI 建議」，上限 300 行；**`GlossaryMisses`：未對應詞清單、「複製清單」附 AI 說明並自動開詞庫「＋」視窗、「搜尋零結果的詞」區塊（單筆刪除與清空、含來源標示）、「匯出給 AI 分析」（選遊戲→複製或下載 `miss_analysis_<遊戲>_<日期>.txt`）、`askAi`（用中文詞＋累積英文候選詞搜尋後複製給 AI 並開投稿視窗）**）。分頁顯示名「上傳檔案」，`AdminCenter` 的 key 仍 `'rulebooks'`。**待審標題一律叫「待審核」。**
- **垃圾桶**：只留基本資料與封面；還原只救遊戲本身，規則書要重傳。**`cleanupGameData`（`src\lib\gameCleanup.ts`）現行 5.5 + 9 步**：①規則書 PDF 與文件列 ②擴充（含圖片）③背景 ④詞庫 ⑤未對應詞（`glossary_miss`）⑤.5 搜尋零結果詞（`admin_get_search_misses`＋`admin_delete_search_miss`，對詞去重）⑥玩錯紀錄 ⑦熱搜統計 ⑧英文詞候選 ⑨本命桌遊；errors 為嚴重（檔案沒刪成功）、warnings 為次要。不動玩家的想玩／已玩、評分、心得、遊玩紀錄、聚會；`rule_submissions`、`planned_gathering_games` 沒掃到清理［未驗證］。
- **共用 hook**：`useVip`（模組層 `cache`）、`useSession`（只有 `SIGNED_OUT` 才接受 `null`）、`askConfirm`／`showNotice`／`askInput`（`src\lib\`）、**`useBackClose`（堆疊式）**。
- **深色模式**：`index.html` 內嵌 script 在 CSS 前設 `data-theme` 與 `style.colorScheme`（預設 `DEF = 'dark'`；只有手動選過才寫 `boardgame-theme`）；`src/lib/theme.ts`；`dark-theme.css`～`dark-theme-12.css` 覆蓋舊檔寫死色碼；`ThemeHint` 只對內建瀏覽器首次進站顯示一次（`boardgame-theme-hint-seen`）。

## 6. 規則助手（RAG）
**6.1 原則與現況**：只根據檢索片段回答、列出書名＋頁碼、找不到依據要明說、不從影片查規則；只讀 `ai_indexed = true`；只給 VIP／管理者，後端驗證；**零生成式 AI API 費用**；**尚未啟用任何生成式 AI**。規則助手頁是搜尋優先單頁（`RulebookPage.tsx`）：搜尋框（全部非僅供參考遊戲，最多 8 筆）＋可收合「最近更新的玩錯紀錄」→選遊戲後：規則連結＋`GameErrata`（只看不投稿）＋`RulebookAssistant`；「大家最近常查」前 5 名。
**6.2 搜尋函式 `search_rulebook_chunks(p_bgg_name, p_query, p_alt default null)`（現行 v10，檔案 `BoardGameSQL/search_rulebook_chunks_v10.sql`）**：驗 VIP → 判斷來源 `v_src`（管理者 `admin`、其餘 `user`）→ 查詢取前 200 字 → advisory lock → 刪舊 log（7 天）／misses（90 天）→ 非管理者今日 ≥ **50** 丟 `DAILY_LIMIT` → 非中文字進英文全文檢索 → 詞庫整句比對（最長詞優先）→ 記錄未對應詞（只用原問句，寫入 `kind='glossary_miss'` 與 `source`，主鍵四欄）→ 中文子字串比對（簡體 `p_alt` 併入同套計分，詞上限 60）→ 其他語言文件子字串比對 → **沒有任何可搜詞，或沒有任何命中段落時，呼叫 `_log_search_misses` 記零結果後直接回傳（不寫 log、不扣次數）** → 找到才寫 log 與統計（非管理者）→ 回傳。排序：詞庫詞／同義詞 +2、3 字以上整段詞 +1、2 字滑動詞 +0.5、稀有詞（已索引段落中 ≤4 段出現）加倍，加 `ts_rank_cd`；範圍加分 FAQ 0.3 ＞ 玩家整理 0.2 ＞ 主遊戲 0.1（只打破平手）；每種語言各取前 5 段。**改前一律先請使用者貼線上 `pg_get_functiondef('public.search_rulebook_chunks(text,text,text)'::regprocedure)`，不要憑文件重寫。**
**6.3 切段與前端搜尋**：`extractPdfText.ts`（`pdfjs-dist`、`cMapUrl`＋`public/cmaps/`；`sniffPdfLanguage` 回傳含 `pages`、`head`；每段 ≤800 字、重疊 150 字、不跨頁；`NO_TEXT` 門檻；最多 3000 段）。`RulebookAssistant.tsx`：**結果顯示順序＝中文規則書優先 → FAQ → 擴充 → 主遊戲 → 玩家整理（只改前端顯示，同組內照分數）**；結果列有 `data-scope`；選中狀態用 `aria-pressed`；重點句截取、字體三段、OCR 亂碼過濾（只用在顯示）；**搜尋框含中文時，下方 `.ra2-sug` 顯示「可能的英文詞」chip（來源 `src/lib/zhEnGlossary.ts`，內建跨遊戲通用詞與兩款專屬詞；點選只改搜尋框〔原內容＋英文詞，再點移除〕，不搜尋、不扣次數；縮小搜尋範圍抽屜內的英文 chip 仍立即搜尋）**。**「點選候選回報」已做**：`reportPicks`（`RulebookAssistant.tsx`）→ `report_term_pick` → `rule_term_candidates`；只回報內建 `zhEnGlossary.ts` 已有的組合，是使用統計不是新詞發現；**缺管理者核准／退回介面**（`admin_set_term_candidate_status` 沒有前端呼叫）；第 333、336 行有殘留 `console.log`［待拿掉］。
**6.3.1 繁簡搜尋與文件語言**：前端 `toSimplified.ts`（動態 `import('opencc-js')`）、`opencc-js.d.ts`（`src\lib\`）；文件語言判斷 `admin_auto_doc_language`（中文段落占一半以上 → zh；帶重音拉丁字母占 ≥1.5% → other；其餘 en），上傳前判斷與手動調整（`32869ae`，未驗證）。語言選項目前只有 `zh`／`en`／`other`；是否拆細未決定。
**6.4 詞庫與未對應詞／搜尋未命中分析**：詞庫表見第 2 節（`confirmed`、`note` 欄位已驗證存在）；旭日詞庫種子（生兵→Recruit／Summon；城堡→Stronghold；大名→Daimyo；福壽祿／福祿壽→Fukurokuju 等）。**搜尋未命中分析流程**：玩家／管理者搜尋 → 沒對應詞記 `glossary_miss`、整次沒結果記 `search_zero_result`（標來源）→ 管理者在「上傳檔案→詞庫→匯出給 AI 分析」選一款遊戲，取得五節文字（一、未命中詞；二、現有詞庫，標「AI 建議，待確認」；三、候選段落，每詞最多 2 段、附前後各一段，最多 30 詞、40,000 字；四、規則書原文附錄，依範圍／標題／頁碼排列，超過上限截斷並註明；五、AI 分析任務 A～F 類：A 缺中英對應、B 缺同義詞、C 規則書有但沒搜到、D 規則書沒有、E 文字品質問題、F 資訊不足）→ 貼給 AI → 第二部分「可匯入詞庫的清單」（`遊戲名｜中文詞｜對應詞`）用「貼上 AI 回覆」匯入，標 AI 建議、人工確認。限制：資料庫不會中翻英，候選段落只比對中文詞、詞庫英文詞或英文詞；簡體規則書可能漏；「行動」「能力」這類泛用詞不要進詞庫。`GlossaryMisses` 的 `AI_PROMPT`（快速複製清單）尚未改五類版。
**6.5 RAG 2.0 規劃與雲端 AI（全是規劃）**：三層產品（免費 RAG／個人 AI Context Pack／雲端 AI）；模組 A 文件語言版本頁碼、B 詞庫（已做）、C 混合式搜尋（`pg_trgm`、`pgvector` 效果未驗證）、D Context Pack、E 募資與雲端 AI（概念表 `ai_fund`、`ai_donations`、`ai_usage_logs`、`ai_settings`）、F 權限後端驗證、G 評測（Top 3 ≥90%、Top 1 ≥75%、頁碼 ≥95% 只是門檻）。Gemini 條款查證（2026-11-03）：未付費額度內容會被用於改進產品且人工審查，台灣不在歐盟例外名單；價格第三方互相矛盾；結論［AI 建議］正式雲端 AI 用付費版設預算上限；使用者尚未回答；動工前再查官方頁並更新 `privacy.html`。
**英文詞建議的後續方向［未決定］**：①通用詞庫擴充；②從已索引中英兩份文件對齊找對應詞；③管理者核准／退回介面與核准後進詞庫（玩家端回報已做，見 6.3）；④瀏覽器端離線小字典或免費翻譯 API（台灣可用性、條款、隱私都沒查證）；⑤本機 AI 批次產生候選詞庫再人工確認（現有「匯出給 AI 分析」是手動版）。使用者原話：「不希望到最後都必須靠上傳詞庫的方式更新」。
**6.6 測試題庫（頁碼要換成被索引那份）**：旭日戰魂錄 6 題（福壽祿可被殺／戰鬥平手榮耀高者贏／下凡與神殿效果不同／解除結盟／福壽祿可生兵／下一季起始玩家，第 6 題頁碼未找到〔候選關鍵字 `first player, next season`〕）；卓越的羅倫佐 4 題；第三款遊戲未決定。
**6.7 AI 出過的錯**：天照先答成神殿效果；福祿壽先說不確定；把玩家整理清單當規則引用沒標來源；混入外部細節不標來源。
**6.8 文件盤點**：旭日 FAQ 2.0（較新）與 One-Sheet 矛盾，One-Sheet 已刪；舊 Tesseract `_OCR.pdf` 是否已刪未確認；羅倫佐兩份文件舊切法索引要重傳。

## 7. 留言、心得、投稿、按讚、待審
- **三種留言資料不合併**：`game_notes`、`gathering_notes`、`user_game_status.note`；日期心得 `game_play_sessions.note` 是第四種。公開來源由 `get_public_gathering_notes` 合併（標了聚會顯示「MM/DD 場次名稱」，`formatNoteTag`）。
- **統一寫作畫面 `NoteForm`**：留言（公開）／心得（私人）、可互相複製、標聚會 chips（**從聚會入口只列自己有評分的遊戲，管理者不限**）、日期 chips、兩邊有字→「儲存全部」（標聚會時一次 `saveGatheringNote`）；未玩過的遊戲「留言」鎖（管理者例外）；`NoteListItem` 共用列表（`tag` prop）。
- **留言板**、**按讚**（只有 VIP＋管理者）、**玩錯紀錄**（`game_errata`，投稿表單只給非管理者 VIP；AI 回饋投稿有核對碼）、**連結與詞庫投稿**（`rule_submissions`；PDF 投稿先不做）、**待審紅點**（`admin_pending_count()` 等）、**熱搜統計**（管理者可刪）、**擴充**、**遊戲背景**：規則同 5 節，細節以程式為準。

## 8. 本機 OCR／本機桌遊 AI（與網站分開）
- 路徑 `D:\LocalAI-Lab\02_BoardGame-RAG`（Python 3.11.9、RTX 3060 Ti）。使用者說之後再打算，不要追問。
- Tesseract 結案；**PaddleOCR**（`.venv-paddle`、`.venv` 轉圖）：`PaddleOCR(lang="chinese_cht", ..., enable_mkldnn=False)`、`ocr.predict()`；批次流程 `data\batch\`、`src\batch_finish.py`（疊隱形文字層）；先 OCR 再壓縮；重做用未壓縮原圖版。編號 01～15 對照：02、03、04、06、09 辨識結果只是雜訊，傳原檔；其餘 9 份 `_paddle.pdf` 已上傳。
- 規則書盤點：網站上傳 38 份（2026-11-10），現已 286 份 PDF；使用者規則書 80+ 份還在整理，先不要催。待處理：`RA_compressed` 掃描型需本機 OCR；`scan_text_layer.py`；網站內 OCR 工具 `tools/ocr/*.bat` 仍可用；**.txt 上傳不做**。

## 9. 多台電腦與 Git 作業
- 自動同步：Supabase 與 GitHub；**不會同步**：`.env.local`、`boardgames.csv`、沒 commit 的修改、OCR 語言包與 Python 套件。
- 新電腦：Git、Node.js LTS、VS Code，`git clone`、`npm.cmd install`、建 `.env.local`（兩行純文字不加引號）、`npm.cmd run dev`。日常：開始前 `git pull`；結束前逐檔 `git add`→中文 `git commit`→`git push`。曾因 TortoiseGit Amend 造成分岔（修法：備份後 `git reset --mixed origin/master` 再逐檔 add）。
- `AdminPanel.tsx` 在 `src\`。

## 10. 募資、非 VIP 付費（使用者 2026-11-05 提出，多半未定；啟動時間：等 AI 桌遊助手與畫面都做完）
- 募資「可以做」：收款方式想到銀行（問號）；用途＝開發網站／提高資料庫上限→訓練 AI→投資下一個桌遊；目標金額請 AI 幫忙確認（未定）；想開放非 VIP：鎖部分功能付費解鎖，或做成較開源版本；自助建庫版（依收藏自動生成 BGG 資訊）；長期桌遊店專用管理網站。
- ［AI 提醒，未驗證，使用者尚未回覆］目標金額要先查 Supabase、Vercel、網域實際價格；台灣收款稅務、營業登記、發票、「贊助 vs 付費解鎖」要問會計師；背景文字不鎖；規則書有版權，收費解鎖風險高於私下使用；BGG 使用條款沒查證；不要宣稱公益或可抵稅。
- 畫面美化已提前進行並完成六頁，見 `畫面改版.md`；導覽列改版仍是最後一步。
