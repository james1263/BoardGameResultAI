# 桌遊規則助手（BoardGameResultAI）— 專案交接文件

> 給接手的 AI 閱讀。**請先讀 `QUICKSTART.md`（懶人包），再讀本文件。**
> 最後更新：2026-10-22

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
- **管理者帳號**：已在 Authentication → Users 手動建立 1 個帳號（Auto Confirm），**已關閉「Allow new users to sign up」**。因此目前「已登入者 = 使用者本人」，寫入規則才安全。
- ⚠️ **未來若開放朋友登入（留言、報名、想玩清單），他們也會是 `authenticated`，就能改桌遊資料與封面。** 屆時必須把資料表與 Storage 的 INSERT／UPDATE／DELETE 規則都改成只認管理者（例如比對管理者的 user id 或另建角色表）。
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

## 6. 長期願景與優先順序（使用者已排定）

> 近期項目完成前，不要動工以下功能。

- **最重要：AI 規則助手**：使用者上傳中英文規則書 PDF、FAQ PDF、圖示 PDF、規則網站；遇到易錯規則時給提示並**標明出處（哪本、第幾頁）**，找不到可靠依據要明說。**訪客也能問，但不能改設定**；訪客提問會產生 API 費用，要設計每人每日次數限制。需要：PDF 儲存與切段（保留頁碼）、AI 金鑰放後端（不能放前端）、先搜尋再回答。Supabase 可提供儲存與資料庫，AI 呼叫需另外的後端函式。
- **主要**：討論與 FAQ（官方／管理員筆記 vs 玩家留言要能區分）、揪團報名（「想玩」與「報名」不要混為一談）、行事曆與布告欄。
- **次要**：完整帳號系統、**總遊玩次數記錄**（會影響「常玩遊戲排名」，是否改為自動計算尚未決定）。

## 7. 路線圖與下一步

**已完成**：篩選與缺資料、封面圖、檢視模式、後端（Supabase）、資料搬到雲端、單一管理者帳號與寫入權限、管理者登入、網站匯入 CSV（含自動刪除）、封面改存 Storage 並可在網站上傳、匯入時附封面圖。

**進行中**：無。

**接下來（一次做一項）：**
1. **規則書連結**：`link_rulebook_zh/en`、`link_faq` 目前皆空。先和使用者決定檔案放哪裡（Supabase Storage 上傳，或貼外部連結）、中英文規則書與 FAQ 是否各一份、是否在網站上直接上傳。與日後 AI 規則助手相關，PDF 日後需切段並保留頁碼；注意免費 1 GB 儲存額度。
2. **個人收藏**（想玩、已玩、備註，初期存 localStorage）。
3. **新到貨桌遊（New Arrival）**：需在 Notion／CSV 新增「入手日期」欄位，資料表加欄位，卡片標示。
4. 之後：AI 規則助手 → 討論／揪團／行事曆 → 完整帳號與遊玩紀錄。

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
- 規則書檔案要放哪裡（Supabase Storage 或外部連結）、中英文與 FAQ 的結構。
- 清單檢視、9 個一排的實際外觀是否滿意（清單檢視尚無截圖）。
- 「代辦清單」是否真的指首頁桌遊列表。
- 規則書檔案要放哪裡、AI 規則助手的後端與模型選擇、訪客提問次數限制方式。
- 總遊玩次數記錄完成後，常玩遊戲排名是否改為自動計算。
- 開放朋友登入時，要重做資料表與 Storage 的寫入權限（見第 3 節）。
- `陣營` 與 `策略` 可同時出現在同一款遊戲，目前允許。

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
