# 桌遊規則助手（BoardGameResultAI）— 專案交接文件

> 給接手的 AI 閱讀。**請先讀 `QUICKSTART.md`（懶人包），再讀本文件。**
> 最後更新：2026-10-25（附錄 O 為最新；本文第 1～10 節是 2026-10-22 的底稿，**後面的附錄 A～O 較新，與本文衝突時以附錄為準，越後面越新**）。2026-10-25 做過一次精簡：移除已作廢的「待測／尚未做」狀態與重複表格，內容與決定不變。

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
- 部署：GitHub 倉庫連到 Vercel，**正式分支是 `master`**，push 後自動建置。其他分支只會產生預覽部署，不影響正式網站。
- **環境變數**：本機放 `.env.local`（已加入 `.gitignore`，**不在 Git 裡**），變數名 `VITE_SUPABASE_URL`、`VITE_SUPABASE_PUBLISHABLE_KEY`。Vercel 後台 Environment Variables 也已設定，Environments 為 Production、Preview、Development。
  - **地雷**：Vercel 對 `VITE_` 開頭的變數不允許存成 Secret，必須選 **Config**（公開用，沒問題）。
  - 環境變數只在「新的部署」才生效；變數名稱錯一個字母，網站會悄悄退回本機備用資料，很難發現。
- 主要檔案（拆檔後的完整結構見附錄 I-1、QUICKSTART）：
  - `src/App.tsx`：`App`（向 Supabase 讀資料、失敗時退回本機資料）→ `Library`（主畫面）。
  - `src/AdminPanel.tsx`：頁尾的管理者登入／登出，登入後多一個「匯入 CSV」視窗：選檔 → 預覽 →「確認匯入」。含 `toRow`（前端欄位 → 資料庫欄位）與 `matchCovers`（依檔名模糊對應封面）。行為見附錄 L-1。
  - `src/GameDocuments.tsx`：詳細視窗「規則」分頁的規則書／FAQ 等連結（只接受 http(s) 網址）；管理者可新增與刪除。
  - `src/lib/supabase.ts`：建立 Supabase 連線。
  - `src/lib/parseCsv.ts`：在瀏覽器解析 CSV（欄位檢查、`cleanText`、數字、類型切陣列、人數轉數字陣列、`makeCoverSlug`、檢查 `bggName`／`coverSlug` 不重複）。`makeCoverSlug` 已 `export`。
  - `src/lib/useSession.ts`：回傳目前登入的 session（沒登入為 `null`）。
  - `src/lib/uploadCover.ts`：把圖片縮成寬度最多 600px、轉成 webp（品質 0.85）後，以 `{coverSlug}.webp` 上傳到 `covers` bucket（`upsert: true`，`cacheControl: 60`）。
  - `src/data/boardGames.generated.ts`：本機備用資料與 `BoardGame` 型別（**不要手動改、不要刪**，型別仍被其他檔案匯入）。
  - `generate_boardgames.py`、`make_supabase_import.py`：舊的資料更新流程，**已被網站匯入取代，僅留作備份**（不在 Git 裡）。
  - `public/covers/`：舊的封面圖（108 個檔，已在 Git 裡），繼續當備援。
- 指令（PowerShell 用 `npm.cmd`）：`npm.cmd run dev`（`http://localhost:5173/`，改 `.env.local` 後要重開）、`npm.cmd run build`（成功顯示 `✓ built in ...`；「chunks larger than 500 kB」是提醒，可忽略）。
- **目前的資料更新流程**：Notion → 匯出 CSV → 網站頁尾「管理者登入」→「匯入 CSV」→ 看預覽 →「確認匯入」。**CSV 沒有的遊戲會被移到垃圾桶（不再刪除，見附錄 L-1）。**不需要 push（資料在雲端）。
- **push 注意**：不要用 `git add .`，逐檔 add。**不要上傳**：`boardgame_source.zip`、`supabase_import.sql`、`make_supabase_import.py`、`boardgames.csv`、`categories_check.txt`、`covers_needed.txt`、`list_categories.py`、`generate_boardgames.backup.py`、`.env.local`、`App.css.bak`、兩份交接文件。
- Windows 的 `LF will be replaced by CRLF` 警告可忽略。PowerShell 用 `Get-Content` 顯示 UTF-8 中文會變亂碼，只是終端機顯示問題。

## 3. 資料庫、儲存與權限（Supabase）

資料表 `public.board_games`（主鍵 `bgg_name`，`cover_slug` 唯一）。欄位為前端 `BoardGame` 型別的 snake_case 版本：

`bgg_name, name, cover_slug, link_bgg, link_rulebook_zh, link_rulebook_en, link_faq, category(text[]), bgg_score, bgg_difficulty, bgg_time, min_players, max_players, best_players(int[]), recommend_players(int[]), ranking_engine, classic_game_ranking, score_rank, player_impact_ranking, change_ranking, unique_ranking, communication_ranking, like_degree, change_degree, communication_degree, player_impact_degree, unique_degree, complexity_degree, like_emoji, speed_emoji, communication_emoji, unique_emoji, player_impact_emoji, complexity_emoji, change_emoji, created_at`，之後新增 `removed_at`、`removed_reason`、`description`（見附錄 K、M、N）。

- 缺值為 `NULL`（數字）或空字串（文字）。**主鍵用 `bgg_name` 而不是 `id`**，因為 `id` 會隨 CSV 順序位移；前端的 `id` 只是流水號，**不可用來對應圖片或使用者資料**。
- **RLS 已啟用**：SELECT 所有人可讀；INSERT／UPDATE／DELETE 只給管理者（`is_admin()`，見附錄 G、I-2）。
- **Storage**：公開 bucket `covers`（任何人可讀圖），寫入規則只認管理者。檔名為 `{coverSlug}.webp`（必須是 ASCII，見 M-4）。
- **`public.game_documents`（規則書／FAQ 等文件，一款遊戲可有多份）**：`id`(uuid)、`bgg_name`（外鍵 → `board_games.bgg_name`，`on delete cascade on update cascade`）、`doc_type`（現有 `rulebook`／`faq`／`errata`／`intro`／`video`／`other`，見 N-4）、`language`（`zh`／`en`／`other`）、`title`、`source_type`（`external`／`upload`）、`external_url`、`storage_path`、`ai_indexed`(boolean，預設 false)、`created_at`。檢查條件：external 必須有網址、upload 必須有路徑。**目前只使用 external**；`board_games` 的 `link_rulebook_zh/en`、`link_faq` 欄位保留但不再使用。刪除遊戲會連帶刪除文件資料列，但**不會刪 Storage 檔案**（日後做上傳時要處理）。
- **管理者帳號**：Authentication → Users 手動建立的 1 個帳號；管理者身分以 `admin_users` ＋ `is_admin()` 判斷，**登入不等於管理者**。「Allow new users to sign up」目前**已開啟**（玩家用 Google 登入），所以所有寫入政策必須只認管理者或本人。
- ⚠️ 免費方案：專案閒置一週會自動暫停（資料不會消失，需到後台恢復）。檔案儲存免費額度約 1 GB（請以官方頁面為準）；之後存規則書 PDF 要注意。

## 4. 前端資料欄位（`BoardGame` 型別）

- `id`、`name`（中文名，來自 CSV「屬性」）、`bggName`、`slug`、`coverSlug`、`links{bgg,rulebookZh,rulebookEn,faq}`、`category[]`、`bggScore/bggDifficulty/bggTime`、`minPlayers/maxPlayers`、`bestPlayers/recommendPlayers`（兩者獨立，不要合併）、`rankingEngine`、`classicGameRanking`（前端稱「常玩遊戲排名」，CSV 欄位「老遊戲想玩綜合評分」）、`scoreRank`（「綜合分數排名」，直接用 CSV 的「分數_排名」）、四個其他排名（保留但**不排序、不顯示**）、七個 `*Degree`、七個 `*Emoji`（`like/speed/communication/unique/playerImpact/complexity/change`）。
- CSV 必要欄位（缺任何一個，預覽會直接報錯、不會寫入）：`屬性`、`bggName`、`類型`、`bgg網站`、`BGG分數`、`BGG時間`、`BGG難度`、`Ranking engine`、`分數_排名`、`人數上限`、`人數下限`、`推薦人數`、`最佳人數`、`喜歡度`、`快速性`、`溝通性`、`獨特性`、`玩家影響性`、`複雜性`、`變化性`。欄位順序不重要、多的欄位會被忽略；**檔名不重要**。選填：`簡介`（見 N-3）。
- CSV：107 筆、35 欄；「類型」以逗號分隔切成陣列；「墨敵賽」無網路資料，BGG 分數與難度保留 `null`，顯示「未提供」，**不要編造**。
- 類型共 49 種：大項 3 個（策略、派對、陣營），其餘為小項。類型清單由資料自動整理（只有三個大項按鈕是寫死的）。
- **不要揭露「綜合分數排名」的計算方式**（Notion 中由數個排名相加），也不要在前端重算。
- **封面圖**：`coverSlug` 由 `bggName` 轉換（見 M-4 的 ASCII 安全版）。顯示順序：Supabase Storage `{coverSlug}.webp`（上傳後網址加 `?v=` 版本參數以立即換圖）→ `public/covers/{coverSlug}.webp|jpg|png` → 🎲。Console 裡的大量 404 是正常的。

## 5. 功能現況（細節見各附錄）

- 搜尋、篩選抽屜（難度、最佳／推薦人數、遊戲時間、類型；類型多選為 AND）、缺資料提示、排序（Ranking engine、常玩遊戲排名、綜合分數排名、名稱、BGG 分數／難度／時間、最佳／推薦人數；升降冪；缺值固定排最後）、檢視模式（清單 `list`、一排 4 `grid-4`、一排 9 `grid-9`，存 `localStorage` 鍵 `boardgame-view-mode`）。
- 詳細視窗**刻意精簡**：使用者明確不要再放排名、人數、類型、時間、難度。分頁結構見 N-2。
- 管理者登入／登出、匯入 CSV（含附封面圖，比對順序 `matchCovers`：完全相同的封面代號 → 去括號後相同／中文名相同 → 名稱開頭相同；同時符合多款則略過並提醒）、詳細視窗上傳／更換封面、規則書／FAQ 連結：均已實測上線。
- 玩家功能（Phase 2～4）、垃圾桶、遊玩紀錄、公開評分、社群統計、排行榜：見附錄。
- 「代辦清單」被當成首頁桌遊列表（使用者未反對）。

## 6. 長期願景與優先順序（使用者已排定）

- **最重要：AI 規則助手**：使用者上傳中英文規則書 PDF、FAQ PDF、圖示 PDF、規則網站；遇到易錯規則時給提示並**標明出處（哪本、第幾頁）**，找不到可靠依據要明說。**訪客也能問，但不能改設定**；訪客提問會產生 API 費用，要設計每人每日次數限制。需要：PDF 儲存與切段（保留頁碼）、AI 金鑰放後端、先搜尋再回答。Supabase 可提供儲存與資料庫，AI 呼叫需另外的後端函式。
- **主要**：討論與 FAQ（官方／管理員筆記 vs 玩家留言要能區分）、揪團報名（「想玩」與「報名」不要混為一談）、行事曆與布告欄。
- **次要**：完整帳號系統、總遊玩次數記錄（會影響「常玩遊戲排名」，是否改為自動計算尚未決定）。

## 6-1. 社群功能規劃（使用者已確認，2026-10-22）

**背景決定**
- 使用者想要：公開評分（取代留言板）、集點卡、全站想玩統計。對象先是使用者的朋友圈，但保留讓其他人加入的可能；不想手動替朋友建帳號，希望註冊簡單。
- **不採用匿名帳號**：Supabase 匿名使用者的資料庫角色也是 `authenticated`，會套用「所有 authenticated」的政策；且清除瀏覽資料就能再建新帳號，無法一人一帳。匿名帳號能做到的用 `localStorage` 訪客模式也做得到。
- **採用**：訪客不登入也能瀏覽，並把想玩、已玩存在本機；**登入玩家才能公開評分與計入社群統計**，登入後可換裝置同步。登入方式最後採 **Google**（原規劃 Email Magic Link，見附錄 G）。
- 一人多帳號無法完全阻止；先靠「每人每款一筆＋資料庫唯一限制＋RLS」，規模變大再加 CAPTCHA、異常偵測。

**階段（一次一階段，前一階段測試完才進下一階段）**

1. **Phase 1｜管理權限與資料安全** ✅
2. **Phase 2｜玩家登入與暱稱** ✅（`player_profiles`，暱稱公開、不公開 Email）
3. **Phase 3｜想玩／已玩／備註與雲端同步** ✅
4. **Phase 4｜公開評分** ✅（見 M-3、N-1）
5. **原 Phase 5（每月投票）** 改為「社群統計」✅ 與排行榜（附錄 D、O）
6. **Phase 6｜集點卡與成就**：依遊玩紀錄與完整評分累積，存資料庫並可追溯；已登入玩家跨裝置保留。與「常玩遊戲排名」的關係尚未決定。

**其他設計決定**：不做公開留言板（可日後加選填短評）。評分一律公開，不放進玩家設定。評分項目沿用使用者的用語，不要把「玩家影響性」改名成「玩家互動」。複雜度、快速性是遊戲屬性、不列入評分；運氣成分、教學難易、配件品質等先不加。

## 7. 路線圖

**已完成**：上述 Phase 1～4、社群統計、排行榜（程式已提供，待確認）、垃圾桶、遊玩紀錄、詳細視窗分頁、簡介。
**接下來**：見附錄 O-6（集點卡 → 上傳規則書 PDF → AI 規則助手 RAG；想做清單見附錄 L）。

## 8. 與使用者合作的規則（重要）

- 使用者是**程式初學者**，用**繁體中文**。（2026-10-23 起使用者明說：預設會照步驟執行，可一次給多個步驟；他回「好」就代表完成；遇到問題他會自己停下來問。舊版「一次一個步驟」已作廢。）
- 提供：明確檔案路徑；**完整可用程式碼，或精準修改位置**（用 `Ctrl + F` 搜尋）；指令解釋；測試方式。量大時給整份檔案或請他「整段刪掉換成」。
- **每個指令都標清楚貼在哪裡**（VS Code 終端機或 Supabase SQL Editor）。
- **你碰不到使用者的本機檔案**，也收不到 CSV。需要資訊就給 PowerShell／SQL 指令請他貼結果，或請他貼截圖。
- **大改 `App.tsx`、`AdminPanel.tsx`、`PlayerPanel.tsx`、`GameDocuments.tsx`、`src/components/*` 前，請使用者貼出目前版本**；判斷現況前先用 `git status`／`git log` 確認，不要憑貼來的內容下結論。
- 每階段改完用 `npm.cmd run build`，再實測畫面。build 成功不等於畫面正確。
- 不要破壞現有功能與 107 款資料。**不要要求使用者貼出密碼、Secret key、service_role key、資料庫密碼。**
- 影響資料、隱私的設計決策，先提方案並列「建議預設值」，等他回「照建議」再動工。

## 9. 待確認事項

- 規則書 PDF 是否上傳、私有 bucket、著作權處理；AI 規則助手支援全部桌遊或先 10～20 款、後端與模型選擇、訪客提問次數限制方式。
- 清單檢視、9 個一排的實際外觀是否滿意（清單檢視尚無截圖）。
- 總遊玩次數完成後，常玩遊戲排名是否改為自動計算。
- `陣營` 與 `策略` 可同時出現在同一款遊戲，目前允許。
- 帳號刪除與資料保留政策（目前要管理者在 Supabase 手動處理）。
- `makeCoverSlug` 新版是否已套用並重新匯入（見 M-4）。
- 排序功能要排什麼（使用者說之後再想）。

## 10. 多台電腦作業

**自動同步**：Supabase 的資料表、登入帳號、Storage 封面；GitHub 上的程式碼與 `public/covers/`。
**不會同步**：`.env.local`（要重建）、`boardgames.csv`（從 Notion 重新匯出）、**沒有 commit／push 的修改**。

**在新電腦第一次設定：**
1. 安裝 Git、Node.js（LTS 版）、VS Code。第一次用 Git 需設定姓名與 email（`git config --global user.name "..."`、`git config --global user.email "..."`），push 時會跳出 GitHub 登入視窗。
2. 在舊電腦專案資料夾執行 `git remote get-url origin` 取得倉庫網址。
3. 新電腦選一個資料夾，執行 `git clone <倉庫網址>`，然後 `cd` 進專案資料夾；確認在 `master` 分支。
4. 執行 `npm.cmd install`。
5. 專案根目錄建立 `.env.local`（純文字，兩行，不加引號）：
   ```
   VITE_SUPABASE_URL=https://hgeuockbjrzayfdylavq.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=（從 Supabase 後台 Project Settings → API Keys 複製 Publishable key）
   ```
   **只能用 Publishable key，絕對不要用 Secret／service_role key。**
6. 執行 `npm.cmd run dev`，打開 `http://localhost:5173/`，確認顯示 107 款、能登入管理者。

**日常習慣：**開始前先 `git pull`；結束前 `git add`（指定檔案）→ `git commit` → `git push`。不要兩台電腦同時改同一批檔案；未完成的工作用分支存。

---

## 附錄｜Phase 3 之後的紀錄（2026-10-22）

> 記錄 Phase 3 的設計、資料庫結構與決定。上面舊章節若與這裡衝突，以這裡為準。

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
| `play_count` | integer，預設 0，0～999 | 沒有日期的遊玩次數（見 M-2） |

- 主鍵 `(user_id, bgg_name)`，重試同步不會產生重複資料。
- RLS 四條政策都是 `user_id = (select auth.uid())`，角色 `authenticated`；`anon` 無權限。
- 觸發器 `user_game_status_set_times`（`before insert or update`，函式 `public.set_user_game_status_times()`，`set search_path = ''`）：新增時依勾選狀態寫入首次時間；更新時 `coalesce(old.值, 新勾選才寫 now())`，所以**取消再重新勾選不會改變首次時間**，前端傳進來的值會被蓋掉。
- 因此取消勾選時**不刪除那一列**；前端讀取時略過「想玩、已玩、備註全空」的列。
- 建立觸發器前的舊紀錄已用 `updated_at` 補上首次時間（`Rising Sun` 的兩個時間因此等於 `updated_at`，屬預期）。

### B. 前端結構（Phase 3 之後）

- `src/lib/usePersonalCollection.ts`：
  - 型別 `PersonalEntry { wantToPlay, played, note }`、`PersonalCollection = Record<bggName, PersonalEntry>`。
  - 訪客：`localStorage` 鍵 `boardgame-personal-collection`；登入後以雲端為準並**不再寫 localStorage**。
  - 回傳：`entries`、`getEntry`、`updateEntry`、`isLoggedIn`、`canEdit`、`status`（`guest`／`loading`／`ready`／`error`）、`errorMessage`、`clearError`、`reload`、`needsMerge`、`localCount`、`mergeStatus`、`mergeLocalIntoCloud`、`declineMerge`。
  - 登入後更新採「先改畫面、再寫雲端，失敗還原並顯示提示」；雲端讀取完成前不能改。
  - 首次合併規則：兩邊聯集；想玩／已玩任一邊有勾就有；備註雲端已有就保留雲端；雲端寫入成功才清空本機；失敗保留本機並可重試；「不加入」只在該次工作階段有效。
- `StatusButtons`（封面 `overlay` 與詳細視窗 `inline` 兩種版型）、`PersonalNote`（離開欄位才儲存）、合併視窗 `MergeDialog`、錯誤提示條 `PersonalToast`。
- `src/MyList.tsx`：右側抽屜（`mylist-*` 樣式，z-index 1100／1200），用 `renderCover` 屬性借用 `CoverImage`，避免循環匯入。畫面名稱已改「我的桌遊」（O-3）。

### C. 「我的紀錄」篩選與新遊戲標示（已完成）

- `type MineGroup = 'want' | 'untouched' | 'played'`；`getMineGroup(entry)`：有想玩→`want`；否則有已玩→`played`；否則→`untouched`。`Library` 狀態 `groupByMine`、`hiddenGroups`；`displayedItems`（`header`／`game` 混合陣列）、`displayedGameCount`。順序：搜尋與篩選 → 排序 → 依眼睛隱藏 → 若開啟分區則分組。篩選抽屜 `mine-filter` 區（三顆眼睛按鈕＋「依我的紀錄分區顯示」）；篩選徽章與「清除篩選」都會計入。
- 新遊戲標示：`board_games.created_at` 在 30 天內（`NEW_GAME_DAYS = 30`、`isNewGame()`）顯示橘色外框＋NEW 標籤。**現有遊戲的 `created_at` 要先補成 `2026-09-01T00:00:00+00`**，否則全部會變「新」。

### D. 社群統計（已完成，見 O-1）

- 直接用大家的想玩／已玩清單；每款顯示「目前人數」與月／季／年「期間新增」（以 `want_first_at`／`played_first_at` 計算，每人每款只算第一次）；只顯示彙總人數；訪客不計入；以 `security definer` 資料庫函式回傳彙總數字，不開放別人的列；人數少可被推測，已寫進 `privacy.html`。
- **不加「讚」按鈕**（♥ 已代表想玩，且與評分「喜歡度」重複）。

### E. Git 事故紀錄（避免重演）

- 2026-10-22：使用者在 TortoiseGit 以 Amend 修改上一次提交，把含程式的提交換成只含文件的提交，造成 `master` 與 `origin/master` 分岔。修法：備份檔案與分支後 `git reset --mixed origin/master`（不動工作資料夾），再逐檔 add 提交。
- 之後請使用者用命令列 commit，不要在 TortoiseGit 使用 Amend。

---

## 附錄 G／H｜遺失待補（2026-10-23 還原時註記）

> 這兩節在 git 歷史與所有版本裡都找不到，下面是從 `QUICKSTART.md` 描述**重建的摘要**，不是原文。

### G（重建摘要）｜Phase 1／2
- Phase 1：`admin_users` ＋ `is_admin()`；`board_games`、`game_documents`、Storage `covers` 的寫入政策全部只認管理者。
- Phase 2：`player_profiles`（暱稱公開、不含 Email）、`src/PlayerPanel.tsx`、`public/privacy.html`；改用 Google 登入（Google Cloud 專案 `board-game-site`，OAuth 已發布為正式版、只用基本範圍）；已開啟 Supabase 註冊。

### H（重建摘要）｜詳細視窗圓點改版（2026-10-23）
- 五個區塊小標 01～05；六項評分全用圓點（3 欄 × 2 列、各項不同顏色，圓點數＝emoji 個數）；想玩／已玩橫排按鈕、遊玩次數一列（`PlayCounter`）、備註；頂部 `BoardGameGeek ↗` ＋ `☆ 8.2 BGG SCORE`。（之後又改為四分頁，見 N-2。）
- 遊玩次數計數器設計（使用者決定）：－／數字／＋（0～999）；按「已玩」不會增加次數（次數為 0 時才設為 1）；次數與「已玩」狀態各自獨立；訪客存 `localStorage`，登入合併時取較大值。

---

## 附錄 I｜拆檔與垃圾桶（2026-10-23；與上面衝突時以這裡為準）

### I-1. 拆檔（完成）
- `src/App.css` 變成入口檔，以 `@import` 載入 `src/styles/`（順序有影響，不要調換）：`base`、`topbar`、`hero`、`library`、`filter`、`cards`、`modal`、`admin`、`mylist`、`footer`、`trash`、`docs`，之後加 `backtotop`、`tabs`、`ratings`、`leaderboard`。
- `src/App.tsx` 拆開後，`Library` 只留狀態、篩選與排序、`displayedItems`：
  - `src/lib/`：`libraryTypes.ts`（`LibraryGame`、`SortKey`、`ViewMode`、`MineGroup`、`getMineGroup`、常數）、`gameFormat.ts`、`fetchBoardGames.ts`（含 `BoardGameRow`、`rowToGame`）、`personalApi.ts`、`useTrashActions.ts`。
  - `src/components/`：`Icons`、`CoverImage`、`StatusButtons`、`RatingDots`、`PlayCounter`、`PersonalNote`、`TopBar`、`ViewToggle`、`FilterDrawer`、`GameCard`、`GameModal`、`MergeDialog`、`PersonalToast`、`TrashSection`（之後又加了 `BackToTop`、`RatingSection`、`PlaySessions`、`DescriptionEditor`、`Leaderboard`）。
  - 「更多類型」的計算進 `FilterDrawer`；Esc 關閉進 `GameModal`。`categories` 等 `useMemo` 的相依為 `[boardGames]`（因為垃圾桶會改變清單）。
- `PlayerPanel.tsx`：登入後只顯示一顆暱稱按鈕（`.player-chip`），登出放進暱稱視窗。

### I-2. 垃圾桶（已實測通過，見 K-1）
- **決定（使用者）**：所有人（含訪客）都看得到垃圾桶；只有管理者能移入、還原、永久刪除。資料庫**不改政策**：`board_games` 現有四條政策：Anyone can read（anon, authenticated；`true`）、Admin insert／update／delete（`is_admin()`）。曾建議的「讀取政策拆兩條」**不執行**。
- 資料庫：`board_games.removed_at timestamptz`（空值＝正常；有值＝在垃圾桶）。
- 前端：`Library` 以 `allGames` 分出 `boardGames`（主畫面、篩選、計數、我的桌遊都只用這個）與 `trashedGames`；`App` 持有 `games` 狀態，`updateGames` 在移入／還原／刪除成功後更新畫面。
- 移到垃圾桶：詳細視窗小字（管理者），先確認，`update ... select('bgg_name')` 確認真的有更新才改畫面（RLS 擋掉時會回 0 列並提示）。
- `TrashSection`：頁面最下方；預設收合；0 款時整區不顯示（設計如此）；訪客只看封面、名稱、移除日期、原因；管理者多「還原」「永久刪除」「編輯原因」。
- 永久刪除：刪 `board_games` 該列與 Storage `{coverSlug}.webp`（別款還在用同封面代號則保留）；**不清 `user_game_status`**；封面刪除後無法復原。
- 詳細視窗規則書與 FAQ 區為單行樣式（`.game-docs-row`，樣式在 `docs.css`）；垃圾桶樣式在 `trash.css`。

---

## 附錄 J｜早期版本（2026-10-21）中仍有用的細節

> 完整欄位以 `boardGames.generated.ts` 與第 4 節為準；原本的欄位對照表已刪除（與第 4 節重複）。

### 3.1 CSV 結構
- 107 筆、35 個欄位，無重複桌遊；中文名稱在「屬性」欄，BGG 網址在「bgg網站」欄。
- 類型共 **49 種**：大項 3 個（策略 77 款、派對 23 款、陣營 8 款），其餘 46 種為小項（卡牌驅動 22、區控 18、工擺 17、爬軌 16、引擎構築 13…）。**類型來自使用者的 Notion，新增類型只要重新匯入，網站會自動出現。**
- 「推薦人數」「最佳人數」為逗號分隔數字，轉成數字陣列。「最佳人數 」欄位名稱尾端可能有空白，已用 `cleanText` 處理。
- 缺值：「墨敵賽」沒有網路資料，BGG 分數與難度保留 `null`、顯示「未提供」，**不要編造**。

### 3.3 排名欄位的決定（使用者已決定）
- 排序只保留三個：Ranking engine、**常玩遊戲排名**（`classicGameRanking`）、**綜合分數排名**（`scoreRank`），皆由小到大。其餘四個排名不加入排序。
- 「綜合分數排名」在 Notion 中由數個排名相加而成，**不要向使用者揭露計算方式**，也不要在前端重算。
- 常玩遊戲排名之後要繼續用 CSV，還是由遊玩紀錄自動算出，**尚未決定**。

### 3.5 封面圖片
- 圖片放在 `public/covers/`，檔名 = `coverSlug` + 副檔名（`.webp`、`.jpg`、`.png`，網站依序嘗試）。例：`Camel Up (Second Edition)` → `camel-up-second-edition`。
- 用 `bggName` 而不是 `id` 對應圖片，是為了 CSV 順序改變時圖片不會對錯；**更新 CSV 只改文字資料，不會動封面圖片**。
- `CoverImage` 找不到圖片時顯示 🎲，所以可以慢慢補圖。

### 實作細節
- `compareNullableNumbers()`：缺值（null）固定排最後，不受升降冪影響。
- `formatNumber()`：null／undefined 顯示「未提供」。
- `formatPlayers()`：人數連續時顯示範圍（例如 `2–4 人`），否則以頓號列出。
- 預設排序：`rankingEngine`，升冪。

### 使用者原話（檢視模式）
「我的代辦清單還要增加一下檢視畫面，可以變成清單或者一排 4 個的檢視畫面或者一排 9 個的檢視畫面或者其他檢視畫面。」

---

## 附錄 K｜垃圾桶實測完成與 App.css 入口檔（2026-10-24）

### K-1. 垃圾桶：已實測通過
- 管理者移入／還原、訪客只看不能操作等均通過；`board_games.removed_at` 已確認存在。垃圾桶相關政策仍**不改**。

### K-2. `App.css` 入口檔（本機曾是舊檔）
- 2026-10-24 發現：使用者本機 `src/App.css` 仍是拆檔前的舊整份（約 1500 行），`src/styles/` 的檔案沒被載入，所以垃圾桶與單行樣式沒生效。已換成只有 `@import` 的入口檔，build 通過、畫面使用者回「好」。舊檔備份為 `App.css.bak`（不要 add）。
- 待確認：該修改是否已 commit／push；可用 `git log --oneline -- src/App.css` 查舊檔何時被換回。
- 教訓：使用者貼來的檔案可能是舊版；判斷現況前先用 `git status`／`git log`／`Get-Content ... -First 15` 確認。

### K-3. AI 助手橫幅
- 橫幅內的文字是整塊置中。建議在 `src/styles/footer.css` 的 `.assistant-copy` 加 `flex: 1; text-align: left;`；是否真的修改要用 `git diff` 確認，不改也不影響功能。

---

## 附錄 L｜CSV 匯入改為移到垃圾桶、想做清單（2026-10-24）

### L-1. CSV 匯入配合垃圾桶（已實測完成）
- 改動在 `src/AdminPanel.tsx`：讀取資料庫時多讀 `removed_at`；「CSV 沒有的遊戲」不再刪除，改為 `update ... set removed_at = now()`（只動 `removed_at` 為空的），不刪資料列、不刪 Storage 封面。
- 預覽分三類：`removed`（資料庫正常、CSV 沒有 → 這次會移到垃圾桶，紅字名單）、`trashedInCsv`（已在垃圾桶、CSV 有 → 資料更新但**仍留在垃圾桶**，要放回請用「還原」）、`alreadyTrashed`（已在垃圾桶、CSV 也沒有 → 維持原狀）。
- 保護：一次移到垃圾桶超過 5 款，要輸入「移除」。順序：upsert → 上傳封面 → 移到垃圾桶。
- 設計決定（建議預設，使用者未反對）：CSV 裡有、但垃圾桶裡的遊戲**不自動還原**。若想自動還原，在 `toRow` 加 `removed_at: null`。
- 永久刪除只在垃圾桶區由管理者手動做。
- 地雷：在 Notion 改 `bggName` → 舊的進垃圾桶、新的當新遊戲（封面要重傳）；新舊 `cover_slug` 相同會撞唯一限制；**玩家的想玩／已玩／評分紀錄以 `bgg_name` 對應，改 `bggName` 會讓紀錄失聯**（資料還在、畫面不顯示）。
- 下次匯入後，請使用者執行 `select bgg_name, created_at from public.board_games order by created_at desc limit 5;`，確認舊遊戲的 `created_at` 沒被重設。

### L-2. 使用者的想做清單（尚未排序、尚未動工）

標「使用者原話」的是使用者自己列的；標「貼上的建議」的是使用者貼上來的 AI 建議，只是列入考慮，不算已決定。

**小功能**：新增排序功能（使用者原話只寫這句，待確認要排什麼）。（回到頂端、垃圾桶售出原因、私人／大家的分數表＝Phase 4 都已完成。）

**把「我的清單」升級成「我的桌遊」個人管理中心（使用者原話）**
- 想玩：可標記「近期想玩」「下次聚會想玩」；一鍵從想玩移到已玩，或兩者同時保留；可依加入時間、排名、遊戲時間排序；「把我之前說的排行加進去」（＝常玩遊戲排名，已確認）。
- 已玩與遊玩紀錄：遊玩次數、最近一次日期（已有）；每次遊玩記錄對手或朋友、勝負、心得；個人評分與 BGG 評分分開顯示。
- 統計：累積遊玩次數與總時數、最常玩遊戲、最喜歡的類型、最常玩的玩家人數、每月遊玩次數趨勢。
- 貼上的建議：抽屜分頁「想玩」「已玩」，完整管理頁再放「遊玩紀錄」「我的統計」。

**集點卡（使用者原話，規則較複雜）**
- 玩家要先填完評分表單才能集點（完整評分＝七項全非空，見 N-1）；管理者設定「今天參加的人」，被設定的人才有權限填表。
- 使用者想過用區域網路或藍牙判斷附近有誰；**建議不要**（網頁無法可靠偵測），改用管理者勾選名單，或每場聚會產生一次性代碼／QR。
- 同一個月來兩次，下次免費：集滿 2 點就自動產生一張無期限兌換券；當月沒集滿，到下個月 1 日自動取消那 1 點。（建議集點「讀取時才依月份計算」，不用排程工作。）
- 一天可能玩多款遊戲，但一天要把自己玩過的所有遊戲都填完，一天只算一點。
- 規則要在畫面上寫清楚。管理者看得到所有人的集點狀況；玩家只看得到自己的。
- 前置：聚會場次（誰參加）、集點與兌換券資料表；RLS：玩家只能讀自己的、管理者讀全部、點數只能由資料庫函式寫入。

**揪團與聚會規劃（第三階段，使用者原話）**：從想玩清單挑聚會候選遊戲；設定日期、人數、地點、遊戲時間；朋友報名與候補；顯示參加者共同想玩的遊戲；依當天人數推薦桌遊。

**「今天想玩什麼？」推薦（貼上的建議）**：問玩家人數、預計時間（30／60／90 分鐘內、不限）、難度，從想玩清單或全部挑選；用現有的最佳人數、推薦人數、時間、難度、排名資料就能做第一版，不需要 AI。

### L-3. 沒登入時的紀錄會跨瀏覽器嗎？
- 不會。沒登入時只存在該瀏覽器的 `localStorage`；登入 Google 才會同步到 Supabase。
- 沒登入時做的紀錄：先在原瀏覽器登入，出現合併視窗時按「加入我的帳號」，之後在別的瀏覽器登入即可看到。
- 清除瀏覽資料或換電腦前，沒登入的紀錄會消失，可考慮在畫面上多提醒一次。

### L-5. AI 規則助手必須用 RAG；拖曳排名（2026-10-24 晚）
- **RAG（使用者明確要求）**：回答只能根據檢索到的規則書／FAQ 片段；必須列出出處（哪本、第幾頁，最好附引用片段）；找不到可靠依據時要明說，不可憑空回答。技術方向（待決定）：PDF 擷取文字、切段並保留頁碼、檢索（Supabase 可用 pgvector；中文要注意斷詞，可能需向量＋關鍵字混合）；AI 金鑰只放後端；訪客提問要有每日次數限制；規則書 PDF 存私有 bucket。
- **拖曳調整排名＋匯出 Notion CSV**：使用者想要，說「晚點再嘗試」，細節見 L-6。

### L-6. 拖曳排名編輯：已確認事項與建議設計（尚未動工）
**已確認**：要拖曳的 6 個排名（Notion 欄名＝`parseCsv.ts` 欄名＝資料庫欄位），**6 欄都已存在，不需改資料庫**，現有的 Admin update 政策就夠用：

| Notion／CSV 欄名 | 資料庫欄位 | 前端欄位 |
|---|---|---|
| Ranking engine | `ranking_engine` | `rankingEngine` |
| 老遊戲想玩綜合評分（網站稱「常玩遊戲排名」） | `classic_game_ranking` | `classicGameRanking` |
| 溝通排名 | `communication_ranking` | `communicationRanking` |
| 獨特排名 | `unique_ranking` | `uniqueRanking` |
| 玩家影響性排名 | `player_impact_ranking` | `playerImpactRanking` |
| 變化排名 | `change_ranking` | `changeRanking` |

- 功能只給管理者，目的是更新使用者自己的 CSV。「綜合分數排名」由 Notion 算，網站不重算、不揭露算法；網站拖曳儲存後，它要等「匯出 CSV → 匯入 Notion → 從 Notion 匯出完整 CSV → 匯入網站」才會更新。

**建議設計（使用者尚未回「照建議」）**
- 入口：管理者登入後頁尾多「排名編輯」，全螢幕視窗；下拉選 6 個排名之一，列表依該排名排序。
- 拖曳用 `@dnd-kit`（手機可拖）。拖一格＝與鄰居交換，拖多格＝中間順移一格；每列保留原本的排名數字，只有被影響的幾款變動。
- 沒有排名數字（null）的遊戲放最下面「未排名」，第一版不能拖。
- 先顯示「將更新 N 款」，按「儲存」才批次寫入；未儲存離開要提醒。
- 匯出 CSV：欄位為「屬性」「bggName」加上述 6 欄（欄名同 Notion），UTF-8 含 BOM；檔名如 `boardgame-rankings-日期.csv`。
- 畫面要提醒：網站改過排名後，若先匯入舊的 Notion CSV，網站排名會被覆蓋。

**注意與待確認**
- `parseCsv.ts` 的必要欄位只含 `Ranking engine` 與 `分數_排名`；其他 4 個排名欄位若 CSV 沒有，會被當成 `null` 並覆蓋資料庫。日後可考慮把 6 欄都加入必要欄位檢查。
- 待使用者在 Notion 確認：「合併」匯入 CSV 是否用標題欄「屬性」對應遊戲（建議先用小 CSV 試）；排名為空的遊戲怎麼排。
- 開工前請使用者貼目前的 `AdminPanel.tsx`、`fetchBoardGames.ts`。

---

## 附錄 M｜遊玩紀錄、Phase 4 資料表、封面代號修正（2026-10-24 下午）

### M-1. 已完成並實測
- **回到頂端按鈕**：`BackToTop.tsx`、`backtotop.css`；往下捲超過一屏才出現。
- **垃圾桶移除原因**：`board_games.removed_reason`（≤200 字）。管理者移入時用 `window.prompt` 填原因（可留空，取消則不移動）；垃圾桶區顯示「原因：○○」；還原時清空原因與 `removed_at`；`useTrashActions.editReason(game)` 與 `TrashSection` 的「編輯原因」按鈕（`App.tsx` 要傳 `onEditReason={trash.editReason}`）。
- **privacy.html**：已加入遊玩紀錄說明。

### M-2. 遊玩紀錄 `game_play_sessions`（已上線）
- 欄位：`id`(uuid)、`user_id`（預設 `auth.uid()`，`on delete cascade`）、`bgg_name`、`played_on`(date，預設今天)、`player_count`(1～99，可空)、`note`(≤200)、`created_at`。**不對 `board_games` 加外鍵。**
- RLS 四條政策皆為 `user_id = (select auth.uid())`，角色 `authenticated`；`anon` 無權限；已撤銷 `authenticated` 的 `truncate, references, trigger`。
- **次數定義（使用者設計，重要）**：`user_game_status.play_count` ＝「沒有日期的次數」；有日期的次數＝該遊戲在 `game_play_sessions` 的筆數；**畫面總次數＝兩者相加**。新增紀錄只寫紀錄表並把遊戲標為已玩（`updateEntry(..., { skipPlayedRule: true })`）；刪除紀錄只刪那一筆，不動 `play_count`、不取消已玩。計數器 － 只減 `play_count`，為 0 時反灰。
- 前端：`src/lib/useGamePlaySessions.ts`（不帶參數，在 `Library` 呼叫一次，提供 `getSessions`、`getSummary`、`addSession`、`deleteSession`、`reload`、`status`、`busy`；`todayLocal()` 用本機日期）。`GameModal` 與 `MyList` 都收 `playSessions` 屬性。`PlaySessions.tsx`、`PlayCounter.tsx`（收 `datedCount`）。只有登入玩家能用，訪客不存本機。
- 已知限制：①單次查詢預設最多 1000 筆，接近時要改分頁；②若有日期紀錄、次數 0，又手動取消再勾「已玩」，舊規則會把 `play_count` 設成 1，總次數多 1（罕見）。

### M-3. Phase 4 公開評分：資料庫
- 設計（使用者確認）：整體 1～10；六項 1～5（喜歡度、玩家影響性、溝通性、變化性、獨特性、適合留下來程度）；每人每款一筆、可修改；公開門檻 5 人；**第一版不做私人分數**；未登入可看公開彙總，登入才能評分。（必填／選填的最終版本見 N-1。）
- 資料表 `public.game_ratings`：主鍵 `(user_id, bgg_name)`；欄位 `overall`、`like_score`、`player_impact_score`、`communication_score`、`change_score`、`unique_score`、`keep_score`、`created_at`、`updated_at`（觸發器 `game_ratings_set_updated_at`）。RLS 四條政策皆只允許本人；`anon` 無權限。
- **個別評分只有本人看得到，公開的只有彙總**：函式 `public.get_rating_summaries()`（`security definer`、`set search_path = ''`，授權 `anon`、`authenticated`）回傳每款 `rating_count`、`overall_avg` 與六項平均；**門檻在資料庫判斷**（整體不到 5 人不回傳平均，六項各自計算）。門檻 5 寫死在函式裡，要改用 `create or replace function`。
- 評分隨帳號 `on delete cascade` 刪除，刪帳號後平均會變動，屬預期。

### M-4. 封面上傳失敗：`Invalid key: 兵臨城下.webp`
- 原因：Supabase Storage 的物件名稱不接受中日文；舊 `makeCoverSlug` 保留所有 Unicode 字母。已知受影響：「蒼天之死 (Death of Heaven)」「Death Note 人狼」「冷たい彼女が目覚める前に (Embalming Girl)」「新幕 桜降る代に決闘を 基本セット…」，另有「兵臨城下」相關。
- 修法（已提供，**待確認使用者是否已套用**）：`parseCsv.ts` 的 `makeCoverSlug` 改為：純英數字結果維持原代號（現有封面不受影響）；含中日文者保留英數字部分再加 `shortHash(原名稱)`（FNV-1a 8 位十六進位）；完全沒有英數字則為 `game-<hash>`。
- 套用後：重新匯入同一份 CSV 覆蓋 `cover_slug`，再執行 `select bgg_name, cover_slug from public.board_games where cover_slug !~ '^[a-z0-9_-]+$';`，**應為 0 列**。
- `matchCovers`：完整中文檔名仍可對應；只寫部分中文名的前綴比對會失效，這種改在詳細視窗上傳。
- 教訓：任何要當檔名或 Storage key 的字串都必須是 ASCII。

### M-6. 權限收斂
- 已對 `game_play_sessions`、`user_game_status` 執行 `revoke truncate, references, trigger ... from authenticated`（Supabase 預設會多給這三項）；`game_ratings` 建表時已一併處理。可用 `information_schema.role_table_grants` 再確認。
- **之後新建任何資料表，建表 SQL 都要順手加這行 revoke，並確認 `anon` 無權限。**

### M-7. 協作注意
- 使用者貼程式碼時常貼錯位置。**修改量大時，直接給整份檔案，或請他「整段刪掉換成」。**
- 使用者說「好」表示照做完成，但不一定貼測試結果，重要項目要再問一次。

---

## 附錄 N｜公開評分、分頁改版、簡介、規則分頁（2026-10-25）

### N-1. Phase 4 公開評分（前端已完成並上線）
- 檔案：`src/lib/useGameRatings.ts`（在 `Library` 呼叫一次，讀公開彙總與自己的評分，提供 `getSummary`／`getMine`／`saveRating`／`deleteRating`）、`src/components/RatingSection.tsx`（匯出 `CommunitySummary` 與預設的 `RatingSection`）、`src/styles/ratings.css`（樣式一律 `rate-` 開頭，避免和 `modal.css` 的 `.rating-label` 撞名）。
- 七項：**整體 1～10（必填）、適合留下來程度 1～5（必填）**，其餘五項選填、預設收合；畫面顯示「已填 N / 7 項」。
- **集點卡條件（日後用）**：七項全部非空才算完整評分，由資料庫函式判斷，不另存標記。
- `game_ratings.keep_score` 已設為 `not null`（若沒做，補執行 `alter table public.game_ratings alter column keep_score set not null;`）。
- 未滿 5 人顯示「評分累積中（N 人）」；六項各自判斷、各自未達門檻顯示「累積中」。
- 社群平均與使用者自己的 Emoji 評價並排，**不要與「綜合分數排名」混用**。`privacy.html` 已加入評分說明。

### N-2. 詳細視窗分頁（`GameModal.tsx`、`src/styles/tabs.css`）
- 頂部固定（封面、名稱、BGG 連結、BGG 分數、類型、分頁列），只有內容區捲動；手機全螢幕。
- 四個分頁：**概覽**（簡介、遊戲屬性、大家的評分摘要、管理者的封面上傳與「移到垃圾桶」）、**評分**、**我的桌遊**（想玩／已玩、遊玩次數、遊玩紀錄、備註）、**規則**（規則書與 FAQ、中文介紹、影片連結；管理者的新增表單）。
- AI 查詢分頁**等 AI 規則助手做出來再加**。
- `GameModal` 的 `game` 型別是 `LibraryGame`。簡介編輯的樣式（`.desc-*`）被貼進了 `topbar.css`，不影響使用。

### N-3. 遊戲簡介
- `board_games.description text not null default ''`，檢查 ≤ 300 字。
- CSV 欄名「簡介」，**選填**：沒有這欄或該款空白，都**不會覆蓋**資料庫原有簡介（`AdminPanel.tsx` 匯入的「步驟 0」只對有簡介的款數另外 upsert）；CSV 無法清空簡介，要清請在網站編輯或 Table Editor。
- 管理者在「概覽」可新增、編輯、刪除：`DescriptionEditor.tsx`、`saveDescription.ts`（`update ... select('bgg_name')` 確認真的有更新）。
- 使用者說簡介太耗時間，**先跳過、晚點再寫**。若請 AI 擬草稿：不要翻譯或改寫 BGG 簡介，只寫「這款在玩什麼」一到兩句自己的話；不確定的遊戲不要硬寫。

### N-4. 規則分頁的文件連結（`game_documents`）
- `doc_type` 現有：`rulebook`、`faq`、`errata`、`intro`（中文介紹）、`video`（影片）、`other`。`game_documents_video_not_indexed`：影片的 `ai_indexed` 永遠不能是 true。
- **RAG 原則（使用者要求）**：AI 規則助手**不可以從影片查規則**；RAG 只能讀 `ai_indexed = true` 的文件。中文介紹（`intro`）有著作權疑慮，是否索引做 RAG 時再決定；較安全的用法是把連結當「延伸閱讀」。
- 檔案：`src/lib/useGameDocuments.ts`（`GameModal` 呼叫一次再傳給 `GameDocuments`）、`src/GameDocuments.tsx`（收 `api` 與 `isAdmin`，分三組顯示）。

---

## 附錄 O｜社群統計完成、排行榜、「我的桌遊」改名（2026-10-25）

### O-1. 社群統計：已完成
- 使用者回報已 commit 並 push。`src/lib/useCommunityStats.ts` 提供 `CommunityStatsApi.getStats(bggName)`，欄位含 `wantCount`、`playedCount`、`wantMonth`／`wantQuarter`／`wantYear`、`playedMonth`／`playedQuarter`／`playedYear`。

### O-2. 排行榜（程式已提供，**待使用者套用、build、實測、commit**）
- 新增：`src/lib/leaderboards.ts`（`rankGames`：同分並列，例如 1、1、3，只保留前 10 名）、`src/components/Leaderboard.tsx`、`src/styles/leaderboard.css`（樣式 `lb-` 開頭；`App.css` 加 `@import './styles/leaderboard.css';`）。
- 修改：`TopBar.tsx`（整份換掉，多「排行榜」按鈕，新屬性 `onOpenLeaderboard`）、`MyList.tsx`（兩處改名）、`App.tsx`（四處：`import Leaderboard`、`isLeaderboardOpen` 狀態、`TopBar` 傳 `onOpenLeaderboard`、在 `<BackToTop />` 上方放 `<Leaderboard ... renderCover={...} />`，點榜單遊戲會關閉抽屜並開啟詳細視窗）。
- 四個榜：**想玩、已玩**（可切「全部／本月／本季／本年」；全部＝目前總人數，其餘＝期間新增人數，右側小字顯示目前總人數）、**整體評分、適合留下來**（用 `ratings.getSummary`，平均四捨五入到小數 1 位，右側顯示評分人數；**需滿 5 人才上榜**）。
- 沿用「我的桌遊」抽屜樣式（`mylist-*`），只新增 `lb-tabs`、`lb-periods`、`lb-rank`、`lb-value`。隱私：只用彙總人數與平均，不顯示個別玩家；訪客不計入。
- 測試重點：頂端兩個按鈕在窄螢幕是否擠在一起（擠就改圖示）；評分榜目前應為空；點榜單遊戲能開詳細視窗。
- 建議 commit：`git add src/lib/leaderboards.ts src/components/Leaderboard.tsx src/components/TopBar.tsx src/MyList.tsx src/App.tsx src/App.css src/styles/leaderboard.css`，訊息「新增排行榜；我的清單改名我的桌遊」。

### O-3. 小改動
- 「我的清單」畫面名稱改為「我的桌遊」（`MyList.tsx` 的 `aria-label` 與 `<h2>`、頂端按鈕文字）；檔名仍是 `MyList.tsx`。
- 卡片按鈕「查看規則」改為「詳細資料」（`GameCard.tsx`）。**狀態**：`GameCard.tsx` 與 `public/privacy.html` 已 `git add`，**尚未 commit，差異未驗證**。請使用者貼 `git diff --cached --stat`、`git diff --cached src/components/GameCard.tsx`、`git diff --cached public/privacy.html`（`privacy.html` 可能只是換行字元差異）。

### O-4. `privacy.html` 待補
- 在「三、公開評分與社群統計」的 `<ul>` 加：「網站的排行榜只依各遊戲的彙總人數（想玩、已玩、評分平均）排名，不顯示任何玩家的個別紀錄，也不顯示是誰標記或評分。」
- 先用 `Select-String -Path public\privacy.html -Pattern "排行榜"` 確認有沒有加過。

### O-5. 協作注意
- 使用者曾把 PowerShell 指令貼進 Supabase SQL Editor 而報錯。**每個指令都要明寫貼在哪裡。**
- 上一次聊天室因免費額度中斷；接手時不要假設上一則回覆的步驟已完成，先問實際狀態。

### O-6. 下一步
1. 確認排行榜、`GameCard`、`privacy.html` 的實際狀態並 commit。
2. **集點卡（Phase 6）**。開工前請使用者在 Supabase SQL Editor 貼兩個查詢結果：①`player_profiles` 的欄位；②管理者函式名稱（`is_admin` 等）。規則見 L-2。
3. 之後：上傳規則書 PDF（私有 bucket）→ AI 規則助手（RAG）；想做清單見附錄 L。
