# 玩桌遊｜BoardGame（桌遊規則助手）— 懶人包（給下一個 AI）

> 最後更新：2026-11-16（**第九次合併版**：併入同義詞①（前端通用同義詞表）、英文詞 chip 選 ②、管理中心資源用量顯示、`GlossaryMisses` 附錄上限與「清掉已解決的零結果」、旭日題庫驗收結果、產品路線圖（`未來目標.md` 第 13 節）、「網站做成 APP」目標；已逐節對照 `未來目標.md`，**沒有刪掉任何還沒做的待辦**）。程式最新已知：`fafc301`（HEAD、origin/master 同步）。
> **分工**：本檔＝現況、待辦摘要、使用者決定、合作規則、陷阱；`PROJECT_CONTEXT.md`＝架構、資料庫、功能規則、規則助手設計；`未來目標.md`＝所有未完成目標總清單；`連帶關係圖.md`＝改 A 影響 B；`畫面改版.md`＝畫面改版決定與現況；`生成後.md`＝本版之後的修改紀錄與計數。**開工前都讀，衝突時以 `生成後.md` 為準。**
> **精簡原則（使用者要求）：縮小文件時，「以前說要做但還沒做」的項目一律不可刪**；只能刪已完成的過程敘述、重複測試清單、舊 commit 流水帳（git log 有）。
> 標記：**［使用者決定］**、**［AI 建議］**（使用者未回「照建議」）、**［未驗證］**。

## 1. 這是什麼
- 公開給朋友瀏覽的桌遊收藏網站（頂端列「玩桌遊」；歡迎視窗、頁尾、標題、隱私權政策用「玩桌遊｜BoardGame」；`bggName`、GitHub 專案名、資料夾 `D:\BoardGameResultAI` 沒改名）。約 106～111 款。長期目標：VIP 能查規則書（RAG：只根據檢索片段、附頁碼）；**長期也要把網站做成 APP（見第 4 節）**。
- 網址 https://board-game-result-ai.vercel.app/（GitHub `master` → Vercel 自動部署）。React + TypeScript + Vite + Supabase（免費方案，首爾）。
- 本機 `D:\BoardGameResultAI`（Windows、PowerShell、`npm.cmd`）；規則書 PDF 放專案外（`D:\Rulebook`），**絕不 `git add`**。本機 AI 專案 `D:\LocalAI-Lab\02_BoardGame-RAG` **與網站專案分開**。

## 2. 目前狀態（2026-11-16）

### 2.1 git 與工作習慣
- 最近已 push（`git log` 2026-11-16）：`fafc301` 詞庫匯出附錄上限下拉＋清掉已解決的零結果、`339e562` 前端通用同義詞表、`b4d5fb9` 備份 `admin_database_size.sql`、`634e96f` 更新生成後.md、`1925de5` 管理中心容量顯示＋英文詞 chip 收進縮小搜尋範圍。工作區狀態以使用者貼的 `git status` 為準。
- 家裡電腦 `git stash@{0}`「這台電腦pull前備份」留著，**不要 `git stash pop`**。
- **SQL 檔位置**：2026-11-15 起新 SQL 放專案根目錄 `BoardGameSQL/`（進 repo；名稱維持現狀）：`miss_kind_step1.sql`（**不可重跑**）、`miss_kind_step2.sql`、`miss_kind_step3_export.sql`、`search_rulebook_chunks_v10.sql`、`rule_stats_delete.sql`、`admin_database_size.sql`（可重跑）。**更早、不在 repo（Supabase 已執行）的 SQL**：`loyalty_adjustments.sql`、`loyalty_earned_days` 與 `bk_loyalty_keep_*`、`test_gathering_cleanup.sql`、`unplay_when_empty`、補日期三函式、`record_gathering_play`、`unplay_game`、`delete_my_ratings`、`cleanup_test_gathering()` 改寫、`get_public_gathering_notes` 加場次欄位、集點明細全連接、`favorites_and_limit50.sql`、匿名玩家（`get_player_stats`／`get_game_people`）、`cleanup_past_planned.sql`（pg_cron）、`search_rulebook_chunks_v9.sql`、`admin_auto_doc_language.sql`、英文詞候選相關等；是否搬進 `BoardGameSQL/` 未決定（［AI 建議］搬進去）。改之前一律請使用者貼線上定義。
- 使用者習慣：先在 `http://localhost:5173/` 測再 push；曾拿 Vercel 舊版當新版，截圖不對先問是 localhost 還是網站；曾回報「沒改到」其實是檔案沒存或放錯資料夾，所以給修改要附 `Select-String` 驗證。**測試多半先跳過（「最後一起測」），不要每次開場追問。**

### 2.2 已完成功能（結論；細節見 PROJECT_CONTEXT 與 `畫面改版.md`）
- **帳號**：只用 Google 登入；歡迎視窗、暱稱與聯絡方式、VIP 升級視窗、聚會連結報到自動升 VIP；內建瀏覽器（LINE／FB／Google App）顯示說明；首次進站且為內建瀏覽器時顯示一次深色提示小卡（`ThemeHint`）。
- **桌遊收藏首頁（探索優先）**：搜尋、篩選、新加入桌遊區（30 天、最多 8 款）、類型膠囊、排序在標題旁、「我的統計 ›」入口、清單檢視為詳細資料表格（3 欄／9 欄不動）。
- **遊戲詳細視窗（GameModal v2）**：大封面頂部、2×2 入口卡片＋底部彈窗（規則連結／背景／擴充／玩錯紀錄）；彈窗內管理者可直接新增連結／上傳 PDF（依內容猜範圍）／新增玩錯紀錄，VIP 可投稿連結與玩錯紀錄（`UploadModal`）；評分分頁摘要＋「前往我的評分」；討論、紀錄分頁。
- **俱樂部**：首頁功能總覽；本命桌遊頒獎台；我的統計；我的評分；我的心得；我的聚會（卡片、出席者標籤、右上「寫心得 ›」、只列自己有評分的遊戲，管理者列全部）；留言板（管理者）；我的投稿（VIP）；集點卡（非 VIP）。
- **集點／免費券／聚會**：免費券 v2、四顆調整按鈕、點數保留（`loyalty_earned_days`）、測試場規則、手動加入玩家確認流程、報到流程與獎勵視窗、聚會後心得詢問卡、預計聚會（過期每日自動清）。
- **統計中心**：遊戲榜、玩家榜（含本命桌遊分頁；隱藏暱稱者顯示「匿名玩家」）、規則助手熱搜（管理者每列有「刪除」鈕）、統計表（全螢幕）、分布圖。
- **規則助手**：搜尋優先單頁、繁簡同搜、詞庫、**前端通用同義詞表（2026-11-16 新增，見下）**、結果排序＝中文規則書優先 → FAQ → 擴充 → 主遊戲 → 玩家整理（只改前端）、每日 50 次（VIP；管理者不限；找到結果才扣）、玩錯紀錄、AI 回饋投稿、熱搜。**現行搜尋函式 v10。**
  - **英文詞 chip（2026-11-16 選 ②，已 push）**：主畫面「可能的英文詞」整塊拿掉；只留「縮小搜尋範圍」抽屜內英文 chip（點了立即搜尋）；抽屜內點選不補回報候選（英文詞候選統計自然變少，新詞靠「匯出給 AI 分析」累積）。通用詞庫仍是 `zhEnGlossary.ts`。
  - **同義詞①（前端通用同義詞表，2026-11-16 完成並實測，已 push `339e562`）**：新檔 `src\lib\zhSynonyms.ts`（`SYNONYM_GROUPS`、`expandSynonyms(q, bggName)`）；`RulebookAssistant.tsx` 的 `run()` 把展開結果併入 `p_alt`（`p_query` 仍是玩家原輸入），`buildTerms` 同步標黃。依線上 v10：`p_alt` 只用來取中文搜尋詞、不進詞庫比對、不進未命中與統計，所以零結果／未對應詞仍只記原詞、**不多扣次數**；沒改 SQL、`useRulebookSearch.ts`。規格［使用者決定「照建議」］：只查表、一次展開、不遞迴；原詞保留；每組最多加 3 個、一次搜尋最多加 6 個；只收驗證過的對應；遊戲專屬詞用 `games` 欄位限定；4 字詞拆 2 字片段並丟掉泛用片段（「玩家」「遊戲」）。**目前詞表**：10 組通用（起始玩家／先手玩家／先手／首家；指示物／標示物／標記；勝利點／勝點；棄牌堆／棄牌區／棄牌庫；抽牌堆／牌庫／牌堆；平手／同分／平分；計分／算分；洗牌／重洗；結盟／聯盟；擊殺／殺死／殺掉；多數憑一般用語列、未用規則書驗證［未驗證］）＋旭日限定 `神殿／神廟／神社`（`bggName`＝`Rising Sun`）。實測：「先手」→ `p_alt`＝`先手 起始 始玩 手玩 首家`；「神廟」「神社」各 5 段、「神殿」10 段；聖域搜「神廟」不展開；亂打的詞 0 段不扣次數。**同一詞重搜會吃前端快取（`cache`），Network 不會出現 `search_rulebook_chunks`，測試前先 F5。** **已知限制**：2 字同義詞權重只有 0.5，結果比搜標準詞少；若日後排序太差，再評估 v11 SQL 加同義詞專用參數（會改函式簽名：先匯出線上定義、`drop function`、重建、重新 `revoke`／`grant`）。
- **管理中心**：成員／集點聚會／上傳檔案（PDF｜連結｜玩錯紀錄｜詞庫四分頁，搜尋列置頂；PDF 上傳依檔名＋內容猜範圍；YouTube 自動帶標題、Bilibili 只能手填〔Bilibili 封 Supabase IP，已結案〕；詞庫可「貼上 AI 回覆」匯入）／資料匯入；待審紅點。
  - **資源用量顯示（2026-11-16，已完成並實測）**：「上傳檔案→PDF」分頁一行顯示檔案儲存與資料庫用量（只有管理者看得到；［使用者決定］不顯示百分比；≥80% 橘字、≥95% 紅字）。`admin_database_size()`（security definer、內部 `is_admin()`；SQL Editor 沒登入身分，直接呼叫會失敗是正常的）；前端 `RulebookBatchUpload.tsx`（`FILE_LIMIT` 1 GiB、`DB_LIMIT` 500 MiB、`usageLevel`、`QuotaLine`、`loadUsage`），樣式 `src\styles\upload-row.css`（`.rbv-quota*`）。Supabase Free 上限查證（2026-11-16 官方定價頁）：500 MB 資料庫、1 GB 檔案儲存、單檔 50 MB、閒置一週暫停（Pro＝8 GB／100 GB）；目前約 431 MB 檔案（PDF 296 份）、25 MB 資料庫。
- **搜尋未命中分析**：`game_glossary_misses` 分 `glossary_miss` 與 `search_zero_result`，標來源 `user`／`admin`；90 天自動刪（在搜尋函式內）；不存完整問題與帳號。**畫面 `GlossaryMisses.tsx`（管理中心「上傳檔案→詞庫」）［使用者決定］**：整塊預設收起，標題「未命中分析（待處理 N・候選 M）」，兩子分頁＝未命中的詞｜英文詞候選；只留「匯出給 AI 分析」一條路：選遊戲→複製給 AI 分析→把 AI 最後輸出的清單貼進「貼上 AI 回覆」；匯出文字結尾由前端 `exportFooter(game)` 附【輸出要求】（每行 `遊戲名｜中文詞｜對應詞`、只放 A／B 類、略過泛用詞與沒把握的詞）；**只需一個 AI**；網站自己不能生成（零 AI 費用）。**2026-11-16 新增（已 push `fafc301`，網站實測未回報［未驗證］）**：①附錄上限下拉 60,000／120,000／200,000 字元（預設 120,000；`APPENDIX_LIMITS`、`appendixLimit`；資料庫夾在 5,000～200,000；字元越多某些 AI 輸入上限可能放不下［未驗證］）；②按鈕「清掉已解決的零結果」（`pruneSolved`）：用管理者身分對該遊戲零結果詞逐一重搜（不扣次數），搜得到的呼叫 `admin_delete_search_miss` 移除，仍搜不到的留著且**次數可能再加 1**；刻意不做成載入時自動清。「全部詞庫」（`GlossaryAdmin.tsx`，`src\components\`）為 `<details class="ov-fold">` 預設摺疊。使用者仍需**手動刪「的效果不同」「頁碼還沒找到」**（句子片段與測試輸入，不要進詞庫）。
- **英文詞候選（管理者端已完成）**：表 `rule_term_candidates`；玩家端 `report_term_pick`（`reportPicks`，只回報內建 `zhEnGlossary.ts` 的組合＝使用統計，不是新詞發現）；管理者端核准（先寫詞庫成功才標 `approved`）／退回／「驗證」（用管理者身分以英文詞搜規則書，0 段＝不建議核准）／「一鍵驗證並核准」；規則書找得到英文詞不保證中文意思對得上，仍建議人工看過。
- **垃圾桶清理（`gameCleanup.ts` 現行 5.5 + 9 步）**：規則書 PDF、擴充、背景、詞庫、未對應詞、搜尋零結果詞（5.5）、玩錯紀錄、熱搜統計、英文詞候選、本命桌遊。不動玩家的想玩／已玩、評分、心得、遊玩紀錄、聚會。
- **深色模式**：玩家選單「外觀」三選項（深色／淺色／跟隨系統），預設深色；`dark-theme*.css` 覆蓋，舊 CSS 不動；仍可能有漏網（見 2.4）。
- **其他**：擴充、遊戲背景、評論按讚、留言統一表單 `NoteForm`、`privacy.html`（隨新功能更新）。**導覽列**：使用者說已有初步改版、不知還缺什麼［未決定］。

### 2.3 尚未確認／待實測（使用者說以後再測，**不要主動追問**；完整清單見 `未來目標.md` 第 1 節）
登入流程是否還跳 Google 選帳號頁、獎勵視窗三種、`get_game_play_history` 排除測試場 SQL、卓爾金曆 cMap 重傳、`3c11ca6`／`32869ae`／`878956a`／`87b3ff5` 的語言判斷、點券保留實測、畫面改版各頁（375／390／430、淺色與深色、四種身分）、`ThemeHint` 實機測試、彈窗內上傳／投稿（返回鍵只退一層）、我的聚會手機排版、本命桌遊設定視窗與玩家榜「隱藏管理者」、搜尋未命中分析網站實測（v10 要真的搜尋才會寫入零結果詞）與 `gameCleanup` 5.5 步（不要拿真遊戲測）、**`GlossaryMisses` 新下拉選單與「清掉已解決的零結果」網站實測**、上傳規則書依內容猜範圍的一致性、手機 375px 資源用量那一行是否太擠（使用者說畫面沒問題）。已回報通過：手機返回鍵（我的聚會寫心得、我的心得、補日期寫心得）、本命桌遊鍵盤不擋儲存鈕、熱搜刪除、資源用量顯示。
- **其他待實測／待決定**：①「要不要寫這天的心得？」確認視窗（`PlaySessions.tsx` 第 47 行 `askConfirm`）深色實測；②首頁卡片深色補漏使用者決定先跳過，**不要主動追問**，提起時請他截圖；③「我的投稿」搜尋欄深色白底暫不處理。
- **題庫驗收（旭日；FAQ 2.0 已上傳並索引；以下為 AI 依內容判斷）**：題 1 福祿壽可被殺＝**通過**（FAQ 2.0 第 3 頁）；題 2 戰鬥平手榮耀高者贏＝**通過**（中文規則書第 7、22、28 頁；英文 v1.2 第 3、4、6 頁）；題 3 下凡與神殿效果不同＝**有依據，要兩份文件拼**（神殿＝英文 v1.2 第 4、5 頁、中文第 19 頁；下凡＝擴充 Kami Unbound 波蘭文 `Rising-Sun-Zstapienie-Kami-Instrukcja` 第 1～3 頁，波蘭文為 AI 自行翻譯［未驗證］；詞庫已補 `下凡→Kami Unbound`）；題 4 解除結盟＝**通過**（中文第 18 頁、英文 v1.2 第 4 頁）；題 5 福祿壽可生兵＝**文件沒寫能招募**（FAQ 2.0 第 3 頁只寫調度行動可被「建造」），當作「找不到依據要明說」測試，目前無生成式 AI、只列片段不會亂答；題 6 下一季起始玩家＝**通過**（中文第 25 頁，第 12、13 頁也相關）。**羅倫佐 4 題（第③題「議會大廳」段落與第④題問哪種點數未釐清）、第三款遊戲尚未動。**
- **已查證不需修改（2026-11-16）**：「我的聚會」垃圾桶遊戲（`isTrashed()` 已處理）；詳細視窗「前往我的評分」；預計聚會頁文字；`cron.job` 有 `cleanup-past-planned`（`10 16 * * *`）；`admin_delete_favorite_games`、`admin_delete_rule_keyword`、`admin_delete_rule_stats` 存在；`privacy.html` 已涵蓋英文詞建議、本命桌遊、匿名玩家、搜尋零結果詞；`RulebookAssistant.tsx` 兩行 `console.log` 已刪。

### 2.4 已知限制
- `gathering_games` 資料庫層不擋「僅供參考」四款（只在前端過濾）；管理者看不到「我的評分」入口；評分「完整」狀態前端判斷。
- 點數原為讀取時算，現由 `loyalty_earned_days` 保留已得的日子；獎勵視窗用前後快照比對。
- 規則助手：英文全文檢索對德文／波蘭文未驗證；中文子字串比對；簡繁用字差異不一定轉得準；詞庫中文同義詞不自動轉簡體；同義詞展開後 2 字詞權重低（見 2.2）。
- 手動加入玩家確認流程只針對聚會當天，事後沒有補走入口。
- 深色漏網：首頁卡片檔（`card-compact.css`、`card-row.css`、`explore-home.css` 新加入卡無圖底色 `#e8eddf`）；評分圓點、`PostGatheringNotes`、其他少數彈窗；「要不要寫這天的心得？」確認視窗［未驗證］。
- `loyalty_grants` 空表仍被 `loyalty_totals`／`settle_vouchers` 引用，保留。
- 匯出給 AI 分析：資料庫不會中翻英，候選段落只比對中文詞、詞庫英文詞或英文詞；簡體規則書可能漏，所以才附整份原文附錄。

## 3. 開工前先問
1. 在哪台電腦；`git pull`、`git status`、`git log --oneline -8`（最上面要有 `(HEAD -> master, origin/master)`）。
2. 上次產生文件後 push 了幾次（核對 `生成後.md`；第九次合併後兩個計數歸零）。
3. **不要主動追問**：2.3 的測試、本機 AI 計畫 A／B／C、B2 心得留言九項、旭日 Paddle 抽查等。

## 4. 待辦摘要（完整、含狀態標記見 `未來目標.md`；一次一批，上一批測完才進下一批）
- **立刻（第九次合併後）**：①核對 `git log --oneline -5` 與 `npm.cmd run build`；②六份 `.md` 覆蓋專案根目錄與 claude.ai 專案檔案副本後 commit（使用者要求時才做，不計 push）；③把「做成 APP」目標與 13.2 的 Phase 2 補一條寫進 `未來目標.md`（AI 給了貼上的文字，使用者是否已貼未確認［未驗證］）。
- **產品路線圖（`未來目標.md` 第 13 節，全是［AI 建議］，使用者尚未回「照建議」）**：定位＝全方位桌遊平台（找遊戲→認識遊戲→開桌→解決規則→記錄聚會；使用者選 A［未驗證，請確認］）。Phase 1 改善現有體驗（同義詞、搜尋排序、資料與索引品質）；Phase 2 回訪理由（**今天玩什麼？**〔性價比最高，建議先做〕、開桌前快速複習、個人化推薦）；Phase 3 遊戲體驗（單款互動教學概念驗證）；Phase 4 社群與智慧化（語意搜尋、知識庫）。推薦順序：①同義詞（已完成①）②測試題庫 ③今天玩什麼 MVP ④單款快速複習原型 ⑤單款互動教學概念驗證 ⑥AI／ML 評估。**下一步建議＝「今天玩什麼？」MVP**：動工前先列「建議預設值」（資料欄位、人數／時間／難度篩選、想玩／已玩／個人評分加權、用到別人資料時只給 VIP／管理者範圍；第一版不用 AI、不新增會員制度），等「照建議」。待使用者回答（13.7）：第一款互動教學測試遊戲（候選璀璨寶石等，需先確認在收藏內、有完整繁中規則書、核心行動好視覺化）、是否把未來目標拆成四張清單、是否確認定位 A。**VIP 是來聚會報到自動升級、不是付費制，續費率類 KPI 不適用。**
- **［已決定要做，2026-11-16，尚未排順序］把網站開發成 APP**：［AI 建議，未驗證］分三層：①PWA（加入主畫面、全螢幕、圖示與啟動畫面；補圖示、`manifest`、`service worker`；零費用、不用上架；建議先做）；②用 Capacitor 之類外殼包成 Android／iOS app（Google Play 一次性費用、Apple 開發者每年費用，動工前再查官方頁）；③原生重寫（不建議）。要先決定：上不上架商店、Google 登入在 app 內做法（內建瀏覽器限制要重驗證）、推播需求、`privacy.html` 同步。導覽列改版與「今天玩什麼？」完成後再做較妥（app 化會影響導覽與 `useBackClose`）。動工前先列建議預設值，等「照建議」。
- **同義詞後續（［AI 建議］，未動工）**：②遊戲專屬同義詞走詞庫（`en_term` 可存中文同義詞）；③`pg_trgm` 字形相近比對；④embedding／`pgvector` 語意搜尋（RAG 2.0 模組 C，效果未驗證）；⑤自行訓練 ML／DL（AI 不建議現在做：資料量小、免費方案無法部署模型、與零生成式 AI 費用偏好衝突；等累積真實搜尋案例與測試題庫、確認比傳統方法好再評估）；雲端 AI 擴詞排最後。通用同義詞表要擴充時，只收驗證過的對應。
- **已決定、未動工／待使用者選**：①「全部詞庫」要不要拆元件完全置底［未決定］；②首頁卡片深色補漏（先跳過）；③上傳規則書依內容猜範圍的一致性待實測；④「要不要寫這天的心得？」深色實測；⑤「我的投稿」搜尋欄白底暫不處理。
- **規則助手／RAG**：其他桌遊詞庫（靠未對應詞清單與「匯出給 AI 分析」慢慢累積）；Context Pack；embedding 評估；網站內雲端 AI（使用者尚未回答付費版與自動開啟 vs 管理者確認）；題庫（羅倫佐 4 題、第三款未決定；`Rathulhu_rules_v1_2.pdf` 要不要上傳使用者尚未回覆）；其他待做（更新版本按鈕、章節標題、OCR 標示、最切題排序、規則衝突優先序未實作）。
- **規則書與本機 OCR**：規則書已分批上傳完成（PDF 296 份；驗證搜尋仍待測：天際礦脈搜「股份」、Decrypto 搜「攔截」、`________.pdf`／`___________.pdf` 傳完各搜一詞確認不是亂碼）；`RA_compressed` 掃描型需本機 OCR；抽查字是否通順；`LocalAI.md` 補「新增中文規則書怎麼做」；本機桌遊 AI 之後再說。
- **募資與商業化、長期願景**：見 `未來目標.md` 第 5、6 節；在使用者回覆「付費版」「自動開啟 vs 確認」之前不要寫捐款或 Edge Function 程式。
- **畫面／導覽**：導覽列改版（最後做；使用者說已有初步改版，請他傳手機與電腦版導覽列截圖再對照 `未來目標.md` 第 7 節）；殘留舊 CSS 再掃描（`vip.css` 手機版舊規則、`.mylist-drawer` 疊層）；站上拖曳調整排名＋匯出 CSV 給 Notion（晚點）。
- **俱樂部與聚會擴充（未決定）**：俱樂部統計（最愛類型、常玩人數、每月趨勢）、近期想玩標記、揪團與聚會規劃、VIP 朋友名單 UI、VIP 鎖定 SQL、推薦牆。
- **資料設計（未決定）**：評分修改歷史、廢除 `play_count`、單場評分、概覽評分顯示、所有紀錄公開評分、聚會心得「只有參與者可見」、補建過去聚會、聚會設定頁拆頁。
- **文件拆檔**：`生成後.md` 第 4 節的拆檔計畫仍為［AI 建議］；**使用者 2026-11-15 回「照建議」＝第七次合併不拆檔**；之後是否拆檔未決定（13.7 第 4 點的四張清單一併決定）。
- 另一個 AI 的提案（動態牆、社群中心等）全部未決定，只當參考。

## 5. 使用者的決定（不要推翻）

**身分、隱私、資料**
- 只用 Google 登入；不做匿名帳號、Email 登入、現場報到碼；不在網站加「請改用 Safari」提示。
- 層級：訪客→一般登入→VIP→管理者（也算 VIP）。想玩／已玩社群人數只統計 VIP＋管理者；**LINE／FB 名字永不給 VIP**；評分者名單與每人評分只有管理者；**管理者看不到私人心得**。
- **隱藏暱稱者（2026-11-14 推翻舊決定）：仍列入榜單，但一律顯示「匿名玩家」；管理者仍看得到本人；只有管理者與 VIP 看得到榜單。**
- **本命桌遊**：頒獎台只有登入者看得到；玩家榜「本命桌遊」分頁只有 VIP 與管理者看得到。
- 管理者 CSV 分數算進社群評分；**不揭露「綜合分數排名」計算方式**；**`parseCsv.ts` 欄名與 `bggName` 絕不能動**；「(含擴)」只在匯入時從 `name` 去掉。
- 規則書 PDF 不公開、放專案外、不 `git add`；**不要叫使用者貼密碼、Secret／service_role key**。

**聚會與集點**
- 三種聚會定義：預計聚會（預告）／新增聚會（記錄誰到現場並建連結）／歷史聚會；玩家端叫「未來聚會」，導覽列「聚會．留言」。
- 管理者建立聚會預設在名單並免評分；管理者不集點；指定遊戲軟移除不失點；出席不自動算玩過，評分完整自動建當天紀錄；聚會日 ≤ 今天＝已開團。
- 免費券 v2：同月第 2 點變券、月點數歸零、券保留；隔天起可用；有券又有來的人當天用券（用券那天不集點）。
- **已得點數與免費券除管理者自己刪外不得消失**（`loyalty_earned_days`）；刪「測試」開頭聚會→該場得的點一起刪；改聚會日期→點跟著搬。
- 集點四顆按鈕規則：贈送點算當月、湊 2 點變券；扣除點最多扣到當月 0；扣除券最多扣到可用券 0；撤銷會讓已用券不夠則拒絕；數量 1～50。
- 「測試」開頭場次：不替管理者記已玩、評分不標已玩、不補日期紀錄、刪聚會時全刪；正式場次名稱不要以「測試」開頭。
- 管理者手動加入的玩家要跑完評分流程才得點／用券。
- 補日期不增加總次數（總次數＝無日期次數＋日期筆數）；有日期紀錄不能取消已玩；手動日期私人心得存 `game_play_sessions.note`。
- 刪聚會：測試場全刪；正式場日期紀錄刪、點券保留、公開留言搬 `game_notes`（沿用 id）、私人心得搬整體心得、總次數歸 0 才清評分並取消已玩。
- 寫心得一律不讓遊戲變已玩；取消已玩走 `runUnplayFlow`；「我的統計→已玩」沒有「移除」鈕，只用 ＋／−。
- 我的評分與我的心得各有「勾選刪除」；留言（公開）與心得（私人）可互相複製，兩邊有字→「儲存全部」。
- **公開留言標了聚會就顯示場次標籤**；兩處留言列表共用 `NoteListItem`、按讚同步。
- **我的聚會（2026-11-14）**：卡片只列自己有評分的遊戲（管理者列全部）、右上「寫心得 ›」直接進寫作畫面、出席者預設顯示（管理者暱稱＋名字、VIP 暱稱）；拿掉「聚會詳情」入口。
- **返回規則**：所有 ✕ 與手機返回只回上一層；新視窗只呼叫 `useBackClose(onClose, isOpen)`，不自己 `pushState`；留言板發表→回留言板、遊戲詳細資料跳來→回該遊戲、補日期寫心得→回補日期視窗、評分完按「回到集點卡」→進集點卡、我的聚會寫心得→回我的聚會。

**評分、留言、心得**
- 評分整體 1～10＋適合留下來 1～5 必填；未滿 5 人顯示「評分累積中」；統計只算已玩。
- 留言一律自願公開、可刪自己的；一人可留多則（≤10）；確認視窗一律用 `askConfirm`；公開心得第一次發布前提醒。
- 評論按讚：只有 VIP＋管理者、不能按自己、每人每則一個、所有人只看數字、名單只有管理者。
- 未玩過只能寫私人心得（管理者例外）；「僅供參考」四款不能想玩／已玩／評分／留言，不進統計。
- 概覽偏好「桌遊圖鑑風＋米白深綠」；遊戲詳細視窗**沒有想玩／已玩按鈕**，遊玩次數只在俱樂部調整。

**規則助手與內容**
- **零生成式 AI API 費用**為偏好（雲端 AI 排最後）；只給 VIP／管理者；**搜尋紀錄不存問題內容與帳號**；台北 0 點重置，**VIP 50 次／天**、管理者不限、找到結果才扣；上傳 PDF 只給檢索；網站內不做 OCR；不做 .txt 上傳；PDF 投稿先不做。
- **同義詞（2026-11-16）**：搜尋時打同義詞也要找得到，**且不要靠人工貼 AI 回覆**；第一層（前端通用同義詞表）已照建議完成；同義詞展開視為同一次搜尋，不可多扣次數。
- **英文詞 chip（2026-11-16 選 ②）**：主畫面拿掉，抽屜內保留；抽屜內點選不補回報候選。
- **搜尋未命中分析（2026-11-15～16）**：`glossary_miss` 與 `search_zero_result` 分開記並標來源；匯出要含英文候選詞原文段落（前後各一段，附檔名與頁碼，找不到寫「沒有找到可提供的相關原文」），附錄上限改為可選（預設 120,000）；沿用「貼上 AI 回覆」匯入；AI 建議一律人工確認；90 天自動刪（在 `search_rulebook_chunks` 內，不是 pg_cron）；零結果詞中文長度上限 30 字；**暫不做**最相關排序、品質儀表板、有幫助／沒幫助、整套「搜尋品質中心」；「中文規則書優先」排序不變；不重建、不覆蓋既有功能，先查線上資料庫；畫面太亂→只留「匯出給 AI 分析」一條路、兩類未命中合併一份清單且只顯示次數、整塊預設收起、「全部詞庫」預設摺疊、英文詞候選核准前先「驗證」；使用者說畫面太亂時優先合併入口，不再加分頁。
- **管理中心資源用量**：兩條合成同一行、不顯示百分比。
- **熱搜統計管理者可手動刪除**（關鍵字／整款遊戲）；一般 VIP 看不到刪除鈕。
- 文件語言與範圍存在每份文件；玩家整理與玩錯紀錄必須標來源、不與官方規則同等；「感覺是對的」標【未驗證】；問擴充但沒有擴充文件要老實說。
- 結果排序＝**中文規則書優先 → FAQ → 擴充 → 主遊戲 → 玩家整理**。
- 熱搜／FAQ 階段 3 不做；不採 ChatGPT 六張表；不做「完整問題自動公開」「匿名識別碼去重」。
- 垃圾桶「只留封面」；CSV 匯入超過 5 款要輸入「移除」。
- **上傳連結三處順序一致：網址 → 影片標題 → 遊戲**。
- **畫面改版**：一次一頁、只改樣式與排列；管理中心不美化；**深色改為手動切換（預設深色）**；詳見 `畫面改版.md`。
- **SQL 備份**：新 SQL 放 `BoardGameSQL/`，名稱維持現狀。
- **已作廢**：「管理員點開下面的項目也要跳上傳視窗」、`AI_PROMPT` 五類版與 `gm-hint` 文字統一。

## 6. 與使用者合作的規則
- 使用者是**程式初學者**，繁體中文；會照步驟執行，可一次給 4～8 步；回「好」＝完成（前面有多個選項時要先確認他選哪個）；在免費額度下工作，**聊天室容易中斷、額度中途用完**，接手時**先問實際狀態**；他的訊息可能被截斷（也可能只是亂碼，不確定就問）。
- 影響資料、隱私的設計：先提方案並列「建議預設值」，等他回「照建議」再動工。他一次傳多張截圖時整理成一批修改。
- **交付方式**：小檔案由 AI 直接交完整檔；**文件（.md）直接產生檔案給他**；大檔案（`App.tsx`、`MyList.tsx`、`LoyaltyAdmin.tsx`）以他上傳的目前版本為底，唯一錨點取代、保留 CRLF（`GameCard.tsx`、`fetchBoardGames.ts`、`ScatterChart.tsx`、`stats-chart.css` 是 LF；**CRLF 檔如 `GlossaryMisses.tsx` 給「找這一行、換成這一行」單行錨點，多行區塊用「在某行前／後插入」**）；小修改可給「找這句、換成這句」讓他手動貼；**交付檔路徑寫完整含放哪一層**（`src\AdminPanel.tsx`、`src\MyList.tsx`、`src\LoyaltyAdmin.tsx`、`src\GameDocuments.tsx`、`src\PlayerPanel.tsx` 在 `src\` 不是 `components\`；`gameCleanup.ts`、`askConfirm.tsx` 在 `src\lib\`；`GlossaryAdmin.tsx`、`GlossaryMisses.tsx`、`RulebookBatchUpload.tsx` 在 `src\components\`；`upload-row.css` 在 `src\styles\`），先對照 `git status`；覆蓋後 `Select-String` 驗證、`(Get-Item 檔).Length` 確認不是空檔。
- **AI 不能 commit／push**，給指令請他貼；逐檔 `git add`、不要 `git add .`；commit 用中文；不要用 TortoiseGit Amend；用 `git log --oneline -3` 看有 `(HEAD -> master, origin/master)` 才算 push 成功。不要 add：`新增 文字文件.txt`、`trash-step/`、`App.css.bak`、`.zip`、`boardgames.csv`、`client_secret_*.json`、`.vs/`、重複檔（如 `club-leaderboard_1.css`、`GlossaryAdmin_1.tsx`、`miss_kind_step2_1.sql`）。
- **AI 不能執行 `npm run build`**：TS 錯誤（含 TS6133 未使用變數）要他跑 `npm.cmd run build` 貼回；**交付含「拿掉東西」的修改要自查有沒有留下未使用變數**。改資料庫函式前請他匯出線上定義；一次一段 SQL、標清楚貼在 Supabase SQL Editor；驗證查詢要設計成「存在時一定有列」；指令放程式碼框；占位符要寫出實際值。
- 他會貼 ChatGPT 的建議與示意圖（**假資料**），要對照既有決定、標 `[不影響功能]`／`[改變入口位置]`／`[需要新功能或新資料]`。**不要把 CSS 交給別的工具壓縮。**
- 容器被限流時不憑記憶寫檔，請他貼 `Select-String` 找行號與路徑；使用者上傳的檔案有時只列路徑，**先用 `bash` 看 `/mnt/user-data/uploads/`，不要說沒收到**。
- 教訓（累積）：①檢查換行格式用 Python 讀位元組；②先覆蓋新檔才 commit 時，核對每個交付檔是否在該次 commit；③「讀取時算」的資料先查實際函式定義；④大檔一次只交一個小功能；⑤Bilibili 這類第三方站會封鎖雲端機房 IP，先查 Logs 再決定放棄；⑥SQL Editor 整批執行後段出錯時前段也可能回滾，缺擴充套件（如 pg_cron）要先確認已開啟，**SQL Editor 沒有登入身分，`is_admin()` 會失敗，管理者函式要拆「內部核心＋管理者包裝」才能測**；⑦`Select-String -Path` 不能直接遞迴，要 `Get-ChildItem src -Recurse -Include *.tsx | Select-String ...`，**終端機會把長行切斷，判斷以檔案內容為準**，PowerShell 顯示中文註解亂碼只是編碼顯示；⑧深色覆蓋寫死色碼前要先看實際 DOM／樣式；⑨`position: sticky` 加向上 `box-shadow` 會蓋住上方文字；⑩一次回覆塞太多檔案容易中途用完額度，交付後請他貼 `git status`；⑪改「刪除路徑」類函式時，回頭檢查呼叫端（如 `gameCleanup.ts`）有沒有涵蓋新類型；⑫文件沒記載的程式呼叫要標［待確認］，先 `Select-String` 查來歷；⑬「換掉 N 行」要把緊接的舊行一併列出（實例 TS2451 重複宣告）；⑭驗證指令跑出「還在」時先確認檔案已存檔；驗證指令要同時涵蓋「新增的」與「該刪掉的」；⑮AI 的第五節分析不含 `｜` 格式，貼進「貼上 AI 回覆」會匯入 0 筆，所以匯出文字結尾附【輸出要求】；⑯新資料表要同步 `privacy.html`、刪帳號函式與垃圾桶清理，SQL 欄位假設先查 `information_schema.columns`；⑰驗證寫入類功能：結果沒變不等於成功，要實際觸發一次，SQL 檔重跑前先確認不會「constraint already exists」；⑱使用者說「畫面太亂」時優先合併入口；⑲文件裡的外部上限數字（如 Supabase 額度）標［未驗證］，要用時再查官方頁並標日期；⑳專案裡的 `.md` 副本可能是舊版，改 `生成後.md` 前先看副本的更新次數與日期，對不上以使用者貼的 `git log` 為準；㉑試跑新流程時先看輸出是不是真的能被下一步吃進去；㉒同一詞重搜會吃前端 `cache`，測搜尋要先 F5。

## 7. 技術提醒與陷阱（去重）
1. plpgsql 函式建立成功不代表能執行；欄位名稱先查 `information_schema.columns`；`player_profiles` 主鍵是 `id`；搜尋失敗排查＝F12 Console／Network Response。
2. `search_rulebook_chunks` 已改過十次（**現行 v10**：`(p_bgg_name, p_query, p_alt default null)`，檔案 `BoardGameSQL/search_rulebook_chunks_v10.sql`），改前先匯出線上定義；回傳型別或參數變了先 `drop function if exists` 再 `create`，並重新 `revoke`／`grant`。**同義詞展開走 `p_alt`，改 `p_alt` 用法要回頭看 `zhSynonyms.ts`。**
3. 新增以 `bgg_name` 為鍵的表要同步垃圾桶清理（`cleanupGameData`）、通則（RLS、`revoke`、anon 無權限）、刪帳號 `admin_delete_member`、`privacy.html`。`favorite_games`：垃圾桶已納入（第 9 步）、`user_id` 外鍵 `on delete cascade`；`privacy.html` 是否涵蓋仍待查。
4. 新增待審類型要同步 `admin_pending_count()`、`PENDING_CHANGED_EVENT`、`privacy.html`；統計函式要排除 `reference_only`。
5. `gathering_games` 對已移除列 insert 會撞主鍵；改 `loyalty_day_status` 不要加 `removed_at is null`。
6. 管理者判斷用 `is_admin()`；新函式用 `is_admin() or is_vip()`。
7. 兩個各自呼叫 `useBackClose` 的視窗同時開關疑似多退歷史；流程設計成一次只開一層；`FullScreenPage` 要讓父層一直掛著用 `open` 控制；同一抽屜切 `view` 時要先關再開（`backPaused`）。
8. 提示氣泡 `createPortal` 到 `document.body`；頂端列不可加 `backdrop-filter`／`transform`／`filter`。
9. `useSession` 只有 `SIGNED_OUT` 才接受 `null`；TS6133 是 build 錯誤。
10. `NotePointsFields` 展開狀態只在掛載時決定，切換資料來源用 `key`。
11. 新增篩選條件要同步 `activeFilterCount`、`clearFilters`、`filteredGames`、`missingDataCount`、`filterStorage.ts`、`App.tsx`；刪 CSS class 前掃 `.tsx`／`.ts` 並搜 `${` 動態拼接。
12. 樣式：`vip.css` 最後載入；選擇器對準實際 DOM；`ra-large.css` 用 `body` 前綴；手機抽屜停在 `--nav-h` 上方；**深色模式的 `dark-theme*.css` 以 `:root[data-theme="dark"]` 開頭並在 `App.tsx` 最後依序 import，新增放進深色範圍的元件要檢查寫死色碼**；`askConfirm`（`src\lib\`）的 `ac-box`／`ac-input`／`ac-cancel` class 是深色規則的錨點。
13. 規則助手／OCR：改 `extractPdfText.ts` 切段後既有文件要重傳；OCR 文字只幫忙找頁；PDF 讀不到字先查字型字典（卓爾金曆 cMap 修法）；`.bat` 用哪個 Python、`ocrmypdf` 就裝在哪個。
14. 本機 OCR：PaddleOCR 在 `.venv-paddle`、轉圖用 `.venv`；Paddle 3.x 用 `predict()` 與 `enable_mkldnn=False`；先 OCR 再壓縮。
15. 把玩家整理資料當規則引用前要標來源；題庫頁碼用被索引那份；詞庫 `en_term` 可存中文；未對應詞清單只記詞不記帳號與完整問題。
16. 雲端 AI／募資：在使用者回覆前不寫程式。
17. 使用者描述「某流程怪怪的」先分清入口與旗標；同流程多入口抽成共用元件。
18. 刪死檔前先 `Select-String` 掃引用。
19. 簡體搜尋前端：`src/lib/toSimplified.ts`、`src/lib/opencc-js.d.ts`、`useRulebookSearch.ts`、`RulebookAssistant.tsx`。
20. 手動加入玩家確認流程前端：`TodayRatingFlow.tsx` 完成畫面呼叫 `confirm_my_attendance`、事件 `boardgame-attendance-confirmed`；`useTodayTask.ts`、`LoyaltyCard.tsx`、`MyList.tsx` 的 `ClubPointsCard` 配合。
21. 前端 `upsert` 會先跑 BEFORE INSERT 觸發器；評分完整會自動標已玩，不可用「次數 0」判斷孤兒已玩；所有新觸發器不得因評分或紀錄變動減少已玩次數。
22. 點數資料來源＝`loyalty_qualified_days`；新增刪除路徑前確認 `bk_loyalty_keep_*` 有涵蓋。
23. `GameCard` 是 `memo`：新增影響顯示的 props 要同步比較函式。
24. 要「從子畫面跳寫作畫面、返回回原視窗」：記回程旗標（`recordReturn`、`fromBoard`、`fromGatherings`），`leaveView` 最前面判斷；留言列表用 `NoteListItem`、`formatNoteTag`。
25. **Edge Function 原始碼放 `supabase/functions/`，不要放 `src\`**（Deno 檔會讓 build 失敗）。
26. 規則助手抽屜內英文 chip：點了立即搜尋；（舊的主畫面 chip 已移除，若日後再加回，只改 `query`、用 `onMouseDown preventDefault` 避免 `onBlur` 清掉結果。）
27. `.rb details.ov-fold` 負 margin 用來縮小玩錯紀錄／詞庫收合列留白，別處的 `details.ov-fold` 若被擠到要限定範圍。
28. **`game_glossary_misses` 主鍵是 (bgg_name, zh_term, kind, source)**；`admin_get_glossary_misses` 等舊函式只看 `glossary_miss`，零結果走 `admin_get_search_misses`／`admin_delete_search_miss`（不分 source 一起刪）；`miss_kind_step1.sql` 不可重跑；匯出函式拆成 `_export_miss_analysis_core`（內部）＋`admin_export_miss_analysis`（管理者）；匯出 SQL 引用了 `game_glossary.confirmed` 與 `note` 欄位（已驗證存在）。
29. 寫入類功能驗證：結果沒變不等於成功，要實際觸發一次（v10 要在網站實際搜尋才會寫入）。
30. 「清掉已解決的零結果」會對零結果詞逐一重搜，仍搜不到的次數可能再加 1。

## 8. 文件維護規則
- 本檔＋`PROJECT_CONTEXT.md` 是完整版；`生成後.md` 是之後修改的輕量暫存與計數。每次 push（使用者回報成功）→ push 次數 +1；滿 2 → 更新 `生成後.md`（更新次數 +1）；更新次數滿 3 → 合併重生兩份主文件並重置。重新產生那次與只動 `.md` 的 push 不計次。
- **最近一次重新產生：2026-11-16（第九次合併版）**；`生成後.md` 已重置，兩個計數歸零（使用者覆蓋新版後生效）。
- 計畫中的拆檔（`生成後.md` 第 4 節）仍為［AI 建議］；第七次合併使用者回「照建議」＝不拆檔；之後是否拆檔尚未決定。
