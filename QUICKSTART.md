# 玩桌遊｜BoardGame（桌遊規則助手）— 懶人包（給下一個 AI）

> 最後更新：2026-11-19（第十二次合併版：併入 11/18 晚～11/19 的修改——快速複習擴到 21 款、bggName 清單、官方刊物優先原則）。已逐節對照 `未來目標.md` 與上一版，沒有刪掉任何還沒做的待辦。
> 程式基準（使用者 2026-11-19 貼的 git log）：`564fca7`（HEAD、origin/master、origin/HEAD 同步）。已 commit：庫斯科、天際礦脈（`b9a48bb`）、太空議會（`3869b9e`）、奧丁的盛宴與蓋亞計畫更新（`304f556`）。其餘見 2.1 的未 commit 清單。
> 分工：本檔＝現況、待辦摘要、使用者決定、合作規則、陷阱；`PROJECT_CONTEXT.md`＝架構、資料庫、功能規則、規則助手設計、快速複習與 FAQ 資料；`未來目標.md`＝所有未完成目標總清單；`連帶關係圖.md`＝改 A 影響 B；`畫面改版.md`＝畫面改版決定；`bggName清單.md`＝資料庫實際遊戲名稱；`生成後.md`＝本版之後的修改紀錄與計數。開工前都讀，衝突時以 `生成後.md` 為準。
> 精簡原則（使用者要求）：縮小文件時，「以前說要做但還沒做」的項目一律不可刪；只能刪已完成的過程敘述、重複測試清單、舊 commit 流水帳。交接文件要短，重點與「剩下要改的程式」分開寫。
> 標記：〔使用者決定〕、〔AI 建議〕（使用者未回「照建議」）、〔未驗證〕。

## 1. 這是什麼
- 公開給朋友瀏覽的桌遊收藏網站（頂端列「玩桌遊」；歡迎視窗、頁尾、標題、隱私權政策用「玩桌遊｜BoardGame」；`bggName`、GitHub 專案名、資料夾 `D:\BoardGameResultAI` 沒改名）。約 106～111 款。長期目標：VIP 能查規則書（RAG：只根據檢索片段、附頁碼）；長期也要做成 APP（第 4 節）。
- 網址 https://board-game-result-ai.vercel.app/（GitHub `master` → Vercel 自動部署）。React + TypeScript + Vite + Supabase（免費方案，首爾）。
- 本機 `D:\BoardGameResultAI`（Windows、PowerShell、`npm.cmd`）；規則書 PDF 放專案外，絕不 `git add`。本機 AI 專案 `D:\LocalAI-Lab\02_BoardGame-RAG` 與網站專案分開。

## 2. 目前狀態（2026-11-19）

### 2.1 git 與工作習慣
- 已 push：`564fca7` 更新生成後.md、`3869b9e` 太空議會、`304f556` 奧丁的盛宴與蓋亞計畫更新、`a8f51ec` 更新生成後.md、`b9a48bb` 庫斯科與天際礦脈。
- 尚未 commit（使用者 2026-11-19 的 `git status`）：
  - modified：`PROJECT_CONTEXT.md`、`生成後.md`、`src/components/GameFaq.tsx`、`src/lib/faqSearch.ts`、`src/data/faq/unofficialRegistry.ts`、`src/data/faq/unofficial/darwinsJourneyFaq.ts`、`src/data/quickReview/index.ts`、`carnegie.ts`、`darwinsJourney.ts`、`shackletonBase.ts`。`darwinsJourney.ts`、`darwinsJourneyFaq.ts` 的修改來源本聊天室不清楚（可能是別的聊天室）〔未驗證〕，commit 前先 `git --no-pager diff` 看內容。
  - untracked（新檔）：`bggName清單.md`；`src/data/quickReview/` 的 `lorenzo.ts`、`nippon.ts`、`tiletum.ts`、`pulsar2849.ts`、`siderealConfluence.ts`、`deadReckoning.ts`、`alchemists.ts`；`src/data/faq/` 的 `tiletumFaq.ts`、`pulsar2849Faq.ts`、`alchemistsFaq.ts`；`src/data/faq/unofficial/` 的 `nipponUnofficial.ts`、`alchemistsUnofficial.ts`。
  - build 是否通過尚未回報。`index.ts` 等已 import 這些新檔，所以 commit 前一定先 `npm.cmd run build`，通過後逐檔 `git add`。
- 不要 `git add`：`kanbanEv.ts`（別聊天室未完成時）與 `快速上手個個聊天室現況.txt`（備忘，目前也是 modified）。家裡電腦 `git stash@{0}`「這台電腦pull前備份」留著，不要 `git stash pop`。
- SQL 檔位置：2026-11-15 起放專案根目錄 `BoardGameSQL/`（進 repo）：`miss_kind_step1.sql`（不可重跑）、`miss_kind_step2.sql`、`miss_kind_step3_export.sql`、`search_rulebook_chunks_v10.sql`、`rule_stats_delete.sql`、`admin_database_size.sql`。`board_games.new_override` 的 SQL（`alter table ... add column if not exists new_override boolean;`，可重跑）尚未存檔，建議 `BoardGameSQL/new_override.sql`。更早的 SQL 是否搬進去未決定（〔AI 建議〕搬）。改之前一律請使用者貼線上定義。
- 使用者習慣：先在 `http://localhost:5173/` 測再 push；截圖不對先問是 localhost 還是網站；曾回報「沒改到」其實是檔案沒存或放錯資料夾，所以給修改要附 `Select-String` 驗證。測試多半先跳過（「最後一起測」），不要每次開場追問。
- 多聊天室分工：快速複習＋FAQ 在不同聊天室同時做（看版EV、奧丁的盛宴、煉金術士由別的聊天室做），都會改 `index.ts`（有 FAQ 時還有 `faqSearch.ts`、`GameFaq.tsx`／`unofficialRegistry.ts`）：只加自己那一行，不整檔覆蓋。使用者貼來的 `生成後.md`、`未來目標.md` 可能被別的聊天室改過：合併前先 diff，在他的版本上增補。

### 2.2 已完成功能（結論；細節見 PROJECT_CONTEXT 與 `畫面改版.md`）
- 帳號：只用 Google 登入；歡迎視窗、暱稱與聯絡方式、VIP 升級視窗、聚會連結報到自動升 VIP；內建瀏覽器（LINE／FB／Google App）顯示說明與一次性深色提示（`ThemeHint`）。
- 左上角與首頁入口〔使用者決定 2026-11-17〕：左上角＝🎲「玩桌遊」回首頁；首頁 hero 圖例列「🎰 挑三款」開拉霸機視窗；首頁沒有「我的統計 ›」，我的統計從俱樂部進。導覽列改版時要一起規劃挑三款入口位置。
- 桌遊收藏首頁：搜尋、篩選、新加入桌遊區（`NewArrivals`：30 天、最多 8 款）、類型膠囊、排序、清單檢視為詳細資料表格。NEW 標籤管理者可手動管理：`board_games.new_override`（null＝30 天自動、true＝強制 NEW、false＝強制不顯示）；`NewTagAdmin.tsx` 暫放頁尾；匯入 CSV 不覆蓋該欄位。
- 挑三款（MVP 完成）：`TodayPicker`；打開即出 3 款、拉桿重抽；「我想要…」篩選（人數、時間、類型〔派對／陣營／策略〕、難度〔預設收起〕）；固定深色配色；規則在 `src\lib\todayPick.ts`〔AI 建議，可調〕；沒有新資料表、函式、localStorage 鍵（`privacy.html` 是否補一句〔未驗證〕）。待做：手機窄版排版、拉桿手感、「大家都沒玩過」「有人想玩卻一直沒開成」「幫我們抽一款」。
- 遊戲詳細視窗（GameModal v2）：分頁概覽｜規則｜評分｜討論｜紀錄；概覽有 2×2 入口卡片＋底部彈窗；「規則」分頁有規則連結與影片、開桌前快速複習、「FAQ．玩錯紀錄．AI回饋．BGG討論」入口（BGG 討論預設收起，`gqa-fold`）；「僅供參考」遊戲也有規則分頁。彈窗內管理者可新增連結／上傳 PDF／玩錯紀錄，VIP 可投稿。
- 開桌前快速複習（21 款已做，格式已定〔使用者決定〕）：重點卡片、全部靠左、較少用內容預設收起；資料格式 `sections`（`fold: true`）；內容使用者核對後才發布；中文用詞自譯就標【待核對】；入口由 `getQuickReview(game.bggName)` 決定。已 push：旭日、卓爾金曆、帕米爾和平、蓋亞計畫、大西部開拓者：阿根廷、卡內基（舊版）、月球南極基地、達爾文之旅、伯明翰、奧丁的盛宴、庫斯科、天際礦脈、太空議會。已放進本機但未 commit：羅倫佐、日本財閥、提雷圖姆、脈衝星 2849、恆星匯流、冥海航跡，以及卡內基更新、月球南極基地小修。別聊天室做、狀態不在本聊天室核對：看版EV、奧丁的盛宴、煉金術士（`alchemists.ts`、`alchemistsFaq.ts`、`alchemistsUnofficial.ts`）。各款範圍規則：單人模式一律不收；擴充一般要收；從重度遊戲做起。各款待核對項目見 PROJECT_CONTEXT 5.2。
- 官方 FAQ 與「BGG 討論・非官方 FAQ」：官方 FAQ 所有人看得到，玩錯紀錄・AI 回饋只有 VIP／管理者；用詞以中文規則書為主。官方 FAQ 檔：旭日、蓋亞計畫 12 則、伯明翰 16 則、提雷圖姆 9 則、脈衝星 3 則（出處未確認）、煉金術士（別聊天室）；非官方 FAQ（單一類型〔使用者決定〕）：月球南極基地 19、卓爾金曆 2、帕米爾和平 6、達爾文之旅 11、伯明翰 6、日本財閥約 31、煉金術士（別聊天室）、奧丁的盛宴（別聊天室）。規則助手搜尋同時查官方＋非官方（純前端、不扣次數）。
- 全站字型〔使用者決定〕：不要新細明體；`fonts.css` 必須是 `App.tsx` 最後一個樣式 import。
- 俱樂部：功能總覽、本命桌遊頒獎台、我的統計、我的評分、我的心得、我的聚會、留言板（管理者）、我的投稿（VIP）、集點卡（非 VIP）。
- 集點／免費券／聚會：免費券 v2、四顆調整按鈕、點數保留（`loyalty_earned_days`）、測試場規則、手動加入玩家確認流程、報到流程與獎勵視窗、聚會後心得詢問卡、預計聚會（過期每日自動清）。
- 統計中心：遊戲榜、玩家榜（含本命桌遊；隱藏暱稱者顯示「匿名玩家」）、規則助手熱搜（管理者可刪）、統計表、分布圖。
- 規則助手：搜尋優先單頁、繁簡同搜、詞庫、前端通用同義詞表（`zhSynonyms.ts`）、結果排序＝中文規則書 → FAQ → 擴充 → 主遊戲 → 玩家整理、VIP 每日 50 次（管理者不限；找到結果才扣）、玩錯紀錄、AI 回饋投稿、官方＋非官方 FAQ；現行搜尋函式 v10；規則助手只用主搜尋欄〔使用者決定 2026-11-18〕。英文詞 chip（選 ②）：主畫面拿掉，只留抽屜內。
- 管理中心：成員／集點聚會／上傳檔案（PDF｜連結｜玩錯紀錄｜詞庫四分頁）／資料匯入；待審紅點；資源用量一行顯示（Supabase Free：500 MB 資料庫、1 GB 檔案、單檔 50 MB、閒置一週暫停；約 431 MB 檔案、296 份 PDF、25 MB 資料庫）。匯入頁：CSV 有、但在垃圾桶的遊戲，匯入後自動移回收藏（`removed_reason` 欄位為假設〔未驗證〕）。
- 搜尋未命中分析：`game_glossary_misses` 分 `glossary_miss`／`search_zero_result`、標來源 user／admin、90 天自動刪；`GlossaryMisses.tsx` 只留「匯出給 AI 分析」一條路（附錄上限 60,000／120,000／200,000）；英文詞候選管理者端已完成。使用者仍需手動刪「的效果不同」「頁碼還沒找到」兩個測試殘留詞。
- 垃圾桶清理（`gameCleanup.ts` 5.5＋9 步）、深色模式（玩家選單「外觀」三選項，預設深色）、導覽列（使用者說已有初步改版、尚缺什麼未定）。其他：擴充、遊戲背景、評論按讚、留言統一表單 `NoteForm`、`privacy.html`。

### 2.3 尚未確認／待實測（使用者說以後再測，不要主動追問；完整清單見 `未來目標.md` 第 1 節）
- 最近新增（皆未實測）：①批次 A（規則助手選月球南極基地只剩一個搜尋欄、搜「太陽能板」有【非官方】命中；詳細視窗規則分頁入口與 BGG 討論收合列；拿不重要的遊戲測匯入自動移回，若 `removed_reason` 假設錯會出紅字）；②NEW 標籤（強制 NEW／強制移除／自動、F5 仍在、非管理者看不到管理區）；③各款快速複習（VIP／管理者帳號：規則分頁有「⚡ 開桌前快速複習」、頂端草稿小字、靠左、深色無白底、收起區塊可展開）與 FAQ 區塊（有登記的款才出現）；④規則助手搜「結盟」「召喚」「神廟」「綁架」「地區」；全站字型撐歪處；首頁「🎰 挑三款」手機窄版；左上角回首頁。
- 新款上線後加測：羅倫佐（收起區塊多，展開後靠左、深色、手機不橫向捲動；搜「領袖」「梵諦岡」「議會特權」「逐出教會」）；日本財閥（快速複習與 BGG 討論收合列；搜「併購」「本地市場」「恩賜標記」「元老」有【非官方】命中）；庫斯科（搜「大學」「交換」「海螺號角」「神廟」「頭飾」）。
- 更早：登入流程是否還跳 Google 選帳號頁、獎勵視窗三種、`get_game_play_history` 排除測試場 SQL、卓爾金曆 cMap 重傳、語言判斷、點券保留實測、畫面改版各頁（375／390／430、淺色與深色、四種身分）、`ThemeHint` 實機、彈窗內上傳／投稿返回鍵只退一層、我的聚會手機排版、本命桌遊設定視窗、搜尋未命中分析網站實測與 `gameCleanup` 5.5 步（不要拿真遊戲測）、上傳規則書依內容猜範圍的一致性。已回報通過：手機返回鍵、本命桌遊鍵盤不擋儲存鈕、熱搜刪除、資源用量顯示。
- 其他：「要不要寫這天的心得？」確認視窗（`PlaySessions.tsx` 第 47 行）深色實測；首頁卡片深色補漏先跳過（提起時請他截圖）；「我的投稿」搜尋欄白底暫不處理。
- 題庫驗收（旭日；FAQ 2.0 已索引；AI 依內容判斷）：題 1、2、4、6 通過；題 3 有依據但要兩份文件拼（下凡＝波蘭文 Kami Unbound 第 1～3 頁，翻譯為 AI 自譯〔未驗證〕）；題 5 文件沒寫能招募，當作「找不到依據要明說」測試。羅倫佐 4 題（第③題「議會大廳」段落與第④題問哪種點數未釐清）、第三款遊戲尚未動。
- 已查證不需修改（2026-11-16）：「我的聚會」垃圾桶遊戲（`isTrashed()`）；「前往我的評分」；預計聚會頁文字；`cleanup-past-planned` 排程（`10 16 * * *`）；三個刪除函式存在；`privacy.html` 已涵蓋英文詞建議、本命桌遊、匿名玩家、搜尋零結果詞。

### 2.4 已知限制
- `gathering_games` 資料庫層不擋「僅供參考」四款（只在前端過濾）；管理者看不到「我的評分」入口；評分「完整」狀態前端判斷。
- 手動加入玩家確認流程只針對聚會當天，事後沒有補走入口。
- 規則助手：英文全文檢索對德文／波蘭文未驗證；中文子字串比對；簡繁用字差異不一定轉得準；詞庫中文同義詞不自動轉簡體；2 字同義詞權重低。
- 深色漏網：首頁卡片檔（`card-compact.css`、`card-row.css`、`explore-home.css` 新加入卡無圖底色 `#e8eddf`）；評分圓點、`PostGatheringNotes`、其他少數彈窗；`.gfaq*`、快速複習樣式〔未驗證〕。
- `loyalty_grants` 空表仍被 `loyalty_totals`／`settle_vouchers` 引用，保留。
- 匯出給 AI 分析：資料庫不會中翻英，候選段落只比對中文詞、詞庫英文詞或英文詞；簡體規則書可能漏。

## 3. 開工前先問
1. 在哪台電腦；`git pull`、`git status`、`git log --oneline -8`（最上面要有 `(HEAD -> master, origin/master)`）。
2. 上次產生文件後 push 了幾次（核對 `生成後.md`；第十二次合併後兩個計數歸零）。
3. 不要主動追問：2.3 的測試、本機 AI 計畫 A／B／C、心得留言九項、旭日 Paddle 抽查等。

## 4. 待辦摘要（完整、含狀態標記見 `未來目標.md`；一次一批）
- 立刻：
  - 把 2.1 的未 commit 檔案 build、驗證後 commit（見 `生成後.md` 3.1 的指令順序）。
  - 本批三份 .md 與 `bggName清單.md` 覆蓋專案根目錄與 claude.ai 專案檔案副本後 commit（使用者要求時才做，不計 push）。
  - `連帶關係圖.md` 尚待補（使用者要求時給「找這句、換成這句」）：`QuickReview.tsx`（吃 `bggName`）、`src\data\quickReview\index.ts` 與各款資料檔、`unofficialRegistry.ts`、`faq\unofficial\*.ts`、`types.ts`（`FaqItem.src`、`FaqSource`、`GameFaqData.sources`）、`GameFaq.tsx` 的 `kind`、`faqSearch.ts` 合併官方＋非官方、`GameModal.tsx`／`RulebookPage.tsx` 的非官方 FAQ 區塊、`game-faq-cards.css`、`board_games.new_override`、`NewTagAdmin.tsx`、`NewArrivals.tsx` 的 `newOverride`；並註明官方 FAQ 要登記兩處（`GameFaq.tsx`、`faqSearch.ts`），非官方只登記 `unofficialRegistry.ts` 一處。
  - `未來目標.md` 13.2 快速複習那行改成 21 款已做（先 diff 再改）；`未來目標.md` 與本檔的 `Rising Sun` 條件已改成「已登記快速複習的遊戲」。
  - `BoardGameSQL/new_override.sql` 存檔；`privacy.html` 是否為挑三款與 NEW 標籤補一句〔未驗證〕。
- 使用者 11/18 要求、尚未全做：①`GameQa.tsx`（詳細視窗上半的 FAQ／玩錯紀錄區塊，AI 沒看過，請使用者上傳）要加收合與類型標籤，與批次 A 格式統一；②`RulebookAssistant.tsx` 結果框若有自己的篩選／標籤可能還要微調；③NEW 標籤管理要不要搬進匯入頁（需 `AdminPanel.tsx` 匯入區塊）。
- 快速複習／FAQ 下一步：
  - 下一款由使用者選。候選（名稱照 `bggName清單.md`）：`Kemet: Blood and Sand`、`Wallenstein Big Box`、`Keyflower`、`Underwater Cities`、`Clans of Caledonia`、`Viticulture Essential Edition`、`Dune: Imperium – Uprising`、`Hansa Teutonica: Big Box`、`Sekigahara: The Unification of Japan`、`Praga Caput Regni`、`Rurik: Second Edition`、`Luna Maris`、`Ayar: Children of the Sun`、`The White Castle`、`Cascadia` 等。煉金術士、看版EV、奧丁的盛宴由別聊天室負責，請使用者回報狀態。
  - 各款待核對項目、各款詞庫是否已貼入〔未驗證〕：見 PROJECT_CONTEXT 5.2。
  - 其他：「其他有非官方 FAQ 的網站」來源請使用者貼檔案或文字；非官方 FAQ 是否改成 VIP 才能看〔AI 建議／未確認〕；帕米爾和平規則書索引第 7 頁亂碼是否修〔未決定〕；「新手上手小遊戲」位置已預留未做；玩錯紀錄與 AI 回饋逐則標類型（先確認 `Errata.kind`）；`search_game_errata` 若搜不到明明存在的紀錄要貼函式線上定義。
- 詞庫待確認（使用者 11/19 問過）：同一組（遊戲＋中文詞＋對應詞）重貼不會新增列；同一中文詞配不同英文詞算新的一列。畫面「全部詞庫（1000）」剛好整數，可能是查詢上限而非真實總數〔未驗證〕，要確認請在 SQL Editor 跑 `select count(*) from game_glossary;`；「全部詞庫」展開卻顯示「沒有符合的詞。」，請使用者回報是搜尋框殘字還是載入問題〔未驗證〕。貼上 AI 回覆單次上限 300 行；含「／」的兩種寫法要拆成兩行各貼一個。
- 下一步順序〔使用者 2026-11-16 回「照建議」〕：快速複習（持續）→ 導覽列改版（請使用者傳手機與電腦版導覽列截圖；挑三款入口位置一起規劃）→ 網站做成 APP（PWA 先）。另有〔未決定，11/18 提出〕用 Claude 外接外面的繪圖／設計工具改良畫面（`未來目標.md` 7.4），建議與導覽列改版一起規劃。
- 產品路線圖（`未來目標.md` 第 13 節，全是〔AI 建議〕，使用者尚未回「照建議」整體排序）：定位＝全方位桌遊平台（使用者選 A〔未驗證，請確認〕）。Phase 1 改善現有體驗；Phase 2 回訪理由（挑三款已完成、快速複習 21 款已做、個人化推薦）；Phase 3 單款互動教學概念驗證；Phase 4 社群與智慧化。待使用者回答（13.7）：第一款互動教學測試遊戲（候選璀璨寶石等，需先確認在收藏內、有完整繁中規則書、核心行動好視覺化）、是否把未來目標拆成四張清單、是否確認定位 A、外接設計工具的方向。VIP 是聚會報到自動升級、不是付費制，續費率類 KPI 不適用。
- 〔已決定要做，尚未排順序〕把網站開發成 APP〔AI 建議，未驗證〕：①PWA（`manifest`、`service worker`、圖示；零費用、不用上架；建議先做）；②Capacitor 外殼包成 Android／iOS（Google Play 一次性費用、Apple 開發者每年費用，動工前再查官方頁）；③原生重寫（不建議）。要先決定：上不上架商店、Google 登入在 app 內做法、推播需求、`privacy.html` 同步。導覽列改版完成後再做較妥。動工前先列建議預設值，等「照建議」。
- 同義詞後續（〔AI 建議〕，未動工）：②遊戲專屬同義詞走詞庫；③`pg_trgm`；④embedding／`pgvector`；⑤自行訓練 ML／DL（AI 不建議現在做）；雲端 AI 擴詞排最後；通用同義詞表要擴充時只收驗證過的對應。
- 已決定、未動工／待使用者選：「全部詞庫」要不要拆元件完全置底〔未決定〕；首頁卡片深色補漏（先跳過）；上傳規則書依內容猜範圍的一致性待實測；「我的投稿」搜尋欄白底暫不處理。
- 規則助手／RAG：其他桌遊詞庫（靠未對應詞清單與「匯出給 AI 分析」慢慢累積）；Context Pack；embedding 評估；網站內雲端 AI（使用者尚未回答付費版與自動開啟 vs 管理者確認）；題庫（羅倫佐 4 題、第三款未決定；`Rathulhu_rules_v1_2.pdf` 要不要上傳使用者尚未回覆）；其他（更新版本按鈕、章節標題、OCR 標示、最切題排序、規則衝突優先序未實作）。
- 規則書與本機 OCR：驗證搜尋仍待測（天際礦脈搜「股份」、Decrypto 搜「攔截」、兩個亂碼檔名 PDF 各搜一詞）；`RA_compressed` 掃描型需本機 OCR；抽查字是否通順；`LocalAI.md` 補「新增中文規則書怎麼做」；本機桌遊 AI 之後再說。
- 募資與商業化、長期願景：見 `未來目標.md` 第 5、6 節；在使用者回覆「付費版」「自動開啟 vs 確認」之前不要寫捐款或 Edge Function 程式。
- 畫面／導覽：導覽列改版（最後做）；殘留舊 CSS 再掃描（`vip.css` 手機版舊規則、`.mylist-drawer` 疊層）；站上拖曳調整排名＋匯出 CSV 給 Notion（晚點）。
- 俱樂部與聚會擴充（未決定）：俱樂部統計、近期想玩標記、揪團與聚會規劃、VIP 朋友名單 UI、VIP 鎖定 SQL、推薦牆。
- 資料設計（未決定）：評分修改歷史、廢除 `play_count`、單場評分、概覽評分顯示、所有紀錄公開評分、聚會心得「只有參與者可見」、補建過去聚會、聚會設定頁拆頁。
- 文件拆檔：`生成後.md` 第 4 節的拆檔計畫仍為〔AI 建議〕；第七次起歷次合併都沒拆，之後是否拆檔未決定。
- 另一個 AI 的提案（動態牆、社群中心等）全部未決定，只當參考。

## 5. 使用者的決定（不要推翻）

身分、隱私、資料
- 只用 Google 登入；不做匿名帳號、Email 登入、現場報到碼；不在網站加「請改用 Safari」提示。
- 層級：訪客→一般登入→VIP→管理者（也算 VIP）。想玩／已玩社群人數只統計 VIP＋管理者；LINE／FB 名字永不給 VIP；評分者名單與每人評分只有管理者；管理者看不到私人心得。
- 隱藏暱稱者：仍列入榜單，一律顯示「匿名玩家」；管理者仍看得到本人；只有管理者與 VIP 看得到榜單。
- 本命桌遊：頒獎台只有登入者看得到；玩家榜「本命桌遊」分頁只有 VIP 與管理者看得到。
- 管理者 CSV 分數算進社群評分；不揭露「綜合分數排名」計算方式；`parseCsv.ts` 欄名與 `bggName` 絕不能動；「(含擴)」只在匯入時從 `name` 去掉。
- 規則書 PDF 不公開、放專案外、不 `git add`；不要叫使用者貼密碼、Secret／service_role key。

聚會與集點
- 三種聚會：預計聚會（預告）／新增聚會（記錄誰到現場並建連結）／歷史聚會；玩家端叫「未來聚會」，導覽列「聚會．留言」。
- 管理者建立聚會預設在名單並免評分；管理者不集點；指定遊戲軟移除不失點；出席不自動算玩過，評分完整自動建當天紀錄；聚會日 ≤ 今天＝已開團。
- 免費券 v2：同月第 2 點變券、月點數歸零、券保留；隔天起可用；有券又有來的人當天用券（用券那天不集點）。
- 已得點數與免費券除管理者自己刪外不得消失（`loyalty_earned_days`）；刪「測試」開頭聚會→該場得的點一起刪；改聚會日期→點跟著搬。
- 集點四顆按鈕：贈送點算當月、湊 2 點變券；扣除點最多扣到當月 0；扣除券最多扣到可用券 0；撤銷會讓已用券不夠則拒絕；數量 1～50。
- 「測試」開頭場次：不替管理者記已玩、評分不標已玩、不補日期紀錄、刪聚會時全刪；正式場次名稱不要以「測試」開頭。
- 管理者手動加入的玩家要跑完評分流程才得點／用券。
- 補日期不增加總次數（總次數＝無日期次數＋日期筆數）；有日期紀錄不能取消已玩；手動日期私人心得存 `game_play_sessions.note`。
- 刪聚會：測試場全刪；正式場日期紀錄刪、點券保留、公開留言搬 `game_notes`（沿用 id）、私人心得搬整體心得、總次數歸 0 才清評分並取消已玩。
- 寫心得一律不讓遊戲變已玩；取消已玩走 `runUnplayFlow`；「我的統計→已玩」沒有「移除」鈕，只用 ＋／−。
- 我的評分與我的心得各有「勾選刪除」；留言（公開）與心得（私人）可互相複製，兩邊有字→「儲存全部」。
- 公開留言標了聚會就顯示場次標籤；兩處留言列表共用 `NoteListItem`、按讚同步。
- 我的聚會：卡片只列自己有評分的遊戲（管理者列全部）、右上「寫心得 ›」直接進寫作畫面、出席者預設顯示（管理者暱稱＋名字、VIP 暱稱）；拿掉「聚會詳情」入口。
- 返回規則：所有 ✕ 與手機返回只回上一層；新視窗只呼叫 `useBackClose(onClose, isOpen)`，不自己 `pushState`；留言板發表→回留言板、遊戲詳細資料跳來→回該遊戲、補日期寫心得→回補日期視窗、評分完按「回到集點卡」→進集點卡、我的聚會寫心得→回我的聚會。

評分、留言、心得
- 評分整體 1～10＋適合留下來 1～5 必填；未滿 5 人顯示「評分累積中」；統計只算已玩。
- 留言一律自願公開、可刪自己的；一人可留多則（≤10）；確認視窗一律用 `askConfirm`；公開心得第一次發布前提醒。
- 評論按讚：只有 VIP＋管理者、不能按自己、每人每則一個、所有人只看數字、名單只有管理者。
- 未玩過只能寫私人心得（管理者例外）；「僅供參考」四款不能想玩／已玩／評分／留言，不進統計。
- 概覽偏好「桌遊圖鑑風＋米白深綠」；遊戲詳細視窗沒有想玩／已玩按鈕，遊玩次數只在俱樂部調整。

規則助手與內容
- 零生成式 AI API 費用為偏好（雲端 AI 排最後）；只給 VIP／管理者；搜尋紀錄不存問題內容與帳號；台北 0 點重置，VIP 50 次／天、管理者不限、找到結果才扣；上傳 PDF 只給檢索；網站內不做 OCR；不做 .txt 上傳；PDF 投稿先不做。
- 同義詞：搜尋時打同義詞也要找得到，且不要靠人工貼 AI 回覆；第一層已完成；同義詞展開視為同一次搜尋，不可多扣次數。
- 英文詞 chip（選 ②）：主畫面拿掉，抽屜內保留；抽屜內點選不補回報候選。
- 搜尋未命中分析：兩種 kind 分開記並標來源；匯出要含英文候選詞原文段落，附錄上限可選（預設 120,000）；沿用「貼上 AI 回覆」；AI 建議一律人工確認；90 天自動刪；零結果詞中文長度上限 30 字；暫不做最相關排序、品質儀表板、有幫助／沒幫助、「搜尋品質中心」；「中文規則書優先」排序不變；不重建、不覆蓋既有功能，先查線上資料庫；畫面太亂→優先合併入口，不再加分頁。
- 管理中心資源用量：兩條合成同一行、不顯示百分比。熱搜統計管理者可手動刪除；一般 VIP 看不到刪除鈕。
- 文件語言與範圍存在每份文件；玩家整理與玩錯紀錄必須標來源、不與官方規則同等；「感覺是對的」標【未驗證】；問擴充但沒有擴充文件要老實說。
- 結果排序＝中文規則書優先 → FAQ → 擴充 → 主遊戲 → 玩家整理；規則助手結果框順序＝規則書 → 官方 FAQ → 玩錯紀錄。
- 官方 FAQ 所有人可看；玩錯紀錄・AI 回饋只有 VIP／管理者；FAQ 用詞以中文規則書為主。
- BGG 討論・非官方 FAQ（2026-11-18）：單一類型、名稱固定；詳細視窗的 FAQ／玩錯紀錄／AI 回饋／BGG 討論要統一格式、可收起、各區有類型標籤；規則助手只用主搜尋欄。BGG 與第三方文字用自己的話摘要並附原連結，不整段貼原文。
- 資料來源優先順序〔使用者 2026-11-19，日本財閥實例〕：官方刊物為主（官方勘誤、官方規則書、官方手冊）＞ 社群（BGG）FAQ。社群 FAQ 只當補充；與官方不同時內文採官方，並在 `src` 與收起區塊註記「FAQ 說法不同、不採用」。官方 FAQ（如旭日 FAQ 2.0）可優先於規則書，社群整理不行。聽到「FAQ 比規則書重要」先確認指哪一種。
- 快速複習格式（重點卡片、靠左、較少用預設收起）已定；內容要使用者核對後才發布；中文用詞自譯就標【待核對】；單人模式不收；擴充一般要收；從重度遊戲開始；FAQ 與快速上手一起整理。
- bggName 不再逐款詢問：照 `bggName清單.md`（使用者 2026-11-19 一次給齊；撇號、冒號、全形引號、括號要完全一致）。
- 熱搜／FAQ 階段 3 不做；不採 ChatGPT 六張表；不做「完整問題自動公開」「匿名識別碼去重」。
- 垃圾桶「只留封面」；CSV 匯入超過 5 款要輸入「移除」；CSV 有、垃圾桶也有的遊戲，匯入後自動移回收藏（2026-11-18）。
- NEW 標籤管理者可手動強制顯示或強制移除（2026-11-18，「照建議」）。
- 上傳連結三處順序一致：網址 → 影片標題 → 遊戲。
- 左上角與首頁入口（2026-11-17，推翻 11/16）：左上角＝🎲「玩桌遊」回首頁；首頁按鈕＝「🎰 挑三款」；首頁不再有「我的統計 ›」。挑三款用固定配色；類型只放派對／陣營／策略並附白話說明；難度預設收起；結果精簡成名稱＋一行資訊＋理由。
- 字型：全站不要新細明體，一律 `fonts.css`（含集點卡）。
- 畫面改版：一次一頁、只改樣式與排列；管理中心不美化；深色改為手動切換（預設深色）；詳見 `畫面改版.md`。
- SQL 備份：新 SQL 放 `BoardGameSQL/`，名稱維持現狀。
- 已作廢：「管理員點開下面的項目也要跳上傳視窗」、`AI_PROMPT` 五類版與 `gm-hint` 文字統一、11/16「左上角＝挑三款」、「非官方 FAQ＋BGG 討論兩個類型與彈窗篩選鈕」（維持單一類型）。

## 6. 與使用者合作的規則
- 使用者是程式初學者，繁體中文；會照步驟執行，可一次給 4～8 步；回「好」＝完成（前面有多個選項時要先確認他選哪個）；在免費額度下工作，聊天室容易中斷、額度中途用完，接手時先問實際狀態；他的訊息可能被截斷或夾亂碼，影響設計的字詞先用一句話確認。
- 格式偏好：純文字、字型一致，不用粗體或顏色強調；交接文件要短，重點與剩下要改的程式分開。
- 影響資料、隱私的設計：先提方案並列「建議預設值」，等他回「照建議」再動工。他一次傳多張截圖時整理成一批修改。
- 交付方式：小檔案由 AI 直接交完整檔；文件（.md）直接產生檔案；大檔案（`App.tsx`、`MyList.tsx`、`LoyaltyAdmin.tsx`）以他上傳的目前版本為底，唯一錨點取代、保留 CRLF（`GameCard.tsx`、`fetchBoardGames.ts`、`ScatterChart.tsx`、`stats-chart.css` 是 LF；CRLF 檔如 `GlossaryMisses.tsx`、`RulebookPage.tsx` 給「找這一行、換成這一行」單行錨點，多行區塊用「在某行前／後插入」）；小修改給「找這句、換成這句」；交付檔路徑寫完整含放哪一層（`AdminPanel.tsx`、`PlayerPanel.tsx`、`MyList.tsx`、`LoyaltyAdmin.tsx`、`GameDocuments.tsx` 在 `src\`；`gameCleanup.ts`、`askConfirm.tsx`、`faqSearch.ts`、`zhSynonyms.ts`、`todayPick.ts` 在 `src\lib\`；`GlossaryAdmin.tsx`、`GlossaryMisses.tsx`、`RulebookBatchUpload.tsx`、`QuickReview.tsx`、`GameFaq.tsx`、`NewTagAdmin.tsx` 在 `src\components\`；`upload-row.css`、`fonts.css`、`quick-review.css`、`game-faq-cards.css`、`new-tag-admin.css` 在 `src\styles\`），先對照 `git status`；覆蓋後 `Select-String` 驗證、`(Get-Item 檔).Length` 確認不是空檔。AI 碰不到使用者電腦資料夾時，用傳檔方式交付並重講 `index.ts` 要加的兩行，不要說「已放進去」。
- AI 不能 commit／push，給指令請他貼；逐檔 `git add`、不要 `git add .`；commit 用中文；不要用 TortoiseGit Amend；用 `git log --oneline -3` 看有 `(HEAD -> master, origin/master)` 才算 push 成功。不要 add：`新增 文字文件.txt`、`trash-step/`、`App.css.bak`、`.zip`、`boardgames.csv`、`client_secret_*.json`、`.vs/`、`快速上手個個聊天室現況.txt`、`kanbanEv.ts`（別聊天室未完成時）、重複檔（`*_1.css`、`*_1.tsx`、`miss_kind_step2_1.sql`、`shackletonBase_1.ts`）。
- AI 不能執行 `npm run build`：TS 錯誤（含 TS6133）要他跑 `npm.cmd run build` 貼回；交付含「拿掉東西」的修改要自查未使用變數。改資料庫函式前請他匯出線上定義；一次一段 SQL；驗證查詢要設計成「存在時一定有列」；指令放程式碼框；占位符要寫出實際值；`git diff` 用 `git --no-pager diff`。
- 他會貼 ChatGPT 的建議與示意圖（假資料），要對照既有決定、標 `[不影響功能]`／`[改變入口位置]`／`[需要新功能或新資料]`。不要把 CSS 交給別的工具壓縮。
- 容器被限流時不憑記憶寫檔：先交不需看格式的東西（詞庫清單、衝突清單），恢復後用 `view` 看已上傳的資料檔（如 `paxPamir.ts`、`risingSun.ts`）確認格式再寫；使用者上傳的檔案有時只列路徑，先用 `bash` 看 `/mnt/user-data/uploads/`，不要說沒收到。
- 教訓（累積，已重編）：
  1. 檢查換行格式用 Python 讀位元組；`git diff --stat` 顯示某檔大量變動時先用 `--ignore-space-at-eol` 判斷是不是換行字元，仍大量增刪就是別聊天室的實質修改，不要 `git add`、刪行比加行多的檔要看內容、不確定就問、不要自己 `git restore`。
  2. 先覆蓋新檔才 commit 時，核對每個交付檔是否在該次 commit；commit 前查已 push 的檔案有沒有 import 未提交的新檔（`git status` 沒有 Untracked 放錯處即可）；使用者重貼的檔案可能是舊版，用 `Select-String` 驗證「新字串存在」，括號要和檔案一致（`［］`與`〔〕`不同），且要同時涵蓋「新增的」與「該刪掉的」。
  3. 「讀取時算」的資料先查實際函式定義；大檔一次只交一個小功能；一次回覆塞太多檔案容易中途用完額度，交付後請他貼 `git status`。
  4. Bilibili 這類第三方站會封鎖雲端機房 IP；SQL Editor 整批執行後段出錯時前段也可能回滾；SQL Editor 沒有登入身分，`is_admin()` 會失敗，管理者函式要拆「內部核心＋管理者包裝」才能測。
  5. `Select-String -Path` 不能直接遞迴，要 `Get-ChildItem src -Recurse -Include *.tsx | Select-String ...`，終端機會把長行切斷，判斷以檔案內容為準。
  6. 深色覆蓋寫死色碼前先看實際 DOM；全站有 `h2`、`label` 等深色字規則，新視窗要用自己的固定配色、所有選擇器帶範圍前綴；`--gm-*` 變數只在 `.game-modal.gm-v2` 內有效，新元件要給 fallback（如 `var(--gm-line, rgba(128,128,128,.35))`）；`position: sticky` 加向上 `box-shadow` 會蓋住上方文字。
  7. 改「刪除路徑」類函式時回頭檢查呼叫端（如 `gameCleanup.ts`）；改「刪掉功能」的檔案後一定要 build；「換掉 N 行」要把緊接的舊行一併列出（TS2451 重複宣告）；給「找這行換成這行」前先數清楚有幾處。
  8. 驗證指令跑出「還在」時先確認檔案已存檔；驗證寫入類功能要實際觸發一次；試跑新流程時先看輸出能不能被下一步吃進去（AI 輸出不含 `｜` 格式會匯入 0 筆，所以匯出結尾附【輸出要求】）。
  9. 新資料表要同步 `privacy.html`、刪帳號函式與垃圾桶清理，SQL 欄位假設先查 `information_schema.columns`；「畫面太亂」時優先合併入口；文件裡的外部上限數字標〔未驗證〕，要用時再查官方頁並標日期。
  10. 專案裡的 `.md` 副本可能是舊版，改 `生成後.md` 前先看副本的更新次數與日期，對不上以使用者貼的 `git log` 為準；使用者貼來的 `生成後.md` 可能被別聊天室改過，先 diff。
  11. 同一詞重搜會吃前端 `cache`，測搜尋要先 F5；規則助手改動要區分搜尋端與顯示端。
  12. 新檔案放錯資料夾會造成 TS2307 連鎖錯誤：交付新檔後請使用者跑 `Get-ChildItem` 確認路徑，build 一次出現大量 `implicitly has an 'any'` 通常只是 import 找不到，先修最前面的 TS2307；全站覆蓋式樣式要確認是 `App.tsx` 最後一個 import。
  13. 規則書內容類功能：
     - 來源與標註：只整理使用者提供的原文；頁碼標來源檔與頁（中文規則書只有截圖無頁碼時，`src` 寫清楚對照哪一份）；中文用詞自譯標【待核對】；從官方推算的數字標「推算」。
     - 玩家整理與社群 FAQ：只用來交叉核對，`src` 標「玩家整理（非官方）」並放進收起區塊，與官方衝突以官方為準並註明；社群 FAQ 自己矛盾或與官方衝突時不照抄，寫進「與官方不同」區塊（日本財閥實例）。
     - 圖片與讀不到的頁：AI 讀 PDF 要先檢查每頁文字是否可讀，亂碼頁請使用者貼截圖；文字層讀不到圖示或數字時，用 `pdftoppm`／`pypdfium2` 轉 PNG 看（頁碼＝書上印刷頁），標「依圖片判讀」；字形相近的字（氣／氦）直接問使用者；圖上數字讀不到就不猜，資料檔頂端註明「需看實物」。
     - 文件之間矛盾：兩種外語規則書或兩份文件數字不一致時都寫出來標【待核對】；找出矛盾本身寫進收起區塊，不挑一邊假裝沒事；顏色／數量矛盾請使用者看實物；標「文件筆誤」前逐份確認是哪份；使用者追問時給份數與頁碼；多版規則書並存時以新版為底、舊版只對照；官方參考文件對同一張卡寫法不同時列出每份版本與新舊，不自己決定哪份較新。
     - 使用者說「中文規則書」先打開確認；商品文案或「AI 整理」數字不當規則來源；簡體字簡介與簡體規則書轉繁要用台灣常用說法並標【簡轉繁待核對】；使用者事後補上更完整的官方規則書時，先逐頁對照舊檔 `src` 頁碼再改用詞，並列出「解決了哪些、還剩哪些」。
     - 範圍：文件沒有的內容不要補（沒有單人或擴充就都不收，並在回覆說明）；範圍很大的款（基本＋多擴充＋領袖卡）把最常翻的流程與計分放最前面且不收起，其餘分段收起。
     - 部落格或心得文章只補「容易被問、檔案沒寫」的一處，不收策略評論；使用者說「手邊沒有卡片，請提醒檢查」＝把待核對寫進檔案頂端與「來源不一致」區塊，並在交付說明再提一次；資料檔寫完用程式數則數，不憑記憶報數字。
  14. 詞庫建議清單：第一欄遊戲名照 `bggName清單.md`；非官方推出的對應要標出請對實物；泛用詞與勉強的對應主動建議不要貼；判斷詞庫對應前先看匯出檔抬頭「遊戲：」（神廟：旭日 Shrine、Kemet Temple）；同款遊戲中文來源用詞不同時，以一份為底本、其餘譯法全進詞庫對應同一英文詞（簡體譯名另收當同義寫法，含「／」的拆兩行）；沒把握的英文詞不列，並說出來。
  15. 交付會動到 `index.ts` 時先看使用者上傳的版本已登記哪些遊戲，只加自己那兩行，提醒「不要整檔覆蓋」並附 `git --no-pager diff` 驗證指令；`searchFaq` 的回傳型別 `FaqHit` 只能加選填欄位；官方與非官方 FAQ 資料檔放不同資料夾、`import` 路徑不同，放檔後用 `Select-String` 確認沒有重複。
  16. 交付「新管理功能」時，若沒看過 `AdminPanel.tsx`，先放頁尾獨立元件；`GameQa.tsx` 這類 AI 沒看過的檔案不要憑空改，先請使用者上傳；SQL 欄位加完用 `information_schema.columns` 驗證。
  17. 各聊天室的設計可能互相矛盾：合併時先查哪一版已 push，兩邊都標出來請使用者決定；使用者上傳的網頁存成 PDF 不一定是完整規則（Boardgame Record 的完整規則是訂閱內容），引用前先確認涵蓋範圍。
  18. 第一次交付就用 `bggName清單.md` 的名稱，不要猜（羅倫佐曾被猜成 `Lorenzo il Magnifico`，實際是 `Lorenzo il Magnifico: Big Box`）。

## 7. 技術提醒與陷阱（去重）
1. plpgsql 函式建立成功不代表能執行；欄位名稱先查 `information_schema.columns`；`player_profiles` 主鍵是 `id`；搜尋失敗排查＝F12 Console／Network Response。
2. `search_rulebook_chunks` 已改過十次（現行 v10：`(p_bgg_name, p_query, p_alt default null)`），改前先匯出線上定義；回傳型別或參數變了先 `drop function if exists` 再 `create`，並重新 `revoke`／`grant`。同義詞展開走 `p_alt`，改 `p_alt` 用法要回頭看 `zhSynonyms.ts`。
3. 新增以 `bgg_name` 為鍵的表要同步垃圾桶清理（`cleanupGameData`）、通則（RLS、`revoke`、anon 無權限）、刪帳號 `admin_delete_member`、`privacy.html`。
4. 新增待審類型要同步 `admin_pending_count()`、`PENDING_CHANGED_EVENT`、`privacy.html`；統計函式要排除 `reference_only`。
5. `gathering_games` 對已移除列 insert 會撞主鍵；改 `loyalty_day_status` 不要加 `removed_at is null`。
6. 管理者判斷用 `is_admin()`；新函式用 `is_admin() or is_vip()`。
7. 兩個各自呼叫 `useBackClose` 的視窗同時開關疑似多退歷史；流程設計成一次只開一層；`FullScreenPage` 要讓父層一直掛著用 `open` 控制；同一抽屜切 `view` 時要先關再開（`backPaused`）。
8. 提示氣泡 `createPortal` 到 `document.body`；頂端列不可加 `backdrop-filter`／`transform`／`filter`。
9. `useSession` 只有 `SIGNED_OUT` 才接受 `null`；TS6133 是 build 錯誤。
10. `NotePointsFields` 展開狀態只在掛載時決定，切換資料來源用 `key`。
11. 新增篩選條件要同步 `activeFilterCount`、`clearFilters`、`filteredGames`、`missingDataCount`、`filterStorage.ts`、`App.tsx`；刪 CSS class 前掃 `.tsx`／`.ts` 並搜 `${` 動態拼接。
12. 樣式：`vip.css` 最後載入（`App.css` 內）；選擇器對準實際 DOM；`ra-large.css` 用 `body` 前綴；手機抽屜停在 `--nav-h` 上方；`dark-theme*.css` 以 `:root[data-theme="dark"]` 開頭並在 `App.tsx` 最後依序 import，`fonts.css` 要是最後一個；`askConfirm` 的 `ac-box`／`ac-input`／`ac-cancel` class 是深色規則的錨點。
13. 規則助手／OCR：改 `extractPdfText.ts` 切段後既有文件要重傳；OCR 文字只幫忙找頁；PDF 讀不到字先查字型字典（卓爾金曆 cMap 修法）；`.bat` 用哪個 Python、`ocrmypdf` 就裝在哪個。
14. 本機 OCR：PaddleOCR 在 `.venv-paddle`、轉圖用 `.venv`；Paddle 3.x 用 `predict()` 與 `enable_mkldnn=False`；先 OCR 再壓縮。
15. 把玩家整理資料當規則引用前要標來源；題庫頁碼用被索引那份；詞庫 `en_term` 可存中文；未對應詞清單只記詞不記帳號與完整問題。
16. 雲端 AI／募資：在使用者回覆前不寫程式。
17. 使用者描述「某流程怪怪的」先分清入口與旗標；同流程多入口抽成共用元件。
18. 刪死檔前先 `Select-String` 掃引用。
19. 簡體搜尋前端：`src/lib/toSimplified.ts`、`src/lib/opencc-js.d.ts`、`useRulebookSearch.ts`、`RulebookAssistant.tsx`。
20. 手動加入玩家確認流程前端：`TodayRatingFlow.tsx` 完成畫面呼叫 `confirm_my_attendance`、事件 `boardgame-attendance-confirmed`；`useTodayTask.ts`、`LoyaltyCard.tsx`、`MyList.tsx` 的 `ClubPointsCard` 配合。
21. 前端 `upsert` 會先跑 BEFORE INSERT 觸發器；評分完整會自動標已玩，不可用「次數 0」判斷孤兒已玩；新觸發器不得因評分或紀錄變動減少已玩次數。
22. 點數資料來源＝`loyalty_qualified_days`；新增刪除路徑前確認 `bk_loyalty_keep_*` 有涵蓋。
23. `GameCard` 是 `memo`：新增影響顯示的 props 要同步比較函式。
24. 「從子畫面跳寫作畫面、返回回原視窗」：記回程旗標（`recordReturn`、`fromBoard`、`fromGatherings`），`leaveView` 最前面判斷；留言列表用 `NoteListItem`、`formatNoteTag`。
25. Edge Function 原始碼放 `supabase/functions/`，不要放 `src\`（Deno 檔會讓 build 失敗）。
26. 規則助手抽屜內英文 chip：點了立即搜尋；若日後再加回主畫面 chip，只改 `query`、用 `onMouseDown preventDefault` 避免 `onBlur` 清掉結果。
27. `.rb details.ov-fold` 負 margin 用來縮小收合列留白，別處的 `details.ov-fold` 若被擠到要限定範圍；規則助手官方 FAQ 區塊用 `<details className="ov-fold er-fold">`。
28. `game_glossary_misses` 主鍵是 (bgg_name, zh_term, kind, source)；舊函式只看 `glossary_miss`，零結果走 `admin_get_search_misses`／`admin_delete_search_miss`（不分 source 一起刪）；`miss_kind_step1.sql` 不可重跑；匯出函式拆成 `_export_miss_analysis_core`（內部）＋`admin_export_miss_analysis`（管理者）。
29. 「清掉已解決的零結果」會對零結果詞逐一重搜，仍搜不到的次數可能再加 1。
30. 官方 FAQ 要在兩處登記（`faqSearch.ts` 的 `FAQ_BY_GAME`、`GameFaq.tsx` 的登記表）；非官方 FAQ 只在 `src\data\faq\unofficialRegistry.ts` 登記一處；FAQ 搜尋純前端，不扣次數。
31. 快速複習資料格式是 `sections`（`fold: true`，項目 `{ label?, text, src }`）；新增別款＝新增資料檔（`import type { ReviewSection } from './risingSun'`）＋在 `index.ts` 的 `REVIEWS` 加一行；`QuickReview.tsx`、`quick-review.css` 一組要一起覆蓋；`bggName` 必填且要與資料庫一致。

## 8. 文件維護規則
- 本檔＋`PROJECT_CONTEXT.md` 是完整版；`生成後.md` 是之後修改的輕量暫存與計數。每次 push（使用者回報成功）→ push 次數 +1；滿 2 → 更新 `生成後.md`（更新次數 +1）；更新次數滿 3 → 合併重生兩份主文件並重置。重新產生那次與只動 `.md` 的 push 不計次；一次 push 帶兩個 commit 只算 1 次。`未來目標.md`、`連帶關係圖.md` 獨立維護，重新產生前先逐節對照 `未來目標.md`。
- 最近一次重新產生：2026-11-19（第十二次合併版），`生成後.md` 已重置，兩個計數歸零。
- 計畫中的拆檔（`生成後.md` 第 4 節）仍為〔AI 建議〕，是否拆檔尚未決定。
