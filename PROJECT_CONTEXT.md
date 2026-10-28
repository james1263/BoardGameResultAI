# 桌遊規則助手（BoardGameResultAI）— 專案參考文件（去重精簡版）

> 給接手 AI。**先讀 `QUICKSTART.md`（現況、新需求、待辦、合作規則），再讀本檔（架構與功能規則）。**
> 最後更新：2026-10-28。本檔已把原本重複的「各批更新」依主題合併成最終狀態；被後來決定取代的舊方案已移除。

## 1. 專案簡介與技術架構

- **目標**：桌遊收藏與規則查詢網站（106 款，使用者在 Notion 整理後匯出 CSV）；最終 VIP 可查規則書（見第 7 節）。網站**公開瀏覽，只有管理者能編輯**；朋友圈是主要玩家。
- 前端 React + TypeScript + Vite；後端 **Supabase（免費方案，首爾）**：資料庫、Google 登入、Storage。專案 ID `hgeuockbjrzayfdylavq`，Project URL `https://hgeuockbjrzayfdylavq.supabase.co`（**根網址**，不加 `/rest/v1/`）。前端只用 **Publishable key**；Secret／service_role key 絕不放前端或貼給任何人（目前完全沒用到）。
- 部署：GitHub → Vercel，正式分支 `master`，push 自動建置。環境變數（本機 `.env.local` 不在 Git、Vercel 後台都要有）：`VITE_SUPABASE_URL`、`VITE_SUPABASE_PUBLISHABLE_KEY`。**地雷**：Vercel 對 `VITE_` 變數必須選 **Config**（不是 Secret）；名稱錯一字母網站會悄悄退回本機備用資料；改環境變數要重新部署；Publishable key 若含非英數字元會造成規則書區紅字錯誤（曾發生）。
- 指令：`npm.cmd run dev`（`http://localhost:5173/`）、`npm.cmd run build`（成功顯示 `✓ built in ...`；chunk 大於 500 kB 警告可忽略）。
- 資料更新：Notion → 匯出 CSV → 網站頁尾管理者登入 →「匯入 CSV」→ 預覽 →「確認匯入」（改資料、上傳封面、跑 SQL **不需 push**；程式改動才要）。
- **不要上傳到 Git**：`boardgame_source.zip`、`supabase_import.sql`、`make_supabase_import.py`、`boardgames.csv`、`categories_check.txt`、`covers_needed.txt`、`list_categories.py`、`generate_boardgames.backup.py`、`.env.local`、`App.css.bak`、`client_secret_*.json`。曾因 TortoiseGit Amend 造成 master 與 origin/master 分岔（修法：備份後 `git reset --mixed origin/master` 再逐檔 add）。
- **程式結構**：`src/App.css` 只有 `@import`，**順序有影響不要調換**：`tokens`（設計變數）、`base`、`topbar`、`hero`、`library`、`filter`、`cards`、`modal`、`admin`、`mylist`、`footer`、`trash`、`docs`、`backtotop`、`tabs`、`ratings`、`leaderboard`、`loyalty`、`loyalty-card`、`loyalty-admin`、`account`（可覆蓋前面）、`sitebar`；`vip.css` 最後載入（近期覆蓋樣式都貼在它最底下）。`src/App.tsx` 只留 `Library` 的狀態與篩選／排序；畫面在 `src/components/`：`TopBar`、`ViewToggle`、`CategoryChips`、`SortControl`、`FilterDrawer`、`GameCard`、`GameModal`、`MergeDialog`、`PersonalToast`、`TrashSection`、`CoverImage`、`StatusButtons`、`RatingDots`、`RatingSection`、`PlayCounter`、`PlaySessions`、`PersonalNote`、`DescriptionEditor`、`BackToTop`、`Leaderboard`、`CommunityStats`、`LoyaltyCard`、`CheckInDialog`、`InAppBrowserNotice`、`VipJoinDialog`（密碼機制保留）、`VipLock`、`MemberAdmin`、`AdminCenter`、`StatsTables`、`RulebookPage`、`RulebookAssistant`、`Icons`；`src/lib/`：`libraryTypes.ts`、`gameFormat.ts`、`fetchBoardGames.ts`、`personalApi.ts`、`useTrashActions.ts`、`usePersonalCollection.ts`、`useGamePlaySessions.ts`、`useGameRatings.ts`、`useGameDocuments.ts`、`useCommunityStats.ts`、`leaderboards.ts`、`useLoyalty.ts`、`useTodayTask.ts`、`useVip.ts`、`useGamePeople.ts`、`adminEvents.ts`、`saveDescription.ts`、`useIsAdmin.ts`、`useSession.ts`、`useInviteLink.ts`、`useCheckinLink.ts`、`googleLogin.ts`、`uploadCover.ts`、`parseCsv.ts`、`extractPdfText.ts`、`zhEnGlossary.ts`、`useBackClose.ts`、`supabase.ts`；另有 `AdminPanel.tsx`、`PlayerPanel.tsx`、`MyList.tsx`（畫面叫「我的桌遊／我的俱樂部」）、`LoyaltyAdmin.tsx`、`GameDocuments.tsx`。實際清單以本機為準。
- `src/data/boardGames.generated.ts`：本機備用資料與 `BoardGame` 型別，**不要手改、不要刪**；`public/covers/` 是舊封面備援。桌遊資料存 Supabase `board_games`，讀取失敗才退回本機備用。

## 2. 資料庫、儲存與權限（Supabase）

**通則**：RLS 全開；「Allow new users to sign up」**已開啟**，所以**所有寫入政策只能是 `auth.uid()` 等於本人，或 `is_admin()`，不可寫成「所有 authenticated」**。管理者以 `admin_users`＋`is_admin()` 判斷，**登入不等於管理者**；管理者帳號是手動建立的 1 個 Email＋密碼帳號。新建資料表一律：`revoke all on 表 from anon; revoke truncate, references, trigger on 表 from authenticated;`，並用 `information_schema.role_table_grants` 確認 `anon` 無權限。**刻意不對 `board_games` 加外鍵**（玩家資料以 `bgg_name` 文字對應，沒有外鍵）。免費方案：閒置一週暫停；檔案儲存約 1 GB。含 `bgg_name` 欄位的資料表：`board_games`、`game_documents`（有外鍵 cascade）、`game_play_sessions`、`game_ratings`、`gathering_games`、`user_game_status`（改名補救腳本用，先用 `information_schema.columns` 查全部）。

| 資料表 | 重點 |
|---|---|
| `board_games`（主鍵 `bgg_name`，`cover_slug` 唯一） | snake_case 欄位：`name, cover_slug, link_bgg, link_rulebook_zh/en, link_faq`（三個 link 欄保留但不用）、`category(text[])`、`bgg_score/difficulty/time`、`min/max_players`、`best_players/recommend_players(int[])`、`ranking_engine, classic_game_ranking, score_rank` 與四個其他排名（`communication_ranking`、`unique_ranking`、`player_impact_ranking`、`change_ranking`）、七個 `*_degree`、七個 `*_emoji`、`created_at`、`removed_at`、`removed_reason`(≤200)、`description`(≤300)。SELECT 所有人，寫入只有管理者。缺值為 NULL 或空字串。前端 `id` 只是流水號，**不可用來對應圖片或使用者資料**。 |
| `game_documents` | 規則書／FAQ 等，一款可多份；**任何人可讀**（政策 `documents public read`，admin 才能寫），所以**規則書文字絕不能放這裡**。欄位：`id`(uuid)、`bgg_name`（外鍵 `ON UPDATE/DELETE CASCADE`；刪遊戲會刪列但**不刪 Storage 檔**）、`doc_type`（`rulebook/faq/errata/intro/video/other`）、`language`（`zh/en/other`）、`title`、`source_type`（`external/upload`）、`external_url`、`storage_path`、`ai_indexed`（預設 false；影片不可 true；只有 rulebook／faq／errata 可 true）、`created_at`，以及索引欄位 `index_status`（`none/pending/processing/completed/failed`）、`index_error_code`、`page_count`、`edition`、`file_hash`、`source_note`(≤200)、`indexed_version`（預設 0）。 |
| `user_game_status` | 主鍵 `(user_id, bgg_name)`：`want_to_play`、`played`、`note`(≤500)、`play_count`（**沒有日期的次數**，0～999）、`updated_at`、`want_first_at`／`played_first_at`（觸發器只在第一次勾選時寫入）。取消勾選不刪列，前端略過全空列。RLS 只有本人。 |
| `game_play_sessions` | 有日期的遊玩紀錄：`played_on`、`player_count`(1～99)、`note`(≤200)。**總次數＝`play_count`＋該遊戲紀錄筆數**（不要混成一個數字存回）；新增紀錄不動 `play_count`，刪紀錄不取消已玩；單次查詢最多 1000 筆；`addSession` 沒防重複。 |
| `game_ratings` | 主鍵 `(user_id, bgg_name)`：`overall`(1～10)、`like/player_impact/communication/change/unique/keep_score`(1～5)；整體與 `keep_score` 必填。個別評分只有本人看得到；公開只有 `get_rating_summaries()`（security definer；門檻 5 人在函式內、六項各自算；`where is_vip()`）。 |
| `player_profiles` | 暱稱（公開、不含 Email）、`hide_in_lists`。 |
| `player_contacts` | **LINE／FB 名字（敏感）**：`user_id` pk、`contact_name`(1～40)。SELECT 本人或管理者、INSERT／UPDATE 本人、DELETE 只管理者；anon 無權限。**不可放進 `player_profiles`，不可顯示在任何公開畫面，永不給 VIP。** |
| `gatherings` | `id`、`gathered_on`、`title`（場次名稱）、`note`(≤200)；唯一 `(gathered_on, title)`，重複回 23505。 |
| `gathering_attendees` | `(gathering_id, user_id)`、`exempt`、`source`（`admin`/`self`）。INSERT／UPDATE／DELETE 只有管理者（玩家只能透過 `join_gathering`），玩家可讀自己的列。觸發器 `attendee_makes_vip`（AFTER INSERT）。 |
| `gathering_games` | 當天指定遊戲。（`gathering_plays`「我玩了」已 drop。） |
| `gathering_checkins` | `gathering_id` pk、`token`（隨機唯一）、`is_open`、`capacity`（1～500，**NOT NULL**）。只有管理者可讀寫。 |
| `loyalty_redemptions` | 免費券使用紀錄：`user_id`、`redeemed_at`、`redeemed_by`（補登有值、自動用券 null）、`used_on`（用在哪天，補登為 null；`(user_id, used_on)` 唯一）。永久保留、無刪除功能。 |
| `vip_members` | `granted_by`＝password／checkin／admin；只有管理者可讀寫。`vip_settings`（單列密碼雜湊）、`vip_attempts` 前端讀不到。 |
| `rulebook_chunks` | `document_id`（外鍵 cascade）、`index_version`、`chunk_index`、`page_number`、`section_title`（目前空）、`content`。**只存 `document_id`，不存 `bgg_name`**（靠 `game_documents` 對應，改名不失聯）。RLS 開、anon／authenticated 完全無直接權限。 |
| `rulebook_search_log` | 只存 `user_id`、`bgg_name`、`created_at`，**不存問題內容**；RLS 開、無直接權限；保留 7 天。 |

**函式**（security definer 一律 `set search_path = ''`，`revoke ... from public, anon`，需要的才 grant；改函式前請使用者在 SQL Editor 匯出實際定義）：
- 身分：`is_admin()`、`is_vip()`（`is_admin() or exists vip_members`）。
- 評分／統計：`get_rating_summaries()`（玩家＋管理者 CSV 換算合併）、社群統計彙總函式（只回人數）、`admin_get_all_ratings`（僅管理者）、`get_game_people`（VIP 只回暱稱且排除隱藏者，管理者含 LINE／FB）。
- 集點：`loyalty_day_status(p_user)`（核心，不讀 `board_games`）、`loyalty_point_days`、`loyalty_totals`（回 `total_points, month_points, earned_vouchers, usable_vouchers`）、`settle_vouchers(uuid)`、`trg_settle_vouchers()`＋觸發器 `settle_vouchers_on_rating`、`settle_vouchers_on_attendee`、`get_my_loyalty_summary`、`get_my_loyalty_days`、`admin_get_loyalty_overview`、`admin_get_loyalty_days`、`admin_redeem_voucher`（舊版，只補登）。內部函式已 revoke。
- 報到／VIP：`join_gathering(p_token)`、`redeem_vip_code`、`admin_set_vip_code`（至少 4 字）、`admin_set_vip`、`admin_list_members`、`get_vip_friends`（UI 未做）、`admin_vip_lock_info`、`admin_clear_vip_lock`、`get_hide_in_lists`／`set_hide_in_lists`、`admin_delete_member`（不能刪管理者）。`admin_create_gathering` **不存在**（前端本來就沒用）。
- 觸發器：`set_user_game_status_times()`、`mark_played_from_activity()`（只掛 `game_ratings`）、`game_ratings_set_updated_at`。
- 規則助手：`admin_replace_rulebook_chunks(p_document, p_chunks jsonb, p_page_count, p_file_hash)`、`admin_mark_rulebook_failed(p_document, p_code)`（內部檢查 `is_admin()`）、`search_rulebook_chunks(p_bgg_name, p_query)`、`rulebook_search_remaining()`、`rulebook_has_index(p_bgg_name)`、`rulebook_indexed_games()`。

**Storage**：公開 bucket `covers`（檔名 `{coverSlug}.webp`，**必須 ASCII**，寫入只認管理者）；**私有 bucket `rulebooks`**（`application/pdf`、50 MB、只有管理者讀寫，四條政策，檔名 `{docId}.pdf`；未登入開網址回 `Bucket not found`，已驗證）。`storage.objects` 其餘只有 `covers` 的四條政策。

## 3. 前端欄位與 CSV 匯入

- **`BoardGame` 型別**：`id`、`name`（中文名，CSV「屬性」）、`bggName`、`slug`、`coverSlug`、`links`、`category[]`、`bggScore/bggDifficulty/bggTime`、`minPlayers/maxPlayers`、`bestPlayers/recommendPlayers`（獨立，不要合併）、`rankingEngine`、`classicGameRanking`（網站稱「常玩遊戲排名」，CSV「老遊戲想玩綜合評分」）、`scoreRank`（CSV「分數_排名」）、四個其他排名（保留不排序不顯示）、七個 `*Degree`、七個 `*Emoji`。
- **CSV 必要欄位**（缺任一個，預覽報錯、不寫入）：`屬性`、`bggName`、`類型`、`bgg網站`、`BGG分數`、`BGG時間`、`BGG難度`、`Ranking engine`、`分數_排名`、`人數上限`、`人數下限`、`推薦人數`、`最佳人數`、`喜歡度`、`快速性`、`溝通性`、`獨特性`、`玩家影響性`、`複雜性`、`變化性`；選填 `簡介`。順序與檔名不重要，多的欄位忽略。「類型」逗號分隔（共 49 種，大項 3 個：策略、派對、陣營）；人數欄逗號分隔轉數字陣列；「最佳人數 」欄名尾端可能有空白（`cleanText` 處理）。「墨敵賽」無網路資料，BGG 分數與難度保留 `null`、顯示「未提供」，**不要編造**。CSV **不需要**為規則助手新增任何欄位（文件在網站上傳）。
- **不要揭露「綜合分數排名」的計算方式**（Notion 由數個排名相加），也不要在前端重算。排序只保留：Ranking engine、常玩遊戲排名、綜合分數（卡片顯示 700 − `score_rank`，方向標示反過來，分數高在上）、名稱、BGG 分數／難度／時間、最佳／推薦人數；缺值固定排最後。
- **封面**：`coverSlug` 由 `bggName` 轉換（`makeCoverSlug`，ASCII 安全：純英數維持；含中日文保留英數字加 8 位 FNV-1a 雜湊；完全無英數則 `game-<hash>`）。顯示順序：Storage `{coverSlug}.webp`（上傳後網址加 `?v=`）→ `public/covers/` → 🎲。Console 的封面 404 正常。匯入時 `matchCovers` 依檔名對應（完全相同 → 去括號／中文名相同 → 名稱開頭相同；多款符合則略過）。**教訓：任何要當檔名或 Storage key 的字串必須是 ASCII**。
- **匯入行為**（`AdminPanel.tsx`）：upsert → 上傳封面 → 把「資料庫正常、CSV 沒有」的遊戲**移到垃圾桶**（設 `removed_at`），不刪列、不刪封面。預覽分三類：①會移到垃圾桶（紅字）；②CSV 有但目前在垃圾桶（資料更新、**仍留在垃圾桶**，要自動還原就在 `toRow` 加 `removed_at: null`）；③垃圾桶裡本來就有、CSV 也沒有（維持原狀）。一次移超過 5 款要輸入「移除」。「簡介」欄沒有或空白不覆蓋原簡介。永久刪除只在垃圾桶區由管理者手動做（封面刪除後無法復原）。
- **地雷（最重要）：在 Notion 改 `bggName`** → 舊的進垃圾桶、新的當新遊戲（封面重傳）；新舊 `cover_slug` 相同會撞唯一限制；**玩家的想玩／已玩／評分／聚會紀錄與管理者換算以 `bgg_name` 對應，改名會讓紀錄失聯**（資料還在、畫面不顯示）。補救：①改回原名再匯入並在垃圾桶「還原」舊的；②真要改名，需 SQL 把所有含 `bgg_name` 的表一起改。
- 匯入後請使用者執行 `select bgg_name, created_at from public.board_games order by created_at desc limit 5;`，確認舊遊戲 `created_at` 沒被重設（新遊戲標示靠它：30 天內橘框＋NEW）。
- 社群平均連動風險：CSV 的 `ranking_engine`、`score_rank`、`*_emoji` 一改，社群平均會跟著變。

## 4. 主要功能規則（已完成）

- **首頁與篩選**：收藏清單是主角（不做「最新加入」「最受歡迎」）。主視覺縮成一條「今天，想玩哪一款？」＋搜尋框＋類型膠囊（`CategoryChips`：策略、派對、陣營固定在前，已選副類型，「更多類型 ▾」視窗可搜尋、多選、AND；數字是該類型總數，視窗用 `createPortal`、`.cat-backdrop` z-index 1100）。排序在標題列（`SortControl`：下拉＋升降冪＋「重設」，重設位置固定不跑位）。「☰ 更多篩選」抽屜（`FilterDrawer`，標題列 sticky）：我們有幾個人（**最少～最多區間，整個區間都玩得起來才列出**，缺值不排除；只選一邊＝剛好該人數；顛倒自動對調）、最佳／推薦人數、時間不超過 30／60／90／120 分、BGG 難度五級（`<1.8`、`1.8～<2.6`、`2.6～<3.2`、`3.2～<3.8`、`≥3.8`，缺值不屬任何級，五顆同一排）、只看新遊戲（30 天內）、評分狀態（我評過／我還沒評，需登入且評分讀取完成）、我的紀錄（三顆眼睛：想玩／未標記／已玩＋「依我的紀錄分區顯示」，`getMineGroup()`：有想玩→want，否則有已玩→played，否則 untouched）。「只看有封面」不做。新增條件要同步 `activeFilterCount`、`clearFilters`、`filteredGames` 的 useMemo 依賴、`missingDataCount`。檢視模式 `list`／`grid-4`／`grid-9`（存 `localStorage` 鍵 `boardgame-view-mode`）；手機不硬塞 4／9 欄；卡片等高、按鈕貼底；`@media (hover: none)` 取消 hover 上抬。手機收藏標題列不顯示標題、控制列佔滿整行。
- **詳細視窗（`GameModal.tsx`）**刻意精簡（不要再放排名、人數、類型、時間、難度）：四分頁 **概覽**（簡介、遊戲屬性、大家的評分摘要、管理者的封面上傳與「移到垃圾桶」）、**評分**、**我的桌遊**、**規則**（規則書／FAQ／中文介紹／影片連結，只接受 http(s)）；固定大小（`vip.css`：`.game-modal.has-tabs` 寬 460、高 `min(720px,100dvh-40px)`，手機全螢幕）；`TABS` 陣列＋`tab === 'xxx'` 切換。卡片按鈕叫「詳細資料」。
- **垃圾桶**：所有人看得到，只有管理者能移入（填原因）、還原、永久刪除、編輯原因；0 款整區隱藏是設計如此。
- **想玩／已玩**（`usePersonalCollection.ts`）：訪客存 `localStorage`（鍵 `boardgame-personal-collection`），登入後以雲端為準（先改畫面再寫雲端，失敗還原）；首次登入合併視窗（聯集、備註保留雲端、次數取大值、雲端寫入成功才清本機）；訪客紀錄不跨瀏覽器。計數器 0～999，按「已玩」不加次數（為 0 才設 1）；**按「＋」記次數時若尚未已玩會一併標已玩**（`skipPlayedRule: true`）；評分過、記錄遊玩也自動標已玩（觸發器＋前端即時更新）；取消不會取消已玩。
- **公開評分**：整體 1～10＋適合留下來 1～5 必填，其餘五項選填；未滿 5 人顯示「評分累積中」；社群平均與自己的 Emoji 評價並排，**不與「綜合分數」混用**。項目用語：喜歡度、**影響度（不要改成「玩家互動」）**、溝通度、變化度、獨特性；複雜度、快速性是遊戲屬性不列入評分；**完整評分＝七項皆非空**。
- **管理者評分換算**（`computeAdminScores`，前端與資料庫兩邊要一致）：整體依 `ranking_engine`：≤25→10、≤50→9、≤65→8、≤80→7、其餘→6；適合留下來依 `score_rank`，**只在玩過的遊戲間排名**（同分並列、不含垃圾桶）：名次 ≤30→5、≤60→4、≤90→3、其餘→2；**`ranking_engine` 以 .5 結尾＝沒玩過**，七項都不計（資料庫以 `ranking_engine = floor(...)` 判斷），評分頁顯示「未玩過」；喜歡度、影響度、溝通度、變化度、獨特性取 CSV 對應 `*_emoji` 欄字元數（去掉 U+FE0F 與空白，上限 5，0 個視為沒有）。管理者的 CSV 分數算一位評分者進社群評分（排除 `admin_users` 的 `game_ratings` 避免重複）；影響：玩家門檻 5 人含管理者那一票，排行榜評分榜與適合留下來榜同樣含管理者。管理者評分頁顯示五個圓點加「整體 N/10」「適合留下來 N/5」。
- **社群統計**：每款顯示想玩／已玩人數與月／季／年「期間新增」（以 `*_first_at`）；只回傳彙總；訪客不計；**不加「讚」按鈕、不做留言板**。
- **排行榜**：想玩、已玩（全部／本月／本季／本年）、整體評分、適合留下來（滿 5 人才上榜，平均到小數 1 位）；同分並列、前 10 名；可展開名單（見第 5 節隱私）；「📊 統計表」（VIP 看遊戲總表，管理者另有成員×遊戲矩陣，可依玩家／遊戲篩選，可匯出 CSV）；統計表打開時暫時隱藏排行榜抽屜。空狀態（`renderEmpty()`）會說明為什麼是空的並附按鈕（看全部期間／去逛收藏／先看想玩榜）；評分榜空時刻意不顯示「目前有幾款在累積」。
- **簡介**：管理者在「概覽」編輯，使用者說太耗時先跳過；若請 AI 擬稿，只寫「這款在玩什麼」一到兩句自己的話，不翻譯或改寫 BGG 簡介。
- **`privacy.html`**：日後新增功能要同步更新。已涵蓋遊玩紀錄、評分、社群統計、排行榜、集點卡、聯絡方式、VIP 名單、管理者可見內容、報到、帳號刪除、免費券自動使用紀錄、報到即 VIP；評分名稱已改「度」。**尚缺：規則助手搜尋紀錄。**
- 左上角名稱「桌遊規則助手」，AI 助手做好後再改成整體性名稱。

## 5. 帳號、VIP、聚會、集點、免費券

- **層級**：訪客（瀏覽、本機想玩／已玩）→ 一般登入（雲端同步、遊玩紀錄）→ VIP（評分、評分摘要、集點卡、聚會報到、名單、統計表、規則助手、之後的推薦牆）→ 管理者（也算 VIP，不顯示集點卡）。
- **登入**：只用 Google OAuth（Google Cloud 專案 `board-game-site`，已發布正式版、只用基本範圍；**不要新增敏感或受限範圍**，否則觸發驗證與 100 人上限；接近 80 人時回「目標對象」頁確認）。Client Secret 只存在 Supabase。**不採匿名帳號、不做 Email 驗證登入**。管理者 Gmail 若同時 Google 登入會對到管理者帳號，測玩家要用另一個 Google 帳號；建議管理者帳號開兩步驟驗證。一人多帳號靠「每人每款一筆＋唯一限制＋RLS」，規模大再加 CAPTCHA。
- **LINE／FB 內建瀏覽器不能 Google 登入**（Google 政策）：所有入口走 `googleLogin.ts` 的 `signInWithGoogle()`，偵測後顯示 `InAppBrowserNotice`「請改用瀏覽器開啟」並可複製網址；複製的聚會連結結尾加 `&openExternalBrowser=1`。一般登入按鈕不強制選帳號，「切換 Google 帳號」在暱稱選單。
- **玩家選單**：暱稱 ▾ →「修改暱稱與聯絡方式／登出」；管理者登出在頂端列。暱稱視窗第一次登入或尚未填聯絡方式時自動跳出（暱稱與 LINE／FB 名字必填，可「稍後再說」）。
- **VIP 取得方式**：①被列入出席名單（連結報到或管理者手動加入）→ 觸發器 `attendee_makes_vip` 自動成為 VIP（`source='self'` 記 `checkin`，其餘 `admin`；取消出席不取消 VIP）；②輸入通關密碼（`redeem_vip_code`，給沒參加聚會的朋友；每帳號 15 分鐘錯 3 次鎖、全站錯 10 次全鎖，管理者可在成員頁解鎖）。**密碼不可放前端**。
- **聚會連結（單一連結）**：管理者在聚會詳情建立 → 傳 `https://網址/?join=隨機碼&openExternalBrowser=1`。**連結只在聚會當天（台北時間）有效，含已報到的人**（`join_gathering` 日期檢查在最前，回 `not_started`／`ended`；過期訊息：「這個連結已過期，只在聚會當天有效。如果你已經報到過，請直接按底部的『集點卡』。」）。檢查項：已登入、token 有效、開放中、有暱稱與聯絡方式、未額滿（`for update` 鎖聚會防超額）。管理者**必須先指定至少一款遊戲＋人數上限（必填，隨時可改，含手動加入的人）**才能建立／複製連結；可開關、重設連結（舊連結立刻失效）；已有連結的場次至少保留一款遊戲；出席名單標示「自己報到」，可移除。聚會詳情順序：指定遊戲 → 人數上限 → 手動加入參加者 → 聚會連結（顯示「上限 N 人・手動加入 M 人・自己報到 K 人・連結還可報到 N−(M+K) 人」「有效至當天 23:59」）。`?card=日期` 仍支援（只開集點卡、不會讓人變出席者），介面不提供。
- **報到流程**：點連結 → Google 登入 → 填暱稱與聯絡方式 → **自動報到**（`CheckInDialog` 開啟即呼叫 `join_gathering`，失敗才出現「我來了」）→ 評分（至少一款當天指定遊戲七項評完；以前評過、免評分、沒指定遊戲則略過）→ 集點卡。**沒有通關密碼步驟、沒有「我玩了」勾選**（收到連結並報到＝當天有來）。手動加入的玩家：底部「集點卡」出現**紅點**（`useTodayTask`：今天有他的聚會、已指定遊戲、尚未得點才亮；切回網頁會重新讀取），集點卡最上方有「今天要做的事」卡（`lc-today`）直達該遊戲評分分頁；不做自動彈出評分。
- **風險提醒**：聚會連結傳進群組後，當天收到的人都能變 VIP；擋板只有「人數上限」與「只有當天有效」，上限請照實際人數填。
- **集點規則**（`loyalty_day_status`）：出席，且當天指定遊戲**任一款七項評分完整**得 1 點（評分可在家補、可修改、可以是以前評的）；`exempt` 免評分直接得點；沒指定遊戲的舊聚會日沿用舊規則（`game_play_sessions` 日期、每款都評完整）；一天不管幾場只算 1 點。不讀 `board_games`：遊戲被移垃圾桶或刪除不影響點數（畫面名稱退回 `bgg_name`、無「去評分」按鈕）；真正風險是在 Notion 改 `bggName`。不用藍牙／區網偵測。
- **免費券 v2**：同一個月**第 2 點當下自動變 1 張券，月點數歸零**（`month_points = 該月計入點數 % 2`，管理者表「本月」欄是餘數 0／1，總點數看「總 N 點」）；**券拿到的隔天起才能用**；**有券又有來的人，當天一定使用，不能累積**：聚會日「達成」且有可用券時，`settle_vouchers` 自動寫一筆 `loyalty_redemptions`（`used_on`＝該聚會日、`redeemed_by` null），**用券那天不集點**；只處理 **2026-10-27 以後**的聚會日；觸發時機為評分／出席異動的觸發器（內有 exception 保護，不擋評分）與兩個讀取函式先補算；**事後修改或刪除評分不退點數、不退券**；評分仍是前提，**不需管理者確認**。玩家端（`LoyaltyCard.tsx`）：評分前顯示「你有 N 張免費券可以用，評分完成後會自動使用」、用掉後顯示「今天已自動使用 1 張免費券」、印章「已用券」、「其中 N 張明天起才能用」、「免費券使用紀錄」；**沒有使用視窗**（`use_my_voucher` 已 drop）。管理者端：三個小分頁「聚會設定／集點狀況／免費券紀錄」；集點狀況一人一張卡（排序：可用券多→本月點數多→總點數多，可勾「只顯示有點數或有券的人」）；「補登」只補登現場已給過的券。已兌換超過累積顯示 ⚠（測試帳號曾顯示「已兌換 1、累積 0」，若非測試資料要查）。
- **集點卡畫面**（`LoyaltyCard.tsx`、`loyalty-card.css`）：印章風；點數、免費券、兩個印章格包進 `lc-wallet`；規則收進 `<details className="lc-fold">`；近期紀錄預設只顯示最近 5 筆（`RECENT_DAYS`），其餘按「顯示全部 N 筆」，邀請連結日期在被收起部分時自動全展開；1～4 步驟；舊聚會日沒指定遊戲時顯示「你已經在這天的出席名單上。管理者還沒指定要評分的遊戲……」。評分狀態來自 `ratings`（只在 `Library` 呼叫一次，不要在 `LoyaltyCard` 再呼叫）。同一天兩場的集點卡尚未實測。
- **名單隱私**：預設只顯示人數；VIP 展開只看暱稱（玩家可在暱稱選單關閉 `hide_in_lists`）；管理者看「暱稱（LINE／FB）」且不受隱藏影響；評分者名單只有管理者；LINE／FB 名字永不給 VIP。
- **管理中心**（`AdminCenter.tsx`，導覽只有一顆「⚙ 管理」）：大分頁「成員」「聚會集點」「資料匯入」（三等分膠囊、圖示在上，樣式 `ac-`／`ma-` 在 `vip.css`）。「成員與 VIP」：搜尋、VIP 開關、密碼設定、鎖定解鎖、刪除帳號（輸入暱稱確認）。「聚會集點」（`LoyaltyAdmin.tsx`，`lga-` 開頭）：新增聚會、近期聚會**依月份分組**（預設展開最新一個月與本月，點某天詳情就地展開在該列下方）、出席者頭像標籤（可搜暱稱或 LINE／FB 名字、顯示聯絡方式、免評分、來源標籤）、指定遊戲。樣式分散在 `vip.css`（`ma-`、`ac-`）、`loyalty.css`（`loy-`）、`admin.css`（`admin-`）、`loyalty-admin.css`（`lga-`）。

## 6. 視覺風格與樣式地雷

- 風格：**溫暖桌遊俱樂部**。色票（在 `tokens.css`）：奶油 `#F5F0E5`、紙白 `#FBF7EC`、森林綠 `#456B50`（深 `#365B40`）、焦糖 `#B78A5A`、深墨綠 `#34463C`；變數 `--c-cream/paper/forest/forest-dark/caramel/ink/ink-soft/line/danger`、`--radius-s/m/l`、`--shadow-s/m`、`--z-bar/--z-modal`。印章與會員卡只用在集點卡與少量裝飾。不做路由與資料夾大搬家。
- 導覽：桌面頂端、手機底部（`sitebar`）：桌遊收藏、排行榜、集點卡、我的桌遊（管理者第三顆是「⚙ 管理」），VIP／管理者另有第 5 顆「✦ 規則助手」（若擠縮成「規則」）。`BackToTop` 在手機避開底部導覽（760px 斷點、64px）。
- **視窗層級**：視窗一律 `createPortal(..., document.body)`；`.modal-backdrop` z-index 1100、報到視窗 1050、「請改用瀏覽器開啟」1200、頂端列 900、「我的桌遊」抽屜 1200、VIP 密碼視窗 1300（`.vip-join-backdrop`）。**頂端列（`.topbar`／`.sitebar`）不可加 `backdrop-filter`、`transform`、`filter`**，否則 `position: fixed` 的遮罩被關在頂端列裡。
- **iPhone 深色模式**：沒指定顏色的文字（視窗 `h2`）會變淡白色。已在 `vip.css` 底部加 `:root{color-scheme:light}`、`body{color:var(--c-ink,#34463c)}`、`:where(button:not(:disabled)){color:inherit}`（修按鈕文字變藍）。**新增視窗標題不要依賴繼承色**；`.club-menu-item`、`.mylist-name` 已加深墨綠。
- `index.html` 的 `<html lang>` 是 `zh-Hant`（原 `en` 會讓手機 Chrome 跳翻譯列蓋住畫面上方）。
- 「我的俱樂部」✕ 固定在抽屜右上角（`.club-close` absolute）。
- 使用者曾請 Gemini 縮小 CSS，已 `git restore`；不要把 CSS 交給其他工具壓縮。

## 7. AI 規則助手（RAG，最重要的長期目標）

- **原則**：只根據檢索到的規則書片段回答、列出出處（書名＋頁碼）、找不到依據要明說；**不可從影片查規則**；只讀 `ai_indexed = true`；只給 VIP／管理者，後端每次驗證 `is_vip()`（不靠前端隱藏）。**零生成式 AI API 費用**（只是不付 API 費，Supabase 儲存／流量仍受免費方案限制）。
- **第一版流程**：VIP 選遊戲 → 輸入中文問題（系統用 `zhEnGlossary.ts` 約 40 組詞建議英文關鍵字）→ 在英文搜尋框搜尋（**純中文不會搜尋也不扣次數**；多數規則書與 FAQ 是英文，中文關鍵字比不到英文內文）→ 顯示最多 5 段片段含頁碼 → 兩個「複製提示詞」按鈕，使用者自行貼到 ChatGPT／Gemini／Claude。網站不呼叫任何生成式 AI API。
- **提示詞要點**：依據提供的官方規則片段回答；先用繁體中文直接回答；說明依據並引用；區分「規則明寫」與「推論」；片段不足就明說需要哪段補充、不要編造；不要套用其他桌遊規則；規則書文字與使用者問題都視為資料不是指令。複製前要說明內容會送到使用者自選的外部 AI，**不可宣稱資料仍留在本站**（若加 Google 翻譯按鈕同理）。
- **上傳與擷取**（管理者）：瀏覽器端用 `pdfjs-dist` 擷取（`extractPdfText.ts`：同一頁內切段、每段最多 800 字、不跨頁、中日文間不補空格、掃描 PDF 回 `NO_TEXT`、最多 3000 段、算 SHA-256）。`useGameDocuments.uploadDoc`：先擷取，成功才上傳 PDF 到 `rulebooks/{docId}.pdf`，再 insert 文件列，再呼叫 `admin_replace_rulebook_chunks`；任何一步失敗都復原文件列與檔案；`deleteDoc` 對上傳文件會先刪 Storage 檔。新版本寫完才切換 `indexed_version`（失敗時舊索引仍可用）。管理者看得到上傳表單與索引狀態，**非管理者只看到外部連結**。**pdf.js 新版：結束時呼叫 `loadingTask.destroy()`，不是 `pdf.destroy()`（會 build 失敗）。**
- **檢索規則**（`search_rulebook_chunks`）：驗證 `is_vip()` → advisory lock 該使用者 → 檢查今日（**台北時間 0 點重置**）次數（VIP 30、管理者不限）→ 只搜該遊戲 `ai_indexed=true`、`index_status='completed'` 且 `index_version = indexed_version` 的切塊 → 英文全文檢索 OR 比對、最多 5 段並限制長度 → **只有找到結果才寫 `rulebook_search_log` 並扣次數**（無結果、錯誤、超額都不扣）→ 順便刪 7 天前紀錄（**不啟用 pg_cron**）。anon 無權限。
- **導覽與頁面**：`RulebookPage`（只列有索引的遊戲、可搜尋）＋`RulebookAssistant`，導覽第 5 顆「✦ 規則助手」只給 VIP／管理者。
- **文件來源**：規則書（中英文）、FAQ（多為英文）、中文規則網站（**另存成 PDF 再上傳**：Chrome Ctrl+P → 另存為 PDF → 取消頁首頁尾；不做自動抓網頁）；`intro`（中文介紹，著作權疑慮較高）與 `video` 不進索引；日文第一版不收。第一版不做 OCR、不讓 VIP 下載 PDF、不自動下載 BGG 規則書；只回傳最多 5 段短片段。
- **授權**：使用者決定不設開關、一律啟用；AI 已提醒私有 bucket 不等於取得授權、能從 BGG 下載不等於有權再上傳與擷取（非法律意見），風險由使用者自行評估。
- **未決／之後**：中文檢索方式比較（`pgroonga` 據 AI 所知對中日韓文支援較好、`pg_trgm` 備案；兩者與 `unaccent`、`vector`、`pg_cron` 都可用但**都未啟用**，`zhparser` 不在清單；皆**未實測**，目前不啟用任何擴充）；**跨語言問題尚未根治**（候選：使用者輸入英文術語、每款遊戲專有名詞對照表、之後評估語意搜尋／向量與免費翻譯 API，皆未查證，要做先與使用者討論）；中英檢索測試集（20～50 題、人工標頁碼、看是否出現在前 5 筆）；網站內直接回答的生成式 AI（候選 Gemini 免費 API，額度與資料用途條款**未查證**，要做時重查官方文件；不做連結使用者自己的 AI 帳號；本機 Ollama 只給進階使用者）；「更新版本」按鈕；章節標題；OCR。
- 驗收標準：文件可分別管理；文字型 PDF 能擷取並保留頁碼；結果不混入其他桌遊；可看原文與出處；可複製提示詞；訪客與一般會員無法繞過前端呼叫受保護的檢索；PDF 原檔不公開；網站沒有生成式 AI API 呼叫；找不到時不假裝有答案；測四種身分（訪客、一般會員、VIP、管理者）。
- `lib/useBackClose.ts`：開啟視窗時手機「返回」只關視窗；目前只套用 `GameModal`、`RulebookPage`，✕ 保留（擴充待辦見 QUICKSTART N3）。

## 8. 其他想做清單（使用者提出，未排序）

- **站上拖曳調整排名＋匯出 CSV 給 Notion**（使用者說「晚點再嘗試」，尚未回「照建議」）：管理者專用；6 個排名欄位都已在資料庫（`ranking_engine`、`classic_game_ranking`〔Notion「老遊戲想玩綜合評分」〕、`communication_ranking`〔溝通排名〕、`unique_ranking`〔獨特排名〕、`player_impact_ranking`〔玩家影響性排名〕、`change_ranking`〔變化排名〕），不需改資料庫。建議：下拉選排名、`@dnd-kit` 拖曳（拖一格＝交換、拖多格＝中間順移）、null 放「未排名」、先顯示「將更新 N 款」再儲存、匯出 UTF-8 含 BOM 的 CSV（「屬性」「bggName」＋6 欄）；提醒「網站改過排名後若先匯入舊 Notion CSV 會被覆蓋」；「綜合分數排名」仍由 Notion 算。`parseCsv.ts` 必要欄位目前只含兩個排名欄，其他 4 個若 CSV 沒有會被當 `null` 覆蓋，日後可全部加入必填。開工前要看 `AdminPanel.tsx`、`fetchBoardGames.ts`。
- **「我的桌遊」升級**：想玩可標「近期想玩」「下次聚會想玩」、一鍵移到已玩、可依加入時間／排名／時間排序；遊玩紀錄加對手／朋友、勝負、心得；統計（已做：玩過幾款、總遊玩次數、約略總時數＝次數×BGG 時間／6 取整到 0.1 小時、最常玩 TOP 3；待做：最喜歡的類型、最常玩的人數、每月趨勢）。「我的統計」是「我的俱樂部」抽屜內第二個畫面（`view: 'home' | 'stats'`，有「‹ 返回」），入口放在已玩清單上方。「我的俱樂部」摘要卡含暱稱、徽章（訪客／一般會員／VIP 會員／管理者）、想玩／已玩分頁按鈕、未登入說明＋Google 登入鈕、`ClubPoints`（只有 VIP 且非管理者才呼叫集點資料）；今天有聚會且未評分時顯示「去評分」卡（`todayPending`）。
- **揪團與聚會規劃**：從想玩清單挑候選、日期／人數／地點、報名與候補、顯示參加者共同想玩的遊戲、依人數推薦（「想玩」與「報名」不要混為一談）；**「今天想玩什麼？」推薦**（問人數、時間、難度，用現有資料，不需 AI）；討論與 FAQ（官方 vs 玩家留言要能區分）、行事曆與布告欄；訪客紀錄跨瀏覽器同步（目前只有登入才會）。
- 其他：PWA（`public/manifest.webmanifest`、`icons/icon-192.png`／`icon-512.png`、`index.html` 的 manifest／theme-color／apple-touch-icon，**缺圖示尚未做**）；VIP 朋友名單 UI；推薦牆；清單／9 個一排外觀是否滿意；常玩遊戲排名是否改自動計算；`陣營`與`策略`可同時出現（目前允許）；左右滑動切換分頁；右上角 Email 登入（先不做）；現場報到碼（先不做）；VIP 鎖定 SQL（6 張表加 restrictive 政策 `"vip only"`＋改 `get_rating_summaries()`，退路 `drop policy "vip only" on public.表名;`，資格要含來過聚會的人，執行前先討論）。

## 9. 多台電腦作業

**自動同步**：Supabase 資料與 Storage、GitHub 程式碼。**不會同步**：`.env.local`、`boardgames.csv`、沒 commit／push 的修改。

新電腦：①安裝 Git、Node.js（LTS）、VS Code，設定 `git config --global user.name`／`user.email`；②舊電腦 `git remote get-url origin` 取網址；③`git clone <網址>`，確認在 `master`；④`npm.cmd install`；⑤專案根目錄建 `.env.local`（兩行純文字、不加引號）：`VITE_SUPABASE_URL=https://hgeuockbjrzayfdylavq.supabase.co`、`VITE_SUPABASE_PUBLISHABLE_KEY=（Supabase 後台 Project Settings → API Keys 的 Publishable key）`，**只能用 Publishable key**；⑥`npm.cmd run dev`，確認顯示 106 款、能登入管理者。日常：開始前 `git pull`；結束前逐檔 `git add` → `git commit` → `git push`；不要兩台同時改同一批檔案；未完成的用分支存。
