# 桌遊規則助手 — 懶人包（給下一個 AI）

> 最後更新：2026-10-28（第八批：兩份文件已去重合併）。
> **分工**：本檔＝現況、使用者新需求、待辦、合作規則；`PROJECT_CONTEXT.md`＝架構、資料庫、功能規則、規則助手設計（兩檔內容不重複）。
> 若與舊版或聊天內容衝突，以本檔為準。

## 1. 這是什麼

- 使用者在做**公開給朋友瀏覽的桌遊收藏網站「桌遊規則助手」**，目前 **106 款**。長期目標：VIP 能查規則書（RAG：只根據檢索到的片段、附頁碼）。
- 網址 https://board-game-result-ai.vercel.app/（GitHub `master` → Vercel 自動部署）。React + TypeScript + Vite + Supabase（免費方案，首爾）。
- 本機 `D:\BoardGameResultAI`（Windows、PowerShell、`npm.cmd`）；規則書 PDF 放 `D:\rulebooks\`（專案外，避免 Vite EBUSY）。多台電腦見 PROJECT_CONTEXT 第 10 節。

## 2. 目前狀態（2026-10-28）

- **git**：`HEAD = origin/master = 53f824c`，工作目錄乾淨，第七批全部已 push。
- **規則助手第七批（已上線）**：檢索 SQL（`search_rulebook_chunks`、`rulebook_search_remaining`、`rulebook_has_index`、`rulebook_indexed_games`）；獨立頁面 `RulebookPage.tsx`＋`RulebookAssistant.tsx`（先選遊戲、中文問題自動建議英文關鍵字、英文搜尋框、結果含頁碼、兩個複製提示詞按鈕）；導覽列第 5 顆「✦ 規則助手」（僅 VIP／管理者）；`lib/zhEnGlossary.ts`（約 40 組中英對照）；`lib/useBackClose.ts`（手機返回只關視窗，目前只套用 `GameModal`、`RulebookPage`）；`GameDocuments.tsx` 合併新增連結與上傳 PDF 為單一表單；詳細視窗固定大小；強制淺色模式。
- 已測試上傳 3 份英文規則書（Ayar 20 頁、Bable 12 頁、天際礦脈 `rules-en` 32 頁），皆 `completed`。`rules-en` 語言已改 `en`（使用者已執行 SQL，回「Success」；可用 `select title, language from public.game_documents where title='rules-en';` 再確認）。
- 使用者已做過一輪手機實測（含 LINE 截圖），結果見下節。

## 3. 使用者新需求（2026-10-28 手機實測後提出，全部尚未動工；請保留）

| # | 需求（使用者原話意思） | 分析／建議做法 |
|---|---|---|
| N1 | 希望**在管理中心上傳規則** | 即原「第 2 批」：管理中心加「規則書」分頁（細節見第 4 節） |
| N2 | **畫面底部怪怪的，往上滑會漏底** | 與舊的未解問題同一件：詳細視窗與底部導覽下方露出約 76px 遊戲卡片內容（`tabs.css` 手機版 `.game-modal.has-tabs{height:100dvh}`、`.modal-backdrop{padding:0}` 看起來都對，CSS 看不出原因）。使用者新傳的截圖檔名 `S__*.jpg` 疑似 LINE 內建瀏覽器。**要查**：是否 LINE／Safari 的網址列收合造成 `dvh` 與實際高度不一致、遮罩未蓋滿。方向：遮罩改 `position:fixed; inset:0` 並用 `100lvh`／`-webkit-fill-available`、視窗開啟時鎖住 body 捲動（`overflow:hidden`＋`overscroll-behavior:contain`）、底部導覽加 `env(safe-area-inset-bottom)`。**請使用者說明是用什麼開的（LINE／Safari／Chrome／主畫面），並貼 `tabs.css`、`base.css` 相關段落** |
| N3 | **iPhone 右滑（返回）從排行榜／集點卡／我的桌遊會回到登入畫面，不是首頁**（使用者推測可能是之前登入的動作） | 推測原因：①這些抽屜沒有 push history，右滑直接退回上一個歷史（Google 登入頁）；②OAuth 登入後的網址／歷史沒清。做法：把 `useBackClose` 擴到**所有抽屜與頁面**（排行榜、集點卡、我的桌遊、規則助手、管理中心、進階篩選、統計表、暱稱視窗），開啟時 `pushState`、返回時關閉；登入完成後用 `history.replaceState` 清掉網址參數，避免回到登入頁。實測：iPhone Safari 右滑、Android 返回鍵、LINE |
| N4 | **底部五顆按鈕不必先回主畫面才能點下一個** | 目前點一顆會開抽屜／頁面，要先關才能點別顆。改為單一 `activePage` 狀態：點另一顆時**直接取代**目前的抽屜（先關舊的再開新的），再點同一顆＝關閉；底部導覽要高於抽屜（或抽屜不遮住導覽）。改 `App.tsx`、`TopBar.tsx`（請使用者貼目前版本） |
| N5 | **主畫面使用者設定的篩選模式要能儲存**，不用每次重新按自己的模式 | 把篩選狀態（類型、進階篩選、「我的紀錄」眼睛與分區模式、排序）存 `localStorage`（鍵例如 `boardgame-filters`），開啟時還原，「清除篩選」才重設；檢視模式本來就有存（`boardgame-view-mode`）。**待問使用者**：指的是「我的紀錄」三顆眼睛＋分區模式，還是全部篩選？AI 建議全部都存。登入玩家可日後考慮同步雲端（先不做） |
| N6 | **搜到的英文片段能不能用 Google／瀏覽器內建翻譯？** | **可以，不需要付費 API。** 建議：每段結果加「翻譯」按鈕，開新分頁 `https://translate.google.com/?sl=en&tl=zh-TW&text=<編碼後片段>&op=translate`（片段最長 800 字，網址夠用）；結果區文字設 `lang="en"` 並保持可選取，讓 Safari／Chrome 的「選取文字→翻譯」可用（**瀏覽器內建整頁翻譯對「單一區塊」不可靠，不保證**）；另提供「複製片段」。**提醒**：按翻譯會把片段送到 Google，與「複製提示詞給外部 AI」同樣要在按鈕旁說明，不可宣稱資料仍留在本站（授權疑慮見 PROJECT_CONTEXT 第 7 節）。不做自動翻譯 API（費用與額度未查證） |

## 4. 待辦順序（一次一批，上一批實測完才進下一批）

0. **先問**：使用者目前在哪台電腦、`git pull`／`git status`；N2 的截圖是用什麼開的。
1. **第 2 批（對應 N1）管理中心「規則書」分頁**：一次選多個 PDF；每列從檔名猜遊戲（比對 `bggName` 與中文名）、類型（檔名含 faq／errata，否則規則書）、語言（有中文字猜 `zh`，否則 `en`）；猜不到顯示「請選擇遊戲」，下拉可搜尋；確認後逐檔上傳，顯示進度與失敗原因，失敗不影響其他檔；詳細視窗「規則」分頁拿掉上傳，只留貼連結與清單。`useGameDocuments` 要改成可指定任意 `bggName`（目前綁單一遊戲）。要改 `AdminCenter.tsx`（已看過）、`useGameDocuments.ts`、`GameDocuments.tsx`（**請使用者貼目前版本**）。
2. **手機操作批（N2＋N3＋N4）**：底部漏底、返回鍵擴到所有抽屜、五顆導覽直接切換；一起改一批、一起實測。
3. **N5 篩選記憶**、**N6 翻譯按鈕**（可併入規則助手小改）。
4. **第 3 批「我的俱樂部」與詳細視窗「我的桌遊」整合**：已玩清單每列可改次數（改 `play_count`＝沒日期的次數，已確認不會重複計算）；詳細視窗「我的桌遊」分頁拿掉想玩／已玩按鈕與遊玩次數，保留「記錄一次遊玩」、最近紀錄、備註；備註改名「我的整體心得」；單次心得沿用 `game_play_sessions.note`；不動資料庫。改 `MyList.tsx`、`PlayCounter.tsx`、`GameModal.tsx`。
5. **`privacy.html` 補「規則助手搜尋紀錄」**（用途、保留 7 天、只存使用者與遊戲與時間、不存問題內容；若做 N6 也要說明片段會送往 Google）。**在讓朋友實際使用規則助手前做完。**
6. 中英檢索測試集與命中率評估：使用者挑熟悉的規則書各 5～8 題、標頁碼；中文 PDF 擷取品質（亂碼、被塞空格）尚未測；必要時加每款遊戲專有名詞對照表（管理中心維護）或評估語意搜尋／翻譯 API（兩者都**未查證**）。
7. 其餘：手機底部 5 顆若擠，把「✦ 規則助手」縮成「規則」；「更新版本」按鈕、章節標題（`section_title` 目前空）、OCR；管理者視窗統一風格；PWA（缺圖示）；VIP 朋友名單（函式 `get_vip_friends` 已建、UI 未做）；推薦牆；站上拖曳調整排名＋匯出 CSV（使用者說晚點再試，細節 PROJECT_CONTEXT 第 9 節）；VIP 鎖定 SQL（資格要含來過聚會的人，執行前先討論）。

## 5. 尚未驗證／小項（有機會就問）

- 第七批手機實測剩餘項目：底部 5 顆是否擠、返回鍵（Android／iPhone Safari／LINE）、詳細視窗大小一致、非 VIP 帳號看不到「規則助手」、VIP 帳號搜尋與剩餘次數。
- 掃描型 PDF 是否正確報 `NO_TEXT`；訪客／一般會員是否看不到上傳文件（前端已過濾，未親眼確認）。
- `furuyoni`（旭日戰魂錄）規則書是**日文**，表單只有中文／英文，第一版不收日文。
- 20 款清單與規則書統計表（遊戲、幾份 PDF、語言、MB／頁數、能否選取文字）仍未提供。PowerShell 量大小：`Get-ChildItem D:\rulebooks -Filter *.pdf | Select-Object Name, @{n='MB';e={[math]::Round($_.Length/1MB,1)}}`。
- 驗證社群平均是否含管理者那一票（有 5 位以上玩家評分的遊戲，評分數應含管理者；未滿 5 人仍顯示「評分累積中」）。
- 「獨特性／快速性」是否也改成「度」（使用者尚未回覆）。
- `to_regclass('public.gathering_plays')` 應為 null；`select bgg_name, cover_slug from public.board_games where cover_slug !~ '^[a-z0-9_-]+$';` 應 0 列（`makeCoverSlug` 新版是否已套用並重新匯入未確認）。
- 管理中心「近期聚會依月份分組」是否符合使用者說的「新增月份」；`MemberAdmin.tsx` 在手機是否仍擠壓（沒看過檔案，需要時請使用者貼）。
- 手機完整報到流程（登入→暱稱→自動報到→評分→集點卡）尚未實測，等下次聚會或用另一個 Google 帳號測。
- 聚會連結 `&openExternalBrowser=1` 在 LINE 的行為：使用者實測過報到流程「沒有問題」。

## 6. 使用者的決定（不要推翻）

- **規則助手＝零生成式 AI API 費用**：只做「檢索＋複製提示詞給使用者自己的 AI」；不申請 API 金鑰；只給 VIP／管理者；不做 `is_active` 開關（索引成功自動啟用，要下架就刪文件）；網站內容用「另存成 PDF 再上傳」；搜尋紀錄保留 7 天、台北時間 0 點重置每日額度（VIP 30 次、管理者不限）；紀錄不存問題內容；只有找到結果才扣次數；規則書授權風險由使用者自行評估（AI 已提醒「能從 BGG 下載不等於有權再上傳與擷取」，非法律意見）。
- 站名先保留「桌遊規則助手」；左右滑動切換分頁：等頁面都獨立後再做；右上角 Email 登入：先不做（寄信額度與費用）；現場 4 位數報到碼：先不做；「我的桌遊」不做擁有／收納／借出。
- 遊戲簡介補寫：使用者說太耗時，晚點。
- 管理者 CSV 分數算進社群評分（當一位評分者）；遊戲卡片顯示「綜合分數」＝700 − `score_rank`。
- 評分用語統一用「度」：影響度、溝通度、變化度（只改畫面文字；`parseCsv.ts` 的 CSV 欄名如 `溝通性`、`玩家影響性`、`複雜性`、`變化性` 是使用者 Notion 欄名，**絕對不能改**）。

## 7. 與使用者合作的規則（重要）

- 使用者是**程式初學者**，繁體中文；預設會照步驟執行，可一次給最多 4～8 個步驟；回「好」＝完成（不一定貼測試結果，重要項目要再問）；遇到問題會自己停下來問；在 claude.ai 免費額度下工作，**聊天室容易中斷**，接手時**先問實際狀態，不要假設上一則回覆已完成**。
- 影響資料、隱私的設計決策：先提方案並列「建議預設值」，等他回「照建議」再動工。一次一批。
- 給法：明確檔案、`Ctrl + F` 搜尋位置、完整程式碼、測試步驟；**量大就給整份檔案**（他多次貼錯位置，也曾把 `adminScores` 貼進 `TrashSection` 而非 `GameModal`，要寫清楚元件與標籤）；每批結尾給測試清單與 `git add` 指令。
- **每個指令標清楚貼在哪裡**：PowerShell 指令貼 VS Code 終端機；SQL 貼 Supabase SQL Editor（他曾貼錯）。
- 你**碰不到**他的檔案、也收不到 CSV；要資訊就給 PowerShell／SQL 指令請他貼結果或截圖。**他貼的檔案可能是舊版**，先用 `git status`、`git log`、`Get-Content ... | Select-Object -First 15` 確認；改 `App.tsx`、`AdminPanel.tsx`、`PlayerPanel.tsx`、`GameDocuments.tsx`、`src/components/*` 前先請他貼目前版本。樣式分散在 `src/styles/`，改外觀前先 `Select-String -Path src\styles\*.css -Pattern "\.類別名"` 找 class 在哪。
- 改完 `npm.cmd run build` 並實測；不要破壞 106 款資料與現有功能；**不要揭露「綜合分數排名」的計算方式**。
- **不要叫他貼密碼、Secret／service_role key、Google Client Secret。**
- push 前 `git status`，**逐檔 `git add`，不要 `git add .`**；請他用命令列 commit，**不要在 TortoiseGit 用 Amend**。不要 add：`新增 文字文件.txt`、`trash-step/`、`App.css.bak`、其他 `.zip`、解壓殘留資料夾、`boardgames.csv`（顯示 deleted 時 `git restore boardgames.csv`）、`client_secret_*.json`；`PROJECT_CONTEXT.md`、`QUICKSTART.md` 只在使用者要求時才 commit。
- 他一次傳多張手機截圖時，看完後**整理成一批**修改，效率最好。不要把 CSS 交給別的工具壓縮（Gemini 壓縮過，已 `git restore` 還原）。
- 終端機中文亂碼只是顯示問題；`git diff` 出現 `(END)` 按 `q`；LF/CRLF 警告可忽略。

## 8. 開場前先確認

1. 使用者在哪台電腦；分支 `master`；先 `git pull`、`git status`、`git log --oneline -8`。
2. 確認第 3、5 節的實際狀態，不要假設。
3. 新資料表的寫入政策一律 `auth.uid()` 等於本人或 `is_admin()`；新建資料表要 `revoke truncate, references, trigger ... from authenticated` 並確認 `anon` 無權限。
