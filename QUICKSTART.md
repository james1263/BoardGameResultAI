# 桌遊規則助手 — 懶人包（給下一個 AI）

> 3 分鐘版。細節請看 `PROJECT_CONTEXT.md`。最後更新：2026-10-21（傍晚）

## 這是什麼

使用者在做一個**公開給朋友瀏覽的桌遊收藏網站**「桌遊規則助手」，目前有 107 款桌遊，能搜尋、篩選、排序、看封面和評分。最終目標是讓大家能問 **AI 規則助手**，AI 要根據使用者上傳的規則書 PDF 回答，並標明出處與頁碼。

- 線上網址：https://board-game-result-ai.vercel.app/（GitHub `master` 分支 → Vercel 自動部署）
- 技術：React + TypeScript + Vite + **Supabase（資料庫與登入，免費方案，首爾）**
- 本機路徑：`D:\BoardGameResultAI`（Windows、PowerShell、用 `npm.cmd`）
- **桌遊資料現在存在 Supabase 的 `board_games` 資料表**；網站讀取失敗時才退回本機 `boardGames.generated.ts`。
- 目前的手動更新流程：Notion → `boardgames.csv` → `python generate_boardgames.py` → `python make_supabase_import.py` → 把 `supabase_import.sql` 貼進 Supabase SQL Editor 執行（可重複執行，等於更新）。

## 使用者是誰、怎麼合作

- **程式初學者**，繁體中文。**一次只給一個步驟**。
- 給法：明確檔案、`Ctrl + F` 搜尋位置、完整程式碼（改函式就整個換掉）、測試步驟。
- 你**碰不到**他的檔案，也**收不到** CSV。要資訊就給 PowerShell／Python 指令，請他貼結果或截圖。
- **要改 `App.tsx` 前，先請他貼目前版本**（結構已改過：`App` 負責讀資料，`Library` 是原本的主畫面）。
- 改完 `npm.cmd run build` 並實測。不要破壞 107 款資料和現有功能。不要揭露「綜合分數排名」的計算方式。
- **不要叫他貼密碼或 Secret／service_role key。**

## 已完成

搜尋、篩選抽屜、類型篩選（3 大項 + 可搜尋的更多類型，多選為 AND）、缺資料提示、排序與重設排序、封面圖（`public/covers/{coverSlug}.webp|jpg|png`，沒圖顯示 🎲）、精簡詳細視窗（使用者不要再加其他資訊）、**檢視模式切換（清單／一排 4／一排 9，存 localStorage）**、**資料搬到 Supabase 並已上線**、**單一管理者帳號 + 寫入權限（RLS）**。

## 進行中

**管理者登入畫面**：`src/AdminPanel.tsx`（頁尾「管理者登入」）已寫好、build 成功，**但還沒實測、還沒 push**。使用者忘記密碼，正在到 Supabase（Authentication → Users）刪除帳號重建（勾 Auto Confirm），或用 Send password recovery。請先確認他能登入。

## 下一步（照順序）

1. 登入實測成功 → push（**不要 `git add .`**，只加 `.gitignore`、`package*.json`、`src`、`public`、兩份交接文件）。
2. **網站上傳 CSV**（登入後才出現）：瀏覽器解析 CSV（移植 `generate_boardgames.py` 的規則）→ 預覽 → 用 `bgg_name` 做 `upsert`。**不能動封面圖。** 先問使用者：CSV 沒有但資料庫有的遊戲要不要刪（建議預設不刪）。
3. 規則書連結（`link_rulebook_zh/en`、`link_faq` 目前全空，需決定檔案放哪，可能用 Supabase Storage）。
4. 個人收藏（想玩、已玩、備註，先存 localStorage）。
5. 新到貨桌遊標示（需 Notion／CSV 新增「入手日期」欄位）。
6. 之後：**AI 規則助手（最重要）** → 討論／揪團／行事曆 → 帳號與遊玩紀錄。

## 關鍵決定與地雷

- **公開瀏覽、只有使用者能編輯；訪客可以問 AI 但不能改設定。** AI 開放給訪客會花錢，之後要做每日提問次數限制，AI 金鑰只能放後端。
- Supabase：Project URL 是**根網址** `https://hgeuockbjrzayfdylavq.supabase.co`（不加 `/rest/v1/`）。只有 Publishable key 可放前端。已**關閉開放註冊**。
- ⚠️ 寫入規則給所有 `authenticated` 使用者；**日後開放朋友登入前，必須改成只認管理者**，否則朋友能改桌遊資料。
- Vercel 的 `VITE_SUPABASE_URL`、`VITE_SUPABASE_PUBLISHABLE_KEY` 必須存成 **Config**（不是 Secret），名稱一個字母都不能錯；錯了網站會悄悄退回本機資料。
- Supabase 免費專案閒置一週會暫停（資料不會消失，需到後台恢復）。
- 資料庫主鍵是 `bgg_name`；前端 `id` 只是流水號，**絕對不能用來對應圖片或使用者資料**。
- 缺值保留 `null`，顯示「未提供」，不要編造。
- 上線網站只看得到有 push 的檔案；改資料庫內容則不需要 push。
- 瀏覽器 Console 裡大量封面 404 是正常的（元件依序試 webp／jpg／png）。
- 使用者想讓「常玩遊戲排名」之後由遊玩紀錄計算，尚未決定。

## 開場前先確認

1. 使用者能否登入管理者帳號、頁尾登入畫面是否正常。
2. 請他貼出目前的 `src/App.tsx`。
3. 清單檢視與 9 個一排的外觀是否滿意（清單檢視還沒看到截圖）。
4. 確認是否已 push，Vercel 網站是否正常。
