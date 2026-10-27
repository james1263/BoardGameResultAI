# 桌遊規則助手 — 懶人包（給下一個 AI）

> 3 分鐘版。細節請看 `PROJECT_CONTEXT.md`（已依主題整理成 11 節，不再有 A～Q 附錄）。   最後更新：2026-10-27 傍晚（最上方有「2026-10-27 傍晚更新」與「2026-10-27 更新」兩節，優先閱讀；以下主體為 2026-10-26 深夜版）

## 2026-10-27 傍晚更新（最新；與下方任何舊內容衝突時，以本節為準）

### 已交付（使用者 build 成功；是否已 commit／push 請接手時用 `git log`、`git status` 確認）
- **5 個進階篩選（人數、時間上限、難度五級、新遊戲、評分狀態）與「我的俱樂部」摘要卡**已套用並 push（`git status` 乾淨）。摘要卡在 `MyList.tsx`：`ClubHeader`（暱稱、徽章：訪客／一般會員／VIP 會員／管理者、想玩／已玩數字方塊、未登入說明＋Google 登入鈕）、`ClubPoints`（只有「VIP 且非管理者」才會呼叫集點資料）。樣式在 `mylist.css` 的「我的俱樂部」區。
- **免費券 v2（使用者已確認的規則，取代舊的「同月 2 點、管理者兌換」說法）**：
  - 同一個月**第 2 點（4、6…）當下自動變成 1 張券，月點數歸零**（`month_points = 該月計入點數 % 2`；`total_points` 是累計）。
  - **券要拿到的隔天起才能用**（拿到券的當天不能用）。
  - **有券又有來的人，當天一定使用，不能累積**。實作在**資料庫端自動**：只要某個聚會日「達成」（評分完整或免評分）且當時有可用券，`settle_vouchers(p_user)` 自動寫一筆 `loyalty_redemptions`（`used_on` = 該聚會日、`redeemed_by` = null）。**用券那天不集點。** 只處理 **2026-10-27 以後**的聚會日，不回頭改舊紀錄。
  - 觸發時機：觸發器 `settle_vouchers_on_rating`（`game_ratings` insert／update 後）、`settle_vouchers_on_attendee`（`gathering_attendees` insert／update 後，例如設免評分）；另外 `get_my_loyalty_summary`、`admin_get_loyalty_overview` 讀取時也會先補算。觸發器內有 exception 保護，出錯不會擋住評分。
  - **使用者決定：事後修改或刪除評分，不退點數、不退券，已用掉就是用掉。**
  - **評分仍是前提**（評分是統計手段）：流程是報到 → 評分 → 系統自動用券（當天不集點）。**不需要管理者按確認**，管理者在「免費券紀錄」看使用紀錄即可。
  - 玩家端（`LoyaltyCard.tsx`）：評分前顯示「你有 N 張免費券可以用，評分完成後會自動使用」；用掉後顯示「今天已自動使用 1 張免費券」、印章顯示「已用券」；「其中 N 張明天起才能用」；兌換歷史改名「免費券使用紀錄」。**沒有使用視窗**（曾做過 `VoucherUseDialog.tsx` 的「強制按鈕」方案，已作廢並刪除，`use_my_voucher` 函式也已 drop）。
  - 管理者端（`LoyaltyAdmin.tsx`）：三個小分頁「聚會設定／集點狀況／免費券紀錄」。集點狀況改成**一人一張卡片**，排序：可用券多 → 本月點數多 → 總點數多；有「只顯示有點數或有券的人」勾選；「兌換」按鈕改名「補登」（只補登現場已給過的券，`admin_redeem_voucher` 仍是舊版：只檢查累積券、`used_on` 為 null）。免費券紀錄分頁欄位：玩家、用在哪一天、使用時間、來源（系統自動使用／管理者補登）。明細中用券的日子標「🎟 使用免費券（這天不集點）」。樣式在 `loyalty-admin.css` 最底下（`lga-players`、`lga-pcard`、`lga-pill`…）。
- **新增／變更的資料庫物件**：`loyalty_redemptions.used_on date` ＋唯一索引 `(user_id, used_on) where used_on is not null`；`loyalty_point_days(p_user)`（已達成且沒被拿去用券的日子，同月依日期排名，只供內部使用）；`loyalty_totals(p_user)` 改回 4 欄（`total_points, month_points, earned_vouchers, usable_vouchers`；`usable_vouchers` 只算「拿到券的日期 < 今天」）；`get_my_loyalty_summary()` 多回 `usable_vouchers`（`greatest(usable − 已使用, 0)`）並改成 plpgsql（讀取時補算）；`settle_vouchers(uuid)`、`trg_settle_vouchers()`、兩個觸發器；`admin_get_loyalty_overview()` 重建（volatile，先補算）。`loyalty_day_status` **沒有改**（它仍只回「達成」，用券日是否計點由 `loyalty_point_days` 排除）。內部函式都已 `revoke ... from public, anon, authenticated`。
- **兩份 SQL 是否都已在 Supabase 執行（`voucher_migration.sql` 第一批、`voucher_auto.sql` 第二批）：第一批使用者截圖顯示管理者表頭已變成「本月（滿 2 歸零）」，應已執行；第二批（自動用券）未確認。接手先問。** 驗證：`select proname from pg_proc where proname in ('settle_vouchers','loyalty_point_days','use_my_voucher');`（應有前兩個、沒有第三個）；`select tgname from pg_trigger where tgname like 'settle_vouchers%';`（應有 2 個）。
- 前端 `useLoyalty.ts`：`LoyaltySummary` 多 `usableVouchers`；`Redemption` 多 `usedOn`；`loyalty_redemptions` 查詢多選 `used_on`。
- `loyalty-card.css` 底下可能殘留 `.modal-backdrop.voucher-backdrop { z-index: 1400; }`（已用不到，無害，可刪）。

### 重要教訓（本日）
- **使用者曾請 Gemini 把 CSS 縮小（`filter.css`、`modal.css`、`mylist.css`、`vip.css`），AI 建議先不要 commit，使用者已 `git restore` 還原。** 之後不要把 CSS 交給別的工具壓縮／重寫；若要整理 CSS，先實測所有畫面再 commit。
- 管理者資料表現在的「本月」欄是「該月餘數」（0 或 1），不是該月總點數；總點數看「總 N 點」。

### 待辦（接續順序，使用者尚未回「照建議」）
1. **「我的桌遊」抽屜**（`MyList.tsx`、`mylist.css`）：①上方「想玩」「已玩」數字方塊改成分頁按鈕，清單直接顯示在下方，**拿掉重複的兩列入口與「返回」流程**；②空清單才顯示「去逛收藏」；③加**「我的統計」**（玩過幾款、總遊玩次數、約略總時數＝次數×BGG 時間並標「約」、最常玩 TOP 3），AI 偏向在抽屜內點開後出現有「‹ 返回」的畫面（使用者尚未決定展開或獨立頁）；④今天有聚會且未評分時顯示「去評分」卡片；⑤有券時顯示免費券卡片（有券才出現）；⑥`ClubPoints` 提示文字「同月累積 2 點，可換 1 張免費券」要改成新規則（2 點自動變券、點數歸零、隔天起自動使用）。
2. 排行榜空狀態 → 集點卡頁面風格 → 管理者視窗統一風格 → 手機全面檢查。
3. `privacy.html` 補上免費券說明（自動使用紀錄管理者可見）。
4. 規則書 PDF 上傳（私有 bucket）→ AI 規則助手（RAG）。
5. PWA、VIP 朋友名單、推薦牆、拖曳調整排名、VIP 鎖定 SQL（資格要含來過聚會的人）。
6. 仍未驗證：`gathering_plays` 是否已 drop、`capacity` 是否 NOT NULL。

### 本日作廢的舊說明
- 「同月 2 點換 1 張免費券，由管理者按『兌換』」→ 改為自動變券、自動用券（見上）。
- 「玩家按『使用』／管理者按『確認』」的流程 → 作廢（使用者說有看使用紀錄就好，不用確認）。
- 「集點狀況」表格 → 已改成卡片；使用紀錄移到第三個小分頁。
- 「『我的桌遊』抽屜首頁有想玩清單／已玩清單入口列」→ 待改（見待辦 1），目前仍存在。

---

## 2026-10-27 更新（以本節為準；與下方舊內容衝突時，以這裡為準）

### 已完成（使用者回報已 push、已測試觸發器存在）
- **集點卡與「我的桌遊」拆成兩個獨立抽屜**：`MyList.tsx` 新增 `mode: 'list' | 'loyalty'`（`list` 只有想玩／已玩；`loyalty` 只有集點卡）；`App.tsx` 新增 `myListMode`，邀請連結、報到完成、頂端「集點卡」都設為 `loyalty`，「我的桌遊」設為 `list`。`initialTab` 已移除。
- **手機收藏標題列**：標題拿掉（不再顯示 MY COLLECTION／我的桌遊收藏），控制列佔滿整行；排序列手機版上下排列（`library.css` 最底部）。
- **排序「重設」位置固定**：`SortControl.tsx` 的重設按鈕一直存在，預設時加 `is-hidden`（電腦版 `visibility: hidden`、手機版 `display: none`），升冪／降冪不再跑位。
- **新報到規則**：
  - 被列入出席名單的人**自動成為 VIP**（觸發器 `attendee_makes_vip`，掛在 `gathering_attendees` AFTER INSERT；`source='self'` 記為 `checkin`，其餘記為 `admin`）。取消出席不會取消 VIP。
  - **報到流程不再有通關密碼**：Google 登入 → 填暱稱與聯絡方式 → 自動報到 → 評分（至少一款七項評完；以前評過／免評分／沒指定遊戲則略過）→ 集點卡。`CheckInDialog.tsx` 已移除 `VipJoinDialog`、`needVip`。
  - **連結只在聚會當天（台北時間）有效，包含已報到的人**：`join_gathering` 的日期檢查移到最前面（`not_started`／`ended` 先於 `already`）。過期訊息：「這個連結已過期，只在聚會當天有效。如果你已經報到過，請直接按底部的『集點卡』。」已報到的人要看集點卡，直接按底部「集點卡」。
  - `?card=日期` 連結仍支援，介面不提供。
- **手動加入的玩家**：底部「集點卡」出現**紅點**（`lib/useTodayTask.ts`：今天有他的聚會、已指定遊戲、尚未得點才亮；切回網頁會重新讀取）；集點卡最上方出現「今天要做的事」卡片（`lc-today`），按鈕直接開該遊戲的評分分頁。已評過分者直接得點、沒有紅點。不做自動彈出評分。
- **管理者聚會詳情順序改為**：① 指定遊戲 → ② 人數上限 → ③ 手動加入參加者 → ④ 聚會連結。④ 顯示「上限 N 人・手動加入 M 人・自己報到 K 人・連結還可報到 N−(M+K) 人」與「有效至當天 23:59」。建立連結前必須有一款遊戲＋人數上限（含手動加入的人）。
- **舊聚會日（沒指定遊戲）的集點卡說明文字**：今天或未來且尚未得點時，顯示「你已經在這天的出席名單上。管理者還沒指定要評分的遊戲……」，不再顯示看不懂的「到遊戲的『我的桌遊』分頁新增」。

### 作廢的舊說明
- 「報到不再自動升 VIP、非 VIP 要輸入通關密碼」→ **作廢**，報到＝VIP。
- 「已報到的人在聚會結束後再點連結會回 already、仍可打開集點卡」→ **作廢**。
- `MyList` 三分頁（想玩／已玩／集點卡）→ **作廢**，已拆開。
- 「底部導覽 5 顆減為 4 顆、拿掉頂端集點卡」的方案 → **不採用**；維持 4 顆：桌遊收藏、排行榜、集點卡、我的桌遊（管理者的第三顆是「⚙ 管理」）。AI 規則助手做好後再加第 5 顆。
- 「VIP 鎖定 SQL」（restrictive 政策 `"vip only"`）仍未執行，之後的資格要改成「來過聚會的人自動有資格＋輸入密碼的人」，執行前先與使用者討論。

### 風險提醒
- 聚會連結傳進群組後，當天收到的人都能變成 VIP；唯一擋板是「人數上限」與「只有當天有效」，人數上限請照實際人數填。
- 密碼機制（`redeem_vip_code`）保留，給沒參加聚會、但想加入的朋友。

### 使用者決定
- 左上角名稱先保留「桌遊規則助手」，AI 助手做好後再改成整體性名稱。
- 左右滑動切換分頁：等 4～5 個頁面都獨立後再做。
- 右上角改 Email 登入：先不做（寄信額度與費用）。
- 「我的桌遊」之後要加：個人統計（總次數、總時數、最常玩）優先，其次近期／下次聚會想玩、想玩一鍵移到已玩。擁有／收納／借出先不做。

### 待辦（接續順序）
1. 視覺改版：5 個進階篩選（人數、時間上限、難度五級、新遊戲、評分狀態；「只看有封面」要先想怎麼判斷，不行就略過）→ 排行榜空狀態 → 集點卡頁面風格 → 管理者視窗統一風格 → 手機全面檢查。
2. 「我的桌遊」抽屜頂端加摘要卡、未登入說明（見 QUICKSTART 舊方案，但不拿掉集點卡）。
3. 個人統計。
4. 規則書 PDF 上傳（私有 bucket）→ AI 規則助手（RAG）。
5. PWA、VIP 朋友名單、推薦牆、拖曳調整排名。
6. 已確認：`gathering_plays` 是否已 drop、`capacity` 是否 NOT NULL 的驗證結果使用者仍未貼。

### 2026-10-27 下午補充
- **5 個進階篩選已定案（使用者回「照建議」並貼了 `FilterDrawer.tsx`、`libraryTypes.ts`、`filter.css`）**：①「我們有幾個人」：`minPlayers ≤ N ≤ maxPlayers`；②時間「不超過 30／60／90／120 分鐘」；③**難度五級（使用者改，取代三段）：`<1.8`、`1.8～<2.6`、`2.6～<3.2`、`3.2～<3.8`、`≥3.8`**，缺值不屬於任何級；④只看新遊戲（30 天內）；⑤評分狀態「我評過／我還沒評」（登入且評分讀取完成才有意義）。「只看有封面」不做。新增條件要同步 `activeFilterCount`、`clearFilters`、`filteredGames` 的 useMemo 依賴、`missingDataCount`。
- **這批是否已套用未知**：使用者要 AI「直接更新」，但聊天室額度用完前沒看到結果。**接手時先問**：`FilterDrawer.tsx`／`libraryTypes.ts`／`filter.css`／`App.tsx` 是否已改、是否已 push（`git status`、`git log`），不要假設。
- **`privacy.html` 已於 2026-10-27 更新**：日期改為 10 月 27 日；VIP 資格含「被管理者加入出席名單、聚會連結報到會自動成為 VIP」；移除已不存在的「勾選自己玩了哪些遊戲」；集點卡改為依出席與評分計算。需 commit／push 才會上線。
- 提醒：「VIP 鎖定 SQL」尚未執行；做的時候資格要含「來過聚會的人」。


---

## 這是什麼

使用者在做一個**公開給朋友瀏覽的桌遊收藏網站**「桌遊規則助手」，目前有 107 款桌遊，能搜尋、篩選、排序、看封面和評分。最終目標是讓大家能問 **AI 規則助手**，AI 要根據使用者上傳的規則書 PDF 回答，並標明出處與頁碼。

- 線上網址：https://board-game-result-ai.vercel.app/（GitHub `master` 分支 → Vercel 自動部署）
- 技術：React + TypeScript + Vite + **Supabase（資料庫、登入、檔案儲存，免費方案，首爾）**
- 本機路徑：`D:\BoardGameResultAI`（Windows、PowerShell、用 `npm.cmd`）。使用者會在多台電腦作業，路徑可能不同，見 `PROJECT_CONTEXT.md` 第 11 節。
- **程式結構**：`src/App.css` 是入口檔，只有 `@import`，依序載入 `src/styles/`：`base`、`topbar`、`hero`、`library`、`filter`、`cards`、`modal`、`admin`、`mylist`、`footer`、`trash`、`docs`，之後又加了 `backtotop`、`tabs`、`ratings`、`leaderboard`、`loyalty`、`loyalty-card`（集點卡印章風）、`loyalty-admin`（管理者視窗）、`account`（暱稱視窗、邀請橫幅、各視窗層級；**可覆蓋前面的樣式**）、`sitebar`（新頂端導覽列）；另外 `tokens`（設計變數）放在 `App.css` 最前面（**順序有影響，不要調換；實際清單以本機 `App.css` 為準**）。`src/App.tsx` 只留 `Library` 的狀態與篩選／排序邏輯，畫面拆成 `src/components/`：`TopBar`、`ViewToggle`、`FilterDrawer`、`GameCard`、`GameModal`、`MergeDialog`、`PersonalToast`、`TrashSection`、`CoverImage`、`StatusButtons`、`RatingDots`、`RatingSection`、`PlayCounter`、`PlaySessions`、`PersonalNote`、`DescriptionEditor`、`BackToTop`、`Leaderboard`（排行榜）、`CommunityStats`、`LoyaltyCard`（集點卡）、`CheckInDialog`（報到視窗）、`InAppBrowserNotice`（請改用瀏覽器開啟）、`Icons`；型別與工具在 `src/lib/`：`libraryTypes.ts`、`gameFormat.ts`、`fetchBoardGames.ts`、`personalApi.ts`、`useTrashActions.ts`、`usePersonalCollection.ts`、`useGamePlaySessions.ts`、`useGameRatings.ts`、`useGameDocuments.ts`、`useCommunityStats.ts`、`leaderboards.ts`、`useLoyalty.ts`、`saveDescription.ts`、`useIsAdmin.ts`、`useSession.ts`、`useInviteLink.ts`（集點卡邀請連結）、`useCheckinLink.ts`（聚會報到連結）、`googleLogin.ts`（所有 Google 登入入口，偵測 LINE 等內建瀏覽器）、`uploadCover.ts`、`parseCsv.ts`、`supabase.ts`。另有 `AdminPanel.tsx`、`PlayerPanel.tsx`、`MyList.tsx`（畫面上叫「我的桌遊」）、`LoyaltyAdmin.tsx`（管理者「聚會與集點」視窗）、`GameDocuments.tsx`。
- 桌遊資料存在 Supabase 的 `board_games` 資料表；網站讀取失敗時才退回本機 `boardGames.generated.ts`。
- 資料更新流程：Notion 匯出 CSV → 網站頁尾登入管理者 →「匯入 CSV」→ 預覽 →「確認匯入」。

## 使用者是誰、怎麼合作

- **程式初學者**，繁體中文。
- **使用者已明確說過：預設他會照步驟執行，不用每一步都確認；可以一次給最多 4 個步驟（實務上 8 步左右他也照做）；遇到問題他會自己停下來問；他回「好」就代表沒問題、可以繼續。**（舊版「一次只給一個步驟」已作廢。）
- 會影響資料、隱私的設計決策，仍先提方案並列出「建議預設值」，讓他回「照建議」或指定修改，再動工。
- 給法：明確檔案、`Ctrl + F` 搜尋位置、完整程式碼、測試步驟；每批結尾給測試清單與 `git add` 指令。
- **每個指令都要標清楚在哪裡執行**：PowerShell 指令貼 VS Code 終端機；SQL 貼 Supabase SQL Editor。他曾把 PowerShell 指令貼進 SQL Editor 而報錯（2026-10-25）。
- 你**碰不到**他的檔案，也**收不到** CSV。要資訊就給 PowerShell／SQL 指令，請他貼結果或截圖。
- **大改 `App.tsx`、`AdminPanel.tsx`、`PlayerPanel.tsx`、`GameDocuments.tsx` 或 `src/components/` 底下的檔案前，先請他貼目前版本**，不要憑舊版覆蓋。樣式分散在 `src/styles/`，改哪塊先確認在哪個檔案。他曾把程式貼到錯的檔案，給步驟時要寫清楚檔名。
- **他貼來的檔案可能是舊版**（2026-10-24 他貼了舊的整份 `App.css`）。判斷現況前，先用 `git status`、`git log`、`Get-Content ... | Select-Object -First 15` 這類指令確認實際狀態，不要憑貼來的內容就說「已改好」或「還沒改」。
- 改完 `npm.cmd run build` 並實測。不要破壞 107 款資料和現有功能。不要揭露「綜合分數排名」的計算方式。
- **不要叫他貼密碼、Secret／service_role key、Google Client Secret。**
- push 前先 `git status`，**逐檔 `git add`，不要 `git add .`**。**請他用命令列 commit，不要在 TortoiseGit 用 Amend／修改上一次提交**（已發生過一次，見 `PROJECT_CONTEXT.md` 第 2 節）。
- 不要 add 的雜項：`新增 文字文件.txt`、`trash-step/`、`App.css.bak`、其他 `.zip`、解壓殘留資料夾；`PROJECT_CONTEXT.md`、`QUICKSTART.md` 只在使用者要求時才 commit（2026-10-26 他要求過一次）；`boardgames.csv` 若顯示 deleted，不要 commit（`git restore boardgames.csv`）。

## 已完成

- 搜尋、篩選抽屜、類型篩選、缺資料提示、排序、檢視模式切換（清單／4／9）、精簡詳細視窗。
- 資料搬到 Supabase 並已上線；管理者 Email＋密碼登入；網站匯入 CSV（含附封面圖；CSV 沒有的遊戲**移到垃圾桶**）、上傳／更換封面、規則書與 FAQ 外部連結（`game_documents`）。
- **✅ Phase 1｜管理權限與資料安全**：`admin_users` ＋ `is_admin()`；`board_games`、`game_documents`、Storage `covers` 的寫入政策全部只認管理者。**登入不等於管理者。**
- **✅ Phase 2｜玩家 Google 登入與暱稱**：`player_profiles`（暱稱公開、不含 Email）、`src/PlayerPanel.tsx`、`public/privacy.html`。Google OAuth 已發布為正式版、只用基本範圍。
- **✅ Phase 3｜想玩／已玩／備註與雲端同步**：`public.user_game_status`（主鍵 `(user_id, bgg_name)`、`want_to_play`、`played`、`note` ≤500 字、`want_first_at`／`played_first_at` 由觸發器只在第一次勾選時寫入、`play_count` 0～999）。RLS 只允許本人；**刻意不對 `board_games` 加外鍵**。訪客存 `localStorage`，登入後以雲端為準，首次登入有合併視窗。
- **✅ 拆檔（2026-10-23）**、**✅ `App.css` 入口檔（2026-10-24）**。
- **✅ 垃圾桶**：所有人看得到，只有管理者能移入、還原、永久刪除；`removed_at`、`removed_reason`（移入時填原因、可「編輯原因」）。資料庫不改政策。
- **✅ 回到頂端按鈕**（`BackToTop.tsx`）。
- **✅ 遊玩紀錄** `game_play_sessions`：總次數＝`play_count`（沒日期的次數）＋有日期的紀錄筆數。
- **✅ Phase 4 公開評分（資料庫＋前端皆完成）**：整體 1～10（必填）、適合留下來 1～5（必填）、其餘五項選填；未滿 5 人顯示「評分累積中」，門檻在資料庫函式 `get_rating_summaries()` 判斷；個別評分只有本人看得到。
- **✅ 詳細視窗四分頁**（概覽／評分／我的桌遊／規則）、**遊戲簡介**（管理者可編輯，CSV 欄「簡介」選填）、**中文介紹與影片連結**（`doc_type` 加 `intro`、`video`；影片 `ai_indexed` 永遠不可為 true）。
- **✅ 社群統計**（2026-10-25 使用者回報已 commit、push）：`useCommunityStats`，每款顯示想玩／已玩人數與月／季／年期間新增，只回傳彙總。
- **✅ 排行榜**（四個榜：想玩、已玩、整體評分、適合留下來）：2026-10-25 晚使用者上傳的 `TopBar.tsx` 已含「排行榜」按鈕，代表已套用到本機；**commit／push 是否完成、窄螢幕按鈕是否擠在一起尚未確認**（用 `git log --oneline -5` 與 `git status` 查）。
- **✅ 集點卡 v2（2026-10-25～26，已 commit、push）**：管理者頂端「聚會與集點」視窗（兩個分頁：聚會設定／集點狀況）；每個聚會日指定當天遊戲（`gathering_games`）；玩家在集點卡勾「我玩了」（`gathering_plays`）並評分（已被深夜新規則取代），沒有指定遊戲的舊聚會日沿用舊規則；以前評分過的遊戲不用重評；印章風集點卡（`LoyaltyCard.tsx`＋`loyalty-card.css`）。
- **✅ 免評分例外**：`gathering_attendees.exempt`，管理者可對出席者按「免評分」，該天直接算 1 點（`loyalty_day_status` 已改）；只有管理者能 UPDATE（RLS 政策 `admin update attendees`）。
- **✅ 集點卡邀請連結**：管理者在聚會詳情按「🔗 複製集點卡連結」→ `https://網址/?card=日期`；玩家點開後（`useInviteLink.ts`）已登入就自動打開「我的桌遊→集點卡」並標出那一天；未登入頂端出現登入橫幅。**目前只有被管理者列入出席名單的人才看得到那天的紀錄。**
- **✅ 評分過／勾「我玩了」→ 自動標「已玩」**：資料庫觸發器 `mark_played_from_activity()`（掛在 `game_ratings`、`gathering_plays`），已補過舊資料；前端已即時更新（App.tsx effect）。
- **✅ 玩家登出選單**：暱稱 ▾ →「修改暱稱與聯絡方式／登出」；頂端列固定在最上方（管理者的登出在頂端列）。
- **✅ 聯絡方式（LINE／FB 名字）**：獨立資料表 `player_contacts`（只有本人和管理者可讀，anon 無權限，已驗證）；玩家第一次登入或尚未填寫時會跳出設定視窗（必填、可「稍後再說」）；管理者的聚會視窗與集點狀況表會顯示聯絡方式。
- **✅ 管理者聚會視窗**：改成俱樂部風格；出席者以頭像標籤呈現；新增「搜尋玩家」（可用暱稱或 LINE／FB 名字搜尋）。
- **✅ 自助報到（2026-10-26，使用者已測試通過；之後改成「單一聚會連結」，見「進行中」1）**：管理者在聚會詳情按「建立報到連結」→ 開關「開放報到」、人數上限（留空＝不限）已改為必填）、複製 `?join=隨機碼` 連結、重設連結；出席名單標示「自己報到」。玩家點連結→（未登入先登入）→ `CheckInDialog`「我來了」→ 呼叫資料庫函式 `join_gathering(p_token)`（security definer，檢查：登入、token 有效、已報到則回 already、開放中、**台北時間聚會當天**、有暱稱、有聯絡方式、未額滿；鎖住該場聚會防止超額）→ 成功後打開集點卡並標出那一天。資料表 `gathering_checkins`（只有管理者可讀寫，anon 無權限）；`gathering_attendees.source`（admin／self）。管理者手動加入超過上限會先跳確認。前端：`src/lib/useCheckinLink.ts`、`src/components/CheckInDialog.tsx`、`LoyaltyAdmin.tsx`、`App.tsx`。
- **✅ `privacy.html` 已補**：排行榜、集點卡、聯絡方式（聯絡方式那句請確認已 commit）。
- **✅ VIP／管理中心／同日多場／排行榜名單（2026-10-26）**：見 `PROJECT_CONTEXT.md` 第 12 節。管理者導覽只有一顆「⚙ 管理」（成員與 VIP／聚會與集點／資料匯入）；建立連結前必填遊戲與人數上限（LoyaltyAdmin 用 UI 驗證，未呼叫 admin_create_gathering；2026-10-26 查過該函式**不存在**，可忽略）；集點卡改成 1～4 步驟；排行榜可展開名單，並有「📊 統計表」（VIP 看遊戲總表，管理者另有成員×遊戲矩陣與 CSV）。
- **✅ 2026-10-26 深夜（以 git log 為準）**：統計表打開時暫時隱藏排行榜抽屜（避免被蓋住）；統計表矩陣可依玩家、遊戲篩選；管理者可刪除成員帳號（`admin_delete_member`，要輸入暱稱確認，不能刪管理者）；`privacy.html` 已更新（VIP 名單、管理者可見內容、報到、帳號刪除）；回到頂端按鈕在手機避開底部導覽（760px 斷點、64px）；`supabase.ts` 明確設定 `persistSession`／`autoRefreshToken`／`navigator.storage.persist()`；VIP 密碼視窗層級修正（`.vip-join-backdrop` z-index 1300，原本被「我的桌遊」抽屜 1200 蓋住）。

## 進行中（開場先問使用者）

1. **報到流程已改版（2026-10-26 深夜，需實測）**：點連結→Google 登入→填暱稱與聯絡方式→**自動報到**（`CheckInDialog` 開啟即呼叫 `join_gathering`）→**已沒有通關密碼**（報到＝自動成為 VIP，2026-10-27 起）→**評分步驟不可跳過**（至少一款當天指定遊戲七項評完才能前往集點卡；以前評過分、被標免評分、沒有指定遊戲則自動略過）→集點卡。沒有「我玩了」勾選，收到連結並報到＝當天有來。
2. **集點新規則**（`loyalty_day_status` 已改）：出席，且當天指定遊戲**任一款評分完整（七項）**就得 1 點；免評分直接得點；沒指定遊戲的舊聚會日沿用舊規則（用遊玩紀錄日期）。評分可在家補、可修改。
3. **管理者規則**：聚會**一定要先指定至少一款遊戲＋填人數上限**才能建立／複製連結；上限**不可留空**（`gathering_checkins.capacity` 已設 NOT NULL，今天那場補成 6），隨時可改；已有連結的場次至少保留一款遊戲。
4. **已移除 `gathering_plays`（「我玩了」資料表）**：`useLoyalty.ts`、`LoyaltyCard.tsx` 已清掉；資料庫已 `drop table`。`admin_delete_member` 已同步拿掉對它的刪除。
5. **VIP 鎖定 SQL 仍未執行**（見舊說明：6 張表加 `restrictive` 政策 `"vip only"` ＋改 `get_rating_summaries()`），要等朋友都輸入密碼後才做；退路 `drop policy "vip only" on public.表名;`。
- **待辦**：⓪ **（2026-10-26 深夜已確認 git 已 push、三個函式存在、LINE 實測沒問題；以下僅剩兩項驗證結果未收到：`to_regclass('public.gathering_plays')` 是否為 null、`capacity` 是否 NOT NULL）原清單**：新版 `admin_delete_member` 與 `drop table public.gathering_plays cascade` 是否已執行（驗證：`select to_regclass('public.gathering_plays');` 應為 null）；`gathering_checkins.capacity` 的 NOT NULL 是否已設；`useLoyalty.ts`／`LoyaltyCard.tsx` 清理版與 `CheckInDialog` 的 `needVip` 修正是否已 push；用 `james-test` 試刪帳號是否成功。①手機實測（非 LINE 瀏覽器）完整報到流程；LINE 內開連結的行為；同一天兩場的集點卡 ②PWA：`public/manifest.webmanifest`、`icons/icon-192.png`／`icon-512.png`、`index.html` 的 manifest／theme-color／apple-touch-icon 三行**尚未做（缺圖示）** ③VIP 朋友名單畫面（函式 `get_vip_friends` 已建、UI 未做）、推薦牆 ④可選：報到成功時自動補一筆當天的遊玩紀錄（拿掉「我玩了」後不再自動補）⑤視覺改版（首頁、遊戲卡片、集點卡獨立頁）。


## 視覺改版進度（2026-10-26 深夜，第二階段進行中）

**已確認狀態**：`git log` 顯示報到／集點新規則相關提交都已 push（最新 `cce279b`），工作樹乾淨；LINE 內開連結、報到流程使用者回報「沒有問題」；資料庫函式 `admin_delete_member`、`join_gathering`、`loyalty_day_status` 存在，**`admin_create_gathering` 不存在**（前端本來就沒用，可忽略）。`gathering_plays` 已移除與 `capacity` NOT NULL 的驗證結果使用者尚未貼。

**首頁（已提供給使用者，使用者貼回的截圖顯示已套用）**
- 決定：**收藏清單是首頁主角**，不做「最新加入」區塊（卡片已有 NEW）、**不做「最受歡迎」**（指標未定義）。主視覺縮成一條：左「今天，想玩哪一款？」、右搜尋框，下面一排類型膠囊（`hero.css` 整份換新、`library.css`／`cards.css`／`base.css` 小改，改用 `tokens.css` 變數）。
- **類型膠囊 `components/CategoryChips.tsx`**：前三個固定**策略、派對、陣營**（主體），之後是已選的副類型，再來「更多類型 ▾」（跳出視窗，可搜尋、多選、AND 規則不變）、「清除類型」。數字是該類型遊戲總數。視窗用 `createPortal`，`.cat-backdrop` z-index 1100。樣式在 `hero.css` 最後面。
- **排序 `components/SortControl.tsx`**：排序下拉＋升降冪＋「重設」搬到收藏標題列（`library.css` 最後面），不用開抽屜。
- **`FilterDrawer.tsx` 已瘦身為「進階篩選」**：只剩難度、最佳／推薦人數、時間、我的紀錄；類型區與排序已拿掉（`App.tsx` 同步刪掉 `categorySearch`、`isSubCategoryOpen`、`categories`，`FilterDrawerProps` 不再有 `categories`、`selectedCategories`、`sortBy` 等）。`filter.css` 裡舊的 `.category-chip`／`.category-sub-toggle`／`.category-search` 沒人用，留著無害。
- 標題列按鈕要從「☰ 篩選與排序」改成 **「☰ 更多篩選」**，並在 `filter.css` 補抽屜靠左樣式（使用者截圖顯示按鈕還沒改，**開場先確認**）。
- 使用者的 `tokens.css` 現有變數：`--c-cream/paper/forest/forest-dark/caramel/ink/ink-soft/line/danger`、`--radius-s/m/l`、`--shadow-s/m`、`--z-bar/--z-modal`。

**使用者回覆「1 2 3 4 5」＝下一批新增 5 個進階篩選全部都做（尚未動工）**，只用現有資料、不動資料庫：
1. **「我們有幾個人」**：條件 `minPlayers ≤ N ≤ maxPlayers`（原本的最佳／推薦人數保留）。
2. **遊戲時間「不超過 X 分鐘」**快速鈕：30／60／90／120。
3. **難度五級（2026-10-27 使用者改）**：`<1.8`、`1.8～<2.6`、`2.6～<3.2`、`3.2～<3.8`、`≥3.8`，缺值不屬於任何級。五顆膠囊。
4. **只看新遊戲（30 天內）／只看有封面**（封面是否存在需用 `CoverImage` 的載入結果，**要先想清楚怎麼判斷**，不行就只做「新遊戲」）。
5. **我的紀錄加「有評分／沒評分」**（用 `ratings.getMine`，登入且評分讀取完成才有意義）。
新增條件要同步：`activeFilterCount`、`clearFilters`、`filteredGames` 的 useMemo 依賴、`missingDataCount`（如有用到難度／時間）。

**「我的桌遊」抽屜與頂端「集點卡」重複（使用者提出，已拿到 `MyList.tsx`、`mylist.css`、`LoyaltyCard.tsx`，尚未動工）**：已提出方案：拿掉頂端與手機底部導覽的「集點卡」（`TopBar.tsx` 的 `onOpenLoyalty`、`App.tsx` 的 `openMyLoyalty` 與 `inviteKey` 邏輯保留給報到／邀請連結用），只留「我的桌遊」；抽屜頂端加「我的俱樂部」摘要卡（暱稱、VIP 標示、想玩／已玩數、本月點數；點數資料來自 `useMyLoyalty()` 的 `summary`，只有 VIP 才有）；未登入時改成說明登入後能同步什麼、VIP 多什麼，附登入按鈕（用 `signInWithGoogle()`）；想玩／已玩為空時顯示說明與「去逛收藏」按鈕；管理者不顯示集點卡。手機底部導覽由 5 顆減為 4 顆。**使用者尚未回「照建議」**。

**之後的視覺順序**：我的桌遊抽屜 → 排行榜空狀態（說明「為什麼是空的」：沒資料／未滿 5 人／未登入）→ 集點卡獨立頁面 → 管理者視窗統一風格 → 手機全面檢查（遊戲卡片手機版不要硬塞 4／9 欄，檢視模式與實際欄數分開）。

## 想做清單（使用者 2026-10-24 提出，尚未排序）

詳細內容與原話整理在 `PROJECT_CONTEXT.md` 第 9 節。重點：
- 小功能：新增排序（待確認排什麼；使用者說先跳過）。
- 「我的桌遊」升級：近期／下次聚會想玩、想玩一鍵移到已玩、依加入時間／排名／時間排序、統計（總次數、總時數、最常玩、每月趨勢）。
- 集點卡：**v2 已上線**（見「已完成」與 `PROJECT_CONTEXT.md` 第 7 節）。原始需求（完整評分七項、管理者指定參加者、同月 2 點換免費券、一天只算一點、管理者看全部、玩家只看自己）仍有效；**不建議用藍牙／區網偵測**。
- 揪團與聚會規劃（第三階段）、「今天想玩什麼？」依人數／時間／難度推薦（用現有資料即可，不需 AI）。
- 訪客紀錄不會跨瀏覽器（只在該瀏覽器的 `localStorage`）；登入 Google 才會雲端同步。
- **站上拖曳調整排名＋匯出 CSV 給 Notion（使用者說「晚點再嘗試」，尚未動工）**：管理者專用；6 個排名欄位都已在資料庫，不需改資料庫（對照表見 `PROJECT_CONTEXT.md` 第 9 節）；「綜合分數排名」仍由 Notion 算；**使用者尚未回「照建議」**。
- **AI 規則助手必須用 RAG（使用者明確要求）**：只根據檢索到的規則書片段回答，列出出處（哪本、第幾頁）；找不到依據要明說。**不可從影片查規則**；只讀 `ai_indexed = true` 的文件。見 `PROJECT_CONTEXT.md` 第 6、9 節。
- 遊戲簡介補寫：使用者說太耗時，晚點再寫。

## 下一步（照順序）

**一次一階段，前一階段測試完才進下一階段。**

1. （已完成）報到流程確認：git 已 push、LINE 實測沒問題。
2. **視覺改版第二階段（見上方「視覺改版進度」）**：先確認「☰ 更多篩選」改名已套用 → 做 5 個新增篩選（使用者已回「1 2 3 4 5」）→ （「我的桌遊」與集點卡已拆成兩個抽屜，不拿掉集點卡）→ 排行榜空狀態 → 集點卡獨立頁面 → 管理者視窗統一風格 → 手機全面檢查。
3. 站上拖曳調整排名；排序功能。
4. 上傳規則書 PDF（**私有** bucket）→ **AI 規則助手（RAG，最重要的長期目標）**→ 揪團／行事曆、帳號刪除流程。順序請與使用者確認。
5. 詳細視窗的「AI 查詢」分頁等 AI 規則助手做出來再加。

**接續時請這樣開場：**
1. 問使用者在哪台電腦，`git pull`、`git status`。
2. 先處理「進行中」的確認。**不要假設上一則回覆的步驟已完成**（聊天室額度曾中斷過數次）。
3. 新資料表的 RLS 寫入政策**一律用 `auth.uid()` 等於本人，或 `is_admin()`**；改 `App.tsx` 前請他貼目前版本（他貼來的可能是舊版）。

## CSV 匯入的行為（重要）

- 流程：upsert → 上傳封面 → 把「資料庫正常、CSV 沒有」的遊戲**移到垃圾桶**（設 `removed_at`）。**不刪資料列、不刪 Storage 封面。**
- 預覽分三類：①會移到垃圾桶（紅字名單）；②CSV 有、但目前在垃圾桶（資料會更新、**仍留在垃圾桶**，不自動還原）；③垃圾桶裡本來就有、CSV 也沒有（維持原狀）。想改成自動還原，在 `AdminPanel.tsx` 的 `toRow` 加 `removed_at: null`。
- 保護：一次移到垃圾桶超過 5 款，要輸入「移除」。
- CSV「簡介」欄選填：沒有該欄或空白，不覆蓋資料庫原有簡介；CSV 無法清空簡介。
- 永久刪除（含雲端封面）只在垃圾桶區由管理者手動做；**封面刪除後無法復原**。
- 地雷：在 Notion 改 `bggName` → 舊的進垃圾桶、新的當新遊戲（封面要重傳）；新舊 `cover_slug` 相同會撞唯一限制。
- 玩家的想玩／已玩／評分紀錄以 `bgg_name` 對應，**CSV 改 `bggName` 會讓玩家對那款的紀錄失聯**。
- `makeCoverSlug` 已改為 ASCII 安全版（見 `PROJECT_CONTEXT.md` 第 4 節）；**是否已套用並重新匯入、`cover_slug !~ '^[a-z0-9_-]+$'` 查詢是否為 0 列，尚未確認**。
- 下次匯入 CSV 後，請使用者執行 `select bgg_name, created_at from public.board_games order by created_at desc limit 5;`，確認舊遊戲的 `created_at` 沒被重設；若被重設，要調整匯入程式。

## 關鍵決定與地雷

- **公開瀏覽、只有管理者能編輯；訪客可以問 AI 但不能改設定。** AI 開放給訪客會花錢，之後要做每日提問次數限制，AI 金鑰只能放後端。
- Supabase：Project URL 是**根網址** `https://hgeuockbjrzayfdylavq.supabase.co`（不加 `/rest/v1/`）。只有 Publishable key 可放前端。
- **「Allow new users to sign up」已開啟**，所以所有寫入政策必須只認管理者或本人。新增任何資料表或 bucket 都要重新檢查政策。
- **Google 的 Client Secret 只存在 Supabase**，絕不放進 Git、前端、Vercel 環境變數或對話。`client_secret_*.json` 要移出專案資料夾並加進 `.gitignore`。
- 管理者帳號的 Gmail 若同時用 Google 登入，會對到同一個管理者帳號；測玩家身分要用另一個 Google 帳號。建議管理者的 Google 帳號開啟兩步驟驗證。
- Google OAuth 只用基本範圍；**不要在「資料存取權」新增敏感或受限範圍**，否則會觸發驗證與使用者人數限制（100 位）。人數接近 80 人時回 Google Auth Platform「目標對象」頁面確認。
- **不採用匿名帳號**。改採「訪客存 `localStorage`＋登入玩家才能評分」。
- **社群設計決定（使用者）**：不做留言板；評分一律公開；評分項目沿用使用者的用語：喜歡度、玩家影響性（**不要改名成「玩家互動」**）、溝通性、變化性、獨特性、適合留下來程度。複雜度與快速性視為遊戲屬性，不列入評分。社群平均與使用者自己的 Emoji 評價並排顯示，但**不要與「綜合分數排名」混在一起或揭露其算法**。個人想玩／已玩預設只有本人可見，社群只看彙總。排行榜只用彙總，不顯示個別玩家。
- **不加「讚」按鈕**。
- `privacy.html` 日後新增功能（評分、遊玩次數、社群統計、排行榜、集點）時要同步更新。帳號刪除：管理者在「管理 → 成員」按「刪除帳號」（admin_delete_member，輸入暱稱確認）。
- Vercel 的 `VITE_SUPABASE_URL`、`VITE_SUPABASE_PUBLISHABLE_KEY` 必須存成 **Config**（不是 Secret），名稱不能錯。本機 `.env.local` 不在 Git 裡，換電腦要重建。
- Supabase 免費專案閒置一週會暫停；檔案儲存免費額度約 1 GB。
- 資料庫主鍵是 `bgg_name`；前端 `id` 只是流水號，**絕對不能用來對應圖片或使用者資料**。
- 缺值保留 `null`，顯示「未提供」，不要編造。
- 上線網站只看得到有 push 的檔案；改資料庫內容、上傳封面、跑 SQL **不需要 push**。
- 瀏覽器 Console 裡大量封面 404 是正常的。匯入 CSV 或上傳封面後，要重新整理網頁才會看到最新資料。
- `BoardGame` 型別仍由 `src/data/boardGames.generated.ts` 匯出，**不要刪這個檔案**。
- Brevo 帳號已註冊但目前沒用到。
- 垃圾桶 0 款時整區隱藏是設計如此，不是壞掉。
- **Storage 檔名必須是 ASCII**（見 `PROJECT_CONTEXT.md` 第 4 節）。
- **次數定義**：`play_count`＝沒日期的次數，總次數＝它＋遊玩紀錄筆數；不要混為一個數字存回資料庫。
- **新建資料表一律加**：`revoke truncate, references, trigger on 表名 from authenticated;`，並確認 `anon` 無權限。
- **給使用者改程式碼時**：量大就給整份檔案，不要只寫「貼在某行下面」（他多次貼錯位置）。
- 排序功能：使用者說之後再想，尚未定義。

- **聯絡方式（LINE／FB 名字）是敏感資料**：只放 `player_contacts`，**不可放進公開的 `player_profiles`**；只有本人與管理者能讀。排行榜、社群統計、任何公開畫面都不可顯示。
- **頂端列（`.topbar`）不可加 `backdrop-filter`、`transform`、`filter`**：會讓裡面 `position: fixed` 的視窗遮罩被關在頂端列裡（暱稱視窗只露出一條，2026-10-26 發生過）。會彈出的視窗一律用 `createPortal(..., document.body)`，`.modal-backdrop` 的 z-index 是 1100（高於頂端列 900）。
- 集點資格由資料庫函式 `loyalty_day_status` 判斷（`exempt` 或「出席＋當天指定遊戲任一款評分完整」）；`gathering_attendees` 的 INSERT／DELETE／UPDATE 只有管理者；玩家不能自己改出席或免評分。
- 評分過就視為已玩（觸發器，只掛在 game_ratings）；取消不會取消已玩。
- 管理者聚會視窗的玩家清單來自 `player_profiles`，聯絡方式來自 `player_contacts`（管理者才讀得到）。

- **連結（2026-10-26 起合併成一個）**：管理者只傳 `?join=隨機碼` 的聚會連結（報到＋集點卡）；`?card=日期` 仍支援但介面已不提供。`?card=日期`（集點卡連結）只是「登入後打開我的集點卡並標出那天」的捷徑，**不會讓任何人變成出席者**；`?join=隨機碼`（報到連結）才會把玩家列入出席名單，受開關、當天、上限限制，隨機碼只有管理者讀得到。已報到的人在聚會結束後再點連結也會回 `ended`（已過期），要看集點卡請按底部「集點卡」（2026-10-27 改）。報到＝自動成為 VIP（2026-10-27 改，見最上方更新）；連結只在聚會當天有效。
- **玩家只能透過 `join_gathering` 自己加入出席名單**；`gathering_attendees` 的寫入政策仍只有管理者。
- **集點是即時計算，不會因為匯入新 CSV 而消失**：`loyalty_day_status` 只用 `gathering_attendees`、`gathering_games`、`game_play_sessions`、`game_ratings`（皆以 `bgg_name` 文字對應，沒有外鍵到 `board_games`），不讀 `board_games`。遊戲被移到垃圾桶或永久刪除，點數不變；但畫面上該遊戲的名稱會退回顯示 `bgg_name`、且找不到「去評分」按鈕。**真正的風險是在 Notion 改 `bggName`**（舊名稱的紀錄不會跟著換）。兌換紀錄永久保留，點數事後變少時只會顯示 ⚠。
- **VIP 密碼不可放前端**，驗證只在資料庫函式 `redeem_vip_code`（每帳號 15 分鐘錯 3 次鎖、全站錯 10 次全鎖；管理者可在成員頁解鎖）。**AI 規則助手只給 VIP**，且必須 RAG＋列出處（書名＋頁碼）。**不做 Email 驗證登入**（怕寄信額度與費用），只用 Google；一般登入按鈕不強制選帳號，「切換 Google 帳號」在暱稱選單。
- 名單隱私：預設只顯示人數；VIP 展開只看暱稱（玩家可在暱稱選單關閉，`player_profiles.hide_in_lists`）；管理者看「暱稱（LINE／FB）」且不受隱藏影響；評分者名單只有管理者。LINE／FB 名字永不給 VIP。
- 管理者不顯示集點卡。同一天不管幾場只算 1 點（`loyalty_day_status` 已改成依日期分組）。

## 開場前先確認

1. 使用者現在在哪台電腦；分支應為 `master`，先 `git pull`。
2. `git status`：雜項檔不要 add（見上方清單）；`client_secret_*.json` 不應出現在專案資料夾。
3. 確認「進行中」的實際狀態，再往下做。
4. 若要改 `src/App.tsx`、`src/components/*`、`src/AdminPanel.tsx`、`src/PlayerPanel.tsx`、`src/GameDocuments.tsx`，請他貼出目前版本。
