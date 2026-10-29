# 桌遊規則助手（BoardGameResultAI）— 專案參考文件（去重精簡版）

> 給接手 AI。**先讀 `QUICKSTART.md`（現況、待辦、合作規則、文件維護規則），再讀本檔（架構與功能規則），最後讀 `生成後.md`（這兩份之後的修改紀錄，衝突時以它為準）。**
> 最後更新：2026-10-29 13:25（已併入：我的場次、補記遊玩、場次心得、`gathering_notes`、堆疊式返回機制、點遊戲後返回修正、z-index 調整）。

## 1. 專案簡介與技術架構

- **目標**：桌遊收藏與規則查詢網站（106 款，使用者在 Notion 整理後匯出 CSV）；最終 VIP 可查規則書（第 7 節）。網站**公開瀏覽，只有管理者能編輯**；朋友圈是主要玩家。
- 前端 React + TypeScript + Vite；後端 **Supabase（免費方案，首爾）**：資料庫、Google 登入、Storage。專案 ID `hgeuockbjrzayfdylavq`，Project URL `https://hgeuockbjrzayfdylavq.supabase.co`（根網址，不加 `/rest/v1/`）。前端只用 **Publishable key**；Secret／service_role key 絕不放前端或貼給任何人。
- 部署：GitHub → Vercel，正式分支 `master`，push 自動建置。環境變數（本機 `.env.local` 不在 Git、Vercel 後台都要有）：`VITE_SUPABASE_URL`、`VITE_SUPABASE_PUBLISHABLE_KEY`。**地雷**：Vercel 對 `VITE_` 變數必須選 **Config**（不是 Secret）；名稱錯一字母網站會悄悄退回本機備用資料；改環境變數要重新部署；Publishable key 含非英數字元會造成規則書區紅字錯誤。
- 指令：`npm.cmd run dev`（`http://localhost:5173/`）、`npm.cmd run build`（成功顯示 `✓ built in ...`；chunk 大於 500 kB 警告可忽略）。dev 中斷時 Console 會出現 `ERR_CONNECTION_REFUSED`、`Setting up fake worker`，PDF 上傳也會失敗，先確認 dev 有在跑。
- 資料更新：Notion → 匯出 CSV → 網站頁尾管理者登入 →「匯入 CSV」→ 預覽 →「確認匯入」（改資料、上傳封面、跑 SQL 不需 push；程式改動才要）。
- **不要上傳到 Git**：`boardgame_source.zip`、`supabase_import.sql`、`make_supabase_import.py`、`boardgames.csv`、`categories_check.txt`、`covers_needed.txt`、`list_categories.py`、`generate_boardgames.backup.py`、`.env.local`、`App.css.bak`、`client_secret_*.json`。曾因 TortoiseGit Amend 造成 master 與 origin/master 分岔（修法：備份後 `git reset --mixed origin/master` 再逐檔 add）。
- **程式結構**：`src/App.css` 只有 `@import`，**順序有影響不要調換**：`tokens`、`base`、`topbar`、`hero`、`library`、`filter`、`cards`、`modal`、`admin`、`mylist`、`footer`、`trash`、`docs`、`backtotop`、`tabs`、`ratings`、`leaderboard`、`loyalty`、`loyalty-card`、`loyalty-admin`、`account`、`sitebar`；`vip.css` 最後載入（近期覆蓋樣式貼在最底下）。`src/App.tsx` 只留 `Library` 的狀態與篩選／排序，導覽頁面用單一 `activePage`（`NavPage`，定義在 `TopBar.tsx`）。`src/components/`：`TopBar`、`ViewToggle`、`CategoryChips`、`SortControl`、`FilterDrawer`、`GameCard`、`GameModal`、`MergeDialog`、`PersonalToast`、`TrashSection`、`CoverImage`、`StatusButtons`、`RatingDots`、`RatingSection`、`PlayCounter`（無人使用，保留）、`PlaySessions`、`PersonalNote`、`DescriptionEditor`、`BackToTop`、`Leaderboard`、`CommunityStats`、`LoyaltyCard`、`CheckInDialog`、`InAppBrowserNotice`、`VipJoinDialog`、`VipLock`、`MemberAdmin`、`AdminCenter`、`StatsTables`、`RulebookPage`、`RulebookAssistant`、`RulebookBatchUpload`、`MyGatherings`、`GatheringNoteDialog`、`AddPlayLog`、`Icons`；`src/lib/`：`libraryTypes`、`filterStorage`、`gameFormat`、`fetchBoardGames`、`personalApi`、`useTrashActions`、`usePersonalCollection`、`useGamePlaySessions`、`useGameRatings`、`useGameDocuments`、`docLabels`、`useCommunityStats`、`leaderboards`、`useLoyalty`、`useTodayTask`、`useVip`、`useGamePeople`、`adminEvents`、`saveDescription`、`useIsAdmin`、`useSession`、`useInviteLink`、`useCheckinLink`、`googleLogin`、`uploadCover`、`parseCsv`、`extractPdfText`、`zhEnGlossary`、`useBackClose`、`useRulebookSearch`、`useMyGatherings`、`useGatheringNotes`、`supabase`；另有 `src/AdminPanel.tsx`、`PlayerPanel.tsx`、`MyList.tsx`（畫面叫「我的桌遊／我的俱樂部」）、`LoyaltyAdmin.tsx`、`GameDocuments.tsx`（在 `src/` 底下）。實際清單以本機為準。
- `src/data/boardGames.generated.ts`：本機備用資料與 `BoardGame` 型別，**不要手改、不要刪**；`public/covers/` 是舊封面備援。
- 空間用量（2026-10-28）：`rulebooks` 13 份 116.8 MB、`covers` 98 張 6.2 MB、資料庫 14 MB；免費額度未自行查證，以後台 Usage 為準。

## 2. 資料庫、儲存與權限（Supabase）

**通則**：RLS 全開；「Allow new users to sign up」已開啟，所以**所有寫入政策只能是 `auth.uid()` 等於本人，或 `is_admin()`**。管理者以 `admin_users`＋`is_admin()` 判斷，登入不等於管理者。新建資料表一律：`revoke all on 表 from anon; revoke truncate, references, trigger on 表 from authenticated;`，並用 `information_schema.role_table_grants` 確認 `anon` 無權限。**刻意不對 `board_games` 加外鍵**（玩家資料以 `bgg_name` 文字對應）。免費方案閒置一週暫停。含 `bgg_name` 的表：`board_games`、`game_documents`（有外鍵 cascade）、`game_play_sessions`、`game_ratings`、`gathering_games`、`gathering_notes`、`user_game_status`（改名補救先用 `information_schema.columns` 查全部）。

| 資料表 | 重點 |
|---|---|
| `board_games`（主鍵 `bgg_name`，`cover_slug` 唯一） | `name, cover_slug, link_*`（保留不用）、`category(text[])`、`bgg_score/difficulty/time`、`min/max_players`、`best_players/recommend_players(int[])`、`ranking_engine, classic_game_ranking, score_rank` 與四個其他排名、七個 `*_degree`、七個 `*_emoji`、`created_at`、`removed_at`、`removed_reason`(≤200)、`description`(≤300)。SELECT 所有人，寫入只有管理者。前端 `id` 只是流水號，不可用來對應圖片或使用者資料。 |
| `game_documents` | 規則書／FAQ，一款可多份；**任何人可讀**，所以規則書文字絕不能放這裡。欄位：`id`、`bgg_name`（外鍵 cascade；刪遊戲不刪 Storage 檔）、`doc_type`（rulebook/faq/errata/intro/video/other）、`language`（zh/en/other）、`title`、`source_type`（external/upload）、`external_url`、`storage_path`、`ai_indexed`、`created_at`、`index_status`、`index_error_code`、`page_count`、`edition`、`file_hash`、`source_note`、`indexed_version`。新增的連結 `doc_type` 只會是 video 或 other；畫面分區看 `source_type` 與是否 video。 |
| `user_game_status` | 主鍵 `(user_id, bgg_name)`：`want_to_play`、`played`、`note`(≤500，「我的整體心得」)、`play_count`（無日期次數 0～999）、`updated_at`、`want_first_at`／`played_first_at`。RLS 只有本人。 |
| `game_play_sessions` | 有日期的遊玩紀錄：`played_on`、`player_count`(1～99)、`note`(≤200)。**總次數＝`play_count`＋紀錄筆數**；新增紀錄不動 `play_count`；單次查詢最多 1000 筆；`addSession` 沒防重複（場次內按鈕在前端自己擋同日同款，補記允許重複但會確認）。 |
| `game_ratings` | 主鍵 `(user_id, bgg_name)`：`overall`(1～10)、`like/player_impact/communication/change/unique/keep_score`(1～5)；整體與 `keep_score` 必填。個別評分只有本人看得到；公開只有 `get_rating_summaries()`（門檻 5 人、`where is_vip()`）。 |
| `player_profiles` | 暱稱（公開）、`hide_in_lists`。 |
| `player_contacts` | **LINE／FB 名字（敏感）**，不可顯示在公開畫面，永不給 VIP；SELECT 本人或管理者。 |
| `gatherings` | `id`、`gathered_on`、`title`、`note`(≤200)；唯一 `(gathered_on, title)`。 |
| `gathering_attendees` | `(gathering_id, user_id)`、`exempt`、`source`（admin/self）。寫入只有管理者（玩家走 `join_gathering`）。觸發器 `attendee_makes_vip`。 |
| `gathering_games` | 當天指定遊戲。 |
| `gathering_checkins` | `gathering_id` pk、`token`、`is_open`、`capacity`（1～500 NOT NULL）。只有管理者。 |
| **`gathering_notes`**（2026-10-29） | `id, user_id → auth.users cascade, gathering_id → gatherings cascade, bgg_name, private_note, public_note（各 ≤200）, public_status ('visible'\|'hidden'), hidden_by（set null）, hidden_at, created_at, updated_at`；唯一 `(user_id, gathering_id, bgg_name)`。RLS 開，anon／authenticated 全 revoke，**只走函式**（直接權限檢查結果使用者尚未回報）。 |
| `loyalty_redemptions` | 免費券使用紀錄：`user_id`、`redeemed_at`、`redeemed_by`（補登有值、自動 null）、`used_on`（`(user_id, used_on)` 唯一）。 |
| `loyalty_grants` | 管理者贈送：`id`、`user_id`、`quantity`（1～5）、`granted_at`。**RLS、`revoke`、如何計入 `loyalty_totals`／`settle_vouchers` 尚未查證。** |
| `vip_members` | `granted_by`＝password／checkin／admin；只有管理者可讀寫。`vip_settings`、`vip_attempts` 前端讀不到。 |
| `rulebook_chunks` | `document_id`（cascade）、`index_version`、`chunk_index`、`page_number`、`section_title`（空）、`content`。不存 `bgg_name`。RLS 開、無直接權限。 |
| `rulebook_search_log` | 只存 `user_id`、`bgg_name`、`created_at`，不存問題內容；保留 7 天。 |

**函式**（security definer 一律 `set search_path = ''`，`revoke ... from public, anon`，需要的才 grant；改函式前請使用者匯出實際定義）：
- 身分：`is_admin()`、`is_vip()`。
- 評分／統計：`get_rating_summaries()`、社群統計彙總函式、`admin_get_all_ratings`、`get_game_people`。
- 集點：`loyalty_day_status`、`loyalty_point_days`、`loyalty_totals`（`total_points, month_points, earned_vouchers, usable_vouchers`）、`settle_vouchers(uuid)`、觸發器 `settle_vouchers_on_rating`／`settle_vouchers_on_attendee`、`get_my_loyalty_summary`、`get_my_loyalty_days`、`admin_get_loyalty_overview`、`admin_get_loyalty_days`、`admin_redeem_voucher`、`admin_grant_voucher(p_user, p_qty)`。
- 報到／VIP：`join_gathering(p_token)`、`redeem_vip_code`、`admin_set_vip_code`、`admin_set_vip`、`admin_list_members`、`get_vip_friends`（UI 未做）、`admin_vip_lock_info`、`admin_clear_vip_lock`、`get_hide_in_lists`／`set_hide_in_lists`、`admin_delete_member`（最後 `delete from auth.users`，所以 `gathering_notes` 連動刪除）。
- **場次（2026-10-29，已確認 anon 無權限）**：`get_my_gatherings()` → `id, gathered_on, title, note, attendee_count`（一般人只回自己出席的場次，管理者全部；未登入丟 `not logged in`）；`get_gathering_detail(p_gathering)` → jsonb `{attendees, games}`（非出席者且非管理者回 null；attendees 每筆 `n, me`；`hide_in_lists` 者對他人顯示「匿名玩家」，自己與管理者看真名；管理者另有 `c`（LINE／FB）、`h`、`s`、`e`，其他人 null；依報到時間排序；games 每筆 `b`、`n`）。
- **場次心得**：`save_gathering_note(p_gathering, p_bgg_name, p_private, p_public)` → 'saved'／'deleted'（兩欄都空＝刪除，不檢查出席；否則檢查已登入、聚會日 ≤ 今天（台北時間）、在出席名單（管理者也必須在名單上）、該款在 `gathering_games`；錯誤 `gathering not started`／`not attendee`／`game not in gathering`／`too long`／`not logged in`；公開欄清空時狀態回 visible，否則被隱藏的不因修改自動恢復）；`get_my_gathering_notes(p_gathering default null)`（只回自己的含私人欄）；`get_gathering_note_status()`（我出席過、聚會日已到且最近 30 天，回 `gathering_id, game_count, done_count`）；`get_public_gathering_notes(p_bgg_name default null, p_limit default 100)`（只有 VIP／管理者；只回公開且 visible；欄位 `id, bgg_name, game_name, nickname, content, is_mine`，不回聚會／時間／私人欄；limit 夾 1～200；**前端尚未呼叫，管理者隱藏留言的函式與畫面也未做**）。
- 觸發器：`set_user_game_status_times()`、`mark_played_from_activity()`（只掛 `game_ratings`）、`game_ratings_set_updated_at`。
- 規則助手：`admin_replace_rulebook_chunks`、`admin_mark_rulebook_failed`、`search_rulebook_chunks(p_bgg_name, p_query)`、`rulebook_search_remaining()`、`rulebook_has_index(p_bgg_name)`、`rulebook_indexed_games()`。

**Storage**：公開 bucket `covers`（檔名 `{coverSlug}.webp`，必須 ASCII，寫入只認管理者）；**私有 bucket `rulebooks`**（`application/pdf`、50 MB、只有管理者讀寫，檔名 `{docId}.pdf`）。

## 3. 前端欄位與 CSV 匯入

- **`BoardGame` 型別**：`id`、`name`（中文名，CSV「屬性」）、`bggName`、`slug`、`coverSlug`、`links`、`category[]`、`bggScore/bggDifficulty/bggTime`、`minPlayers/maxPlayers`、`bestPlayers/recommendPlayers`（獨立）、`rankingEngine`、`classicGameRanking`（網站稱「常玩遊戲排名」）、`scoreRank`（CSV「分數_排名」）、四個其他排名、七個 `*Degree`、七個 `*Emoji`。
- **CSV 必要欄位**（缺任一個，預覽報錯不寫入）：`屬性`、`bggName`、`類型`、`bgg網站`、`BGG分數`、`BGG時間`、`BGG難度`、`Ranking engine`、`分數_排名`、`人數上限`、`人數下限`、`推薦人數`、`最佳人數`、`喜歡度`、`快速性`、`溝通性`、`獨特性`、`玩家影響性`、`複雜性`、`變化性`；選填 `簡介`。「類型」逗號分隔（49 種，大項 3 個：策略、派對、陣營）；「墨敵賽」無網路資料，BGG 分數難度保留 `null`，**不要編造**。
- **不要揭露「綜合分數排名」的計算方式**，也不要在前端重算。排序：Ranking engine、常玩遊戲排名、綜合分數（卡片顯示 700 − `score_rank`）、名稱、BGG 分數／難度／時間、最佳／推薦人數；缺值排最後。
- **封面**：`coverSlug` 由 `bggName` 轉換（`makeCoverSlug`，ASCII 安全）。顯示順序：Storage → `public/covers/` → 🎲。**任何當檔名或 Storage key 的字串必須是 ASCII**。
- **匯入行為**（`AdminPanel.tsx`）：upsert → 上傳封面 → 把「資料庫正常、CSV 沒有」的遊戲移到垃圾桶（設 `removed_at`）。一次移超過 5 款要輸入「移除」。「簡介」欄空白不覆蓋。永久刪除只在垃圾桶手動做。
- **地雷：在 Notion 改 `bggName`** → 舊的進垃圾桶、新的當新遊戲；玩家的想玩／已玩／評分／聚會紀錄／心得以 `bgg_name` 對應，改名會讓紀錄失聯。補救：改回原名再匯入並還原，或 SQL 把所有含 `bgg_name` 的表一起改。
- 匯入後請使用者執行 `select bgg_name, created_at from public.board_games order by created_at desc limit 5;` 確認舊遊戲 `created_at` 沒被重設。

## 4. 主要功能規則（已完成）

- **首頁與篩選**：收藏清單是主角。類型膠囊（`CategoryChips`，「更多類型」視窗 `.cat-backdrop` 1100）；排序在標題列；「☰ 更多篩選」抽屜（人數區間、最佳／推薦人數、時間、難度五級、只看新遊戲 30 天、評分狀態、我的紀錄三顆眼睛＋分區顯示）。新增篩選條件要同步 `activeFilterCount`、`clearFilters`、`filteredGames` 依賴、`missingDataCount`、`filterStorage.ts` 的 `SavedFilters`／`DEFAULT_FILTERS`／`loadFilters`／`saveFilters` 與 `App.tsx` 的寫入 `useEffect`。檢視模式 `list`／`grid-4`／`grid-9`（`boardgame-view-mode`）。**新遊戲置頂**：`isPinnedGame`＋`PIN_DAYS = 15`，`createdAt` 15 天內且 `rankingEngine` 空白或非整數才置頂，任何排序都生效；分區顯示時只在各分區內置頂；NEW 標示 30 天。
- **篩選記憶**：`lib/filterStorage.ts`，鍵 `boardgame-filters`（`{version:1, filters}`）；搜尋文字不存；只存該瀏覽器。
- **詳細視窗（`GameModal.tsx`）**四分頁：概覽（簡介、屬性、大家評分摘要、管理者封面上傳與移垃圾桶）、評分、我的桌遊（累計次數說明、`PlaySessions`、`PersonalNote`「我的整體心得」）、規則（只顯示文件清單：🔗網頁、▶影片、📄PDF〔僅管理者〕）；固定大小；層級 `.modal-backdrop` **1220**。管理者評分頁：沒玩過（`adminScores` 為 null）七項一律顯示「未玩過」。
- **垃圾桶**：所有人看得到，只有管理者能移入／還原／永久刪除。
- **想玩／已玩**（`usePersonalCollection.ts`）：訪客存 `localStorage`，登入後以雲端為準；首次登入合併視窗；計數器 0～999；按「＋」記次數時若未已玩會一併標已玩（`skipPlayedRule: true`）；評分、記錄遊玩也自動標已玩；取消不會取消已玩。
- **「我的俱樂部」（`MyList.tsx`，內部 `view`：`home | stats | gatherings | addplay`）**：摘要卡（暱稱、徽章、想玩／已玩分頁按鈕、未登入說明、`ClubPoints`〔只有 VIP 非管理者〕）、「去評分」卡（`todayPending`）、入口：📊 我的統計、📅 我的場次（登入者）、📝 補記遊玩（登入者）；想玩／已玩清單（已玩每列 − ＋ 改 `play_count`，顯示總次數與最近日期）。`MyList` 用 `useBackClose(() => setView('home'), isOpen && mode !== 'loyalty' && view !== 'home')`；統計、場次、補記 header 只留 ✕。**待改版：想玩／已玩縮成入口、加搜尋排序、集點改暱稱旁小字、補記排除垃圾桶遊戲（見 QUICKSTART 第 4 節）。**
- **我的場次（`MyGatherings.tsx`）**：清單依月份分組（預設展開最新月與本月）；詳情顯示當天指定遊戲與出席者（管理者另見聯絡方式與來源標籤）；只有「我在出席名單上」且聚會日已到才有「✎ 寫心得」；現況仍有「我玩了這款」／「✓ 已記錄」（**將被移到心得頁選項**）；清單有「待填 N/M」橘字（**將改灰字「未記錄心得 N/M」**）。header 只留 ✕（詳情→清單→我的俱樂部），`useBackClose(() => setSelectedId(null), selectedId !== null)`。
- **補記遊玩（`AddPlayLog.tsx`）**：名稱搜尋最多 8 款（忽略大小寫與標點，開頭相符優先）、日期不可未來、人數 1～99 或空、心得 ≤200、同款同日要確認；儲存後標已玩（`skipPlayedRule`）。**目前選得到垃圾桶遊戲（待修）。**
- **場次心得（`GatheringNoteDialog.tsx`，`.gn-backdrop` 1250）**：私人／公開兩欄各 ≤200、複製鈕（只有一欄有字才能按、不自動儲存）、兩欄皆空且已有心得時按鈕變「刪除這則心得」；公開留言被隱藏時顯示警告；**將整個重做（QUICKSTART 第 4 節第三批）**。
- **公開評分**：整體 1～10＋適合留下來 1～5 必填，其餘五項選填；未滿 5 人顯示「評分累積中」；用語：喜歡度、影響度、溝通度、變化度、獨特性；完整評分＝七項皆非空。
- **管理者評分換算**（`computeAdminScores`，前端與資料庫要一致）：整體依 `ranking_engine`：≤25→10、≤50→9、≤65→8、≤80→7、其餘→6；適合留下來依 `score_rank`，只在玩過的遊戲間排名：名次 ≤30→5、≤60→4、≤90→3、其餘→2；`ranking_engine` 以 .5 結尾＝沒玩過，七項都不計；五個「度」取 `*_emoji` 字元數（去掉 U+FE0F 與空白，上限 5）。管理者 CSV 分數算一位評分者進社群評分。
- **社群統計**：想玩／已玩人數與月／季／年「期間新增」，只回傳彙總；不加「讚」；**留言板改為自願公開（第 10.1 節），尚未做閱讀頁**。
- **排行榜**：想玩、已玩（全部／本月／本季／本年）、整體評分、適合留下來（滿 5 人）；前 10 名；可展開名單；「📊 統計表」；`onOpenGame` 只開詳細視窗、**不關排行榜**。
- **`privacy.html`**：新增功能要同步更新。已涵蓋遊玩紀錄、評分、社群統計、排行榜、集點卡、聯絡方式、VIP、報到、帳號刪除、免費券、規則助手搜尋紀錄、翻譯／複製、**場次心得**（私人＝本人＋管理者；公開＝VIP＋管理者且不顯示場次與時間；可撤回；刪帳號一併刪除）。
- 左上角名稱「桌遊規則助手」。

## 5. 帳號、VIP、聚會、集點、免費券

- **層級**：訪客 → 一般登入 → VIP（評分、集點卡、報到、名單、統計表、規則助手）→ 管理者（也算 VIP，不顯示集點卡）。
- **登入**：只用 Google OAuth（專案 `board-game-site`，已發布正式版、只用基本範圍；**不要新增敏感範圍**；接近 80 人時回「目標對象」頁確認）。不採匿名帳號、不做 Email 登入。管理者 Gmail 同時 Google 登入會對到管理者帳號，測玩家要用另一個 Google 帳號。
- **LINE／FB 內建瀏覽器不能 Google 登入**：所有入口走 `googleLogin.ts` 的 `signInWithGoogle()`，偵測後顯示 `InAppBrowserNotice`；聚會連結結尾加 `&openExternalBrowser=1`。
- **玩家選單**：暱稱 ▾ →「修改暱稱與聯絡方式／登出」；暱稱與 LINE／FB 名字必填，可「稍後再說」。
- **VIP 取得**：①被列入出席名單 → 觸發器 `attendee_makes_vip`；②通關密碼（`redeem_vip_code`，每帳號 15 分鐘錯 3 次鎖、全站錯 10 次全鎖）。密碼不可放前端。
- **聚會連結**：`https://網址/?join=隨機碼&openExternalBrowser=1`，**只在聚會當天（台北時間）有效**。檢查：已登入、token 有效、開放中、有暱稱與聯絡方式、未額滿。管理者必須先指定至少一款遊戲＋人數上限才能建立連結；可開關、重設。`?card=日期` 仍支援（只開集點卡）。
- **報到流程**：點連結 → Google 登入 → 填暱稱與聯絡方式 → **自動報到**（`CheckInDialog` 開啟即呼叫 `join_gathering`）→ 評分（至少一款當天指定遊戲七項評完）→ 集點卡。手動加入的玩家：「集點卡」紅點（`useTodayTask`）。**沒有「我玩了」勾選；出席不自動算玩過。**
- **風險**：連結傳進群組後當天收到的人都能變 VIP；擋板只有人數上限與當天有效。
- **集點規則**（`loyalty_day_status`）：出席且當天指定遊戲任一款七項評分完整得 1 點；`exempt` 直接得點；沒指定遊戲的舊聚會日沿用舊規則；一天只算 1 點。不讀 `board_games`。
- **免費券 v2**：同月第 2 點當下自動變 1 張券、月點數歸零；券隔天起才能用；有券又有來的人當天一定使用（`settle_vouchers` 寫 `loyalty_redemptions`，`used_on`＝聚會日，用券那天不集點）；只處理 2026-10-27 以後的聚會日；事後修改或刪除評分不退點數、不退券。玩家端 `LoyaltyCard.tsx`（沒有使用視窗）；管理者端三個小分頁「聚會設定／集點狀況／免費券紀錄」，「補登」保留、「贈送」（1～5 張，`window.prompt`，`admin_grant_voucher`）＋「🎁 管理者贈送紀錄」。
- **集點卡畫面**：印章風；規則收進 `<details className="lc-fold">`；近期紀錄預設 5 筆（`RECENT_DAYS`）。評分狀態來自 `ratings`（只在 `Library` 呼叫一次）。
- **名單隱私**：預設只顯示人數；VIP 展開只看暱稱（可 `hide_in_lists`）；管理者看「暱稱（LINE／FB）」；評分者名單只有管理者；LINE／FB 永不給 VIP。
- **管理中心**（`AdminCenter.tsx`，`activePage === 'admin'`）：4 顆分頁「成員」「聚會集點」「規則書」「資料匯入」；「聚會集點」（`LoyaltyAdmin.tsx`，`lga-`）：新增聚會（`.lga-new` 兩欄）、近期聚會依月份分組、出席者標籤、指定遊戲。

## 6. 視覺風格與樣式地雷

- 風格：**溫暖桌遊俱樂部**。色票（`tokens.css`）：奶油 `#F5F0E5`、紙白 `#FBF7EC`、森林綠 `#456B50`（深 `#365B40`）、焦糖 `#B78A5A`、深墨綠 `#34463C`；變數 `--c-*`、`--radius-*`、`--shadow-*`、`--z-bar/--z-modal`。
- 導覽：桌遊收藏、排行榜、集點卡、我的桌遊（管理者第三顆是「⚙ 管理」），VIP／管理者另有「✦ 規則助手」；桌面在頂端、手機在底部（`sitebar`）；一次只開一頁。**手機（≤760px）所有遮罩／抽屜／視窗 `bottom` 停在導覽列上方（`--nav-h`），樣式在 `vip.css` 底部；不要提高 `.sb-nav` z-index**。抽屜 class：`.mylist-backdrop`／`.mylist-drawer`、`.drawer-backdrop`／`.filter-drawer`、`.modal-backdrop`、`.ma-backdrop`、`.ra-backdrop`、`.account-backdrop`、`.cat-backdrop`。
- **視窗層級（2026-10-29 實查）**：視窗一律 `createPortal(..., document.body)`；`.mylist-backdrop` 1100、`.mylist-drawer` 1200、`.ra-backdrop` 1100、`.cat-backdrop` 1100、報到視窗 1050、頂端列 900、「請改用瀏覽器開啟」1200、**`.modal-backdrop` 詳細視窗 `vip.css` 先設 1150、第 1872 行再覆蓋為 1220（疊在我的桌遊抽屜上）**、`.gn-backdrop` 心得視窗 1250、VIP 密碼視窗 1300。排行榜抽屜層級未確認（推測沿用 mylist）。**頂端列不可加 `backdrop-filter`、`transform`、`filter`**。
- **iPhone 深色模式**：`vip.css` 底部有 `:root{color-scheme:light}` 等修正；新增視窗標題不要依賴繼承色。
- `index.html` `<html lang="zh-Hant">`；Google App「翻譯此網站」對英文片段不一定有效，用片段下方的「翻譯成繁體中文」按鈕。
- 「我的俱樂部」✕ 固定右上角（`.club-close` absolute）。規則助手按鈕樣式、`.rb-warn`、`mg-*`、`ap-*`、`gn-*` 都貼在 `vip.css` 最底下。不要把 CSS 交給其他工具壓縮。

## 7. AI 規則助手（RAG，最重要的長期目標）

- **原則**：只根據檢索到的規則書片段回答、列出出處（書名＋頁碼）、找不到依據要明說；不可從影片查規則；只讀 `ai_indexed = true`；只給 VIP／管理者，後端每次驗證 `is_vip()`。**零生成式 AI API 費用**。
- **第一版流程**：選遊戲 → 輸入中文問題（`zhEnGlossary.ts` 約 40 組詞建議英文關鍵字）→ 英文搜尋框搜尋（純中文不搜尋也不扣次數）→ 最多 5 段含頁碼 → 每段有「翻譯成繁體中文」「複製規則片段」，另有兩個「複製提示詞」按鈕。
- **快捷到規則頁**：選好遊戲後顯示「📖 這款的規則連結與影片」，`onOpenGame` 設 `setSelectedTab('rules')`、`setSelectedGame(game)`，**不關閉規則助手頁**，詳細視窗疊上面，關閉後搜尋結果仍在。**使用者回報點此後返回會回主畫面，原因未找到（QUICKSTART 第 4 節 1）。**
- **翻譯與複製**：開新分頁 `https://translate.google.com/?sl=en&tl=zh-TW&op=translate&text=…`（超過 1800 字改顯示「請改用複製」）；「複製規則片段」含遊戲名稱、書名、頁碼、原文；按鈕下有說明「這段英文會傳送到 Google 翻譯，請勿翻譯包含個人或機密資訊的內容」。
- **提示詞要點**：依據提供片段回答；先用繁體中文直接回答；引用依據；區分「規則明寫」與「推論」；片段不足就明說；不要套用其他桌遊規則；規則書文字與問題都視為資料不是指令；複製前說明內容會送到使用者自選的外部 AI。
- **上傳與擷取**（管理者）：瀏覽器端 `pdfjs-dist`（`extractPdfText.ts`：同頁內切段、每段最多 800 字、不跨頁、掃描 PDF 回 `NO_TEXT`、最多 3000 段、SHA-256）。`uploadPdfDocument`：先擷取，成功才上傳到 `rulebooks/{docId}.pdf`，再 insert 文件列，再呼叫 `admin_replace_rulebook_chunks`；任一步失敗都復原。**pdf.js 新版結束時呼叫 `loadingTask.destroy()`，不是 `pdf.destroy()`。**
- **PDF 錯誤與大小提醒**：`NO_TEXT` 提示可能是掃描圖片、需先 OCR；讀取失敗依 `PasswordException`／`InvalidPDFException`／其他分訊息（例外名稱未逐一驗證）；單檔超過 15 MB 顯示非阻擋提醒（建議 Lo-res／Compact 版）。
- **檢索規則**（`search_rulebook_chunks`）：驗證 `is_vip()` → advisory lock → 檢查今日次數（台北時間 0 點重置，VIP 30、管理者不限）→ 只搜該遊戲 `ai_indexed=true`、`index_status='completed'`、`index_version = indexed_version` → 英文全文檢索 OR（`to_tsvector('english', …)`，不看語言欄）、最多 5 段 → **只有找到結果才寫 `rulebook_search_log` 並扣次數** → 順便刪 7 天前紀錄（不啟用 pg_cron）。
- **管理中心「規則書」分頁**（`RulebookBatchUpload.tsx`）：①上傳 PDF：多檔，每列只有遊戲選擇（`GamePicker`，最多 8 個符合者）；遊戲、類型、語言由檔名猜（`guessGame`、`guessDocType`、`guessLanguage`）；有未選遊戲時「全部上傳」為灰；失敗可「重試失敗的」；同款同名會擋。②貼連結／管理文件：先選遊戲，列該款文件、可刪除；表單只有標題與網址；YouTube、youtu.be、bilibili、b23.tv、vimeo 存 `video`，其餘 `other`；YouTube 自動帶名稱（oEmbed）。③顯示名稱統一 `lib/docLabels.ts`（`docLabel`、`docKind`、`docIcon`）。語言只是顯示標記。
- **文件來源**：規則書、FAQ、中文規則網站（另存成 PDF 再上傳）；`intro` 與 `video` 不進索引；日文第一版不收。**上傳的 PDF 只給 AI 檢索、不公開**；使用者端只顯示連結與影片。
- **授權**：使用者決定一律啟用；AI 已提醒私有 bucket 不等於取得授權（非法律意見）。
- **未決／之後**：中文檢索（`pgroonga`、`pg_trgm` 等皆未啟用、未實測）；跨語言問題尚未根治（專有名詞對照、語意搜尋、翻譯 API 皆未查證）；中英檢索測試集；網站內直接回答的生成式 AI（候選 Gemini 免費 API，條款未查證）；「更新版本」按鈕；章節標題；OCR；使用者端「玩錯勘誤」（需新資料表）；管理中心「規則資源管理」整理。
- 驗收標準：文件可分別管理；文字型 PDF 能擷取並保留頁碼；結果不混入其他桌遊；可看原文與出處；可複製提示詞；訪客與一般會員無法繞過前端呼叫檢索；PDF 原檔不公開；網站沒有生成式 AI API 呼叫；找不到時不假裝有答案；測四種身分。
- **`lib/useBackClose.ts`（2026-10-29 重寫為堆疊式）**：`useBackClose(onClose, enabled = true)`。**每層視窗各佔一筆歷史**（`pushState({backDepth})`），返回／右滑只關最上面一層；✕ 或程式關閉時自己 `history.go(-n)` 收回；同一瞬間一關一開沿用舊那筆；收回期間用 `expectedPops` 略過自己造成的 `popstate`（0.8 秒保護計時）；使用者按「前進」時退回去。已套用：`App.tsx`（導覽頁面＋進階篩選）、`GameModal`、`RulebookPage`、`PlayerPanel`、`CategoryChips`、`GatheringNoteDialog`、`MyList`（子畫面）、`MyGatherings`（詳情）；未套用：`CheckInDialog`、`VipJoinDialog`。**新視窗要支援返回鍵，只要呼叫 `useBackClose(onClose, isOpen)`，不要自己 `pushState`。** 底部按鈕有時要點 3 次的卡頓與此機制的關聯**未驗證**。

## 8. 其他想做清單（使用者提出，未排序）

- **站上拖曳調整排名＋匯出 CSV 給 Notion**（使用者說「晚點再嘗試」）：管理者專用；6 個排名欄位都已在資料庫；建議 `@dnd-kit` 拖曳、先顯示「將更新 N 款」再儲存、匯出 UTF-8 含 BOM 的 CSV；提醒網站改過排名後若先匯入舊 Notion CSV 會被覆蓋。開工前要看 `AdminPanel.tsx`、`fetchBoardGames.ts`。
- **「我的桌遊」升級**：想玩可標「近期想玩」「下次聚會想玩」；遊玩紀錄加對手／勝負；統計（已做：玩過幾款、總次數、約略總時數＝次數×BGG 時間／6 取整到 0.1 小時、最常玩 TOP 3；待做：最愛類型、常玩人數、每月趨勢）。
- **揪團與聚會規劃**：想玩清單挑候選、報名與候補、依人數推薦；「今天想玩什麼？」推薦；行事曆構想（VIP 填可參加時段→管理者開放報名與候補→轉成正式聚會），要與首頁「近期聚會」合併規劃；訪客紀錄跨瀏覽器同步。
- 其他：PWA（缺圖示）；VIP 朋友名單 UI；推薦牆；左右滑動切換分頁；Email 登入、現場報到碼（先不做）；VIP 鎖定 SQL（6 張表加 restrictive 政策 `"vip only"`＋改 `get_rating_summaries()`，執行前先討論）。

## 9. 多台電腦作業

**自動同步**：Supabase 資料與 Storage、GitHub 程式碼。**不會同步**：`.env.local`、`boardgames.csv`、沒 commit／push 的修改。

新電腦：①安裝 Git、Node.js（LTS）、VS Code，設定 `git config --global user.name`／`user.email`；②舊電腦 `git remote get-url origin`；③`git clone <網址>`，確認在 `master`；④`npm.cmd install`；⑤專案根目錄建 `.env.local`（兩行純文字、不加引號）：`VITE_SUPABASE_URL=https://hgeuockbjrzayfdylavq.supabase.co`、`VITE_SUPABASE_PUBLISHABLE_KEY=（Publishable key）`；⑥`npm.cmd run dev`，確認顯示 106 款。日常：開始前 `git pull`；結束前逐檔 `git add` → `git commit` → `git push`；不要兩台同時改同一批檔案。

## 10. 介面重整方向（2026-10-29）

> 來源：使用者貼了 ChatGPT 針對畫面截圖給的建議。**圖中的數字、聚會、遊戲 A／B／C 與封面都是示意假資料。** 使用者 12:05 已對下列大部分回「照建議」並採用 A～D 補充規則；實作順序見 QUICKSTART 第 4 節。

**核心原則**：桌遊是固定資料；收藏狀態是「你和桌遊的關係」；遊玩紀錄是「實際發生過的一件事」。同一份資料只在一個地方管理，其他地方做預覽。

| 頁面 | 回答的問題 | 管什麼 |
|---|---|---|
| 主畫面 | 今天要玩什麼？ | 近期聚會、即將開團的遊戲、快速新增遊玩紀錄 |
| 我的桌遊 | 我有哪些遊戲？ | 以遊戲為單位：想玩／已玩、次數、最近遊玩日、我的評分、搜尋篩選 |
| 桌遊詳細資訊 | 這款值得玩嗎？ | 共用資料：評價、規則、特色 |
| 我的遊玩紀錄 | 我實際玩過什麼？ | 以場次為單位：日期、當場遊戲、人數、心得、補登、個人統計 |

**詳細視窗新分頁（候選，未動工）**：概覽（我的評價、社群評價摘要、遊戲資訊、規則合併可展開）／所有紀錄／我的紀錄／最後一欄（「攻略」或「統計」，使用者未決定）。**概覽評分顯示（待確認）**：BGG、管理者、社群、個人各有標籤；沒評分時以社群為主；樣本達 5 人才顯示社群平均，不足顯示「管理者評分」並標示，都沒有顯示「尚無評分」。「單場評分」（`game_play_sessions` 沒有評分欄，要改表）與遊玩次數由場次自動計算（現行 `play_count`＋筆數）仍待決定。**主畫面**：加「近期聚會」卡片（不放完整月曆）、「我的桌遊」只放最近想玩 3 款。**底部導覽列候選**：首頁／探索／我的桌遊／遊玩紀錄／我的（最後才做，影響 `NavPage`、`TopBar`、`sitebar`、`--nav-h`、`useBackClose`）。

**仍待確認**：①「所有紀錄」要公開所有玩家評分與留言，與既有「個別評分只有本人看得到」衝突（留言板已改自願公開，評分仍未決）；②要不要廢除 `play_count`；③詳細視窗「評分」分頁入口是否保留；④首頁「近期聚會」要公開日期與人數需新函式（是否限 VIP），建立聚會仍是管理者功能，並與行事曆構想合併規劃；⑤「攻略」沒有資料來源。

### 10.1 已決定的規格
- **留言板**：自願公開。場次心得兩欄「私人留言」「公開留言」，都選填，中間有「複製」；私人存在自己的紀錄，公開只透過 security definer 函式給 VIP，隱藏暱稱者顯示「匿名玩家」；公開留言不顯示聚會日期與時間。資料表 `gathering_notes` 與函式已建（第 2 節）。
- **兩個留言入口（尚未做）**：①遊戲詳細視窗的留言板（含「別處玩過也能留言」，直接綁遊戲、不需出席）；②主畫面「最新留言」區。
- **我的場次**：已完成（第 4 節）。**補記過去的場次**：已完成，沿用 `game_play_sessions`；**出席不自動算玩過**。
- **心得跳窗**：評分完成得點、或自動用券後問「現在寫／稍後再寫」，不可阻擋評分或集點流程；未記錄的在「我的場次」標灰色「未記錄心得 N/M」。
- **分批**：返回機制（已做）→ 我的俱樂部精簡＋補記排除垃圾桶遊戲 → 心得頁重做＋刪除＋場次詳情清理 → 我的心得清單 → 自動跳窗 → D 遊戲留言板 → E 首頁「最新留言」＋「近期聚會」→ 導覽列。
