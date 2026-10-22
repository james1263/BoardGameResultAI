# 桌遊規則助手 — 懶人包（給下一個 AI）

> 3 分鐘版。細節請看 `PROJECT_CONTEXT.md`。最後更新：2026-10-22（晚）

## 這是什麼

使用者在做一個**公開給朋友瀏覽的桌遊收藏網站**「桌遊規則助手」，目前有 107 款桌遊，能搜尋、篩選、排序、看封面和評分。最終目標是讓大家能問 **AI 規則助手**，AI 要根據使用者上傳的規則書 PDF 回答，並標明出處與頁碼。

- 線上網址：https://board-game-result-ai.vercel.app/（GitHub `master` 分支 → Vercel 自動部署）
- 技術：React + TypeScript + Vite + **Supabase（資料庫、登入、檔案儲存，免費方案，首爾）**
- 本機路徑：`D:\BoardGameResultAI`（Windows、PowerShell、用 `npm.cmd`）。**使用者會在多台電腦作業（外面的電腦、家裡的電腦），路徑可能不同，見 `PROJECT_CONTEXT.md` 第 10 節。**
- **桌遊資料存在 Supabase 的 `board_games` 資料表**；網站讀取失敗時才退回本機 `boardGames.generated.ts`。
- **資料更新流程（已改為網站操作）**：Notion 匯出 CSV → 網站頁尾登入管理者 →「匯入 CSV」→ 預覽 →「確認匯入」。舊的 Python 流程（`generate_boardgames.py`、`make_supabase_import.py`）已不再需要，只留作備份與參考。

## 使用者是誰、怎麼合作

- **程式初學者**，繁體中文。**一次只給一個步驟**。
- 給法：明確檔案、`Ctrl + F` 搜尋位置、完整程式碼（改函式就整個換掉）、測試步驟。
- 你**碰不到**他的檔案，也**收不到** CSV。要資訊就給 PowerShell／Python 指令，請他貼結果或截圖。
- **要改 `App.tsx` 前，先請他貼目前版本**（結構：`App` 負責讀資料，`Library` 是主畫面）。
- 改完 `npm.cmd run build` 並實測。不要破壞 107 款資料和現有功能。不要揭露「綜合分數排名」的計算方式。
- **不要叫他貼密碼或 Secret／service_role key。**

## 已完成

- 搜尋、篩選抽屜、類型篩選、缺資料提示、排序、檢視模式切換（清單／4／9）、精簡詳細視窗（使用者不要再加其他資訊）。
- 資料搬到 Supabase 並已上線；單一管理者帳號 + 寫入權限（RLS）。
- **管理者登入**（頁尾）：已實測成功並 push。
- **網站匯入 CSV**（已實測、已上線）：`src/lib/parseCsv.ts`（移植自 Python 規則）+ `AdminPanel.tsx`。預覽顯示新增／更新筆數、新增的遊戲名單（10 款以內）、**CSV 沒有的遊戲名單（紅字）**；「確認匯入」會以 `bgg_name` upsert、上傳附上的封面，並**刪除 CSV 裡沒有的遊戲與其雲端封面**（見下方「CSV 匯入的行為」）。已移除「前 3 款檢查」。
- **匯入時附封面圖**（已實測、已上線）：預覽可多選圖片，檔名**不必和 `bggName` 完全相同**，英文或中文名都可以。比對順序：完全相同 → 去掉括號後相同／中文名相同 → 名稱開頭相同；同時符合多款則略過並提醒。預覽會列出「檔名 → 遊戲」，對應不到的圖片只留在瀏覽器、**不會上傳、不佔雲端空間**。
- **規則書／FAQ 連結**（已實測、已上線）：新資料表 `game_documents`（一款遊戲可有多份文件：類型 規則書／FAQ／勘誤／其他、語言 中文／英文／其他、標題、外部網址）。詳細視窗由 `src/GameDocuments.tsx` 顯示，登入後可新增／刪除連結（網址須 http(s) 開頭）。目前**只做外部連結**；上傳 PDF 與 AI 索引欄位（`storage_path`、`ai_indexed`）已預留。舊的 `link_rulebook_zh/en`、`link_faq` 欄位保留但**不再使用**。
- **封面改存 Supabase Storage**：已建立公開 bucket `covers` 與 4 條 storage 權限（讀取 anon+authenticated；新增／更新／刪除只給 authenticated）。`CoverImage` 讀取順序：Storage `{coverSlug}.webp` → 舊的 `public/covers/` webp／jpg／png → 🎲。
- **詳細視窗「上傳／更換封面」**（登入後才出現）：`src/lib/uploadCover.ts` 在瀏覽器把圖縮成寬度最多 600px、轉 webp 後上傳；`src/lib/useSession.ts` 提供登入狀態。**已實測成功。**

## 進行中

**規劃階段（尚未動工）**：使用者想做社群功能（想玩／已玩、公開評分、每月想玩排行榜、集點卡）。方向已與使用者確認，見下方「下一步」。**使用者的 AI 額度快用完，這份文件就是為了讓下一個 AI 直接接續。**

**⚠️ 本機可能有未 commit 的試作（不要 push）**：`src/lib/usePersonalCollection.ts`（localStorage 個人收藏工具，以 `bggName` 為鍵，存想玩／已玩／備註），以及 `App.tsx`、`App.css` 裡可能已加入的「MY NOTES」區塊（`personal-box`、想玩／已玩按鈕、備註欄）。這是早期試作，**Phase 3 再整合**；使用者已決定備註先不做。請開場用 `git status` 確認這些檔案的狀態，**不要 `git add` 它們**，除非使用者決定要保留。另請確認上一輪的兩份交接文件是否已 push。

## 下一步（照順序）

**社群功能計畫（使用者已確認方向，2026-10-22）— 依序進行，一次一階段：**

1. **Phase 1｜管理權限與資料安全（最優先，尚未開始）**：把 `board_games`、`game_documents` 與 Storage `covers` 的新增／修改／刪除權限，從「所有 `authenticated`」改成「只有管理者」；網站的管理功能（頁尾「管理者模式」、匯入 CSV、上傳封面、新增／刪除規則書連結）也只對管理者顯示。**開放任何人登入之前必須先完成。**
2. **Phase 2｜Email 免密碼登入**（Supabase Magic Link）、玩家暱稱與公開玩家 ID；管理者與一般玩家分開判斷。
3. **Phase 3｜訪客紀錄與雲端同步**：訪客的想玩、已玩、集點存 `localStorage`；首次登入時合併到雲端（避免重複，合併規則要明確）。
4. **Phase 4｜公開評分**：六項評分＋整體 1～10 分，每位登入玩家每款遊戲一筆（可修改），社群平均與評分人數公開。
5. **Phase 5｜每月想玩排行榜**：每位登入玩家每款每月一票、有每月票數上限與資料庫唯一限制、各月份榜單永久保留可回顧。
6. **Phase 6｜集點卡與成就**：依遊玩紀錄累積，登入玩家可跨裝置保留。

其餘（上傳規則書 PDF、新到貨標示、**AI 規則助手（仍是最重要的長期目標）**、揪團／行事曆）排在這之後，順序請與使用者確認。

**接續時請從 Phase 1 開始，第一件事：**
1. 請使用者到 Supabase 後台 Authentication → Users，複製自己管理者帳號的 **User UID**（不是密碼，可貼出）。
2. 建議做法（接手 AI 請對照 Supabase 當下文件確認後再給使用者）：建立 `public.admin_users(user_id uuid primary key references auth.users(id))` 並放入該 UID；建立 `public.is_admin()` 函式（`security definer`，設好 `search_path`）；把 `board_games`、`game_documents` 的 INSERT／UPDATE／DELETE 政策與 `storage.objects`（bucket `covers`）的 INSERT／UPDATE／DELETE 政策改成 `using / with check (public.is_admin())`；讀取政策（`anon`、`authenticated`）維持不變。SQL 一次一段貼給使用者，先給「查看現有政策」的查詢，再改。
3. 前端：`AdminPanel.tsx`、`App.tsx`（`useSession`、上傳封面）、`GameDocuments.tsx`（`isAdmin`）目前都只判斷「有沒有登入」，要改成「是不是管理者」（例如查詢自己是否在 `admin_users`，政策讓使用者只能讀自己的那一列）。**前端隱藏不是安全防護，真正的保護是資料庫政策。**
4. 測試：管理者仍能匯入 CSV、上傳封面、新增／刪除規則書連結；用沒登入的狀態確認無法寫入。**Phase 1 完成前不要開放註冊或任何人登入。**

## CSV 匯入的行為（重要，已改版）

- **CSV 沒有、資料庫有的遊戲會被刪除**（依使用者要求；原本預設不刪，已改）。連帶刪除 Storage 的 `{cover_slug}.webp`（若該封面代號仍被本次 CSV 的遊戲使用則保留）。
- 保護機制：預覽以紅字列出名單；確認視窗再列一次；**一次刪除超過 5 款時還要輸入「刪除」**。
- 順序：先 upsert → 上傳封面 → 再刪除；upsert 失敗時不會刪任何東西。
- 復原：遊戲資料可重新匯入原 CSV 補回；**雲端封面刪除後無法復原**，需重新上傳。舊的 `public/covers/` 圖檔在 Git 裡，網站刪不掉（無害，遊戲被刪就不會顯示）。
- 地雷：在 Notion 改 `bggName` → 舊的那筆被刪（含封面）、新的當新遊戲（封面要重傳）；新舊 `cover_slug` 相同會撞唯一限制導致匯入失敗；**拿到不完整的 CSV 會刪掉其他遊戲**，匯入前務必看紅字名單。

## 關鍵決定與地雷

- **公開瀏覽、只有使用者能編輯；訪客可以問 AI 但不能改設定。** AI 開放給訪客會花錢，之後要做每日提問次數限制，AI 金鑰只能放後端。
- Supabase：Project URL 是**根網址** `https://hgeuockbjrzayfdylavq.supabase.co`（不加 `/rest/v1/`）。只有 Publishable key 可放前端。已**關閉開放註冊**。
- ⚠️ `board_games`、`game_documents` 與 Storage 的寫入規則都給所有 `authenticated` 使用者；**日後開放朋友登入前，三邊都必須改成只認管理者**，否則朋友能改桌遊資料、規則書連結和封面。
- **已決定不採用匿名帳號**：依 Supabase 的設計，匿名使用者在資料庫裡的角色也是 `authenticated`，會直接套用現在「所有 authenticated 可寫入」的規則；而且匿名帳號清除瀏覽資料就能再建一個，無法做到「一人一帳」。改採「訪客存 `localStorage`＋登入玩家（Email 免密碼連結）才能評分／投票」。
- **社群設計決定（使用者）**：不做留言板（之後可加選填短評）；評分一律公開、不放進玩家設定；評分項目沿用使用者的用語：喜歡度、玩家影響性（**不要改名成「玩家互動」**，定義是「在意別人操作＋下一步被限制」）、溝通性、變化性、獨特性、適合留下來程度（1～5 分），另有整體 1～10 分（兩種量表請與使用者再確認）。複雜度與快速性視為遊戲屬性，不列入評分。社群平均與使用者自己的 Emoji 評價並排顯示，但**不要與「綜合分數排名」混在一起或揭露其算法**。想玩投票是獨立功能，與個人「想玩清單」分開；「已玩」只是有／沒有，常玩遊戲排名需要的是遊玩次數，另外設計。
- 登入的好處＝評分與投票計入社群排行榜、可換裝置找回紀錄；訪客仍可免註冊瀏覽並在本機記錄。
- Vercel 的 `VITE_SUPABASE_URL`、`VITE_SUPABASE_PUBLISHABLE_KEY` 必須存成 **Config**（不是 Secret），名稱一個字母都不能錯；錯了網站會悄悄退回本機資料。本機的 `.env.local` 不在 Git 裡，換電腦要重建。
- Supabase 免費專案閒置一週會暫停（資料不會消失，需到後台恢復）；檔案儲存免費額度約 1 GB，封面已壓縮，之後放規則書 PDF 要留意。
- 資料庫主鍵是 `bgg_name`；前端 `id` 只是流水號，**絕對不能用來對應圖片或使用者資料**。
- 缺值保留 `null`，顯示「未提供」，不要編造。
- 上線網站只看得到有 push 的檔案；改資料庫內容與上傳封面（Storage）**不需要 push**。舊的 `public/covers/` 108 張圖不用搬，繼續當備援。
- 瀏覽器 Console 裡大量封面 404 是正常的（元件依序試 Storage、webp、jpg、png）。
- 匯入 CSV 或上傳封面後，要重新整理網頁才會看到最新資料（上傳封面當下會自動換圖）。
- `BoardGame` 型別仍由 `src/data/boardGames.generated.ts` 匯出，**不要刪這個檔案**。
- 使用者想讓「常玩遊戲排名」之後由遊玩紀錄計算，尚未決定。

## 開場前先確認

1. 使用者現在在哪台電腦；目前分支應為 `master`，先 `git pull`。多台電腦作業請看 `PROJECT_CONTEXT.md` 第 10 節。
2. `git status`：確認上一輪兩份交接文件是否已 push，以及 `usePersonalCollection.ts` 等試作檔案的狀態（不要 push）。
3. 向使用者要管理者的 **User UID**，開始 Phase 1。
4. 若要改 `src/App.tsx`、`src/AdminPanel.tsx`、`src/GameDocuments.tsx`，請他貼出目前版本。
5. 評分量表（六項 1～5、整體 1～10）與每月想玩票數上限（建議每人每月 5 票，尚未定）請在做到對應階段時向使用者確認。
