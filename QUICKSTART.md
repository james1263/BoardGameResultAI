# 桌遊規則助手 — 懶人包（給下一個 AI）

> 最後更新：2026-10-29 13:25（已併入 `生成後.md` 的第一～五批：我的場次、補記遊玩、場次心得、返回機制堆疊化、點遊戲後返回修正；`生成後.md` 已重置）。
> **分工**：本檔＝現況、待辦、合作規則；`PROJECT_CONTEXT.md`＝架構、資料庫、功能規則、規則助手設計；`生成後.md`＝這兩份之後的修改紀錄與文件維護計數（**開工前三份都要讀，衝突時以 `生成後.md` 為準**）。
> **文件維護規則**見第 9 節。

## 1. 這是什麼

- 使用者在做**公開給朋友瀏覽的桌遊收藏網站「桌遊規則助手」**，目前 **106 款**。長期目標：VIP 能查規則書（RAG：只根據檢索到的片段、附頁碼）。
- 網址 https://board-game-result-ai.vercel.app/（GitHub `master` → Vercel 自動部署）。React + TypeScript + Vite + Supabase（免費方案，首爾）。
- 本機 `D:\BoardGameResultAI`（Windows、PowerShell、`npm.cmd`）；規則書 PDF 放 `D:\rulebooks\`（專案外）。多台電腦見 PROJECT_CONTEXT 第 9 節。

## 2. 目前狀態（2026-10-29）

- **git**：分支 `master`。使用者有兩台電腦（路徑同為 `D:\BoardGameResultAI`），**開工先 `git pull`**、`git log --oneline -5`。PowerShell 指令貼 VS Code 終端機（曾誤貼進 Supabase SQL Editor）。`Unlink of file '.git/objects/pack/…idx' failed (y/n)` 回 `n` 即可。
- **規則助手（第七～十六批，已上線）**：檢索 SQL、獨立頁面 `RulebookPage.tsx`＋`RulebookAssistant.tsx`、導覽第 5 顆「✦ 規則助手」（僅 VIP／管理者）、`zhEnGlossary.ts`；管理中心 4 顆分頁（成員、聚會集點、規則書、資料匯入）；翻譯與複製按鈕；規則文件簡化（類型由檔名／網址判斷，`lib/docLabels.ts`）；PDF 大小與錯誤提醒；「📖 這款的規則連結與影片」快捷（規則助手保持開著，詳細視窗疊上面）。
- **篩選記憶（第十一批）**：`lib/filterStorage.ts`，鍵 `boardgame-filters`，搜尋文字不存。
- **我的桌遊整合（第十四批）**：詳細視窗「我的桌遊」只留累計次數、「記錄一次遊玩」、最近紀錄、「我的整體心得」；「我的俱樂部」已玩清單每列 − ＋ 改 `play_count`。
- **贈送免費券、新增聚會排版、沒玩過不顯示管理者評分、新遊戲置頂 15 天**（`App.tsx` `isPinnedGame`）：均已 push。
- **我的場次（2026-10-29 第一、二批）**：`MyGatherings.tsx`（清單依月份摺疊、場次詳情顯示當天指定遊戲與出席者；隱藏暱稱者顯示「匿名玩家」）；函式 `get_my_gatherings()`、`get_gathering_detail()`；**補記遊玩** `AddPlayLog.tsx`（沿用 `game_play_sessions`）。
- **場次心得（第三批）**：資料表 `gathering_notes`＋四個函式（見 PROJECT_CONTEXT 第 2 節）；`GatheringNoteDialog.tsx`（私人／公開兩欄、複製鈕）；清單有「待填 N/M」。**手機實測、`gathering_notes` 直接權限檢查結果都還沒回報。**
- **返回機制（第四批）**：`lib/useBackClose.ts` 已改成**堆疊式**（每層視窗一筆歷史，返回只關最上層，✕ 自己收回歷史）；我的統計、我的場次、補記遊玩的 header 只留 ✕（回上一層）。
- **點遊戲後返回修正（第五批）**：`App.tsx` 我的桌遊與排行榜的 `onOpenGame` 不再 `setActivePage(null)`（返回才會回原頁）；`.modal-backdrop` z-index 在 `vip.css` 為 **1220**（疊在我的桌遊抽屜 1200 之上）。**第四、五批使用者說 push 後再測，尚未回報。**
- **空間用量（2026-10-28）**：`rulebooks` 13 份 116.8 MB、`covers` 98 張 6.2 MB、資料庫 14 MB；免費額度（Storage 1 GB、Database 500 MB）**未自行查證**，以後台 Usage 為準。

## 3. 使用者需求狀態

N1～N6、我的桌遊整合、贈送免費券、新遊戲置頂、我的場次、補記遊玩、場次心得（第一版）、返回機制已完成。**進行中：2026-10-29 12:05 回「照建議」的介面調整（第 4 節 2）。**

## 4. 待辦順序（一次一批，上一批實測完才進下一批）

0. **先問**：使用者在哪台電腦、`git pull`／`git status`；第四、五批返回測試結果（清單見第 5 節）；第三批實測；`gathering_notes` 權限檢查結果（SQL：`select grantee, privilege_type from information_schema.role_table_grants where table_schema='public' and table_name='gathering_notes' and grantee in ('anon','authenticated');` 應「No rows returned」）；`get_rating_summaries()` 是否排除沒玩過遊戲的五項；`loyalty_grants` 權限與計入方式。
1. **返回問題追蹤**：①底部五顆導覽按鈕有時要點 3 次才切換（原因未知；懷疑堆疊式 `useBackClose` 收回歷史最多等 0.8 秒、iPhone 事件較慢，**未驗證**；要問是改版後才有、哪幾顆、卡時前頁還開著或閃一下消失）；②規則助手點「規則連結與影片」後返回回主畫面（理論上頁面沒被關，原因未找到；要問返回後規則助手頁是整頁消失或只有詳細視窗消失）。
2. **介面調整（已「照建議」，依序一次一批）**：
   - **第二批 我的俱樂部**：「想玩」「已玩」各縮成一列入口（「想玩 12 款 ›」），點進去才看清單，清單有搜尋＋排序（加入時間／名稱／遊玩次數／最近遊玩，無紀錄者處理一致）、已玩保留 − ＋；集點資訊改成暱稱旁小字「累計 N 點・免費券 N 張」（僅 VIP 非管理者），拿掉集點區塊；**補記遊玩要排除垃圾桶遊戲**（選單與儲存前都擋；使用者回報目前選得到已刪除的遊戲）。
   - **第三批 心得功能整合**：心得頁重做（頂部固定 ✕、遊戲封面用真實資料、日期與出席者縮小、多遊戲用封面小圖分頁、私人／公開兩分頁切換並在有字的分頁加小圓點、保留「複製到另一欄」、底部固定「儲存心得」、**不要取消鍵**）；切換遊戲或分頁不丟未存文字；沒改直接關、有改未存問「儲存後離開／捨棄變更／繼續編輯」、儲存失敗保留文字不關；場次詳情拿掉「✓ 已記錄」「我玩了這款」，改成心得頁選項「同時記一次遊玩（算進我的已玩次數）」預設不勾（重複儲存不重複 +1、取消勾選不刪既有紀錄）；**刪除心得**：已有心得時隨時有「刪除…」（刪私人／刪公開／全部刪除，要再確認，只刪有內容的類型，不必先清空文字，沿用 `save_gathering_note` 兩欄皆空＝刪除）；「待填 N/M」改灰色小字「未記錄心得 N/M」（N＝私人或公開任一欄有內容的遊戲數）；「代填」類用語改「記錄心得」。
   - **第四批 我的心得清單**：放「我的俱樂部」，入口「📝 我的心得」與「我的場次」並列；每列封面＋名稱＋心得前 50 字，點開看全文／編輯／刪除；刪光兩欄後從清單消失但不影響聚會、出席、遊玩次數；只刪一欄則保留顯示剩下那欄。
   - **之後**：自動跳窗（評分完成得點／自動用券後問「現在寫／稍後再寫」，不可阻擋評分或集點；**要改 `LoyaltyCard.tsx`、`CheckInDialog.tsx`，動工前請使用者重貼目前版本，我沒讀過 `LoyaltyCard.tsx`**）→ D 遊戲留言板（讀 `get_public_gathering_notes`，做「別處玩過也能留言」，管理者隱藏留言函式與畫面，完成後拿掉 `GatheringNoteDialog` 的「閱讀頁面還在準備中」）→ E 首頁「最新留言」＋「近期聚會」→ 導覽列改版最後。
3. **中英檢索測試集與命中率評估**：每款規則書各 5～8 題標頁碼；中文 PDF 擷取品質尚未測；中文檢索（`pgroonga`、`pg_trgm`、語意搜尋、翻譯 API 皆未查證）。
4. **規則資源管理美化／玩錯勘誤（尚未決定）**：需新資料表，先討論欄位與權限；規則 PDF 維持只給 AI 檢索、不公開。
5. 其餘：手機底部 5 顆若擠，「✦ 規則助手」縮成「規則」；「更新版本」按鈕；章節標題（`section_title` 空）；OCR（第一版不做）；管理者視窗統一風格；PWA（缺圖示）；VIP 朋友名單（`get_vip_friends` 已建、UI 未做）；推薦牆；站上拖曳調整排名＋匯出 CSV（PROJECT_CONTEXT 第 8 節）；VIP 鎖定 SQL（執行前先討論）；`CheckInDialog`、`VipJoinDialog` 接返回鍵。

## 5. 尚未驗證／小項（有機會就問）

- **第四、五批返回測試清單**：排行榜→點遊戲→返回（排行榜還在）；我的俱樂部已玩清單點遊戲→返回；我的場次→場次詳情→點指定遊戲→返回；規則助手→「📖 這款的規則連結與影片」→返回（搜尋結果還在）；以上用 ✕ 結果相同；詳細視窗開著點底部導覽會關掉並切頁；我的統計／場次／補記按 ✕ 回我的俱樂部；場次詳情→寫心得→返回只關心得視窗；主畫面按返回才離開網站；開了又 ✕ 關掉後按「前進」不冒出視窗；每層關閉後上一層搜尋、捲動、編輯狀態是否保留（未驗證）。
- 第三批：寫心得視窗與鍵盤、`gathering_notes` 是否有資料、複製鈕行為、「待填」僅最近 30 天；第一批隱私項（用有出席的一般帳號確認他人隱藏暱稱者顯示「匿名玩家」，管理者帳號測不出）；第二批月份摺疊、補記手機版面。
- 第十五批規則助手疊視窗層級、第十四批 − ＋ 手機好按度、第十一～十三批小項（登出後篩選記憶、iPhone 翻譯、非管理者看不到 PDF 區）、第七批手機實測剩餘（底部 5 顆是否擠、返回鍵、非 VIP 看不到規則助手）。
- `furuyoni` 規則書是日文，第一版不收（但已上傳過 `RisingSun_v1.2`，語言待確認）。
- 驗證社群平均是否含管理者那一票；「獨特性／快速性」是否改成「度」（使用者未回覆）。
- `to_regclass('public.gathering_plays')` 應為 null；`select bgg_name, cover_slug from public.board_games where cover_slug !~ '^[a-z0-9_-]+$';` 應 0 列。
- **已查證**：檢索只用 `to_tsvector('english', content)`、完全不看語言欄；中文 PDF 搜不到中文內文。刪帳號時 `admin_delete_member` 會刪 `auth.users`，`gathering_notes` 連動刪除，`privacy.html` 說法正確（`privacy.html` 已與 `5ff6479` 一起推上）。
- Console 一堆 `ERR_CONNECTION_REFUSED`、`Setting up fake worker`：先確認 `npm.cmd run dev` 有在跑。
- **查空間用量 SQL（Supabase SQL Editor，一次一段）**：①`select bucket_id, count(*) as 檔案數, round(sum((metadata->>'size')::bigint) / 1024.0 / 1024.0, 1) as mb from storage.objects group by bucket_id;` ②`select pg_size_pretty(pg_total_relation_size('public.rulebook_chunks'));` ③`select pg_size_pretty(pg_database_size(current_database()));`

## 6. 使用者的決定（不要推翻）

- **規則助手＝零生成式 AI API 費用**：只做「檢索＋複製提示詞給使用者自己的 AI」；只給 VIP／管理者；網站內容用「另存成 PDF 再上傳」；搜尋紀錄保留 7 天、台北時間 0 點重置額度（VIP 30 次、管理者不限）；不存問題內容；只有找到結果才扣次數；授權風險由使用者自行評估。
- **上傳的 PDF 只給 AI 檢索，不公開**；第一版不做 OCR；PDF 太大只提醒不阻擋。
- 站名保留「桌遊規則助手」；左右滑動切換分頁等頁面獨立後再做；Email 登入、現場報到碼先不做；「我的桌遊」不做擁有／收納／借出。遊戲簡介補寫晚點。
- 管理者 CSV 分數算進社群評分；卡片「綜合分數」＝700 − `score_rank`；評分用語用「度」（`parseCsv.ts` 的 CSV 欄名**絕對不能改**）。
- 規則書管理一律在管理中心；篩選記憶全存、只存該瀏覽器；詳細視窗「我的桌遊」無想玩／已玩按鈕與計數器，次數只在「我的俱樂部」已玩清單調整。
- **返回規則（2026-10-29 使用者明確要求）**：所有 ✕ 與手機內建返回（iPhone 右滑／Android 返回）都**只回上一層**，不要回主畫面（底部已有「桌遊收藏」）；有子畫面的視窗 header 只留 ✕。
- 場次相關決定：隱藏暱稱者顯示「匿名玩家」；場次遊戲＝當天指定遊戲；**出席不自動算玩過**；補記沿用 `game_play_sessions`，總次數＝`play_count`＋有日期紀錄筆數；留言板**自願公開**（私人／公開兩欄，中間「複製」）；公開留言不顯示聚會日期；首頁要有「最新留言」；補登按鈕保留；沒玩過的遊戲七項不顯示分數。
- 心得頁規則（A～D）：沒修改直接關；有修改問儲存／捨棄／繼續；儲存失敗保留文字；切換不丟內容；「未記錄心得」只是資訊、不是任務；返回堆疊要測不同入口。
- 介面重整大方向見 PROJECT_CONTEXT 第 10 節；與既有決定衝突處仍要逐項確認。

## 7. 與使用者合作的規則（重要）

- 使用者是**程式初學者**，繁體中文；會照步驟執行，可一次給 4～8 步；回「好」＝完成（重要項目要再問）；在 claude.ai 免費額度下工作，**聊天室容易中斷**，接手時**先問實際狀態，不要假設上一則已完成**。
- 影響資料、隱私的設計：先提方案並列「建議預設值」，等他回「照建議」再動工；一次一批。
- 給法：明確檔案、`Ctrl + F` 位置、完整程式碼、測試步驟；**量大就給整份檔案**（他多次貼漏）；每批結尾給測試清單與 `git add` 指令；**標清楚指令貼哪裡**（PowerShell→VS Code 終端機；SQL→Supabase SQL Editor）。
- 你**碰不到**他的檔案（也無法替他 push）；要資訊就給指令請他貼結果。**他貼的檔案可能是舊版**；改 `App.tsx`、`MyList.tsx`、`LoyaltyCard.tsx` 等前先請他貼目前版本。樣式分散在 `src/styles/`，改外觀前先 `Select-String -Path src\styles\*.css -Pattern "\.類別名"`。
- 改完 `npm.cmd run build` 並實測；不要破壞 106 款資料；**不要揭露「綜合分數排名」計算方式**；**不要叫他貼密碼、Secret／service_role key**。
- push 前 `git status`，**逐檔 `git add`，不要 `git add .`**；用命令列 commit，不要在 TortoiseGit 用 Amend。不要 add：`新增 文字文件.txt`、`trash-step/`、`App.css.bak`、其他 `.zip`、`boardgames.csv`（顯示 deleted 時 `git restore boardgames.csv`）、`client_secret_*.json`；三份 .md 只在使用者要求時才 commit。
- 他一次傳多張截圖時，整理成一批修改；不要把 CSS 交給別的工具壓縮；他會貼別的 AI（ChatGPT）的建議，含假資料示意圖，要分辨已查證與示意，不要照單全收。
- 終端機中文亂碼只是顯示問題；`git diff` 出現 `(END)` 按 `q`；LF/CRLF 警告可忽略。

## 8. 開場前先確認

1. 使用者在哪台電腦；`git pull`、`git status`、`git log --oneline -8`。
2. 讀完三份文件，確認第 5 節實際狀態，不要假設。
3. 新資料表寫入政策一律 `auth.uid()` 等於本人或 `is_admin()`；新表要 `revoke truncate, references, trigger ... from authenticated` 並確認 `anon` 無權限。
4. 問使用者「上次產生文件後 push 了幾次」，核對 `生成後.md` 計數。

## 9. 文件維護規則（使用者 2026-10-28 提出）

- `QUICKSTART.md`＋`PROJECT_CONTEXT.md` 是完整版；`生成後.md` 是之後修改的輕量暫存，並記計數。
- AI 只能在對話中、使用者回報 push 成功時處理：每次 push → `生成後.md` 的 push 次數 +1；滿 2 → 更新 `生成後.md`（次數歸零、更新次數 +1）；更新次數滿 3 → 重新產生兩份主文件並重置 `生成後.md`；使用者說「更新文件」可提前；換聊天室先問「上次產生後 push 了幾次」。三份 .md 只在使用者要求時 commit；重新產生那次 push 不計入。
- 2026-10-29 13:25：使用者要求重新產生兩份主文件（因 token 快滿），`生成後.md` 已併入並重置，兩個計數歸零；這次 push 一併包含 `src/App.tsx`、`src/styles/vip.css` 與三份 .md。
