# 桌遊規則助手 — 懶人包（給下一個 AI）

> 3 分鐘版。細節請看 `PROJECT_CONTEXT.md`（最底下有「Phase 3 之後的紀錄」）。最後更新：2026-10-23（由 git 歷史還原合併；CSS 與 App.tsx 已拆檔；垃圾桶程式已提供待測；等 privacy.html）

## 這是什麼

使用者在做一個**公開給朋友瀏覽的桌遊收藏網站**「桌遊規則助手」，目前有 107 款桌遊，能搜尋、篩選、排序、看封面和評分。最終目標是讓大家能問 **AI 規則助手**，AI 要根據使用者上傳的規則書 PDF 回答，並標明出處與頁碼。

- 線上網址：https://board-game-result-ai.vercel.app/（GitHub `master` 分支 → Vercel 自動部署）
- 技術：React + TypeScript + Vite + **Supabase（資料庫、登入、檔案儲存，免費方案，首爾）**
- 本機路徑：`D:\BoardGameResultAI`（Windows、PowerShell、用 `npm.cmd`）。使用者會在多台電腦作業，路徑可能不同，見 `PROJECT_CONTEXT.md` 第 10 節。
- **程式結構（2026-10-23 拆檔後）**：`src/App.css` 只是入口，用 `@import` 載入 `src/styles/*.css`（base、topbar、hero、library、filter、cards、modal、admin、mylist、footer，另有待測的 trash、docs）。`src/App.tsx`（約 700 行）只留 `Library` 的狀態與篩選／排序邏輯，畫面拆成 `src/components/`：`TopBar`、`ViewToggle`、`FilterDrawer`、`GameCard`、`GameModal`、`MergeDialog`、`PersonalToast`、`TrashSection`、`CoverImage`、`StatusButtons`、`RatingDots`、`PlayCounter`、`PersonalNote`、`Icons`；型別與工具在 `src/lib/`：`libraryTypes.ts`、`gameFormat.ts`、`fetchBoardGames.ts`、`personalApi.ts`、`useTrashActions.ts`。
- 桌遊資料存在 Supabase 的 `board_games` 資料表；網站讀取失敗時才退回本機 `boardGames.generated.ts`。
- 資料更新流程：Notion 匯出 CSV → 網站頁尾登入管理者 →「匯入 CSV」→ 預覽 →「確認匯入」。

## 使用者是誰、怎麼合作

- **程式初學者**，繁體中文。
- **使用者已明確說過：預設他會照步驟執行，不用每一步都確認；可以一次給最多 4 個步驟；遇到問題他會自己停下來問；他回「好」就代表沒問題、可以繼續。**（舊版「一次只給一個步驟」已作廢。）
- 會影響資料、隱私的設計決策，仍先提方案並列出「建議預設值」，讓他回「照建議」或指定修改，再動工。
- 給法：明確檔案、`Ctrl + F` 搜尋位置、完整程式碼、測試步驟；每批結尾給測試清單與 `git add` 指令。
- 你**碰不到**他的檔案，也**收不到** CSV。要資訊就給 PowerShell／SQL 指令，請他貼結果或截圖。
- **大改 `App.tsx`、`AdminPanel.tsx`、`PlayerPanel.tsx`、`GameDocuments.tsx` 或 `src/components/` 底下的檔案前，先請他貼目前版本**（`App.tsx` 已在 2026-10-23 拆成多個元件，不要憑舊版覆蓋；樣式現在分散在 `src/styles/`，改哪塊先確認在哪個檔案）。他曾把程式貼到錯的檔案（`AdminPanel.tsx`），給步驟時要寫清楚檔名。
- 改完 `npm.cmd run build` 並實測。不要破壞 107 款資料和現有功能。不要揭露「綜合分數排名」的計算方式。
- **不要叫他貼密碼、Secret／service_role key、Google Client Secret。**
- push 前先 `git status`，**逐檔 `git add`，不要 `git add .`**。**請他用命令列 commit，不要在 TortoiseGit 用 Amend／修改上一次提交**（已發生過一次：Amend 把含程式碼的提交換成只有文件的提交，造成本機與遠端分岔，後來用 `git reset --mixed origin/master` 修好；本機留有保險分支 `backup-e200fae`）。

## 已完成

- 搜尋、篩選抽屜、類型篩選、缺資料提示、排序、檢視模式切換（清單／4／9）、精簡詳細視窗（使用者不要再加其他資訊）。**詳細視窗圓點改版已完成（2026-10-23）**：五個區塊小標 01～05、六項評分全用圓點（3 欄×2 列、各項不同顏色，圓點數 = emoji 個數）、想玩／已玩兩個橫排按鈕、遊玩次數一列、備註、頂部 `BoardGameGeek ↗`＋`☆ 8.2 BGG SCORE`。細節見 `PROJECT_CONTEXT.md` H 節。
- 資料搬到 Supabase 並已上線；管理者 Email＋密碼登入；網站匯入 CSV（含附封面圖、CSV 沒有的遊戲會被刪除）、上傳／更換封面、規則書與 FAQ 外部連結（`game_documents`）。
- **✅ Phase 1｜管理權限與資料安全**：`admin_users` ＋ `is_admin()`；`board_games`、`game_documents`、Storage `covers` 的寫入政策全部只認管理者。**登入不等於管理者。**
- **✅ Phase 2｜玩家 Google 登入與暱稱**：`player_profiles`（暱稱公開、不含 Email）、`src/PlayerPanel.tsx`、`public/privacy.html`。Google OAuth 已發布為正式版、只用基本範圍。
- **✅ Phase 3｜想玩／已玩／備註與雲端同步（2026-10-22 完成並實測）**
  - 資料表 `public.user_game_status`：`(user_id, bgg_name)` 為主鍵、`want_to_play`、`played`、`note`（≤500 字）、`updated_at`、`want_first_at`、`played_first_at`（**由資料庫觸發器只在第一次勾選時寫入，之後取消再勾也不變**）、`play_count`（0～999，**計數器程式已提供、待測試**）。RLS 四條政策都只允許 `user_id = (select auth.uid())`，`anon` 無權限。**刻意不對 `board_games` 加外鍵**（匯入 CSV 刪遊戲時不會清掉玩家紀錄）。取消勾選時**保留該列**（才能保住首次時間），前端會忽略想玩、已玩、備註、次數皆空的列。
  - `src/lib/usePersonalCollection.ts`：訪客存 `localStorage`（鍵 `boardgame-personal-collection`）；登入後以雲端為準且**不再寫 localStorage**（避免共用電腦殘留）。首次登入若本機有紀錄，跳出合併視窗（「加入我的帳號」／「不加入」，「不加入」只在這次工作階段記住，重新整理或下次登入會再問）。合併＝兩邊聯集：想玩／已玩任一邊有勾就有；備註雲端已有就保留雲端的；**雲端寫入成功才清掉本機**，失敗保留本機並可重試。
  - 封面右上角 ♥（想玩）、✓（已玩）小圖示；詳細視窗有「想玩／已玩」按鈕與備註框（離開欄位才儲存）；錯誤以底部提示條顯示。
  - **「我的清單」**：頂部列按鈕（顯示想玩＋已玩款數）→ 右側抽屜 `src/MyList.tsx`，分「想玩」「已玩」兩個分頁、可移除、點名稱開詳細視窗。
  - `public/privacy.html` 已更新（遊戲紀錄、備註、訪客紀錄只在瀏覽器、規劃中的社群統計與人數少可被推測的提醒、站長在後台技術上可看到資料）。
- **2026-10-23 調整（已 push，git 乾淨）**：想玩／已玩圖示樣式、詳細視窗分類標籤與 `.status-legend` 樣式補齊、類型篩選提示改為「需同時符合所有已選類型」、刪除沒用到的 `.game-bggScore`／`.modal-meta`。「我的紀錄」篩選（眼睛＋分區）與新遊戲標示：使用者回「都改好了 可以往下了」，視為完成（見下方確認事項）。
- **2026-10-23 拆檔（使用者回「好」）**：`App.css` 拆成 10 個樣式檔（已 push，提交 `0317534`，刪掉 9 條確定沒用到的規則）；`App.tsx` 分兩批拆成上述 `lib/`＋`components/`（行為不變，只有「更多類型」計算搬進 `FilterDrawer`、Esc 關閉搬進 `GameModal`）。登入移到頂部那批：`PlayerPanel.tsx` 只留一顆暱稱按鈕（`.player-chip`），登出放進暱稱視窗。
- 詳細視窗「上傳／更換封面」：`src/lib/uploadCover.ts`（縮成寬 600px webp）。封面讀取順序：Storage `{coverSlug}.webp` → 舊的 `public/covers/` webp／jpg／png → 🎲。

## 進行中（開場先問使用者）

1. **垃圾桶：程式已提供（`trash-step.zip`），尚無測試回報。**
   - 決定（使用者）：垃圾桶**所有人都看得到**，只有管理者能移入、還原、永久刪除。資料庫**不改任何政策**（`board_games` 現有四條：Anyone can read＝`true`、Admin insert／update／delete）；先前建議的「讀取政策拆成 anon／authenticated 兩條」**沒有執行也不要執行**。
   - 資料庫：`alter table public.board_games add column if not exists removed_at timestamptz;`（請確認有跑）。
   - 前端：`Library` 以 `removedAt` 把遊戲分成主畫面與垃圾桶；詳細視窗右下角小字「移到垃圾桶」（只有管理者）；頁面最下方 `TrashSection`（預設收合，垃圾桶為 0 款時整區隱藏，管理者才有「還原」「永久刪除」）；永久刪除會刪 `board_games` 那列與 Storage 封面（別款還在用同封面代號則不刪），**不清玩家的想玩／已玩紀錄**。邏輯在 `src/lib/useTrashActions.ts`。
   - 使用者要手動做的：`App.css` 底部加 `@import './styles/trash.css';`、`@import './styles/docs.css';`；`GameDocuments.tsx` 第 05 區改單行（「規則書與 FAQ」＋小字「尚未提供相關連結」＋右側 `›`，管理者新增連結表單保留）。
   - **開場確認**：是否已套用、測試（管理者移入／還原／訪客看不到按鈕、第 05 區單行）。使用者曾截圖說「這邊有垃圾桶」，那張是**訪客狀態且垃圾桶為空**，所以看不到是正常的。可提供選項：管理者即使 0 款也顯示垃圾桶區（一行改動）。
2. **截圖發現的小問題**：頁尾上方「你的桌遊規則 AI 助手」橫幅，標題比下方說明文字更靠右、沒對齊。可能是 CSS 拆檔漏掉 `.assistant-copy` 規則。已請使用者對照舊版；若舊版是靠左，去 `src/styles/footer.css` 補回。
3. **CSV 匯入尚未配合垃圾桶**（`AdminPanel.tsx` 沒改）：upsert 沒有帶 `removed_at`，所以不會把垃圾桶裡的遊戲「復活」；但「資料庫有、CSV 沒有」名單包含垃圾桶裡的遊戲，確認匯入時它們會被**永久刪除**。**建議下一批**：CSV 沒有的遊戲改為「移到垃圾桶」（設 `removed_at`），不再直接刪除；這樣拿到不完整 CSV 也救得回來。要動 `AdminPanel.tsx` 前請他貼目前版本；預覽與確認文字、「超過 5 款要輸入刪除」的保護要一併調整。
4. **補 `public/privacy.html` 一句「遊玩次數」**（請使用者貼該檔案）。若垃圾桶要列給訪客看，也確認不需額外說明（只顯示遊戲名稱與封面，不含個人資料）。
5. **簡短確認（不是阻擋項）**：「我的紀錄」眼睛篩選有沒有實測、新遊戲標示的 `created_at` 補 `2026-09-01` SQL 有沒有跑。確認指令：`select bgg_name, created_at from public.board_games order by created_at desc limit 5;`。
6. **本機 git**：拆檔兩批、垃圾桶、`PlayerPanel.tsx` 是否都已 commit／push 要先 `git status` 確認（`PlayerPanel.tsx` 的提交曾在本機領先 `origin/master` 1 個）。`PROJECT_CONTEXT.md`、`QUICKSTART.md`、`新增 文字文件.txt`、解壓殘留資料夾（如 `app-split-step1/`）不要 add；`boardgames.csv` 若顯示 deleted，不要 commit（`git restore boardgames.csv`）。
7. **圓點版 `App.css` 選用置中頂部**：拆檔時已把疊的覆蓋規則合併成最終版，使用者沒表態要置中，視為不用。

## 下一步（照順序）

**一次一階段，前一階段測試完才進下一階段。**

1. 先完成上面「進行中」：垃圾桶測試、CSV 匯入改為移到垃圾桶、`privacy.html`。
2. **遊玩次數 UI**：已完成。若之後想看「每月玩幾次」再另做遊玩紀錄表（日期事後補不回來，做到時要和使用者討論）。「常玩遊戲排名」之後由遊玩次數計算，尚未決定。補 `privacy.html` 的遊玩次數說明。
3. **Phase 4｜公開評分**：六項評分（喜歡度、玩家影響性、溝通性、變化性、獨特性、適合留下來程度，1～5 分）＋整體 1～10 分；每位登入玩家每款一筆、**可修改**；社群平均與評分人數公開；人數太少顯示「評分累積中」（門檻建議 5，未定）。開始前向使用者確認量表與門檻；更新 `privacy.html`。
4. **社群統計介面**（取代原本的 Phase 5 每月投票）：直接用大家的想玩／已玩清單，**不另做每月投票**。每款遊戲顯示「目前想玩人數、已玩人數」＋月／季／年「期間新增人數」（以每位玩家對每款的首次加入時間 `want_first_at`／`played_first_at` 計算，取消再加入不重複算）。只顯示彙總人數；訪客不計入；用 `security definer` 的資料庫函式回傳數字，**不要開放別人的列**。我的清單抽屜之後要預留「社群」分頁與社群評分。
5. **Phase 6｜集點卡與成就**：依遊玩紀錄累積，登入玩家可跨裝置保留。
6. 其餘：上傳規則書 PDF（存到 Supabase **私有** bucket，網站公開、規則書有著作權，不可用公開 bucket；`game_documents` 已預留 `source_type='upload'`、`storage_path`、`ai_indexed`；注意刪除遊戲時 `on delete cascade` 只刪資料列、**不會刪 Storage 檔案**；先統計實際 PDF 數量與大小）、**AI 規則助手（仍是最重要的長期目標；PDF 文字擷取、切段並保留頁碼，先決定支援全部桌遊或先 10～20 款）**、揪團／行事曆、帳號刪除流程（目前要管理者在 Supabase 手動處理）。順序請與使用者確認。

**接續時請這樣開場：**
1. 問使用者在哪台電腦，`git pull`、`git status`。
2. 先處理「進行中」的確認。
3. 新資料表的 RLS 寫入政策**一律用 `auth.uid()` 等於本人，或 `is_admin()`，不要寫成「所有 authenticated」**；改 `App.tsx` 前請他貼目前版本。

## CSV 匯入的行為（重要）

- **CSV 沒有、資料庫有的遊戲會被刪除**。連帶刪除 Storage 的 `{cover_slug}.webp`（若該封面代號仍被本次 CSV 的遊戲使用則保留）。
- 保護機制：預覽以紅字列出名單；確認視窗再列一次；**一次刪除超過 5 款時還要輸入「刪除」**。
- 順序：先 upsert → 上傳封面 → 再刪除；upsert 失敗時不會刪任何東西。
- 復原：遊戲資料可重新匯入原 CSV 補回；**雲端封面刪除後無法復原**。
- 地雷：在 Notion 改 `bggName` → 舊的被刪（含封面）、新的當新遊戲；新舊 `cover_slug` 相同會撞唯一限制；**拿到不完整的 CSV 會刪掉其他遊戲**。
- **新增（與新遊戲標示有關）**：下次匯入 CSV 後，請使用者執行 `select bgg_name, created_at from public.board_games order by created_at desc limit 5;`，確認舊遊戲的 `created_at` 沒被重設；若被重設，要調整匯入程式。
- 玩家的想玩／已玩紀錄以 `bgg_name` 對應，**CSV 改 `bggName` 會讓玩家對那款的紀錄失聯**（資料還在、畫面不顯示）。

## 關鍵決定與地雷

- **公開瀏覽、只有管理者能編輯；訪客可以問 AI 但不能改設定。** AI 開放給訪客會花錢，之後要做每日提問次數限制，AI 金鑰只能放後端。
- Supabase：Project URL 是**根網址** `https://hgeuockbjrzayfdylavq.supabase.co`（不加 `/rest/v1/`）。只有 Publishable key 可放前端。
- **「Allow new users to sign up」已開啟**，所以所有寫入政策必須只認管理者或本人。新增任何資料表或 bucket 都要重新檢查政策。
- **Google 的 Client Secret 只存在 Supabase**，絕不放進 Git、前端、Vercel 環境變數或對話。`client_secret_*.json` 要移出專案資料夾並加進 `.gitignore`。
- 管理者帳號的 Gmail 若同時用 Google 登入，會對到同一個管理者帳號；測玩家身分要用另一個 Google 帳號。建議管理者的 Google 帳號開啟兩步驟驗證。
- Google OAuth 只用基本範圍；**不要在「資料存取權」新增敏感或受限範圍**，否則會觸發驗證與使用者人數限制（100 位）。人數接近 80 人時回 Google Auth Platform「目標對象」頁面確認。
- **不採用匿名帳號**（匿名使用者的角色也是 `authenticated`，清除瀏覽資料就能再建一個）。改採「訪客存 `localStorage`＋登入玩家才能評分」。
- **社群設計決定（使用者）**：不做留言板（之後可加選填短評）；評分一律公開、不放進玩家設定；評分項目沿用使用者的用語：喜歡度、玩家影響性（**不要改名成「玩家互動」**，定義是「在意別人操作＋下一步被限制」）、溝通性、變化性、獨特性、適合留下來程度。複雜度與快速性視為遊戲屬性，不列入評分。社群平均與使用者自己的 Emoji 評價並排顯示，但**不要與「綜合分數排名」混在一起或揭露其算法**。個人想玩／已玩預設只有本人可見，社群只看彙總。
- **不加「讚」按鈕**（我建議：♥ 已代表想玩會搞混、且與 Phase 4「喜歡度」重複；若使用者堅持，只放詳細視窗，不放封面）。封面維持兩個小圖示以免太擠。
- `privacy.html` 日後新增評分、遊玩次數、社群統計時要同步更新。帳號刪除目前要由管理者在 Supabase 手動處理（`player_profiles` 沒有 DELETE 政策）。
- Vercel 的 `VITE_SUPABASE_URL`、`VITE_SUPABASE_PUBLISHABLE_KEY` 必須存成 **Config**（不是 Secret），名稱不能錯；錯了網站會悄悄退回本機資料。本機 `.env.local` 不在 Git 裡，換電腦要重建。
- Supabase 免費專案閒置一週會暫停（資料不會消失，需到後台恢復）；檔案儲存免費額度約 1 GB，之後放規則書 PDF 要留意。
- 資料庫主鍵是 `bgg_name`；前端 `id` 只是流水號，**絕對不能用來對應圖片或使用者資料**。
- 缺值保留 `null`，顯示「未提供」，不要編造。
- 上線網站只看得到有 push 的檔案；改資料庫內容、上傳封面、跑 SQL **不需要 push**。
- 瀏覽器 Console 裡大量封面 404 是正常的（元件依序試 Storage、webp、jpg、png）。
- 匯入 CSV 或上傳封面後，要重新整理網頁才會看到最新資料。
- `BoardGame` 型別仍由 `src/data/boardGames.generated.ts` 匯出，**不要刪這個檔案**。
- Brevo 帳號已註冊但目前沒用到；若日後買網域，可補 Email Magic Link。

## 開場前先確認

1. 使用者現在在哪台電腦；分支應為 `master`，先 `git pull`。
2. `git status`：`boardgames.csv`、`.zip`、`.py`、`.sql`、`.txt` 等雜項檔不要 add；`client_secret_*.json` 不應出現在專案資料夾。
3. 確認「進行中」的實際狀態，再往下做。
4. 若要改 `src/App.tsx`、`src/components/*`、`src/AdminPanel.tsx`、`src/PlayerPanel.tsx`、`src/GameDocuments.tsx`，請他貼出目前版本。
