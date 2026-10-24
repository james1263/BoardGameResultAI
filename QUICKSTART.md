# 桌遊規則助手 — 懶人包（給下一個 AI）

> 3 分鐘版。細節請看 `PROJECT_CONTEXT.md`（最底下有附錄，越後面越新）。   最後更新：2026-10-24 下午（回到頂端、垃圾桶移除原因、遊玩紀錄表、Phase 4 資料表已建立；細節見 `PROJECT_CONTEXT.md` 附錄 M）

## 這是什麼

使用者在做一個**公開給朋友瀏覽的桌遊收藏網站**「桌遊規則助手」，目前有 107 款桌遊，能搜尋、篩選、排序、看封面和評分。最終目標是讓大家能問 **AI 規則助手**，AI 要根據使用者上傳的規則書 PDF 回答，並標明出處與頁碼。

- 線上網址：https://board-game-result-ai.vercel.app/（GitHub `master` 分支 → Vercel 自動部署）
- 技術：React + TypeScript + Vite + **Supabase（資料庫、登入、檔案儲存，免費方案，首爾）**
- 本機路徑：`D:\BoardGameResultAI`（Windows、PowerShell、用 `npm.cmd`）。使用者會在多台電腦作業，路徑可能不同，見 `PROJECT_CONTEXT.md` 第 10 節。
- **程式結構**：`src/App.css` 是入口檔，只有 12 行 `@import`，依序載入 `src/styles/`：`base`、`topbar`、`hero`、`library`、`filter`、`cards`、`modal`、`admin`、`mylist`、`footer`、`trash`、`docs`（**順序有影響，不要調換**）。`src/App.tsx`（約 500 行）只留 `Library` 的狀態與篩選／排序邏輯，畫面拆成 `src/components/`：`TopBar`、`ViewToggle`、`FilterDrawer`、`GameCard`、`GameModal`、`MergeDialog`、`PersonalToast`、`TrashSection`、`CoverImage`、`StatusButtons`、`RatingDots`、`PlayCounter`、`PersonalNote`、`Icons`；型別與工具在 `src/lib/`：`libraryTypes.ts`、`gameFormat.ts`、`fetchBoardGames.ts`、`personalApi.ts`、`useTrashActions.ts`、`usePersonalCollection.ts`、`useIsAdmin.ts`、`useSession.ts`、`uploadCover.ts`、`parseCsv.ts`、`supabase.ts`。另有 `AdminPanel.tsx`、`PlayerPanel.tsx`、`MyList.tsx`、`GameDocuments.tsx`。
- 桌遊資料存在 Supabase 的 `board_games` 資料表；網站讀取失敗時才退回本機 `boardGames.generated.ts`。
- 資料更新流程：Notion 匯出 CSV → 網站頁尾登入管理者 →「匯入 CSV」→ 預覽 →「確認匯入」。

## 使用者是誰、怎麼合作

- **程式初學者**，繁體中文。
- **使用者已明確說過：預設他會照步驟執行，不用每一步都確認；可以一次給最多 4 個步驟；遇到問題他會自己停下來問；他回「好」就代表沒問題、可以繼續。**（舊版「一次只給一個步驟」已作廢。）
- 會影響資料、隱私的設計決策，仍先提方案並列出「建議預設值」，讓他回「照建議」或指定修改，再動工。
- 給法：明確檔案、`Ctrl + F` 搜尋位置、完整程式碼、測試步驟；每批結尾給測試清單與 `git add` 指令。
- 你**碰不到**他的檔案，也**收不到** CSV。要資訊就給 PowerShell／SQL 指令，請他貼結果或截圖。
- **大改 `App.tsx`、`AdminPanel.tsx`、`PlayerPanel.tsx`、`GameDocuments.tsx` 或 `src/components/` 底下的檔案前，先請他貼目前版本**，不要憑舊版覆蓋。樣式分散在 `src/styles/`，改哪塊先確認在哪個檔案。他曾把程式貼到錯的檔案，給步驟時要寫清楚檔名。
- **他貼來的檔案可能是舊版**（2026-10-24 他貼了舊的整份 `App.css`）。判斷現況前，先用 `git status`、`git log`、`Get-Content ... | Select-Object -First 15` 這類指令確認實際狀態，不要憑貼來的內容就說「已改好」或「還沒改」。
- 改完 `npm.cmd run build` 並實測。不要破壞 107 款資料和現有功能。不要揭露「綜合分數排名」的計算方式。
- **不要叫他貼密碼、Secret／service_role key、Google Client Secret。**
- push 前先 `git status`，**逐檔 `git add`，不要 `git add .`**。**請他用命令列 commit，不要在 TortoiseGit 用 Amend／修改上一次提交**（已發生過一次，見 `PROJECT_CONTEXT.md` E 節）。
- 不要 add 的雜項：`PROJECT_CONTEXT.md`、`QUICKSTART.md`、`新增 文字文件.txt`、`trash-step/`、`App.css.bak`、其他 `.zip`、解壓殘留資料夾；`boardgames.csv` 若顯示 deleted，不要 commit（`git restore boardgames.csv`）。

## 已完成

- 搜尋、篩選抽屜、類型篩選、缺資料提示、排序、檢視模式切換（清單／4／9）、精簡詳細視窗（使用者不要再加其他資訊）。詳細視窗圓點改版已完成：五個區塊小標 01～05、六項評分全用圓點（3 欄×2 列）、想玩／已玩橫排按鈕、遊玩次數一列、備註、頂部 `BoardGameGeek ↗`＋`☆ 8.2 BGG SCORE`。
- 資料搬到 Supabase 並已上線；管理者 Email＋密碼登入；網站匯入 CSV（含附封面圖、CSV 沒有的遊戲會被刪除）、上傳／更換封面、規則書與 FAQ 外部連結（`game_documents`）。
- **✅ Phase 1｜管理權限與資料安全**：`admin_users` ＋ `is_admin()`；`board_games`、`game_documents`、Storage `covers` 的寫入政策全部只認管理者。**登入不等於管理者。**
- **✅ Phase 2｜玩家 Google 登入與暱稱**：`player_profiles`（暱稱公開、不含 Email）、`src/PlayerPanel.tsx`、`public/privacy.html`。Google OAuth 已發布為正式版、只用基本範圍。
- **✅ Phase 3｜想玩／已玩／備註與雲端同步**：資料表 `public.user_game_status`（主鍵 `(user_id, bgg_name)`、`want_to_play`、`played`、`note` ≤500 字、`want_first_at`／`played_first_at` 由觸發器只在第一次勾選時寫入、`play_count` 0～999）。RLS 四條政策都只允許本人，`anon` 無權限；**刻意不對 `board_games` 加外鍵**。訪客存 `localStorage`，登入後以雲端為準，首次登入有合併視窗。「我的清單」抽屜、封面 ♥／✓ 圖示、備註、遊玩次數計數器都已完成。
- **✅ 拆檔（2026-10-23）**：`App.css` 拆成 12 個樣式檔、`App.tsx` 拆成 `lib/`＋`components/`，行為不變。
- **✅ 垃圾桶（2026-10-24 使用者回報實測通過）**
  - 決定：垃圾桶**所有人都看得到**，只有管理者能移入、還原、永久刪除。資料庫**不改任何政策**（`board_games` 現有四條：Anyone can read＝`true`、Admin insert／update／delete）；先前建議的「讀取政策拆成 anon／authenticated 兩條」**沒有執行也不要執行**。
  - 資料庫：`board_games.removed_at timestamptz`（空值＝正常，有值＝在垃圾桶），**已確認存在**。
  - 前端：`Library` 以 `removedAt` 分出主畫面與垃圾桶；詳細視窗右下角小字「移到垃圾桶」（只有管理者）；頁面最下方 `TrashSection`（預設收合，垃圾桶為 0 款時整區隱藏，管理者才有「還原」「永久刪除」）；永久刪除會刪 `board_games` 那列與 Storage 封面（別款還在用同封面代號則不刪），**不清玩家的想玩／已玩紀錄**。邏輯在 `src/lib/useTrashActions.ts`。詳細視窗第 05 區已改單行「規則書與 FAQ」。
- **✅ `App.css` 入口檔已套用（2026-10-24）**：使用者本機的 `src/App.css` 曾是拆檔前的舊整份（`src/styles/` 12 個檔雖在，但沒被載入，所以垃圾桶與第 05 區單行樣式沒生效）。已換成 12 行 `@import`，build 通過（CSS 約 29.67 KB）、畫面使用者回「好」。舊檔備份為 `App.css.bak`（不要 add）。
- **AI 助手橫幅**：截圖顯示文字是**整塊置中**（不是標題偏右）。建議在 `src/styles/footer.css` 的 `.assistant-copy` 加 `flex: 1; text-align: left;` 讓文字靠左；使用者回「好」，**是否真的改了請 `git diff src/styles/footer.css` 確認**，沒改也不影響功能。
- **✅ 回到頂端按鈕、垃圾桶移除原因**（2026-10-24，`removed_reason`；「編輯原因」按鈕程式已提供，待修 build）。
- **✅ 遊玩紀錄**（2026-10-24）：資料表 `game_play_sessions`；總次數＝`play_count`（沒日期的次數）＋有日期的紀錄筆數；`useGamePlaySessions()` 在 `Library` 讀一次、詳細視窗與「我的清單」共用，抽屜顯示「玩過 N 次 · 最近：日期」。`privacy.html` 已更新。
- **✅ Phase 4 資料庫**（2026-10-24）：`game_ratings`＋`get_rating_summaries()`（門檻 5 人在資料庫判斷，個別評分只有本人看得到）。前端未做。

## 進行中（開場先問使用者）

1. **修 build 錯誤**：`App.tsx` 的 `<TrashSection` 要加 `onEditReason={trash.editReason}`；確認 `useTrashActions.ts` 的 return 含 `editReason`。通過後測試並 commit。
2. **封面代號修正**：確認 `src/lib/parseCsv.ts` 的 `makeCoverSlug` 是否已換成新版（含 `shortHash`；含中日文的 `bggName` 改為「英數字部分＋雜湊」）。套用後重新匯入 CSV，再查 `select bgg_name, cover_slug from public.board_games where cover_slug !~ '^[a-z0-9_-]+$';`，應為 0 列。
3. **Phase 4 公開評分前端**：資料表與彙總函式已建好並驗證（見附錄 M-3），前端未開始。
4. 先 `git status --short`、`git log --oneline -5` 確認提交狀況。

## 想做清單（使用者 2026-10-24 提出，尚未排序、尚未動工）

詳細內容與原話整理在 `PROJECT_CONTEXT.md` 附錄 L。重點：
- 小功能：回到頁面頂端、垃圾桶註明售出原因（要新欄位）、新增排序（待確認排什麼）、私人／大家的分數表（＝ Phase 4）。
- 「我的清單」升級為「我的桌遊」：近期／下次聚會想玩、想玩一鍵移到已玩、依加入時間／排名／時間排序、遊玩紀錄（每次玩的人數、朋友、勝負、心得，需新的遊玩紀錄表）、統計（總次數、總時數、最常玩、每月趨勢）。
- 集點卡：填完評分表單才能集點、管理者指定當天參加者、同月 2 點換免費券（券無期限、當月沒集滿到下月 1 日取消）、一天只算一點、管理者看全部、玩家只看自己。**不建議用藍牙／區網偵測**，改管理者勾選或一次性代碼。
- 揪團與聚會規劃（第三階段）、「今天想玩什麼？」依人數／時間／難度推薦（用現有資料即可，不需 AI）。
- 使用者的疑問（沒登入時紀錄會跨瀏覽器嗎）：**不會**，訪客紀錄只在該瀏覽器的 `localStorage`；登入 Google 才會雲端同步。已回答，見附錄 L-3。
- **站上拖曳調整排名＋匯出 CSV 給 Notion（使用者 2026-10-24 提出，使用者說「晚點再嘗試」，尚未動工）**：管理者專用，用來更新自己的 CSV。要拖曳的 6 個排名都**已在資料庫與 `parseCsv.ts`／`toRow`，不需改資料庫**：`Ranking engine`→`ranking_engine`、`老遊戲想玩綜合評分`（＝常玩遊戲排名）→`classic_game_ranking`、`溝通排名`→`communication_ranking`、`獨特排名`→`unique_ranking`、`玩家影響性排名`→`player_impact_ranking`、`變化排名`→`change_ranking`（Notion 欄名與 `parseCsv.ts` 已核對一致）。「綜合分數排名」仍由 Notion 算、網站不重算。建議設計與待確認事項見附錄 L-6；**使用者尚未回「照建議」**。
- **AI 規則助手必須用 RAG（使用者 2026-10-24 明確要求）**：回答只能根據檢索到的規則書片段，並列出出處（哪本、第幾頁）；找不到依據要明說，不可憑空回答。見附錄 L-5。
- 做這些之前先與使用者排序；（「把我之前說的排行」＝常玩遊戲排名 `classic_game_ranking`，已確認。）

## 下一步（照順序）

**一次一階段，前一階段測試完才進下一階段。**

1. 先完成上面「進行中」：提交 `privacy.html`、確認小項；再排小功能（回到頂端、垃圾桶售出原因、排序）。
2. **遊玩次數 UI**：已完成。若之後想看「每月玩幾次」再另做遊玩紀錄表（日期事後補不回來，做到時要和使用者討論）。「常玩遊戲排名」之後由遊玩次數計算，尚未決定。
3. **Phase 4｜公開評分**：六項評分（喜歡度、玩家影響性、溝通性、變化性、獨特性、適合留下來程度，1～5 分）＋整體 1～10 分；每位登入玩家每款一筆、**可修改**；社群平均與評分人數公開；人數太少顯示「評分累積中」（門檻建議 5，未定）。開始前向使用者確認量表與門檻；更新 `privacy.html`。
4. **社群統計介面**（取代原本的 Phase 5 每月投票）：直接用大家的想玩／已玩清單，**不另做每月投票**。每款遊戲顯示「目前想玩人數、已玩人數」＋月／季／年「期間新增人數」（以 `want_first_at`／`played_first_at` 計算，取消再加入不重複算）。只顯示彙總人數；訪客不計入；用 `security definer` 的資料庫函式回傳數字，**不要開放別人的列**。我的清單抽屜之後要預留「社群」分頁與社群評分。
5. **Phase 6｜集點卡與成就**：依遊玩紀錄累積，登入玩家可跨裝置保留。
6. 其餘：上傳規則書 PDF（存到 Supabase **私有** bucket，網站公開、規則書有著作權，不可用公開 bucket；`game_documents` 已預留 `source_type='upload'`、`storage_path`、`ai_indexed`；刪除遊戲時 `on delete cascade` 只刪資料列、**不會刪 Storage 檔案**；先統計實際 PDF 數量與大小）、**AI 規則助手（仍是最重要的長期目標；PDF 文字擷取、切段並保留頁碼，先決定支援全部桌遊或先 10～20 款）**、揪團／行事曆、帳號刪除流程（目前要管理者在 Supabase 手動處理）。順序請與使用者確認。

**接續時請這樣開場：**
1. 問使用者在哪台電腦，`git pull`、`git status`。
2. 先處理「進行中」的確認。
3. 新資料表的 RLS 寫入政策**一律用 `auth.uid()` 等於本人，或 `is_admin()`，不要寫成「所有 authenticated」**；改 `App.tsx` 前請他貼目前版本。

## CSV 匯入的行為（重要；2026-10-24 已改為移到垃圾桶並實測）

- 流程：upsert → 上傳封面 → 把「資料庫正常、CSV 沒有」的遊戲**移到垃圾桶**（設 `removed_at`）。**不再刪資料列、不刪 Storage 封面。**
- 預覽分三類：①會移到垃圾桶（紅字名單）；②CSV 有、但目前在垃圾桶（資料會更新、**仍留在垃圾桶**，不自動還原）；③垃圾桶裡本來就有、CSV 也沒有（維持原狀）。想改成自動還原，只要在 `AdminPanel.tsx` 的 `toRow` 加 `removed_at: null`。
- 保護：一次移到垃圾桶超過 5 款，要輸入「移除」。
- 永久刪除（含雲端封面）只在垃圾桶區由管理者手動做；**封面刪除後無法復原**。
- 地雷：在 Notion 改 `bggName` → 舊的進垃圾桶、新的當新遊戲（封面要重傳，舊封面留在垃圾桶那筆）；新舊 `cover_slug` 相同會撞唯一限制；拿到不完整的 CSV 現在救得回來，但要一款一款按「還原」，量大仍麻煩，所以保留 5 款的確認。
- 玩家的想玩／已玩紀錄以 `bgg_name` 對應，**CSV 改 `bggName` 會讓玩家對那款的紀錄失聯**（資料還在、畫面不顯示）。
- 下次匯入 CSV 後，請使用者執行 `select bgg_name, created_at from public.board_games order by created_at desc limit 5;`，確認舊遊戲的 `created_at` 沒被重設；若被重設，要調整匯入程式。

## 關鍵決定與地雷

- **公開瀏覽、只有管理者能編輯；訪客可以問 AI 但不能改設定。** AI 開放給訪客會花錢，之後要做每日提問次數限制，AI 金鑰只能放後端。
- Supabase：Project URL 是**根網址** `https://hgeuockbjrzayfdylavq.supabase.co`（不加 `/rest/v1/`）。只有 Publishable key 可放前端。
- **「Allow new users to sign up」已開啟**，所以所有寫入政策必須只認管理者或本人。新增任何資料表或 bucket 都要重新檢查政策。
- **Google 的 Client Secret 只存在 Supabase**，絕不放進 Git、前端、Vercel 環境變數或對話。`client_secret_*.json` 要移出專案資料夾並加進 `.gitignore`。
- 管理者帳號的 Gmail 若同時用 Google 登入，會對到同一個管理者帳號；測玩家身分要用另一個 Google 帳號。建議管理者的 Google 帳號開啟兩步驟驗證。
- Google OAuth 只用基本範圍；**不要在「資料存取權」新增敏感或受限範圍**，否則會觸發驗證與使用者人數限制（100 位）。人數接近 80 人時回 Google Auth Platform「目標對象」頁面確認。
- **不採用匿名帳號**（匿名使用者的角色也是 `authenticated`，清除瀏覽資料就能再建一個）。改採「訪客存 `localStorage`＋登入玩家才能評分」。
- **社群設計決定（使用者）**：不做留言板（之後可加選填短評）；評分一律公開、不放進玩家設定；評分項目沿用使用者的用語：喜歡度、玩家影響性（**不要改名成「玩家互動」**，定義是「在意別人操作＋下一步被限制」）、溝通性、變化性、獨特性、適合留下來程度。複雜度與快速性視為遊戲屬性，不列入評分。社群平均與使用者自己的 Emoji 評價並排顯示，但**不要與「綜合分數排名」混在一起或揭露其算法**。個人想玩／已玩預設只有本人可見，社群只看彙總。
- **不加「讚」按鈕**（♥ 已代表想玩會搞混、且與 Phase 4「喜歡度」重複；若使用者堅持，只放詳細視窗，不放封面）。
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
- 垃圾桶 0 款時整區隱藏是設計如此，不是壞掉。
- **Storage 檔名必須是 ASCII**：中日文 `bggName` 會讓封面上傳失敗（`Invalid key`），已改 `makeCoverSlug`（見附錄 M-4）。
- **次數定義**：`play_count`＝沒日期的次數，總次數＝它＋遊玩紀錄筆數；不要把兩者混為一個數字存回資料庫。
- **新建資料表一律加**：`revoke truncate, references, trigger on 表名 from authenticated;`，並確認 `anon` 無權限。
- **給使用者改程式碼時**：量大就給整份檔案，不要只寫「貼在某行下面」（他兩次貼錯位置）。
- 排序功能：使用者說之後再想，尚未定義。

## 開場前先確認

1. 使用者現在在哪台電腦；分支應為 `master`，先 `git pull`。
2. `git status`：雜項檔不要 add（見上方清單）；`client_secret_*.json` 不應出現在專案資料夾。
3. 確認「進行中」的實際狀態，再往下做。
4. 若要改 `src/App.tsx`、`src/components/*`、`src/AdminPanel.tsx`、`src/PlayerPanel.tsx`、`src/GameDocuments.tsx`，請他貼出目前版本。
