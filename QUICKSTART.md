# 桌遊規則助手 — 懶人包（給下一個 AI）

> 最後更新：2026-10-31（深夜後二）（已併入 `生成後.md` 全部內容：確認頁面內視窗、想玩名單點開版、清單式留言與我的心得、**開遊戲視窗重讀人數造成卡頓的查證與改成打勾時直接調整人數〔`4025cd8`〕**；`生成後.md` 已重置）。**第 2 節最上面的「2.0（最新）」是最新增補，與其他段落衝突時以它為準。**
> **分工**：本檔＝現況、待辦、合作規則；`PROJECT_CONTEXT.md`＝架構、資料庫、功能規則、規則助手設計；`生成後.md`＝這兩份之後的修改紀錄與文件維護計數（**開工前三份都要讀，衝突時以 `生成後.md` 為準**）。
> **文件維護規則**見第 9 節。

## 1. 這是什麼

- 使用者在做**公開給朋友瀏覽的桌遊收藏網站「桌遊規則助手」**，目前 **106 款**。長期目標：VIP 能查規則書（RAG：只根據檢索到的片段、附頁碼）。
- 網址 https://board-game-result-ai.vercel.app/（GitHub `master` → Vercel 自動部署）。React + TypeScript + Vite + Supabase（免費方案，首爾）。
- 本機 `D:\BoardGameResultAI`（Windows、PowerShell、`npm.cmd`）；規則書 PDF 放 `D:\rulebooks\`（專案外）。多台電腦見 PROJECT_CONTEXT 第 9 節。

## 2. 目前狀態（2026-10-31 深夜）

### 2.0（最新）【2026-10-31 深夜後二；本檔其他段落與此衝突時以此為準】

- git：origin/master 最新 `4025cd8`（打勾時直接調整社群人數）；之前 `95184bb`（test：暫時關閉開遊戲視窗時重讀人數）、`614bbf1`（更新生成後.md）、`f8e2d5d`（清單分隔線＋我的心得清單式）、`3c4cd7f`、`6f4f471`、`6259cd0`、`741995e`、`b926b39`、`8da7b09`、`a9b7748`。本次重新產生的三份 .md 在 `4025cd8` 之後，要等使用者 commit／push（該次不計入次數）。開工先 `git pull`、`git log --oneline -5`。
- 卡頓問題（本輪主線）：使用者在 iPhone 的 Google App 內建瀏覽器回報「開遊戲封面→按 ✕→回主畫面或點俱樂部，會暫時點不了，要等畫面自己動一下才恢復」。懷疑 `6f4f471`（開遊戲視窗時呼叫 `communityStats.reload()`），使用者註解掉那段後回報「不卡了」（`95184bb`），所以確認是那段重讀造成；但為什麼重讀會卡（網路回來後整頁重繪？內建瀏覽器特性？）沒有查出，是推測。
- 修法（`4025cd8`，使用者已 push，手機實測尚未回報，要主動問）：`src/lib/useCommunityStats.ts` 新增 `adjust(bggName, wantDelta, playedDelta)`，直接改記憶體裡那款的 `wantCount`／`playedCount`（不低於 0，不打網路）；`App.tsx` 刪掉註解掉的重讀區塊，新增 `personalWithStats`（`useMemo`，包住 `personal.updateEntry`），只傳給主畫面的 `GameCard`：打勾時若是 VIP 或管理者、已登入、`personal.status === 'ready'`，就用 `changes.wantToPlay`／`changes.played` 與打勾前的值算差，呼叫 `adjust`。一般會員與訪客不動人數（全站人數只統計 VIP＋管理者）。限制：只調整想玩／已玩總人數，月／季／年期間新增不動；評分完整自動標已玩、新增遊玩紀錄標已玩、`PlayedGameRecord` 等不經過卡片的路徑不會調整，人數要重新整理才更新（`App.tsx` 裡評分自動標已玩的 `useEffect` 用的是原本的 `personal.updateEntry`，刻意不動）。
- 待實測（4025cd8）：①VIP 帳號卡片點 ♥ 後開那款遊戲，右上角想玩 +1，取消 -1；✓ 已玩同理；②開遊戲封面→✕→馬上點俱樂部，來回 5 次不卡（要在 Google App 內建瀏覽器測）；③一般會員點 ♥ 人數不變；④重新整理後人數與資料庫一致。若又卡，代表原因是重繪而不是 `reload()`，下一步看 `GameModal.tsx` 關閉行為與 `useBackClose.ts`（不要先動 `useBackClose`）。
- 本輪事故與教訓：使用者曾註解掉 `App.tsx` 174～181 行（報到連結登入後跳集點卡的 `useEffect`，不是目標），且檔案沒存檔所以 `git commit` 顯示沒東西、build 沒變；後來已還原（上傳的 `App.tsx` 該段完整）。要使用者改檔時：先請他用 `Select-String` 貼結果、說清楚「整段從哪一行到哪一行」、改完先 `git status` 確認有 `modified`、再 build、看到 `✓ built` 才 push。專案 TypeScript 把「宣告了沒使用」（TS6133）當錯誤，註解掉一段程式時，它專用的變數宣告也要一起註解，否則 build 失敗。截圖裡 `App.tsx` 174～181 行那段 `useEffect` 的紅線是 React lint「effect 裡同步 setState」提示，不影響執行，未處理。
- 同批已 push、使用者尚未回報實測（承 `生成後.md` 舊內容）：
  - `PlaySessions.tsx`（`a9b7748`）：`window.confirm`／`window.alert` 換成 `askConfirm`／`showNotice`；待測刪除遊玩紀錄的頁面內紅色確認視窗、人數填 100 的提示。
  - 留言板置中修正（`8da7b09`）：`note-list.css` 加 `.nl-item, .nl-item * { text-align: left !important }` 與 `.nl-item .nl-btnrow { justify-content: flex-end }`；若仍置中，用 `Select-String -Path src\styles\*.css -Pattern "text-align: center"` 找規則。
  - 清單式（`f8e2d5d`）：`note-list.css` 改成無邊框＋淡色分隔線（`.nl-list`、`.nl-main`、`.nl-thumb` 52px）；`NoteListItem.tsx` 新增選填 `badge`、`thumb`、`hideText`；`MyNotes.tsx` 改用 `NoteListItem`（縮圖用 `renderCover(game)` 或 🎲，編輯中強制展開）。討論分頁與留言板外層可能還有舊間距，縮圖樣式是猜的；`my-notes.css` 舊 `.mh-item`、`.mh-head`、`.mh-list` 沒人用，未清。
  - 想玩名單點開才顯示暱稱與 LINE／FB（`b926b39`、`741995e`、`6259cd0`，使用者回報沒問題）：預計聚會、近期聚會（`LoyaltyAdmin`）、新增聚會流程三處格式一致；`741995e` 是腳本結尾錨點比對錯造成 `tsc` 13 個錯誤，`6259cd0` 修好。以後給指令把 `npm.cmd run build` 與 `git add／commit／push` 分成兩段。
- 已結案：登入短暫消失兩個修復、排行榜新畫面、底部導覽在 Google App 不再卡（使用者 2026-10-31 回報都沒問題）；備份表 `game_play_sessions_backup_20261031`、`user_game_status_backup_20261031` 已刪（`game_notes_backup_20261030` 還在，未決定是否刪）。
- 確認某檔案是否已 push：`git log --oneline -3 -- 檔案路徑`。

### 2.0（前二批）【2026-10-31 深夜後；與上面衝突時以上面為準】

- **git**：origin/master 最新 **`a81ca91`**（合併視窗「不加入」清訪客紀錄）；之前依序 `8f8d2c1`（`useSession` 共用快取）、`cbbee7b`（更新生成後.md）、`f56b0a6`（排行榜改版）、`417ffaf`、`d8295fa`、`9cf727c`、`87dea10`、`97047fc`、`58e2232`（上一輪三份 .md）。**三份 .md（本次重新產生）要等使用者 commit／push（該次不計入次數）。** 開工先 `git pull`、`git log --oneline -5`。
- **登入狀態短暫消失（根因已查明並修復，使用者尚未回報實測）**：
  - **根因**：舊 `useSession.ts` 用 `useState(null)`，每個元件每次掛載都先拿到 `null`（遊戲視窗、排行榜開啟時掛載的元件就短暫變成「訪客」），且 `onAuthStateChange` 任何帶 `null` 的事件都清掉 session。結果：點 ♥／✓ 寫進 `localStorage` 訪客紀錄 → 登入恢復後 `needsMerge` 彈「要把這台電腦的紀錄加進你的帳號嗎？」；恢復後重讀雲端（`status: loading`）期間按鈕 `disabled`；導覽少「規則助手」、我的統計 0／0。`useVip.ts` 本身沒問題（已有 `getSession` 保護）。
  - **修法 1（`8f8d2c1`）**：`src/lib/useSession.ts` 改成**模組層級共用一份 session**（`cached`、`listeners`、只註冊一次 `onAuthStateChange`）；新元件掛載直接拿快取；**只有 `SIGNED_OUT` 事件才接受 `null`**，其他事件帶 `null` 忽略；回傳型別不變。**整個網站第一次載入的那一瞬間仍是 `null`（正常）。** 若實測仍有短暫鎖住，下一步是讓 `usePersonalCollection` 區分「還不知道」與「確定是訪客」（要請使用者傳該檔）。
  - **修法 2（`a81ca91`，使用者回「照建議」）**：`usePersonalCollection.ts` 的 `declineMerge` 除了 `setDeclinedUserId(userId)`，還 `setLocal({})`＋`saveLocal({})`：按「**不加入**」＝刪除這個瀏覽器的訪客紀錄、之後不再跳；「加入我的帳號」維持（合併後清本機）。注意：舊的 `local` 只在未登入時才寫 `localStorage`，所以必須明確 `saveLocal({})`。
  - **使用者原本的疑問與解釋**：他發現「重新整理也會再跳、除非按加入」，原因是舊「不加入」只是這次不管、`localStorage` 那筆還在；已用修法 2 解決。
  - **待實測（請主動問）**：①跳窗時按「不加入」→重新整理不再跳；②開遊戲視窗→關→馬上點 ♥／✓ 不鎖；③開排行榜→關→馬上點；④底部導覽有「規則助手」、我的統計不是 0／0。**若又跳窗，問是哪個動作之後跳的**（代表還有別處寫訪客紀錄）。
- **排行榜（已 push：`88d55a9`、`1628acd`、`417ffaf`、`f56b0a6`；`f56b0a6` 的畫面實測使用者尚未回報）**：
  - **最常玩榜**（`1628acd`）：SQL `get_play_totals()`（回 `bgg_name, play_total, play_month, play_quarter, play_year`；只有登入的 VIP／管理者能呼叫；只統計 `played = true`、VIP＋管理者）；前端 `lib/usePlayTotals.ts`、`Leaderboard.tsx`；VIP／管理者第五顆「最常玩」，一般人與訪客四顆（使用者回報 build 通過、手機五顆沒換行）。「全部」＝`play_count`＋有日期紀錄筆數；本月／本季／本年只算有日期的。
  - **人數與名單不一致（已查明）**：蒼天之死人數 6、名單 7；資料庫 7 人都是 VIP／管理者，名單對、**人數是舊的**（`useCommunityStats` 只在網站載入時讀一次）。`get_community_stats`、`get_game_people` 條件逐行一致，SQL 不用改。**修法（`417ffaf`）**：`useCommunityStats(enabled = true)` 加 `reloadKey`／`reload`；`Leaderboard` 內部自己呼叫 `useCommunityStats(isOpen)` 讀一份（每次打開重讀），**主畫面那份不動**；`App.tsx` 傳入的 `communityStats` prop 仍在型別但被忽略。一度在 `Leaderboard` 呼叫主畫面那份的 `reload()`，造成「關排行榜後主畫面卡」，`d8295fa` 註解掉驗證後改成自己讀一份。**遊戲視窗右上角「想玩 N・已玩 N」仍是載入時那份，打勾後要重新整理才更新（未處理）。**
  - **改版（`f56b0a6`）**：`Leaderboard.tsx` 整份覆蓋、新增 `src/styles/leaderboard-search.css`（`lbs-*`，元件自己 import）、`useCommunityStats.ts`。搜尋欄內右側「篩選」鈕（開著或有條件時綠底，角標＝條件數）；搜尋比對中文名與 `bggName`，輸入框 16px、有 ×，關排行榜清搜尋；篩選面板：**統計期間（全部／本月／本季／本年，只有想玩、已玩、最常玩榜出現）**、**排序方式（由高到低／由低到高）**、類型、推薦人數、遊戲時間、難度、「重設全部」。**使用者決定：期間搬進篩選；搜尋保留原名次；篩選後重排；要有排序方向。** 名次：`rankedAll`＝篩選後排名（`rankGames`）；`ranked`＝再套搜尋（保留原名次）與排序方向；**由低到高只反轉顯示順序、名次數字不變（AI 預設，使用者未確認）**。空結果：搜尋找不到「榜上找不到「…」」＋「清除搜尋」；資料篩選沒結果「沒有符合篩選的遊戲」＋「清除篩選」；期間沒資料「還沒有新增…／看全部期間」。舊的 `leaderboard-filter.css`（`lbf-*`）與 `vip.css` 的舊 `lb-periods` 沒人用，未清。難度分界（≤2 簡單、2～3 中等、≥3 偏難）是 AI 暫定值。`.lbs` 的 `padding: 6px 16px` 是猜的，沒對齊上方五個分頁只要調一個數字。
  - 另一個 AI 的排行榜示意圖（「示意資料」86／74／61）只當版面參考。
- **底部導覽與 ♥／✓ 快點（`97047fc`、`9cf727c`，使用者說「好像正常了」，之後的「短暫無法勾選」已由上面的 `useSession` 修法處理）**：`sitebar.css` 的 `.sb-item:hover` 包進 `@media (hover: hover) and (pointer: fine)`；`vip.css` 最底下加 `html, body, button, a, .game-card, .status-btn, .sb-item { touch-action: manipulation; }`。已讀過 `useBackClose.ts`（關視窗後快點只會把「收回歷史」延後最多 0.8 秒，不會關掉剛開的頁面），**不要為此改 `useBackClose.ts`**。`usePersonalCollection`：登入時 `updateEntry` 在 `status !== 'ready'` 直接 return；`canEdit = !userId || status === 'ready'`，按鈕 `disabled`。
- **仍未解決（承上一批 2.0，未驗證）**：Google App 內建瀏覽器底部五顆導覽「點了沒反應、要再點」（見下方「前批 2.0」最後一項）；登入短暫消失修好後可能一併改善，**請先問是否還會發生**。

### 2.0（前批）【2026-10-31 深夜，上一輪增補；與上面衝突時以上面為準】

- **git**：origin/master 最新 **`5181822`**。這輪 push：`0871d43`（統計只計已玩）→`20034c8`（規則連結與影片改版＋統計 ⓘ 微調）→`e12d87b`（討論留言頁面內確認）→`5181822`（共用確認視窗＋卡片標題固定兩行）。**之後還交付了「清單式留言」那批（`NoteListItem.tsx`、`note-list.css`、`GameNotesBoard.tsx`、`ClubBoard.tsx`），使用者是否 build／push 尚未回報，要問。** 三份 .md 與 `生成後.md` 要等使用者 commit／push（不計次數）。
- **聚會得點自動建遊玩紀錄（已完成、已測，不用再測）**：觸發器 `aa_ratings_add_session`（`AFTER INSERT OR UPDATE ON public.game_ratings`，呼叫 `add_session_from_rating()`；`security definer`、`search_path=''`；**撤銷：`drop trigger aa_ratings_add_session on public.game_ratings;`**）。規則（使用者決定）：①七項評分「從不完整變完整」那次才觸發；②只對「我出席、聚會日已到（台北）、該款是指定遊戲」的**日期最近**一場；③新增一筆 `game_play_sessions`（`played_on`＝聚會日，不動 `play_count`）；④同人同款同日已有紀錄不重複；⑤`exempt` 免評分者不自動增加；⑥舊聚會不回溯；⑦與 `play_status` 互不影響。**所以「出席不自動算玩過」改為「出席不自動算玩過，但評分完整會自動建當天遊玩紀錄」。** 觸發器出錯不吞錯（會讓該次評分一起失敗，刻意）。五個情境用「自動還原的交易」測過全通過（結果 0、1、1、1；沒指定、沒出席皆不新增）。備份表 `game_play_sessions_backup_20261031`、`user_game_status_backup_20261031` 仍在（RLS 開、無權限），**功能穩定幾天後要問使用者是否刪除**。`game_ratings` 七項欄位真名：`overall, like_score, player_impact_score, communication_score, change_score, unique_score, keep_score`。尚未實測：我的場次「我這場有玩這款」勾選與新紀錄是否衝突（理論上沿用同日同款）。
- **開團紀錄預設值＝不改**（`gathering_games` 只有 3 筆：1 played、1 cancelled、1 未確認且日期已到；使用者自己在聚會設定按一下）。
- **我的統計**：`MyList.tsx` 的 `stats` 加 `if (!entry?.played) continue`，總次數、總時數、TOP 只算已玩；「移除」仍不清 `play_count`（使用者決定）。概況頁間距與 ⓘ 微調在 `vip.css` 最底下（`.mystat-*`）。
- **遊戲規則區改版**（`20034c8`，使用者實測 OK）：`src/GameDocuments.tsx` 整份改寫，樣式 `src/styles/game-docs.css`（`gd-*`）；組標題小灰字、每份文件一列整列可點、管理者「刪除」在列右；上傳 PDF 仍只有管理者看得到。舊 class `docs-group-title`、`game-docs-item`、`bgg-link`、`admin-link` 在此元件已不用，可之後清。
- **遊戲卡片標題忽上忽下（已修、使用者實測 OK）**：`vip.css` 最底下 `.game-card .game-info h3 { display:flex; align-items:center; justify-content:center; min-height:2.7em; line-height:1.3; text-align:center }`。
- **確認視窗改頁面內（重要）**：Google App／LINE 等內建瀏覽器**不顯示 `window.confirm`／`window.alert`（直接當成取消）**，所以「刪除沒反應」。已新增 `src/lib/askConfirm.tsx`（`askConfirm(message, {confirmText, cancelText, danger})` 回 `Promise<boolean>`、`showNotice(message)`；自己用 `createRoot` 掛到 `document.body`，z-index 2000，**`App.tsx` 不用改**），並換掉：`ClubBoard`、`RatingSection`、`MyNotes`、`GatheringNotePanel`（`handleCopy` 改 async）、`AddPlayLog`（含三個 `window.alert`）；`GameNotesBoard` 用留言下方的兩段式確認（「確定刪除？／取消」，`pending` 狀態）。**使用者實測五項皆 OK。** **尚未換**：管理者專用的 `AdminPanel`、`GameDocuments`、`LoyaltyAdmin`（8 處含 `prompt`）、`MemberAdmin`（含 `prompt`）、`NewGatheringWizard`、`PlannedGatheringsAdmin`、`RulebookBatchUpload`、`DescriptionEditor`、`InAppBrowserNotice`（`prompt` 只在複製失敗時）——管理者用電腦所以不急；`PlaySessions.tsx`（刪遊玩紀錄，**朋友會用到，使用者還沒傳**）。`NotePrompt.tsx`、`RulebookAssistant.tsx` 是搜尋誤判（名字含 `Prompt(`），不需改。以後新增刪除／確認一律用 `askConfirm`，不要用 `window.confirm`。
- **清單式留言（已交付，待 build／push／實測）**：新元件 `src/components/NoteListItem.tsx`（收合：名字・「我的」・日期、遊戲 chip〔可點開討論〕、內容 2 行＋省略號；點一下展開全文與操作按鈕）＋`src/styles/note-list.css`（`nl-*`，`-webkit-line-clamp: 2`，想一行改 1）。套用在 `GameNotesBoard`（討論分頁）與 `ClubBoard`（留言板）；發表／編輯框 `rows` 3→2＋`nl-short`。**`MyNotes`（我的心得）尚未改**，等使用者看過再決定。
- **底部五顆導覽在 Google App 內建瀏覽器「點了沒反應、要再點一次」（未解決，下一批第一件事）**：使用者說 Safari 較順、**不要加「請用 Safari」提示（很多朋友用 Android）**。已讀 `useBackClose.ts`、`TopBar.tsx`、`sitebar.css`：`sitebar.css` 的 `.sb-item` 沒有 `touch-action: manipulation`（文件說在別處，未確認）；`TopBar` 按鈕只有 `onClick`；`App.tsx` 的 `goPage` 在 261～279 行，`useBackClose(() => setActivePage(null), activePage !== null || isFilterOpen)` 在 374～376 行（**這兩段使用者還沒貼**）。**假設（未驗證）**：①手機版抽屜／遮罩 `bottom` 用 `--nav-h`，內建瀏覽器的 `env(safe-area-inset-bottom)`／視窗高度與 Safari 不同，遮罩可能蓋到導覽列上緣，第一次點到遮罩（關抽屜），第二次才點到按鈕；②`useBackClose` 的 `history.go(-n)` 在內建瀏覽器行為不同。**請使用者貼**：`App.tsx` 255～285、365～380 行；`Select-String -Path src\styles\*.css -Pattern "nav-h|touch-action"` 的結果；並問「開著哪個視窗時最容易發生」。**不要先動 `useBackClose`（影響所有視窗）。**


- **git**：分支 `master`，最新 push **`d7e7fb9`**（新增聚會全螢幕流程）；之前依序是 `d2b2e26`（我的心得改版＋標題顏色修正）、`59c0526` 與 `3652916`（聚會設定第一批＋管理者暱稱）、`1e07eda`（上一輪三份 .md）、`5401962`（清理 `vip.css`）、`79281a2`、`320ab9e`、`73ece9d`、`370b91b`、`af8c15e`。三份 .md（本次重新產生）在 `d7e7fb9` 之後，**要等使用者 commit／push（該次不計入計數）**。使用者有兩台電腦（路徑同為 `D:\BoardGameResultAI`），**開工先 `git pull`**、`git log --oneline -5`。PowerShell 指令貼 VS Code 終端機（曾誤貼進 Supabase SQL Editor）；**Select-String 的中文搜尋字串在終端機可能亂碼而找不到結果，改搜英文或程式碼片段**。`Unlink of file '.git/objects/pack/…idx' failed (y/n)` 回 `n` 即可。
- **2026-10-31 新增／變動（詳見第 4～5 節）**：
  - **新增遊玩紀錄（`AddPlayLog`，`79281a2`，待實測）**：**入口已搬到「我的心得」頁右上角「＋ 新增遊玩紀錄」**（`d2b2e26`），任何 Google 登入者（含一般會員）都能記；遊玩紀錄只有本人看得到；一般會員記的遊玩**不會算進全站想玩／已玩人數**（只統計 VIP＋管理者）。「同時發表到討論」勾選只有 VIP／管理者可用：先存遊玩紀錄，再呼叫 `add_game_note`（失敗時稍等 0.8 秒重試一次，「已留滿 10 則」不重試），發表失敗不影響紀錄，只顯示說明。返回：新增遊玩紀錄→我的心得→俱樂部首頁。
  - **垃圾桶遊戲**：`MyList` 新增選填 prop `trashedGames`、`lookupGames = [...boardGames, ...trashedGames]`，用在 `MyNotes`、`MyGatherings`（`af8c15e`，聚會詳情封面）與 `AddPlayLog`（`370b91b`，補記遊玩搜得到垃圾桶遊戲，使用者實測可以）。想玩／已玩清單、統計、留言板、近期聚會仍不含垃圾桶。**垃圾桶遊戲現在能在聚會詳情點開遊戲視窗，`GameModal` 對它是否正常未驗證。**
  - **想玩分頁也有「紀錄與心得 ›」**（`370b91b`）：`PlayedGameRecord` 不再限定已玩分頁；視窗裡新增遊玩紀錄後這款有沒有自動標已玩，待實測。
  - **報到／加入 VIP 視窗支援返回鍵**（`73ece9d`，`build` 通過，待手機實測）：`CheckInDialog`、`VipJoinDialog` 各加 `useBackClose(onClose)`。報到過程中返回＝取消；報到成功、選遊戲評分時返回＝關閉報到視窗（之後可從「集點卡」補評分）；遊戲視窗疊在報到視窗上時先關遊戲視窗。**按返回關掉報到視窗後重新整理，視窗會不會又彈出（`clearCheckin` 有沒有清掉網址的 `?join=`）沒看過 `useCheckinLink.ts`，待確認。**
  - **`vip.css` 清理（`5401962`，待手機實測）**：3108 → 2599 行，刪 52 個沒人用的 class（舊 `gn-*`、多數 `gn2-*`、舊版我的場次 `mg-game-*`／`mg-play-btn`／`mg-note-*`、`cls-sort-inline`、`cls-sortrow`、`gb-body`、`gb-toggle`、`gb-mine-title` 等）。**保留** `rb-done`、`rb-error` 等（`RulebookBatchUpload.tsx` 第 646 行用 `rb-${row.status}` 拼出）與 `org`、`w3`（CSS 裡網址被誤判）。**沒動** `gi .ma-backdrop .ac-modal` 那行（要單獨一批用手機測）。
  - **預計聚會想玩名單的 SQL 已建**：`admin_get_want_to_play_people()`（使用者已執行並確認權限），前端尚未接。
  - **返回問題追蹤已結案（使用者 2026-10-31 回報）**：規則助手點「📖 這款的規則連結與影片」→ ✕／返回會回到規則助手頁（符合預期，不是問題）；底部導覽「要點 3 次」最近沒再發生，若再發生才重開。
  - **本輪新增（2026-10-31 晚，皆待手機實測）**：
    - **抽屜標題顏色（`d2b2e26`）**：原因是 `vip.css` 最底下有一條「電腦版」規則把所有 `.mylist-drawer h2` 強制白字，淺底的留言板／補記遊玩／我的場次標題因此看不見（**不是 `5401962` 清理造成的**）。已改成 `.mylist-drawer .mylist-header h2 {color:#34463c !important}`、`.mylist-drawer .club-top h2 {color:#fbf7ec !important}`（只有「我的俱樂部」首頁深綠底用白字）。集點卡標題列若是深色底可能受影響，使用者尚未回報。
    - **我的心得改版（`d2b2e26`）**：`MyNotes.tsx` 變成個人心得管理頁，樣式 `src/styles/my-notes.css`（`mh-*`，元件自己 import）。頂端「＋ 新增遊玩紀錄」；篩選「全部／公開留言／私人心得／來自聚會」；日期新到舊；三種卡片：遊戲公開留言（`game_notes`，可編輯 `update_my_game_note`、刪除 `delete_my_public_note`，被隱藏的標紅字）、場次心得私人欄、場次心得公開欄（**一則場次心得的兩欄拆成兩張卡**，不重複；編輯走「到這場聚會編輯 ›」，刪除只清那一欄，用 `saveGatheringNote`）；載入失敗顯示「重新讀取」。**新 SQL `get_my_all_game_notes()`（已建、權限已確認：只有 `authenticated`、`postgres`、`service_role`）**。遊玩紀錄備註與「我的整體心得」**不放進這頁**（仍在「我的統計→已玩→紀錄與心得」）。舊的 `mn-*` 樣式（`vip.css`）現在大概沒人用，**未清**。
    - **俱樂部首頁入口**：我的統計／近期聚會／留言板／**我的心得（📝，登入者）**／我的場次。留言板只留大家的留言牆與「＋ 發表留言」。
    - **新增聚會一次完成（`d7e7fb9`）**：管理中心「聚會設定」的「①新增聚會」改成一顆按鈕，開全螢幕視窗 `NewGatheringWizard.tsx`（`src/components/`，樣式 `src/styles/new-gathering.css`，`ngw-*`，z-index 1260，`useBackClose`）：基本資料→指定遊戲（每款列想玩者名字，已選參加者標綠）→參加者（單行條列、「想玩 N 款 ▾」在該列下方展開、已選者可勾「免評分」）→聚會連結與人數上限，底部「取消／建立聚會」。**連結與人數上限綁在一起**（上限只存在 `gathering_checkins`），需先指定至少一款遊戲、聚會日是今天或未來、手動加入人數 < 上限；補登過去的聚會自動關閉連結。建立順序：`gatherings`→`gathering_games`→`gathering_attendees`→`gathering_checkins`；中途失敗聚會保留、顯示失敗項目、不建連結。加入參加者前會確認（他們自動成為 VIP）。`LoyaltyAdmin.tsx` 已移除舊的新增表單、`addGathering`、`sortGatherings`；建立後 `loadAll()` 並自動展開那一場。沒改資料庫。
    - **聚會設定第一批（`3652916`、`59c0526`）**：「近期聚會」展開後，指定遊戲底下列想玩者名字（`admin_get_want_to_play()`＋暱稱）、「開團紀錄確認」併進每款遊戲那一列（日期已到且未確認顯示「⚠ 待確認」）、手動加入參加者改單行條列（`lga-list.css`）。**開團紀錄預設值（日期已到就算實際開團）未改，要先查 `gathering_games.play_status` 分佈。**
    - **管理者可設暱稱（`59c0526`）**：`PlayerPanel.tsx` 不再對管理者 `return null`、不載入資料；管理者不會被強制跳窗，頂端暱稱按鈕沒設定時顯示「設定暱稱 ▾」；`TopBar.tsx` 的管理者「登出」鈕保留。預期留言板不再出現「（未命名）」（未驗證）。
- **遊戲詳細視窗（`GameModal.tsx`）＝四分頁「概覽｜評分｜討論｜紀錄」**（已實測正常）：
  - **概覽**：簡介（`DescriptionEditor`）、屬性點點、類型標籤（可點，含策略／派對）→ 點選展開同類型小封面牆（4 欄、最多 12 款、「看更多」，點封面在同一視窗切換遊戲）、可收合「規則連結與影片」（`GameDocuments`，管理者 PDF 區也在裡面）、管理者封面上傳與移垃圾桶。視窗右上角（× 旁）顯示「想玩 N・已玩 N」（只統計 VIP＋管理者）。
  - **討論**（`GameNotesBoard`）：大家的留言板，**只有文字**；VIP／管理者看得到、能寫（寫的條件：管理者不限，其他人要已玩或評分過）；**一人一款最多 10 則（被管理者隱藏的也算，自己刪除才空出名額）**、每則 ≤200 字，顯示暱稱（隱藏暱稱者＝「匿名玩家」）與日期（年月日），最新在最上面；作者可編輯、刪除自己的，管理者可隱藏／恢復別人的。
  - **紀錄**（`GamePlayHistory`）：這款遊戲曾經在俱樂部開團的日期，**由管理者在聚會裡確認「實際開團／取消」才計入**；會員只看得到日期與狀態、**看不到成員**。
  - 非 VIP 在討論與紀錄看到「只有 VIP…」。
- **俱樂部（導覽列第五顆，`MyList.tsx`）首頁**：摘要卡（暱稱、徽章、集點小字）、「去評分」卡（`todayPending`）、入口列：▤ 我的統計（想玩／已玩／概況）、🎲 **近期聚會（只有 VIP／管理者）**、💬 留言板（登入者）、📝 **我的心得（登入者）**、📅 我的場次（登入者）。**我的統計 → 已玩／想玩**每款遊戲底下有「紀錄與心得 ›」小視窗（`PlayedGameRecord`：遊玩次數與日期紀錄、我的整體心得、各場次私人心得）。`MyList` 內部 `view`：`home | stats | gatherings | addplay | notes | board | upcoming`；返回：`addplay`→`notes`，其他子畫面→首頁。
- **留言板（`ClubBoard.tsx`）**：VIP／管理者看得到大家最新 200 則留言（搜尋遊戲名、內容、暱稱；點遊戲名標籤開那款的「討論」分頁）、「＋ 發表留言」（只能選自己已玩或評分過的遊戲，管理者不限）、可刪除自己的留言。**「新增遊玩紀錄」與「我的心得」兩顆按鈕已搬走**（`d2b2e26`）。非 VIP 看到提示。**首頁不顯示最新留言**（使用者決定）。
- **我的場次（`MyGatherings.tsx`＋`GatheringNotePanel.tsx`）**：清單依月份分組；聚會日已到的每場下方有「補寫心得 ›」，點了進聚會詳情並自動捲到心得區；管理者不在出席名單時，心得區提示改為引導到留言板。私人心得只能綁出席過的場次（`save_gathering_note` 限制未改）。
- **近期聚會（預計聚會，2026-10-30 新做，待實測）**：管理者在管理中心「聚會集點→聚會設定」最上面的可收合「預計聚會」區塊新增（日期、**開始時間（選填）**、標題、備註、預計遊戲；**同一天可有多場**）；VIP 在俱樂部首頁「🎲 近期聚會」看到列表（遊戲封面可點進詳情），按「我可以去」登記意願（一鍵開關）。**VIP 看不到意願人數與名單（使用者 2026-10-30 15:45 決定）；VIP 只看到自己有沒有登記（「你已登記」）；管理者看得到人數與意願名單（暱稱＋LINE／FB）。** 取消保留並標「已取消」、「標示已轉正式」保留 `gathering_id` 關聯、不自動複製遊戲或名單；過期自動隱藏、資料保留。詳見 PROJECT_CONTEXT 第 4 節。
- **近期聚會提醒徽章（第十九批，`c088880`，待實測）**：導覽列「俱樂部」圖示的數字＝**還沒看過的新預計聚會數**，沒有就不顯示（原本顯示的 106 其實是使用者自己標過想玩／已玩的款數 `myListCount`，已不用在徽章）；俱樂部首頁「🎲 近期聚會」右邊有紅色小標「N 場新的」（inline 樣式）。只對 VIP／管理者；資料沿用 `get_upcoming_gatherings()`；已取消、已轉正式、已過期不算；進入近期聚會頁就全部標為已讀；已讀記在 `localStorage` 鍵 `boardgame-seen-planned:<帳號id>`（內容是預計聚會 id）；共用 hook `lib/usePlannedUnseen.ts`，切回網站分頁會重讀。**不是推播**，LINE 群組仍要管理者手動貼；第一次用時現有聚會對每個人都算新的。
- **我的統計操作改善（第十八批，`df88bbc`，待實測）**：搜尋排序列固定在上方（`cls-sticky`）、往下捲出現右下角綠色 ↑（`DrawerToTop`）、切換分頁自動回頂端；每次打開先回「概況」、搜尋清空；想玩／已玩各自記住排序（`localStorage` 鍵 `boardgame-stats-view`）。
- **建立聚會時的「想玩」提示（第二十批，`0fc42d5`、`2e3a06e`，使用者回報 C1 沒問題、C2 待實測）**：管理者專用，資料來自新函式 `admin_get_want_to_play()`（只統計 VIP＋管理者）。正式聚會（`LoyaltyAdmin.tsx`）：玩家膠囊旁「想玩 N 款 ▾」可展開；①指定遊戲旁顯示小字——已選參加者時「已選玩家中有 N 人想玩」並把人數多的排前面，沒選人時「社群有 N 人想玩」（不排序）。預計聚會（`PlannedGatheringsAdmin.tsx`）只顯示「社群有 N 人想玩」。**只是參考，不自動勾選、不排行。** `privacy.html` 已補一句（管理者安排聚會時會參考想玩清單）。
- **管理中心**（4 顆分頁：成員、聚會集點、規則書、資料匯入）：「聚會集點→聚會設定」由上而下：預計聚會（可收合）、①新增聚會（一顆按鈕開全螢幕流程）、②近期聚會（依月份；展開每場有指定遊戲＋想玩者名字＋開團狀態標籤、人數上限、手動加入條列、聚會連結）；規則書分頁有容量條與「已上傳」分頁。
- **其他已完成的重點**：想玩／已玩只統計 VIP；評分說明小「i」；寫心得提示條（`NotePrompt`）；遊戲視窗標題固定色；NEW 只對沒看過的人顯示；`useVip` 模組快取；返回機制堆疊式 `useBackClose`；俱樂部電腦版標題白字；`privacy.html`（2026-10-30 已含遊戲留言與近期聚會意願登記）。舊函式 `save_game_note`、`get_my_game_note` 已從資料庫刪除。
- **介面精簡原則（使用者大方向）**：畫面越乾淨越好，非必要說明文字拿掉；長說明用小 `InfoHint` 或收合。導覽列第五顆叫「俱樂部」；主畫面篩選在搜尋欄內，檢視模式在篩選抽屜最上面；篩選記憶 `lib/filterStorage.ts`（鍵 `boardgame-filters`，搜尋文字不存）；新遊戲置頂 15 天（`isPinnedGame`）；管理中心手機版 `.ma-backdrop .ac-modal{height:100%}`。
- **規則助手（已上線）**：檢索 SQL、獨立頁面 `RulebookPage.tsx`＋`RulebookAssistant.tsx`、導覽 ✦ 規則助手（僅 VIP／管理者）、`zhEnGlossary.ts`、翻譯與複製按鈕、規則文件簡化（`lib/docLabels.ts`）、PDF 大小與錯誤提醒、「📖 這款的規則連結與影片」快捷（開概覽並展開規則區）。
- **聚會連結名額**：連結可用總名額＝上限－手動加入；手動加入已達上限就不能建立連結。
- **空間用量（2026-10-28）**：`rulebooks` 13 份 116.8 MB、`covers` 98 張 6.2 MB、資料庫 14 MB；免費額度未自行查證，以後台 Usage 為準。

## 3. 使用者需求狀態

N1～N6、我的桌遊整合、贈送免費券、新遊戲置頂、我的場次、補記遊玩、場次心得、返回機制、我的俱樂部精簡、評分說明小符號、想玩／已玩併進「我的統計」、想玩／已玩只統計 VIP、我的心得清單、自動跳窗、遊戲留言板（多則、討論分頁）、概覽改版、遊戲紀錄（開團確認）、俱樂部留言板、我的場次補寫心得、**近期聚會（預計聚會）**均已完成（近期聚會待使用者實測回報）。

**2026-10-30 晚完成（待實測）**：我的統計操作改善（第十八批）、近期聚會提醒徽章（第十九批）、建立聚會時的「想玩」提示（第二十批；C1 使用者回報沒問題）。

**2026-10-31 完成（待實測）**：垃圾桶遊戲聚會詳情封面、補記遊玩搜得到垃圾桶遊戲、想玩分頁「紀錄與心得」、報到／VIP 視窗返回鍵、`vip.css` 清理、新增遊玩紀錄可同時發表到討論。

**2026-10-31 晚完成（待實測）**：聚會設定第一批（想玩者名字、開團確認併入、玩家條列）、管理者可設暱稱、抽屜標題顏色修正、我的心得改版、新增聚會一次完成流程。

## 4. 待辦順序（一次一批，上一批實測完才進下一批）

> **最新最新（2026-10-31 深夜後二，以此為準）**：①先問 `4025cd8` 的手機實測（2.0（最新）的四項，尤其是開遊戲封面→✕→點俱樂部來回不卡；要用 Google App 內建瀏覽器）；②問 `a9b7748`、`8da7b09`、`f8e2d5d` 的實測（刪除遊玩紀錄確認視窗、留言板靠左、我的心得清單式）；③待辦：管理者專用檔案的 `confirm`／`prompt` 換 `askConfirm`（`askConfirm` 沒有輸入框，`prompt` 要先決定做法；要請使用者傳 `askConfirm.tsx`、`MemberAdmin.tsx`、`AdminPanel.tsx`、`RulebookBatchUpload.tsx`、`DescriptionEditor.tsx`）、預計聚會想玩名單已完成不用再做、聚會設定版面與開團紀錄預設值（先查 `gathering_games.play_status` 分佈再問）、`game_notes_backup_20261030` 是否刪、舊 `mh-*` 樣式清理、`MyNotes` 之外討論分頁／留言板樣式微調；④之前第 2 項「預計聚會顯示想玩的人」與「遊戲視窗右上角人數打勾後才更新」都已完成。

> **前一版最新（2026-10-31 深夜後，已被上面取代）**：①**先問登入短暫消失兩個修復的實測結果**（2.0 的待實測 ①～④）與 `f56b0a6` 排行榜新畫面（左右留白、期間／排序在篩選裡、人數每次重讀）；②清單式留言那批是否 build／push、手機看起來如何；③底部五顆導覽在 Google App 卡住是否還會發生（要使用者貼 `App.tsx` 255～285、365～380 行；不要先動 `useBackClose`）；④`PlaySessions.tsx` 與管理者檔案換 `askConfirm`（先請使用者傳 `PlaySessions.tsx`）；⑤`MyNotes` 是否改清單式；⑥遊戲視窗右上角想玩／已玩人數打勾後才更新（未處理）；⑦備份表 `game_play_sessions_backup_20261031`、`user_game_status_backup_20261031` 穩定幾天後問是否刪除。

> **深夜更新（以此為準）**：①先問清單式留言那批是否 build／push、手機看起來如何；②**底部五顆導覽卡住**（第 2.0 節最後一項，要使用者貼 App.tsx 片段與 CSS 搜尋結果）；③`PlaySessions.tsx` 與管理者檔案的確認視窗換成 `askConfirm`（先請使用者傳 `PlaySessions.tsx`）；④`MyNotes` 是否也改清單式；⑤使用者說「一目了然」的畫面要再問是哪一頁。下面舊清單中：第 3 項（規則區改版）、第 5 項（統計擁擠）、第 6 項（已玩次數自動 +1，**已改做成「評分完整自動建遊玩紀錄」，見 2.0**）**都已完成**，不要再做。


0. **先問**：使用者在哪台電腦、`git pull`／`git status`、`git log --oneline -5`（最新應為 `d7e7fb9` 或其後；確認三份 .md 是否已 commit／push）；**實測結果**（第 5 節；使用者多半沒回報，**特別是本輪四批：我的心得、新增聚會流程、聚會設定第一批、管理者暱稱與標題顏色**）；`gathering_notes` 權限檢查（SQL：`select grantee, privilege_type from information_schema.role_table_grants where table_schema='public' and table_name='gathering_notes' and grantee in ('anon','authenticated');` 應「No rows returned」，使用者尚未回報；`game_notes`、`planned_*` 三張表已確認）；`get_rating_summaries()` 是否排除沒玩過遊戲的五項；`loyalty_grants` 權限與計入方式。
1. **（已做，待實測）管理者可設暱稱**：見第 2 節。若實測發現管理者在 `player_profiles` 仍沒有暱稱、名單空白，再回頭看 `PlayerPanel.tsx`／`TopBar.tsx`。
2. **預計聚會顯示「想玩的人」（前端，2026-10-31）**：SQL `admin_get_want_to_play_people()` 已建（回 `bgg_name, user_id, nickname, contact_name`；使用者貼回權限結果為 `postgres`、`authenticated`、`service_role` 有 EXECUTE，沒有 `anon`）；**回傳型別要到執行時才驗得出，接好前端後請使用者實測**。使用者已上傳 `PlannedGatheringsAdmin.tsx`。預設做法：只給管理者；遊戲旁「社群有 N 人想玩 ▾」可點開，列出「暱稱（LINE／FB）」；暱稱空白顯示「（未設暱稱）」；函式失敗整段不出現；不動 `admin_get_want_to_play`。正式聚會（`LoyaltyAdmin.tsx`）要不要也加名單：未討論。
3. **遊戲規則區改版（`GameDocuments.tsx` 已上傳）**：使用者抱怨「奇怪的影片教學卻又點不了」——現況是每組有 `<h4 className="docs-group-title">`（「🔗 網頁與規則連結」「▶ 教學影片」「📄 規則書 PDF（只有管理者看得到，供搜尋用）」），長得像可展開的選單但點不了，下面才是連結；連結用 `className="bgg-link"`，管理者每列右邊有「刪除」。預設做法：每份文件一列、整列可點，組標題改成不像按鈕的小標，管理者「刪除」留在每列右側；一般人看不到 PDF 的規則不變。使用者貼的 Earthborne Rangers 資源頁（磚塊式連結）是參考圖，**要不要做成磚塊還沒問**。**另一個 AI 建議改成「遊戲資源」分三區（規則書／教學與玩法／其他資源）、管理模式才顯示刪除——尚未採用；其中把「規則書 PDF」給所有人開啟與「上傳的 PDF 只給 AI 檢索、不公開」的決定衝突，不可照做。**
4. **聚會設定版面（部分已解決）**：新增聚會已改成全螢幕一次完成（`d7e7fb9`），第一批的想玩者名字與玩家條列也做了。**還沒決定**：預計聚會／近期聚會要不要再整理、「近期聚會」是否改名（使用者對三者的定義見第 6 節；另一個 AI 的「聚會管理／歷史聚會」建議未採用）；**開團紀錄預設值**（日期已到、未標取消就算實際開團？會改 `get_game_play_history` 並讓舊的未確認資料一次算進去，**要先查 `gathering_games.play_status` 分佈，再問使用者**）。先看實測回報最不順眼的是哪裡再提方案。
5. **我的統計 TOP 3／5／10 太擠（2026-10-31，使用者手機截圖）**：概況頁「最常玩 TOP 3」標題貼著上方三個方塊、3／5／10 圓鈕擠在右邊；截圖上「總時數」方塊的小 ⓘ 也貼著數字。小 CSS 修正（要改 `mystat-*` 相關 class，先 `Select-String` 確認位置）。**另外截圖有個疑點**：想玩 0、已玩 0、「玩過 0 款」，卻有「總遊玩次數 4」與最常玩 風聲再臨 3 次、聖域：血與沙 1 次——是哪個帳號、這兩款有沒有標已玩、是不是垃圾桶遊戲，**原因未驗證，要問**。
6. **聚會得點時「已玩次數」自動 +1（使用者 2026-10-31 提出，待討論）**：使用者想法是被加入聚會或收到連結的人得到一點時，已玩次數自動 +1。**與 2026-10-30「出席不自動算玩過」的決定衝突**，要先確認使用者是否推翻。要問清楚：加在哪一款（當天指定遊戲有多款時）、是否只在「七項評分完整得點」時才加、跟聚會詳情的「我這場有玩這款」勾選與同日同款 `game_play_sessions` 會不會重複計、跟管理者的「開團紀錄確認」（`play_status`）關係、`exempt` 免評分者怎麼算、補登的舊聚會要不要回溯。影響資料與統計，**先提方案與預設值，等「照建議」再動工，並走 SQL 一次一段**。
7. **小項（使用者沒急）**：①`LoyaltyCard.tsx`、②`StatsTables.tsx`、④`CheckInDialog`／`VipJoinDialog` 返回鍵、⑤想玩分頁「紀錄與心得」、⑥「新增遊玩紀錄」發表到討論勾選、聚會設定第一批、管理者暱稱、標題顏色、我的心得、新增聚會流程（皆已 push，待實測）、`vip.css` 清理（`5401962`）**都已完成或不用做**；**只剩 `vip.css` 手機版那一行 `gi .ma-backdrop .ac-modal`**（前面多了 `gi `，規則永遠不生效，應為 `.ma-backdrop .ac-modal`，修掉會改變管理中心手機版面，要單獨一批用手機測）。清理後是否還有重複的 `.modal-backdrop { z-index: 1150 }`、`.mg-game-row`、`.rb-*`／`.ac-tabs` 沒確認。**刪 class 前先掃動態拼接（`${`）。**
8. **導覽列改版（最後做）**：另一個 AI 的示意畫面是假資料，**未採用**；影響 `NavPage`、`TopBar`、`sitebar`、`--nav-h`、`useBackClose`。
9. **中英檢索測試集與命中率評估**：每款規則書各 5～8 題標頁碼；中文 PDF 擷取品質尚未測；中文檢索（`pgroonga`、`pg_trgm`、語意搜尋、翻譯 API 皆未查證）。
10. **規則資源管理美化／玩錯勘誤（尚未決定）**：需新資料表，先討論欄位與權限；規則 PDF 維持只給 AI 檢索、不公開。
11. 其餘：手機底部 5 顆若擠，「✦ 規則助手」縮成「規則」；「更新版本」按鈕；章節標題（`section_title` 空）；OCR（第一版不做）；管理者視窗統一風格；PWA（缺圖示）；VIP 朋友名單（`get_vip_friends` 已建、UI 未做）；推薦牆；站上拖曳調整排名＋匯出 CSV（PROJECT_CONTEXT 第 8 節）；VIP 鎖定 SQL（執行前先討論）。
- （已完成，不要再做）**主畫面「新預計聚會」通知**：2026-10-30 改成導覽列與俱樂部首頁的未看過數字徽章（第十九批 `c088880`；使用者決定不另做提示卡），見第 2 節。

## 5. 尚未驗證／小項（有機會就問）

- **2026-10-31 新增待測（使用者多半尚未回報）**：
  - **`vip.css` 清理（`5401962`）**手機看有沒有跑版：我的場次與聚會詳情、場次心得視窗、我的統計排序列、討論分頁、管理中心、規則書分頁。
  - **新增遊玩紀錄發表到討論（`79281a2`）**：勾選發表後討論分頁有出現留言；一般會員看不到勾選；一般會員仍能記遊玩。
  - **垃圾桶封面（`af8c15e`）**：我的場次→有塞西亞掠奪者那場→詳情封面不是 🎲；點遊戲卡片能開視窗、不當掉；「我的心得」裡垃圾桶遊戲有封面。
  - **想玩分頁「紀錄與心得」（`370b91b`）**：在想玩的遊戲新增一筆遊玩紀錄後，這款有沒有同時出現在已玩分頁。
  - **報到／VIP 視窗返回鍵（`73ece9d`）手機測**：①頂端「加入 VIP」→返回，視窗關閉；②遊戲視窗裡的 VIP 鎖頭→加入 VIP→返回，只關密碼視窗；③用報到連結開網站、報到成功→「去評分」開遊戲視窗→返回只關遊戲視窗，再按一次才關報到視窗；④報到視窗按「取消」或「好的」後再按返回，不會多退一頁離開網站；⑤關掉後重新整理，視窗不應再彈出（`?join=` 有沒有被清掉未確認）。
  - **我的統計畫面**：使用者 2026-10-31 傳過一張手機截圖，只回報「3／5／10 有點擠」；第十八批其他項目（固定列、↑ 按鈕、排序記憶）仍未回報。
  - **本輪（使用者尚未回報）**：①**我的心得**（`d2b2e26`）：四個篩選有作用、日期順序對、垃圾桶遊戲有封面或 🎲；遊戲公開留言編輯→儲存、刪除後名額 −1；被隱藏的標紅字；場次心得刪私人欄／公開欄，另一欄還在；「到這場聚會編輯 ›」跳對聚會；「＋ 新增遊玩紀錄」儲存後返回回「我的心得」；一般 Google 帳號進去不報錯。②**標題顏色**：電腦版與手機版的留言板、補記遊玩、我的場次、我的統計、集點卡標題都看得到；「我的俱樂部」首頁標題白字。③**新增聚會流程**（`d7e7fb9`）：開關（×、取消、返回鍵）；加遊戲、勾參加者、展開「想玩 N 款」；建立今天的聚會（遊戲＋上限＋連結）後在「近期聚會」看到連結；過去日期連結選項為灰；重複場次名稱顯示錯誤；勾參加者建立後出席名單有他們。④**聚會設定第一批／管理者暱稱**（`59c0526`）：指定遊戲底下有想玩者名字、勾參加者後標綠；日期已到的遊戲有「待確認」按鈕；管理者頂端有「設定暱稱 ▾」，留言板不再「（未命名）」，一般玩家選單與跳窗不變。

- **第十八批（我的統計）實測清單（使用者尚未回報）**：手機上①分頁與搜尋排序列固定在上方；②往下捲右下角 ↑ 出現、點了回頂端、不被底部導覽蓋住；③排序有被記住、每次打開先回「概況」、搜尋清空；搜尋列上方沒有露縫。可能微調：`-16px` 調大、`bottom: 20px` 調高、`.mylist-drawer` 是否 positioned。
- **第十九批（提醒徽章）實測清單（使用者尚未回報）**：①VIP 帳號導覽列「俱樂部」出現數字、俱樂部首頁看到「N 場新的」，進近期聚會再返回兩處都消失；②管理者新增一場，VIP 切回網站（或重新整理）後 +1；③管理者取消一場未看過的，數字減少；④一般 Google 帳號與訪客不顯示；⑤手機底部導覽的數字沒被切到。
- **第二十批（想玩提示）實測清單**：C1（正式聚會）使用者已回報沒問題；**C2（預計聚會的遊戲旁「社群有 N 人想玩」）使用者只回報了 push，尚未回報實測**；還可確認：數字與排行榜／遊戲視窗右上角的想玩人數大致相符、手機版膠囊沒被擠到換行、函式失敗時提示整個不出現。
- **近期聚會實測清單（使用者尚未回報）**：`npm.cmd run build` 通過；管理者新增一場（日期、開始時間、標題、遊戲）；同一天新增第二場，排序依開始時間；VIP／管理者的俱樂部首頁有「🎲 近期聚會」、一般 Google 帳號**沒有**；預計遊戲小封面有沒有變形或太大（`renderCover` 輸出是猜的）；「我可以去」↔「取消意願」切換、重新整理後仍在；**VIP 看不到人數（只顯示「你已登記」）、管理者看得到「N 人可以去」與意願名單**；管理者「取消聚會」→ VIP 看到「此聚會已取消」且不能登記；「恢復開放」；「標示已轉正式」選正式聚會；刪除；手機版底部不被導覽列蓋住；返回鍵只回俱樂部首頁。
- **較早的清單（若仍沒回報要問）**：非 VIP 帳號不該看到留言；隱藏暱稱者他人看＝「匿名玩家」；`NotePrompt` 15 秒自動收起與「現在寫」跳到對的聚會詳情；俱樂部電腦版標題是否變白字；管理中心手機版上下是否被切；篩選抽屜小 i 泡泡；我的統計排序；「我的心得」展開／刪除；非 VIP Google 帳號標想玩後全站人數不增加、其自己的「我的統計→想玩」仍有；排行榜整體評分／留下來榜對非 VIP 的畫面（文件記載 `get_rating_summaries()` 限 VIP，未實測）；非 VIP 的 Google 登入者有沒有可能出現在出席名單（例如被取消 VIP 後）。
- **返回測試清單**：排行榜→點遊戲→返回（排行榜還在）；俱樂部已玩清單點遊戲→返回；我的場次→場次詳情→點指定遊戲→返回；規則助手→「📖 這款的規則連結與影片」→返回（搜尋結果還在）；以上用 ✕ 結果相同；詳細視窗開著點底部導覽會關掉並切頁；我的統計／場次／補記按 ✕ 回俱樂部；場次詳情→寫心得→返回只關心得視窗；主畫面按返回才離開網站；每層關閉後上一層搜尋、捲動、編輯狀態是否保留（未驗證）。
- 規則助手疊視窗層級、− ＋ 手機好按度、登出後篩選記憶、iPhone 翻譯、非管理者看不到 PDF 區、底部 5 顆是否擠、非 VIP 看不到規則助手。
- `furuyoni` 規則書是日文，第一版不收（但已上傳過 `RisingSun_v1.2`，語言待確認）。
- 驗證社群平均是否含管理者那一票；「獨特性／快速性」是否改成「度」（使用者未回覆）；評分說明的快速性、複雜度方向是 AI 推測、未確認。
- `to_regclass('public.gathering_plays')` 應為 null；`select bgg_name, cover_slug from public.board_games where cover_slug !~ '^[a-z0-9_-]+$';` 應 0 列。
- **已查證**：檢索只用 `to_tsvector('english', content)`、完全不看語言欄；中文 PDF 搜不到中文內文。刪帳號時 `admin_delete_member` 會刪 `auth.users`，`gathering_notes`、`game_notes`、`planned_gathering_votes` 連動刪除，`privacy.html` 說法正確。
- Console 一堆 `ERR_CONNECTION_REFUSED`、`Setting up fake worker`：先確認 `npm.cmd run dev` 有在跑。
- **查空間用量 SQL（Supabase SQL Editor，一次一段）**：①`select bucket_id, count(*) as 檔案數, round(sum((metadata->>'size')::bigint) / 1024.0 / 1024.0, 1) as mb from storage.objects group by bucket_id;` ②`select pg_size_pretty(pg_total_relation_size('public.rulebook_chunks'));` ③`select pg_size_pretty(pg_database_size(current_database()));`

## 6. 使用者的決定（不要推翻）

- **2026-10-31 深夜後新增**：①排行榜期間放進篩選、搜尋保留原名次、篩選後重排、要有排序方向；②合併視窗「不加入」＝刪除這個瀏覽器的訪客紀錄、之後不再跳（使用者回「照建議」）。
- **2026-10-31 深夜新增**：①**不要在網站加「請改用 Safari」之類的提示**（很多朋友用 Android，要真的修好內建瀏覽器的操作）；②留言一律用**清單式**（名字、日期、遊戲、內容 2 行省略，點開看全文，輸入框不要太高）；③確認視窗一律用頁面內的 `askConfirm`；④評分完整會自動建當天遊玩紀錄（規則見 2.0）；⑤開團紀錄預設值不改；⑥統計只算已玩、「移除」不清 `play_count`。

- **規則助手＝零生成式 AI API 費用**：只做「檢索＋複製提示詞給使用者自己的 AI」；只給 VIP／管理者；網站內容用「另存成 PDF 再上傳」；搜尋紀錄保留 7 天、台北時間 0 點重置額度（VIP 30 次、管理者不限）；不存問題內容；只有找到結果才扣次數；授權風險由使用者自行評估。
- **上傳的 PDF 只給 AI 檢索，不公開**；第一版不做 OCR；PDF 太大只提醒不阻擋。
- 站名保留「桌遊規則助手」；左右滑動切換分頁等頁面獨立後再做；Email 登入、現場報到碼先不做；「我的桌遊」不做擁有／收納／借出。遊戲簡介補寫晚點。
- 管理者 CSV 分數算進社群評分；卡片「綜合分數」＝700 − `score_rank`（**不要揭露計算方式**）；評分用語用「度」（`parseCsv.ts` 的 CSV 欄名**絕對不能改**）。
- 規則書管理一律在管理中心；篩選記憶全存、只存該瀏覽器；詳細視窗**沒有想玩／已玩按鈕與計數器**，遊玩次數只在俱樂部「我的統計→已玩」調整。
- **返回規則（2026-10-29 使用者明確要求）**：所有 ✕ 與手機內建返回（iPhone 右滑／Android 返回）都**只回上一層**，不要回主畫面；有子畫面的視窗 header 只留 ✕。
- 場次相關：隱藏暱稱者顯示「匿名玩家」；場次遊戲＝當天指定遊戲；**出席不自動算玩過**；補記沿用 `game_play_sessions`，總次數＝`play_count`＋有日期紀錄筆數；補登按鈕保留；沒玩過的遊戲七項不顯示分數；心得頁規則：沒修改直接關、有修改問儲存／捨棄／繼續、儲存失敗保留文字、「未記錄心得」只是資訊不是任務。
- **想玩／已玩的社群人數與名單只統計 VIP**（管理者也算）；清單排序每個欄位都要有兩個方向；評分名稱旁加小符號說明；清單小字維持「已記錄心得 N/M」；**管理者看不到私人心得**；補記遊玩可選垃圾桶遊戲；三份 .md 的 commit／push 由使用者自己做。
- **2026-10-30 決定**：近期聚會只給 VIP；概覽的類型標籤含策略、派對，預設全收起；概覽不放大家評分摘要與期間新增，想玩／已玩總人數放右上角；規則併進概覽；公開留言一律自願、可刪除自己的；討論一人可留多則（≤10，隱藏的也算）、只有文字；紀錄由管理者確認實際開團；「我的紀錄」三樣資料搬到已玩清單的「紀錄與心得」；俱樂部首頁不顯示最新留言；俱樂部電腦版深綠底文字要白字。
- **近期聚會（2026-10-30 定稿）**：一筆預計聚會＝一個日期＋選填開始時間＋標題＋遊戲清單；**同一天允許多場**；遊戲數量不限；VIP 一鍵「我可以去」可隨時取消；**VIP 看不到意願人數與名單，只有管理者看得到**（推翻先前「VIP 看人數」）；不做想玩人數統計、人數上限、候補、截止日、通知（第一版）；取消保留並標示；轉正式由管理者手動、保留關聯、不自動複製遊戲或名單（「我可以去」≠正式報名）；過期自動隱藏、資料保留。
- **2026-10-30 晚決定**：
  - **我的統計**：「每次都要重設」只指我的統計——分頁每次回「概況」、搜尋每次清空、捲動回頂端；排序例外，想玩、已玩各自記住。
  - **提醒徽章**：不另做主畫面提示卡；已讀依帳號 id 與預計聚會 id 記在瀏覽器；只有 VIP／管理者看得到。
  - **想玩提示**：只給管理者、只是參考；選人與選遊戲雙向對照；「已選玩家中有 N 人」與「社群有 N 人」兩種文字要分開；不自動選人、不當排行；只統計 VIP 與管理者；`privacy.html` 要同步（已補）。

- **2026-10-31 使用者對三種聚會的定義（不要搞混，也不要照別的 AI 的說法改名）**：**預計聚會**＝預告可能會開的局，讓使用者可以先去查看；**新增聚會**＝記錄誰實際到現場、並建立連結，被記錄到或收到連結的人填分數後得到點數；**近期聚會**＝記錄曾經開過的團有什麼（指定遊戲、開團確認），供管理者參考。使用者問過聚會設定要不要拆頁，**尚未決定**。
- **2026-10-31**：預計聚會要能看到「想玩的人」（只給管理者，使用者已執行對應 SQL，視為同意預設做法）；管理者也要能設暱稱（使用者發現問題，修法細節待看檔案）。
- **另一個 AI（使用者貼上的長篇建議）只當參考，沒有採用**：它建議的「遊戲資源」三分區、規則書 PDF 公開開啟、聚會管理／歷史聚會改名都沒經使用者決定，且 PDF 公開與既有決定衝突；使用者貼的 Earthborne Rangers 資源頁與儀表板截圖只是參考畫面。

## 7. 與使用者合作的規則（重要）

- 使用者是**程式初學者**，繁體中文；會照步驟執行，可一次給 4～8 步；回「好」＝完成（重要項目要再問）；在 claude.ai 免費額度下工作，**聊天室容易中斷**，接手時**先問實際狀態，不要假設上一則已完成**。**他常常 push 了卻沒回報測試結果，要主動問**。
- 影響資料、隱私的設計：先提方案並列「建議預設值」，等他回「照建議」再動工；一次一批。SQL 一次一段、貼在對話裡（他貼進 Supabase SQL Editor），要他貼回結果確認；**「No rows returned」可能是成功也可能是目標不存在，驗證查詢要設計成「存在時一定有列」**。
- 給法：明確檔案、`Ctrl + F` 位置（先用 `Select-String` 確認字串唯一）、完整程式碼；**量大就給整份檔案**；每批結尾給測試清單與 `git add` 指令；**標清楚指令貼哪裡**（PowerShell→VS Code 終端機；SQL→Supabase SQL Editor）。
- 你**碰不到**他的檔案（也無法替他 push）；要資訊就給指令請他貼結果。**他貼的檔案可能是舊版**；改 `App.tsx`、`MyList.tsx`、`LoyaltyCard.tsx` 等前先請他貼目前版本。樣式分散在 `src/styles/`，改外觀前先 `Select-String -Path src\styles\*.css -Pattern "\.類別名"`。
- 改完 `npm.cmd run build` 並實測；不要破壞 106 款資料；**不要揭露「綜合分數排名」計算方式**；**不要叫他貼密碼、Secret／service_role key**。
- push 前 `git status`，**逐檔 `git add`，不要 `git add .`**；用命令列 commit，不要在 TortoiseGit 用 Amend。不要 add：`新增 文字文件.txt`、`trash-step/`、`App.css.bak`、其他 `.zip`、`boardgames.csv`（顯示 deleted 時 `git restore boardgames.csv`）、`client_secret_*.json`；三份 .md 只在使用者要求時才 commit。
- 他一次傳多張截圖時，整理成一批修改；不要把 CSS 交給別的工具壓縮；他會貼別的 AI（ChatGPT）的建議，含假資料示意圖，要分辨已查證與示意，不要照單全收（例如它建議首頁放最新留言與近期聚會預覽卡，使用者先前決定首頁不放最新留言）。
- 終端機中文亂碼只是顯示問題；`git diff` 出現 `(END)` 按 `q`；LF/CRLF 警告可忽略。
- **AI 在 claude.ai 聊天室沒有他的專案、也不能執行 `npm run build`**，給他的程式要提醒他自己 build 與實測；改資料庫函式前先請他匯出現有定義（`pg_get_functiondef`），一次一段 SQL；他貼的指令結果要先看再給下一步。**函式內 `return query` 的型別不符要到執行時才報錯**，建好函式後要請他實測。
- **交付方式（使用者 2026-10-30 明確要求）**：他不想一直複製貼上。**小檔案（`.md`、`.html`、`.css`、小型元件與 hook）一律由 AI 直接生成完成的檔案、並呼叫 `SendUserFile` 交給他覆蓋**（曾寫好卻忘了分享）；大檔案（`App.tsx`、`MyList.tsx`、`LoyaltyAdmin.tsx`）才指示局部修改，給唯一的 `Ctrl + F` 字串與要貼的完整程式；他貼來整份大檔時可回傳整份覆蓋版（`MyGatherings.tsx` 就是這樣）。AI 碰不到他的電腦，push 指令要他自己貼；他貼來的 `git status`／`git log` 要看清楚是 add 前還是 push 後（曾把 add 前的畫面當成已 push，必須用 `git log --oneline -3` 確認 origin/master）。他上傳的檔案可能是別個聊天室生成、但沒存進專案的版本，**不要假設專案裡已是新版，用 `Select-String` 確認**。
- **2026-10-30 晚補充**：大檔案（含 1531 行的 `LoyaltyAdmin.tsx`）也用 Python 腳本整份覆蓋：每個錨點字串先斷言只出現一次、保留 CRLF、輸出整份；`tsc --noEmit` 在沒有專案相依套件時只能查語法與未定義名稱，**型別與 build 仍要使用者自己跑 `npm.cmd run build`**。容器偶爾被限流（rate limit），這時**如實告訴使用者、稍後重試，不要憑記憶寫檔**；寫檔前先讀專案或上傳的現有版本。使用者的免費訊息額度會在聊天中途用完。
- **2026-10-31 補充**：整份覆蓋交付仍是慣例（`MyNotes.tsx`、`MyList.tsx`、`ClubBoard.tsx`、`LoyaltyAdmin.tsx` 都是），每次給 `git add` 逐檔指令與手機實測清單；使用者 push 後會貼 `git log`，要看最上面有 `(HEAD -> master, origin/master)`。他不一定回報實測結果，**下一批開工前要主動問**。他傳來的 ChatGPT 示意圖（我的遊玩紀錄、聚會心得等）是假資料，只參考版面。AI 這邊沒有他的專案，TypeScript 型別與 build 一律請他自己跑 `npm.cmd run build`。

## 8. 開場前先確認

1. 使用者在哪台電腦；`git pull`、`git status`、`git log --oneline -8`。
2. 讀完三份文件，確認第 5 節實際狀態，不要假設。
3. 新資料表寫入政策一律 `auth.uid()` 等於本人或 `is_admin()`；新表要 `revoke all ... from anon, authenticated`（或至少 `revoke truncate, references, trigger ... from authenticated`）並確認 `anon` 無權限。
4. 問使用者「上次產生文件後 push 了幾次」，核對 `生成後.md` 計數；確認這三份 .md 是否已 commit／push。

## 9. 文件維護規則（使用者 2026-10-28 提出）

- `QUICKSTART.md`＋`PROJECT_CONTEXT.md` 是完整版；`生成後.md` 是之後修改的輕量暫存，並記計數。
- AI 只能在對話中、使用者回報 push 成功時處理：每次 push → `生成後.md` 的 push 次數 +1；滿 2 → 更新 `生成後.md`（次數歸零、更新次數 +1）；更新次數滿 3 → 重新產生兩份主文件並重置 `生成後.md`；使用者說「更新文件」可提前；換聊天室先問「上次產生後 push 了幾次」。三份 .md 只在使用者要求時 commit；重新產生那次 push 與只更新 `生成後.md` 的 push 都不計入。
- **計數教訓（2026-10-30）**：更新 `生成後.md` 的那一刻 push 次數就歸零，之後第一次 push 是 1，不要多算（曾把第 1 次誤報成第 2 次）。
- 2026-10-30 下午：使用者 push `37bc61c`（第 2 次），`生成後.md` 更新次數滿 3，已重新產生兩份主文件（併入第十三～十七批），`生成後.md` 重置、兩個計數歸零；使用者需 commit／push 這三份 .md，**該次 push 不計入次數**。
- 2026-10-31：使用者 push `0fc42d5`、`2e3a06e`（第 1、2 次，上一輪更新 `生成後.md` 後的計數），`生成後.md` 更新次數滿 3，已重新產生兩份主文件（併入第十八～二十批），`生成後.md` 重置、兩個計數歸零；使用者需 commit／push 這三份 .md，**該次 push 不計入次數**。
- 2026-10-31（晚）：使用者說上一個聊天室生成 `QUICKSTART.md` 到一半中斷、沒有產出檔案，**不要假設別處有新版**；使用者要求提前重新產生三份 .md（視同「更新文件」）。已併入舊版 `生成後.md` 全部內容與當天聊天室資訊，`生成後.md` 重置、兩個計數歸零；使用者需 commit／push 這三份 .md，**該次 push 不計入次數**。`79281a2`、`5401962` 兩次 push 已併入主文件，不再計數。
- 2026-10-31（深夜）：使用者 push `59c0526`、`d2b2e26`、`d7e7fb9`（上一輪更新 `生成後.md` 後共 3 次，`生成後.md` 更新次數滿 3），使用者說「更新文件」，已重新產生三份 .md（併入聚會設定第一批、管理者暱稱、標題顏色、我的心得、新增聚會流程）；`生成後.md` 重置、兩個計數歸零；使用者需 commit／push 這三份 .md，**該次 push 不計入次數**。
- 2026-10-31（深夜）：使用者在額度快用完時說「可以先更新這三份 .md」，已重新產生（以增補方式併入 `生成後.md` 全部內容與本輪對話）；`生成後.md` 重置、兩個計數歸零；使用者需 commit／push 這三份 .md，**該次 push 不計入次數**。這輪已 push 的 `0871d43`、`20034c8`、`e12d87b`、`5181822` 都已併入，不再計數。
- 2026-10-31（深夜後）：使用者 push `8f8d2c1`（第 1 次）、`a81ca91`（第 2 次），`生成後.md` 更新次數本已為 3，依規則重新產生三份 .md（併入排行榜、人數重讀、底部導覽 touch-action、登入短暫消失修復）；`生成後.md` 重置、兩個計數歸零；使用者需 commit／push 這三份 .md，**該次 push 不計入次數**。上一輪的 `97047fc`、`87dea10`、`d8295fa`、`9cf727c`、`417ffaf`、`f56b0a6` 與 `cbbee7b` 都已併入，不再計數。
- 2026-10-31（深夜後二）：使用者 push `95184bb`、`4025cd8`（`614bbf1` 是只更新 `生成後.md`，不計入），`生成後.md` 更新次數已滿 3，使用者說「更新這三份 .md」，已重新產生（併入想玩名單、`PlaySessions` 確認視窗、留言板置中、清單式留言、開視窗重讀人數卡頓與 `adjust` 修法）；`生成後.md` 重置、兩個計數歸零；使用者需 commit／push 這三份 .md，該次 push 不計入次數。上一輪的 `a9b7748`、`8da7b09`、`6f4f471`、`b926b39`、`741995e`、`6259cd0`、`f8e2d5d`、`3c4cd7f`、`614bbf1` 都已併入，不再計數。
