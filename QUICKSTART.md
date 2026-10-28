# 桌遊規則助手 — 懶人包（給下一個 AI）

> 最後更新：2026-10-28 傍晚（第十一批 N5 篩選記憶；第十二批 N6 翻譯按鈕＋隱私權政策；第十三批 規則文件拿掉類型下拉、依 PDF／影片／網頁分區；文件清單新的在上）。
> **分工**：本檔＝現況、使用者新需求、待辦、合作規則；`PROJECT_CONTEXT.md`＝架構、資料庫、功能規則、規則助手設計（兩檔內容不重複）。
> 若與舊版或聊天內容衝突，以本檔為準。

## 1. 這是什麼

- 使用者在做**公開給朋友瀏覽的桌遊收藏網站「桌遊規則助手」**，目前 **106 款**。長期目標：VIP 能查規則書（RAG：只根據檢索到的片段、附頁碼）。
- 網址 https://board-game-result-ai.vercel.app/（GitHub `master` → Vercel 自動部署）。React + TypeScript + Vite + Supabase（免費方案，首爾）。
- 本機 `D:\BoardGameResultAI`（Windows、PowerShell、`npm.cmd`）；規則書 PDF 放 `D:\rulebooks\`（專案外，避免 Vite EBUSY）。多台電腦見 PROJECT_CONTEXT 第 9 節。

## 2. 目前狀態（2026-10-28）

- **git**：第十批以前都已 push（`ab97f76`）。第十一～十三批（`filterStorage.ts`、`RulebookAssistant.tsx`、`vip.css`、`privacy.html`、`docLabels.ts`、`GameDocuments.tsx`、`RulebookBatchUpload.tsx`）已 commit／push（最後確認的 commit `0f755f0`）。**之後交付的「新上傳排最上面」（`RulebookBatchUpload.tsx` 的 `addFiles` 改成 `[...added, ...current]`、`useGameDocuments.ts` 的 `.order('created_at', { ascending: false })`）與本檔更新是否已 commit 未確認**——請先 `git status`、`git log --oneline -5`。
- **規則助手第七批（已上線）**：檢索 SQL（`search_rulebook_chunks`、`rulebook_search_remaining`、`rulebook_has_index`、`rulebook_indexed_games`）；獨立頁面 `RulebookPage.tsx`＋`RulebookAssistant.tsx`（先選遊戲、中文問題自動建議英文關鍵字、英文搜尋框、結果含頁碼、兩個複製提示詞按鈕）；導覽列第 5 顆「✦ 規則助手」（僅 VIP／管理者）；`lib/zhEnGlossary.ts`（約 40 組中英對照）；詳細視窗固定大小；強制淺色模式。
- **第九批（已實作）**：管理中心 4 顆分頁（成員、聚會集點、**規則書**、資料匯入）；「規則書」分頁（`RulebookBatchUpload.tsx`）兩個模式——「上傳 PDF」（一次選多檔、從檔名猜遊戲、遊戲選擇是單一輸入框自動列出最多 8 個符合者、逐檔上傳顯示進度、失敗可重試、同款同名上傳文件會擋）與「貼連結／管理文件」（先選遊戲、列出該款文件可刪除、新增連結）。貼 YouTube 連結會用 oEmbed 自動帶入影片名稱（實測有效），**bilibili 抓不到名稱要自己填**。`App.tsx` 單一 `activePage`（`NavPage`＝`leaderboard`／`rules`／`admin`／`loyalty`／`mylist`），點另一顆直接取代、再點同一顆關閉；手機所有遮罩／抽屜／視窗停在導覽列上方（N2／N4，使用者實測導覽點得到、無漏底）。
- **第十批（返回鍵 N3，已完成、已 push）**：`lib/useBackClose.ts` 共用一筆歷史紀錄的登記制（`useBackClose(onClose, enabled=true)`）。已套用：`App.tsx`、`GameModal`、`RulebookPage`、`PlayerPanel`（暱稱視窗＋帳號選單）、`CategoryChips`（更多類型視窗）。**尚未接：`CheckInDialog`、`VipJoinDialog`**。首頁沒有任何視窗時右滑仍會回上一個網頁，這是瀏覽器行為。登入後清網址參數（`history.replaceState`）沒做。
- **第十一批（N5 篩選記憶，已完成）**：新增 `lib/filterStorage.ts`（鍵 `boardgame-filters`，帶版本號，讀取失敗或欄位不合退回預設）；`App.tsx` 篩選與排序狀態初始值從它讀、改動即存。存：類型（已不存在的類型會略過）、人數區間、最佳／推薦人數、時間、難度、只看新遊戲、評分狀態、我的紀錄眼睛與分區、排序欄位與方向；**搜尋文字不存**；「清除篩選」「重設排序」會存回預設。
- **第十二批（N6 翻譯按鈕，已完成）**：`RulebookAssistant.tsx` 每段結果有「翻譯成繁體中文」（開新分頁 Google 翻譯，網址超過 1800 字就改提示用複製）與「複製規則片段」（含遊戲名稱、書名、頁碼；**章節與版本目前沒有**，需改資料庫函式才有）；結果文字 `lang="en"`。使用者手機實測：Google 翻譯有自動帶入英文並翻成繁中。**Google App 的「翻譯此網站」整頁翻譯切不成繁體（單頁網站＋`lang="zh-Hant"`，原因未查證），不處理，以片段按鈕為主。** `privacy.html` 已補規則助手搜尋紀錄（7 天、不存內容）與翻譯／複製會把片段交給外部服務的說明（更新日 2026-10-28）。
- **第十三批（規則文件簡化，已完成）**：PDF 上傳列與貼連結都**拿掉類型下拉**。PDF 類型由檔名判斷（faq→FAQ、errata／勘誤→勘誤，其餘規則書）；連結網址是 YouTube／youtu.be／bilibili／b23.tv／vimeo 就存 `video`，其餘存 `other`（顯示為「網頁」），表單會顯示「將新增為：▶ 影片／🔗 網頁」。`lib/docLabels.ts` 新增 `docKind`（pdf／video／web）與 `docIcon`（📄▶🔗）；`GameDocuments.tsx` 分三區：🔗網頁與規則連結、▶教學影片、📄規則書 PDF（**只有管理者看得到**）。舊文件類型不動。**之前連續多份 PDF「無法讀取」，原因是 `npm run dev` 已中斷（pdf.js worker 載不到），不是 PDF 壞；重啟後全部成功。** `extractPdfText.ts` 的 `PDF_READ_ERROR` 訊息仍太籠統，可日後把原始錯誤名稱顯示出來。已測試上傳成功：Ayar、Bable、天際礦脈、Kemet、Kanban EV、Undaunted 2200 Callisto 多份等。
- 使用者已做過一輪手機實測（iPhone Google App 內建瀏覽器），結果見下節。

## 3. 使用者需求（N1～N6 都已完成；N5＝第十一批、N6＝第十二批）

| # | 需求 | 狀態 |
|---|---|---|
| N1 | 管理中心上傳規則 | ✅ 第九批 |
| N2 | 手機畫面底部漏底 | ✅ 第九批（手機視窗停在導覽列上方，`vip.css` 底部樣式） |
| N3 | iPhone 右滑回登入畫面 | ✅ 第十批（`useBackClose` 登記制） |
| N4 | 底部五顆按鈕可直接切換 | ✅ 第九批（`activePage`） |
| N5 | 主畫面篩選記憶 | ✅ 第十一批（方案 A：全部都存，搜尋文字不存） |
| N6 | 英文片段翻譯 | ✅ 第十二批（Google 翻譯按鈕＋複製片段，不用付費 API） |

## 4. 待辦順序（一次一批，上一批實測完才進下一批）

0. **先問**：使用者在哪台電腦、`git pull`／`git status`／`git log --oneline -5`（確認「新上傳排最上面」與文件更新是否已 push）。
1. **下一個要做：第 3 批「我的俱樂部」與詳細視窗「我的桌遊」整合**：已玩清單每列可改次數（改 `play_count`＝沒日期的次數，已確認不會重複計算）；詳細視窗「我的桌遊」分頁拿掉想玩／已玩按鈕與遊玩次數，保留「記錄一次遊玩」、最近紀錄、備註；備註改名「我的整體心得」；單次心得沿用 `game_play_sessions.note`；不動資料庫。改 `MyList.tsx`、`PlayCounter.tsx`、`GameModal.tsx`（開工前請使用者貼目前版本）。
2. 中英檢索測試集與命中率評估：使用者挑熟悉的規則書各 5～8 題、標頁碼；中文 PDF 擷取品質（亂碼、被塞空格）尚未測；必要時加每款遊戲專有名詞對照表（管理中心維護）或評估語意搜尋／翻譯 API（兩者都**未查證**）。
3. 規則相關美化（使用者提出，**尚未決定要做**）：①管理中心「規則資源管理」整理（統計摘要、篩選標籤、`⋯` 選單；別人貼的示意圖是假資料）；②使用者端「玩錯勘誤」功能（管理員自寫容易玩錯的規則、正確玩法、來源頁碼，**需要新資料表**，要先討論欄位與權限，也要與「官方勘誤」分開標示）；③影片縮圖。規則 PDF 維持**只給 AI 檢索、不公開**，使用者端只顯示連結與影片（授權風險由使用者自行評估）。
4. 其餘：手機底部 5 顆若擠，把「✦ 規則助手」縮成「規則」；「更新版本」按鈕、章節標題（`section_title` 目前空，搜尋結果因此沒有章節）、OCR；管理者視窗統一風格；PWA（缺圖示）；VIP 朋友名單（函式 `get_vip_friends` 已建、UI 未做）；推薦牆；站上拖曳調整排名＋匯出 CSV（使用者說晚點再試，細節 PROJECT_CONTEXT 第 8 節）；VIP 鎖定 SQL（資格要含來過聚會的人，執行前先討論）；`CheckInDialog`、`VipJoinDialog` 接返回鍵。

## 5. 尚未驗證／小項（有機會就問）

- 第十一～十三批待確認：登出狀態選「我評過」後重新整理畫面是否正常；iPhone Safari 點「翻譯成繁體中文」是否被導去 Google 翻譯 App；非管理者看「規則」分頁是否確實沒有 PDF 區；`Brass_Birmingham_Player_Aids.pdf`（17.6 MB）當時失敗，是否也是 dev 中斷造成、有沒有重試確認。
- 第七批手機實測剩餘項目：底部 5 顆是否擠、返回鍵（Android／iPhone Safari／LINE）、非 VIP 帳號看不到「規則助手」、VIP 帳號搜尋與剩餘次數。
- 掃描型 PDF 是否正確報 `NO_TEXT`；訪客／一般會員是否看不到上傳文件（前端已過濾，未親眼確認）。
- `furuyoni`（旭日戰魂錄）規則書是**日文**，第一版不收日文（但使用者已上傳過一份 `RisingSun_v1.2` 索引 6 頁，語言待確認）。
- 20 款清單與規則書統計表（遊戲、幾份 PDF、語言、MB／頁數、能否選取文字）仍未提供。PowerShell 量大小：`Get-ChildItem D:\rulebooks -Filter *.pdf | Select-Object Name, @{n='MB';e={[math]::Round($_.Length/1MB,1)}}`。
- 驗證社群平均是否含管理者那一票（有 5 位以上玩家評分的遊戲，評分數應含管理者；未滿 5 人仍顯示「評分累積中」）。
- 「獨特性／快速性」是否也改成「度」（使用者尚未回覆）。
- `to_regclass('public.gathering_plays')` 應為 null；`select bgg_name, cover_slug from public.board_games where cover_slug !~ '^[a-z0-9_-]+$';` 應 0 列。
- 管理中心「近期聚會依月份分組」是否符合使用者說的「新增月份」；`MemberAdmin.tsx` 在手機是否仍擠壓。
- 手機完整報到流程（登入→暱稱→自動報到→評分→集點卡）尚未實測。
- 手機上管理中心 4 顆分頁寬度；規則書分頁遊戲選擇列表在手機鍵盤彈出時是否好按。
- **已查證**：檢索只用 `to_tsvector('english', content)` 比對、**完全不看語言欄**；`game_documents.language` 有 CHECK（只能 zh／en／other）。所以中文 PDF 搜不到中文內文（待辦 2 的跨語言／中文檢索仍待處理）。
- 看到 Console 一堆 `ERR_CONNECTION_REFUSED`、`Setting up fake worker`：先確認 `npm.cmd run dev` 有沒有在跑，那是伺服器斷線，不是程式壞了。

## 6. 使用者的決定（不要推翻）

- **規則助手＝零生成式 AI API 費用**：只做「檢索＋複製提示詞給使用者自己的 AI」；不申請 API 金鑰；只給 VIP／管理者；不做 `is_active` 開關（索引成功自動啟用，要下架就刪文件）；網站內容用「另存成 PDF 再上傳」；搜尋紀錄保留 7 天、台北時間 0 點重置每日額度（VIP 30 次、管理者不限）；紀錄不存問題內容；只有找到結果才扣次數；規則書授權風險由使用者自行評估（AI 已提醒「能從 BGG 下載不等於有權再上傳與擷取」，非法律意見）。
- **上傳的 PDF 只給 AI 檢索，不公開給一般使用者**；使用者端只看連結與影片。
- 站名先保留「桌遊規則助手」；左右滑動切換分頁：等頁面都獨立後再做；右上角 Email 登入：先不做；現場 4 位數報到碼：先不做；「我的桌遊」不做擁有／收納／借出。
- 遊戲簡介補寫：使用者說太耗時，晚點。
- 管理者 CSV 分數算進社群評分（當一位評分者）；遊戲卡片顯示「綜合分數」＝700 − `score_rank`。
- 評分用語統一用「度」：影響度、溝通度、變化度（只改畫面文字；`parseCsv.ts` 的 CSV 欄名如 `溝通性`、`玩家影響性`、`複雜性`、`變化性` 是使用者 Notion 欄名，**絕對不能改**）。
- 規則書管理：新增上傳與貼連結**一律在管理中心**，詳細視窗只留清單；文件有標題就以標題為主；遊戲選擇要「輸入就自動列出、點一下選好」；管理中心每個分頁視窗大小要一致；**類型下拉與語言欄都已整個拿掉**（PDF 靠檔名、連結靠網址判斷影片或網頁）；文件清單新的排在上面。
- 篩選記憶（N5）：使用者選**全部都存**（A），只存在該瀏覽器，換裝置不同步；「清除篩選」才重設。

## 7. 與使用者合作的規則（重要）

- 使用者是**程式初學者**，繁體中文；預設會照步驟執行，可一次給最多 4～8 個步驟；回「好」＝完成（不一定貼測試結果，重要項目要再問）；遇到問題會自己停下來問；在 claude.ai 免費額度下工作，**聊天室容易中斷**，接手時**先問實際狀態，不要假設上一則回覆已完成**。
- 影響資料、隱私的設計決策：先提方案並列「建議預設值」，等他回「照建議」再動工。一次一批。
- 給法：明確檔案、`Ctrl + F` 搜尋位置、完整程式碼、測試步驟；**量大就給整份檔案**（他多次貼錯位置，第十三批 `linkType` 那行就貼漏了，要寫清楚函式名稱與前後行）；每批結尾給測試清單與 `git add` 指令。
- **每個指令標清楚貼在哪裡**：PowerShell 指令貼 VS Code 終端機；SQL 貼 Supabase SQL Editor。
- 你**碰不到**他的檔案、也收不到 CSV；要資訊就給 PowerShell／SQL 指令請他貼結果或截圖。**他貼的檔案可能是舊版**，先用 `git status`、`git log` 確認；改 `App.tsx`、`AdminPanel.tsx`、`PlayerPanel.tsx`、`GameDocuments.tsx`、`src/components/*` 前先請他貼目前版本。樣式分散在 `src/styles/`，改外觀前先 `Select-String -Path src\styles\*.css -Pattern "\.類別名"` 找 class 在哪。
- 改完 `npm.cmd run build` 並實測；不要破壞 106 款資料與現有功能；**不要揭露「綜合分數排名」的計算方式**。
- **不要叫他貼密碼、Secret／service_role key、Google Client Secret。**
- push 前 `git status`，**逐檔 `git add`，不要 `git add .`**；請他用命令列 commit，**不要在 TortoiseGit 用 Amend**。不要 add：`新增 文字文件.txt`、`trash-step/`、`App.css.bak`、其他 `.zip`、解壓殘留資料夾、`boardgames.csv`（顯示 deleted 時 `git restore boardgames.csv`）、`client_secret_*.json`；`PROJECT_CONTEXT.md`、`QUICKSTART.md` 只在使用者要求時才 commit。
- 他一次傳多張手機截圖時，看完後**整理成一批**修改，效率最好。不要把 CSS 交給別的工具壓縮。
- 他有時會貼別的 AI 的建議（含假資料示意圖）：要分辨哪些是已查證、哪些是示意，不要照單全收，重要設計先討論。
- 終端機中文亂碼只是顯示問題；`git diff` 出現 `(END)` 按 `q`；LF/CRLF 警告可忽略。

## 8. 開場前先確認

1. 使用者在哪台電腦；分支 `master`；先 `git pull`、`git status`、`git log --oneline -8`。
2. 確認第 5 節的實際狀態，不要假設。
3. 新資料表的寫入政策一律 `auth.uid()` 等於本人或 `is_admin()`；新建資料表要 `revoke truncate, references, trigger ... from authenticated` 並確認 `anon` 無權限。
