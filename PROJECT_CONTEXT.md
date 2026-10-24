# 桌遊規則助手（BoardGameResultAI）— 專案交接文件

> 給接手的 AI 閱讀。**請先讀 `QUICKSTART.md`（懶人包），再讀本文件。**
> 最後更新：2026-10-24（附錄 K 為最新；由 git 歷史與各聊天室版本合併還原；本文第 1～10 節是 2026-10-22 晚的完整版，**後面的附錄 A～K 較新，與本文衝突時以附錄為準，越後面越新**）

## 1. 專案簡介

- **名稱**：桌遊規則助手（BOARD GAME COMPANION）
- **目標**：實用的桌遊管理網站，讓使用者收藏桌遊、快速查規則，未來可直接詢問 AI 解決規則爭議。
- **網站已上線**：https://board-game-result-ai.vercel.app/
- **長期願景**：完整的「桌遊社群平台」，優先順序見第 6 節（AI 規則助手最重要）。
- **使用模式（重要）**：網站**公開給別人瀏覽，也開放訪客問 AI，但只有使用者本人能編輯**（匯入 CSV、上傳封面、上傳規則書）。訪客不能更動網站內部設定。
- **目前資料量**：107 款桌遊（使用者在 Notion 整理後匯出 CSV）。
- **本機專案路徑**：`D:\BoardGameResultAI`（Windows、PowerShell）。使用者會在多台電腦作業，路徑可能不同，見第 10 節。

## 2. 技術架構與部署

- 前端：React + TypeScript + Vite。
- **後端：Supabase（免費方案，區域首爾 ap-northeast-2）**，提供資料庫、登入、檔案儲存（Storage）。專案 ID `hgeuockbjrzayfdylavq`，Project URL `https://hgeuockbjrzayfdylavq.supabase.co`（給前端的是**根網址**，不要加 `/rest/v1/`）。Publishable key 在 Supabase 後台 Project Settings → API Keys（公開用的 key，可放前端）。**Secret key / service_role 絕對不能放進網站或貼給任何人，目前完全沒用到。**
- 部署：GitHub 倉庫連到 Vercel，**正式分支是 `master`**，push 後自動建置。其他分支（例如 `wip-cover-upload`）只會產生預覽部署，不影響正式網站。
- **環境變數**：本機放 `.env.local`（已加入 `.gitignore`，**不在 Git 裡**），變數名 `VITE_SUPABASE_URL`、`VITE_SUPABASE_PUBLISHABLE_KEY`。Vercel 後台 Environment Variables 也已設定，Environments 為 Production、Preview、Development。
  - **地雷**：Vercel 對 `VITE_` 開頭的變數不允許存成 Secret，必須選 **Config**（公開用，沒問題）。
  - 環境變數只在「新的部署」才生效；變數名稱錯一個字母，網站會悄悄退回本機備用資料，很難發現。
- 主要檔案：
  - `src/App.tsx`：`App`（向 Supabase 讀資料、失敗時退回本機資料）→ `Library`（主畫面，接收 `boardGames` 作為 props）；另有 `CoverImage`、`getCoverSources`、`rowToGame`（snake_case → camelCase）、`fetchBoardGames`。`Library` 內使用 `useSession` 判斷是否登入，詳細視窗登入後顯示「上傳／更換封面」。
  - `src/AdminPanel.tsx`：頁尾的管理者登入／登出，登入後多一個「匯入 CSV」視窗：選檔 → 預覽（新增／更新、新增名單、將被刪除名單、封面對應結果）→「確認匯入」（upsert、上傳封面、刪除 CSV 沒有的遊戲與雲端封面）。含 `toRow`（前端欄位 → 資料庫欄位）與 `matchCovers`（依檔名模糊對應封面）。
  - `src/GameDocuments.tsx`：遊戲詳細視窗裡的規則書／FAQ 區塊（props：`bggName`、`isAdmin`）。讀取 `game_documents`，顯示外部連結（只接受 http(s) 網址）；登入後有新增表單與刪除按鈕。`App.tsx` 在詳細視窗的 `<div className="notice">` 上方放入，並以 `key={selectedGame.bggName}` 重置狀態。
  - `src/lib/supabase.ts`：建立 Supabase 連線。
  - `src/lib/parseCsv.ts`：在瀏覽器解析 CSV（移植自 `generate_boardgames.py`：欄位檢查、`cleanText`、數字、類型切陣列、人數轉數字陣列、`makeCoverSlug`、檢查 `bggName`／`coverSlug` 不重複）。`makeCoverSlug` 已 `export`（`AdminPanel.tsx` 用來比對封面檔名）。
  - `src/lib/useSession.ts`：React hook，回傳目前登入的 session（沒登入為 `null`）。
  - `src/lib/uploadCover.ts`：把圖片縮成寬度最多 600px、轉成 webp（品質 0.85）後，以 `{coverSlug}.webp` 上傳到 `covers` bucket（`upsert: true`，`cacheControl: 60`）。
  - `src/App.css`：樣式（含檢視模式、管理者登入）。
  - `src/data/boardGames.generated.ts`：本機備用資料與 `BoardGame` 型別（**不要手動改、不要刪**，型別仍被其他檔案匯入）。
  - `generate_boardgames.py`、`make_supabase_import.py`：舊的資料更新流程，**已被網站匯入取代，僅留作備份與規則參考**（不在 Git 裡）。
  - `public/covers/`：舊的封面圖（108 個檔，已在 Git 裡），繼續當備援。
- 指令（PowerShell 用 `npm.cmd`）：`npm.cmd run dev`（`http://localhost:5173/`，改 `.env.local` 後要重開；終端機關掉或按 `Ctrl + C` 後 `localhost:5173` 會連不上，重新執行即可）、`npm.cmd run build`（成功顯示 `✓ built in ...`；「chunks larger than 500 kB」是提醒，可忽略）。
- **目前的資料更新流程**：Notion → 匯出 CSV → 網站頁尾「管理者登入」→「匯入 CSV」→ 看預覽（尤其是紅字「將被刪除」名單）→「確認匯入」。**CSV 沒有的遊戲會被刪除。**不需要 push（資料在雲端）。
- **push 注意**：不要用 `git add .`。只加入需要的檔案：`.gitignore`、`package.json`、`package-lock.json`、`src`、`public`、兩份交接文件。**不要上傳**：`boardgame_source.zip`、`supabase_import.sql`、`make_supabase_import.py`、`boardgames.csv`、`categories_check.txt`、`covers_needed.txt`、`list_categories.py`、`generate_boardgames.backup.py`、`.env.local`。
- Windows 的 `LF will be replaced by CRLF` 警告可忽略。PowerShell 用 `Get-Content` 顯示 UTF-8 中文會變亂碼，只是終端機顯示問題，檔案本身正常。

## 3. 資料庫、儲存與權限（Supabase）

資料表 `public.board_games`（主鍵 `bgg_name`，`cover_slug` 唯一）。欄位為前端 `BoardGame` 型別的 snake_case 版本：

`bgg_name, name, cover_slug, link_bgg, link_rulebook_zh, link_rulebook_en, link_faq, category(text[]), bgg_score, bgg_difficulty, bgg_time, min_players, max_players, best_players(int[]), recommend_players(int[]), ranking_engine, classic_game_ranking, score_rank, player_impact_ranking, change_ranking, unique_ranking, communication_ranking, like_degree, change_degree, communication_degree, player_impact_degree, unique_degree, complexity_degree, like_emoji, speed_emoji, communication_emoji, unique_emoji, player_impact_emoji, complexity_emoji, change_emoji, created_at`

- 缺值為 `NULL`（數字）或空字串（文字）。**主鍵用 `bgg_name` 而不是 `id`**，因為 `id` 會隨 CSV 順序位移；前端的 `id` 只是讀取後依排序給的流水號，**不可用來對應圖片或使用者資料**。
- **資料表 RLS 已啟用，共 4 條規則**：SELECT（`anon`、`authenticated` 都可讀）；INSERT／UPDATE／DELETE 只給 `authenticated`。
- **Storage**：公開 bucket `covers`（任何人可讀圖），並已建立 4 條 `storage.objects` 規則：SELECT 給 `anon`、`authenticated`；INSERT／UPDATE／DELETE 只給 `authenticated`（限 `bucket_id = 'covers'`）。檔名為 `{coverSlug}.webp`。
- **`public.game_documents`（規則書／FAQ 等文件，一款遊戲可有多份）**：`id`(uuid)、`bgg_name`（外鍵 → `board_games.bgg_name`，`on delete cascade on update cascade`）、`doc_type`（`rulebook`／`faq`／`errata`／`other`）、`language`（`zh`／`en`／`other`）、`title`、`source_type`（`external`／`upload`）、`external_url`、`storage_path`、`ai_indexed`(boolean，預設 false)、`created_at`。檢查條件：external 必須有網址、upload 必須有路徑。RLS 與 `board_games` 相同（所有人可讀，只有 `authenticated` 可新增／修改／刪除）。**目前只使用 external**；`board_games` 的 `link_rulebook_zh/en`、`link_faq` 欄位保留但不再使用。刪除遊戲會連帶刪除文件資料列，但**不會刪 Storage 檔案**（日後做上傳時要處理）。
- **管理者帳號**：已在 Authentication → Users 手動建立 1 個帳號（Auto Confirm），**已關閉「Allow new users to sign up」**。因此目前「已登入者 = 使用者本人」，寫入規則才安全。
- ⚠️ **未來若開放朋友登入（留言、報名、想玩清單），他們也會是 `authenticated`，就能改桌遊資料、規則書連結與封面。** 屆時必須把 `board_games`、`game_documents` 與 Storage 的 INSERT／UPDATE／DELETE 規則都改成只認管理者（例如比對管理者的 user id 或另建角色表）。
- ⚠️ 免費方案：專案閒置一週會自動暫停（資料不會消失，但暫停期間網站讀不到資料，需到後台恢復）。檔案儲存免費額度約 1 GB（各來源寫 500 MB～1 GB，請以官方頁面為準）；封面已壓縮，但之後存規則書 PDF 要注意。

## 4. 前端資料欄位（`BoardGame` 型別）

- `id`、`name`（中文名，來自 CSV「屬性」）、`bggName`、`slug`、`coverSlug`、`links{bgg,rulebookZh,rulebookEn,faq}`、`category[]`、`bggScore/bggDifficulty/bggTime`、`minPlayers/maxPlayers`、`bestPlayers/recommendPlayers`（兩者獨立，不要合併）、`rankingEngine`、`classicGameRanking`（前端稱「常玩遊戲排名」，CSV 欄位「老遊戲想玩綜合評分」）、`scoreRank`（「綜合分數排名」，直接用 CSV 的「分數_排名」）、四個其他排名（保留但**不排序、不顯示**）、七個 `*Degree`、七個 `*Emoji`（`like/speed/communication/unique/playerImpact/complexity/change`）。
- CSV 必要欄位（缺任何一個，預覽會直接報錯、不會寫入）：`屬性`、`bggName`、`類型`、`bgg網站`、`BGG分數`、`BGG時間`、`BGG難度`、`Ranking engine`、`分數_排名`、`人數上限`、`人數下限`、`推薦人數`、`最佳人數`、`喜歡度`、`快速性`、`溝通性`、`獨特性`、`玩家影響性`、`複雜性`、`變化性`。欄位順序不重要、多的欄位會被忽略；**檔名不重要**。
- CSV：107 筆、35 欄；「類型」以逗號分隔切成陣列；「墨敵賽」無網路資料，BGG 分數與難度保留 `null`，顯示「未提供」，**不要編造**。
- 類型共 49 種：大項 3 個（策略、派對、陣營），其餘為小項。類型清單由資料自動整理，新增類型只要重新匯入即可自動出現（需重新整理網頁）。
- **不要揭露「綜合分數排名」的計算方式**（Notion 中由數個排名相加），也不要在前端重算。
- **封面圖**：`coverSlug` 由 `bggName` 轉換（NFKD、小寫、去重音、非字母數字底線換 `-`、去頭尾 `-`）。顯示順序：Supabase Storage `{coverSlug}.webp`（上傳後網址加 `?v=` 版本參數以立即換圖）→ `public/covers/{coverSlug}.webp|jpg|png` → 🎲。所以可以慢慢補圖。Console 裡的大量 404 是正常的。

## 5. 目前已完成的功能

**已實測：**
- 搜尋、篩選抽屜（難度、最佳／推薦人數、遊戲時間、類型）。類型：三個大項按鈕 + 可搜尋的「更多類型」，**多選為 AND**。
- 缺資料提示、排序（Ranking engine、常玩遊戲排名、綜合分數排名、名稱、BGG 分數／難度／時間、最佳／推薦人數；升降冪；重設排序，缺值固定排最後）。
- 卡片與**刻意精簡的詳細視窗**（BGG 分數、封面、名稱、BGG 連結、七項 Emoji、開發中提示）。**使用者明確不要**再放排名、人數、類型、時間、難度。
- 檢視模式切換：清單 `list`、一排 4 `grid-4`、一排 9 `grid-9`，存 `localStorage`（key `boardgame-view-mode`）。清單檢視實際畫面使用者**尚未回報截圖**；「代辦清單」被當成首頁桌遊列表（使用者未反對）。
- 資料來源為 Supabase（讀取失敗退回本機資料）。
- **管理者登入／登出**（頁尾）：已實測並 push。
- **匯入 CSV**：預覽（新增、更新、新增名單、將被刪除名單）已實測；「確認匯入」（以 `bgg_name` upsert，匯入前有 `window.confirm`）已實測成功。已移除原本的「前 3 款檢查」。
- **詳細視窗「上傳／更換封面」**（登入後才出現）：已實測成功，圖片自動壓縮成 webp 上傳，上傳後卡片與視窗立即換圖。

**已實測並上線（2026-10-22，分支 `wip-cover-upload` 已合併進 `master`）：**
- **匯入 CSV 時附封面圖**：預覽可多選圖片，檔名不必和 `bggName` 完全相同，英文或中文名皆可。比對順序（`matchCovers`）：完全相同的封面代號 → 去掉括號後相同／中文名相同 → 名稱開頭相同；同時符合多款則略過並提醒使用者把檔名寫完整。預覽列出「檔名 → 遊戲」，找不到對應的圖片只留在瀏覽器、不會上傳。
- **CSV 沒有的遊戲會被刪除**：預覽以紅字列名單，確認視窗再列一次，一次刪超過 5 款需輸入「刪除」；刪除遊戲時一併刪除 Storage 的 `{cover_slug}.webp`（本次 CSV 仍使用的封面代號除外）。順序為 upsert → 上傳封面 → 刪除。完成訊息會回報上傳張數、刪除遊戲數與封面數、失敗項目。
- 匯入視窗最大高度 90vh、可捲動。

**規則書／FAQ 連結（已實測並上線）**：詳細視窗顯示該遊戲的文件連結（類型、語言、標題，點擊於新分頁開啟）；沒有時顯示「尚未提供規則書或 FAQ 連結。」；登入後可新增（類型、語言、標題可不填、網址）與刪除連結。訪客只能看。上傳 PDF 與 AI 索引尚未做。

**未 commit 的本機試作（不要 push）**：`src/lib/usePersonalCollection.ts`（hook：`collection`、`getEntry`、`updateEntry`；localStorage key `boardgame-personal-collection`，以 `bggName` 為鍵，內容 `{wantToPlay, played, note}`，三項都沒有內容就刪除該筆），以及 `App.tsx`／`App.css` 裡可能已加入的「MY NOTES」區塊。使用者實測前改變想法（需要全站統計，localStorage 做不到），故暫停；Phase 3（訪客本機＋登入後同步）會再利用它。使用者已決定「備註」先不做。實際狀態請用 `git status` 確認。

## 6. 長期願景與優先順序（使用者已排定）

> 近期項目完成前，不要動工以下功能。

- **最重要：AI 規則助手**：使用者上傳中英文規則書 PDF、FAQ PDF、圖示 PDF、規則網站；遇到易錯規則時給提示並**標明出處（哪本、第幾頁）**，找不到可靠依據要明說。**訪客也能問，但不能改設定**；訪客提問會產生 API 費用，要設計每人每日次數限制。需要：PDF 儲存與切段（保留頁碼）、AI 金鑰放後端（不能放前端）、先搜尋再回答。Supabase 可提供儲存與資料庫，AI 呼叫需另外的後端函式。
- **主要**：討論與 FAQ（官方／管理員筆記 vs 玩家留言要能區分）、揪團報名（「想玩」與「報名」不要混為一談）、行事曆與布告欄。
- **次要**：完整帳號系統、**總遊玩次數記錄**（會影響「常玩遊戲排名」，是否改為自動計算尚未決定）。

## 6-1. 社群功能規劃（使用者已確認，2026-10-22）

**背景決定**
- 使用者想要：全站「想玩」每月排行榜（防洗榜、各月份紀錄保留）、公開評分（取代留言板）、集點卡。對象先是使用者的朋友圈，但保留讓其他人加入的可能；不想手動替朋友建帳號，希望註冊簡單。
- **不採用匿名帳號**：Supabase 匿名使用者的資料庫角色也是 `authenticated`（以 `is_anonymous` 區分），會直接套用目前「所有 authenticated 可寫入」的政策；且清除瀏覽資料就能再建新帳號，無法一人一帳（LINE 做得到是因為綁手機號碼）。匿名帳號能做到的（免註冊、記自己的東西）用 `localStorage` 訪客模式也做得到，更簡單。
- **採用**：訪客不登入也能瀏覽，並把想玩、已玩、集點存在本機；**登入玩家（Email 免密碼 Magic Link）才能公開評分與參與每月投票**，登入後可換裝置同步。Google 登入列為之後的便利功能。登入不是多一把鑰匙，而是「你的評分與投票才計入社群榜單」。
- 一人多帳號 Email 驗證無法完全阻止；先靠「每人每款一筆評分／每月一票＋資料庫唯一限制＋RLS」，規模變大再加 CAPTCHA、異常偵測。
- 容量不是問題（幾個數字和日期很小），要小心的是權限與濫用。

**階段（一次一階段，前一階段測試完才進下一階段）**

1. **Phase 1｜管理權限與資料安全（最優先）**：確認並重做 `board_games`、`game_documents`、Storage `covers` 的寫入政策，只有管理者可新增／修改／刪除；前端管理功能也只對管理者顯示。注意：前端隱藏不是防護，必須改資料庫政策與 Storage 政策；管理者判斷不能只看「有沒有登入」；不要把 `service_role` 放前端；不要清除或重建現有資料，先檢查現有政策再改，改完確認管理者仍可操作。建議做法（接手 AI 請對照 Supabase 當下文件確認）：`public.admin_users` 表＋`public.is_admin()`（`security definer`、設好 `search_path`），政策使用 `is_admin()`；讀取政策維持 `anon`、`authenticated` 可讀。需要使用者提供管理者帳號的 User UID（Authentication → Users，非密碼）。**完成前不得開放註冊或任何人登入。**
2. **Phase 2｜Email 免密碼登入**：Supabase Auth Magic Link；玩家資料表（暱稱、公開玩家 ID，不公開 Email 或真實姓名）；管理者身分與玩家身分分開判斷。
3. **Phase 3｜訪客紀錄與雲端同步**：訪客想玩、已玩、集點存 `localStorage`；首次登入把本機資料合併到雲端，避免重複，衝突時有明確合併規則（待與使用者討論）；個人想玩／已玩預設只有本人可見。
4. **Phase 4｜公開評分**：六項評分（喜歡度、玩家影響性、溝通性、變化性、獨特性、適合留下來程度；使用者原定 1～5 分）＋整體 1～10 分。每位登入玩家每款遊戲一筆有效評分（唯一限制 `(user_id, bgg_name)`），可修改。公開社群平均與評分人數；評分人數太少時顯示「評分累積中」（門檻建議 5 人，未定）。與使用者自己的 Emoji 評價並排，不與「綜合分數排名」混用。
5. **Phase 5｜每月想玩排行榜**：與個人「想玩清單」分開，使用者明確投票才計票。唯一限制 `(月份, user_id, bgg_name)`；每位玩家每月票數上限（建議 5，待定）；以不同玩家人數排序，不看點擊次數；各月份榜單保留可回顧；月份以月初日期記錄。
6. **Phase 6｜集點卡與成就**：依遊玩紀錄（遊玩數量、不同遊戲數、每月挑戰、徽章），集點存資料庫並可追溯；已登入玩家跨裝置保留。與「常玩遊戲排名」（需遊玩次數）的關係尚未決定。

**建議的資料表（僅為構想，目前都不存在）**：`admin_users`、`player_profiles`、`user_game_status`、`game_ratings`、`monthly_want_to_play`，之後再加 `game_play_sessions`、`player_points`、`player_achievements`。每張表都要設計 RLS（個人狀態只有本人可讀寫；社群評分與排行榜公開可讀；不能改別人的資料）。

**其他設計決定**：不做公開留言板（管理負擔大、使用者判斷不一定有人留）；可日後加選填短評。評分一律公開，不放進玩家設定。評分項目沿用使用者的用語，不要把「玩家影響性」改名成「玩家互動」（意義不同）。複雜度、快速性是遊戲屬性、不是好壞，不列入評分；運氣成分、教學難易、配件品質等先不加，之後視需求做成選填。

## 7. 路線圖與下一步

**已完成**：篩選與缺資料、封面圖、檢視模式、後端（Supabase）、資料搬到雲端、單一管理者帳號與寫入權限、管理者登入、網站匯入 CSV（含自動刪除）、封面改存 Storage 並可在網站上傳、匯入時附封面圖、規則書／FAQ 外部連結。

**進行中**：社群功能規劃已確認，尚未動工（見第 6-1 節）。

**接下來（一次做一項）：**
1. **Phase 1 管理權限與資料安全**（先向使用者要管理者 User UID）。
2. Phase 2 Email 免密碼登入與玩家暱稱。
3. Phase 3 訪客本機紀錄與登入後同步。
4. Phase 4 公開評分。
5. Phase 5 每月想玩排行榜。
6. Phase 6 集點卡與成就。
7. 其餘（順序請與使用者確認）：上傳規則書 PDF（私有 bucket，注意著作權與容量；刪除遊戲時 `on delete cascade` 只刪資料列、不刪 Storage 檔案）、新到貨標示（需 Notion／CSV「入手日期」欄位）、**AI 規則助手（仍是最重要的長期目標）**：PDF 文字擷取、切段並保留頁碼、更新 `ai_indexed`，需先決定支援全部桌遊或先 10～20 款；之後討論／揪團／行事曆。

## 8. 與使用者合作的規則（重要）

- 使用者是**程式初學者**，用**繁體中文**，請**一次只處理一個步驟**。
- 提供：明確檔案路徑；**完整可用程式碼，或精準修改位置**（用 `Ctrl + F` 搜尋某段文字）；指令解釋；測試方式。只給「貼在某行下面」的片段容易貼錯；改函式時優先請使用者整個換掉並提醒縮排。
- **你碰不到使用者的本機檔案**，也收不到 CSV。需要資訊就給 PowerShell 指令請他貼結果，或請他貼截圖。使用者常貼截圖回報。
- **要改 `App.tsx`、`AdminPanel.tsx` 前，請使用者貼出目前版本**（這份文件記載的結構可能已過期）。
- 每階段改完用 `npm.cmd run build`，再實測畫面。build 成功不等於畫面正確。
- 不要破壞現有功能與 107 款資料；已正常運作的功能不要隨意改動。
- **不要要求使用者貼出密碼、Secret key、service_role key、資料庫密碼。**
- 近期項目完成前，不要加入 AI 功能、留言、揪團。

## 9. 待確認事項

- CSV 匯入的刪除行為已依使用者要求實作（CSV 沒有的遊戲與其雲端封面會被刪除，見第 5 節）。地雷：在 Notion 改 `bggName` 會讓舊的被刪（含封面）、新的當新遊戲（封面要重傳）；新舊 `cover_slug` 相同會撞唯一限制；拿到不完整的 CSV 會刪掉其他遊戲，匯入前務必看紅字名單。若日後想改成「預設不刪」或加勾選，可再調整。
- 規則書 PDF 是否要上傳、是否用私有 bucket、著作權處理；AI 規則助手要支援全部桌遊還是先 10～20 款、後端與模型選擇、訪客提問次數限制方式。
- 清單檢視、9 個一排的實際外觀是否滿意（清單檢視尚無截圖）。
- 「代辦清單」是否真的指首頁桌遊列表。
- 規則書檔案要放哪裡、AI 規則助手的後端與模型選擇、訪客提問次數限制方式。
- 總遊玩次數記錄完成後，常玩遊戲排名是否改為自動計算。
- 開放朋友登入時，要重做資料表與 Storage 的寫入權限（見第 3 節）。
- `陣營` 與 `策略` 可同時出現在同一款遊戲，目前允許。
- 每月想玩的每人票數上限（建議 5）、評分量表（六項 1～5、整體 1～10）、評分人數門檻（建議 5）、訪客資料與雲端資料的合併規則。
- Google 登入是否做、做的時機。
- 帳號刪除與資料保留政策（登入玩家的 Email 屬個人資料，需清楚處理）。
- 上傳到 Git 的兩份交接文件與試作檔案目前的 commit 狀態需用 `git status` 確認。

## 10. 多台電腦作業（外面的電腦／家裡的電腦）

**哪些東西會自動同步（不用搬）**：Supabase 的資料表、登入帳號、Storage 封面（都在雲端）；GitHub 上的程式碼與 `public/covers/`。

**哪些東西不會同步（要自己處理）**：`.env.local`（要重建）、`boardgames.csv`（從 Notion 重新匯出）、舊的 Python 腳本與 `supabase_import.sql` 等（已不需要）、**沒有 commit／push 的修改**。

**在新電腦第一次設定：**
1. 安裝 Git、Node.js（LTS 版）、VS Code（Python 已不需要）。第一次用 Git 需設定姓名與 email（`git config --global user.name "..."`、`git config --global user.email "..."`），push 時會跳出 GitHub 登入視窗。
2. 在舊電腦的專案資料夾執行 `git remote get-url origin` 取得倉庫網址（或到 GitHub 倉庫頁面 Code → HTTPS）。
3. 在新電腦選一個資料夾，執行 `git clone <倉庫網址>`，然後 `cd` 進專案資料夾。
4. 確認在 `master` 分支（`git branch`）。`wip-cover-upload` 已合併，可忽略。
5. 執行 `npm.cmd install`。
6. 在專案根目錄建立 `.env.local`（純文字，內容兩行，不加引號）：
   ```
   VITE_SUPABASE_URL=https://hgeuockbjrzayfdylavq.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=（從 Supabase 後台 Project Settings → API Keys 複製 Publishable key）
   ```
   **只能用 Publishable key，絕對不要用 Secret／service_role key。**
7. 執行 `npm.cmd run dev`，打開 `http://localhost:5173/`，確認顯示 107 款、能登入管理者。

**日常習慣：**
- 開始工作前先 `git pull`；結束前 `git add`（指定檔案）→ `git commit` → `git push`，下一台電腦才拿得到。
- 不要兩台電腦同時改同一批檔案；未完成的工作用分支（如 `wip-cover-upload`）存，測試成功再合併進 `master`。
- 新電腦上的專案路徑可能不是 `D:\BoardGameResultAI`，指令請以實際路徑為準。


---

## 附錄｜Phase 3 之後的紀錄（2026-10-22）

> 這一章是貼在 `PROJECT_CONTEXT.md` 最底部的新增內容，記錄 Phase 3 與之後的設計、資料庫結構與決定。上面舊章節若與這裡衝突，以這裡為準。

### A. 資料庫：`public.user_game_status`

| 欄位 | 型別 | 說明 |
|---|---|---|
| `user_id` | uuid，`references auth.users on delete cascade` | 主鍵之一 |
| `bgg_name` | text（1～200 字） | 主鍵之一；**刻意不對 `board_games` 加外鍵** |
| `want_to_play` | boolean，預設 false | ♥ 想玩 |
| `played` | boolean，預設 false | ✓ 已玩 |
| `note` | text，預設 ''，≤500 字 | 私人備註 |
| `updated_at` | timestamptz | 前端每次寫入時更新 |
| `want_first_at` | timestamptz | 第一次勾「想玩」的時間，**由觸發器寫入、之後不變** |
| `played_first_at` | timestamptz | 第一次勾「已玩」的時間，同上 |
| `play_count` | integer，預設 0，0～999 | 遊玩次數，**尚無畫面使用** |

- 主鍵 `(user_id, bgg_name)`，重試同步不會產生重複資料。
- RLS 已開啟；`select`／`insert`／`update`／`delete` 四條政策都是 `user_id = (select auth.uid())`，角色 `authenticated`；`anon` 的權限已撤銷。
- 觸發器 `user_game_status_set_times`（`before insert or update`，函式 `public.set_user_game_status_times()`，`set search_path = ''`）：新增時依勾選狀態寫入首次時間；更新時 `coalesce(old.值, 新勾選才寫 now())`，所以**取消再重新勾選不會改變首次時間**，前端傳進來的值也會被蓋掉。
- 因此取消勾選時**不刪除那一列**（才能保住首次時間）；前端讀取時略過「想玩、已玩、備註全空」的列。
- 現有紀錄建立觸發器前，已用 `updated_at` 補上首次時間（`Rising Sun` 的兩個時間因此等於 `updated_at`，屬預期）。
- 驗證過：政策 4 條齊全、`anon` 不在權限清單、測試列的首次時間早於 `updated_at`（觸發器有運作）。

### B. 前端結構（Phase 3 之後）

- `src/lib/usePersonalCollection.ts`（已 push）：
  - 型別 `PersonalEntry { wantToPlay, played, note }`、`PersonalCollection = Record<bggName, PersonalEntry>`。
  - 訪客：`localStorage` 鍵 `boardgame-personal-collection`；登入後以雲端為準並**不再寫 localStorage**。
  - 回傳：`entries`、`getEntry`、`updateEntry`、`isLoggedIn`、`canEdit`、`status`（`guest`／`loading`／`ready`／`error`）、`errorMessage`、`clearError`、`reload`、`needsMerge`、`localCount`、`mergeStatus`、`mergeLocalIntoCloud`、`declineMerge`。
  - 登入後更新採「先改畫面、再寫雲端，失敗還原並顯示提示」；雲端讀取完成前不能改（避免蓋掉資料）。
  - 首次合併規則：兩邊聯集；想玩／已玩任一邊有勾就有；備註雲端已有就保留雲端；雲端寫入成功才清空本機；失敗保留本機並可重試；「不加入」只在該次工作階段有效。
- `src/App.tsx`：`StatusButtons`（封面 `overlay` 與詳細視窗 `inline` 兩種版型）、`PersonalNote`（離開欄位才儲存）、合併視窗（沿用 `modal-backdrop`／`admin-modal`）、錯誤提示條 `personal-toast`；`Library` 內 `const personal = usePersonalCollection()`。
- `src/MyList.tsx`：「我的清單」右側抽屜（`mylist-*` 樣式，z-index 1100／1200）；用 `renderCover` 屬性借用 `App.tsx` 的 `CoverImage`，避免循環匯入。
- 樣式都附加在 `src/App.css` 最底部，依功能分區註解（想玩／已玩、我的清單、我的紀錄篩選、新遊戲標示）。

### C. 進行中的兩項（程式碼已提供，狀態待確認）

**「我的紀錄」篩選**
- `type MineGroup = 'want' | 'untouched' | 'played'`；分組函式 `getMineGroup(entry)`：有想玩→`want`；否則有已玩→`played`；否則→`untouched`（三區不重複）。
- `Library` 狀態：`groupByMine`（是否顯示區塊標題）、`hiddenGroups`（被眼睛隱藏的區塊）；`displayedItems`（`header`／`game` 混合陣列）、`displayedGameCount`。
- 順序：搜尋與既有篩選 → 排序（`filteredGames`）→ 依眼睛隱藏 → 若開啟分區則分組（空區不顯示標題；標題顯示數量；區內沿用原排序）。
- 篩選按鈕徽章會計入 `groupByMine` 與 `hiddenGroups`；「清除篩選」會一併重設。
- 抽屜新增 `mine-filter` 區（三顆眼睛按鈕＋「依我的紀錄分區顯示」勾選）；主畫面卡片迴圈由 `filteredGames.map` 改為 `displayedItems.map`。

**新遊戲標示**
- `board_games.created_at`（timestamptz）已存在；現有遊戲要先補成 `2026-09-01T00:00:00+00`，否則 30 天內全部會變成「新」。
- `App.tsx`：`LibraryGame = BoardGame & { createdAt?: string | null }`；`rowToGame` 帶入 `createdAt: row.created_at`；`NEW_GAME_DAYS = 30`；`isNewGame()`；卡片加 `is-new` class 與 `new-badge`。
- 樣式：橘色外框（`#f0a22e`）＋左下角 NEW 標籤，9 個一排與清單檢視縮小。

### D. 已決定、尚未實作的功能

- **社群統計**（取代原 Phase 5 每月投票）：直接用大家的想玩／已玩清單；顯示每款遊戲「目前人數」與月／季／年「期間新增」（以 `want_first_at`／`played_first_at` 計算，每人每款只算第一次）；只顯示彙總人數、不公開個別清單；訪客不計入；以 `security definer` 資料庫函式回傳彙總數字，不開放別人的列；人數少可被推測，已寫進 `privacy.html`。
- **遊玩次數**：欄位 `play_count` 已建；先做簡單計數器；若要「每月玩幾次」，另建遊玩紀錄表（日期事後補不回來）。
- **評分**：Phase 4，每人每款一筆、可修改；開始前確認量表與人數門檻（建議 5）。
- **不加「讚」按鈕**（建議；使用者未反對）。

### E. Git 事故紀錄（避免重演）

- 2026-10-22：使用者在 TortoiseGit 以 Amend 方式「修改上一次提交」，把含 `App.tsx`／`App.css`／`usePersonalCollection.ts` 的提交（`6c24208`，已在 `origin/master`）換成只含兩份文件的提交（`e200fae`），造成 `master` 與 `origin/master` 分岔。
- 修法：先備份檔案到 `$HOME\backup-mylist`、`git branch backup-e200fae e200fae`，再 `git reset --mixed origin/master`（不動工作資料夾），之後逐檔 add 提交。
- 之後請使用者用命令列 commit，不要在 TortoiseGit 使用 Amend。

### F. 測試紀錄（Phase 3）

- 資料庫：政策與權限查詢通過。
- 線上：訪客勾選、備註、登入後合併、Table Editor 對列數、重新整理後保留、登出後消失、換裝置同步，使用者回報通過。
- 「不加入」、離線同步失敗與重試、換裝置登入：已列出測試步驟，使用者回報通過。
- 隱私權政策已更新並提交（上線後可再開 `/privacy.html` 確認）。

---

## 附錄 G／H｜遺失待補（2026-10-23 還原時註記）

> **這兩節在 git 歷史與所有版本裡都找不到**：附錄 I 開頭寫「接在 H 節之後」，但 G、H 只存在於從未 commit、後來被覆蓋的檔案版本。下面只是從 `QUICKSTART.md` 的描述**重建的摘要**，不是原文。若原文還在其他聊天室，請貼回補上。

### G（重建摘要）｜Phase 1／2 完成紀錄
- Phase 1：`admin_users` ＋ `is_admin()`；`board_games`、`game_documents`、Storage `covers` 的寫入政策全部只認管理者（登入不等於管理者）。
- Phase 2：`player_profiles`（暱稱公開、不含 Email）、`src/PlayerPanel.tsx`、`public/privacy.html`；改用 Google 登入（Google Cloud 專案 `board-game-site`，OAuth 已發布為正式版、只用基本範圍）；已開啟 Supabase 註冊。
- 細節以 `QUICKSTART.md` 為準。

### H（重建摘要）｜詳細視窗圓點改版（2026-10-23 完成）
- 五個區塊小標 01～05。
- 六項評分全用圓點：3 欄 × 2 列、各項不同顏色，圓點數 ＝ emoji 個數。
- 想玩／已玩兩個橫排按鈕、遊玩次數一列（`PlayCounter`）、備註。
- 頂部 `BoardGameGeek ↗` ＋ `☆ 8.2 BGG SCORE`。
- 遊玩次數計數器設計（2026-10-22 使用者決定）：詳細視窗內 －／數字／＋（0～999）；按「已玩」不會增加次數（次數為 0 時才設為 1）；次數與「已玩」狀態各自獨立（次數歸 0 不取消已玩、取消已玩不清次數）；訪客存 `localStorage`，登入合併時取較大值；維持「先改畫面再寫雲端」；暫不做每月遊玩紀錄。

---

## 附錄 I｜拆檔與垃圾桶（2026-10-23，接在 H 節之後；與上面衝突時以這裡為準）

### I-1. 拆檔（使用者回「好」，視為完成）
- `src/App.css` 變成入口檔，以 `@import` 載入 `src/styles/`：`base`、`topbar`、`hero`、`library`、`filter`、`cards`、`modal`、`admin`、`mylist`、`footer`（已 push，提交 `0317534`）。同選擇器的多層覆蓋規則已合併成最終版，刪了 9 條確定沒用到的規則（`.notice`、`.rating-content`、`.modal-bgg-link`、`.modal-head-text`、`.personal-box`、`.game-modal .eyebrow` 等）。H 節所說「App.css 底部堆疊覆蓋規則」已不存在。
- `src/App.tsx` 分兩批拆開（約 1450 → 約 700 行），`Library` 只留狀態、篩選與排序、`displayedItems`：
  - `src/lib/`：`libraryTypes.ts`（`LibraryGame`、`SortKey`、`ViewMode`、`MineGroup`、`getMineGroup`、常數）、`gameFormat.ts`、`fetchBoardGames.ts`（含 `BoardGameRow`、`rowToGame`）、`personalApi.ts`（`PersonalApi` 型別）、`useTrashActions.ts`。
  - `src/components/`：`Icons`、`CoverImage`、`StatusButtons`、`RatingDots`、`PlayCounter`、`PersonalNote`、`TopBar`、`ViewToggle`、`FilterDrawer`、`GameCard`、`GameModal`、`MergeDialog`、`PersonalToast`、`TrashSection`。
  - 行為不變，只有兩處搬家：「更多類型」的計算進 `FilterDrawer`；Esc 關閉進 `GameModal`（視窗開著才監聽）。`categories` 等 `useMemo` 的相依改為 `[boardGames]`（因為垃圾桶會改變清單）。
- B 節提到的 `PersonalEntry`／`StatusButtons`／`PlayCounter` 等仍存在，只是不在 `App.tsx` 內。
- `PlayerPanel.tsx`：登入後只顯示一顆暱稱按鈕（`.player-chip`），登出放進暱稱視窗。

### I-2. 垃圾桶（程式已提供，待測）
- **決定（使用者）**：所有人（含訪客）都看得到垃圾桶；只有管理者能移入、還原、永久刪除。資料庫**不改政策**；`board_games` 現有四條政策（已用 `pg_policies` 確認）：Anyone can read（anon, authenticated；`true`）、Admin insert／update／delete（`is_admin()`）。曾建議的「讀取政策拆兩條」**不執行**。
- 資料庫：`board_games.removed_at timestamptz`（空值＝正常；有值＝在垃圾桶）。
- 前端：`removedAt` 進入 `LibraryGame`；`Library` 以 `allGames` 分出 `boardGames`（主畫面、篩選、計數、我的清單都只用這個）與 `trashedGames`；`App` 持有 `games` 狀態，`updateGames` 在移入／還原／刪除成功後更新畫面。
- 移到垃圾桶：詳細視窗右下角小字（管理者），先確認，`update ... select('bgg_name')` 確認真的有更新才改畫面（RLS 擋掉時會回 0 列並提示）。
- `TrashSection`：頁面最下方、橫幅之後；預設收合；0 款時整區不顯示；訪客只看封面、名稱、移除日期；管理者多「還原」「永久刪除」。
- 永久刪除：刪 `board_games` 該列與 Storage `{coverSlug}.webp`（別款還在用同封面代號則保留）；**不清 `user_game_status`**（沿用「不加外鍵」）；封面刪除後無法復原。
- 詳細視窗 05 區改單行：「規則書與 FAQ」＋小字「尚未提供相關連結」＋右側 `›`（`.game-docs-row` 等，樣式在 `src/styles/docs.css`）；管理者新增／刪除連結保留。垃圾桶樣式在 `src/styles/trash.css`。
- **尚未做**：CSV 匯入配合垃圾桶（見 QUICKSTART「進行中」第 3 點）：upsert 不含 `removed_at`，不會復活垃圾桶遊戲；但「CSV 沒有」名單含垃圾桶遊戲，確認後會被永久刪除。建議改為「移到垃圾桶」。
- 待測清單：管理者移入／還原；訪客看得到垃圾桶但沒有按鈕、沒有「移到垃圾桶」；移入後主畫面「顯示 N / 總數」與篩選選項更新；第 05 區單行；封面上傳、我的清單不受影響。通過後 commit：`git add src/App.tsx src/App.css src/GameDocuments.tsx src/components src/lib src/styles`，訊息「新增垃圾桶（移除／還原／永久刪除），規則書區改單行」。

### I-3. 小問題
- 頁尾上方 AI 助手橫幅的標題比說明文字更靠右（使用者截圖）；可能是拆 CSS 時漏規則，待對照舊版。

---

## 附錄 J｜早期版本（2026-10-21）中後來被精簡掉的細節

> 從最舊的交接文件撈回。當時尚無後端，部分描述已過時（例如「沒有後端」「資料來自 Python 產生器」）；只保留仍可能有用的資料欄位與實作細節。

### 3.1 CSV 結構（`boardgames.csv`）

- 107 筆、35 個欄位，無重複桌遊；中文名稱在「屬性」欄，BGG 網址在「bgg網站」欄。
- 「類型」以逗號分隔，切成陣列做篩選。目前共 **49 種類型**：大項 3 個（策略 77 款、派對 23 款、陣營 8 款），其餘 46 種為小項（卡牌驅動 22、區控 18、工擺 17、爬軌 16、引擎構築 13…）。**類型來自使用者的 Notion，之後新增類型只要重新匯出 CSV 並重新產生，網站會自動出現新類型**（網站類型清單由資料自動整理，不是寫死；只有三個大項按鈕是寫死的）。
- 「推薦人數」「最佳人數」為逗號分隔數字，轉成數字陣列。
- **注意**：「最佳人數 」欄位名稱尾端可能有空白，產生器已用 `clean_text` 處理欄位名稱。
- 缺值：「墨敵賽」沒有網路資料，BGG 分數與難度為空，保留 `null`、顯示「未提供」，**不要編造數值或網址**。

### 3.2 `BoardGame`（依 `generate_boardgames.py` 的 `output_type`）

| 欄位 | 型別 | CSV 來源欄位 | 說明 |
|---|---|---|---|
| `id` | number | （自動編號） | 依 CSV 列順序，**會因插入／調換列而位移，不可用來對應圖片或使用者資料** |
| `name` | string | 屬性 | 桌遊中文名稱 |
| `bggName` | string | bggName | BGG 英文名稱（不可重複；穩定識別用） |
| `slug` | string | （自動） | `game-{id}` |
| `coverSlug` | string | （由 bggName 轉換） | 封面圖片檔名，見 3.5 |
| `links` | object | bgg網站 | `bgg`、`rulebookZh`、`rulebookEn`、`faq`（後三者目前為空字串） |
| `category` | string[] | 類型 | |
| `bggScore` / `bggDifficulty` / `bggTime` | number \| null | BGG分數／BGG難度／BGG時間 | 各有缺值 |
| `minPlayers` / `maxPlayers` | number \| null | 人數下限／人數上限 | |
| `bestPlayers` / `recommendPlayers` | number[] | 最佳人數／推薦人數 | 兩者獨立，不要合併 |
| `rankingEngine` | number \| null | Ranking engine | |
| `classicGameRanking` | number \| null | 老遊戲想玩綜合評分 | 前端名稱「常玩遊戲排名」 |
| `scoreRank` | number \| null | 分數_排名 | 前端名稱「綜合分數排名」，**已確認寫入產生檔** |
| `playerImpactRanking` / `changeRanking` / `uniqueRanking` / `communicationRanking` | number \| null | 各排名欄位 | 資料保留，**不排序、不顯示** |
| `likeDegree` 等六個 `*Degree` | number \| null | 數字評分 | 保留原值 |
| 七個 `*Emoji` | string | 喜歡度／快速性／溝通性／獨特性／玩家影響性／複雜性／變化性 | 直接讀 CSV 的 Emoji，沒有則顯示「未提供」 |

> 完整欄位以 `boardGames.generated.ts` 為準。

### 3.3 排名欄位的決定（使用者已決定）

- 排序只保留三個：Ranking engine、**常玩遊戲排名**（`classicGameRanking`）、**綜合分數排名**（`scoreRank`），皆由小到大。其餘四個排名不加入排序。
- 「綜合分數排名」在 Notion 中由數個排名相加而成，但**不要向使用者揭露計算方式**，也不要在前端重新計算，直接使用 CSV 的 `分數_排名`。
- 未來「總遊玩次數記錄」完成後，常玩遊戲排名要改成繼續用 CSV，還是由遊玩紀錄自動算出，**尚未決定**。

### 3.5 封面圖片（已實作機制）

- 圖片放在 `public/covers/`，檔名 = `coverSlug` + 副檔名（`.webp`、`.jpg`、`.png` 皆可，網站依序嘗試）。
- `coverSlug` 由產生器的 `make_cover_slug(bggName)` 產生：小寫、去重音符號、非字母數字改成 `-`。例：`Camel Up (Second Edition)` → `camel-up-second-edition`。產生器會檢查 `coverSlug` 不重複。
- 用 `bggName` 而不是 `id` 對應圖片，是為了 CSV 插入或調換順序時圖片不會對錯；**更新 CSV 只改文字資料，不會動 `public/covers/` 裡的圖片**。
- 網站端是 `CoverImage` 元件：找不到圖片時顯示原本的 🎲，所以可以一款一款慢慢補圖。卡片與詳細視窗都使用它。
- 樣式：`.game-art .cover-image` 絕對定位填滿（`object-fit: cover`）；因為圖片區原本太高，曾建議在 `App.css` 加 `.game-art { height: 130px; ... }`，**最終採用的高度未確認**。

### 重要實作細節（舊版 4 節）

- `compareNullableNumbers()`：缺失資料（null）固定排最後，不受升降冪影響。
- `formatNumber()`：null／undefined 顯示「未提供」。
- `formatPlayers()`：人數連續時顯示範圍（例如 `2–4 人`），否則以頓號列出。
- 預設排序：`rankingEngine`，升冪。
- **App.tsx 最後一次被完整貼給 AI 的版本，早於**重設排序、缺資料提示、類型分組與 AND 邏輯、封面圖片這幾次修改。要改 `App.tsx` 前，請先請使用者貼出目前版本，不要憑舊版推測。

### 檢視模式切換的使用者原話（舊版 7 節）
使用者原話：「我的代辦清單還要增加一下檢視畫面，可以變成清單或者一排 4 個的檢視畫面或者一排 9 個的檢視畫面或者其他檢視畫面。」


---

## 附錄 K｜垃圾桶實測完成與 App.css 入口檔（2026-10-24；與上面衝突時以這裡為準）

### K-1. 垃圾桶：已實測通過
- 使用者回報垃圾桶測試已完成（管理者移入／還原、訪客只看不能操作等），**附錄 I-2 的「待測」狀態作廢**。
- 資料庫 `board_games.removed_at` 欄位已確認存在（`select removed_at from public.board_games limit 1;` 無錯誤，回傳 NULL）。
- 垃圾桶為 0 款時整區隱藏，是設計如此。
- 垃圾桶相關政策仍**不改**：`board_games` 讀取政策維持「Anyone can read＝`true`」。

### K-2. `App.css` 入口檔（本機曾是舊檔）
- 2026-10-24 發現：使用者本機 `src/App.css` 仍是拆檔前的舊整份（開頭是 `:root { font-family... }`，約 1500 行），`src/styles/` 的 12 個檔雖然存在但**沒被載入**，所以垃圾桶區與第 05 區單行的樣式沒生效。原因不明（可能某台電腦沒 pull，或被舊檔覆蓋）。
- 已修正：`src/App.css` 換成 12 行 `@import`（順序固定）：
  `base → topbar → hero → library → filter → cards → modal → admin → mylist → footer → trash → docs`
- build 通過，CSS 由 30.53 KB 變 29.67 KB；使用者看過畫面回「好」。舊檔備份為 `App.css.bak`（不要 add）。
- 待確認：已 commit／push（建議訊息：「App.css 改為入口檔，載入拆分後的樣式檔」）；並用 `git log --oneline -- src/App.css` 查舊檔何時被換回。
- 教訓：使用者貼來的檔案可能是舊版；判斷現況前先用 `git status`／`git log`／`Get-Content ... -First 15` 確認，不要憑貼來的內容下結論。

### K-3. AI 助手橫幅
- 截圖顯示橫幅內的文字（COMING NEXT、標題、說明）是**整塊置中**，不是標題偏右。
- 建議在 `src/styles/footer.css` 的 `.assistant-copy` 加 `flex: 1; text-align: left;`。使用者回「好」，是否真的修改要用 `git diff` 確認；不改也不影響功能。

### K-4. 下一步
1. 確認 git 狀態與 `App.css` 提交。
2. **CSV 匯入配合垃圾桶**：「CSV 沒有的遊戲」改為設定 `removed_at`（移到垃圾桶），不再永久刪除；要動 `AdminPanel.tsx`，先請使用者貼目前完整版本；預覽、確認文字與「超過 5 款要輸入刪除」保護一併調整；已在垃圾桶的遊戲不重複列入；CSV 內有、資料庫在垃圾桶的遊戲是否自動還原，先提方案給使用者決定。
3. `public/privacy.html` 補「遊玩次數」一句。
4. 再往 Phase 4（公開評分）。

附錄 L｜CSV 匯入改為移到垃圾桶、使用者新增的想做清單（2026-10-24；與上面衝突時以這裡為準）
L-1. CSV 匯入配合垃圾桶（程式已提供，待測）
改動只在 src/AdminPanel.tsx：讀取資料庫時多讀 removed_at；「CSV 沒有的遊戲」不再刪除，改為 update ... set removed_at = now()（只動 removed_at 為空的），不刪 board_games 資料列、不刪 Storage 封面。
預覽分三類：
removed：資料庫正常、CSV 沒有 → 這次會移到垃圾桶（紅字列名單）。
trashedInCsv：已在垃圾桶、CSV 有 → 資料會更新（upsert 不帶 removed_at，所以仍留在垃圾桶），要放回請用垃圾桶的「還原」。
alreadyTrashed：已在垃圾桶、CSV 也沒有 → 維持原狀。
保護：一次移到垃圾桶超過 5 款，要輸入「移除」兩個字（原本是「刪除」）。順序仍是 upsert → 上傳封面 → 移到垃圾桶。
設計決定（建議預設，使用者未反對才算數）：CSV 裡有、但垃圾桶裡的遊戲不自動還原（避免把管理者刻意移除、例如賣掉的遊戲又放回來）。若想自動還原，只要在 toRow 加 removed_at: null。
永久刪除仍只在垃圾桶區由管理者手動做（封面也在那時才刪）。
玩家的想玩／已玩紀錄以 bgg_name 對應，CSV 改 bggName 仍會讓玩家紀錄失聯。
L-2. 使用者的想做清單（2026-10-24 提出，尚未排序、尚未動工）

標「使用者原話」的是使用者自己列的；標「貼上的建議」的是使用者貼上來的 AI 建議（含優先順序表），使用者只是列入考慮，不算已決定。

小功能（可先做）

一鍵回到頁面頂端的按鈕。
垃圾桶可以註明「售出原因」（需新增欄位，例如 board_games.removed_reason，並在移入時輸入）。
新增排序功能（使用者原話只寫這句；可能是想玩清單的排序，見下，待確認）。
新增「私人／大家的分數表」＝ Phase 4 公開評分（使用者之前說過的六項評分，私人分數只有本人看、大家的分數是社群平均）。

把「我的清單」升級成「我的桌遊」個人管理中心（使用者原話）

想玩：可標記「近期想玩」「下次聚會想玩」；一鍵從想玩移到已玩，或兩者同時保留；可依加入時間、排名、遊戲時間排序；「把我之前說的排行加進去」（待確認指哪個排行，可能是常玩遊戲排名／綜合分數排名）。
已玩清單與遊玩紀錄（第二階段）：遊玩次數、最近一次遊玩日期；每次遊玩記錄玩家人數、對手或朋友、勝負；心得（例如「四人最好玩」「規則很難教」）；個人評分與 BGG 評分分開顯示；同一款遊戲可累積多筆遊玩紀錄。這會用到新的遊玩紀錄表（日期事後補不回來，要做就越早越好）。
統計：累積遊玩次數與總遊玩時數、最常玩遊戲、最喜歡的類型、最常玩的玩家人數、每月遊玩次數趨勢。
貼上的建議：名稱改為「我的桌遊」、抽屜分頁「想玩」「已玩」，完整管理頁再放「遊玩紀錄」「我的統計」。

集點卡（使用者原話，規則較複雜）

玩家要先填完評分表單（喜歡度、溝通性、獨特性、玩家影響性、變化、想留在架上的程度）才能集點；管理者設定「今天參加的人」，被設定的人才有權限填表，避免自己主動集點或隨便填表。
使用者想過用區域網路或藍牙判斷附近有誰；建議不要（網頁無法可靠偵測附近的人），改用管理者勾選名單，或每場聚會產生一組一次性代碼／QR，由玩家輸入。
同一個月來兩次，下次免費：集滿 2 點就自動產生一張無期限兌換券；當月沒集滿，到下個月 1 日自動取消那 1 點。（建議做法：集點「讀取時才依月份計算」，不用排程工作。）
一天可能玩多款遊戲，但一天要把自己玩過的所有遊戲都填完，一天只算一點。
規則要在畫面上寫清楚。管理者看得到所有人的集點狀況；玩家只看得到自己的，彼此看不到。
前置：需要 Phase 4 評分表、聚會場次（誰參加）、集點與兌換券資料表；RLS 要設計成「玩家只能讀自己的、管理者讀全部、點數只能由資料庫函式寫入」。

揪團與聚會規劃（第三階段，使用者原話）

從想玩清單挑聚會候選遊戲；設定日期、人數、地點、遊戲時間；朋友報名與候補；顯示參加者共同想玩的遊戲；依當天人數推薦合適的桌遊。

「今天想玩什麼？」推薦（貼上的建議）

問玩家人數、預計時間（30／60／90 分鐘內、不限）、難度（簡單／中等／困難／不限）、從想玩清單或全部挑選；用現有的最佳人數、推薦人數、時間、難度、排名資料就能做第一版，不需要 AI。之後可加「大家都沒玩過」「很久沒玩」「最符合四人聚會」。

貼上的建議優先順序（僅供參考）

P0：改名「我的桌遊」、想玩／已玩清單與同步（已有）。
P1：遊玩次數與最後遊玩日期、個人心得與評分、從清單挑今日遊戲。
P2：遊玩紀錄與統計圖表。
P3：聚會、揪團、報名與候補。
不建議一次大改資料庫；做到某項時再討論資料表。
L-3. 使用者的疑問：沒登入時的紀錄會跨瀏覽器嗎？
不會。 沒登入時，想玩／已玩／備註只存在那個瀏覽器自己的 localStorage（鍵 boardgame-personal-collection），換成 Firefox 看不到 Chrome 的紀錄。
有登入 Google 就會同步：紀錄存在 Supabase 雲端，換瀏覽器、換裝置，登入同一個 Google 帳號就看得到。
如果紀錄是「沒登入」時做的：先在原本的瀏覽器登入，出現合併視窗時按「加入我的帳號」，紀錄就會上傳雲端；之後在 Firefox 登入即可看到。
清除瀏覽資料或換電腦前，沒登入的紀錄會消失，這是訪客模式的限制，可考慮在畫面上多提醒一次。
L-4. 下一步建議
測試 CSV 匯入改版（見 QUICKSTART）。
補 public/privacy.html「遊玩次數」一句。
小功能一批：回到頂端、垃圾桶售出原因、排序（先確認「排序」要排什麼）。
再與使用者討論：「我的桌遊」改名與遊玩紀錄表設計（越早建紀錄表越好），之後 Phase 4 評分 → 集點卡 → 揪團。

### L-5. 補充（2026-10-24 晚）：CSV 匯入實測完成、拖曳排名、RAG 要求
- **CSV 匯入改為移到垃圾桶：使用者回報測試完成**，L-1 的「待測」作廢。`privacy.html` 已補「遊玩次數」並更新日期。
- **拖曳調整排名＋匯出 Notion CSV（使用者想要，尚未動工）**
  - 目的：不想每次在 Notion 逐筆改排名數字；在網站上拖曳，自動更新那 5～6 項排名，再產生可匯入 Notion 的 .csv。
  - 移位規則（建議）：標準清單重排。往上移一格＝與上一名交換；一次移多格＝中間的每一款順移一格。
  - 建議的第一版：管理者專用的「排名編輯」頁，**一次只編輯一個排名欄位**，列表依該排名排序，拖曳後按「儲存」才一次寫入資料庫；另有「匯出 CSV」。
  - 待使用者確認：①那 5～6 項排名是哪幾個？目前資料庫只存 Ranking engine、常玩遊戲排名、玩家影響性、變化、獨特性、溝通性（後四個「不顯示」），喜歡度、想留在架上的排名還不在資料庫，要新增欄位；②「綜合分數排名」由 Notion 算出，**網站不重算、不揭露算法**，匯出 CSV 只帶手動維護的排名欄；③Notion 匯入 CSV 要用哪一欄比對（通常是標題欄「屬性」，要確認）；④排名有缺值（null）的遊戲怎麼排。
  - 風險：網站改過排名後，若又先匯入 Notion 舊 CSV，網站的排名會被覆蓋。固定流程：網站拖曳 → 匯出 CSV 匯入 Notion → 之後才可再從 Notion 匯出 CSV 回網站。畫面上要警告。
- **AI 規則助手必須用 RAG（使用者明確要求）**
  - 回答只能根據檢索到的規則書／FAQ 片段；必須列出出處（哪本、第幾頁，最好附引用片段）；找不到可靠依據時要明說「找不到」，不可憑空回答。
  - 技術方向（待決定）：PDF 擷取文字、切段並保留頁碼、建立檢索（Supabase 可用 pgvector；中文檢索要注意斷詞，可能需向量＋關鍵字混合）；AI 金鑰只放後端；訪客提問要有每日次數限制。規則書 PDF 存在私有 bucket。