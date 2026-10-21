# 桌遊規則助手（BoardGameResultAI）— 專案交接文件

> 給接手的 AI 閱讀。**請先讀 `QUICKSTART.md`（懶人包），再讀本文件。**
> 最後更新：2026-10-21（傍晚）

## 1. 專案簡介

- **名稱**：桌遊規則助手（BOARD GAME COMPANION）
- **目標**：實用的桌遊管理網站，讓使用者收藏桌遊、快速查規則，未來可直接詢問 AI 解決規則爭議。
- **網站已上線**：https://board-game-result-ai.vercel.app/
- **長期願景**：完整的「桌遊社群平台」，優先順序見第 6 節（AI 規則助手最重要）。
- **使用模式（重要）**：網站**公開給別人瀏覽，也開放訪客問 AI，但只有使用者本人能編輯**（匯入 CSV、上傳封面、上傳規則書）。訪客不能更動網站內部設定。
- **目前資料量**：107 款桌遊（使用者在 Notion 整理後匯出 `boardgames.csv`）。
- **本機專案路徑**：`D:\BoardGameResultAI`（Windows、PowerShell）

## 2. 技術架構與部署

- 前端：React + TypeScript + Vite。
- **後端：Supabase（免費方案，區域首爾 ap-northeast-2）**。專案 ID `hgeuockbjrzayfdylavq`，Project URL `https://hgeuockbjrzayfdylavq.supabase.co`（給前端的是**根網址**，不要加 `/rest/v1/`）。Publishable key 在 Supabase 後台 Project Settings → API Keys（公開用的 key，可放前端）。**Secret key / service_role 絕對不能放進網站或貼給任何人，目前完全沒用到。**
- 部署：GitHub 倉庫連到 Vercel，**分支是 `master`**，push 後自動建置。
- **環境變數**：本機放 `.env.local`（已加入 `.gitignore`），變數名 `VITE_SUPABASE_URL`、`VITE_SUPABASE_PUBLISHABLE_KEY`。Vercel 後台 Environment Variables 也已設定，Environments 為 Production、Preview、Development。
  - **地雷**：Vercel 對 `VITE_` 開頭的變數不允許存成 Secret，必須選 **Config**（公開用，沒問題）。
  - 環境變數只在「新的部署」才生效；變數名稱錯一個字母，網站會悄悄退回本機備用資料，很難發現。
- 主要檔案：
  - `src/App.tsx`：包含三個層次：`App`（向 Supabase 讀資料、失敗時退回本機資料）→ `Library`（原本的主畫面，接收 `boardGames` 作為 props）；另有 `CoverImage`、`rowToGame`（把資料庫的 snake_case 轉成前端的 camelCase）、`fetchBoardGames`。
  - `src/AdminPanel.tsx`：管理者登入／登出（放在頁尾）。
  - `src/lib/supabase.ts`：建立 Supabase 連線。
  - `src/App.css`：樣式（含檢視模式、管理者登入）。
  - `src/data/boardGames.generated.ts`：本機備用資料與 `BoardGame` 型別（**不要手動改**）。
  - `generate_boardgames.py`：讀 `boardgames.csv`，輸出上面那份 `.ts`。
  - `make_supabase_import.py`：讀 `boardGames.generated.ts`，輸出 `supabase_import.sql`（用 `on conflict (bgg_name) do update`，可重複執行當作更新資料）。
  - `public/covers/`：封面圖（108 個檔，已全部在 Git 裡）。
- 指令（PowerShell 用 `npm.cmd`）：`python generate_boardgames.py`、`npm.cmd run dev`（`http://localhost:5173/`，改 `.env.local` 後要重開）、`npm.cmd run build`（成功顯示 `✓ built in ...`；「chunks larger than 500 kB」是提醒，可忽略）。
- **目前的資料更新流程（手動）**：Notion → 匯出 `boardgames.csv` → `python generate_boardgames.py` → `python make_supabase_import.py` → 把 `supabase_import.sql` 全文貼進 Supabase SQL Editor 執行。**下一個大功能就是用網站上傳 CSV 取代這個流程。**
- **push 注意**：不要用 `git add .`。只加入需要的檔案：`.gitignore`、`package.json`、`package-lock.json`、`src`、`public`、兩份交接文件。**不要上傳**：`boardgame_source.zip`、`supabase_import.sql`、`make_supabase_import.py`、`boardgames.csv`、`categories_check.txt`、`covers_needed.txt`、`list_categories.py`、`generate_boardgames.backup.py`、`.env.local`。
- Windows 的 `LF will be replaced by CRLF` 警告可忽略。PowerShell 用 `Get-Content` 顯示 UTF-8 中文會變亂碼，只是終端機顯示問題，檔案本身正常。

## 3. 資料庫與權限（Supabase）

資料表 `public.board_games`（主鍵 `bgg_name`，`cover_slug` 唯一）。欄位為前端 `BoardGame` 型別的 snake_case 版本：

`bgg_name, name, cover_slug, link_bgg, link_rulebook_zh, link_rulebook_en, link_faq, category(text[]), bgg_score, bgg_difficulty, bgg_time, min_players, max_players, best_players(int[]), recommend_players(int[]), ranking_engine, classic_game_ranking, score_rank, player_impact_ranking, change_ranking, unique_ranking, communication_ranking, like_degree, change_degree, communication_degree, player_impact_degree, unique_degree, complexity_degree, like_emoji, speed_emoji, communication_emoji, unique_emoji, player_impact_emoji, complexity_emoji, change_emoji, created_at`

- 缺值為 `NULL`（數字）或空字串（文字）。**主鍵用 `bgg_name` 而不是 `id`**，因為 `id` 會隨 CSV 順序位移；前端的 `id` 只是讀取後依排序給的流水號，**不可用來對應圖片或使用者資料**。
- **RLS 已啟用，共 4 條規則**：SELECT（`anon`、`authenticated` 都可讀）；INSERT／UPDATE／DELETE 只給 `authenticated`。
- **管理者帳號**：已在 Authentication → Users 手動建立 1 個帳號（Auto Confirm），**已關閉「Allow new users to sign up」**。因此目前「已登入者 = 使用者本人」，寫入規則才安全。
- ⚠️ **未來若開放朋友登入（留言、報名、想玩清單），他們也會是 `authenticated`，就能改桌遊資料。** 屆時必須把 INSERT／UPDATE／DELETE 規則改成只認管理者（例如比對管理者的 user id 或另建角色表），或改用不同機制。
- ⚠️ 免費方案：專案閒置一週會自動暫停（資料不會消失，但暫停期間網站讀不到資料，需到後台恢復）。檔案儲存免費額度約 1 GB（各來源寫 500 MB～1 GB，請以官方頁面為準），之後存規則書 PDF 要注意。

## 4. 前端資料欄位（`BoardGame` 型別）

- `id`、`name`（中文名，來自 CSV「屬性」）、`bggName`、`slug`、`coverSlug`、`links{bgg,rulebookZh,rulebookEn,faq}`、`category[]`、`bggScore/bggDifficulty/bggTime`、`minPlayers/maxPlayers`、`bestPlayers/recommendPlayers`（兩者獨立，不要合併）、`rankingEngine`、`classicGameRanking`（前端稱「常玩遊戲排名」）、`scoreRank`（「綜合分數排名」，直接用 CSV 的「分數_排名」）、四個其他排名（保留但**不排序、不顯示**）、七個 `*Degree`、七個 `*Emoji`（`like/speed/communication/unique/playerImpact/complexity/change`）。
- CSV：107 筆、35 欄；「類型」以逗號分隔切成陣列；「最佳人數 」欄名尾端可能有空白（產生器已處理）；「墨敵賽」無網路資料，BGG 分數與難度保留 `null`，顯示「未提供」，**不要編造**。
- 類型共 49 種：大項 3 個（策略、派對、陣營），其餘為小項。類型清單由資料自動整理，新增類型只要重新匯入即可自動出現。
- **不要揭露「綜合分數排名」的計算方式**（Notion 中由數個排名相加），也不要在前端重算。
- 封面圖：`public/covers/{coverSlug}.webp|jpg|png`，`coverSlug` 由 `bggName` 轉換（小寫、去重音、非字母數字換 `-`）。找不到圖顯示 🎲，所以可以慢慢補。網站會依序嘗試三種副檔名，Console 裡的大量 404 是正常的。更新資料**絕不能動 `public/covers/`**。

## 5. 目前已完成的功能（使用者已實測）

- 搜尋、篩選抽屜（難度、最佳／推薦人數、遊戲時間、類型）。類型：三個大項按鈕 + 可搜尋的「更多類型」，**多選為 AND**。
- 缺資料提示：設了難度或時間篩選時，缺資料的遊戲被排除並顯示「有 N 款因缺少難度或時間資料，未納入篩選結果」。
- 排序：Ranking engine、常玩遊戲排名、綜合分數排名、名稱、BGG 分數／難度／時間、最佳／推薦人數；升降冪；一鍵重設排序。缺值固定排最後。
- 卡片：封面、類型、名稱、Ranking engine 與綜合分數排名、人數、時間、難度、查看規則。
- **詳細視窗刻意保持精簡**（BGG 分數、封面、名稱、BGG 連結、七項 Emoji、開發中提示）。**使用者明確不要**再放排名、人數、類型、時間、難度。
- **檢視模式切換**（標題列圖示按鈕）：清單 `list`、一排 4 個 `grid-4`、一排 9 個 `grid-9`（原本要 8 個，使用者改成 9 個以對應圖示）。選擇存在 `localStorage`（key `boardgame-view-mode`），CSS 類別 `.view-list`、`.view-grid-4`、`.view-grid-9`，小螢幕自動減少欄數。清單檢視的實際畫面使用者**尚未回報截圖**，需確認；「代辦清單」被當成首頁桌遊列表（使用者未反對）。
- **資料來源已改為 Supabase**（讀取失敗時退回本機資料，網站不會空白）。已部署，線上確認有 `board_games` 請求且顯示 107 款。
- **管理者登入**：`AdminPanel.tsx` 與樣式已寫好，**`npm.cmd run build` 成功，但尚未完成登入實測，也尚未 push**。使用者目前忘記密碼，正在重設（做法：在 Supabase Authentication → Users 刪除該帳號後重新建立，勾 Auto Confirm；或用 Send password recovery）。

## 6. 長期願景與優先順序（使用者已排定）

> 近期項目完成前，不要動工以下功能。

- **最重要：AI 規則助手**：使用者上傳中英文規則書 PDF、FAQ PDF、圖示 PDF、規則網站；遇到易錯規則時給提示並**標明出處（哪本、第幾頁）**，找不到可靠依據要明說。**訪客也能問，但不能改設定**；訪客提問會產生 API 費用，要設計每人每日次數限制。需要：PDF 儲存與切段（保留頁碼）、AI 金鑰放後端（不能放前端）、先搜尋再回答。Supabase 可提供儲存與資料庫，AI 呼叫需另外的後端函式。
- **主要**：討論與 FAQ（官方／管理員筆記 vs 玩家留言要能區分）、揪團報名（「想玩」與「報名」不要混為一談）、行事曆與布告欄。
- **次要**：完整帳號系統、**總遊玩次數記錄**（會影響「常玩遊戲排名」，是否改為自動計算尚未決定）。

## 7. 路線圖與下一步

**已完成**：篩選與缺資料、封面圖、檢視模式、後端（Supabase）、資料搬到雲端、單一管理者帳號與寫入權限。

**進行中**：管理者登入畫面（等使用者重設密碼後實測）。

**接下來（一次做一項）：**
1. 完成登入實測 → 一起 push（只 `git add` 需要的檔案）。
2. **網站上傳 CSV**（登入後才出現）：在瀏覽器解析 CSV（需把 `generate_boardgames.py` 的規則移植到 TypeScript：欄位對應、`clean_text`、類型切陣列、人數轉數字陣列、`make_cover_slug`、缺值轉 null、檢查 `bggName`／`coverSlug` 不重複）→ 預覽（新增幾款、更新幾款）→ 用 `upsert`（以 `bgg_name` 為衝突鍵）寫入。**不得動封面圖片。** 需先決定：CSV 裡沒有、但資料庫有的遊戲要不要刪除（建議預設不刪，或明確提示）。
3. **規則書連結**：`link_rulebook_zh/en`、`link_faq` 目前皆空；需決定檔案放哪裡（可能放 Supabase Storage，與 AI 助手相關）。
4. **個人收藏**（想玩、已玩、備註，初期存 localStorage）。
5. **新到貨桌遊（New Arrival）**：需在 Notion／CSV 新增「入手日期」欄位，資料表加欄位，卡片標示。
6. 之後：AI 規則助手 → 討論／揪團／行事曆 → 完整帳號與遊玩紀錄。

## 8. 與使用者合作的規則（重要）

- 使用者是**程式初學者**，用**繁體中文**，請**一次只處理一個步驟**。
- 提供：明確檔案路徑；**完整可用程式碼，或精準修改位置**（用 `Ctrl + F` 搜尋某段文字）；指令解釋；測試方式。只給「貼在某行下面」的片段容易貼錯；改函式時優先請使用者整個換掉並提醒縮排。
- **你碰不到使用者的本機檔案**，也收不到 CSV。需要資訊就給 PowerShell／Python 指令請他貼結果，或請他貼截圖。使用者常貼截圖回報。
- **要改 `App.tsx` 前，請使用者貼出目前版本**（這份文件記載的結構可能已過期）。
- 改資料欄位才動 Python 產生器，且動手前先備份（`Copy-Item`）；改完重新執行再 build。
- 每階段改完用 `npm.cmd run build`，再實測畫面。build 成功不等於畫面正確。
- 不要破壞現有功能與 107 款資料；已正常運作的功能不要隨意改動。
- **不要要求使用者貼出密碼、Secret key、service_role key、資料庫密碼。**
- 近期項目完成前，不要加入 AI 功能、留言、揪團。

## 9. 待確認事項

- 管理者登入是否實測成功。
- 清單檢視、9 個一排的實際外觀是否滿意（清單檢視尚無截圖）。
- 「代辦清單」是否真的指首頁桌遊列表。
- 上傳 CSV 時，資料庫有但 CSV 沒有的遊戲如何處理。
- 規則書檔案要放哪裡、AI 規則助手的後端與模型選擇、訪客提問次數限制方式。
- 總遊玩次數記錄完成後，常玩遊戲排名是否改為自動計算。
- 開放朋友登入時，要重做寫入權限（見第 3 節）。
- `陣營` 與 `策略` 可同時出現在同一款遊戲，目前允許。
