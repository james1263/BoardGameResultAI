# 桌遊規則助手（BoardGameResultAI）— 專案交接文件（精簡版）

> 給接手的 AI 閱讀。**請先讀 `QUICKSTART.md`（懶人包），再讀本文件。**
> 最後更新：2026-10-26。這一版把已完成的功能整理成「依主題」的紀錄（取代舊的 A～Q 附錄），內容與決定不變；日期與細節若與 `QUICKSTART.md` 衝突，以 `QUICKSTART.md` 為準。

## 1. 專案簡介

- **名稱**：桌遊規則助手（BOARD GAME COMPANION）；網站已上線 https://board-game-result-ai.vercel.app/
- **目標**：桌遊收藏與規則查詢網站，最終能詢問 AI 解決規則爭議（AI 規則助手是最重要的長期目標，見第 9 節）。
- **使用模式（重要）**：網站**公開瀏覽，也開放訪客問 AI，但只有使用者本人（管理者）能編輯**（匯入 CSV、上傳封面、管理聚會）。訪客不能更動內部設定。
- **資料量**：107 款桌遊（使用者在 Notion 整理後匯出 CSV）。使用者的朋友圈是主要玩家，保留讓其他人加入的可能。
- **本機路徑**：`D:\BoardGameResultAI`（Windows、PowerShell、用 `npm.cmd`）；使用者會在多台電腦作業，見第 11 節。

## 2. 技術架構與部署

- 前端：React + TypeScript + Vite。後端：**Supabase（免費方案，首爾）**，提供資料庫、登入（Google）、Storage。專案 ID `hgeuockbjrzayfdylavq`，Project URL `https://hgeuockbjrzayfdylavq.supabase.co`（給前端的是**根網址**，不加 `/rest/v1/`）。前端只用 **Publishable key**；**Secret／service_role key 絕對不能放進網站或貼給任何人，目前完全沒用到。**
- 部署：GitHub → Vercel，**正式分支 `master`**，push 後自動建置；其他分支只產生預覽。
- 環境變數：本機 `.env.local`（不在 Git 裡）與 Vercel 後台都有 `VITE_SUPABASE_URL`、`VITE_SUPABASE_PUBLISHABLE_KEY`。**地雷**：Vercel 對 `VITE_` 變數必須選 **Config**（不是 Secret）；變數名稱錯一個字母，網站會悄悄退回本機備用資料；改環境變數要重新部署才生效。
- 指令（PowerShell）：`npm.cmd run dev`（`http://localhost:5173/`）、`npm.cmd run build`（成功顯示 `✓ built in ...`；「chunks larger than 500 kB」可忽略）。
- 資料更新流程：Notion → 匯出 CSV → 網站頁尾「管理者登入」→「匯入 CSV」→ 預覽 →「確認匯入」。不需要 push（資料在雲端）。
- **push 注意**：不要用 `git add .`，逐檔 add；**請使用者用命令列 commit，不要在 TortoiseGit 用 Amend**（2026-10-22 因此造成 master 與 origin/master 分岔，修法是備份後 `git reset --mixed origin/master` 再逐檔 add）。不要上傳：`boardgame_source.zip`、`supabase_import.sql`、`make_supabase_import.py`、`boardgames.csv`、`categories_check.txt`、`covers_needed.txt`、`list_categories.py`、`generate_boardgames.backup.py`、`.env.local`、`App.css.bak`、`client_secret_*.json`。`PROJECT_CONTEXT.md`、`QUICKSTART.md` 只在使用者要求時才 commit。
- Windows 的 `LF will be replaced by CRLF` 警告可忽略；PowerShell 顯示 UTF-8 中文亂碼只是終端機問題。
- `src/data/boardGames.generated.ts`：本機備用資料與 `BoardGame` 型別（**不要手動改、不要刪**）。`public/covers/` 是舊封面（備援）。
- **前端結構**：`src/App.css` 是入口檔，只有 `@import`（**順序有影響，不要調換**）：`tokens`（設計變數）、`base`、`topbar`、`hero`、`library`、`filter`、`cards`、`modal`、`admin`、`mylist`、`footer`、`trash`、`docs`、`backtotop`、`tabs`、`ratings`、`leaderboard`、`loyalty`、`loyalty-card`、`loyalty-admin`、`account`（最後載入，可覆蓋前面）、`sitebar`。`src/App.tsx` 只留 `Library` 的狀態、篩選與排序；畫面在 `src/components/`；型別與工具在 `src/lib/`（完整清單見 QUICKSTART）。另有 `AdminPanel.tsx`、`PlayerPanel.tsx`、`MyList.tsx`（畫面叫「我的桌遊」）、`LoyaltyAdmin.tsx`、`GameDocuments.tsx`。

## 3. 資料庫、儲存與權限（Supabase）

**通則**：RLS 全開；「Allow new users to sign up」**已開啟**（玩家用 Google 登入），所以**所有寫入政策只能是 `auth.uid()` 等於本人，或 `is_admin()`，不可寫成「所有 authenticated」**。管理者身分以 `admin_users` ＋ `is_admin()` 判斷，**登入不等於管理者**；管理者帳號是 Authentication → Users 手動建立的 1 個 Email＋密碼帳號。**新建任何資料表都要加**：`revoke all on 表 from anon; revoke truncate, references, trigger on 表 from authenticated;`，並用 `information_schema.role_table_grants` 確認 `anon` 無權限。**刻意不對 `board_games` 加外鍵**（玩家資料以 `bgg_name` 文字對應）。免費方案：閒置一週會暫停；檔案儲存約 1 GB。

| 資料表 | 重點 |
|---|---|
| `board_games`（主鍵 `bgg_name`，`cover_slug` 唯一） | 欄位為前端 `BoardGame` 的 snake_case：`name, cover_slug, link_bgg, link_rulebook_zh/en, link_faq`（三個 link 欄保留但不用）、`category(text[])`、`bgg_score/difficulty/time`、`min/max_players`、`best_players/recommend_players(int[])`、`ranking_engine, classic_game_ranking, score_rank` 與四個其他排名、七個 `*_degree`、七個 `*_emoji`、`created_at`、`removed_at`（垃圾桶）、`removed_reason`（≤200）、`description`（≤300，預設空字串）。SELECT 所有人，寫入只有管理者。缺值為 NULL 或空字串。**前端 `id` 只是流水號，不可用來對應圖片或使用者資料。** |
| `game_documents` | 規則書／FAQ 等連結，一款可多份。`bgg_name` 外鍵（cascade）、`doc_type`（`rulebook/faq/errata/intro/video/other`）、`language`、`title`、`source_type`（`external/upload`）、`external_url`、`storage_path`、`ai_indexed`（預設 false；**影片永遠不可為 true**）。目前只用 external。刪遊戲會連帶刪資料列但**不刪 Storage 檔案**。 |
| `user_game_status` | 主鍵 `(user_id, bgg_name)`：`want_to_play`、`played`、`note`（≤500）、`play_count`（沒有日期的次數，0～999）、`updated_at`、`want_first_at`／`played_first_at`（**觸發器只在第一次勾選時寫入，取消再勾不變**）。取消勾選不刪列，前端略過全空的列。RLS 只有本人。 |
| `game_play_sessions` | 有日期的遊玩紀錄：`user_id`、`bgg_name`、`played_on`、`player_count`(1～99)、`note`(≤200)。**畫面總次數＝`play_count`＋該遊戲紀錄筆數**；新增紀錄不動 `play_count`，刪紀錄不取消已玩。單次查詢最多 1000 筆。 |
| `game_ratings` | 主鍵 `(user_id, bgg_name)`：`overall`(1～10)、`like/player_impact/communication/change/unique/keep_score`(1～5)。整體與 `keep_score` 必填（not null），其餘選填。個別評分只有本人看得到；公開只有函式 `get_rating_summaries()`（security definer，anon 可呼叫）的彙總，**門檻 5 人在函式內判斷**（六項各自計算）。 |
| `player_profiles` | 暱稱（公開、不含 Email）。 |
| `player_contacts` | **LINE／FB 名字（敏感）**：`user_id` pk → `auth.users` cascade、`contact_name`(1～40)。SELECT 本人或管理者、INSERT／UPDATE 本人、DELETE 只管理者；anon 無權限（已驗證）。**不可放進公開的 `player_profiles`，也不可顯示在任何公開畫面。** |
| `gatherings` | 聚會日：`id`、`gathered_on`（唯一，重複回 23505）、`note`（≤200）。 |
| `gathering_attendees` | `(gathering_id, user_id)`、`exempt`（免評分）、`source`（`admin`/`self`）。**INSERT／UPDATE／DELETE 只有管理者**（玩家只能透過 `join_gathering`）；玩家可讀自己的列。 |
| `gathering_games`、`gathering_plays` | 當天指定的遊戲；玩家勾的「我玩了」。以 `bgg_name` 文字對應。 |
| `gathering_checkins` | 報到設定：`gathering_id` pk、`token`（隨機、唯一）、`is_open`、`capacity`(1～500 或 null)。**只有管理者可讀寫**（玩家讀不到 token）。 |
| `loyalty_redemptions` | 免費券兌換紀錄（永久保留、沒有刪除功能，要刪用 SQL）。 |

**資料庫函式**：`is_admin()`、`get_rating_summaries()`、社群統計彙總函式（security definer，只回人數）、`loyalty_day_status(p_user)`（點數核心，見第 7 節）、玩家用 `get_my_loyalty_summary`／`get_my_loyalty_days`、管理者用 `admin_get_loyalty_overview`／`admin_get_loyalty_days(p_user)`／`admin_redeem_voucher(p_user)`、`join_gathering(p_token)`（玩家報到的唯一入口）、觸發器函式 `set_user_game_status_times()`、`mark_played_from_activity()`、`game_ratings_set_updated_at`。**security definer 函式一律 `set search_path = ''`，並 `revoke ... from public, anon`（需要的才 grant）。改函式前請使用者在 SQL Editor 匯出實際定義。**

**Storage**：公開 bucket `covers`（任何人可讀，寫入只認管理者），檔名 `{coverSlug}.webp`，**必須是 ASCII**。規則書 PDF 將來要用**私有** bucket（著作權）。

## 4. 前端資料欄位（`BoardGame` 型別）

- `id`、`name`（中文名，CSV「屬性」）、`bggName`、`slug`、`coverSlug`、`links{bgg,rulebookZh,rulebookEn,faq}`、`category[]`、`bggScore/bggDifficulty/bggTime`、`minPlayers/maxPlayers`、`bestPlayers/recommendPlayers`（獨立，不要合併）、`rankingEngine`、`classicGameRanking`（網站稱「常玩遊戲排名」，CSV「老遊戲想玩綜合評分」）、`scoreRank`（「綜合分數排名」，CSV「分數_排名」）、四個其他排名（保留但不排序、不顯示）、七個 `*Degree`、七個 `*Emoji`。
- **CSV 必要欄位**（缺任何一個，預覽報錯、不寫入）：`屬性`、`bggName`、`類型`、`bgg網站`、`BGG分數`、`BGG時間`、`BGG難度`、`Ranking engine`、`分數_排名`、`人數上限`、`人數下限`、`推薦人數`、`最佳人數`、`喜歡度`、`快速性`、`溝通性`、`獨特性`、`玩家影響性`、`複雜性`、`變化性`；選填 `簡介`。欄位順序與檔名不重要，多的欄位忽略。「類型」逗號分隔轉陣列（共 49 種，大項 3 個：策略、派對、陣營；類型清單自動整理）；人數欄逗號分隔轉數字陣列；「最佳人數 」欄名尾端可能有空白（`cleanText` 處理）。「墨敵賽」無網路資料，BGG 分數與難度保留 `null`、顯示「未提供」，**不要編造**。
- **不要揭露「綜合分數排名」的計算方式**（Notion 中由數個排名相加），也不要在前端重算。排序只保留：Ranking engine、常玩遊戲排名、綜合分數排名（皆由小到大）、名稱、BGG 分數／難度／時間、最佳／推薦人數；缺值固定排最後。
- **封面**：`coverSlug` 由 `bggName` 轉換（純英數維持原代號；含中日文者保留英數字部分加 8 位 FNV-1a 雜湊；完全無英數則 `game-<hash>`，`makeCoverSlug` 在 `parseCsv.ts`）。顯示順序：Storage `{coverSlug}.webp`（上傳後網址加 `?v=` 以立即換圖）→ `public/covers/` → 🎲。Console 的封面 404 是正常的。匯入時 `matchCovers` 依檔名對應封面（完全相同 → 去括號／中文名相同 → 名稱開頭相同；多款符合則略過）。**教訓：任何要當檔名或 Storage key 的字串都必須是 ASCII**（曾因 `兵臨城下.webp` 上傳失敗）。套用新版 `makeCoverSlug` 後應重新匯入，並確認 `select bgg_name, cover_slug from public.board_games where cover_slug !~ '^[a-z0-9_-]+$';` 為 0 列（**使用者是否已做尚未確認**）。

## 5. CSV 匯入的行為（`AdminPanel.tsx`）

- 順序：upsert → 上傳封面 → 把「資料庫正常、CSV 沒有」的遊戲**移到垃圾桶**（設 `removed_at`）。不刪資料列、不刪封面。
- 預覽分三類：①會移到垃圾桶（紅字名單）；②CSV 有、但目前在垃圾桶（資料更新、**仍留在垃圾桶**，不自動還原；要自動還原就在 `toRow` 加 `removed_at: null`）；③垃圾桶裡本來就有、CSV 也沒有（維持原狀）。一次移到垃圾桶超過 5 款要輸入「移除」。
- 「簡介」欄選填：沒有該欄或空白，都不覆蓋資料庫原有簡介（CSV 無法清空簡介）。
- **永久刪除只在垃圾桶區由管理者手動做**（刪 `board_games` 列與 `{coverSlug}.webp`；不清玩家資料；封面刪除後無法復原）。
- **地雷（最重要）：在 Notion 改 `bggName`** → 舊的進垃圾桶、新的當新遊戲（封面要重傳）；新舊 `cover_slug` 相同會撞唯一限制；**玩家的想玩／已玩／評分／聚會紀錄以 `bgg_name` 對應，改名會讓紀錄失聯**（資料還在、畫面不顯示）。補救：①改回原名再匯入，並在垃圾桶按「還原」舊的；②真的要改名，需要用 SQL 把所有含 `bgg_name` 欄位的資料表一起改（先用 `select table_name from information_schema.columns where table_schema='public' and column_name='bgg_name';` 找出全部，再由 AI 依結果寫腳本）。
- 匯入後請使用者執行 `select bgg_name, created_at from public.board_games order by created_at desc limit 5;`，確認舊遊戲的 `created_at` 沒被重設（新遊戲標示靠它：30 天內顯示橘框＋NEW；現有遊戲要先補成 `2026-09-01T00:00:00+00`）。

## 6. 主要功能的決定與規則（已完成）

- **搜尋／篩選／檢視**：篩選抽屜（難度、最佳／推薦人數、時間、類型；類型多選為 AND）、缺資料提示、排序、檢視模式（`list`／`grid-4`／`grid-9`，存 `localStorage` 鍵 `boardgame-view-mode`）。「我的紀錄」篩選：三顆眼睛（想玩／未標記／已玩）＋「依我的紀錄分區顯示」，`getMineGroup()`：有想玩→want，否則有已玩→played，否則 untouched。
- **詳細視窗（`GameModal.tsx`）**刻意精簡（使用者不要再放排名、人數、類型、時間、難度）：頂部固定，四個分頁：**概覽**（簡介、遊戲屬性、大家的評分摘要、管理者的封面上傳與「移到垃圾桶」）、**評分**、**我的桌遊**（想玩／已玩、次數、遊玩紀錄、備註）、**規則**（規則書／FAQ／中文介紹／影片連結，只接受 http(s)；管理者可新增）。AI 查詢分頁等 AI 規則助手做出來再加。卡片按鈕叫「詳細資料」。
- **垃圾桶**：所有人看得到，只有管理者能移入（填原因）、還原、永久刪除、編輯原因；0 款時整區隱藏是設計如此。資料庫政策不改（Anyone can read；Admin insert／update／delete）。
- **想玩／已玩（`usePersonalCollection.ts`）**：訪客存 `localStorage`（鍵 `boardgame-personal-collection`），登入後以雲端為準；登入後更新「先改畫面再寫雲端，失敗還原」；首次登入有合併視窗（兩邊聯集、備註保留雲端、次數取大值、雲端寫入成功才清本機）。訪客紀錄不會跨瀏覽器。遊玩次數計數器：－／＋（0～999），按「已玩」不加次數（次數為 0 時才設為 1）。
- **公開評分（`useGameRatings.ts`、`RatingSection.tsx`）**：整體 1～10＋適合留下來 1～5 必填，其餘五項選填；未滿 5 人顯示「評分累積中」；社群平均與使用者自己的 Emoji 評價並排，**不要與「綜合分數排名」混用**。評分項目沿用使用者的用語，**不要把「玩家影響性」改名成「玩家互動」**；複雜度、快速性是遊戲屬性、不列入評分。**完整評分＝七項皆非空。**
- **社群統計**：每款顯示想玩／已玩人數與月／季／年「期間新增」（以 `*_first_at` 計算）；只回傳彙總；訪客不計入。**不加「讚」按鈕**；不做公開留言板。
- **排行榜**：想玩、已玩（全部／本月／本季／本年）、整體評分、適合留下來（滿 5 人才上榜，平均到小數 1 位）；同分並列、前 10 名；只用彙總。
- **簡介**：管理者在「概覽」編輯；使用者說太耗時間，**先跳過**。若請 AI 擬稿：只寫「這款在玩什麼」一到兩句自己的話，不翻譯或改寫 BGG 簡介。
- **自動標「已玩」**：評分過或勾「我玩了」就視為已玩（資料庫觸發器 `mark_played_from_activity()` 掛在 `game_ratings` 與 `gathering_plays`，取消勾選不取消已玩）；前端在剛評完分時也即時更新畫面（App.tsx 的 effect，只處理「新評分」，不會蓋掉使用者手動取消的已玩）。
- **`privacy.html`**：日後新增功能要同步更新。已涵蓋：遊玩紀錄、評分、社群統計、排行榜、集點卡、聯絡方式；**聚會報到與免評分那句還要補**（見 QUICKSTART）。

## 7. 帳號、聚會與集點卡

- **登入**：Google OAuth（Google Cloud 專案 `board-game-site`，已發布為正式版、只用基本範圍；**不要新增敏感或受限範圍**，否則會觸發驗證與 100 人上限；接近 80 人時回 Google Auth Platform「目標對象」確認）。Client Secret 只存在 Supabase，不進 Git／前端／Vercel／對話。**不採用匿名帳號**。管理者的 Gmail 若同時 Google 登入會對到管理者帳號，測玩家身分要用另一個 Google 帳號。一人多帳號無法完全阻止，靠「每人每款一筆＋唯一限制＋RLS」，規模變大再加 CAPTCHA。
- **LINE／FB 等 App 內建瀏覽器不能 Google 登入**（Google 政策，使用者實測被擋）。對策：登入前偵測（`src/lib/googleLogin.ts` 的 `signInWithGoogle()`，所有登入入口都走它），改顯示 `InAppBrowserNotice`「請改用瀏覽器開啟」並提供複製網址；管理者複製的聚會連結結尾加 `&openExternalBrowser=1`（LINE 會用手機瀏覽器開啟，**尚待實測**）。
- **玩家登出選單**：暱稱 ▾ →「修改暱稱與聯絡方式／登出」；管理者的登出在頂端列。暱稱視窗第一次登入或尚未填聯絡方式時自動跳出（暱稱與 LINE／FB 名字必填，可「稍後再說」）。
- **視窗必須 `createPortal(..., document.body)`**；`.modal-backdrop` z-index 1100，報到視窗 1050，「請改用瀏覽器開啟」1200，頂端列 900。**頂端列（`.topbar`／`.sitebar`）不可加 `backdrop-filter`、`transform`、`filter`**，否則 `position: fixed` 的遮罩會被關在頂端列裡（暱稱視窗只露出一條，2026-10-26 發生過）。
- **集點規則**（`loyalty_day_status` 即時計算，不另存）：管理者把出席者列入某聚會日並指定當天遊戲；玩家勾「我玩了」並把這些遊戲評分完整（以前評過分的不用重評）；該天得 1 點（`exempt` 免評分例外直接得點）。一天只算 1 點；同月 2 點換 1 張免費券（無期限）；當月只有 1 點到下月 1 日不再計入；兌換紀錄永久保留；已兌換超過累積顯示 ⚠（`over_redeemed`）。沒有指定遊戲的舊聚會日沿用舊規則（用 `game_play_sessions` 的日期）。**函式只用 `gathering_*`、`game_play_sessions`、`game_ratings`（皆以 `bgg_name` 文字對應），不讀 `board_games`**，所以遊戲被移到垃圾桶或刪除不影響點數（畫面上該遊戲會顯示成英文名稱、沒有「去評分」按鈕）；**只有在 Notion 改 `bggName` 才有風險**。使用者想過用藍牙／區網偵測，**建議不要**。
- **聚會連結（單一連結，2026-10-26 決定）**：管理者在聚會詳情「建立聚會連結」（預設開放）→ 複製 `https://網址/?join=隨機碼&openExternalBrowser=1` 傳給當天要來的人。玩家登入（沒有帳號會自動建立）→ `CheckInDialog`「我來了」→ `join_gathering(p_token)` 檢查：已登入、token 有效、**已報到者永遠回 `already`（聚會結束後仍可用同一連結回到集點卡）**、開放中、**台北時間聚會當天**、有暱稱與聯絡方式、未額滿（`for update` 鎖住該場聚會防超額）→ 成功後打開集點卡並標出那一天。管理者可開關、設人數上限（留空＝不限；包含手動加入，手動加入可超過但會跳確認）、重設連結（舊連結立刻失效）；出席名單標示「自己報到」並可移除。**不需要把人數上限填滿**（有些人沒有帳號、要到場才建立）。舊的 `?card=日期`（只打開集點卡、不會讓人變成出席者）仍支援，但管理者介面已不再提供。現場 4 位數報到碼**先不做**，遇到陌生人再加。
- **管理者「聚會與集點」視窗**（`LoyaltyAdmin.tsx`，樣式 `lga-` 開頭）：分頁「聚會設定」（新增聚會、近期聚會列、聚會詳情：聚會連結、頭像標籤出席者（可搜尋暱稱或 LINE／FB 名字、顯示聯絡方式、免評分、來源標籤）、指定遊戲）與「集點狀況」（總表、明細、兌換）。
- 評分或「我玩了」後，集點卡的評分狀態來自 `ratings`（只在 `Library` 呼叫一次，不要在 `LoyaltyCard` 再呼叫）。`addSession` 沒有防重複（同款同日可重複新增）。

## 8. 視覺改版（進行中）

- 風格：**溫暖桌遊俱樂部**。色票（已放進 `tokens.css`）：奶油 `#F5F0E5`、紙白 `#FBF7EC`、森林綠 `#456B50`（深一點 `#365B40`）、焦糖 `#B78A5A`、深墨綠 `#34463C`。印章與會員卡只用在集點卡與少量裝飾，不要每個元件都復古。
- **決定**：不做路由與資料夾大搬家（不建 `pages/`、`routes.tsx`），維持現有結構；先建設計變數，再逐頁換外觀。
- 順序：①設計變數 `tokens.css` ＋新頂端導覽列 `sitebar`（桌面頂端；手機底部導覽）✅已提供，待測 → ②首頁（插畫或大圖主視覺＋「今天，想玩哪一款？」＋搜尋＋類型快速篩選＋最新加入／最受歡迎）與遊戲卡片（**需要使用者貼 `base.css`、`hero.css`、`library.css`、`cards.css`、`App.tsx`**）→ ③集點卡獨立頁面（會員卡主視覺＋兩個圓形印章＋票券＋聚會足跡；規則收進可展開區塊）→ ④管理者視窗與排行榜統一風格、手機版全面檢查。
- 使用者喜歡獨立的集點卡頁面與「聚會與集點」的卡片式管理介面；首頁參考圖是探索首頁（插畫主視覺、搜尋、類型快篩、4 欄遊戲卡片）。

## 9. 長期願景、想做清單與待確認

- **AI 規則助手（最重要，必須用 RAG）**：使用者上傳中英文規則書／FAQ PDF，回答**只能根據檢索到的片段**，必須列出出處（哪本、第幾頁，最好附引用片段），找不到可靠依據要明說，不可憑空回答。**不可從影片查規則**；RAG 只讀 `ai_indexed = true` 的文件；中文介紹（`intro`）有著作權疑慮，較安全的是當「延伸閱讀」。訪客也能問但不能改設定，**要設計每人每日提問上限**，AI 金鑰只放後端（Supabase Edge Function），PDF 存私有 bucket。技術方向待定：PDF 文字擷取、切段並保留頁碼、pgvector（中文可能需向量＋關鍵字混合）。待確認：支援全部桌遊或先 10～20 款、模型、次數限制方式、規則書是否上傳與著作權。
- **上傳規則書 PDF**（私有 bucket；`game_documents` 已預留 `source_type='upload'`、`storage_path`、`ai_indexed`；先統計實際 PDF 數量與大小）→ 再做 AI 規則助手。
- **拖曳調整排名＋匯出 Notion CSV**（使用者說「晚點再嘗試」，尚未動工、尚未回「照建議」）：6 個排名欄位都已在資料庫（`ranking_engine`、`classic_game_ranking`〔Notion 欄名「老遊戲想玩綜合評分」〕、`communication_ranking`〔溝通排名〕、`unique_ranking`〔獨特排名〕、`player_impact_ranking`〔玩家影響性排名〕、`change_ranking`〔變化排名〕），不需改資料庫，現有 Admin update 政策夠用。建議設計：管理者專用「排名編輯」，下拉選排名、`@dnd-kit` 拖曳（拖一格＝交換、拖多格＝中間順移）、null 放「未排名」、先顯示「將更新 N 款」再儲存、匯出 UTF-8 含 BOM 的 CSV（「屬性」「bggName」＋6 欄）；要提醒「網站改過排名後若先匯入舊 Notion CSV 會被覆蓋」。「綜合分數排名」由 Notion 算，網站不重算。`parseCsv.ts` 必要欄位只含兩個排名欄，其他 4 個若 CSV 沒有會被當 `null` 覆蓋資料庫，日後可全部加入必填。開工前要看 `AdminPanel.tsx`、`fetchBoardGames.ts`。
- **「我的桌遊」升級**（使用者原話，未排序）：想玩可標「近期想玩」「下次聚會想玩」、一鍵移到已玩、可依加入時間／排名／時間排序；遊玩紀錄加對手／朋友、勝負、心得；統計（累積次數與總時數、最常玩、最喜歡的類型、最常玩的人數、每月趨勢）。
- **揪團與聚會規劃**：從想玩清單挑候選遊戲、設定日期／人數／地點、報名與候補、顯示參加者共同想玩的遊戲、依人數推薦（「想玩」與「報名」不要混為一談）。**「今天想玩什麼？」推薦**：問人數、時間、難度，用現有資料即可，不需要 AI。討論與 FAQ（官方 vs 玩家留言要能區分）、行事曆與布告欄、帳號刪除流程（目前要管理者在 Supabase 手動處理，`player_profiles`、`player_contacts` 只有管理者能刪）。
- **其他待確認**：清單／9 個一排的外觀是否滿意；常玩遊戲排名是否改為自動計算；`陣營` 與 `策略` 可同時出現（目前允許）；排序功能要排什麼（使用者說之後再想）；`makeCoverSlug` 新版是否已套用並重新匯入。
- **已知限制**：窄螢幕下頂端按鈕是否擠在一起（新導覽列已改為手機底部導覽，待實測）；`BackToTop` 在手機可能被底部導覽蓋住（待實測）；詳細視窗規則書區是單行樣式。

## 10. 與使用者合作的規則（重要）

- 使用者是**程式初學者**，用**繁體中文**。預設會照步驟執行，可一次給多個步驟（實務上 8 步左右也照做）；他回「好」就代表完成，但不一定貼測試結果，重要項目要再問一次；遇到問題他會自己停下來問。他在 claude.ai 免費額度下工作，**聊天室容易中斷**，所以交接文件要隨時是最新，接手時**先問實際狀態，不要假設上一則回覆已完成**。
- 提供：明確檔案路徑；完整程式碼或精準修改位置（`Ctrl + F` 搜尋）；指令解釋；測試方式。**他多次貼錯位置，修改量大時直接給整份檔案，或請他「整段刪掉換成」。**
- **每個指令都標清楚貼在哪裡**（VS Code 終端機＝PowerShell，或 Supabase SQL Editor；他曾把 PowerShell 指令貼進 SQL Editor）。
- 你**碰不到使用者的本機檔案**，也收不到 CSV；需要資訊就給 PowerShell／SQL 指令請他貼結果或截圖。**他貼來的檔案可能是舊版**（2026-10-24 貼過舊的整份 `App.css`；2026-10-26 貼的 `App.tsx` 也比本機舊），判斷現況先用 `git status`／`git log`／`Get-Content ... -First 15` 確認。
- **大改 `App.tsx`、`AdminPanel.tsx`、`PlayerPanel.tsx`、`GameDocuments.tsx`、`src/components/*` 前，請使用者貼出目前版本**。樣式分散在 `src/styles/`，改哪塊先確認在哪個檔案。
- 每階段改完 `npm.cmd run build` 再實測畫面（build 成功不等於畫面正確）。不要破壞現有功能與 107 款資料。**不要要求使用者貼出密碼、Secret／service_role key、資料庫密碼、Google Client Secret。**
- **影響資料、隱私的設計決策，先提方案並列「建議預設值」，等他回「照建議」再動工。** 一次一階段，前一階段測試完才進下一階段。給 SQL 時先說明會做什麼，並附驗證查詢。

## 11. 多台電腦作業

**自動同步**：Supabase 資料與 Storage、GitHub 上的程式碼。**不會同步**：`.env.local`（要重建）、`boardgames.csv`、**沒有 commit／push 的修改**。

新電腦第一次設定：①安裝 Git、Node.js（LTS）、VS Code，設定 `git config --global user.name`／`user.email`；②在舊電腦 `git remote get-url origin` 取得倉庫網址；③`git clone <網址>`，`cd` 進去，確認在 `master`；④`npm.cmd install`；⑤專案根目錄建立 `.env.local`（兩行純文字、不加引號）：`VITE_SUPABASE_URL=https://hgeuockbjrzayfdylavq.supabase.co`、`VITE_SUPABASE_PUBLISHABLE_KEY=（Supabase 後台 Project Settings → API Keys 的 Publishable key）`，**只能用 Publishable key**；⑥`npm.cmd run dev`，確認顯示 107 款、能登入管理者。

日常：開始前 `git pull`；結束前逐檔 `git add` → `git commit` → `git push`；不要兩台電腦同時改同一批檔案；未完成的工作用分支存。
