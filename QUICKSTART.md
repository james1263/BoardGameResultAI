# 玩桌遊｜BoardGame（桌遊規則助手）— 懶人包（給下一個 AI）

> 最後更新：2026-11-16（**第八次合併版**：併入詞庫分頁「未命中分析」整合、英文詞候選核准／退回／驗證／一鍵核准、旭日題庫驗收進度與收尾查證；對照 `未來目標.md` 逐節檢查，**沒有刪掉任何還沒做的待辦**）。程式最新已知：2026-11-16 的詞庫分頁整合與 `console.log` 清除使用者說已 push（commit hash 未貼，用 `git log --oneline -5` 核對［未驗證］）；更早見 git log。
> **分工**：本檔＝現況、待辦摘要、使用者決定、合作規則、陷阱；`PROJECT_CONTEXT.md`＝架構、資料庫、功能規則、規則助手設計；`未來目標.md`＝所有未完成目標總清單；`連帶關係圖.md`＝改 A 影響 B；`畫面改版.md`＝畫面改版決定與現況；`生成後.md`＝本版之後的修改紀錄與計數。**開工前都讀，衝突時以 `生成後.md` 為準。**
> **精簡原則（使用者要求）：縮小文件時，「以前說要做但還沒做」的項目一律不可刪**；只能刪已完成的過程敘述、重複測試清單、舊 commit 流水帳（git log 有）。
> 標記：**［使用者決定］**、**［AI 建議］**（使用者未回「照建議」）、**［未驗證］**。

## 1. 這是什麼
- 公開給朋友瀏覽的桌遊收藏網站（頂端列「玩桌遊」；歡迎視窗、頁尾、標題、隱私權政策用「玩桌遊｜BoardGame」；`bggName`、GitHub 專案名、資料夾 `D:\BoardGameResultAI` 沒改名）。約 106～111 款。長期目標：VIP 能查規則書（RAG：只根據檢索片段、附頁碼）。
- 網址 https://board-game-result-ai.vercel.app/（GitHub `master` → Vercel 自動部署）。React + TypeScript + Vite + Supabase（免費方案，首爾）。
- 本機 `D:\BoardGameResultAI`（Windows、PowerShell、`npm.cmd`）；規則書 PDF 放專案外（`D:\Rulebook`），**絕不 `git add`**。本機 AI 專案 `D:\LocalAI-Lab\02_BoardGame-RAG` **與網站專案分開**。

## 2. 目前狀態（2026-11-15）

### 2.1 git 與工作習慣
- 最近已 push：詞庫分頁未命中分析整合（2026-11-16，含一鍵驗證並核准與 `console.log` 清除；hash 未貼［未驗證］）、搜尋未命中分析與熱搜刪除（SQL 備份 `cf2f031`）、`gameCleanup.ts` 補零結果詞。工作區狀態以使用者貼的 `git status` 為準。
- 家裡電腦 `git stash@{0}`「這台電腦pull前備份」留著，**不要 `git stash pop`**。
- **SQL 檔位置**：2026-11-15 起新 SQL 放專案根目錄 `BoardGameSQL/`（進 repo；使用者決定名稱維持現狀）：`miss_kind_step1.sql`（**不可重跑**）、`miss_kind_step2.sql`、`miss_kind_step3_export.sql`、`search_rulebook_chunks_v10.sql`、`rule_stats_delete.sql`（使用者曾上傳 `miss_kind_step2_1.sql`，是 step2 的重複，不進 repo）。**更早、不在 repo（Supabase 已執行）的 SQL**：`loyalty_adjustments.sql`、`loyalty_earned_days` 與 `bk_loyalty_keep_*`、`test_gathering_cleanup.sql`、`unplay_when_empty`、補日期三函式、`record_gathering_play`、`unplay_game`、`delete_my_ratings`、`cleanup_test_gathering()` 改寫、`get_public_gathering_notes` 加場次欄位、集點明細全連接、`favorites_and_limit50.sql`（本命桌遊＋規則助手 50 次）、匿名玩家（`get_player_stats`／`get_game_people`）、`cleanup_past_planned.sql`（pg_cron，台北 00:10 清過期預計聚會）、`search_rulebook_chunks_v9.sql`、`admin_auto_doc_language.sql`、英文詞候選相關（`admin_get_term_candidates`、`admin_delete_term_candidates`）等；是否也搬進 `BoardGameSQL/` 未決定（［AI 建議］搬進去）。改之前一律請使用者貼線上定義。
- 使用者習慣：先在 `http://localhost:5173/` 測再 push；曾拿 Vercel 舊版當新版，截圖不對先問是 localhost 還是網站；曾回報「沒改到」其實是檔案沒存或放錯資料夾，所以給修改要附 `Select-String` 驗證。**測試多半先跳過（「最後一起測」），不要每次開場追問。**

### 2.2 已完成功能（結論；細節見 PROJECT_CONTEXT 與 `畫面改版.md`）
- **帳號**：只用 Google 登入；歡迎視窗、暱稱與聯絡方式、VIP 升級視窗、聚會連結報到自動升 VIP；內建瀏覽器（LINE／FB／Google App）顯示說明；首次進站且為內建瀏覽器時顯示一次深色提示小卡（`ThemeHint`）。
- **桌遊收藏首頁（探索優先）**：搜尋、篩選、新加入桌遊區（30 天、最多 8 款）、類型膠囊、排序在標題旁、「我的統計 ›」入口、清單檢視改 Windows 詳細資料式表格（3 欄／9 欄不動）。
- **遊戲詳細視窗（GameModal v2）**：大封面頂部、2×2 入口卡片＋底部彈窗（規則連結／背景／擴充／玩錯紀錄，權限同舊）；彈窗內管理者可直接「新增連結／上傳 PDF（依內容猜範圍）／新增玩錯紀錄」，VIP 可投稿連結與玩錯紀錄（`UploadModal`）；評分分頁摘要＋「前往我的評分」（評分彈窗頂部放封面）；討論、紀錄分頁。
- **俱樂部**：首頁功能總覽；名字旁本命桌遊頒獎台（三款，登入者看得到）；我的統計；我的評分；我的心得（遊戲管理＋發表紀錄）；我的聚會（卡片：日期＋場次、當天遊戲封面、出席者小標籤；右上「寫心得 ›」；只列自己有評分的遊戲，管理者列全部）；留言板（管理者）；我的投稿（VIP）；集點卡（非 VIP）。
- **集點／免費券／聚會**：免費券 v2、四顆調整按鈕、點數保留（`loyalty_earned_days`）、測試場規則、手動加入玩家確認流程、報到流程與獎勵視窗、聚會後心得詢問卡、預計聚會（過期每日自動清）。
- **統計中心**：遊戲榜（綜合分數榜、搜尋＋最高／最低收進搜尋框）、玩家榜（含「本命桌遊」分頁；隱藏暱稱者仍列入並顯示「匿名玩家」）、規則助手熱搜（**管理者每列有「刪除」鈕：刪關鍵字或整款遊戲統計**）、統計表（全螢幕）、分布圖（手機預設不攔截手勢，「拖曳縮放」開關；點空白收起浮卡）。
- **規則助手**：搜尋優先單頁、繁簡同搜、詞庫與同義詞、搜尋框下方「可能的英文詞」chip（只改搜尋框、不搜尋、不扣次數；通用詞庫 `zhEnGlossary.ts`）、結果排序＝中文規則書優先 → FAQ → 擴充 → 主遊戲 → 玩家整理（只改前端）、**每日 50 次（VIP；管理者不限；找到結果才扣）**、玩錯紀錄、AI 回饋投稿、熱搜。**現行搜尋函式 v10：沒結果時另外記「搜尋零結果」詞。**
- **管理中心**：成員／集點聚會／上傳檔案（PDF｜連結｜玩錯紀錄｜詞庫四分頁，搜尋列置頂；PDF 上傳依檔名＋內容猜範圍；連結顯示影片標題；YouTube 自動帶標題、Bilibili 只能手填〔Bilibili 封 Supabase IP，已結案〕；詞庫可「貼上 AI 回覆」匯入；未命中分析整合在詞庫分頁，見下）／資料匯入；待審紅點。
- **搜尋未命中分析（2026-11-15 完成、2026-11-16 整合進詞庫分頁）**：`game_glossary_misses` 分 `glossary_miss` 與 `search_zero_result`，標來源 `user`／`admin`；90 天自動刪（在搜尋函式內）；不存完整問題與帳號；`privacy.html` 已涵蓋。**畫面（`GlossaryMisses.tsx`，管理中心「上傳檔案→詞庫」）［使用者決定］**：整塊預設收起，標題「未命中分析（待處理 N・候選 M）」，展開後兩子分頁＝未命中的詞｜英文詞候選；說明收進 ⓘ；「找不到英文」與「零結果」合併成一份清單（每列標類別與次數、不顯示玩家／管理員數；清空鈕仍兩顆）；**只留「匯出給 AI 分析」一條路**（快速「複製清單／下載 .txt」、每列「複製給我的 AI」、`AskModal`、`AI_PROMPT` 全部移除）：選遊戲→複製給 AI 分析→把 AI 最後輸出的清單貼進上方「＋」的「貼上 AI 回覆」；匯出文字結尾由前端附【輸出要求】（`exportFooter(game)`：每行 `遊戲名｜中文詞｜對應詞`、只放 A／B 類、略過泛用詞與沒把握的詞）；資料庫第五節分析任務未動、不需重跑 SQL。「全部詞庫」（`src\components\GlossaryAdmin.tsx`）改 `<details class="ov-fold">` 預設摺疊（有搜尋字或「只看待確認」時展開）；未命中分析已移到 `GlossaryAdmin` 之前（搜尋列屬 `GlossaryAdmin`，所以「全部詞庫」不是整頁最底，要完全置底得拆成兩個元件［未決定］）；新樣式檔 `glossary-tabs.css`。
- **英文詞候選（管理者端已完成，2026-11-16）**：表 `rule_term_candidates`（`id, bgg_name, zh_term, en_term, pick_count, status, first_at, last_at`，無 `user_id`；RLS 已開、無政策）。玩家端 `report_term_pick`（`reportPicks`，點過英文詞 chip 且搜尋有結果時呼叫，只回報內建 `zhEnGlossary.ts` 的組合＝使用統計，不是新詞發現）。管理者端（`GlossaryMisses`「英文詞候選」子分頁）：`admin_get_term_candidates()` 回 `id uuid, bgg_name, zh_term, en_term, pick_count, status, last_at`；`admin_set_term_candidate_status(p_id uuid, p_status)`（pending／approved／rejected）；`admin_save_glossary(p_id, p_bgg_name, p_zh, p_en, p_note, p_confirmed)`（`p_id` null＝新增，同組詞已存在只更新備註）。**核准＝先寫詞庫（已確認）、成功才標 `approved`；退回只標 `rejected`；「驗證」鈕用管理者身分以英文詞搜該遊戲規則書，顯示含該詞的段數（0 段＝不建議核准）；核准前有確認視窗；「一鍵驗證並核准」（`approveAllVerified`）只核准規則書找得到英文詞者，其餘跳過留在清單，完成後 `showNotice` 報核准／跳過／失敗數。** 提醒：規則書找得到英文詞不保證中文意思對得上（「背叛→betray」），仍建議人工看過。`admin_delete_term_candidates` 在垃圾桶第 8 步；`privacy.html` 第 72 行已涵蓋。`RulebookAssistant.tsx` 兩行除錯 `console.log` 使用者說已做完並 push［是否真的已刪未驗證，可 `Select-String console.log` 查］。
- **垃圾桶清理（`gameCleanup.ts` 現行 5.5 + 9 步）**：規則書 PDF、擴充、背景、詞庫、未對應詞（`glossary_miss`）、**搜尋零結果詞（5.5，已補）**、玩錯紀錄、熱搜統計、英文詞候選、本命桌遊。不動玩家的想玩／已玩、評分、心得、遊玩紀錄、聚會。
- **深色模式**：玩家選單「外觀」三選項（深色／淺色／跟隨系統），`index.html` 的 `var DEF` 為 `'dark'`；`dark-theme*.css`（`:root[data-theme="dark"]`）覆蓋，舊 CSS 不動；仍可能有漏網（見 2.4）。
- **其他**：擴充、遊戲背景、評論按讚、留言統一表單 `NoteForm`、`privacy.html`（隨新功能更新）。

### 2.3 尚未確認／待實測（使用者說以後再測，**不要主動追問**；完整清單見 `未來目標.md` 第 1 節）
登入流程是否還跳 Google 選帳號頁、獎勵視窗三種、`get_game_play_history` 排除測試場 SQL、卓爾金曆 cMap 重傳、`3c11ca6`／`32869ae`／`878956a`／`87b3ff5` 的語言判斷、點券保留實測、畫面改版各頁（375／390／430、淺色與深色、四種身分）、英文詞 chip、`ThemeHint` 實機測試、彈窗內上傳／投稿（返回鍵只退一層）、我的聚會手機排版、本命桌遊設定視窗與玩家榜「隱藏管理者」、**搜尋未命中分析網站實測（v10 要真的搜尋才會寫入零結果詞）與 `gameCleanup` 5.5 步（不要拿真遊戲測，進垃圾桶會連規則書一起刪；等哪天要移除不重要的遊戲時順便看有沒有紅字警告）**。已回報通過：手機返回鍵（我的聚會寫心得、我的心得、補日期寫心得都只退一層）、本命桌遊鍵盤不擋儲存鈕、熱搜刪除。

- **新增待實測／待決定（2026-11-16）**：①「要不要寫這天的心得？」確認視窗（`PlaySessions.tsx` 第 47 行 `askConfirm`；`dark-theme-all.css` 第 3676 行有 `.ac-box` 深色規則）深色實測［未驗證，使用者昨天截圖在覆蓋 lib 之前］；②首頁卡片深色補漏使用者決定先跳過，**不要主動追問**，提起時請他截圖；③「我的投稿」搜尋欄深色白底：`my-submissions-dark.css` 已有 `.ra-search`／`.ra-game-list` 規則，使用者說暫時沒問題、遇到再說。
- **題庫驗收進度（旭日第 1 題「福祿壽可被殺」，2026-11-16）**：搜尋「福祿壽」「Fukurokuju」「被殺」都是 0 段；原因＝**使用者從來沒上傳過 FAQ 2.0**（不是搜尋壞、也不是檔案被刪）。`game_documents`（Rising Sun）目前：繁中規則書（zh／main／28 頁）、`Rising_Sun_Setup_Summary_compressed`（en／player_notes／1 頁）、`RisingSun_v1.2_compressed`（en／player_notes／6 頁）、兩份波蘭文擴充、兩筆連結（未索引，正常）。「殺／kill」的英文依據在 v1.2 第 4 頁已搜得到（`seppuku`、`kill`），但「福祿壽／Fukurokuju」只會在 FAQ 2.0 出現。**待辦：使用者找到 FAQ 2.0 PDF 上傳（旭日戰魂錄、範圍 FAQ、語言英文），上傳後搜 `Fukurokuju` 確認有結果，再繼續題庫第 2～6 題。**
- **英文詞 chip 使用者困惑［未決定，等使用者選］**：使用者問「要不要勾這些英文提示詞」。結論：不用勾（搜尋函式本來就用資料庫詞庫自動對應，chip 只是選填加成；畫面上的「✓」與「尚未搜尋，不扣次數」讓人誤以為是必要步驟）。［AI 建議］①文字改成「選填：加入英文詞也能搜到英文規則書」，不提扣次數；②chip 預設收進「縮小搜尋範圍」，主畫面只留搜尋框（AI 傾向②）。改動在 `RulebookAssistant.tsx`（`.ra2-sug`、`hasChinese`、`toggleSuggestion`）與 `ra-v2.css`，動手前先請使用者上傳目前版本。
- **已查證不需修改（2026-11-16）**：①「我的聚會」垃圾桶遊戲：`get_my_gatherings`／`get_gathering_detail` 不過濾 `removed_at`，`MyGatherings.tsx` 的 `isTrashed()` 已處理（顯示封面與名稱、標「已從收藏移除」、不可點開、無心得入口），使用者決定維持現狀；②詳細視窗「前往我的評分」實測直接開評分彈窗；③預計聚會頁文字已清理；④`cron.job` 有 `cleanup-past-planned`（`10 16 * * *`）；`admin_delete_favorite_games`、`admin_delete_rule_keyword`、`admin_delete_rule_stats` 三函式存在；`privacy.html` 已涵蓋英文詞建議、本命桌遊、匿名玩家、搜尋零結果詞。

### 2.4 已知限制
- `gathering_games` 資料庫層不擋「僅供參考」四款（只在前端過濾）；管理者看不到「我的評分」入口（CSV 換算）；評分「完整」狀態前端判斷。
- 點數原為讀取時算，現由 `loyalty_earned_days` 保留已得的日子；獎勵視窗用前後快照比對。
- 規則助手：英文全文檢索對德文／波蘭文未驗證；中文子字串比對；簡繁用字差異不一定轉得準；詞庫中文同義詞不自動轉簡體。
- 手動加入玩家確認流程只針對聚會當天，事後沒有補走入口。
- 深色漏網：首頁卡片檔（`card-compact.css`、`card-row.css`、`explore-home.css` 新加入卡無圖底色）；評分圓點、`PostGatheringNotes`、其他少數彈窗；統計表／分布圖已處理但未全面實測；「要不要寫這天的心得？」確認視窗是否仍淺色［未驗證］。
- `loyalty_grants` 空表仍被 `loyalty_totals`／`settle_vouchers` 引用，保留。
- 匯出給 AI 分析：資料庫不會中翻英，候選段落只比對中文詞、詞庫英文詞或英文詞；簡體規則書可能漏，所以才附整份原文附錄。

## 3. 開工前先問
1. 在哪台電腦；`git pull`、`git status`、`git log --oneline -8`（最上面要有 `(HEAD -> master, origin/master)`）。
2. 上次產生文件後 push 了幾次（核對 `生成後.md`）。
3. **不要主動追問**：2.3 的測試、本機 AI 計畫 A／B／C、B2 心得留言九項、旭日 Paddle 抽查等。

## 4. 待辦摘要（完整、含狀態標記見 `未來目標.md`；一次一批，上一批測完才進下一批）
- **立刻（第八次合併後）**：①核對 `git log --oneline -5` 與 `npm.cmd run build`；②六份 `.md` 覆蓋專案根目錄與 claude.ai 專案檔案副本後 commit（使用者要求時才做，不計 push）；③旭日 FAQ 2.0 找到後上傳（見 2.3）。
- **已決定、未動工／待使用者選**：①英文詞 chip 改選填文字或收進縮小搜尋範圍（見 2.3，等使用者選）；②「全部詞庫」要不要拆元件完全置底［未決定］；③首頁卡片深色補漏（使用者先跳過）；④上傳規則書依內容猜範圍的一致性待實測；⑤「要不要寫這天的心得？」深色實測；⑥「我的投稿」搜尋欄白底暫不處理。**已作廢**：`AI_PROMPT` 五類版與 `gm-hint` 文字統一（快速版已移除）。**已完成**：「我的聚會」垃圾桶遊戲、「前往我的評分」、預計聚會文字清理、英文詞候選核准／退回／驗證／一鍵核准、`console.log`。
- **規則助手／RAG**：其他桌遊詞庫（靠未對應詞清單與「匯出給 AI 分析」慢慢累積）；Context Pack；embedding 評估；網站內雲端 AI（使用者尚未回答付費版與自動開啟 vs 管理者確認）；題庫與驗收（旭日 6 題、羅倫佐 4 題、第三款未決定）；其他待做（更新版本按鈕、章節標題、OCR 標示、最切題排序、規則衝突優先序未實作）。
- **規則書與本機 OCR**：規則書 80+ 份分批上傳（先不要催）；`RA_compressed` 掃描型需本機 OCR；抽查字是否通順；`LocalAI.md` 補「新增中文規則書怎麼做」；本機桌遊 AI 之後再說。
- **募資與商業化、長期願景**：見 `未來目標.md` 第 5、6 節；在使用者回覆「付費版」「自動開啟 vs 確認」之前不要寫捐款或 Edge Function 程式。
- **畫面／導覽**：導覽列改版（最後做）；殘留舊 CSS 再掃描（`vip.css` 手機版舊規則、`.mylist-drawer` 疊層）；站上拖曳調整排名＋匯出 CSV 給 Notion（晚點）。
- **俱樂部與聚會擴充（未決定）**：俱樂部統計（最愛類型、常玩人數、每月趨勢）、近期想玩標記、揪團與聚會規劃、VIP 朋友名單 UI、VIP 鎖定 SQL、PWA、推薦牆。
- **資料設計（未決定）**：評分修改歷史、廢除 `play_count`、單場評分、概覽評分顯示、所有紀錄公開評分、聚會心得「只有參與者可見」、補建過去聚會、聚會設定頁拆頁。
- **文件拆檔**：`生成後.md` 第 4 節的拆檔計畫仍為［AI 建議］；**使用者 2026-11-15 回「照建議」＝第七次合併不拆檔**；是否之後拆檔尚未決定。
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
- **搜尋未命中分析（2026-11-15）**：`glossary_miss` 與 `search_zero_result` 分開記並標來源 `user`／`admin`；匯出要含英文候選詞原文段落（前後各一段，附檔名與頁碼，找不到寫「沒有找到可提供的相關原文」），附錄預設上限 60,000 字；沿用「貼上 AI 回覆」匯入；AI 建議一律人工確認；90 天自動刪（在 `search_rulebook_chunks` 內，不是 pg_cron）；零結果詞中文長度上限維持 30 字；**暫不做**最相關排序、品質儀表板、有幫助／沒幫助、整套「搜尋品質中心」；「中文規則書優先」排序不變；不重建、不覆蓋既有功能，先查線上資料庫。；**2026-11-16 追加**：畫面太亂→只留「匯出給 AI 分析」一條路（移除快速複製清單與每列「複製給我的 AI」）、兩類未命中合併一份清單且只顯示次數、整塊預設收起、「全部詞庫」預設摺疊、英文詞候選核准前先「驗證」（規則書搜得到英文詞才建議核准）；使用者說畫面太亂時優先合併入口，不再加分頁
- **熱搜統計管理者可手動刪除**（關鍵字／整款遊戲）；一般 VIP 看不到刪除鈕。
- 文件語言與範圍存在每份文件；玩家整理與玩錯紀錄必須標來源、不與官方規則同等；「感覺是對的」標【未驗證】；問擴充但沒有擴充文件要老實說。
- 結果排序＝**中文規則書優先 → FAQ → 擴充 → 主遊戲 → 玩家整理**（2026-11-14 保留中文優先）。
- 熱搜／FAQ 階段 3 不做；不採 ChatGPT 六張表；不做「完整問題自動公開」「匿名識別碼去重」。
- 垃圾桶「只留封面」；CSV 匯入超過 5 款要輸入「移除」。
- **上傳連結三處順序一致：網址 → 影片標題 → 遊戲**（我的投稿、管理中心、詳細視窗彈窗；彈窗內遊戲已固定）。
- **畫面改版**：一次一頁、只改樣式與排列；管理中心不美化；**深色改為手動切換（預設深色）**，取代舊決定「跟隨系統、只限 GameModal」；詳見 `畫面改版.md`。
- **SQL 備份**：新 SQL 放 `BoardGameSQL/`，名稱維持現狀。
- **已作廢**：「管理員點開下面的項目也要跳上傳視窗」（使用者說忘記就算了）。

## 6. 與使用者合作的規則
- 使用者是**程式初學者**，繁體中文；會照步驟執行，可一次給 4～8 步；回「好」＝完成（回「好」時若前面有多個選項，要先確認他選哪個）；在免費額度下工作，**聊天室容易中斷、額度中途用完**，接手時**先問實際狀態**；他的訊息可能被截斷（也可能只是亂碼，不確定就問）。
- 影響資料、隱私的設計：先提方案並列「建議預設值」，等他回「照建議」再動工。他一次傳多張截圖時整理成一批修改。
- **交付方式**：小檔案由 AI 直接交完整檔；**文件（.md）直接產生檔案給他**；大檔案（`App.tsx`、`MyList.tsx`、`LoyaltyAdmin.tsx`）以他上傳的目前版本為底，唯一錨點取代、保留 CRLF（`GameCard.tsx`、`fetchBoardGames.ts`、`ScatterChart.tsx`、`stats-chart.css` 是 LF）；小修改可給「找這句、換成這句」讓他手動貼（避開換行格式問題）；**交付檔路徑寫完整含放哪一層**（`src\AdminPanel.tsx`、`src\MyList.tsx`、`src\LoyaltyAdmin.tsx`、`src\GameDocuments.tsx`、`src\PlayerPanel.tsx` 在 `src\` 不是 `components\`；`gameCleanup.ts`、`askConfirm.tsx` 在 `src\lib\`），請他貼 `git status` 核對；覆蓋後 `Select-String` 驗證、`(Get-Item 檔).Length` 確認不是空檔。
- **AI 不能 commit／push**，給指令請他貼；逐檔 `git add`、不要 `git add .`；commit 用中文；不要用 TortoiseGit Amend；用 `git log --oneline -3` 看有 `(HEAD -> master, origin/master)` 才算 push 成功。不要 add：`新增 文字文件.txt`、`trash-step/`、`App.css.bak`、`.zip`、`boardgames.csv`、`client_secret_*.json`、`.vs/`、重複檔（如 `club-leaderboard_1.css`、`GlossaryAdmin_1.tsx`、`miss_kind_step2_1.sql`）。
- **AI 不能執行 `npm run build`**：TS 錯誤（含 TS6133 未使用變數）要他跑 `npm.cmd run build` 貼回；**交付含「拿掉東西」的修改要自查有沒有留下未使用變數**。改資料庫函式前請他匯出線上定義；一次一段 SQL、標清楚貼在 Supabase SQL Editor；驗證查詢要設計成「存在時一定有列」；指令放程式碼框；占位符要寫出實際值。
- 他會貼 ChatGPT 的建議與示意圖（**假資料**），要對照既有決定、標 `[不影響功能]`／`[改變入口位置]`／`[需要新功能或新資料]`。**不要把 CSS 交給別的工具壓縮。**
- 容器被限流時不憑記憶寫檔；使用者上傳的檔案有時只列路徑，**先用 `bash` 看 `/mnt/user-data/uploads/`，不要說沒收到**。
- 教訓：①檢查換行格式用 Python 讀位元組；②先覆蓋新檔才 commit 時，核對每個交付檔是否在該次 commit；③「讀取時算」的資料先查實際函式定義；④大檔一次只交一個小功能；⑤Bilibili 這類第三方站會封鎖雲端機房 IP，先查 Logs 再決定放棄；⑥SQL Editor 整批執行遇到缺擴充套件（如 pg_cron）要先確認已開啟，**SQL Editor 沒有登入身分，`is_admin()` 會失敗，管理者函式要拆「內部核心＋管理者包裝」才能測**；⑦`Select-String -Path` 不能直接遞迴資料夾，要 `Get-ChildItem src -Recurse -Include *.tsx | Select-String ...`，且**終端機會把長行切斷，判斷以檔案內容為準**；⑧深色覆蓋寫死色碼前要先看實際 DOM／樣式，沒有範圍 class 的元件要另外處理；⑨`position: sticky` 加向上 `box-shadow` 會蓋住上方文字；⑩一次回覆塞太多檔案容易中途用完額度，交付後請他貼 `git status`；⑪改「刪除路徑」類函式（只動某一 kind）時，回頭檢查呼叫端（如 `gameCleanup.ts`）有沒有跟著涵蓋；⑫文件沒記載的程式呼叫（如 `admin_delete_term_candidates`）要標［待確認］，不要假設功能不存在或已完成，先 `Select-String` 查來歷。；⑬「換掉 N 行」要把緊接的舊行一併列出（2026-11-16 實例 TS2451 重複宣告）；⑭驗證指令跑出「還在」時先確認檔案已存檔；⑮AI 的第五節分析不含 `｜` 格式，貼進「貼上 AI 回覆」會匯入 0 筆，所以匯出文字結尾附【輸出要求】。

## 7. 技術提醒與陷阱（去重）
1. plpgsql 函式建立成功不代表能執行；欄位名稱先查 `information_schema.columns`；`player_profiles` 主鍵是 `id`；搜尋失敗排查＝F12 Console／Network Response。
2. `search_rulebook_chunks` 已改過十次（**現行 v10**：`(p_bgg_name, p_query, p_alt default null)`，檔案 `BoardGameSQL/search_rulebook_chunks_v10.sql`），改前先匯出線上定義；回傳型別或參數變了先 `drop function if exists` 再 `create`，並重新 `revoke`／`grant`。
3. 新增以 `bgg_name` 為鍵的表要同步垃圾桶清理（`cleanupGameData`）、通則（RLS、`revoke`、anon 無權限）、刪帳號 `admin_delete_member`、`privacy.html`。本命桌遊表 `favorite_games`：垃圾桶已納入（第 9 步）、`user_id` 外鍵 `on delete cascade`（刪帳號自動連動）；`privacy.html` 是否涵蓋仍待查。英文詞候選表已查證（見 2.2）。
4. 新增待審類型要同步 `admin_pending_count()`、`PENDING_CHANGED_EVENT`、`privacy.html`；統計函式要排除 `reference_only`。
5. `gathering_games` 對已移除列 insert 會撞主鍵；改 `loyalty_day_status` 不要加 `removed_at is null`。
6. 管理者判斷用 `is_admin()`；新函式用 `is_admin() or is_vip()`。
7. 兩個各自呼叫 `useBackClose` 的視窗同時開關疑似多退歷史；流程設計成一次只開一層；`FullScreenPage` 要讓父層一直掛著用 `open` 控制；同一抽屜切 `view` 時要先關再開（`backPaused`）。
8. 提示氣泡 `createPortal` 到 `document.body`；頂端列不可加 `backdrop-filter`／`transform`／`filter`。
9. `useSession` 只有 `SIGNED_OUT` 才接受 `null`；TS6133 是 build 錯誤。
10. `NotePointsFields` 展開狀態只在掛載時決定，切換資料來源用 `key`。
11. 新增篩選條件要同步 `activeFilterCount`、`clearFilters`、`filteredGames`、`missingDataCount`、`filterStorage.ts`、`App.tsx`；刪 CSS class 前掃 `.tsx`／`.ts` 並搜 `${` 動態拼接。
12. 樣式：`vip.css` 最後載入；選擇器對準實際 DOM；`ra-large.css` 用 `body` 前綴；手機抽屜停在 `--nav-h` 上方；**深色模式的 `dark-theme*.css` 以 `:root[data-theme="dark"]` 開頭並在 `App.tsx` 最後依序 import，新增放進深色範圍的元件要檢查寫死色碼**；`askConfirm`（`src\lib\`）的 `ac-box`／`ac-input`／`ac-cancel` class 是深色規則的錨點，不要再在 `components\` 放一份。
13. 規則助手／OCR：改 `extractPdfText.ts` 切段後既有文件要重傳；OCR 文字只幫忙找頁；PDF 讀不到字先查字型字典（卓爾金曆 cMap 修法）；`.bat` 用哪個 Python、`ocrmypdf` 就裝在哪個。
14. 本機 OCR：PaddleOCR 在 `.venv-paddle`、轉圖用 `.venv`；Paddle 3.x 用 `predict()` 與 `enable_mkldnn=False`；先 OCR 再壓縮。
15. 把玩家整理資料當規則引用前要標來源；題庫頁碼用被索引那份；詞庫 `en_term` 可存中文；未對應詞清單只記詞不記帳號與完整問題。
16. 雲端 AI／募資：在使用者回覆前不寫程式。
17. 使用者描述「某流程怪怪的」先分清入口與旗標；同流程多入口抽成共用元件。
18. 刪死檔前先 `Select-String` 掃引用。
19. 簡體搜尋前端：`src/lib/toSimplified.ts`、`src/lib/opencc-js.d.ts`（在 `src\lib\`）、`useRulebookSearch.ts`、`RulebookAssistant.tsx`。
20. 手動加入玩家確認流程前端：`TodayRatingFlow.tsx` 完成畫面呼叫 `confirm_my_attendance`、事件 `boardgame-attendance-confirmed`；`useTodayTask.ts`、`LoyaltyCard.tsx`、`MyList.tsx` 的 `ClubPointsCard` 配合。
21. 前端 `upsert` 會先跑 BEFORE INSERT 觸發器；評分完整會自動標已玩，不可用「次數 0」判斷孤兒已玩；所有新觸發器不得因評分或紀錄變動減少已玩次數。
22. 點數資料來源＝`loyalty_qualified_days`；新增刪除路徑前確認 `bk_loyalty_keep_*` 有涵蓋。
23. `GameCard` 是 `memo`：新增影響顯示的 props 要同步比較函式。
24. 要「從子畫面跳寫作畫面、返回回原視窗」：記回程旗標（`recordReturn`、`fromBoard`、`fromGatherings`），`leaveView` 最前面判斷；留言列表用 `NoteListItem`、`formatNoteTag`。
25. **Edge Function 原始碼放 `supabase/functions/`，不要放 `src\`**（Deno 檔會讓 build 失敗）。
26. 規則助手搜尋框 chip：只改 `query`，用 `onMouseDown preventDefault` 避免 `onBlur` 清掉結果。
27. `.rb details.ov-fold` 負 margin 用來縮小玩錯紀錄／詞庫收合列留白，別處的 `details.ov-fold` 若被擠到要限定範圍。
28. **`game_glossary_misses` 主鍵是 (bgg_name, zh_term, kind, source)**；`admin_get_glossary_misses` 等舊函式只看 `glossary_miss`，零結果走 `admin_get_search_misses`／`admin_delete_search_miss`（不分 source 一起刪）；`miss_kind_step1.sql` 不可重跑；匯出函式拆成 `_export_miss_analysis_core`（內部）＋`admin_export_miss_analysis`（管理者）；匯出 SQL 引用了 `game_glossary.confirmed` 與 `note` 欄位（`coalesce(g.confirmed, true)`），**所以詞庫「AI 建議／人工確認」欄位很可能已存在［由 SQL 推得，未查線上］**。
29. 寫入類功能驗證：結果沒變不等於成功，要實際觸發一次（v10 要在網站實際搜尋才會寫入）；SQL 檔重跑前先確認不會「constraint already exists」。

## 8. 文件維護規則
- 本檔＋`PROJECT_CONTEXT.md` 是完整版；`生成後.md` 是之後修改的輕量暫存與計數。每次 push（使用者回報成功）→ push 次數 +1；滿 2 → 更新 `生成後.md`（更新次數 +1）；更新次數滿 3 → 合併重生兩份主文件並重置。重新產生那次與只動 `.md` 的 push 不計次。
- **最近一次重新產生：2026-11-16（第八次合併版）**；`生成後.md` 已重置，兩個計數歸零（使用者覆蓋新版後生效）。
- 計畫中的拆檔（`生成後.md` 第 4 節）仍為［AI 建議］；第七次合併使用者回「照建議」＝不拆檔；之後是否拆檔尚未決定。
