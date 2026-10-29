# 桌遊規則助手 — 懶人包（給下一個 AI）

> 最後更新：2026-10-29 09:55（已包含第十一～十六批、贈送免費券、新增聚會排版修正、沒玩過不顯示管理者評分、新遊戲置頂；`生成後.md` 已併入並重置）。
> **分工**：本檔＝現況、待辦、合作規則；`PROJECT_CONTEXT.md`＝架構、資料庫、功能規則、規則助手設計；`生成後.md`＝這兩份之後的修改紀錄與文件維護計數（**開工前三份都要讀，衝突時以 `生成後.md` 為準**）。
> **文件維護規則**見第 9 節（每 2 次 push 更新 `生成後.md`、其更新滿 3 次重新產生兩份主文件）。

## 1. 這是什麼

- 使用者在做**公開給朋友瀏覽的桌遊收藏網站「桌遊規則助手」**，目前 **106 款**。長期目標：VIP 能查規則書（RAG：只根據檢索到的片段、附頁碼）。
- 網址 https://board-game-result-ai.vercel.app/（GitHub `master` → Vercel 自動部署）。React + TypeScript + Vite + Supabase（免費方案，首爾）。
- 本機 `D:\BoardGameResultAI`（Windows、PowerShell、`npm.cmd`）；規則書 PDF 放 `D:\rulebooks\`（專案外，避免 Vite EBUSY）。多台電腦見 PROJECT_CONTEXT 第 9 節。

## 2. 目前狀態（2026-10-28）

- **git（2026-10-29 09:48 使用者回報 push 完成）**：分支 `master`，第十一～十六批、贈送免費券（`3205dfe`）、新增聚會排版修正、沒玩過不顯示管理者評分、新遊戲置頂都已 push；三份 .md 在 `2d2f536`、`8f3d7e4` 推過。使用者有兩台電腦（路徑同為 `D:\BoardGameResultAI`），**開工先 `git pull`**；曾因另一台已推而顯示「behind origin/master」。本機 build 曾因 `node_modules` 沒裝好缺 `pdfjs-dist`，`npm.cmd install` 後已通過。使用者貼終端機結果時，PowerShell 指令要貼在 VS Code 終端機（曾誤貼進 Supabase SQL Editor）。
- **規則助手第七批（已上線）**：檢索 SQL（`search_rulebook_chunks`、`rulebook_search_remaining`、`rulebook_has_index`、`rulebook_indexed_games`）；獨立頁面 `RulebookPage.tsx`＋`RulebookAssistant.tsx`；導覽列第 5 顆「✦ 規則助手」（僅 VIP／管理者）；`lib/zhEnGlossary.ts`（約 40 組中英對照）；詳細視窗固定大小；強制淺色模式。
- **第九批**：管理中心 4 顆分頁（成員、聚會集點、規則書、資料匯入）；規則書分頁有「上傳 PDF」與「貼連結／管理文件」兩個模式；`App.tsx` 單一 `activePage`（`leaderboard`／`rules`／`admin`／`loyalty`／`mylist`），點另一顆直接取代、再點同一顆關閉；手機所有遮罩／抽屜／視窗停在導覽列上方。
- **第十批（返回鍵）**：`lib/useBackClose.ts` 共用一筆歷史紀錄的登記制。已套用：`App.tsx`、`GameModal`、`RulebookPage`、`PlayerPanel`、`CategoryChips`；**未接：`CheckInDialog`、`VipJoinDialog`**。
- **第十一批（篩選記憶，已完成）**：`lib/filterStorage.ts`（鍵 `boardgame-filters`）；存類型、難度、人數區間、最佳／推薦人數、時間、只看新遊戲、評分狀態、我的紀錄眼睛與分區、排序；**搜尋文字不存**。
- **第十二批（翻譯按鈕，已完成）**：規則助手每段結果有「翻譯成繁體中文」（開新分頁 Google 翻譯，使用者手機實測會自動帶入並翻成繁中）與「複製規則片段」；`privacy.html` 已補規則助手搜尋紀錄與翻譯／複製的說明。Google App 的「翻譯此網站」整頁翻譯切不成繁體（單頁網站＋`lang="zh-Hant"`，原因未查證），不處理。
- **第十三批（規則文件簡化，已完成）**：PDF 上傳列與貼連結都拿掉類型下拉；PDF 類型由檔名判斷，連結網址是影片網站存 `video`、其餘存 `other`（顯示「網頁」）；`lib/docLabels.ts` 的 `docKind`／`docIcon`；`GameDocuments.tsx` 分三區（🔗網頁、▶影片、📄PDF〔僅管理者〕）；文件清單新的在上、新選檔案排上面。之前多份 PDF「無法讀取」是 dev 伺服器中斷造成，不是 PDF 壞。
- **第十四批（我的桌遊整合，已完成、已 push）**：詳細視窗「我的桌遊」分頁拿掉想玩／已玩按鈕與次數計數器，只留累計次數說明、「記錄一次遊玩」、最近紀錄、「我的整體心得」（原「我的備註」）；「我的俱樂部」已玩清單每列可 − ＋ 改次數（改 `play_count`，帶 `skipPlayedRule: true`，總次數＝`playCount`＋有日期紀錄筆數）；想玩清單不變；`vip.css` 底部有 `.mylist-counter*`。`PlayCounter.tsx` 已無人使用（保留未刪）。
- **第十五批（規則助手快捷，已 push；手機實測未回報）**：`RulebookPage` 選好遊戲後出現「📖 這款的規則連結與影片」按鈕，開該款詳細視窗並停在「規則」分頁；規則助手頁**保持開著**（方案 B，關詳細視窗後搜尋結果仍在）；`App.tsx` 傳 `onOpenGame`（不呼叫 `setActivePage(null)`）；`vip.css` 把 `.modal-backdrop` z-index 調到 **1150**（原 1100，會被同為 1100 的 `.ra-backdrop` 蓋住）。已知取捨：疊兩個視窗時手機返回鍵／右滑會一起關。
- **第十六批（PDF 提醒，10/29 補做並 push，使用者說測試沒問題；先前文件誤寫已交付，其實當時沒套用）**：`RulebookBatchUpload.tsx`——單檔超過 15 MB 在該列顯示非阻擋提醒（建議找 Lo-res／Compact 版）、說明文字加「用瀏覽器開啟能選取文字或 Ctrl+F 搜尋就可以用」；`extractPdfText.ts`——`NO_TEXT` 訊息改為提示可能是掃描檔、需先 OCR；`PDF_READ_ERROR` 拆成密碼保護（`PasswordException`）、格式錯誤（`InvalidPDFException`）與其他（顯示原始錯誤名稱）；這些例外名稱是 pdf.js 的慣例，**未逐一驗證**，不符時會落到通用訊息。`vip.css` 底部有 `.rb-warn`。
- **贈送免費券（10/29 已 push、使用者測過沒問題）**：`LoyaltyAdmin.tsx` 每位玩家列有「贈送」鈕（`window.prompt` 輸入 1～5 張 → `admin_grant_voucher(p_user, p_qty)`），下方「🎁 管理者贈送紀錄」讀 `loyalty_grants`。Supabase 已確認有該表與函式；**表的 RLS／`revoke`、贈送券如何計入 `loyalty_totals`／`settle_vouchers` 尚未查證**。「補登」保留（現場已給券的例外用）。
- **新增聚會排版**：`loyalty-admin.css` 的 `.lga-new` 改兩欄（日期＋場次一列、備註一列、按鈕一列）。
- **沒玩過的遊戲（`ranking_engine` 不是整數）**：管理者評分分頁七項（喜歡度、溝通度、獨特性、影響度、變化度、整體、適合留下來）一律顯示「未玩過」、不顯示圓點（`GameModal.tsx`）。
- **新遊戲置頂**：`App.tsx` 的 `isPinnedGame`＋`PIN_DAYS = 15`：`createdAt` 15 天內且 `rankingEngine` 空白或非整數才置頂，任一條件結束就取消；任何排序都生效（仍受搜尋與篩選限制）；「依我的紀錄分區顯示」時只在各分區內置頂；NEW 標示仍是 30 天。
- **空間用量（2026-10-28 實測）**：Storage——`rulebooks` 13 份 116.8 MB、`covers` 98 張 6.2 MB；`rulebook_chunks` 約 696 kB；資料庫總大小 14 MB。免費額度（Storage 1 GB、Database 500 MB）是別的 AI 引用 Supabase 官方、**本專案未自行查證**，以後台 Project Settings → Usage 顯示為準。PDF 平均約 9 MB，照此估算約 100 份會碰到 1 GB。查詢用 SQL 見 `生成後.md` 或本檔第 5 節。

## 3. 使用者需求狀態

N1～N6（管理中心上傳、手機漏底、返回鍵、導覽直接切換、篩選記憶、翻譯按鈕）與「我的桌遊整合」都已完成。2026-10-29 另完成：贈送免費券、新增聚會排版、沒玩過不顯示管理者評分、新遊戲置頂。

## 4. 待辦順序（一次一批，上一批實測完才進下一批）

0. **先問**：使用者在哪台電腦、`git pull`／`git status`；10/29 那批的手機實測；`get_rating_summaries()` 與排行榜是否已排除沒玩過遊戲的喜歡度等五項（文件寫「七項都不計」，**未實查**）；`loyalty_grants` 的 RLS／權限與贈送券如何計入 `loyalty_totals`（請使用者匯出表權限與函式定義後補進 PROJECT_CONTEXT）。
1. **中英檢索測試集與命中率評估**：使用者挑熟悉的規則書各 5～8 題、標頁碼；中文 PDF 擷取品質（亂碼、被塞空格）尚未測；必要時評估每款遊戲專有名詞對照表（管理中心維護）或語意搜尋／翻譯 API（皆未查證）。
2. **介面重整與「我的場次」（使用者 2026-10-29 選 A 當下一批）**：規格在 `PROJECT_CONTEXT.md` 第 10、10.1 節。分批：**A 我的場次（只讀；出席者看當天出席暱稱與指定遊戲，隱藏暱稱者顯示「匿名玩家」，管理者看全部含 LINE／FB；需新增 security definer 函式，先給 SQL 與權限設計、使用者確認後再做畫面）**→B 補記過去場次入口→C 場次心得兩欄＋跳窗→D 遊戲留言板→E 首頁「最新留言」＋「近期聚會」→導覽列最後。一次一批，影響資料與隱私的先提方案等「照建議」。
3. **規則資源管理美化／玩錯勘誤（尚未決定要做）**：管理中心「規則資源管理」整理（統計摘要、篩選標籤、`⋯` 選單；別的 AI 貼的示意圖是假資料）；使用者端「玩錯勘誤」（管理員自寫容易玩錯的規則、正確玩法、來源頁碼，**需要新資料表**，要先討論欄位與權限，也要與「官方勘誤」分開標示）；影片縮圖。規則 PDF 維持**只給 AI 檢索、不公開**。
4. 其餘：手機底部 5 顆若擠，把「✦ 規則助手」縮成「規則」；「更新版本」按鈕、章節標題（`section_title` 目前空，搜尋結果因此沒有章節）、OCR（第一版刻意不做，也不指定未驗證的外部服務）；管理者視窗統一風格；PWA（缺圖示）；VIP 朋友名單（函式 `get_vip_friends` 已建、UI 未做）；推薦牆；站上拖曳調整排名＋匯出 CSV（細節 PROJECT_CONTEXT 第 8 節）；VIP 鎖定 SQL（資格要含來過聚會的人，執行前先討論）；`CheckInDialog`、`VipJoinDialog` 接返回鍵。

## 5. 尚未驗證／小項（有機會就問）

- **介面重整（2026-10-29）**：`PROJECT_CONTEXT.md` 第 10 節末尾有 8 項「與既有決定衝突／待確認」（最大的一項：「所有紀錄」要公開所有玩家的評分與留言，與既有的評分隱私與「不做留言板」決定衝突），動工前逐項問使用者。
- 第十五批：規則助手開詳細視窗是否在最上層；關閉後搜尋結果是否還在；手機返回鍵行為；其他視窗（排行榜點遊戲、卡片「詳細資料」、報到視窗 1050、「請改用瀏覽器開啟」1200）層級是否正常。
- 第十六批：使用者 10/29 回報測試沒問題；密碼保護與格式損毀的 pdf.js 例外名稱（`PasswordException`、`InvalidPDFException`）仍未逐一驗證。
- 第十四批：手機上已玩清單的 − ＋ 是否好按、版面是否擠；訪客改次數重新整理是否保留；記一筆遊玩後清單總次數是否 +1。
- 第十一～十三批：登出狀態選「我評過」後重新整理是否正常；iPhone Safari 點翻譯是否被導去 Google 翻譯 App；非管理者看「規則」分頁是否沒有 PDF 區；`Brass_Birmingham_Player_Aids.pdf` 當時失敗，是否為 dev 中斷造成（未重試確認）。
- 第七批手機實測剩餘：底部 5 顆是否擠、返回鍵（Android／iPhone Safari／LINE）、非 VIP 帳號看不到「規則助手」、VIP 帳號搜尋與剩餘次數；訪客／一般會員是否看不到上傳文件。
- `furuyoni`（旭日戰魂錄）規則書是日文，第一版不收日文（但使用者已上傳過 `RisingSun_v1.2` 索引 6 頁，語言待確認）。
- 驗證社群平均是否含管理者那一票；「獨特性／快速性」是否也改成「度」（使用者尚未回覆）。
- `to_regclass('public.gathering_plays')` 應為 null；`select bgg_name, cover_slug from public.board_games where cover_slug !~ '^[a-z0-9_-]+$';` 應 0 列。
- 管理中心「近期聚會依月份分組」是否符合需求；`MemberAdmin.tsx` 在手機是否擠壓；手機完整報到流程尚未實測；手機上管理中心 4 顆分頁寬度、規則書分頁遊戲選擇列表在鍵盤彈出時是否好按。
- **已查證**：檢索只用 `to_tsvector('english', content)`、**完全不看語言欄**；`game_documents.language` 有 CHECK（zh／en／other）。中文 PDF 搜不到中文內文（待辦 1）。
- Console 一堆 `ERR_CONNECTION_REFUSED`、`Setting up fake worker`：先確認 `npm.cmd run dev` 有在跑。
- **查空間用量的 SQL（貼 Supabase SQL Editor，一次貼一段）**：①`select bucket_id, count(*) as 檔案數, round(sum((metadata->>'size')::bigint) / 1024.0 / 1024.0, 1) as mb from storage.objects group by bucket_id;` ②`select pg_size_pretty(pg_total_relation_size('public.rulebook_chunks')) as 資料表含索引大小;` ③`select pg_size_pretty(pg_database_size(current_database())) as 資料庫總大小;`

## 6. 使用者的決定（不要推翻）

- **規則助手＝零生成式 AI API 費用**：只做「檢索＋複製提示詞給使用者自己的 AI」；不申請 API 金鑰；只給 VIP／管理者；不做 `is_active` 開關；網站內容用「另存成 PDF 再上傳」；搜尋紀錄保留 7 天、台北時間 0 點重置每日額度（VIP 30 次、管理者不限）；紀錄不存問題內容；只有找到結果才扣次數；規則書授權風險由使用者自行評估（AI 已提醒，非法律意見）。
- **上傳的 PDF 只給 AI 檢索，不公開給一般使用者**；使用者端只顯示連結與影片。**第一版不做 OCR**；PDF 太大只提醒不阻擋。
- 站名先保留「桌遊規則助手」；左右滑動切換分頁：等頁面都獨立後再做；右上角 Email 登入、現場 4 位數報到碼：先不做；「我的桌遊」不做擁有／收納／借出。
- 遊戲簡介補寫：使用者說太耗時，晚點。
- 管理者 CSV 分數算進社群評分；遊戲卡片顯示「綜合分數」＝700 − `score_rank`。
- 評分用語統一用「度」（只改畫面文字；`parseCsv.ts` 的 CSV 欄名是使用者 Notion 欄名，**絕對不能改**）。
- 規則書管理：新增上傳與貼連結**一律在管理中心**；文件有標題以標題為主；遊戲選擇「輸入就自動列出、點一下選好」；管理中心每個分頁視窗大小一致；類型下拉與語言欄都已拿掉；文件清單新的在上。
- 篩選記憶：全部都存、只存該瀏覽器、「清除篩選」才重設。
- 詳細視窗「我的桌遊」不再有想玩／已玩按鈕與次數計數器；次數只在「我的俱樂部」已玩清單調整；備註叫「我的整體心得」。
- 規則助手開詳細視窗：選方案 B（規則助手保持開著、視窗疊在上面）。
- 介面重整方向（2026-10-29）：使用者說已討論出結論並要求寫入文件（內容見 `PROJECT_CONTEXT.md` 第 10 節）。但這是別的 AI 的建議加上使用者的取捨，與既有決定有衝突之處尚未處理，**動工前要逐項確認，不要直接照做**。
- 2026-10-29 回覆的決定：隱藏暱稱者在「我的場次」顯示「匿名玩家」；場次遊戲＝當天指定遊戲（管理者新增的立刻看得到）；**出席聚會不自動算玩過一次**；補記過去場次沿用現有 `game_play_sessions`，總次數＝`play_count`＋有日期紀錄筆數，補記一筆自動 +1；`game_play_sessions` 與場次心得先分開不整合；心得兩欄「私人留言」「公開留言」都選填、中間有「複製」；**推翻「不做留言板」，改自願公開**；首頁要有「最新留言」區；補登按鈕保留；沒玩過的遊戲七項不顯示分數；新遊戲置頂 15 天。

## 7. 與使用者合作的規則（重要）

- 使用者是**程式初學者**，繁體中文；預設會照步驟執行，可一次給最多 4～8 個步驟；回「好」＝完成（不一定貼測試結果，重要項目要再問）；遇到問題會自己停下來問；在 claude.ai 免費額度下工作，**聊天室容易中斷**，接手時**先問實際狀態，不要假設上一則回覆已完成**。
- 影響資料、隱私的設計決策：先提方案並列「建議預設值」，等他回「照建議」再動工。一次一批。
- 給法：明確檔案、`Ctrl + F` 搜尋位置、完整程式碼、測試步驟；**量大就給整份檔案**（他多次貼錯位置，第十三批 `linkType` 那行就貼漏了，要寫清楚函式名稱與前後行）；每批結尾給測試清單與 `git add` 指令。
- **每個指令標清楚貼在哪裡**：PowerShell 指令貼 VS Code 終端機；SQL 貼 Supabase SQL Editor。
- 你**碰不到**他的檔案；要資訊就給 PowerShell／SQL 指令請他貼結果或截圖。**他貼的檔案可能是舊版**；改 `App.tsx`、`AdminPanel.tsx`、`PlayerPanel.tsx`、`GameDocuments.tsx`、`src/components/*` 前先請他貼目前版本。樣式分散在 `src/styles/`，改外觀前先 `Select-String -Path src\styles\*.css -Pattern "\.類別名"` 找 class 在哪。
- 改完 `npm.cmd run build` 並實測；不要破壞 106 款資料與現有功能；**不要揭露「綜合分數排名」的計算方式**。
- **不要叫他貼密碼、Secret／service_role key、Google Client Secret。**
- push 前 `git status`，**逐檔 `git add`，不要 `git add .`**；請他用命令列 commit，**不要在 TortoiseGit 用 Amend**。不要 add：`新增 文字文件.txt`、`trash-step/`、`App.css.bak`、其他 `.zip`、解壓殘留資料夾、`boardgames.csv`（顯示 deleted 時 `git restore boardgames.csv`）、`client_secret_*.json`；三份 .md（`PROJECT_CONTEXT.md`、`QUICKSTART.md`、`生成後.md`）只在使用者要求時才 commit。
- 他一次傳多張手機截圖時，看完後**整理成一批**修改。不要把 CSS 交給別的工具壓縮。
- 他會貼別的 AI 的建議（含假資料示意圖）：要分辨哪些已查證、哪些是示意，不要照單全收，重要設計先討論。
- 終端機中文亂碼只是顯示問題；`git diff` 出現 `(END)` 按 `q`；LF/CRLF 警告可忽略。

## 8. 開場前先確認

1. 使用者在哪台電腦；分支 `master`；先 `git pull`、`git status`、`git log --oneline -8`。
2. 讀完三份文件，確認第 5 節的實際狀態，不要假設。
3. 新資料表的寫入政策一律 `auth.uid()` 等於本人或 `is_admin()`；新建資料表要 `revoke truncate, references, trigger ... from authenticated` 並確認 `anon` 無權限。
4. 問使用者「上次產生文件後 push 了幾次」，核對 `生成後.md` 的計數。

## 9. 文件維護規則（使用者 2026-10-28 提出）

- **三份文件的分工**：`QUICKSTART.md`＋`PROJECT_CONTEXT.md` 是完整版（產生一次較耗時）；`生成後.md` 是「完整版之後的修改紀錄」，輕量、常更新，並記錄維護計數。
- **自動化的真相**：AI 不能在背景自動執行，**只能在對話中、使用者回報 push 成功時**做；所以計數由 AI 在每次使用者回報 push 後自己累加並寫進 `生成後.md`，到門檻時**主動提醒並直接產生**，不必等使用者提醒。
- **規則**：①使用者每回報一次 push（commit＋push 成功），AI 把 `生成後.md` 的「push 次數」＋1；②**滿 2 次**→AI 主動更新 `生成後.md`（把這兩次的修改附加進去，push 次數歸零、「更新次數」＋1）並傳檔；③**更新次數滿 3**→AI 主動重新產生 `QUICKSTART.md`＋`PROJECT_CONTEXT.md`（把 `生成後.md` 的內容併入），並重置 `生成後.md`（兩個計數歸零）；④使用者隨時可說「更新文件」強制提前；⑤換聊天室或 AI 忘了計數時，新 AI 先問使用者上次產生後 push 了幾次，再校正；⑥只有一次 push 就要出門之類的情況，使用者說了就立刻更新。
- 三份 .md 只在使用者要求時才 commit（建議跟著下一次 push 一起）。
- 2026-10-29 09:55：使用者因 token 快用完提前觸發「更新文件」，已把 `生成後.md` 併入兩份主文件並重置（兩個計數歸零）。
- 2026-10-29：使用者要求這三份一併 commit＋push，並說明 `生成後.md` 的用途＝**主文件 push 之後才出現的新內容，先暫存在這裡**。這次文件 push **不計入** push 次數，計數從 0 重新開始。
