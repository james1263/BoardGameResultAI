# 桌遊規則助手 — 懶人包（給下一個 AI）

> 3 分鐘版。細節請看 `PROJECT_CONTEXT.md`。最後更新：2026-10-22

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
- **封面改存 Supabase Storage**：已建立公開 bucket `covers` 與 4 條 storage 權限（讀取 anon+authenticated；新增／更新／刪除只給 authenticated）。`CoverImage` 讀取順序：Storage `{coverSlug}.webp` → 舊的 `public/covers/` webp／jpg／png → 🎲。
- **詳細視窗「上傳／更換封面」**（登入後才出現）：`src/lib/uploadCover.ts` 在瀏覽器把圖縮成寬度最多 600px、轉 webp 後上傳；`src/lib/useSession.ts` 提供登入狀態。**已實測成功。**

## 進行中

目前沒有進行中的項目。分支 `wip-cover-upload` 已合併進 `master` 並上線，使用者已測試線上版正常。之後直接在 `master` 開發，該分支可忽略。

## 下一步（照順序）

1. **規則書連結**（`link_rulebook_zh/en`、`link_faq` 目前全空）：先和使用者決定檔案放哪裡（Supabase Storage 上傳，或貼外部連結如 Google Drive）、中英文規則書與 FAQ 是否各一份、是否網站上直接上傳。與日後 AI 規則助手相關，PDF 日後需要切段並保留頁碼。
2. 個人收藏（想玩、已玩、備註，先存 localStorage）。
3. 新到貨桌遊標示（需 Notion／CSV 新增「入手日期」欄位）。
4. 之後：**AI 規則助手（最重要）** → 討論／揪團／行事曆 → 帳號與遊玩紀錄。

## CSV 匯入的行為（重要，已改版）

- **CSV 沒有、資料庫有的遊戲會被刪除**（依使用者要求；原本預設不刪，已改）。連帶刪除 Storage 的 `{cover_slug}.webp`（若該封面代號仍被本次 CSV 的遊戲使用則保留）。
- 保護機制：預覽以紅字列出名單；確認視窗再列一次；**一次刪除超過 5 款時還要輸入「刪除」**。
- 順序：先 upsert → 上傳封面 → 再刪除；upsert 失敗時不會刪任何東西。
- 復原：遊戲資料可重新匯入原 CSV 補回；**雲端封面刪除後無法復原**，需重新上傳。舊的 `public/covers/` 圖檔在 Git 裡，網站刪不掉（無害，遊戲被刪就不會顯示）。
- 地雷：在 Notion 改 `bggName` → 舊的那筆被刪（含封面）、新的當新遊戲（封面要重傳）；新舊 `cover_slug` 相同會撞唯一限制導致匯入失敗；**拿到不完整的 CSV 會刪掉其他遊戲**，匯入前務必看紅字名單。

## 關鍵決定與地雷

- **公開瀏覽、只有使用者能編輯；訪客可以問 AI 但不能改設定。** AI 開放給訪客會花錢，之後要做每日提問次數限制，AI 金鑰只能放後端。
- Supabase：Project URL 是**根網址** `https://hgeuockbjrzayfdylavq.supabase.co`（不加 `/rest/v1/`）。只有 Publishable key 可放前端。已**關閉開放註冊**。
- ⚠️ 資料表與 Storage 的寫入規則都給所有 `authenticated` 使用者；**日後開放朋友登入前，兩邊都必須改成只認管理者**，否則朋友能改桌遊資料和封面。
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
2. 若要改 `src/App.tsx` 或 `src/AdminPanel.tsx`，請他貼出目前版本（兩份都已大改）。
3. 規則書連結要放哪裡、是否已有決定。
4. 清單檢視與 9 個一排的外觀是否滿意（清單檢視還沒看到截圖）。
