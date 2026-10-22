
---

## 附錄｜Phase 3 之後的紀錄（2026-10-22）

> 這一章是貼在 `PROJECT_CONTEXT.md` 最底部的新增內容，記錄 Phase 3 與之後的設計、資料庫結構與決定。上面舊章節若與這裡衝突，以這裡為準。

### A. 資料庫：`public.user_game_status`

| 欄位 | 型別 | 說明 |
|---|---|---|
| `user_id` | uuid，`references auth.users on delete cascade` | 主鍵之一 |
| `bgg_name` | text（1～200 字） | 主鍵之一；**刻意不對 `board_games` 加外鍵** |
| `want_to_play` | boolean，預設 false | ♥ 想玩 |
| `played` | boolean，預設 false | ✓ 已玩 |
| `note` | text，預設 ''，≤500 字 | 私人備註 |
| `updated_at` | timestamptz | 前端每次寫入時更新 |
| `want_first_at` | timestamptz | 第一次勾「想玩」的時間，**由觸發器寫入、之後不變** |
| `played_first_at` | timestamptz | 第一次勾「已玩」的時間，同上 |
| `play_count` | integer，預設 0，0～999 | 遊玩次數，**尚無畫面使用** |

- 主鍵 `(user_id, bgg_name)`，重試同步不會產生重複資料。
- RLS 已開啟；`select`／`insert`／`update`／`delete` 四條政策都是 `user_id = (select auth.uid())`，角色 `authenticated`；`anon` 的權限已撤銷。
- 觸發器 `user_game_status_set_times`（`before insert or update`，函式 `public.set_user_game_status_times()`，`set search_path = ''`）：新增時依勾選狀態寫入首次時間；更新時 `coalesce(old.值, 新勾選才寫 now())`，所以**取消再重新勾選不會改變首次時間**，前端傳進來的值也會被蓋掉。
- 因此取消勾選時**不刪除那一列**（才能保住首次時間）；前端讀取時略過「想玩、已玩、備註全空」的列。
- 現有紀錄建立觸發器前，已用 `updated_at` 補上首次時間（`Rising Sun` 的兩個時間因此等於 `updated_at`，屬預期）。
- 驗證過：政策 4 條齊全、`anon` 不在權限清單、測試列的首次時間早於 `updated_at`（觸發器有運作）。

### B. 前端結構（Phase 3 之後）

- `src/lib/usePersonalCollection.ts`（已 push）：
  - 型別 `PersonalEntry { wantToPlay, played, note }`、`PersonalCollection = Record<bggName, PersonalEntry>`。
  - 訪客：`localStorage` 鍵 `boardgame-personal-collection`；登入後以雲端為準並**不再寫 localStorage**。
  - 回傳：`entries`、`getEntry`、`updateEntry`、`isLoggedIn`、`canEdit`、`status`（`guest`／`loading`／`ready`／`error`）、`errorMessage`、`clearError`、`reload`、`needsMerge`、`localCount`、`mergeStatus`、`mergeLocalIntoCloud`、`declineMerge`。
  - 登入後更新採「先改畫面、再寫雲端，失敗還原並顯示提示」；雲端讀取完成前不能改（避免蓋掉資料）。
  - 首次合併規則：兩邊聯集；想玩／已玩任一邊有勾就有；備註雲端已有就保留雲端；雲端寫入成功才清空本機；失敗保留本機並可重試；「不加入」只在該次工作階段有效。
- `src/App.tsx`：`StatusButtons`（封面 `overlay` 與詳細視窗 `inline` 兩種版型）、`PersonalNote`（離開欄位才儲存）、合併視窗（沿用 `modal-backdrop`／`admin-modal`）、錯誤提示條 `personal-toast`；`Library` 內 `const personal = usePersonalCollection()`。
- `src/MyList.tsx`：「我的清單」右側抽屜（`mylist-*` 樣式，z-index 1100／1200）；用 `renderCover` 屬性借用 `App.tsx` 的 `CoverImage`，避免循環匯入。
- 樣式都附加在 `src/App.css` 最底部，依功能分區註解（想玩／已玩、我的清單、我的紀錄篩選、新遊戲標示）。

### C. 進行中的兩項（程式碼已提供，狀態待確認）

**「我的紀錄」篩選**
- `type MineGroup = 'want' | 'untouched' | 'played'`；分組函式 `getMineGroup(entry)`：有想玩→`want`；否則有已玩→`played`；否則→`untouched`（三區不重複）。
- `Library` 狀態：`groupByMine`（是否顯示區塊標題）、`hiddenGroups`（被眼睛隱藏的區塊）；`displayedItems`（`header`／`game` 混合陣列）、`displayedGameCount`。
- 順序：搜尋與既有篩選 → 排序（`filteredGames`）→ 依眼睛隱藏 → 若開啟分區則分組（空區不顯示標題；標題顯示數量；區內沿用原排序）。
- 篩選按鈕徽章會計入 `groupByMine` 與 `hiddenGroups`；「清除篩選」會一併重設。
- 抽屜新增 `mine-filter` 區（三顆眼睛按鈕＋「依我的紀錄分區顯示」勾選）；主畫面卡片迴圈由 `filteredGames.map` 改為 `displayedItems.map`。

**新遊戲標示**
- `board_games.created_at`（timestamptz）已存在；現有遊戲要先補成 `2026-09-01T00:00:00+00`，否則 30 天內全部會變成「新」。
- `App.tsx`：`LibraryGame = BoardGame & { createdAt?: string | null }`；`rowToGame` 帶入 `createdAt: row.created_at`；`NEW_GAME_DAYS = 30`；`isNewGame()`；卡片加 `is-new` class 與 `new-badge`。
- 樣式：橘色外框（`#f0a22e`）＋左下角 NEW 標籤，9 個一排與清單檢視縮小。

### D. 已決定、尚未實作的功能

- **社群統計**（取代原 Phase 5 每月投票）：直接用大家的想玩／已玩清單；顯示每款遊戲「目前人數」與月／季／年「期間新增」（以 `want_first_at`／`played_first_at` 計算，每人每款只算第一次）；只顯示彙總人數、不公開個別清單；訪客不計入；以 `security definer` 資料庫函式回傳彙總數字，不開放別人的列；人數少可被推測，已寫進 `privacy.html`。
- **遊玩次數**：欄位 `play_count` 已建；先做簡單計數器；若要「每月玩幾次」，另建遊玩紀錄表（日期事後補不回來）。
- **評分**：Phase 4，每人每款一筆、可修改；開始前確認量表與人數門檻（建議 5）。
- **不加「讚」按鈕**（建議；使用者未反對）。

### E. Git 事故紀錄（避免重演）

- 2026-10-22：使用者在 TortoiseGit 以 Amend 方式「修改上一次提交」，把含 `App.tsx`／`App.css`／`usePersonalCollection.ts` 的提交（`6c24208`，已在 `origin/master`）換成只含兩份文件的提交（`e200fae`），造成 `master` 與 `origin/master` 分岔。
- 修法：先備份檔案到 `$HOME\backup-mylist`、`git branch backup-e200fae e200fae`，再 `git reset --mixed origin/master`（不動工作資料夾），之後逐檔 add 提交。
- 之後請使用者用命令列 commit，不要在 TortoiseGit 使用 Amend。

### F. 測試紀錄（Phase 3）

- 資料庫：政策與權限查詢通過。
- 線上：訪客勾選、備註、登入後合併、Table Editor 對列數、重新整理後保留、登出後消失、換裝置同步，使用者回報通過。
- 「不加入」、離線同步失敗與重試、換裝置登入：已列出測試步驟，使用者回報通過。
- 隱私權政策已更新並提交（上線後可再開 `/privacy.html` 確認）。
