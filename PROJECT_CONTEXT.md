# 桌遊規則助手（BoardGameResultAI）— 專案參考文件（去重精簡版）

> 給接手 AI。**先讀 `QUICKSTART.md`（現況、待辦、合作規則、文件維護規則），再讀本檔（架構與功能規則），最後讀 `生成後.md`（這兩份之後的修改紀錄，衝突時以它為準）。**
> 最後更新：2026-11-03 晚（已重新產生並併入上一版 `生成後.md` 全部內容；**規則助手 RAG 的最新狀態與設計看第 20 節（最新是 20.13，與 20.11／20.12 衝突時以 20.13 為準），與第 7 節衝突時以第 20 節為準**；其餘請同時讀第 19、18 節；`生成後.md` 已重置）。

## 1. 專案簡介與技術架構

- **目標**：桌遊收藏與規則查詢網站（106 款，使用者在 Notion 整理後匯出 CSV）；最終 VIP 可查規則書（第 7 節）。網站**公開瀏覽，只有管理者能編輯**；朋友圈是主要玩家。
- 前端 React + TypeScript + Vite；後端 **Supabase（免費方案，首爾）**：資料庫、Google 登入、Storage。專案 ID `hgeuockbjrzayfdylavq`，Project URL `https://hgeuockbjrzayfdylavq.supabase.co`（根網址，不加 `/rest/v1/`）。前端只用 **Publishable key**；Secret／service_role key 絕不放前端或貼給任何人。
- 部署：GitHub → Vercel，正式分支 `master`，push 自動建置。環境變數（本機 `.env.local` 不在 Git、Vercel 後台都要有）：`VITE_SUPABASE_URL`、`VITE_SUPABASE_PUBLISHABLE_KEY`。**地雷**：Vercel 對 `VITE_` 變數必須選 **Config**（不是 Secret）；名稱錯一字母網站會悄悄退回本機備用資料；改環境變數要重新部署；Publishable key 含非英數字元會造成規則書區紅字錯誤。
- 指令：`npm.cmd run dev`（`http://localhost:5173/`）、`npm.cmd run build`（成功顯示 `✓ built in ...`；chunk 大於 500 kB 警告可忽略）。dev 中斷時 Console 會出現 `ERR_CONNECTION_REFUSED`、`Setting up fake worker`，PDF 上傳也會失敗，先確認 dev 有在跑。
- 資料更新：Notion → 匯出 CSV → 網站頁尾管理者登入 →「匯入 CSV」→ 預覽 →「確認匯入」（改資料、上傳封面、跑 SQL 不需 push；程式改動才要）。
- **不要上傳到 Git**：`boardgame_source.zip`、`supabase_import.sql`、`make_supabase_import.py`、`boardgames.csv`、`categories_check.txt`、`covers_needed.txt`、`list_categories.py`、`generate_boardgames.backup.py`、`.env.local`、`App.css.bak`、`client_secret_*.json`。曾因 TortoiseGit Amend 造成 master 與 origin/master 分岔（修法：備份後 `git reset --mixed origin/master` 再逐檔 add）。
- **程式結構**：`src/App.css` 只有 `@import`，**順序有影響不要調換**：`tokens`、`base`、`topbar`、`hero`、`library`、`filter`、`cards`、`modal`、`admin`、`mylist`、`footer`、`trash`、`docs`、`backtotop`、`tabs`、`ratings`、`leaderboard`、`loyalty`、`loyalty-card`、`loyalty-admin`、`account`、`sitebar`；`vip.css` 最後載入（近期覆蓋樣式貼在最底下）。**另有由元件自己 `import`、不在 `App.css` 清單裡的樣式**：`overview.css`（`GameModal`，`ov-*`）、`game-tabs.css`（`GameNotesBoard`、`GamePlayHistory`，`gb-*`／`gh-*`）、`played-record.css`（`PlayedGameRecord`）、`club-board.css`（`ClubBoard`，`cb-*`、`club-menu-sub`）、`my-gatherings-write.css`（`MyGatherings`，`mg-write-*`）、`planned.css`（`UpcomingGatherings`、`PlannedGatheringsAdmin`，`pg-*`）、`drawer-top.css`（`DrawerToTop`，`.drawer-totop`、`.cls-sticky`；放在 `src/styles/`）、**`my-notes.css`（`MyNotes`，`mh-*`）、`new-gathering.css`（`NewGatheringWizard`，`ngw-*`）、`lga-list.css`（`LoyaltyAdmin` 近期聚會展開後的玩家條列與想玩標籤，`lgp-*`）**。`src/App.tsx` 只留 `Library` 的狀態與篩選／排序，導覽頁面用單一 `activePage`（`NavPage`，定義在 `TopBar.tsx`）。`src/components/`：`TopBar`、`ViewToggle`、`CategoryChips`、`SortControl`、`FilterDrawer`、`GameCard`、`GameModal`、`MergeDialog`、`PersonalToast`、`TrashSection`、`CoverImage`、`StatusButtons`、`RatingDots`、`RatingSection`、`PlayCounter`（無人使用，保留）、`PlaySessions`、`PersonalNote`、`DescriptionEditor`、`BackToTop`、`Leaderboard`、`CommunityStats`、`LoyaltyCard`、`CheckInDialog`、`InAppBrowserNotice`、`VipJoinDialog`、`VipLock`、`MemberAdmin`、`AdminCenter`、`StatsTables`、`RulebookPage`、`RulebookAssistant`、`RulebookBatchUpload`、`MyGatherings`、`GatheringNotePanel`、`AddPlayLog`、`MyNotes`、`GameGatheringNotes`、`GameNotesBoard`、`GamePlayHistory`、`PlayedGameRecord`、`ClubBoard`、`UpcomingGatherings`、`PlannedGatheringsAdmin`、`NewGatheringWizard`、`NotePrompt`、`DrawerToTop`、`InfoHint`、`Icons`；`src/lib/`：`libraryTypes`、`filterStorage`、`gameFormat`、`fetchBoardGames`、`personalApi`、`useTrashActions`、`usePersonalCollection`、`useGamePlaySessions`、`useGameRatings`、`useGameDocuments`、`docLabels`、`useCommunityStats`、`leaderboards`、`useLoyalty`、`useTodayTask`、`useVip`、`useGamePeople`、`adminEvents`、`saveDescription`、`useIsAdmin`、`useSession`、`useInviteLink`、`useCheckinLink`、`googleLogin`、`uploadCover`、`parseCsv`、`extractPdfText`、`zhEnGlossary`、`useBackClose`、`ratingHints`、`useRulebookSearch`、`useMyGatherings`、`useGatheringNotes`、`useGameNotesBoard`、`useMyGameNotes`（讀 `get_my_gathering_notes`）、`usePlannedGatherings`、`usePlannedUnseen`、`supabase`；另有 `src/AdminPanel.tsx`、`PlayerPanel.tsx`、`MyList.tsx`（畫面叫「俱樂部／我的俱樂部」）、`LoyaltyAdmin.tsx`、`GameDocuments.tsx`（在 `src/` 底下）。實際清單以本機為準。
- `src/data/boardGames.generated.ts`：本機備用資料與 `BoardGame` 型別，**不要手改、不要刪**；`public/covers/` 是舊封面備援。
- 空間用量（2026-10-28）：`rulebooks` 13 份 116.8 MB、`covers` 98 張 6.2 MB、資料庫 14 MB；免費額度未自行查證，以後台 Usage 為準。

## 2. 資料庫、儲存與權限（Supabase）

**通則**：RLS 全開；「Allow new users to sign up」已開啟，所以**所有寫入政策只能是 `auth.uid()` 等於本人，或 `is_admin()`**。管理者以 `admin_users`＋`is_admin()` 判斷，登入不等於管理者。新建資料表一律：`revoke all on 表 from anon, authenticated`（只走函式的表）或至少 `revoke all ... from anon; revoke truncate, references, trigger ... from authenticated;`，並用 `information_schema.role_table_grants` 確認 `anon` 無權限。**刻意不對 `board_games` 加外鍵**（玩家資料以 `bgg_name` 文字對應）。免費方案閒置一週暫停。含 `bgg_name` 的表：`board_games`、`game_documents`（有外鍵 cascade）、`game_play_sessions`、`game_ratings`、`gathering_games`、`gathering_notes`、`game_notes`、`planned_gathering_games`、`user_game_status`（改名補救先用 `information_schema.columns` 查全部）。

| 資料表 | 重點 |
|---|---|
| `board_games`（主鍵 `bgg_name`，`cover_slug` 唯一） | `reference_only boolean not null default false`（僅供參考，第 18 節）、`name, cover_slug, link_*`（保留不用）、`category(text[])`、`bgg_score/difficulty/time`、`min/max_players`、`best_players/recommend_players(int[])`、`ranking_engine, classic_game_ranking, score_rank` 與四個其他排名、七個 `*_degree`、七個 `*_emoji`、`created_at`、`removed_at`、`removed_reason`(≤200)、`description`(≤300)。SELECT 所有人，寫入只有管理者。前端 `id` 只是流水號，不可用來對應圖片或使用者資料。 |
| `game_documents` | 規則書／FAQ，一款可多份；**任何人可讀**，所以規則書文字絕不能放這裡。欄位：`id`、`bgg_name`（外鍵 cascade；刪遊戲不刪 Storage 檔）、`doc_type`（rulebook/faq/errata/intro/video/other）、`language`（zh/en/other）、`title`、`source_type`（external/upload）、`external_url`、`storage_path`、`ai_indexed`、`created_at`、`index_status`、`index_error_code`、`page_count`、`edition`、`file_hash`、`source_note`、`indexed_version`。新增的連結 `doc_type` 只會是 video 或 other；畫面分區看 `source_type` 與是否 video。 |
| `user_game_status` | 主鍵 `(user_id, bgg_name)`：`want_to_play`、`played`、`note`(≤500，「我的整體心得」)、`play_count`（無日期次數 0～999）、`updated_at`、`want_first_at`／`played_first_at`。RLS 只有本人。 |
| `game_play_sessions` | 有日期的遊玩紀錄：`played_on`、`player_count`(1～99)、`note`(≤200)。**總次數＝`play_count`＋紀錄筆數**；新增紀錄不動 `play_count`；單次查詢最多 1000 筆；`addSession` 沒防重複（場次內按鈕在前端自己擋同日同款，補記允許重複但會確認）。 |
| `game_ratings` | 主鍵 `(user_id, bgg_name)`：`overall`(1～10)、`like/player_impact/communication/change/unique/keep_score`(1～5)；整體與 `keep_score` 必填。個別評分只有本人看得到；公開只有 `get_rating_summaries()`（門檻 5 人、`where is_vip()`）。 |
| `player_profiles` | 暱稱（公開）、`hide_in_lists`。 |
| `player_contacts` | **LINE／FB 名字（敏感，欄位 `contact_name`）**，不可顯示在公開畫面，永不給 VIP；SELECT 本人或管理者。 |
| `gatherings` | `id`(uuid)、`gathered_on`、`title`、`note`(≤200)；唯一 `(gathered_on, title)`。 |
| `gathering_attendees` | `(gathering_id, user_id)`、`exempt`、`source`（admin/self）。寫入只有管理者（玩家走 `join_gathering`）。觸發器 `attendee_makes_vip`。 |
| `gathering_games` | 當天指定遊戲。欄位 `gathering_id uuid`、`bgg_name text`、`created_at timestamptz`、`removed_at timestamptz null`（軟移除，見第 18 節）。**`play_status` 欄位已於 2026-11-01 深夜刪除（拿掉確定開團）**，所有聚會日 ≤ 今天（台北）的指定遊戲視為已開團。 |
| `gathering_checkins` | `gathering_id` pk、`token`、`is_open`、`capacity`（1～500 NOT NULL）。只有管理者。 |
| `gathering_notes` | `id, user_id → auth.users cascade, gathering_id → gatherings cascade, bgg_name, private_note, public_note（各 ≤200）, like_point／dislike_point（各 ≤100，第 19 節）, public_status ('visible'\|'hidden'), hidden_by（set null）, hidden_at, created_at, updated_at`；唯一 `(user_id, gathering_id, bgg_name)`。RLS 開，anon／authenticated 全 revoke，**只走函式**（直接權限檢查結果使用者尚未回報）。 |
| `game_notes`（2026-10-30） | 遊戲公開留言：`id, user_id → auth.users cascade, bgg_name, public_note（1～200）, public_status ('visible'\|'hidden'), hidden_by, hidden_at, created_at, updated_at`；**唯一限制 `game_notes_user_id_bgg_name_key` 已刪除，一人一款可多則（上限 10，由 `add_game_note` 檢查）**。RLS 開、anon／authenticated 全 revoke，**只走函式**（已確認）。備份表 `game_notes_backup_20261030`（RLS 開、無權限）。 |
| **`planned_gatherings`**（2026-10-30） | 近期聚會：`id uuid pk`、`planned_on date`、`start_time time`（可空）、`title`（1～40 字）、`note`（≤200）、`status`（`open`／`cancelled`／`converted`）、`gathering_id`（→ `gatherings`，on delete set null）、`created_at`、`updated_at`；索引 `(planned_on, start_time)`；**同一天可多筆（無唯一限制）**。RLS 開、anon／authenticated 全 revoke，只走函式（已確認）。 |
| **`planned_gathering_games`** | `(planned_id, bgg_name)` pk，`planned_id` → `planned_gatherings` cascade，`sort_order`。 |
| **`planned_gathering_votes`** | `(planned_id, user_id)` pk，`planned_id` cascade、`user_id` → `auth.users` cascade；有這一列＝「我可以去」。 |
| `loyalty_redemptions` | 免費券使用紀錄：`user_id`、`redeemed_at`、`redeemed_by`（補登有值、自動 null）、`used_on`（`(user_id, used_on)` 唯一）。 |
| `loyalty_grants` | 管理者贈送：`id`、`user_id`、`quantity`（1～5）、`granted_at`。**RLS、`revoke`、如何計入 `loyalty_totals`／`settle_vouchers` 尚未查證。** |
| `vip_members` | `granted_by`＝password／checkin／admin；只有管理者可讀寫。`vip_settings`、`vip_attempts` 前端讀不到。 |
| `rulebook_chunks` | `document_id`（cascade）、`index_version`、`chunk_index`、`page_number`、`section_title`（空）、`content`。不存 `bgg_name`。RLS 開、無直接權限。 |
| `rulebook_search_log` | 只存 `user_id`、`bgg_name`、`created_at`，不存問題內容；保留 7 天。 |

**函式**（security definer 一律 `set search_path = ''`，`revoke ... from public, anon`，需要的才 grant；改既有函式前請使用者匯出實際定義）：
- 身分：`is_admin()`、`is_vip()`（管理者是否也讓 `is_vip()` 回 true 未驗證，所以新函式用 `is_admin() or is_vip()`）。
- 評分／統計：`get_rating_summaries()`、`get_community_stats()`（想玩／已玩人數與期間新增；**只統計 VIP 與管理者的紀錄**）、`admin_get_all_ratings`、`get_game_people`（名單，同樣只列 VIP／管理者；呼叫者必須是 VIP）。**兩個函式的 `where` 都有 `s.user_id in (select user_id from public.vip_members union select user_id from public.admin_users)`；改這兩個函式前要先匯出現有定義。**
- 集點：`loyalty_day_status`、`loyalty_point_days`、`loyalty_totals`（`total_points, month_points, earned_vouchers, usable_vouchers`）、`settle_vouchers(uuid)`、觸發器 `settle_vouchers_on_rating`／`settle_vouchers_on_attendee`、`get_my_loyalty_summary`、`get_my_loyalty_days`、`admin_get_loyalty_overview`、`admin_get_loyalty_days`、`admin_redeem_voucher`、`admin_grant_voucher(p_user, p_qty)`。
- 報到／VIP：`join_gathering(p_token)`、`redeem_vip_code`、`admin_set_vip_code`、`admin_set_vip`、`admin_list_members`、`get_vip_friends`（UI 未做）、`admin_vip_lock_info`、`admin_clear_vip_lock`、`get_hide_in_lists`／`set_hide_in_lists`、`admin_delete_member`（最後 `delete from auth.users`，所以 `gathering_notes`、`game_notes`、`planned_gathering_votes` 連動刪除）。
- **場次**（已確認 anon 無權限）：`get_my_gatherings()` → `id, gathered_on, title, note, attendee_count`（一般人只回自己出席的場次，管理者全部；未登入丟 `not logged in`）；`get_gathering_detail(p_gathering)` → jsonb `{attendees, games}`（非出席者且非管理者回 null；attendees 每筆 `n, me`；`hide_in_lists` 者對他人顯示「匿名玩家」，自己與管理者看真名；管理者另有 `c`（LINE／FB）、`h`、`s`、`e`，其他人 null；依報到時間排序；games 每筆 `b`、`n`）。
- **場次心得**：`save_gathering_note(p_gathering, p_bgg_name, p_private, p_public)` → 'saved'／'deleted'（兩欄都空＝刪除，不檢查出席；否則檢查已登入、聚會日 ≤ 今天（台北時間）、在出席名單（管理者也必須在名單上）、該款在 `gathering_games`；錯誤 `gathering not started`／`not attendee`／`game not in gathering`／`too long`／`not logged in`；公開欄清空時狀態回 visible，否則被隱藏的不因修改自動恢復）；`get_my_gathering_notes(p_gathering default null)`（只回自己的含私人欄）；`get_gathering_note_status()`（我出席過、聚會日已到且最近 30 天，回 `gathering_id, game_count, done_count`）。
- **遊戲留言（討論）**：`add_game_note(p_bgg_name, p_content)`（回傳新 id；VIP；管理者不受「要已玩或評分過」限制，其他人要；超過 10 則丟 `too many`；advisory lock 防併發）、`update_my_game_note(p_note, p_content)`（只能改自己的，被隱藏的改完仍隱藏）、`get_my_game_notes(p_bgg_name)`（回自己的某款所有留言含被隱藏的，`id, content, status`）、**`get_my_all_game_notes()`（2026-10-31 晚新增；回自己所有款的遊戲留言含被隱藏的：`id, bgg_name, content, status, created_at`，依 `created_at` 新到舊；未登入丟 `not logged in`；`plpgsql stable security definer`、`search_path = ''`；已確認權限只有 `authenticated`、`postgres`、`service_role`；給「我的心得」頁用）**、`get_public_gathering_notes(p_bgg_name default null, p_limit default 100)`（只有 VIP／管理者；只回公開且 visible；欄位 `id, bgg_name, game_name, nickname, content, is_mine, posted_on`〔台北時間日期〕，依 `created_at` 新到舊；limit 夾 1～200；**`gathering_notes` 公開欄與 `game_notes` 用 `union all` 合併，兩者都以 `public_note <> ''` 且 `public_status = 'visible'` 判斷，不標示來源**，不回聚會／時間／私人欄）、`delete_my_public_note(p_note uuid)` → 'deleted'（只刪自己的：`gathering_notes` 該列私人欄也空就整列刪、否則只把 `public_note` 清成 ''＋狀態回 visible；找不到再刪 `game_notes` 同列；錯誤 `note not found`／`not logged in`）、`admin_hide_gathering_note(p_note, p_hide)`（先更 `gathering_notes`，找不到再更 `game_notes`）、`admin_get_hidden_gathering_notes(p_bgg_name)`（兩來源合併、只回公開欄）。**舊的 `save_game_note`、`get_my_game_note` 已刪除（2026-10-30）；注意 `get_my_game_notes`（有 s）是新函式，不要誤刪。**
- **開團紀錄（已簡化，2026-11-01 深夜）**：`admin_set_game_play_status` 與 `admin_get_gathering_game_status` 已刪除；`get_game_play_history(p_bgg_name)` 重寫為：所有指定這款的聚會，聚會日 ≤ 今天（台北）＝`played`，之後＝`planned`，完全不看 `play_status`（VIP／管理者；只回 `gathered_on`、`status`；**不回成員**）。
- **近期聚會（2026-10-30，7 個函式，已確認 anon 無權限）**：`get_upcoming_gatherings()`（VIP／管理者；回傳 `planned_on >=` 今天（台北時間）的預計聚會，含 `status`、`games text[]`、`going_count`、`i_am_going`；**`going_count` 只有管理者拿得到，其他人回 null**；排序日期、開始時間〔空的排後〕、建立時間）、`set_my_availability(p_planned, p_going)`（VIP／管理者；只有 `open` 且日期未過的可改；錯誤 `not found`／`not open`／`expired`／`not vip`／`not logged in`）、`admin_save_planned_gathering(p_id, p_planned_on, p_start_time, p_title, p_note, p_games text[])`（p_id null＝新增；遊戲清單整份替換，不在 `board_games` 的名稱略過）、`admin_set_planned_status(p_planned, p_status, p_gathering default null)`（converted 時保留 `gathering_id`，其他狀態清空）、`admin_delete_planned_gathering(p_planned)`、`admin_get_planned_gatherings()`（管理者；日期從今天往前 30 天起）、`admin_get_planned_voters(p_planned)`（管理者；回暱稱與 LINE／FB 名字）。**「VIP 不顯示人數」版本的 `get_upcoming_gatherings` 已由使用者確認執行（2026-10-30）。**
- **想玩提示（2026-10-30 晚）**：`admin_get_want_to_play()` → `user_id uuid, games text[]`（`plpgsql stable security definer`、`search_path = ''`；非管理者丟 `not admin`；每位 VIP／管理者一列，沒標想玩者 `games` 為空陣列；只統計 VIP 與管理者，與 `get_community_stats` 同一套名單；`revoke all ... from public, anon`、`grant execute ... to authenticated`，已查證只有 `authenticated EXECUTE`）。前端用 Map（user_id → 遊戲集合）自己算人數；使用者已實測 C1 沒問題。**2026-10-31 新增 `admin_get_want_to_play_people()` → `bgg_name text, user_id uuid, nickname text, contact_name text`**（`plpgsql stable security definer`、`search_path = ''`；非管理者丟 `not admin`、未登入丟 `not logged in`；只回 VIP＋管理者標了想玩的列；`left join player_profiles`、`player_contacts`；`revoke ... from public, anon`、`grant execute ... to authenticated`；使用者貼回權限為 `postgres`、`authenticated`、`service_role`，無 `anon`）。**前端尚未接**（預計聚會遊戲旁「社群有 N 人想玩 ▾」點開列名單，QUICKSTART 第 4 節第 2 項）；欄位型別是否相符要到執行時才驗得出。對照的既有函式 `admin_get_planned_voters(p_planned)` 回 `user_id, nickname, contact_name`，同樣 `coalesce(nickname,'')`，所以**沒有暱稱的人（可能含管理者）名單顯示空白**。
- `admin_rulebook_storage_usage()`（admin 專用，回 `{buckets, files}`，給規則書分頁容量條，`STORAGE_LIMIT_BYTES = 1 GiB`）。
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

- **導覽與主畫面**：導覽列桌遊收藏、排行榜、集點卡、**俱樂部**（`NavPage` 仍是 `'mylist'`；管理者第三顆是「⚙ 管理」），VIP／管理者另有「✦ 規則助手」；桌面在頂端、手機在底部（`sitebar`）；一次只開一頁；**「俱樂部」圖示的徽章＝未看過的新預計聚會數（`lib/usePlannedUnseen.ts`），沒有就不顯示（原本是使用者自己標過的想玩／已玩款數 `myListCount`，已不用在徽章）**。主畫面：類型膠囊（`CategoryChips`，「更多類型」視窗 `.cat-backdrop`）、搜尋欄內有「篩選」鈕（開 `FilterDrawer`：人數區間、最佳／推薦人數、時間、難度五級、只看新遊戲 30 天、評分狀態、我的紀錄三顆眼睛＋分區顯示；最上面「檢視方式」`ViewToggle`：`list`／`grid-4`／`grid-9`，鍵 `boardgame-view-mode`）、排序在標題列、「顯示 N / 106 款」只在有搜尋／篩選／選類型時出現在排序後面、圖例只留愛心／勾勾。**新增篩選條件要同步** `activeFilterCount`、`clearFilters`、`filteredGames` 依賴、`missingDataCount`、`filterStorage.ts` 的 `SavedFilters`／`DEFAULT_FILTERS`／`loadFilters`／`saveFilters` 與 `App.tsx` 的寫入 `useEffect`。**新遊戲置頂**：`isPinnedGame`＋`PIN_DAYS = 15`，`createdAt` 15 天內且 `rankingEngine` 空白或非整數才置頂，任何排序都生效；分區顯示時只在各分區內置頂；NEW 標示 30 天，**只對「沒看過」的人顯示**（`SEEN_NEW_KEY='boardgame-seen-new'`，停留 10 秒後記下，下次開啟才生效，只存該瀏覽器）。**篩選記憶**：`lib/filterStorage.ts`，鍵 `boardgame-filters`（`{version:1, filters}`）；搜尋文字不存。
- **詳細視窗（`GameModal.tsx`）＝四分頁「概覽｜評分｜討論｜紀錄」**（`TABS`：`overview`、`ratings`、`discussion`、`history`）；固定大小；層級 `.modal-backdrop` **1220**；標題固定色 `#34463c`（iPhone 深色模式）。`initialTab` 接受 `'rules'`（開概覽並展開規則區，規則助手快捷用）與舊的 `'mine'`（也開概覽）；`App.tsx` 的 `selectedTab` 型別含 `'discussion' | 'history'`。`GameModal` props：`allGames?`（`App.tsx` 傳 `boardGames`，不含垃圾桶）、`onSwitchGame?`；`playSessions`、`onOpenGathering` 仍留在型別但不再使用。右上角（× 前）`ov-counts`「想玩 N・已玩 N」（`communityStats.getStats(bggName)`，只統計 VIP＋管理者）。
  - **概覽**：簡介（`DescriptionEditor`）、屬性點點、**類型標籤（可點，含策略／派對，後面是同類型其他遊戲數；沒有同類型者停用）→ 展開同類型小封面牆**（`ov-wall`：4 欄〔≤380px 3 欄〕、最多 12 款、「看更多」；點封面呼叫 `onSwitchGame` 在同一視窗切換並回概覽頂端、收起類型與規則；小封面用 `CoverImage`，`version={0}`、`className="ov-cover-img"`，className 套在哪一層未驗證）、可收合「規則連結與影片」（`<details className="ov-fold">`，內含 `GameDocuments`；管理者 PDF 區在裡面）、管理者封面上傳與移垃圾桶。**沒有**留言區、大家評分摘要、期間新增。
  - **評分**：`RatingSection`（整體 1～10＋適合留下來 1～5 必填，其餘五項選填）、`CommunitySummary`（未滿 5 人顯示「評分累積中」）。管理者評分頁：沒玩過（`adminScores` 為 null）七項一律顯示「未玩過」。**評分說明小符號**：`lib/ratingHints.ts`＋`components/InfoHint.tsx`（14px、淺焦糖底、`::after` 放大點擊範圍；電腦滑鼠移上去、手機點一下），用在評分頁、大家的評分小方塊、概覽屬性；文字是使用者的定義：影響度＝你的決定與行動有多少會被別人影響、甚至要思考別人的下一步；溝通度＝聊天、談判、嘴砲程度；適合留下來＝值得留在架上的程度。**快速性、複雜度的說明方向（點數越多＝越快／越複雜）是 AI 推測、使用者未確認。**
  - **討論**（`GameNotesBoard.tsx`＋`lib/useGameNotesBoard.ts`，`gb-*`，`MAX_NOTES_PER_GAME = 10`）：`enabled={vip.isVip || isAdmin}`；發表框＋「已留 N / 10 則」；留言含日期（`postedOn`）；自己的留言「編輯／刪除」（`add_game_note`／`update_my_game_note`／`delete_my_public_note`），管理者對別人是「隱藏」並可從「已隱藏的留言」恢復；自己被隱藏的留言另外列出並警告、可刪除。資料：`get_public_gathering_notes(bggName, 100)`＋`get_my_game_notes`＋管理者的 `admin_get_hidden_gathering_notes`。非 VIP 看到「只有 VIP…」。
  - **紀錄**（`GamePlayHistory.tsx`）：`get_game_play_history`，日期＋「已開團／預計」，不顯示成員；非 VIP 看到提示。
- **垃圾桶**：所有人看得到，只有管理者能移入／還原／永久刪除。
- **想玩／已玩**（`usePersonalCollection.ts`）：訪客存 `localStorage`，登入後以雲端為準；首次登入合併視窗；計數器 0～999；按「＋」記次數時若未已玩會一併標已玩（`skipPlayedRule: true`）；評分、記錄遊玩也自動標已玩；取消不會取消已玩。
- **俱樂部（`MyList.tsx`，內部 `view`：`home | stats | gatherings | addplay | notes | board | upcoming`）**：
  - 首頁：摘要卡（暱稱、徽章、`ClubPointsLine` 小字「累計 N 點・免費券 N 張」〔只有 VIP 非管理者〕、未登入說明）、「去評分」卡（`todayPending`）、入口列：▤ 我的統計（小說明＋右側「想玩 N・已玩 N」）、**🎲 近期聚會（`isVip || isAdmin`；右邊紅色小標「N 場新的」＝`usePlannedUnseen`，進入近期聚會就把列出的全部標為已讀，已讀記在 `localStorage` 鍵 `boardgame-seen-planned:<帳號id>`〔內容是預計聚會 id〕；已取消／已轉正式／已過期不算；切回網站分頁重讀；樣式 inline，沒動 CSS）**、💬 留言板（登入者）、**📝 我的心得（登入者）**、📅 我的場次（登入者）。每次打開都回首頁。**`MyList` 有選填 prop `trashedGames`（`App.tsx` 傳入，預設 `[]`），`lookupGames = [...boardGames, ...trashedGames]` 傳給 `MyNotes`、`MyGatherings`、`AddPlayLog` 查封面與名稱；想玩／已玩清單、統計、留言板、近期聚會仍用 `boardGames`（不含垃圾桶）。垃圾桶遊戲現在能在聚會詳情點開遊戲視窗，`GameModal` 對垃圾桶遊戲是否正常未驗證。**`useBackClose(() => setView(current => current === 'addplay' ? 'notes' : 'home'), isOpen && mode !== 'loyalty' && view !== 'home')`（`d2b2e26` 起：新增遊玩紀錄從「我的心得」進，返回先回「我的心得」，其他子畫面回首頁）：✕ 與手機返回回上一層、分頁切換不建歷史。集點卡畫面（`mode === 'loyalty'`）標題「集點卡」。
  - **我的統計**：分頁概況｜想玩｜已玩（每次進來預設概況）；**搜尋排序列固定在上方（`cls-sticky`）、往下捲出現右下角綠色 ↑（`DrawerToTop`，回到最上面）、切換分頁自動回頂端；想玩／已玩各自記住排序（`localStorage` 鍵 `boardgame-stats-view`，`{sortWant, sortPlayed}`，只存該瀏覽器），分頁與搜尋每次重設（2026-10-30，待實測）；**概況：玩過 N 款、總遊玩次數、總時數（點方塊才展開估算說明＝次數 × BGG 時間／6 取整到 0.1 小時）、最常玩 TOP 3／5／10（`boardgame-stats-top-n`）；想玩／已玩：搜尋欄內含排序（`SORT_FIELDS`：加入時間／名稱／遊玩次數／最近遊玩；每項兩個方向，`SortKey` 以 `-rev` 結尾為反向；沒資料的永遠排最後；下拉 16px 避免 iPhone 放大）、已玩每列 − ＋ 改 `play_count`、**「紀錄與心得 ›」按鈕開 `PlayedGameRecord` 小視窗（2026-10-31 起想玩分頁也有；視窗裡新增遊玩紀錄後這款是否自動標已玩，待實測）**（`createPortal`、`useBackClose`、z-index 1240；內含 `PlaySessions`、`PersonalNote`、`GameGatheringNotes`〔各場次私人心得，可收合、唯讀、每筆「查看聚會 ›」跳到聚會詳情〕）、移除。
  - **留言板（`ClubBoard.tsx`，`cb-*`）**：見 QUICKSTART 第 2 節；只留大家的留言牆（最新 200 則）、搜尋、「＋ 發表留言」、刪除自己的留言（`d2b2e26` 拿掉「新增遊玩紀錄」「我的心得」兩顆按鈕，props `onOpenAddPlay`、`onOpenMyNotes` 已移除）。
  - **我的心得（`MyNotes.tsx`，`mh-*`，`my-notes.css`；`d2b2e26`）**：個人心得管理頁。props `boardGames`（`lookupGames`，含垃圾桶）、`renderCover`、`onBack`、`onClose`、`onOpenGathering`、`onOpenAddPlay`。三個資料來源：`get_my_all_game_notes()`（遊戲公開留言，`kind='game'`）、`get_my_gathering_notes()`（`useAllMyNotes`，一則場次心得拆成 `gprivate`／`gpublic` 兩張卡）、`useMyGatherings`（場次日期與標題）。篩選「全部／公開留言（game＋gpublic）／私人心得（gprivate）／來自聚會（gprivate＋gpublic）」；排序日期新到舊（遊戲留言用 `created_at` 轉台北日期，場次心得用聚會日，沒日期排最後）；每張卡有封面、《遊戲名》、日期、徽章（公開留言／私人心得）、內文、來源（「發布於：遊戲詳細資料 → 討論」「發布於：遊戲討論（寫於聚會「…」）」「關聯場次：…」）、被隱藏者紅字提示。遊戲留言可就地編輯（`update_my_game_note`，≤200 字）與刪除（`delete_my_public_note`）；場次心得「到這場聚會編輯 ›」，刪除只清該欄（`saveGatheringNote` 另一欄原樣傳回；`gathering_notes` 的 id 不在 `get_my_gathering_notes` 回傳裡，所以不用 `delete_my_public_note`）。任何一個來源讀取失敗顯示「有部分心得讀取失敗」與「重新讀取」。**不放進這頁**：遊玩紀錄備註、`user_game_status.note`（我的整體心得）。
  - **`AddPlayLog`**（從「我的心得」右上「＋ 新增遊玩紀錄」進）：名稱搜尋最多 8 款（忽略大小寫與標點，開頭相符優先）、**垃圾桶遊戲也可選（標「已移除」）**、日期不可未來、人數 1～99 或空、心得 ≤200、同款同日要確認；儲存後標已玩（`skipPlayedRule`）。**`canShare`（VIP／管理者）才有「同時發表到這款遊戲的討論」勾選（心得要有字才能勾）**：遊玩紀錄存好後再呼叫 `add_game_note`，失敗（非 `too many`）稍等 800 ms 重試一次，失敗或已留滿 10 則只顯示說明、不影響遊玩紀錄。任何登入者都能記遊玩，遊玩紀錄只有本人看得到，一般會員的紀錄不計入全站想玩／已玩人數。
  - **（舊）**`MyNotes` 在 `d2b2e26` 以前只讀 `get_my_gathering_notes()`、每列可展開、可分別刪除私人／公開；已被上面的新版取代（舊 `mn-*` 樣式在 `vip.css`，現在大概沒人用，未清）。
  - **我的場次／聚會詳情（`MyGatherings.tsx`＋`GatheringNotePanel.tsx`）**：清單依月份分組（預設展開最新月與本月），小字灰色「已記錄心得 N/M」；聚會日已到的每場下方有「補寫心得 ›」（`mg-write-btn`，進詳情並捲到心得區；未來的聚會不顯示）。詳情是單一畫面：標題＋日期人數、出席者可展開（管理者另見聯絡方式與來源標籤；`hide_in_lists` 者對他人顯示「匿名玩家」）、當天指定遊戲封面卡片橫向切換、私人／公開分頁、底部固定「儲存心得」、「我這場有玩這款」勾選（勾選後我的已玩次數 +1；同日同款已有 `game_play_sessions` 就沿用）、刪除。只有「我在出席名單上」且聚會日已到才能記錄心得；管理者不在名單時提示引導到留言板。有未存變更時 ✕／返回鍵跳「儲存後離開／捨棄變更／繼續編輯」。複製規則：私人頁「複製到公開」、公開頁「複製到私人」，複製前一律詢問。`MyList.tsx` 傳 `renderCover` 給 `MyGatherings`。**垃圾桶遊戲在聚會詳情沒有封面：已修（`af8c15e`，原因是 `App.tsx` 傳給 `MyList` 的 `boardGames` 排除垃圾桶，`gameByName` 查不到；改用 `lookupGames`），待實測。** 樣式 `gn2-*`、`gn3-*`、`mg-*`。
  - **近期聚會（`UpcomingGatherings.tsx`，`pg-*`；`lib/usePlannedGatherings.ts`）**：VIP／管理者；列表每筆：日期＋時間（`formatPlannedWhen`，例「11/7（六） 19:00」）、標題、狀態徽章（已取消／已轉為正式聚會）、備註、預計遊戲（小封面＋名稱，點了 `onOpenGame`；找不到的遊戲只顯示 `bgg_name`）、人數（只有 `goingCount` 非 null 才顯示，也就是管理者；VIP 登記後顯示「你已登記」）、按鈕「我可以去」／「取消意願」（`aria-pressed`，成功後先本地更新再背景重讀）；非 open 顯示「此聚會已取消／已轉為正式聚會」。頂端說明「『我可以去』只是表示有意願，不等於正式報名；實際報到以聚會當天的連結為準。」`useUpcomingGatherings(enabled)` 回傳 `rows, loading, error, reload, setGoing`；錯誤文字 `plannedErrorText`。header ✕ 呼叫 `onBack`（回俱樂部首頁）。
- **管理中心**（`AdminCenter.tsx`，`activePage === 'admin'`）：4 顆分頁「成員」「集點聚會」「規則書」「資料匯入」；成員有搜尋＋循環篩選鈕（`cls-searchbox`＋`search-filter-btn`）。「集點聚會」（`LoyaltyAdmin.tsx`，`lga-`）三個小分頁「聚會設定／集點狀況／免費券紀錄」；**「聚會設定」由上而下：可收合 `<details className="pg-fold">`「預計聚會（N 場）」（`PlannedGatheringsAdmin.tsx`：表單〔日期、時間、標題、備註、遊戲搜尋加入〕、列表〔編輯、意願名單、取消聚會／恢復開放、標示已轉正式〔可選正式聚會，同日排前面〕、刪除〕，載入 `admin_get_planned_gatherings`，props `allGames`、`gatherings`）、①新增聚會（**一顆按鈕開全螢幕 `NewGatheringWizard`**，見下）、②近期聚會（依月份分組；每場詳情：①指定遊戲〔每款底下列想玩者名字，已選參加者標綠，超過 5 人收合；**開團狀態併在同一列**：日期已到或已標過就顯示「⚠ 待確認／✅ 實際開團／✖ 已取消」與「實際開團／取消／改回未確認」，呼叫 `admin_set_game_play_status`〕、②人數上限、③手動加入參加者〔**單行條列**：勾選圈＋頭像＋暱稱＋LINE／FB 小字＋「想玩 N 款 ▾」，在該列下方展開，本場指定排前面；「免評分」在已勾選列底下〕、④聚會連結）**。**新增聚會全螢幕流程（`NewGatheringWizard.tsx`，`ngw-*`，z-index 1260，`useBackClose`，`d7e7fb9`）**：props `allGames`、`players`、`contacts`、`wantMap`（user_id → 想玩集合，來自 `admin_get_want_to_play`）、`onClose`、`onCreated(id)`；由上而下 1 基本資料（日期、場次、備註）、2 指定遊戲（搜尋加入；每款列想玩者）、3 參加者（可跳過；搜尋暱稱／LINE／FB；單行條列；免評分）、4 聚會連結與人數上限；底部「取消／建立聚會」。**人數上限只存在 `gathering_checkins`（NOT NULL），所以連結與上限綁在一起**：勾「建立聚會連結」才填上限，需至少一款遊戲、聚會日 ≥ 今天、手動加入人數 < 上限；補登過去的聚會連結選項為灰。建立順序 `gatherings` → `gathering_games`（一次 insert 多筆）→ `gathering_attendees`（一次 insert 多筆，含 `exempt`）→ `gathering_checkins`；`23505` 顯示「相同場次名稱」說明；中途失敗聚會保留、列出失敗項目、不建連結、按鈕「前往這場聚會」；有參加者時先 `confirm`（他們會自動成為 VIP 並計入集點，觸發器 `attendee_makes_vip`）。成功後父層 `loadAll()` 再 `setSelectedId(id)` 展開那一場。`LoyaltyAdmin.tsx` 已移除舊的新增表單、`addGathering`、`sortGatherings`、`newDate／newTitle／newNote` 狀態。集點狀況有「補登」「贈送」（1～5 張，`window.prompt`，`admin_grant_voucher`）＋免費券紀錄分頁「🎁 管理者贈送紀錄」。**想玩提示（2026-10-30 晚；2026-10-31 第一批改為條列版面）**：管理者專用，資料來自 `admin_get_want_to_play()`（載入失敗整個不顯示）。`LoyaltyAdmin.tsx` 正式聚會：玩家條列旁「想玩 N 款 ▾」（點開在**該列正下方**列出；只統計 VIP／管理者，非 VIP 不顯示；沒有暱稱的人顯示「另有 N 人（未設暱稱）」）、①指定遊戲搜尋結果與已指定清單旁的小字——已選至少一位參加者時「已選玩家中有 N 人想玩」且人數多的排前面，沒選人時「社群有 N 人想玩」（不排序）；`PlannedGatheringsAdmin.tsx` 預計聚會只顯示「社群有 N 人想玩」。**只是參考，不自動勾選、不排行，兩種文字刻意分開。** 規則書分頁見第 7 節。
- **公開評分**：整體 1～10＋適合留下來 1～5 必填，其餘五項選填；未滿 5 人顯示「評分累積中」；用語：喜歡度、影響度、溝通度、變化度、獨特性；完整評分＝七項皆非空。
- **管理者評分換算**（`computeAdminScores`，前端與資料庫要一致）：整體依 `ranking_engine`：≤25→10、≤50→9、≤65→8、≤80→7、其餘→6；適合留下來依 `score_rank`，只在玩過的遊戲間排名：名次 ≤30→5、≤60→4、≤90→3、其餘→2；`ranking_engine` 以 .5 結尾＝沒玩過，七項都不計；五個「度」取 `*_emoji` 字元數（去掉 U+FE0F 與空白，上限 5）。管理者 CSV 分數算一位評分者進社群評分。
- **社群統計**：想玩／已玩人數與月／季／年「期間新增」，只回傳彙總；不加「讚」；**只統計 VIP 與管理者的紀錄**（成為 VIP 後之前標過的自動算進、取消 VIP 即消失）。畫面文字「只統計 VIP 玩家」。使用者尚未用非 VIP 帳號實測。
- **排行榜**：想玩、已玩（全部／本月／本季／本年，只算 VIP）、整體評分、適合留下來（滿 5 人）；前 10 名；可展開名單；「📊 統計表」；`onOpenGame` 只開詳細視窗、**不關排行榜**；說明文字是 `lb-hintrow` 內一顆 `InfoHint`。導覽按鈕對所有人顯示；想玩／已玩榜任何人看得到（只有彙總人數）；整體評分／留下來榜資料來自 `get_rating_summaries()`（限 VIP，非 VIP 可能只看到「評分累積中」，未實測）；名單與統計表只有 VIP／管理者（`canSeePeople={vip.isVip}`）。
- **寫心得提示條（`NotePrompt.tsx`，`np-*`，z-index 1230，15 秒自動收起，掛在 `App.tsx` 的 `<BackToTop />` 上方）**：監聽 `ratings`，某款七項評分剛變完整（第一次讀到只當基準）、我最近 30 天出席過、聚會日已到、是當天指定遊戲、且 `get_my_gathering_notes(p_gathering)` 沒有該款心得 → 「現在寫」＝關遊戲視窗並跳到俱樂部那場聚會詳情（`openGatheringFromGame`：關視窗、`inviteKey`＋1 重掛 `MyList`、`jumpGatheringId`→`MyList.openGatheringId`→初始 `view='gatherings'`→`MyGatherings.initialGatheringId`；`goPage`／`goHome` 會清掉 `jumpGatheringId`）。依賴 `useMyLoyalty().gatherings` 每筆有 `id`、`date`、`games`（推測成立）。
- **`lib/useVip.ts`**：模組層級 `cache`（`userId`＋`isVip`），新元件掛載用快取當初值；`refresh()` 在 `userId` 為 null 時先問 `supabase.auth.getSession()`，本機有登入資料就不下結論（解決切換分頁 VIP 區塊閃爍）。
- **`privacy.html`**（`public/privacy.html`，最後更新 2026-10-30）：新增功能要同步更新。已涵蓋遊玩紀錄、評分、社群統計、排行榜、集點卡、聯絡方式、VIP、報到、帳號刪除、免費券、規則助手搜尋紀錄、翻譯／複製、場次心得（私人＝本人；公開＝VIP＋管理者且不顯示場次與時間；可撤回；被隱藏的留言只有本人與管理者看得到）、遊戲留言、**近期聚會意願登記（只有本人與管理者看得到，其他 VIP 看不到人數與名單；取消保留標示、刪除一併刪除登記；刪帳號一併刪除）**；想玩／已玩只計入 VIP；**2026-10-30 晚補：管理者在安排聚會時會參考玩家的想玩清單**。
- 左上角名稱「桌遊規則助手」；`index.html` `<html lang="zh-Hant">`；Google App「翻譯此網站」對英文片段不一定有效，用片段下方的「翻譯成繁體中文」按鈕。

## 5. 帳號、VIP、聚會、集點、免費券

> **注意：下文「出席不自動算玩過」已更新為「出席不自動算玩過，但七項評分從不完整變完整時，會自動建當天遊玩紀錄」，詳見第 11 節。**

- **層級**：訪客 → 一般登入 → VIP（評分、集點卡、報到、名單、統計表、規則助手、留言、近期聚會）→ 管理者（也算 VIP，不顯示集點卡）。
- **登入**：只用 Google OAuth（專案 `board-game-site`，已發布正式版、只用基本範圍；**不要新增敏感範圍**；接近 80 人時回「目標對象」頁確認）。不採匿名帳號、不做 Email 登入。管理者 Gmail 同時 Google 登入會對到管理者帳號，測玩家要用另一個 Google 帳號。
- **LINE／FB 內建瀏覽器不能 Google 登入**：所有入口走 `googleLogin.ts` 的 `signInWithGoogle()`，偵測後顯示 `InAppBrowserNotice`；聚會連結結尾加 `&openExternalBrowser=1`。
- **玩家選單**：暱稱 ▾ →「修改暱稱與聯絡方式／登出」；暱稱與 LINE／FB 名字必填，可「稍後再說」。**管理者也能設暱稱（`59c0526`，待實測）**：`PlayerPanel.tsx` 不再對管理者略過載入與 `return null`；管理者不會被強制跳出設定視窗（`!isAdmin &&` 才自動開）；頂端暱稱按鈕沒設定時顯示「設定暱稱 ▾」；`TopBar.tsx` 的管理者「登出」鈕保留（所以管理者暱稱選單與頂端各有登出）。管理者設好暱稱後，留言板、意願名單、想玩名單、出席名單才不會空白或「（未命名）」（預期，未驗證）；管理者也會出現在聚會設定的玩家清單，可被加入出席名單（行為與一般玩家相同）。
- **VIP 取得**：①被列入出席名單 → 觸發器 `attendee_makes_vip`；②通關密碼（`redeem_vip_code`，每帳號 15 分鐘錯 3 次鎖、全站錯 10 次全鎖）。密碼不可放前端。
- **聚會連結**：`https://網址/?join=隨機碼&openExternalBrowser=1`，**只在聚會當天（台北時間）有效**。檢查：已登入、token 有效、開放中、有暱稱與聯絡方式、未額滿。管理者必須先指定至少一款遊戲＋人數上限才能建立連結；可開關、重設。`?card=日期` 仍支援（只開集點卡）。連結可用總名額＝上限－手動加入（`linkQuota`／`linkBlocked`）。
- **報到流程**：點連結 → Google 登入 → 填暱稱與聯絡方式 → **自動報到**（`CheckInDialog` 開啟即呼叫 `join_gathering`）→ 評分（至少一款當天指定遊戲七項評完）→ 集點卡。手動加入的玩家：「集點卡」紅點（`useTodayTask`）。**沒有「我玩了」勾選；出席不自動算玩過。**
- **風險**：連結傳進群組後當天收到的人都能變 VIP；擋板只有人數上限與當天有效。
- **集點規則**（`loyalty_day_status`）：出席且當天指定遊戲任一款七項評分完整得 1 點；`exempt` 直接得點；沒指定遊戲的舊聚會日沿用舊規則；一天只算 1 點。不讀 `board_games`。
- **免費券 v2**：同月第 2 點當下自動變 1 張券、月點數歸零；券隔天起才能用；有券又有來的人當天一定使用（`settle_vouchers` 寫 `loyalty_redemptions`，`used_on`＝聚會日，用券那天不集點）；只處理 2026-10-27 以後的聚會日；事後修改或刪除評分不退點數、不退券。玩家端 `LoyaltyCard.tsx`（沒有使用視窗）。
- **集點卡畫面**：印章風；規則收進 `<details className="lc-fold">`；近期紀錄預設 5 筆（`RECENT_DAYS`）。評分狀態來自 `ratings`（只在 `Library` 呼叫一次）。
- **名單隱私**：預設只顯示人數；VIP 展開只看暱稱（可 `hide_in_lists`）；管理者看「暱稱（LINE／FB）」；評分者名單只有管理者；LINE／FB 永不給 VIP。

## 6. 視覺風格與樣式地雷

- 風格：**溫暖桌遊俱樂部**。色票（`tokens.css`）：奶油 `#F5F0E5`、紙白 `#FBF7EC`、森林綠 `#456B50`（深 `#365B40`）、焦糖 `#B78A5A`、深墨綠 `#34463C`；變數 `--c-*`、`--radius-*`、`--shadow-*`、`--z-bar/--z-modal`。
- **手機（≤760px）所有遮罩／抽屜／視窗 `bottom` 停在導覽列上方（`--nav-h`），樣式在 `vip.css` 底部；不要提高 `.sb-nav` z-index**。抽屜 class：`.mylist-backdrop`／`.mylist-drawer`（新的抽屜頁一律沿用，如 `ClubBoard`、`UpcomingGatherings`）、`.drawer-backdrop`／`.filter-drawer`、`.modal-backdrop`、`.ma-backdrop`、`.ra-backdrop`、`.account-backdrop`、`.cat-backdrop`。
- **視窗層級**：視窗一律 `createPortal(..., document.body)`；`.mylist-backdrop` 1100、`.mylist-drawer` 1200、`.ra-backdrop` 1100、`.cat-backdrop` 1100、報到視窗 1050、頂端列 900、「請改用瀏覽器開啟」1200、**`.modal-backdrop` 詳細視窗 1220**（`vip.css` 先設 1150、後面再覆蓋為 1220，疊在俱樂部抽屜上）、`NotePrompt` 1230、`PlayedGameRecord` 1240、`.gn2-backdrop` 心得／聚會詳情視窗 1250、VIP 密碼視窗 1300。排行榜抽屜層級未確認（推測沿用 mylist）。**頂端列不可加 `backdrop-filter`、`transform`、`filter`**。
- **iPhone 深色模式**：`vip.css` 底部有 `:root{color-scheme:light}` 等修正；新增視窗標題不要依賴繼承色。**標題顏色（`d2b2e26` 修正）**：原本 `vip.css` 底部有 `@media (min-width:761px)` 把所有 `.mylist-drawer h2` 強制白字，淺底的抽屜頁標題因此看不見；現改為 `.mylist-drawer .mylist-header h2 { color: #34463c !important }`、`.mylist-drawer .club-top h2 { color: #fbf7ec !important }`（只有「我的俱樂部」首頁深綠底用白字，集點卡標題列若是深色底要再看，待實測）。新增視窗標題一律用 `.mylist-header h2` 結構才會吃到這條。
- 「我的俱樂部」✕ 固定右上角（`.club-close` absolute）。規則助手按鈕樣式、`.rb-warn`、`mg-*`、`ap-*`、`gn3-*`（舊的 `gn-*` 與多數 `gn2-*` 已於 `5401962` 清除）、`cls-*`、`club-pts-line`、`club-menu-count`、`info-hint*`、`search-filter-btn`、`lb-hintrow`、`mystat-*`、`mn-*` 都貼在 `vip.css` 最底下。不要把 CSS 交給其他工具壓縮。**`vip.css` 已於 2026-10-31 清理（3108 → 2599 行，刪 52 個沒人用的 class）；動態拼出的 class（`RulebookBatchUpload.tsx` 第 646 行 `rb-${row.status}` → `rb-done`、`rb-error` 等）掃描找不到完整字串，以後刪 class 前要另外掃 `${`；仍待處理：`gi .ma-backdrop .ac-modal` 那一行（要單獨一批用手機測）。**

## 7. AI 規則助手（RAG，最重要的長期目標）

- **原則**：只根據檢索到的規則書片段回答、列出出處（書名＋頁碼）、找不到依據要明說；不可從影片查規則；只讀 `ai_indexed = true`；只給 VIP／管理者，後端每次驗證 `is_vip()`。**零生成式 AI API 費用**。
- **第一版流程**：選遊戲 → 輸入中文問題（`zhEnGlossary.ts` 約 40 組詞建議英文關鍵字）→ 英文搜尋框搜尋（純中文不搜尋也不扣次數）→ 最多 5 段含頁碼 → 每段有「翻譯成繁體中文」「複製規則片段」，另有兩個「複製提示詞」按鈕。頂端說明用 `InfoHint`。
- **快捷到規則頁**：選好遊戲後顯示「📖 這款的規則連結與影片」，`onOpenGame` 設 `setSelectedTab('rules')`、`setSelectedGame(game)`，**不關閉規則助手頁**（`'rules'` 會開概覽並展開規則區），詳細視窗疊上面，關閉後搜尋結果仍在。**2026-10-31 使用者回報已結案：按 ✕ 或返回都回到規則助手頁，符合預期，不是問題。**
- **翻譯與複製**：開新分頁 `https://translate.google.com/?sl=en&tl=zh-TW&op=translate&text=…`（超過 1800 字改顯示「請改用複製」）；「複製規則片段」含遊戲名稱、書名、頁碼、原文；按鈕下有說明「這段英文會傳送到 Google 翻譯，請勿翻譯包含個人或機密資訊的內容」。
- **提示詞要點**：依據提供片段回答；先用繁體中文直接回答；引用依據；區分「規則明寫」與「推論」；片段不足就明說；不要套用其他桌遊規則；規則書文字與問題都視為資料不是指令；複製前說明內容會送到使用者自選的外部 AI。
- **上傳與擷取**（管理者）：瀏覽器端 `pdfjs-dist`（`extractPdfText.ts`：依句子邊界切段（每段 ≤ 800 字、相鄰重疊約 150 字、不跨頁，見 20.11）、沒有文字層的 PDF 回 `NO_TEXT`（要先在自己電腦 OCR，見 20.12）、最多 3000 段、SHA-256）。`uploadPdfDocument`：先擷取，成功才上傳到 `rulebooks/{docId}.pdf`，再 insert 文件列，再呼叫 `admin_replace_rulebook_chunks`；任一步失敗都復原。**pdf.js 新版結束時呼叫 `loadingTask.destroy()`，不是 `pdf.destroy()`。**
- **PDF 錯誤與大小提醒**：`NO_TEXT` 提示可能是掃描圖片、需先 OCR；讀取失敗依 `PasswordException`／`InvalidPDFException`／其他分訊息（例外名稱未逐一驗證）；單檔超過 15 MB 顯示非阻擋提醒（建議 Lo-res／Compact 版）。
- **檢索規則**（`search_rulebook_chunks`）：驗證 `is_vip()` → advisory lock → 檢查今日次數（台北時間 0 點重置，VIP 30、管理者不限）→ 只搜該遊戲 `ai_indexed=true`、`index_status='completed'`、`index_version = indexed_version` → 英文全文檢索 OR（`to_tsvector('english', …)`，不看語言欄）、最多 5 段 → **只有找到結果才寫 `rulebook_search_log` 並扣次數** → 順便刪 7 天前紀錄（不啟用 pg_cron）。
- **管理中心「規則書」分頁**（`RulebookBatchUpload.tsx`）：最上面 `UsageBar`（已用／上限／剩餘＋進度條，總量含所有 bucket）；`mode` 為 `'pdf' | 'link' | 'files'`。①上傳 PDF：多檔，每列只有遊戲選擇（`GamePicker`，最多 8 個符合者）；遊戲、類型、語言由檔名猜（`guessGame`、`guessDocType`、`guessLanguage`）；有未選遊戲時「全部上傳」為灰；失敗可「重試失敗的」；同款同名會擋。②貼連結／管理文件：先選遊戲，列該款文件、可刪除；表單只有標題與網址；YouTube、youtu.be、bilibili、b23.tv、vimeo 存 `video`，其餘 `other`；YouTube 自動帶名稱（oEmbed）。③「已上傳」：可搜尋、「前往刪除」跳到「貼連結／管理文件」並選好遊戲。④顯示名稱統一 `lib/docLabels.ts`（`docLabel`、`docKind`、`docIcon`）。語言只是顯示標記。
- **文件來源**：規則書、FAQ、中文規則網站（另存成 PDF 再上傳）；`intro` 與 `video` 不進索引；日文第一版不收。**上傳的 PDF 只給 AI 檢索、不公開**；使用者端只顯示連結與影片。
- **授權**：使用者決定一律啟用；AI 已提醒私有 bucket 不等於取得授權（非法律意見）。
- **（2026-11-03 起，以第 20 節為準）** 切段已改句子邊界＋重疊、搜尋結果前端會合併重疊段（`mergeChunks.ts`）、繁中規則書已用 OCRmyPDF 轉文字版上傳、RAG 2.0 規劃（三層產品、文件語言與範圍、詞庫、混合式搜尋、Context Pack、募資與雲端 AI）與 Gemini 條款查證都在第 20 節。
- **未決／之後**：中文檢索（`pgroonga`、`pg_trgm` 等皆未啟用、未實測）；跨語言問題尚未根治（專有名詞對照、語意搜尋、翻譯 API 皆未查證）；中英檢索測試集；網站內直接回答的生成式 AI（候選 Gemini 免費 API，條款未查證）；「更新版本」按鈕；章節標題；OCR；使用者端「玩錯勘誤」（需新資料表）；管理中心「規則資源管理」整理。
- 驗收標準：文件可分別管理；文字型 PDF 能擷取並保留頁碼；結果不混入其他桌遊；可看原文與出處；可複製提示詞；訪客與一般會員無法繞過前端呼叫檢索；PDF 原檔不公開；網站沒有生成式 AI API 呼叫；找不到時不假裝有答案；測四種身分。
- **`lib/useBackClose.ts`（堆疊式）**：`useBackClose(onClose, enabled = true)`。**每層視窗各佔一筆歷史**（`pushState({backDepth})`），返回／右滑只關最上面一層；✕ 或程式關閉時自己 `history.go(-n)` 收回；同一瞬間一關一開沿用舊那筆；收回期間用 `expectedPops` 略過自己造成的 `popstate`（0.8 秒保護計時）；使用者按「前進」時退回去；`sync()` 延遲 120 ms、`.sb-item{touch-action:manipulation}`（使用者回報不卡了）。已套用：`App.tsx`（導覽頁面＋進階篩選）、`GameModal`、`RulebookPage`、`PlayerPanel`、`CategoryChips`、`GatheringNotePanel`、`PlayedGameRecord`、`MyList`（子畫面，含留言板、近期聚會）、`MyGatherings`（詳情）；`CheckInDialog`、`VipJoinDialog`（`73ece9d`：報到過程中返回＝取消；報到成功、選遊戲評分時返回＝關閉報到視窗；遊戲視窗疊在上面時先關遊戲視窗；`CheckInDialog` 只在 `checkinToken && checkinLoggedIn` 時掛載、`onClose` 是 `clearCheckin`，`?join=` 是否被清掉未確認）。目前沒有已知未套用的視窗。**新視窗要支援返回鍵，只要呼叫 `useBackClose(onClose, isOpen)`，不要自己 `pushState`。**

## 8. 其他想做清單（使用者提出，未排序）

- **站上拖曳調整排名＋匯出 CSV 給 Notion**（使用者說「晚點再嘗試」）：管理者專用；6 個排名欄位都已在資料庫；建議 `@dnd-kit` 拖曳、先顯示「將更新 N 款」再儲存、匯出 UTF-8 含 BOM 的 CSV；提醒網站改過排名後若先匯入舊 Notion CSV 會被覆蓋。開工前要看 `AdminPanel.tsx`、`fetchBoardGames.ts`。
- **「俱樂部」升級**：想玩可標「近期想玩」「下次聚會想玩」；遊玩紀錄加對手／勝負；統計（已做：玩過幾款、總次數、約略總時數、最常玩 TOP 3／5／10；待做：最愛類型、常玩人數、每月趨勢）。
- **揪團與聚會規劃**（近期聚會第一版已做；之後可能擴充）：報名與候補、依人數推薦、「今天想玩什麼？」推薦、想玩人數對照預計遊戲（近期聚會第一版刻意不做；**2026-10-30 晚已做成管理者專用的「想玩提示」，VIP 仍看不到**，避免把「想玩」誤認成「可以參加」）、通知（已用導覽列與俱樂部首頁的數字徽章取代提示卡）；訪客紀錄跨瀏覽器同步。
- 其他：PWA（缺圖示）；VIP 朋友名單 UI；推薦牆；左右滑動切換分頁；Email 登入、現場報到碼（先不做）；VIP 鎖定 SQL（6 張表加 restrictive 政策 `"vip only"`＋改 `get_rating_summaries()`，執行前先討論）。

- **聚會得點時已玩次數自動 +1（使用者 2026-10-31 提出，待討論）**：想法是被加入聚會或收到連結的人得到一點時，`play_count` 自動 +1。**與 2026-10-30「出席不自動算玩過」衝突**，要先問清楚指定遊戲有多款時算哪款、是否只在七項評分完整得點時、與「我這場有玩這款」勾選及同日同款 `game_play_sessions` 的重複、開團紀錄確認（`play_status`）、`exempt`、舊聚會回溯。QUICKSTART 第 4 節第 6 項。
- **聚會設定版面太擠（待決定）**：使用者定義——預計聚會＝預告可能開的局；新增聚會＝記錄誰實際到場並建立連結、被記錄或收到連結者評分得點；近期聚會＝曾開過的團供管理者參考。另一個 AI 建議「聚會管理（預計＋歷史）」＋獨立「新增聚會」頁，**未採用**。現有「聚會設定」由上而下是預計聚會、新增聚會、近期聚會（含指定遊戲、開團確認、人數上限、手動加入、連結），上面已有三個小分頁。
- **遊戲規則區改版（待做）**：`GameDocuments.tsx` 現況為三組（`web`、`video`、`pdf`〔僅管理者〕），每組 `<h4 className="docs-group-title">`，連結 `bgg-link`，管理者每列「刪除」；使用者覺得「▶ 教學影片」像選單卻點不了。預設改成每份文件一列整列可點、組標題不像按鈕。**不可把上傳的 PDF 公開給一般人。**
- **我的統計「最常玩 TOP 3／5／10」太擠**（概況頁，使用者手機截圖）：標題貼著上方方塊、圓鈕擠；總時數方塊的 ⓘ 貼著數字。
- **「我的評分」中心＋導覽重整提案（使用者貼來的另一個 AI 建議，2026-11-02；只當參考，除「我的評分」第一版外全部未決定）**：提案含獨立「我的評分」頁（已做第一版，見第 18 節）、遊戲視窗只留評分摘要、評分修改歷史（`game_rating_history`）、第三種狀態「細項待補」（已做）、導覽重整、俱樂部改社群中心（動態牆、按讚、回覆、會員頁、「我的統計」移出俱樂部、「我的場次」併入集點聚會）。對照：「我的統計」是個人資料、統計中心是全站榜單，兩者不重複，**不採用移出**；動態牆／按讚／回覆與既有決定（首頁不顯示最新留言、第一版不做按讚）衝突，會員頁牽涉 `hide_in_lists`、LINE／FB 永不給 VIP、`privacy.html`，要先談隱私；提案的評分項目名稱不是網站正式用語（正式：喜歡度、玩家影響性、溝通度、變化度、獨特性、適合留下來＋整體 1～10），其截圖數字是示意假資料。

## 9. 多台電腦作業

**自動同步**：Supabase 資料與 Storage、GitHub 程式碼。**不會同步**：`.env.local`、`boardgames.csv`、沒 commit／push 的修改。

新電腦：①安裝 Git、Node.js（LTS）、VS Code，設定 `git config --global user.name`／`user.email`；②舊電腦 `git remote get-url origin`；③`git clone <網址>`，確認在 `master`；④`npm.cmd install`；⑤專案根目錄建 `.env.local`（兩行純文字、不加引號）：`VITE_SUPABASE_URL=https://hgeuockbjrzayfdylavq.supabase.co`、`VITE_SUPABASE_PUBLISHABLE_KEY=（Publishable key）`；⑥`npm.cmd run dev`，確認顯示 106 款。日常：開始前 `git pull`；結束前逐檔 `git add` → `git commit` → `git push`；不要兩台同時改同一批檔案。

## 10. 介面重整方向與已決定的規格

> 來源：使用者貼過 ChatGPT 針對畫面截圖給的建議。**圖中的數字、聚會、遊戲 A／B／C 與封面都是示意假資料。**

**核心原則**：桌遊是固定資料；收藏狀態是「你和桌遊的關係」；遊玩紀錄是「實際發生過的一件事」。同一份資料只在一個地方管理，其他地方做預覽。**資料原則**：遊玩紀錄（`game_play_sessions`）與公開留言（`game_notes`／`gathering_notes` 公開欄）是兩種資料，只透過「分享」互相關聯；介面可以統一。

**已完成的方向**：詳細視窗四分頁（概覽、評分、討論、紀錄）；俱樂部首頁入口（我的統計、近期聚會、留言板、**我的心得**、我的場次；2026-10-31 晚「我的心得」從留言板獨立出來，留言板只留大家的留言牆）；留言自願公開（聚會心得私人／公開兩欄，中間「複製」；私人存在自己的紀錄，公開只透過 security definer 函式給 VIP，隱藏暱稱者顯示「匿名玩家」，公開留言不顯示聚會日期與時間）；遊戲留言多則；開團紀錄由管理者確認；我的場次補寫心得入口；補記遊玩沿用 `game_play_sessions`、**出席不自動算玩過**；心得跳窗做成「評分完成後底部提示條」（`NotePrompt`，「自動用券後也問」尚未做）。

**仍待確認／未採用**：
- **（ChatGPT 建議，未採用的部分）** 聚會心得再分「只有參與者可見」新層級（會改隱私文件）、「補建過去聚會」＋參與者自己確認、刪聚會時保留私人心得（目前 `gathering_notes.gathering_id` 是 `on delete cascade`，管理者刪除聚會會連帶刪掉所有人在這場寫的心得；**這是真實風險，要先討論再改資料表**）。
- 詳細視窗的「所有紀錄」要公開所有玩家評分與留言，與既有「個別評分只有本人看得到」衝突（留言已改自願公開，評分仍未決）。
- 要不要廢除 `play_count`；「單場評分」（`game_play_sessions` 沒有評分欄，要改表）；概覽評分顯示（BGG／管理者／社群／個人標籤；樣本達 5 人才顯示社群平均）。
- **主畫面顯示最新留言與近期聚會預覽卡**：另一個 AI 建議，使用者先前決定首頁不顯示最新留言，**未採用**；使用者只要求「新預計聚會的通知」，已用數字徽章完成（第十九批）。
- 底部導覽列候選（首頁／探索／我的桌遊／遊玩紀錄／我的）最後才做。
- 「攻略」沒有資料來源；「俱樂部近期動態」「近期熱門」「快速功能入口」尚未採用。使用者偏好概覽走「桌遊圖鑑風＋保留米白深綠配色」。

**近期聚會的設計細節（2026-10-30 定稿，已實作）**：一筆預計聚會＝一個日期＋選填開始時間＋標題＋遊戲清單，同一天可多場；VIP 一鍵「我可以去」可隨時取消；**VIP 看不到意願人數與名單、只有管理者看得到**；第一版不做想玩人數統計、人數上限、候補、截止日、通知；取消保留並標示（日期過了才從列表隱藏）；轉正式由管理者手動、保留 `gathering_id` 關聯、**不自動複製遊戲清單、不把意願名單變成報名名單**；過期隱藏但資料保留；入口在俱樂部首頁；管理者區塊在管理中心「聚會設定」最上面。

## 11. 2026-10-31 深夜增補（覆蓋前面衝突的敘述）

- **資料庫**：新函式 `add_session_from_rating()`（`plpgsql`、`security definer`、`search_path=''`、`revoke ... from public, anon, authenticated`）＋觸發器 `aa_ratings_add_session`（`game_ratings` 的 `AFTER INSERT OR UPDATE FOR EACH ROW`；名稱 `aa_` 開頭讓它排在 `settle_vouchers_on_rating` 之前）。`game_ratings` 上共 4 個觸發器：`game_ratings_set_updated_at`（BEFORE UPDATE）、`aa_ratings_add_session`、`settle_vouchers_on_rating`、`trg_ratings_mark_played`。邏輯：新值七項皆非空；UPDATE 時舊值也完整就跳過；用 `gatherings ⋈ gathering_attendees（本人）⋈ gathering_games（該款）`找 `gathered_on <= 今天（台北）` 中日期最近一場；`pg_advisory_xact_lock(hashtextextended(user|game|date,0))`；`not exists` 同人同款同日才 insert（`player_count` null、`note` ''）。**點數仍是 `loyalty_day_status` 即時計算，不是存起來的**。撤銷：`drop trigger aa_ratings_add_session on public.game_ratings;`。`game_play_sessions` 沒有同人同款同日唯一限制（刻意，補記允許重複但前端會先確認）。
- **前端新增檔案**：`src/lib/askConfirm.tsx`（取代 `window.confirm`／`alert`；Google App 等內建瀏覽器不支援原生視窗）、`src/components/NoteListItem.tsx`＋`src/styles/note-list.css`（清單式留言，`nl-*`，元件自己 import）、`src/GameDocuments.tsx` 改寫＋`src/styles/game-docs.css`（`gd-*`）。`GameNotesBoard` 的刪除／隱藏用 `pending` 狀態做頁面內兩段式確認。
- **樣式**：`vip.css` 最底下新增 `.game-card .game-info h3`（卡片標題固定兩行高度）與 `.mystat-*` 間距、`.mystat-i {margin-left:3px}`、`.mystat-box-btn span {white-space:nowrap}`。
- **已知未解**：Google App 內建瀏覽器底部五顆導覽「點了沒反應要再點」，原因未確認（假設見 QUICKSTART 2.0）；管理者專用檔案與 `PlaySessions.tsx` 仍有原生 `confirm`／`prompt`。
- **三種聚會的定義**（使用者）：預計聚會＝預告可能開的局；新增聚會＝記錄誰實際到場並建立連結，被記錄或收到連結者評分得點；近期聚會＝曾開過的團供管理者參考。

## 12. 2026-10-31 深夜後增補（覆蓋前面衝突的敘述）

- **`lib/useSession.ts` 已改寫（`8f8d2c1`）**：模組層級共用 session（`cached`、`listeners` Set、`start()` 只註冊一次 `getSession` 與 `onAuthStateChange`）；元件 `useState(cached)`，掛載時訂閱；**只有 `SIGNED_OUT` 事件才接受 `null`**，其他事件帶 `null` 忽略。簽名仍是 `useSession(): Session | null`。原因：舊版每個元件掛載都從 `null` 開始，回到頁面時短暫被當成訪客。整站第一次載入時仍會有一瞬間 `null`（正常）。`useVip.ts` 的 `cache` 與 `getSession` 保護不用動。
- **`usePersonalCollection.declineMerge`（`a81ca91`）**：`setDeclinedUserId(userId)`＋`setLocal({})`＋`saveLocal({})`；按「不加入」＝刪除該瀏覽器的訪客紀錄（不影響雲端），之後 `needsMerge` 因 `localCount = 0` 不再成立。`local` 只在未登入時才寫 `localStorage`，所以清除必須明確呼叫 `saveLocal({})`。
- **排行榜**：新函式 `get_play_totals()`（回 `bgg_name, play_total, play_month, play_quarter, play_year`；只有登入的 VIP／管理者；只統計 `played = true`、VIP＋管理者；「全部」＝`play_count`＋有日期紀錄筆數，本月／本季／本年只算有日期的）；前端 `lib/usePlayTotals.ts`、`Leaderboard.tsx`（VIP／管理者五顆榜：想玩、已玩、最常玩、整體評分、適合留下來；一般人與訪客四顆）。`Leaderboard` 內部自己呼叫 `useCommunityStats(isOpen)`（每次打開重讀，`useCommunityStats(enabled = true)` 有 `reloadKey`／`reload`），`App.tsx` 傳入的 `communityStats` prop 被忽略；**不要在 `Leaderboard` 呼叫主畫面那份的 `reload()`（會讓主畫面卡）**。改版（`f56b0a6`）：搜尋欄內「篩選」鈕、`src/styles/leaderboard-search.css`（`lbs-*`）、篩選面板含統計期間與排序方向（由低到高只反轉顯示、名次不變，AI 預設）；舊 `leaderboard-filter.css`（`lbf-*`）與 `vip.css` 舊 `lb-periods` 未清。難度分界（≤2 簡單、2～3 中等、≥3 偏難）為暫定值。
- **樣式**：`sitebar.css` 的 `.sb-item:hover` 包進 `@media (hover: hover) and (pointer: fine)`；`vip.css` 最底下 `html, body, button, a, .game-card, .status-btn, .sb-item { touch-action: manipulation; }`。
- **已知未解**：Google App 內建瀏覽器底部五顆導覽點了沒反應（登入修復後待重測）；遊戲視窗右上角想玩／已玩人數打勾後要重新整理才更新。

## 13. 2026-10-31 深夜後二增補（覆蓋前面衝突的敘述）

- `lib/useCommunityStats.ts`：回傳 `{ getStats, reload, adjust }`；`adjust(bggName, wantDelta, playedDelta)` 只改記憶體裡的 `wantCount`／`playedCount`（不低於 0，該款不在表中就以空統計為底），不打網路。`App.tsx` 不再在開遊戲視窗時呼叫 `reload()`（`6f4f471` 加的那段已移除；原因：在 iPhone Google App 內建瀏覽器造成開視窗後關閉暫時點不了，註解掉後使用者回報不卡）。`App.tsx` 新增 `personalWithStats`（`useMemo`，`{...personal, updateEntry}`），只給主畫面 `GameCard`：VIP／管理者、已登入、`status === 'ready'` 時，卡片打勾依 `changes.wantToPlay`／`changes.played` 與打勾前的值算差並呼叫 `adjust`；一般會員與訪客不動。評分自動標已玩的 `useEffect` 與其他元件仍用原始 `personal.updateEntry`，所以那些路徑不調整人數。期間新增（月／季／年）不調整。**第 12 節「遊戲視窗右上角想玩／已玩人數打勾後要重新整理才更新」已改為：卡片打勾會即時調整（`4025cd8`，手機實測待回報）。**
- `Leaderboard` 仍自己呼叫 `useCommunityStats(isOpen)` 讀一份；不要在 `Leaderboard` 或其他地方呼叫主畫面那份的 `reload()`（已知會造成卡頓）。
- 專案 TypeScript 設定會把「宣告了沒使用」（TS6133）當成 build 錯誤；註解掉一段程式時，專用變數要一起註解。
- `lib/askConfirm.tsx`：`PlaySessions.tsx` 已改用 `askConfirm`／`showNotice`（`a9b7748`）。尚未換的仍是管理者專用檔案（`AdminPanel`、`GameDocuments`〔上傳 PDF 刪除〕、`LoyaltyAdmin`、`MemberAdmin`、`NewGatheringWizard`、`PlannedGatheringsAdmin`、`RulebookBatchUpload`、`DescriptionEditor`、`InAppBrowserNotice`）；`askConfirm` 沒有輸入框，原本用 `prompt` 的地方要另外決定做法。
- 清單式留言（`f8e2d5d`）：`NoteListItem.tsx` 新增選填屬性 `badge`、`thumb`、`hideText`（沒傳＝原樣）；結構 `.nl-row` > [`.nl-thumb`, `.nl-main` > [`.nl-top`、遊戲標籤、內文]]；`note-list.css` 無邊框＋`border-bottom: 1px solid #e3d9c4`、展開 `.is-open` 淡底色、`.nl-thumb` 52px、留言一律靠左（`text-align: left !important`，`8da7b09`）。`MyNotes.tsx` 列表改用 `NoteListItem`（《遊戲名》、`mh-badge` 徽章、縮圖 `renderCover(game)` 或 🎲、`openKey` 狀態、編輯中強制展開並 `hideText`）；資料、SQL、篩選、重新讀取、頂端按鈕不變。第 4 節「我的心得」描述中的卡片版面以此為準；舊 `mh-item`／`mh-head`／`mh-list`（`my-notes.css`）與 `mn-*`（`vip.css`）沒人用，未清。
- 想玩名單（管理者專用，使用者回報沒問題）：預計聚會（`PlannedGatheringsAdmin`，呼叫 `admin_get_want_to_play_people()`）、正式聚會（`LoyaltyAdmin`，用頁面已載入的 `players`＋`contacts`，`wantersOpen` 的 key 為 `${scope}:${bggName}`，`scope` 為 `search`／`picked`）、新增聚會流程（`NewGatheringWizard`，`wanters()` 多回 `contact`、`openWanters` 狀態）三處格式一致：「社群有 N 人想玩 ▾」點開列「暱稱（LINE／FB）」，已選參加者排前面標 ✓，沒暱稱顯示「（未設暱稱）」。第 2 節「前端尚未接」已過時，前端已接。
- 備份表：`game_play_sessions_backup_20261031`、`user_game_status_backup_20261031` 已刪；`game_notes_backup_20261030` 仍在（RLS 開、無權限，使用者未決定是否刪）。


## 14. 2026-10-31 下午增補（覆蓋前面衝突的敘述）

- **`lib/askConfirm.tsx`**：現在有三個函式：`askConfirm(message, options)`→`Promise<boolean>`、`showNotice(message)`、**`askInput(message, {placeholder, defaultValue, confirmText, danger})`→`Promise<string | null>`**（取代 `window.prompt`，有輸入框，取消回傳 `null`）。訊息區 `maxHeight: 55vh` 可捲動、`overflowWrap: 'anywhere'`（長清單、長網址）。**第 13 節「尚未換的仍是管理者專用檔案」已過時：`AdminPanel`、`MemberAdmin`、`RulebookBatchUpload`、`DescriptionEditor`、`GameDocuments`、`LoyaltyAdmin`、`NewGatheringWizard`、`PlannedGatheringsAdmin`、`InAppBrowserNotice` 都已換（`87b3517`），專案裡沒有 `window.confirm`／`prompt`／`alert`。** 使用處舉例：刪除帳號要輸入暱稱（`MemberAdmin`）、移到垃圾桶超過 5 款要輸入「移除」（`AdminPanel`）、贈送免費券預設 1（`LoyaltyAdmin`）；複製聚會連結或網址失敗時改用 `showNotice` 顯示網址讓使用者長按複製。
- **聚會設定（`LoyaltyAdmin.tsx`，`ca49514`）**：第 4 節「聚會設定由上而下：預計聚會、①新增聚會、②近期聚會」已改為：預計聚會（`PlannedGatheringsAdmin`，可收合）→**聚會管理**（標題右邊「＋ 新增聚會」開 `NewGatheringWizard`，流程沒變；其下「尚未結束」與「歷史聚會」）。分類（不改資料庫）：`gatheredOn >= 今天`，或已過但 `gathering_games.play_status` 還有 `null`，算尚未結束（日期由近到遠）；其餘歷史（預設收合，展開依月份分組、新到舊；過去且沒有指定遊戲者進歷史）。`loadUnconfirmed()` 直接讀 `gathering_games` 的 `gathering_id, play_status`（失敗就當全部已確認），在 `loadAll` 與 `setGameStatus` 後重讀；`statusOf(g)` 徽章：今天／尚未開始／待確認／已結束；`renderGathering(g)` 畫每一場的列與展開詳情（內容沒變：指定遊戲＋想玩者名字＋開團確認、人數上限、手動加入條列、聚會連結、刪除這一場）。樣式 `src/styles/lga-manage.css`（元件自己 import；`.lga-manage` 前綴縮小列與字級）。`lga-month*` 規則沿用在歷史月份分組（定義在 `vip.css`）。
- **三種聚會的定義（使用者，不要改名）**：預計聚會＝預告可能開的局，玩家勾「我可以去」；新增聚會＝記錄誰實際到場並建立連結，被記錄或收到連結者評分完整當天指定遊戲任一款得 1 點，評分完整會自動新增當天一筆遊玩紀錄（總次數 +1，不動 `play_count`）；近期聚會＝曾開過的團，供管理者查詢（現在介面叫「聚會管理」的歷史部分）。
- **樣式清理結果**：已刪 `vip.css` 的 `mn-*`、`my-notes.css` 的 `mh-list／item／head／thumb／headtext／title／date／content`、`leaderboard-filter.css` 的 `lbf-*` 與 `.lbf`、`leaderboard.css` 的 `lb-periods／lb-period／lb-note`。`leaderboard-filter.css` 只剩 `.lb-tabs-5`（`Leaderboard.tsx` 仍 import 它）；`leaderboard-search.css` 全部在用。第 4 節與第 11～13 節提到的「舊 `mh-*`／`mn-*`／`lbf-*`／`lb-periods` 沒人用、未清」已過時。`vip.css` 手機版那行 `gi .ma-backdrop .ac-modal` 使用者已手動刪掉（真正的 `.ma-backdrop .ac-modal` 手機版規則在約 2115 行）。**以後刪 class 前：用 PowerShell 掃 `src` 裡 `.tsx`／`.ts` 是否出現該名稱，並另外搜 `${` 動態拼接。**
- **資料庫**：備份表 `game_notes_backup_20261030` 已刪，目前沒有任何備份表。`gathering_games` 目前只有 1 筆（2026-10-26 Raiders of Scythia，`played`）；開團紀錄預設值維持「管理者手動確認」，`get_game_play_history` 不改。

## 15. 2026-11-01 增補（覆蓋前面衝突的敘述）

- **排行榜三頁（`75618ba`，畫面實測使用者回報「還沒測」）**：`Leaderboard.tsx` 的 `page: 'games' | 'players' | 'stats'`（關閉排行榜重設為 `games`；切換列 `lb-pages` 只有 `canSeePeople || isAdmin` 才顯示）。遊戲榜只剩想玩／已玩／整體評分／留下來四顆（`BoardKey` 已移除 `'raters'`／`'people'`；第 4 節與第 12 節「VIP／管理者五顆榜」「最常玩」已過時）。右上「📊 統計表」鈕與 `lb-table-btn` 已移除，統計表改為第三頁、嵌在 `mylist-body`。難度篩選改五級（`3ce2d32`）：入門（<1.8）／輕度（<2.6）／中度（<3.2）／中重（<3.8）／重度，用 `libraryTypes.ts` 的 `getDifficultyLevel`，沒難度資料的遊戲選任何難度都被排除（第 12 節「≤2 簡單、2～3 中等、≥3 偏難」已過時）。
- **統計表分布圖（`9f2f1e1`）**：`StatsTables.tsx` 新增選填 `embedded`、`onOpenGame`，`onClose` 改選填；分頁「遊戲總表｜分布圖｜（管理者）成員 × 遊戲矩陣」；`ScatterPanel`（原生 SVG、無新套件）X／Y 軸各一個下拉（想玩人數、已玩人數、整體評分、留下來評分、評分人數；預設 X＝整體、Y＝留下來），點選後同位置多款合併成較大的點並全部列在下方、有「查看遊戲」；缺值（評分不滿 5 人）不畫並註明排除幾款；`niceScale` 算刻度。樣式 `src/styles/stats-chart.css`（`lb-pages`、`st-embedded`、`sc-*`、`pb-who`、`lb-pages.pb-toggle`）；`.st-modal.st-embedded` 是猜的。
- **玩家榜**：新檔 `src/components/PlayersBoard.tsx`、`src/lib/usePlayerStats.ts`（呼叫 `get_player_stats`，型別 `PlayerStat`／`PlayerRating`：`g, o, k, s`）。`Leaderboard` 呼叫 `usePlayerStats(isOpen && (canSeePeople || isAdmin) && page === 'players')`。四個子分頁「玩過最多／評過最多／評分／綜合分數」；款數榜前 10 名同分並列（有搜尋時列出符合者與原名次）；評分與綜合分數榜每筆＝玩家→遊戲→分數（綜合顯示「N／30」），「最高／最低」切換，最多 20 筆並註明總筆數，同分並列、依遊戲名再依暱稱排序；搜尋玩家暱稱（評分榜也搜遊戲名）；「隱藏管理者」勾預設不勾，四個子分頁都有；`InfoHint` 說明規則與綜合分數定義；管理者看到「暱稱（LINE／FB）」，VIP 只有暱稱。
- **新增資料庫函式**（皆 `plpgsql stable security definer`、`search_path=''`、`revoke ... from public, anon`、`grant execute ... to authenticated`；使用者貼回權限皆只有 `postgres`／`authenticated`／`service_role`）：
  - **`get_player_stats()`** → `nickname, contact_name, admin_account, played_count, rated_count, ratings(jsonb [{g,o,k,s}])`：VIP 或管理者才能呼叫（否則 `not vip`）；`contact_name` 只有管理者拿得到；**`hide_in_lists` 的玩家 VIP 看不到、管理者看得到**；只列 `vip_members` ∪ `admin_users`；排除垃圾桶遊戲（`board_games.removed_at is null`）；`s`＝六項皆非空才是加總（喜歡、影響、溝通、變化、獨特、適合留下來），否則 null，不含整體。**管理者帳號（`admin_users` 排序第一位，視為 james）的「評過款數」與評分明細不是用他的 `game_ratings`，而是用和 `get_rating_summaries()` 同一套 CSV 換算**（玩過＝`ranking_engine` 為整數；整體依 `ranking_engine` ≤25→10、≤50→9、≤65→8、≤80→7、其餘 6；適合留下來依 `score_rank` 在玩過遊戲間的 `rank()` ≤30→5、≤60→4、≤90→3、其餘 2；五項度取 `*_emoji` 去掉 U+FE0F 與空白後的字元數，上限 5、0 變 null）。**已玩款數（`played_count`）對所有人包括 james 都用 `user_game_status.played`。** 管理者不只一位時只有第一位走 CSV。函式內型別要到執行時才驗得出。
  - **`get_rating_counts()`**（`50ae63f`）→ `bgg_name, rating_count`：只數 `vip_members` 且排除 `admin_users` 的 `game_ratings`；非 VIP／管理者丟 `not vip`。**現在沒人用。**
  - **`get_play_totals()`**（第 12 節）也**沒人用**（排行榜「最常玩」榜已移除）。
- **近期聚會併進集點卡頁（`7ac0210`）**：見 QUICKSTART 2.0（最新）。第 4 節俱樂部首頁的「🎲 近期聚會」列、`view` 的 `upcoming`、「俱樂部圖示徽章」已過時：`MyList.tsx` 的 `View` 現為 `home | stats | gatherings | addplay | notes | board`；集點卡畫面 VIP 非管理者有 `loyaltyTab`（`card`｜`planned`，沿用 `lb-tabs`／`lb-tab`，每次開啟預設 `card`）；`TopBar.tsx` prop `loyaltyBadge`（`sb-count` 數字徽章在「集點卡」，可能與 `sb-dot` 並存）；`App.tsx`：`usePlannedUnseen(..., vip.isVip && !isAdmin)`、`loyaltyBadge={planned.unseenCount}`；看到近期聚會分頁就呼叫 `onPlannedSeen`。
- **主畫面排序**（`0a80f76`）：`SortControl.tsx` 沒有「最佳人數」「推薦人數」兩個選項；`filterStorage.ts` 載入 `sortBy` 若是 `bestPlayers`／`recommendPlayers` 回 `rankingEngine`；`SortKey` 型別與 `App.tsx` 排序 switch 刻意沒動；篩選抽屜的最佳／推薦人數篩選保留。
- **規則書管理（`7b90385`）**：第 7 節「`mode` 為 `'pdf' | 'link' | 'files'`、③已上傳分頁」已過時：`RulebookBatchUpload.tsx` 的 `mode` 為 `'pdf' | 'link' | null`（預設都收起）；兩顆入口「＋ 上傳 PDF」「＋ 貼連結」；常駐「文件列表」依遊戲分組、可收合、可搜尋（遊戲名、英文名、文件名）；單一遊戲展開後由 `GameDocGroup` 自己呼叫 `useGameDocuments(bggName)`（刪除沿用 `docsApi.deleteDoc`＋`askConfirm`；PDF 大小用 `sizeByName.get(`${doc.id}.pdf`)`）；上傳或新增連結後 `listTick` 遞增讓各群組重讀；樣式 `src/styles/rb-docs.css`（`rbd-*`）。上傳／索引邏輯沒動。
- **聚會設定字級**（`3335085`）：`lga-manage.css` 追加縮小規則、新檔 `src/styles/planned-compact.css`（`.pg-fold` 前綴）；`PlannedGatheringsAdmin.tsx` 多一行 import。預計聚會區塊是用覆蓋方式猜的。
- **`privacy.html`（2026-11-01 版，已 push）**：新增評分條目、資料用途（玩家榜）、VIP 看得到的內容（暱稱、已玩／評過款數、整體與六項加總分數；五項細項、備註、LINE／FB、Email 仍看不到）、玩家榜只列 VIP 與管理者並可選擇不列入名單。第 4 節 `privacy.html` 的「最後更新 2026-10-30」已過時。
- **使用者決定（2026-11-01）**：以人為主體的表 VIP 也看得到（推翻「個別評分只有本人看得到」，第 2 節 `game_ratings` 列的該句只剩原始資料表權限仍成立，公開管道多了 `get_player_stats()`）；管理者 CSV 評分與一般 VIP 評分一樣處理；james 的玩過最多用他帳號的已玩資料；玩過最多與評過最多要有「隱藏管理者」勾；玩家榜綜合分數＝六項加總、不含整體、最高 30 分。
- **待決**：⑥我的統計多兩個分頁（綜合評分、自訂 XY）尚未動工，先確認綜合分數公式；批次 C（分布圖玩家模式）、⑨規則助手 RAG；`usePlayTotals.ts`／`get_play_totals()`／`useRatingCounts.ts`／`get_rating_counts()` 是否刪除；導覽列改版（最後做）；站上拖曳調整排名＋匯出 CSV。

## 16. 2026-11-01 晚增補（覆蓋前面衝突的敘述）

- 完整描述見 `QUICKSTART.md` 第 2.0（最新）節；這裡只留架構與資料庫重點。
- **前端**：`src/lib/playedStatus.ts`（`isUnplayedGame`）；`useGamePlaySessions.ts` 匯出 `SESSIONS_CHANGED_EVENT`、`PLAYED_SYNC_EVENT`、`announcePlayed(games)`；`App.tsx` 聽 `PLAYED_SYNC_EVENT` 把已玩打勾同步；`RatingSection.tsx` 有 `needFull`（集點流程七項必填）、`createPortal` 集點／自動 +1 彈窗；`Leaderboard.tsx` 統計表為彈出視窗；`PlaySessions.tsx` 折疊、手動／自動標示；`StatsTables.tsx` 名單欄 `NAME_COL_STYLE`。
- **資料庫 `game_play_sessions`**：`id, user_id, bgg_name, played_on date, player_count int null, note text not null, created_at, source text not null default 'manual'（manual／rating／admin_gathering／admin_backfill）, gathering_id uuid null`（`gatherings(id)` on delete set null）。已玩次數＝`user_game_status.playCount`（手動）＋此表筆數。
- **觸發器**：`aa_ratings_add_session`→`add_session_from_rating()`（只新增、從不刪除；`game_ratings` 第一次七項完整時，找聚會日 ≤ 今天（台北）、我有出席、指定這款的最近一場，同人同款同日沒紀錄才插入）；`trg_ratings_mark_played`、`sessions_mark_played`（`mark_played_from_activity()`，upsert `user_game_status.played=true`）；`settle_vouchers_on_rating`／`settle_vouchers_on_attendee`→`trg_settle_vouchers()`；`gathering_games` INSERT 管理者自動記一筆（聚會日 ≤ 今天）、DELETE 刪該筆；`gatherings` BEFORE DELETE 刪管理者自動紀錄、AFTER UPDATE OF `gathered_on` 連動日期；`attendee_makes_vip`；`game_ratings_set_updated_at`。**所有新觸發器都不得因評分或紀錄變動而減少已玩次數。**
- **`gathering_games`**：`gathering_id uuid, bgg_name text, created_at timestamptz, play_status text null`（實際開團狀態，要拿掉的功能，介面在 `LoyaltyAdmin.tsx`、`GamePlayHistory.tsx`、`lga-list.css`）。
- **管理者**：`admin_users` 的 id 欄位名稱未確認（用 `coalesce(to_jsonb(au)->>'user_id', to_jsonb(au)->>'id')::uuid` 取），`is_admin()` 存在；管理者帳號 james 的 id `fe8a6ab8-970a-4866-bd82-e242ed3b9bf9`；~~管理者不加進出席名單~~（2026-11-02 作廢：新增聚會時管理者預設在名單上，見第 18 節）。
- **規則**：ranking engine 非整數＝未玩，不列整體評分／留下來／玩家榜評分與綜合分數／分布圖；「俱樂部」徽章＝想玩＋已玩；排行榜顯示名「統計中心」、「影響度」顯示名「玩家影響性」。

## 17. 2026-11-01 深夜增補（覆蓋前面衝突的敘述）

- 完整敘述見 `QUICKSTART.md` 第 2.0（最新）節；這裡只留架構與資料庫重點。
- **資料庫**
  - `game_notes` 新增 `like_point text not null default ''`、`dislike_point text not null default ''`（各有 `char_length <= 100` 的 check）。`add_game_note(p_bgg_name, p_content, p_like default '', p_dislike default '')`；`update_my_game_note(p_note, p_content, p_like default null, p_dislike default null)`（null＝不改、空字串＝清空）；`get_public_gathering_notes(p_bgg_name, p_limit)` 多回 `like_point`、`dislike_point`（來自 `gathering_notes` 的列補 `''`）；`get_my_game_notes(p_bgg_name)` 多回兩欄；**`get_my_all_game_notes()` 回傳多 `like_point`、`dislike_point`（`id, bgg_name, content, status, created_at, like_point, dislike_point`；先 drop 再重建）**。（2026-11-02 起 `admin_get_hidden_gathering_notes` 與聚會心得公開欄也有兩欄，見第 19 節。）以上都 `revoke ... from public, anon`＋`grant execute ... to authenticated`。
  - 免費券：`settle_vouchers` 的條件改成 `(g.granted_at at time zone 'Asia/Taipei')::date < s.day_date`（只有「贈送日早於出席日」的贈送券才被自動用）；`loyalty_totals` 沒動（贈送當天就算「可用」）。新函式 `admin_revoke_grant(p_grant uuid)`（刪贈送；若刪後「可用 − 已使用 < 0」丟 `already used` 回滾）、`admin_revoke_redemption(p_redemption uuid)`（只能刪 `used_on is null` 的手動補登）。
  - **`admin_get_auto_sessions(p_user uuid)`** → `played_on date, bgg_name text, source text, created_at timestamptz`（`plpgsql stable security definer`、`search_path=''`；非管理者丟 `not admin`；只回 `game_play_sessions` 裡 `source <> 'manual'`，依日期新到舊；已驗證 anon 無權限、authenticated 有）。
  - **已刪除（無備份）**：`admin_set_game_play_status`、`admin_get_gathering_game_status`、欄位 `gathering_games.play_status`、`get_play_totals()`、`get_rating_counts()`。第 12 節「最常玩榜」「`get_play_totals`」與第 15 節「`get_rating_counts` 現在沒人用」已過時。
- **前端**
  - 新檔：`src/components/MyRatingsPanel.tsx`（`mode: 'score' | 'chart'`；props `boardGames`、`ratings`、`isAdmin`、`adminScores`、`onOpenGame`、`renderCover`；**管理者走 `buildAdminRows`：整體、適合留下來取 `computeAdminScores`，其餘五項取 `likeEmoji`／`playerImpactEmoji`／`communicationEmoji`／`changeEmoji`／`uniqueEmoji` 的字元數，去掉 U+FE0F 與空白、上限 5、0 當沒有，六項皆有才有綜合分數**；一般使用者讀 `ratings.getMine`）、`src/components/NotePointsFields.tsx`＋`src/styles/note-points.css`（`np-*`）、`src/styles/lga-status-list.css`（`lgs-*`）。
  - `MyList.tsx` 的 `StatsTab` 為 `'overview' | 'want' | 'played' | 'score' | 'chart'`，並接 `adminScores?: Map<string, AdminScores>`（`App.tsx` 傳 `adminScores`，型別 `AdminScores = { overall, keep }` 在 `libraryTypes.ts`）。
  - `NoteListItem.tsx` 有選填 `like`、`dislike`（展開後才顯示）；`GameNotesBoard`、`ClubBoard`、`MyNotes`（遊戲留言可就地編輯兩欄）、`AddPlayLog`（勾「同時發表到討論」後才顯示兩顆按鈕並帶 `p_like`／`p_dislike`）都已支援；`useGameNotesBoard.ts` 有 `MAX_POINT_LENGTH = 100`。
  - `LoyaltyAdmin.tsx`：「集點狀況」為清單式（搜尋、VIP 補列、明細在該列下展開、補登／贈送／撤銷）；明細新增「自動記錄的遊玩」（`admin_get_auto_sessions`，`Detail.autoSessions: AutoSession[] | null`，讀取失敗只顯示「讀取失敗」）；聚會管理的「尚未結束」＝聚會日 ≥ 今天，其餘進歷史，**沒有「待確認」徽章與開團狀態 UI**。
  - 已刪除：`src/lib/usePlayTotals.ts`、`src/lib/useRatingCounts.ts`、`lga-list.css` 的 `.lgp-status`／`.lgp-state`。
- **隱私權政策**（`public/privacy.html`，2026-11-01 版，`30fcc6e`）：已補遊玩紀錄手動／自動、留言喜歡／不喜歡的點、自動記錄只有本人與管理者（後台）看得到。

## 18. 2026-11-02 增補（覆蓋前面衝突的敘述）

- 現況與使用者決定見 `QUICKSTART.md` 第 2 節；這裡只留架構與資料庫重點。**本節覆蓋第 4～5 節的「近期聚會」「集點卡」「管理者不加進出席名單」「近期聚會顯示名稱」等說法。**
- **顯示名稱**：導覽列「集點卡」→「集點聚會」（`NavPage` 的 key 仍是 `'loyalty'`）；集點頁分頁「集點卡｜未來聚會」（玩家端；管理者那邊的「預計聚會」沒改）；`privacy.html` 2026-11-02 版。
- **資料庫（皆 `security definer`、`search_path=''`；新函式 `revoke ... from public, anon`，需要的 `grant execute ... to authenticated`）**
  - `gathering_games`：欄位 `gathering_id, bgg_name, created_at, removed_at timestamptz null`；主鍵 `(gathering_id, bgg_name)`，`gathering_id` → `gatherings` on delete cascade。**移除＝設 `removed_at`，重新加回＝清成 null（不能再 insert 同一列）。**
  - 觸發器（`gathering_games`）：`admin_gathering_game_session`（AFTER INSERT → `add_admin_session_from_gathering_game()`）、`admin_gathering_game_session_removed`（AFTER DELETE → `remove_admin_session_from_gathering_game()`，現在只有刪整場聚會才會觸發）、**`admin_gathering_game_session_soft`（AFTER UPDATE OF `removed_at` → `sync_admin_session_on_game_removal()`：從 null 變非 null 刪管理者那筆 `admin_gathering`；變回 null 且聚會日 ≤ 今天補一筆）**。所有觸發器仍不得刪玩家資料。
  - **已移除的遊戲在這些函式被排除（顯示用）**：`get_gathering_detail`（games）、`get_gathering_note_status`、`get_game_play_history`、`save_gathering_note`（`game not in gathering` 檢查）、`add_session_from_rating`（不替已移除的遊戲自動建遊玩紀錄）。**`loyalty_day_status` 刻意仍把已移除的遊戲算進去（點數保留）。**
  - **新函式 `is_admin_user(p_uid uuid)`**（回 boolean，只給資料庫函式內部用，`revoke` 全部角色）；**`loyalty_day_status(p_user)` 對管理者帳號回傳空**（`where not public.is_admin_user(p_user)`）、**`admin_get_loyalty_overview()` 排除管理者**（所以管理者不累積點數、不出現在集點狀況、`settle_vouchers` 不會為他建紀錄）。
  - **新函式 `get_my_game_changes()`** → `gathering_id, gathered_on, title, bgg_name, removed_at`（我出席的聚會裡被移除的指定遊戲，最近 30 天；`sql stable`；權限 `authenticated`／`postgres`／`service_role`，已驗證 anon 無權限）。
  - **僅供參考**：`board_games.reference_only boolean not null default false`；目前為 true 的四款：`Tichu`（地主）、`Werewords`（狼人真言）、`Top Ten`（腦洞量表）、`A Fake Artist Goes to New York`。新函式 `is_reference_game(p_name text)`（內部用）；函式 `block_reference_only_write()` 掛成觸發器：`aa_block_reference_status`（`user_game_status` BEFORE INSERT OR UPDATE：只擋「變成想玩／已玩」，取消可以）、`aa_block_reference_ratings`（`game_ratings` BEFORE INSERT）、`aa_block_reference_notes`（`game_notes` BEFORE INSERT）、`aa_block_reference_sessions`（`game_play_sessions` BEFORE INSERT）；錯誤字串 `reference only game`。**不擋 `gathering_games`、`gathering_notes`。** 這四款原有 8 筆想玩／已玩、2 筆評分仍在資料庫（不刪）。
  - **排除這四款的函式**：`get_community_stats`、`get_game_people`、`admin_get_all_ratings`、`admin_get_want_to_play`、`admin_get_want_to_play_people`、`get_rating_summaries`（玩家評分與管理者 CSV 換算都排除；**但管理者「適合留下來」的 `keep_rank` 仍用完整的玩過清單排名，所以其他遊戲分數不變**）、`get_player_stats`（已玩款數、評過款數、評分明細都排除）。
- **前端（本輪新增檔）**：`src/components/FullScreenPage.tsx`（`open`／`title`／`tag`／`onClose`，portal 到 body，`useBackClose`，層級 1210）、`src/components/ScatterChart.tsx`（共用分布圖：自動框住資料點、滾輪／兩指縮放、拖曳、＋－重設；`ScatterPoint = {x,y,game}`）、`src/styles/fullscreen-page.css`、`src/lib/useLoyaltyAlerts.ts`（回傳 `{count, changes, markAllSeen}`；已讀鍵 `boardgame-seen-attended:<帳號id>`、`boardgame-seen-changes:<帳號id>`；資料來源 `get_my_gatherings` ＋ `get_my_game_changes`；第一次使用把現有全標已讀；只顯示最近 7 天）、`src/styles/lc-months.css`（`lcm-*`）。
- **前端（本輪改動）**：`StatsTables.tsx`／`MyRatingsPanel.tsx`／`Leaderboard.tsx`／`MyList.tsx`（統計表與分布圖走 `FullScreenPage`）；`stats-chart.css`（`.fsp .sc-box` 560px、`.fsp .sc-svg` 最高 62vh）；`NewGatheringWizard.tsx`（見 QUICKSTART 2.2；`useEffect` 用 `supabase.auth.getSession()` 取管理者 id，`allPlayers` 把管理者放最上面，`stepErrors`／`attempted`／`requestClose`／`playersOpen`）；`LoyaltyAdmin.tsx`（`removedGames`、`replacing`、`gameMessage` 狀態，`softRemoveGame`、`addGame` 對已移除的改用 update）；`useLoyalty.ts`、`CheckInDialog.tsx`（讀 `gathering_games` 時加 `.is('removed_at', null)`）；`LoyaltyCard.tsx`（`gameChanges` prop、月份摺疊 `monthToggles`）；`MyList.tsx`（props `alertCount`、`gameChanges`、`onAlertsSeen`；集點卡分頁在有通知時顯示紅色數字；標題「集點聚會」）；`TopBar.tsx`、`UpcomingGatherings.tsx`、`App.tsx`（`loyaltyAlerts = useLoyaltyAlerts(...)`、`loyaltyBadge = planned.unseenCount + loyaltyAlerts.count`、**`statGames = boardGames.filter(g => !g.referenceOnly)` 傳給 `MyList`、`Leaderboard` 與 `clubCount`**；`adminScores` 仍用完整清單算）；`fetchBoardGames.ts`／`libraryTypes.ts`（`LibraryGame.referenceOnly`）；`GameCard.tsx`（僅供參考標籤、沒有想玩／已玩按鈕）；`GameModal.tsx`（`referenceOnly` 只有概覽，`activeTab`）。
- **規則補充**：報到連結名額在前端是「上限 − 出席名單人數（含管理者）」，**`join_gathering` 已核對一致（`gathering_attendees` 總人數 ≥ `capacity` 回 `full`，含管理者與手動加入；`gatherings` 列 `for update` 鎖；只在聚會當天有效；已報到者回 `already`）**；管理者在新增聚會流程裡可以取消自己的勾選；集點聚會的點數仍是 `loyalty_day_status` 即時計算，不是存起來的。
- **下一個 AI 要避開的陷阱**：①`gathering_games` 的 insert 對已移除的列會撞主鍵，要用 update；②改 `loyalty_day_status` 時不要把 `removed_at is null` 加進去（會讓被移除遊戲的得點被收回）；③新增「顯示給人看」的指定遊戲清單一律排除 `removed_at is not null`；④新增統計或榜單函式要記得排除 `reference_only`，前端傳 `statGames` 而不是 `boardGames`；⑤`FullScreenPage` 要讓父層一直掛著、用 `open` 控制（`useBackClose` 才會正確收回歷史）。
- **2026-11-02 下午增補**（覆蓋前面衝突的敘述）：
  - **改名**：導覽列「集點卡」現在叫「集點聚會」（上面第 18 節「顯示名稱」已跟著換；`NavPage` key 仍是 `'loyalty'`；管理中心分頁也是「集點聚會」）。
  - **管理者選指定遊戲排除僅供參考**：`LoyaltyAdmin.tsx` 讀 `board_games` 時多讀 `reference_only`，`GameOption` 多選填 `referenceOnly`；`LoyaltyAdmin`（已建立聚會的指定遊戲搜尋）、`PlannedGatheringsAdmin`（`matches`）、`NewGatheringWizard`（`gameMatches`）的搜尋候選加 `!game.referenceOnly`；`gameNameMap` 仍用完整清單（以前指定過這四款的場次名稱才不會變英文）。資料庫 `gathering_games` 不擋，只是前端過濾。
  - **「測試」開頭場次規則（資料庫，已驗證）**：`add_admin_session_from_gathering_game()`（`gathering_games` AFTER INSERT 觸發器 `admin_gathering_game_session`）讀 `gatherings.title`，`left(coalesce(title,''),2) = '測試'` 就 `return new`；`sync_admin_session_on_game_removal()`（觸發器 `admin_gathering_game_session_soft`）加回補紀錄的條件多 `left(coalesce(v_title,''),2) <> '測試'`；`move_admin_sessions_of_gathering()` 沒改；**`add_session_from_rating()` 刻意沒改**（對所有人一致，其 `gathering_id` 在刪聚會時 set null、不會跟著消失，測試場若用玩家帳號評分要手動刪那筆）。這是為了避免測試聚會讓管理者（james，`fe8a6ab8-970a-4866-bd82-e242ed3b9bf9`）已玩次數誤增；**正式場次名稱不要以「測試」開頭**；測試場日期選明天以後也不會記。刪聚會前先確認已玩次數沒變。
  - **我的評分頁（`dd3bea2`）**：新檔 `src/components/MyRatingsHub.tsx`（props：`boardGames`、`ratings`、`isPlayed(bggName)`、`onBack`、`onClose`、`onOpenGame(game, tab?)`、`renderCover`；自己渲染 `mylist-backdrop`＋`mylist-drawer`，header × 呼叫 `onBack`）、`src/styles/my-ratings-hub.css`（`mrh-*`，元件自己 import）。`MyList.tsx`：`View` 多 `'ratings'`、首頁「我的統計」下方一列「⭐ 我的評分」（`personal.isLoggedIn && !isAdmin`；右邊 `已評分 N・已玩 M`，只有 `ratings.status === 'ready'` 才顯示）、`useBackClose` 原本 `view !== 'home'` 的條件自然涵蓋（返回回首頁）。狀態 `statusOf(mine)`：沒有評分＝`none`、`RATING_FIELDS` 六項皆非空＝`full`、其餘＝`partial`（整體必有值）。清單＝`personal.entries[bggName].played` 或 `ratings.getMine` 有值的遊戲（`MyList` 的 `boardGames` 在 `App.tsx` 是 `statGames`，不含僅供參考與垃圾桶）。排序「修改日期」新→舊、沒日期（未評分）永遠排最後。`useGameRatings.ts`：`MY_COLUMNS` 多 `updated_at`、`MyRating` 多選填 `updatedAt`（`rowToMine` 設值；`saveRating` 回傳後用資料庫回的列更新）。上次修改日期用台北時區（`toLocaleDateString('sv-SE', { timeZone: 'Asia/Taipei' })`）。**管理者看不到這個入口**（管理者評分是 CSV 換算，`MyRatingsPanel` 的 `buildAdminRows`）。
  - **下一個 AI 要避開的陷阱（補）**：⑥新增測試聚會用「測試」開頭名稱；⑦`MyRating.updatedAt` 是選填，新建 `MyRating` 物件（如 `saveRating` 的輸入）不要硬塞；⑧若要在清單裡就地評分，要先處理 `RatingSection` 的集點流程（`needFull`）、`NotePrompt` 與自動 +1 已玩彈窗。

## 19. 2026-11-02 晚增補（覆蓋前面衝突的敘述）

- 現況與使用者決定見 `QUICKSTART.md` 第 2、4、6 節；這裡只留架構、資料庫與規則重點。**本節覆蓋第 17、18 節的「聚會心得公開欄沒有兩欄」「我的評分頁第一版不做就地評分」。**
- **我的評分就地評分（`f693d88`）**：`MyRatingsHub.tsx`（整份改寫）、`my-ratings-hub.css`（整份改寫）、`RatingSection.tsx`（只多選填 prop `beforeSave?: () => Promise<boolean>`，`handleSave` 在 `needFull` 檢查後呼叫，回 false 就不存）。`MyList.tsx` 沒動。範圍切換 `scope`（`played`｜`all`，`statGames`，不含僅供參考）；分類 `FILTERS`（全部／未評分／待補細項／已完整）；搜尋、排序（修改日期／名稱各兩個方向）；每款一張卡片，點開（`openName`，一次一款）就地嵌入 `RatingSection`，集點必填 `needFull`、評分變完整提示、自動 +1 已玩彈窗、VIP 鎖沿用；沒玩過的遊戲儲存前 `askConfirm`（會同時標已玩，仍由既有觸發器與 `App.tsx` 的 `useEffect` 處理）；底下「查看這款遊戲的詳細資料 ›」。遊戲視窗評分分頁保留。**取捨**：展開區含「大家的評分」摘要，卡片偏長。
- **聚會心得與管理者隱藏清單補「喜歡的點／不喜歡的點」（`d70e809`）**
  - 資料庫（使用者已跑並驗證權限只有 `postgres`／`authenticated`／`service_role`，無 `anon`）：`gathering_notes` 新增 `like_point text not null default ''`、`dislike_point text not null default ''`（各有 `char_length <= 100` check：`gathering_notes_like_len`、`gathering_notes_dislike_len`）；`save_gathering_note(p_gathering, p_bgg_name, p_private, p_public, p_like default '', p_dislike default '')`（先 drop 舊四參數版；公開欄空時兩欄一律清成 ''；兩欄皆空且私人公開都空才刪列；`too long` 同時涵蓋 200／100 字）；`get_my_gathering_notes(p_gathering default null)` 回傳多兩欄（先 drop 再建）；`get_public_gathering_notes` 的聚會心得那段改用 `n.like_point／n.dislike_point`（原本是 `''`）；`admin_get_hidden_gathering_notes(p_bgg_name)` 回傳多兩欄（`gathering_notes` 與 `game_notes` 兩段都回）；`delete_my_public_note` 清聚會心得公開欄時兩欄一併清成 ''；`admin_hide_gathering_note` 沒動。
  - 前端（5 檔整份覆蓋）：`GatheringNotePanel.tsx`（`Draft`／`Base` 多 `like`、`dislike`；`effectivePoints()`：公開欄空則兩欄視為空；公開分頁嵌入 `NotePointsFields`，用 `key={cur.bggName}:{pointsTick}` 在切換遊戲與刪除後重新掛載；公開欄空但有填兩欄時顯示提示；「複製到公開／私人」只複製心得文字，不複製兩欄）、`useGatheringNotes.ts`（`MyNote` 多 `likePoint`、`dislikePoint`；`saveGatheringNote` 多選填兩個參數；`useAllMyNotes` 帶出兩欄）、`MyNotes.tsx`（`gpublic` 卡顯示兩欄；刪公開欄傳空的兩欄，刪私人欄原樣傳回公開欄與兩欄）、`useGameNotesBoard.ts`（`HiddenRow` 多兩欄並帶進 `hiddenNotes`）、`GameNotesBoard.tsx`（已隱藏清單用 `np-view` 顯示 👍／👎）。`ClubBoard.tsx`、`NoteListItem.tsx`、`NotePointsFields.tsx`、`GameGatheringNotes.tsx` 沒動。**`NotePointsFields` 的展開狀態只在掛載時依初值決定（`useState(like !== '')`），任何切換資料來源的地方都要用 `key` 重新掛載。**
- **版面微調（`aa007c5`）**：`my-ratings-hub.css`：`.mrh-filters` 為 `display: grid; grid-template-columns: repeat(4, 1fr)`、`.mrh-filter` 高 36px、字級 13px；`<details className="mrh-helpfold">` 包 `mrh-help`，`<summary aria-label="評分說明" title="評分說明" />` 沒有文字、`::before` 畫 ▸／▾、靠左；`.mrh-body { scrollbar-gutter: stable }`。`vip.css` 最底下 `club home: tighter spacing (light) v3`：`.mylist-drawer .club-body .club-more`（上間距 8px，第一個 12px）、`.club-menu-item.club-menu-single` padding 10px 14px、`.club-card`／`.club-who`／`.club-avatar`（44px）縮小、`.club-today` 上間距 12px。**入口列結構（每顆按鈕外包 `<div className="club-list club-more">`）與 `MyList.tsx` 沒動；`mylist.css` 的 `.club-more { margin-top: 18px }` 是原本的間距來源。**
- **樣式地雷（補）**：①給使用者 CSS 修改要附 `Select-String` 驗證，他曾沒存檔卻以為已改；②選擇器要對準實際 DOM（`.club-menu.club-menu-single` 是錯的，按鈕本身同時有 `club-menu-item club-menu-single`）；③「全部桌遊」清單長出捲軸會把內容區擠窄，用 `scrollbar-gutter: stable` 預留。
- **規則助手 RAG 討論（2026-11-02，尚未動工；第 7 節仍是現況）**
  - 使用者：最不滿意「中文問題搜不到」；想要玩到一半用中文問、**網站內直接得到答案**，只根據他提供的規則書、FAQ、過去玩錯紀錄（目前沒有這塊），不從影片找答案；規則書幾乎都是英文文字型 PDF；AI 回答服務「**A（網站後端呼叫 API）為主、B（複製提示詞給自己的 AI）為輔，兩個都可以**」；零 API 費用是偏好，以品質為準。
  - 建議（使用者尚未回「照建議」）：先建測試題庫（旭日戰魂錄＋2 款，各 5 題＋頁碼）量現有命中率，不改程式；再決定中文檢索、向量搜尋（`pgvector`）、AI 回答（候選 Gemini 免費額度，失敗退回 B）；回答附頁碼與原文、證據不足拒答；玩錯紀錄用新表、與官方規則分開標示（例如區分官方規則／已確認裁定／歷史錯誤紀錄／未確認），不可當官方規則；只傳問題與必要規則片段、不傳玩家身分；不建議本機模型（Ollama）。
  - **未驗證**：Gemini API 免費方案條款（另一個 AI 說台灣可用、輸入輸出可能被用於改善產品並可能由人工審查，我沒獨立查證）、額度、規則書片段送出的著作權；動工前先搜尋官方條款，並更新 `privacy.html`。
  - 索引現況：第 7 節的 `rulebook_chunks` 已是同頁切段、有 `page_number`、經 `document_id` 連 `game_documents.bgg_name`，不用先改資料庫；`search_rulebook_chunks` 是英文全文檢索 OR、最多 5 段。
  - 另一個 AI 的後續藍圖（遊玩紀錄中心、智慧選桌遊、揪團、個人化分析、遊戲生命週期分析、導覽重整）只當參考，**全部尚未決定**。
- **使用者新提出的目標（2026-11-02，都還沒動工，都要先討論）**：科普知識（內容放哪、誰寫、綁哪裡未說明）、評論按讚（**推翻「第一版不做按讚」**，要新表如 `note_likes`，`note_id` 對應 `game_notes`／`gathering_notes` 兩個來源，更新 `privacy.html`）、搜尋可用英文（先確認主畫面搜尋是否比對 `bggName`）、遊戲擴充（新表如 `game_expansions`＋Storage 圖片，名稱「(含擴)」若在 `name` 欄可改，**絕不能動 `bggName`**）、長期 FB 二手版整合。細節見 QUICKSTART 第 4 節。
- **下一個 AI 要避開的陷阱（補）**：⑨`NotePointsFields` 切換資料來源要用 `key` 重新掛載；⑩改 CSS 前先 `Select-String` 看實際規則來源，別猜 class；⑪新增以 `bgg_name` 為鍵的表（擴充、按讚的 `note_id` 來源）時，記得第 2 節通則（RLS、`revoke`、`anon` 無權限）與刪帳號連動。

## 20. 2026-11-03 規則助手 RAG 2.0（覆蓋第 7 節與第 19 節 RAG 討論中的衝突敘述）

- **一句話現況（2026-11-03 晚更新）**：切段改版、合併重疊段、SQL 截 1300 字、Q/A 綁定、詞庫、拖曳 OCR 工具都已完成並 push／驗證（`44a411e`）；**尚未啟用任何生成式 AI**；中文詞子字串比對已在資料庫；下一批是文件範圍與中英詞庫（動資料庫前先匯出定義），使用者另提出玩過的勘誤、科普、英文搜尋、擴充等新目標（見 20.13、QUICKSTART 第 4 節）。待確認事項清單在 QUICKSTART 第 4 節。
- 下面各小節編號是原本 `生成後.md` 的 4.x 搬過來；原文裡的「本輪」「上一輪」指 2026-11-03 當天的聊天室。

### 20.1 程式：`4920804`（已 push）

- 檔案：`src/components/RulebookAssistant.tsx`（整份由使用者上傳版本修改）。
- 新增狀態 `lastQuestion`；中文問題 `<textarea>` 加 `onBlur`：問題文字與上次不同時，清空 `keywords`（英文關鍵字）、`chunks`（結果）、`notice`、`error`，並記下 `lastQuestion`。
- 原因：使用者換問題後，英文框仍留著上一題的 `win, victory, attack, combat, battle, tie, tiebreaker`，四題搜出同一段（`RisingSun_v1.2` 第 4 頁 HIRE RONIN），看起來像搜尋壞掉。**搜尋只用英文框的字，中文問題本身不會被搜。**
- 用 `onBlur` 而不是 `onChange`，是避免使用者先貼英文關鍵字、再補問題時被洗掉。
- 使用者已用 `Select-String` 確認 `lastQuestion` 在檔案裡（第 39、169、170 行）；之後三張截圖顯示換題後英文框是空的。Vercel 建置 Ready。
- **待實測**：換題後英文框清空、結果清空；先貼英文關鍵字再補問題不會被洗掉；按「全部加入」「＋ 單字」後再改問題的行為。

### 20.2 使用者新決定（2026-11-03）

- **RAG 2.0 三項決策［使用者決定］**
  1. **募資與個人 AI：兩者並行**。個人 AI 永遠可用；募資用來解鎖網站內的雲端 AI。
  2. **AI Rule Pack：Context 模式**。只提供「必要規則片段＋詞庫＋Prompt」，不提供整本規則書或完整 PDF。
  3. **文件語言：自動辨識＋管理者可以修改**；語言存在**每份文件**上，不存在遊戲上（同款遊戲可同時有英文規則書、中文規則書、FAQ）。
- **功能想法［使用者提出］**
  - 募資構想：網站內建捐款與進度；達到指定金額自動開啟 AI，之後的捐款用於每月 API 費用。
  - 個人 AI 構想：讓 VIP 下載檔案，丟到自己手機或電腦的 AI 帳戶，得到像 Google AI Studio 那樣準的回答，不消耗他的 token。
  - 依文件語言自動產生關鍵字：他輸入中文，系統依上傳規則書的語言（英文、德文、波蘭文等）產生對應語言的搜尋詞。
- **他要的最終樣子（延續 2026-11-02）**：玩到一半用中文問、網站內直接得到答案、只根據他提供的文件、不知道就說不知道、不從影片找答案。
- **回答格式［使用者回「照建議」的三段式，另一個 AI 也採用］**：①【依文件】有原文與頁碼 ②【文件沒寫，AI 推論】標明推論 ③【可能相關，未驗證】不冒充規則。**網站與個人 AI 的提示詞共用這個格式。**
- **使用者對 AI Studio 測試的觀察**：他覺得我指出「福祿壽生兵」那段沒有文件依據很有道理，而且「感覺是對的」，所以要以文件為主、再額外給找不太到的提示。**「感覺是對的」不等於已驗證，要標【未驗證】，確認後才能升級成已確認裁定。**
- 使用者上傳了 `privacy.html`（2026-11-02 版）給我看，**本輪沒改**；RAG 2.0 動工前再更新（見 20.8）。

### 20.3 RAG 2.0 規格摘要（另一個 AI 〔ChatGPT〕寫的完整規格書，使用者要求「依三項決策整理」；全部是規劃，**沒有改程式、沒有執行 SQL**）

**三層產品［使用者決定的方向，細節為 AI 建議］**

| 層級 | 內容 | 費用 |
|---|---|---|
| 免費 RAG | 多語言文件管理、中文轉文件語言搜尋詞、混合式搜尋、原文＋頁碼 | 無 AI API 費用 |
| 個人 AI | Context Pack（問題相關片段＋詞庫＋Prompt），使用者丟給自己的 AI | 使用者自負 |
| 雲端 AI | 網站直接回答（Edge Function 呼叫 Gemini API） | 共同基金支付 |

**模組（［AI 建議］，除標明者外使用者沒逐項確認）**

- **A 文件管理與語言**：`game_documents` 擴充 `language_detected`、`language_override`、`effective_language`（優先順序：管理者指定 > 自動辨識 > 無法辨識要管理者確認）、版本、頁數、索引狀態；`rulebook_chunks` 要保留 PDF 頁碼，**另存印刷頁碼**（兩者可能不同）；切段改以章節標題為主、過長再切、相鄰重疊（`section_title` 目前是空的；同頁內切段、≤ 800 字、不跨頁、已加重疊見 20.11）。
- **B 中文問題轉文件語言**：新表 `game_glossary`（遊戲、來源／目標語言、詞、同義詞、相關詞、是否人工確認）；**相關詞只當搜尋候選，不能當同一個意思**。現況的 `zhEnGlossary.ts` 是前端寫死約 40 組全站通用詞，之後改成每款遊戲各自的資料庫詞庫。第一版只做中文↔英文，穩定後再加日、德、波蘭文。
- **C 混合式搜尋**：PostgreSQL 全文搜尋＋關鍵字＋`pg_trgm` 模糊搜尋＋中文詞庫擴展；之後才加 `pgvector` 向量。**另一個 AI 提議的排序權重（0.40K＋0.30F＋0.20G＋0.10C）只是初始猜測，沒有依據，要用題庫調。**
- **D 個人 AI（Context Pack）**：VIP 提問 → 網站檢索 → 產生 `context.md`（相關原文＋頁碼）、`glossary.md`、`instructions.md`（回答規範）；只給 VIP／管理者；不提供整本；片段長度與比例要設上限；管理者可停用特定文件的外部匯出；下載紀錄只存必要稽核資訊。手機不承諾自動傳到其他 AI App，第一版＝下載、複製、手動上傳。
- **E 募資與雲端 AI**：`ai_fund`、`ai_donations`、`ai_usage_logs`、`ai_settings`（概念名稱）；狀態：未達標＝免費＋個人 AI／已啟用＝再加雲端 AI／預算用完＝自動降回免費。每月 API 預算上限、VIP 每日次數（沿用 30 次）、管理者不限但受總預算限制、單次 token 上限、接近預算通知、API 失敗不扣次數。**API Key 只放 Edge Function secret。**
- **F 權限**：所有 VIP 權限都要在後端驗證，不能只靠前端隱藏；新表照第 2 節通則（RLS、`revoke`、`anon` 無權限）。
- **G 評測**：每次搜尋記 Top 1、Top 3、頁碼準確、可回答、語言擴展是否正確；**四種結果要分開算**：找到正確段落／找到相關但不能回答／完全找不到／內容對但頁碼錯。初始目標（只是門檻不是保證）：Top 3 ≥ 90%、Top 1 ≥ 75%、頁碼 ≥ 95%、引用錯誤版本 0、無依據卻宣稱有答案 0。**詞庫＋混合式搜尋達標就不必急著導入 embedding；搜尋對了但答案仍難懂，才考慮生成式 AI。**
- **UI**：規則助手頁維持現有風格；進階工具區放「我的 AI 規則包」與「雲端 AI／共同支持」；管理者另有規則助手管理頁（文件語言、詞庫、搜尋測試、Context Pack 紀錄、用量、募資預算）。示意畫面不是現有網站。

**Roadmap（另一個 AI 版本，［AI 建議］）**：Phase 0 現況盤點＋15 題題庫 → 1 文件語言與 metadata → 2 詞庫＋混合式搜尋 → 3 Context Pack → 4 免費語意搜尋評估 → 5 募資與雲端 AI。**Phase 0 的「現況盤點」大半我們已知（本節 20.6、20.7），不用重做，缺的是題庫頁碼與另外兩款遊戲。**

### 20.4 與另一個 AI 的建議對照：哪裡我不同意或補充

1. **「先不要綁信用卡、不要急著用 Gemini」**：同意現階段不急（雲端 AI 排最後）。**補充**：未來雲端 AI 一定要用綁計費的專案（付費條款），因為免費版內容可能被拿去改進產品（20.5）。另一個 AI 的規格沒提到這點。
2. **「Supabase `gte-small` 免費 embedding」**：［未驗證］，我沒查。它也自己說多語言能力不能假設；要用中文問題搜英文規則書，必須先實測。
3. **`pg_trgm` 對中文是否有效**：［未驗證］，不要假設。
4. **個人 AI 的 Context Pack 品質＝檢索品質。** 這是它沒講的重點：我在 AI Studio 測得準，是因為 3 份文件整份（約 60 頁）都給了 AI；Context Pack 只給「檢索到的片段」，**檢索漏掉，使用者的 AI 就答不出來或亂答**。所以 Context Pack 要放在題庫命中率達標之後，或至少附一句「若答案不完整，請改用完整文件」（使用者自己的合法文件可自己上傳）。
5. **版權**：另一個 AI 建議只給片段、不給整本，使用者選了這個。**捐款＋提供規則書片段下載放在一起，風險比單純私下檢索高**，使用者先前的決定是「授權風險自行評估」，上線前建議再確認一次（非法律意見）。捐款的金流、手續費、退款、台灣稅務與法律定位**都沒查證**，不要宣稱公益捐款或可抵稅，用「自願支持／共同維護基金」。
6. **「金額一到無條件自動開通」**：另一個 AI 建議改成「系統判斷達標，管理者確認 API 金鑰、預算、隱私條款、測試後才開」。使用者原話是自動開啟，**尚未回覆是否接受確認步驟**。
7. **模型版本與額度會變**，規格裡所有數字（Top 3 目標、每日 30 次）都是起點。

### 20.5 Gemini API 條款與額度查證（我 2026-11-03 搜尋；來源有官方條款頁與第三方整理，標明處）

- **條款頁（`ai.google.dev` Gemini API Additional Terms of Service，頁面標示 Effective April 3rd, 2025）**
  - **未付費額度（含 AI Studio 直接互動）**：Google 會用你送出的內容與回應來提供、改進、開發產品與機器學習技術，**人工審查員可能閱讀、標註、處理**。
  - **付費服務**：不用提示詞（含系統指令、快取、檔案）與回應改進產品。
  - **啟用 Cloud Billing 帳戶後，該專案所有使用（包含原本免費的 AI Studio 與未付費額度）都算付費服務。** Google 論壇的回覆也是這個說法。
  - 歐盟／瑞士／英國：不論免費付費都套用付費條款；**台灣沒有被列入，所以使用者在 AI Studio 免費版上傳的規則書與問題，依條款可能被用於改進產品並被人工審查（已發生的測試）。**
  - **Grounding with Google Search**：在 AI Studio 是免費服務、在 API 是付費服務，另有額度。網站版**預設關閉**。
- **額度：各來源互相矛盾，不能當成保證**。有來源說 2.5 Flash 免費版約 10 RPM／500 RPD；有說約 1,500 RPD；有說 2025 年 12 月使用者回報降到每天約 20 次。額度以專案為單位、以 AI Studio 控制台顯示為準，Google 不再公布固定表（第三方說法）。**不要把免費額度當成網站功能的基礎。**
- **價格（第三方整理，非官方頁）**：2.5 Flash 每百萬 token 輸入 0.30 美元、輸出 2.50 美元（說是 2026-07-02 調整）；快取讀取 0.03 美元；Batch 半價。思考 token 照輸出價計費。
- **我的估算［未驗證］**：一款約 60 頁文字版規則書約 4～6 萬 token，每問一次輸入約 0.015 美元；每天 100 問約 1.5 美元，用快取更低。實際要實測。
- **沒查到／沒保證**：台灣使用 API 是否有地區限制；Google 官方的最新價格與額度頁；中文掃描頁以圖片送入的 token 成本。動工前要再對官方頁確認。
- **結論（［AI 建議］，使用者尚未回「用付費版」）**：正式雲端 AI 用付費版、設 Google Cloud 預算上限與警示；你不傳玩家身分，但規則書全文與問題在免費版可能被審查，與使用者既有隱私底線不合。維持「檢索＋複製給自己的 AI」不需要付費。

### 20.6 旭日戰魂錄測試題庫（暫定，供 Phase 0；**頁碼欄要換成網站索引文件的頁碼，見 QUICKSTART 第 3 節**）

標準答案來自使用者上傳的三份文件，另有一份**玩家整理的卡片清單（署名 Chas，非官方、有錯字，只能當參考，以實體卡為準）**。

| # | 問題（使用者原話） | 標準答案 | 出處（繁中規則書印刷頁／FAQ／波蘭文 Kami 規則） |
|---|---|---|---|
| 1 | 福壽祿（卡名 Fukurokuju，**使用者寫「福壽祿」，卡片與 FAQ 是「福祿壽」**）可以當城堡也可以當大名，他會被殺掉嗎？ | **會。** 「堡壘不能被殺」針對堡壘標記；福祿壽可切腹、戰敗被殺、被大怪獸壓碎。他算大名，所以免疫「鎖定特定模型」的效果（火龍、地龍、弁天），**不免疫針對玩家的效果**（疫鬼、須佐之男、雷神、蛇之道）。 | FAQ 第 3 頁（紅字＝最新）；FAQ 第 1 頁 Daimyo；Chas 清單 |
| 2 | 戰鬥平手的話算誰贏？ | **榮耀高的贏。** 戰力平手、戰爭優勢下注平手、遊戲結束分數平手都比榮耀；分數平手且是盟友則共享勝利。 | 規則書第 7、22、23、25、12 頁 |
| 3 | 天照大神下凡的話，只有那塊地的人受惠，還是該玩家能收到好處？ | **兩件事不能混。** 神殿效果（神明回合）：戰力最高的氏族把榮耀移到最頂端（第 19 頁）。**下凡（Kami Unbound）**：該地區**榮耀最高**的玩家（不一定是祭拜者）的模型不能被其他玩家擊殺，但自己仍可切腹；神明模型 1 戰力、歸神殿戰力最高者控制、平手比榮耀、本身不能被殺。 | 規則書第 19 頁；波蘭文 Kami 規則第 3 頁（**只有波蘭文，我的翻譯，以實體卡為準**） |
| 4 | 除了背叛以外還有其他方法可以解除結盟嗎？ | **規則書只找到：背叛（結盟立即瓦解、背叛者失去榮耀）、下一季茶會開始時上季結盟全部不復存在；冬季結盟不算數。** 其他方式文件沒寫，不能當成「沒有」。 | 規則書第 11、18 頁；FAQ 第 1 頁 |
| 5 | 福壽祿可以生兵嗎？（**文件沒寫的測試題**） | 有依據：招募時每個有你堡壘的地區可招募 1 個單位（第 14 頁）；福祿壽算堡壘（Chas 清單）；他在預備區時可在調度行動「建造」（FAQ 第 3 頁）；魔物卡購買後立即召喚、被殺回預備區可再招募（第 16 頁，對魔物通用）。**AI Studio 回答裡「同一次招募剛落地變堡壘不能多生一隻，因為招募數量以行動開始時的堡壘計算」：三份文件找不到，可能來自網路搜尋，使用者覺得「感覺是對的」，標【未驗證】。** | 規則書第 14、16 頁；FAQ 第 3 頁 |

- **第 6 題（使用者 2026-11-03 提供，「玩錯過的規則」）**：下一個季節的起始玩家是誰？是榮譽最高的玩家嗎？**使用者給的答案：不是榮譽最高，而是上個季節結束後，按遊戲順位的下一個玩家。** ［未驗證］我還沒在英文規則書找到對應段落與頁碼（SETUP 那段 v1.2 第 3 頁結尾斷在 “and play will”，可能與此有關），要先請使用者搜出來再標頁碼；候選關鍵字 `first player, next season`。也當「玩錯紀錄」種子。
- **這題庫的用途**：①量現有搜尋命中率 ②當雲端 AI 與個人 AI 的驗收題 ③第 5 題專門測「文件沒寫時會不會老實說」。
- **詞庫種子（從 FAQ 與規則書圖片確認的對照；使用者的口語要列進同義詞）**：生兵→Recruit／Summon；城堡→Stronghold；大名→Daimyo；信徒→Shinto；武士→Bushi；浪人→Ronin；切腹→Seppuku；綁架人質→Hostage；雇用浪人→Hire Ronin；帝國美詩→Imperial Poets；榮耀→Honor；戰爭優勢→War Advantage；政策行動→Mandate；調度→Marshal；招募→Recruit；採收→Harvest；背叛→Betray；結盟→Alliance；神明→Kami；天照大神→Amaterasu；**福壽祿／福祿壽→Fukurokuju**；七福神→Seven Lucky Gods（清單寫 Lucky God）。茶會的英文名稱［未驗證］。

**現有搜尋的觀察（還沒有正式基準）**

- 使用者換題後沒清英文框，四題都搜到 `RisingSun_v1.2` 第 4 頁 HIRE RONIN，那是舊關鍵字的結果，**不能當命中率**。
- 「戰鬥平手」問題的內建對照表給出 `win, victory, attack, combat, battle, tie, tiebreaker`，搜到的最前面是 `Rising_Sun_FAQ_2.0` 第 1 頁的通則段，不是規則書平手段。**我的解讀［未驗證］**：全文搜尋用 OR，`battle`、`win` 這類常見字讓通則段排前面；字越少越準（建議測 `tie, honor`、`alliance, betray`、`Amaterasu`）。
- 福壽祿、天照、結盟三題的中文詞，內建對照表都沒有對應英文詞（顯示「內建對照表沒有對應的英文詞」）。

### 20.7 文件盤點與資料問題

| 文件 | 狀態 |
|---|---|
| `RisingSun_v1.2`（英文規則書） | 已上傳並索引（已用新切法重傳）；頁序與繁中版不同（HIRE RONIN 在第 4 頁） |
| `Rising_Sun_FAQ_2.0`（英文 FAQ） | 已上傳並索引（已用新切法重傳）；共 4 頁，第 1 頁是通則 |
| `Rising_Sun_Rulebook_Traditional_Chinese.pdf`（13.9 MB，繁中規則書） | 原檔**沒有文字層（圖片版）**，直接上傳會 `NO_TEXT`。**已用 OCRmyPDF 做成 `_OCR.pdf` 並上傳成功（20.12）** |
| `Rising_Sun_One-Sheet_v6.pdf` | 上傳失敗（`NO_TEXT`，圖片版）；是否做英文 OCR 未決定 |
| `Rising-Sun-Zstapienie-Kami-Instrukcja.pdf`（波蘭文 Kami Unbound） | 只丟進聊天，**不確定有沒有上傳到網站**；波蘭文 → 現有英文全文檢索搜不到、也沒有英文版；要進題庫得有英文版或支援多語言檢索 |
| 玩家整理卡片清單（Chas） | 只丟進聊天，非官方、有錯字；**若要進網站，必須標「玩家整理」來源類型，不能和官方規則同等** |
| 羅倫佐主遊戲＋擴充（英文） | 已上傳（舊切法，要重傳），見 20.12 |

- **頁碼陷阱**：題庫頁碼要用被索引那份的頁碼；PDF 頁序與印刷頁碼可能不同（另一個 AI 也提到），索引要同時存兩者。
- **現有索引限制**：`search_rulebook_chunks` 是英文全文檢索 OR、最多 5 段；中文規則書即使有文字也搜不好（中文沒斷詞）；`rulebook_chunks` 不存語言（語言在 `game_documents.language`，只是顯示標記）。
- **現況沒變的限制**：上傳的 PDF 只給檢索、不公開；規則助手只給 VIP／管理者；每日次數 VIP 30、管理者不限；不存問題內容。（「第一版不做 OCR」指網站內不做 OCR；使用者在自己電腦做 OCR 再上傳。）

### 20.8 隱私政策待辦（`privacy.html`，2026-11-02 版仍有效）

動工前才改；到時要寫明：①（雲端 AI）問題與必要規則片段會送到 Google Gemini API，不含玩家身分，並說明供應商與是否用於訓練；②（Context Pack）下載紀錄只存必要稽核資訊；③（捐款）金流資料、紀錄、退款；④規則書內容送到外部 AI 的風險與管理者可停用匯出。**現行第四節「規則助手…複製」的文字只涵蓋使用者主動複製，雲端 AI 啟用後要改。**

### 20.9 這個聊天室裡 AI 出過的錯（下一個 AI 不要重犯）

1. 天照：我先答成神殿效果，使用者問的是「下凡」；兩者效果完全不同，神殿＝戰力最高氏族受惠，下凡＝該地區榮耀最高者受保護。
2. 福祿壽：我先說「戰敗會不會死不確定」，FAQ 第 3 頁其實寫得很清楚（會被殺）。**這份 FAQ 與規則書的頁碼不要憑印象，要讀文件。**
3. 說繁中規則書是「掃描版」過早，原因未驗證（後來確認是沒有文字層）。
4. 把玩家整理的卡片清單當規則引用，沒先標來源；網站版必須標來源類型。
5. 我答案裡的外部細節與 AI Studio 的網路搜尋內容混在一起不標來源，是網站版最該避免的事：**關閉搜尋、只用文件、三段式標示、引用頁碼要自動檢查是否存在。**

### 20.10 下一個 AI 要避開的陷阱（補）

①題庫頁碼必須對應「被索引的那份文件」，不是使用者手上的另一個語言版本；②不要假設 `pgroonga`、`pg_trgm`、`gte-small` 對中文或中英跨語言有效，先在題庫上實測；③改 `search_rulebook_chunks` 或其他函式前，先請使用者匯出現有定義（`pg_get_functiondef`）；④新表照第 2 節通則（RLS、`revoke`、`anon` 無權限）；⑤雲端 AI 的 API Key 不放前端、不要請使用者貼 Key；⑥不要在使用者還沒回覆「付費版」「自動開啟 vs 管理者確認」前寫任何捐款或 Edge Function 的程式；⑦另一個 AI 的整包規格與使用者既有決定（零 API 費用優先、規則 PDF 不公開、授權風險自行評估）要逐項對照，不要照單全收；⑧使用者的口語名稱（福壽祿、生兵、下凡、城堡）與規則書用詞不同，詞庫要收同義詞。

### 20.11 2026-11-03 下午：切段改版、單字測試、題庫、OCR、文件範圍

**程式（`f66b776` 已 push）**
- `src/lib/extractPdfText.ts` 整份覆蓋（由 AI 生成、CRLF）：`itemsToLines` 不變；新增 `linesToUnits`（把被換行拆開的行接成句子；全大寫短行＝標題、`Q:`／`A:` 另起一段；中日文之間不補空格）→ `splitSentences` → `chunkUnits`（依句子邊界切，每段 ≤ 800 字，`OVERLAP_CHARS = 150`、單一重疊句 ≤ 300 字；仍不跨頁；單句超過 800 字才硬切；重疊再加這句仍太長就放棄重疊）。`PdfExtractError`、`NO_TEXT` 與 `MAX_CHUNKS = 3000` 規則沒動。**切段是在上傳時（瀏覽器）做的，所以既有文件要刪掉重傳才會用新切法。**

**搜尋函式現況（使用者貼回 `pg_get_functiondef`，2026-11-03）**
- `search_rulebook_chunks(p_bgg_name text, p_query text)`：回傳 `doc_id, doc_title, doc_kind, doc_lang, page_number, section_title, content, score`；`plpgsql`、`security definer`、`search_path=''`。流程：驗 `is_vip()`（否則 `NOT_VIP`）→ 查詢字串取前 200 字、空的丟 `EMPTY_QUERY` → advisory lock → 刪 7 天前紀錄 → 非管理者今日已用 ≥ 30 丟 `DAILY_LIMIT` → `plainto_tsquery('english', …)` 再把 ` & ` 換成 ` | `（OR）→ 先檢查有沒有任何符合的段落，沒有就 `return`（不扣次數）→ 寫 `rulebook_search_log` → 回傳 `ts_rank_cd` 排序前 5 段，`left(c.content, 800)`。**沒有任何去重或合併相鄰段的處理。**

**單字搜尋結果（舊切法的索引；單字搜尋，10 張截圖）**
| 關鍵字 | 第 1 名 | 判定 |
|---|---|---|
| `Fukurokuju` | FAQ_2.0 第 3 頁（可被殺，斷在 “Note that, as a”） | 命中，但句子斷掉 |
| `tie` | 同一段 FAQ 第 3 頁（猴之道、和平主義者、福祿壽） | 雜訊，不是戰鬥平手 |
| `honor` | v1.2 第 3 頁 HONOR（任何平手，榮耀高者勝） | 命中通則 |
| `battle` | FAQ_2.0 第 1 頁 通則（Start/Part of a Battle…） | 相關但不是平手 |
| `stronghold` | v1.2 第 3 頁 Marshall（建造堡壘） | 相關，不是 Recruit |
| `alliance` | v1.2 第 3 頁 TEA CEREMONY | 命中 |
| `betray` | v1.2 第 4 頁 betray | 命中 |
| `Amaterasu` | v1.2 第 4 頁（神殿效果） | 找到的是神殿效果，**不是下凡** |
- 前一輪已確認的對應（使用者核對）：福祿壽＝是（FAQ 第 3 頁）、結盟＝本季有效、下季重結、Betray 可拆、平手（`tie, honor, battle`）＝v1.2 第 4 頁 BATTLE OUTCOME 排第 5、天照＝神殿效果。**生兵那組使用者沒確認關鍵字；他說中文規則書裡「生兵」是「招募」（Recruit）、`stronghold` 是「城堡」，詞庫要收：生兵→Recruit／Summon、城堡→Stronghold。**
- 基準（舊切法）：Top 1 命中 2 題（福祿壽、結盟）；進 Top 5 但要拼段或排名差 2 題（平手、生兵）；不可能命中 1 題（天照下凡：下凡屬於**擴充**，主遊戲英文文件本來就沒有）。
- 上輪我說「福祿壽下一段有大名免疫鎖定效果」是錯的：下一段是「作為堡壘可在調度行動建造」；大名免疫那句不在兩份官方英文文件裡，只在 Chas 玩家清單（**但繁中 OCR 規則書可能有，見 20.12 訂正**）。

**題庫新增**
- **旭日第 6 題**：見 20.6。
- **卓越的羅倫佐（Lorenzo il Magnifico）英文文字版規則書已上傳**，使用者提供 4 題（使用者原話）：①三個顏色的骰子可以放在同一座塔嗎？②額外骰子點數是多少點呢？③一個格子只能站一個人嗎？④我要怎麼增加點數？
- 第三款遊戲尚未決定。

**文件範圍（擴充規則）：使用者 2026-11-03 提出，之後回「照建議」**
- 使用者觀察：許多遊戲有「主遊戲規則」與「擴充規則」，他只上傳了主遊戲規則書（網站上叫「旭日戰魂錄（含擴）」），所以問擴充內容（下凡）時只會搜到主遊戲的神殿效果。**這很重要，要排進設計。**
- 設計想法（AI 建議，使用者已回「照建議」）：與「語言存在每份文件」一致，**「範圍」也存在每份文件**：`主遊戲`／`擴充（附擴充名稱，例如 Kami Unbound）`／`FAQ／勘誤`／`玩家整理`；回答要標明依據哪份；問題涉及擴充、但該款沒有擴充範圍的文件時，直接回答「這題屬於擴充規則，目前沒有收錄擴充規則書」，不拿主遊戲規則充數；規則衝突優先序預設為「勘誤／FAQ 最新版 > 擴充 > 主遊戲」，兩邊都列出。建議排在切段與搜尋改進之後、詞庫之前。資料庫要擴充 `game_documents`（新欄位如 `content_scope`、`expansion_name`），動工前先匯出現有定義與 RLS。

**下一個 AI 要避開的陷阱（補）**
⑨改了切段程式後，**既有索引不會自動更新**，必須刪掉文件重傳；測試前先確認結果段落真的換成新切法（開頭不再是句子中間）；⑩給 OCR 步驟前先確認使用者的實際路徑與環境（見 20.12 ⑮）；⑪「下凡」「擴充」類問題要先判斷有沒有對應文件，沒有就老實說，不要拿主遊戲規則套用；⑫使用者貼來的另一個 AI 的 OCR 建議只當參考，不要把它的措辭當成使用者的決定。

### 20.12 2026-11-03 晚（換聊天室前最後一輪）：切段改版驗證、OCR 完成、合併重疊段、羅倫佐、陷阱

**切段改版（`f66b776`，已 push；git log 最上面是 `(HEAD -> master, origin/master)`）驗證結果：有效**
- 旭日兩份英文文件重傳後：福祿壽 FAQ 那段完整（含 “as a Stronghold, Fukurokuju can be ‘built’ during a Marshal Mandate”）；Recruit 那段完整（含「召喚數量等於堡壘數」）；每段都在句號處結束。
- **副作用（預期中）**：相鄰段有重疊，搜尋前 5 名會被「前一段的結尾」佔掉名額（例：搜 `Fukurokuju` 第 2 段只有問題沒有答案；Dragonfly 的兩段互相重疊）。資料庫仍回 5 段，**合併後可能只剩 3～4 段**；要多撈需改 `search_rulebook_chunks` 的 `limit`（留到中文檢索批次）。
- 規則書的項目符號被讀成私有區字元（顯示成方框／亂碼）、標題字體讀成 `m onste R Pa CK`、`DragonflFly`：是 PDF 字型問題，切段救不了；項目符號可之後在 `itemsToLines` 把 `[\uE000-\uF8FF]` 換掉（要重傳才生效，**這次沒做**）。

**合併重疊段（進行中，A 方案，已 build 未 push）**
- 新檔 `src/lib/mergeChunks.ts`（AI 生成，已用 Node 測過合併邏輯）：`mergeOverlappingChunks<T>(chunks)`——同 `doc_id`、同 `page_number`，一段的結尾＝另一段的開頭（至少 20 字）就合成一段（`content` 相接、`score` 取較高、順序依最早出現者）；被包含的段落直接吞掉；跨頁或跨文件不合併。
- `src/lib/useRulebookSearch.ts` 只改兩處：加 `import { mergeOverlappingChunks } from './mergeChunks'`；最後的 `return { chunks: mergeOverlappingChunks((data ?? []) as RulebookChunk[]), error: '' }`。使用者用 `Select-String` 確認兩處都在（第 2、50 行），`npm.cmd run build` 通過（`✓ built in 1.73s`）。
- **尚未實測、尚未 push。** 實測：旭日 `Fukurokuju` 應只剩 1 段完整的；`recruit` 的 Dragonfly 兩段合成一段；結果數可能少於 5。
- **`useRulebookSearch.ts` 的中文錯誤訊息（`DAILY_LIMIT` 等）在 PowerShell 顯示成問號：只是終端機編碼，不代表檔案壞掉（［未驗證］）。不要拿終端機輸出當底去整份覆蓋這個檔。**

**羅倫佐（Lorenzo il Magnifico）題庫：英文文件已上傳，4 題都找得到答案（舊切法的索引；頁碼是網站索引的）**
- 文件：`Lorenzo_Il_Magnifico_-_A_Plain_and_Simple_Guide`（主遊戲）、`Lorenzo_il_Magnifico_+_Expansion_and_Leaders_Quick_Rules_Guide`（擴充：House of Renaissance、Leaders）。
- ①三個顏色的骰子能放同一座塔嗎？→ Guide 第 3 頁：每座塔每位玩家只能有 1 個**有色**家族成員，無色的不算這個限制，有色＋無色可以同塔；塔裡已有人要先付 3 金幣。（那段被舊切法腰斬。）
- ②額外骰子（無色／中立）的點數？→ Guide 第 2 頁、Expansion 第 1 頁：基礎點數 0，每個僕人 +1。
- ③一個格子只能站一個人嗎？→ Guide 第 3 頁：一般行動格只能放 1 個家族成員；例外：收穫／生產的右側格可放任意數量（但 −3），議會大廳那段在結果裡被切斷，**尚未看到完整句子**；擴充領袖 Ludovico Ariosto 可放在已佔據的行動格。
- ④怎麼增加點數？→ （假設是行動點數）僕人 +1、發展卡「增加行動點數」加成（Guide 第 2、4 頁）、擴充領袖 Lucrezia Borgia 讓有色成員 +2（Expansion 第 5 頁）。**使用者尚未說明問的是哪種點數。**
- **以上是 AI 依英文原文的整理，［未驗證］，要請使用者對照。**
- 發現：問基本規則時，搜尋結果混進擴充的領袖卡與「House of Renaissance」特殊塔，使用者看不出哪些是擴充才有的規則，**證明文件範圍標示的必要**；這兩份文件目前是舊切法，**要刪掉重傳**。

**繁中規則書 OCR：已完成並上傳**
- 原檔 `Rising_Sun_Rulebook_Traditional_Chinese.pdf`（約 13.9 MB、圖片版、沒有文字層；Chrome 開啟時顯示「正在擷取 PDF 檔的文字…」）。用 OCRmyPDF 辨識後 `_OCR.pdf` 約 14.3 MB、28 頁不變；Edge 搜「背叛」顯示 11 筆。
- 上傳網站後顯示「完成」。**辨識品質**：一般內文可用（偶有錯字，如「再炊進行結盟」應為「再次」、「一殲此景設定」應為「一款背景設定」）；側欄與裝飾區會亂（例如「大名」那段混進 “RULEEB”、「伸上板塊來林昔撞朋銜」），順序也亂。**OCR 文字只能用來幫忙找到那一頁，最後一定要回原頁面核對，之後要在介面標「OCR 辨識文字」（資料庫與前端都還沒做，現在靠檔名 `_OCR` 分辨）。**
- **訂正舊說法**：20.6 題 1 與先前我說的「大名免疫鎖定效果只出現在 Chas 清單」不精確——OCR 文字顯示官方繁中規則書也有「大名不會被抓去當人質、不會在背叛行動中被移除、同時免疫各種特殊效果，例如魔物的擊殺模型能力」［OCR 文字，待對原頁確認，頁碼未知］。
- **中文搜尋目前不可能**：前端（`RulebookAssistant.tsx`）在只有中文時直接擋下並顯示「規則書是英文，搜尋框請放英文關鍵字」；資料庫 `search_rulebook_chunks` 用 `to_tsvector('english')`，中文沒有斷詞。我的規劃（B 方案，［未實測］）：中文詞用子字串比對（`ILIKE`，資料量小），把中文問題切成 2 字詞、多詞同時比對以容忍 OCR 錯字；要改函式與前端，先匯出定義。

**OCR 環境與指令（使用者的電腦：Windows 10，系統顯示已終止支援；`winget` v1.29.380；原本就有 Python 3.14.7）**
- 已安裝：Tesseract（`UB-Mannheim.TesseractOCR`，安裝在 `C:\Program Files\Tesseract-OCR`，內建只有 `eng`、`osd`）、Ghostscript 10.08.0（手動安裝在 `C:\Program Files\gs\gs10.08.0`，不在 PATH，OCRmyPDF 自己找得到）、`ocrmypdf` 17.13.0（`python -m pip install ocrmypdf`，用 `python -m ocrmypdf` 執行，pip 的 PATH 警告可忽略）。
- 繁中語言包：`D:\tessdata\chi_tra.traineddata`（12,985,735 位元組，來自 `https://github.com/tesseract-ocr/tessdata_best/raw/main/chi_tra.traineddata`）。**還要把 Tesseract 的設定檔複製過去，否則出現 `Can't open hocr`**：`Copy-Item "C:\Program Files\Tesseract-OCR\tessdata\configs" "D:\tessdata\configs" -Recurse -Force`、`Copy-Item "C:\Program Files\Tesseract-OCR\tessdata\tessconfigs" "D:\tessdata\tessconfigs" -Recurse -Force`。
- **每次開新 PowerShell 視窗都要先** `$env:TESSDATA_PREFIX = "D:\tessdata"`，再執行：`python -m ocrmypdf -l chi_tra --skip-text --output-type pdf --jobs 2 "輸入.pdf" "輸出.pdf"`（輸入輸出檔名不可相同）。輸出裡一大堆 `chi_tra_vert` 錯誤是警告（找不到直排語言包），橫排辨識照常完成。
- 英文 OCR：要把 `C:\Program Files\Tesseract-OCR\tessdata\eng.traineddata` 複製到 `D:\tessdata`（或另開一個沒設 `TESSDATA_PREFIX` 的視窗），再用 `-l eng`；**這步沒做過**。
- **回家裡電腦要重做這些環境**（使用者交代）：`winget install -e --id Python.Python.3.12`（若已有新版 Python 可略）、`winget install -e --id UB-Mannheim.TesseractOCR`、手動安裝 Ghostscript 64 位元（ghostscript.com）、建立 `D:\tessdata` 放 `chi_tra.traineddata` 並複製 configs／tessconfigs、`python -m pip install ocrmypdf`、每次設 `TESSDATA_PREFIX`。使用者要求換電腦時把這份清單整理給他。
- 規則書 PDF 都放在**專案外**的 `D:\rulebooks\`（子資料夾 ayar、bable、brass birmingham、heart of crown、KANBAN EV、kemet、Lorenzo、mansion of madness、rising sun、Shackleton Base、skymines、Undaunted 2200、新幕 桜降る代に決闘を 基本セット，與根目錄的 OCR PDF）；專案 `.gitignore` 加了 `rulebooks/`（保險，原本曾放在專案資料夾裡）。**規則書 PDF 有版權、使用者決定不公開，絕不能 `git add`。**
- 使用者問過 iLovePDF（線上 OCR）能否代勞：我的結論是不建議（本機已成功、免費、不外傳；第三方網站的免費額度、大小限制、繁中品質都沒查證；上傳有版權檔案的風險由使用者自行評估）。

**使用者決定（2026-11-03 晚）**：OCR 走自己電腦的 OCRmyPDF（不用線上服務）；文件範圍照建議；先做「合併重疊段」（A）再考慮「中文檢索」（B）；規則書放專案外；沒有回覆雲端付費版與募資自動／確認。

**下一個 AI 要避開的陷阱（補）**
⑬**PowerShell 的 `Get-Content` 顯示中文會亂碼**（編碼問題），不要拿輸出覆蓋檔案；要改有中文的檔，用 VS Code 或先 `[Console]::OutputEncoding = [System.Text.Encoding]::UTF8`、`Get-Content -Encoding UTF8`；盡量只給唯一的 `Ctrl + F` 字串做局部修改。
⑭**`.gitignore` 疑似有黏行**：`git diff .gitignore` 顯示既有一行是 `.env.localboardgames.csv`（`.env.local` 與 `boardgames.csv` 黏在一起，少了換行；`Add-Content` 加上 `rulebooks/` 後這行沒變）。**要請使用者確認** `git check-ignore -v .env.local boardgames.csv`；沒被忽略就修成兩行（`.env.local`、`boardgames.csv`）。`.env.local` 含 Publishable key，雖非 Secret，仍不要被 commit。
⑮上一輪 AI 犯過的錯：以為規則書在專案外（其實原檔曾在專案資料夾的 `rulebooks\`）、以為使用者沒裝 Python（其實有 3.14.7）、只講語言包沒講 `configs` 導致 `Can't open hocr`、給的 OCR 步驟沒先確認檔案位置。接手時**先請使用者貼實際路徑與 `Get-ChildItem` 結果，再給指令**。
⑯AI 的容器有 `tesseract` 但只有 `eng`、`osd`，**沒有繁中語言包且沒有網路，無法替使用者辨識中文 PDF**。
⑰搜尋結果合併只是前端顯示用，不能取代「改 `limit` 多撈」；改 `search_rulebook_chunks` 前要重新匯出定義（`select pg_get_functiondef('public.search_rulebook_chunks(text,text)'::regprocedure);`）。
⑱新切法只對**新上傳**的文件生效；每次改 `extractPdfText.ts` 後，舊文件都要刪掉重傳，測試前先看結果段落是不是從句子開頭開始、沒有硬換行。
⑲使用者貼來的另一個 AI 的 OCR 建議（「我會建議你選方案 1…等你提供電腦規格」）是別人的措辭，不是使用者的決定；使用者自己的決定在上面。
⑳**聊天室額度會在工作中途用完**：寫到 `/mnt/user-data/outputs` 的檔案換聊天室後可能不見（這次就是），更新文件時要同時寫進 Projects 的 `生成後.md`，並用 `SendUserFile` 交給使用者。

### 20.13 2026-11-03 晚（換聊天室前）：驗證結果、OCR 實測、換電腦清單、新目標（覆蓋 20.11／20.12 的衝突敘述）

**程式與資料庫現況**
- git：`44a411e`（Q/A 綁定、詞庫補充、無文字提示、OCR 拖曳工具）已 push，build 通過（`✓ built in 3.41s`）。合併重疊段（`mergeChunks.ts`、`useRulebookSearch.ts`）早在 `6b02585` push（20.12 寫「已 build 未 push」已過時）。
- **`search_rulebook_chunks`**：回傳改 `left(s.content, 1300)`（使用者執行 SQL，驗證 `position('1300' in pg_get_functiondef(...)) > 0` 為 true）；其餘不變（`limit 8`、中文子字串比對、英文 OR）。旭日 FAQ_2.0 第 3 頁福祿壽那段現在完整，含 `A: Yes. ... Note that, as a Stronghold, Fukurokuju can be "built" during a Marshal Mandate, if you have him in your reserve.`（結尾後的 `m onste R Pa CK` 是 PDF 字型雜訊）。**下次改這個函式前仍要請使用者重新匯出現有定義。**
- `extractPdfText.ts`（使用者本輪上傳最新版）的 `NO_TEXT` 門檻：總字數 < 200 或「有 ≥ 20 字的頁數 / 總頁數」< 0.3 才擋；**部分頁面是圖片、文字層亂碼、OCR 品質差都抓不到**。［AI 建議，未動工］上傳時逐頁統計字數接近 0 的頁碼，顯示「第 N、M 頁沒有文字，這幾頁搜不到，要不要先 OCR」，只提醒不阻擋、網站內不做 OCR；要改 `extractPdfText.ts` 與 `RulebookBatchUpload.tsx`（使用者也上傳過），動工前請他重新貼。
- 規則書項目符號被讀成私有區字元（方框）：要在 `itemsToLines` 把 `[\uE000-\uF8FF]` 換成 `- `，需重傳才生效，**還沒做**。

**拖曳 OCR 工具（`tools/ocr/ocr_zh.bat`、`ocr_en.bat`）實測**
- `ocr_zh.bat`＝`chi_tra+eng`（中文或中英混合）；`ocr_en.bat`＝`eng`（純英文掃描版）。設定 `TESSDATA_PREFIX=D:\tessdata`，執行 `python.exe -m ocrmypdf -l <語言> --skip-text --output-type pdf --jobs 2`，可一次拖多個 PDF，輸出 `原檔名_OCR.pdf` 在原檔旁、不覆蓋原檔。
- 第一次失敗：`.bat` 用 `C:\Users\User\AppData\Local\Programs\Python\Python312\python.exe`（3.12），`ocrmypdf` 卻裝在 3.14 → `No module named ocrmypdf`；已對 3.12 補裝（17.13.0）。**教訓：`.bat` 用哪個 Python，`ocrmypdf` 就要裝在哪個。**
- 成功：`D:\rulebooks\skymines\天際礦脈_水印.pdf`（38 頁）→ `[DONE]`；`chi_tra_vert` 找不到的紅字只是警告；第 3、5、6、7 頁有 `lots of diacritics - possibly poor OCR`。使用者回報後續驗證與上傳「沒有問題」。
- `D:\tessdata` 已確認有 `configs`、`tessconfigs`、`chi_tra.traineddata`（12,985,735 位元組）、`eng.traineddata`（4,113,088 位元組）。**這些語言包在專案外，不 push；push 的只有兩個 `.bat`。**
- **使用者問答（AI 回答，供參考）**：OCR 只加隱形文字層，檔案只會一樣大或稍大（繁中規則書 13.9 → 14.3 MB），不會變小；文字版 PDF 直接上傳、不要 OCR；單檔上限 50 MB、15 MB 以上只提醒，目前不需壓縮；要縮小先找出版商 Lo-res／Compact 版，其次本機 Ghostscript，**不建議線上壓縮站**（版權外流風險；有些會把每頁轉圖，文字層消失→上傳變 `NO_TEXT`）；順序**先壓縮再 OCR**，OCR 完不要再壓縮。邊玩邊傳、一份一份來，不必一次收集。我的容器沒有繁中語言包、沒網路，不能代跑 OCR。

**換電腦（家裡）重做 OCR 環境清單（使用者要求寫進文件）**
原則：不要搬檔案，各電腦自己準備；Git 只同步兩個 `.bat`。
1. 安裝（第一次）：Python（`winget install -e --id Python.Python.3.12`，已有新版可略，**但要記得 `.bat` 用哪個**）、Tesseract（`winget install -e --id UB-Mannheim.TesseractOCR`，內建只有 `eng`、`osd`）、Ghostscript 64 位元（ghostscript.com 手動安裝，不在 PATH 也行）。
2. 建立 `D:\tessdata`（磁碟或路徑不同就用記事本改 `.bat` 裡 `TESSDATA_PREFIX=D:\tessdata` 那行）。
3. 放入語言包：`chi_tra.traineddata` 從 `https://github.com/tesseract-ocr/tessdata_best/raw/main/chi_tra.traineddata` 下載；`eng.traineddata` 從 `C:\Program Files\Tesseract-OCR\tessdata\` 複製。
4. 複製設定資料夾（少了會 `Can't open hocr`）：`Copy-Item "C:\Program Files\Tesseract-OCR\tessdata\configs" "D:\tessdata\configs" -Recurse -Force` 與 `tessconfigs` 同樣做一次。
5. 對 `.bat` 裡寫的那個 `python.exe` 執行 `"<完整路徑>" -m pip install ocrmypdf`（pip 的 Scripts 不在 PATH 警告可忽略）。
6. 驗證：`Get-ChildItem D:\tessdata` 要有 `configs`、`tessconfigs`、`chi_tra.traineddata`、`eng.traineddata`；`git pull` 後把小 PDF 拖到 `tools\ocr\ocr_zh.bat`，最後要 `[DONE]`。
7. 日常：規則書 PDF 放專案外 `D:\rulebooks\`、絕不 `git add`；辨識完先用瀏覽器 `Ctrl + F` 確認有文字層再上傳；OCR 文字只幫忙找頁，一律回原頁核對。

**使用者新提出的目標（2026-11-03 晚，全部尚未動工；完整與 AI 建議在 QUICKSTART 第 4 節第 2 項）**
1. **玩過的勘誤**：手動上傳勘誤檔或文字，規則助手可搜尋，遊戲詳細資料可查看。**現有 `game_documents.doc_type` 已有 `errata`，PDF 勘誤可走現有上傳；文字勘誤要新表（［AI 建議］`game_errata`，欄位含出處與狀態 `official`／`confirmed`／`unverified`），搜尋結果與規則書分開標示，不可與官方規則同等。** 和 20.3 的「玩錯紀錄」是同一件事；旭日第 6 題是種子。寫入只有管理者、RLS、`revoke`、更新 `privacy.html`。
2. **科普知識**：內容位置、作者、綁定對象、是否公開都未說明，要先問。
3. **主畫面搜尋可用英文**：先請使用者貼 `App.tsx` 的搜尋過濾，確認是否比對 `bggName`；不動資料庫。
4. **遊戲擴充**：詳細資料新增擴充區塊（名稱＋圖片）、封面「含擴充」提示、名稱拿掉「(含擴)」；**不可動 `bggName`**；新表＋Storage；名稱最好與規則助手文件範圍的 `expansion_name` 共用同一份擴充清單。
5. **最後請 ChatGPT 美化畫面**：功能凍結後再做；給 ChatGPT 的限制見 QUICKSTART 第 4 節（不改 CSV 欄名與 key、不調換 `@import` 順序、遵守視窗層級與手機導覽列規則、只改樣式不改結構、一次一頁）。

**下一個 AI 要避開的陷阱（補）**
㉑換電腦或新增 OCR 工具時，先確認 `.bat` 用的 Python 與 `ocrmypdf` 安裝位置一致；㉒勘誤、擴充、按讚都會動資料庫，動工前先匯出現有定義與 RLS；㉓勘誤與玩家整理資料必須標來源類型，不能和官方規則混在同一層回答；㉔使用者的口語（福壽祿、生兵、下凡、城堡）與規則書用詞不同，詞庫要收同義詞；㉕美化階段不要讓 ChatGPT 一次改多個檔案或改類別名稱（JS 依賴的 class、動態拼接的 `rb-${status}` 等會壞）。
