# 桌遊規則助手（BoardGameResultAI）— 專案交接文件（精簡版）

> 給接手的 AI 閱讀。**請先讀 `QUICKSTART.md`（懶人包），再讀本文件。**
> 最後更新：2026-10-28（最上方先看『第七批更新』），再看2026-10-28（最上方先看『第六批更新』），再看2026-10-27 深夜（最上方先看「2026-10-27 深夜（第五批）更新」，再看「2026-10-27 深夜（第四批）更新」，再看「2026-10-27 深夜（第三批）更新」，再看「2026-10-27 深夜（第二批）更新」，再看「2026-10-27 深夜更新（第一批）」，再看「2026-10-27 傍晚更新」，其次是「2026-10-27 更新」一節，優先閱讀；以下主體為 2026-10-26 深夜版）。這一版把已完成的功能整理成「依主題」的紀錄（取代舊的 A～Q 附錄），內容與決定不變；日期與細節若與 `QUICKSTART.md` 衝突，以 `QUICKSTART.md` 為準。

## 2026-10-28（第七批）更新（最新；與下方任何舊內容衝突時，以本節為準）

### 已完成
- 階段 4 檢索 SQL 已執行並驗證權限（anon 無權限）：`search_rulebook_chunks(p_bgg_name, p_query)`（VIP 驗證、台北時間每日 30 次、管理者不限、只有找到結果才扣次數、順便刪 7 天前紀錄、英文全文檢索 OR 比對、最多 5 段）、`rulebook_search_remaining()`、`rulebook_has_index(p_bgg_name)`、`rulebook_indexed_games()`（列出有索引文件的遊戲，VIP 才有結果）。
- 規則書資料夾已搬到 `D:\rulebooks\`（專案外，避免 Vite EBUSY）。階段 3 與深色模式修正已 commit。
- `GameDocuments.tsx`：新增連結與上傳 PDF 合併為單一「新增文件」表單（類型為規則書／FAQ／勘誤時可選「上傳 PDF」）。
- **規則助手獨立成頁面**（不再是詳細視窗分頁）：`RulebookPage.tsx`（先選遊戲，只列有索引的遊戲，可搜尋）＋`RulebookAssistant.tsx`（中文問題、建議英文關鍵字、英文搜尋框、結果含頁碼、兩個複製提示詞按鈕）。導覽列第 5 顆「✦ 規則助手」，只有 VIP／管理者看得到（後端仍驗證 `is_vip()`）。
- `lib/zhEnGlossary.ts`：內建通用中英對照（約 40 組詞，含旭日戰魂錄「茶會」→ tea ceremony），中文問題自動建議英文關鍵字；搜尋框只接受英文，純中文不會搜尋也不扣次數。
- `lib/useBackClose.ts`：開啟視窗時手機「返回」只關視窗；目前套用在 `GameModal`、`RulebookPage`，✕ 保留。**尚未擴到其他抽屜**。
- 詳細視窗固定大小（`vip.css` 最底：`.game-modal.has-tabs` 寬 460、高 `min(720px, 100dvh-40px)`，手機全螢幕）。

### 使用者決定／想法（尚未動工）
- **第 2 批：管理中心加「規則書」分頁**：一次選多個 PDF；每列從檔名猜遊戲（比對 `bggName` 與中文名）、類型（檔名含 faq／errata）、語言（有中文字猜中文，否則英文）；猜不到就「請選擇遊戲」，下拉可搜尋；全部確認後逐檔上傳、顯示進度與失敗原因，失敗不影響其他檔；詳細視窗「規則」分頁拿掉上傳，只留貼連結與清單。`useGameDocuments` 需改成可指定任意 `bggName`（目前綁單一遊戲）。要改 `AdminCenter.tsx`（已看過）。
- **第 3 批：「我的俱樂部」與詳細視窗「我的桌遊」整合**：已玩清單每列可改次數（改「沒日期的次數」`play_count`，已確認它就是沒日期的歷史次數，不會重複計算）；詳細視窗「我的桌遊」分頁拿掉想玩／已玩按鈕與遊玩次數，保留「記錄一次遊玩」、最近紀錄與備註；備註改名「我的整體心得」；單次心得沿用 `game_play_sessions.note`；不動資料庫。要改 `MyList.tsx`、`PlayCounter.tsx`、`GameModal.tsx`。
- 手機底部導覽現在 5 顆，若擠就把「規則助手」縮短為「規則」。
- 每款遊戲專有名詞對照表（管理中心維護）：之後再做。

### 尚未驗證／待處理（接手先問）
1. 這批是否已 build、commit、push（`git log`）。`TopBar.tsx` 是否已加 `onOpenRules`、`canUseRules`；`App.tsx` 是否已加 `RulebookPage`。
2. 手機實測：底部 5 顆是否擠、返回鍵是否只關視窗（Android／iPhone Safari／LINE）、詳細視窗大小是否一致。
3. 用非 VIP 帳號確認看不到「規則助手」；用 VIP 帳號實測搜尋與剩餘次數。
4. 中文 PDF 擷取品質、`rules-en` 語言是否已改 `en`、建立中英檢索測試集（使用者要挑熟悉的規則書各 5～8 題，標頁碼）仍待做。
5. `privacy.html` 尚未補「規則助手搜尋紀錄」說明（用途、保留 7 天、只存使用者與遊戲與時間、不存問題內容）。
6. 20 款清單與規則書統計表仍未提供。

### 下一步
第 2 批（管理中心批次上傳）→ 第 3 批（我的俱樂部整合）→ `privacy.html` → 手機返回鍵擴到其他抽屜 → 檢索測試集與命中率評估（必要時加每款遊戲對照表或查證語意搜尋／免費翻譯 API，兩者都未查證）。

---

## 2026-10-28（第六批）更新（最新；與下方任何舊內容衝突時，以本節為準；第四、五批的方向仍有效，但被本節修正的地方以本節為準）

### 使用者決定（覆蓋第五批）
- **不做 `is_active` 啟用／停用開關**：索引成功後自動啟用，系統把 `ai_indexed` 設為 true 當「可被搜尋」標記；要下架就刪文件（切塊 cascade 刪除，前端刪除按鈕會一併刪 Storage 的 PDF）。
- 使用者會放：規則書（中英文）、FAQ（多為英文）、中文規則網站。**網站內容用「另存成 PDF 再上傳」**（Chrome：Ctrl+P → 另存為 PDF → 取消頁首頁尾）。不做自動抓網頁。
- **搜尋紀錄保留 7 天**；**不啟用 pg_cron**，改在搜尋函式內順便清掉 7 天前的紀錄。**每日額度以台北時間凌晨 0 點重置**（VIP 每日 30 次、管理者不限）。
- 新表沿用 `bgg_name` 與文件 `id`；**`rulebook_chunks` 只存 `document_id`，不存 `bgg_name`**（靠 `game_documents` 對應，改名不會失聯）。
- **CSV 不需要新增任何欄位**；文件在網站管理者介面上傳，與 CSV 無關。在 Notion 改 `bggName` 的地雷照舊。
- 規則書授權：使用者決定不設開關、一律啟用；AI 已提醒「能從 BGG 下載不等於有權再上傳與擷取」，**這不是法律意見**，風險由使用者自行評估；第一版只回傳最多 5 段短片段，不提供下載。

### 已完成（階段 2 第一部分，SQL 已執行並驗證）
- `game_documents` 新增欄位：`index_status`（`none／pending／processing／completed／failed`，預設 none）、`index_error_code`、`page_count`、`edition`、`file_hash`、`source_note`（≤200 字）、`indexed_version`（預設 0）；新增約束：只有 `rulebook／faq／errata` 可 `ai_indexed = true`。
- 新表 `rulebook_chunks`（`document_id` 外鍵 cascade、`index_version`、`chunk_index`、`page_number`、`section_title`、`content`；RLS 開啟、**anon 與 authenticated 完全沒有直接權限**）、`rulebook_search_log`（只存 `user_id`、`bgg_name`、`created_at`，不存問題內容；RLS 開啟、無直接權限）。
- 私有 bucket `rulebooks`（限 `application/pdf`、50 MB、只有管理者可讀寫，四條政策 `rulebooks admin read/insert/update/delete`）。
- 函式（security definer、`search_path=''`、anon 無權限、authenticated 可執行但內部檢查 `is_admin()`）：`admin_replace_rulebook_chunks(p_document uuid, p_chunks jsonb, p_page_count int, p_file_hash text)`（寫入新版本切塊，成功才切換 `indexed_version`、設 `ai_indexed = true`、`index_status = 'completed'`、刪舊版；同一交易）、`admin_mark_rulebook_failed(p_document uuid, p_code text)`。
- 六項驗證查詢使用者都貼了截圖，全部符合預期。

### 已完成（階段 3：管理者上傳與文字擷取；使用者已 build、實測）
- 已安裝 `pdfjs-dist`。新增 `src/lib/extractPdfText.ts`（瀏覽器端擷取、同一頁內切段、每段最多 800 字、不跨頁、中日文之間不補空格、掃描 PDF 回 `NO_TEXT`、最多 3000 段、算 SHA-256）；改 `src/lib/useGameDocuments.ts`（新增 `uploadDoc`：先擷取，成功才上傳 PDF 到 `rulebooks/{docId}.pdf`，再 insert 文件列，再呼叫 `admin_replace_rulebook_chunks`；任何一步失敗都復原文件列與檔案；`deleteDoc` 對上傳文件會先刪 Storage 檔）；改 `src/GameDocuments.tsx`（管理者看得到上傳表單與索引狀態；**非管理者只看到外部連結**）。`GameModal.tsx` 沒改。
- **pdf.js 新版 API 注意**：結束時要呼叫 `loadingTask.destroy()`，不是 `pdf.destroy()`（會 build 失敗）。
- 實測：上傳 `Ayar_rulebook`（en，20 頁）、`Bable-English`（en，12 頁）、`rules-en`（天際礦脈資料夾，32 頁）都 `completed`，`indexed_version = 1`；英文預覽乾淨、頁碼正確；未登入開 `.../storage/v1/object/public/rulebooks/<檔名>.pdf` 回 `Bucket not found`（原檔不公開）。

### 尚未驗證／待處理（接手先問）
1. **這批程式（`package.json`、`package-lock.json`、`src/lib/extractPdfText.ts`、`src/lib/useGameDocuments.ts`、`src/GameDocuments.tsx`）是否已 commit、push 未確認**；用 `git status`、`git log` 查。逐檔 add，不要 `git add .`。
2. **中文 PDF 的擷取品質尚未測**（有無亂碼、是否被塞空格）；`天際礦脈_水印.pdf` 當時還在下載。上傳後用這兩個查詢看：
   - `select d.title, d.language, d.index_status, d.ai_indexed, d.page_count, d.indexed_version, count(c.id) as chunks from public.game_documents d left join public.rulebook_chunks c on c.document_id = d.id and c.index_version = d.indexed_version where d.source_type = 'upload' group by d.id;`
   - `select page_number, left(content, 150) as preview from public.rulebook_chunks order by id limit 15;`
3. **`rules-en` 的語言被設成 `zh`**，疑似選錯；已建議 `update public.game_documents set language = 'en' where title = 'rules-en';`，是否已執行未確認。
4. 還沒測：掃描型 PDF 是否正確報 `NO_TEXT`；訪客／一般會員是否看不到上傳文件（前端已過濾，但沒親眼確認）。
5. **使用者的規則書資料夾在專案內**（`D:\BoardGameResultAI\rulebook\ayar`、`bable`、`skymines`、`新幕桜降る代に決闘を 基本セット`），Vite 監看出現 `EBUSY` 錯誤；已建議搬到 `D:\rulebooks\` 或在 `.gitignore` 加 `rulebook/`，是否做了未確認。`furuyoni` 是**日文**，表單只有中文／英文，第一版不收日文。
6. 20 款清單、規則書統計表仍未提供；實際只上傳了 3 份測試。

### 下一步
- **階段 4：檢索**。①用真實規則書比較中文檢索方式（`pgroonga` 與 `pg_trgm`，兩者都可用但都未啟用；`zhparser` 不在清單；英文可用內建全文檢索）；**目前不啟用任何擴充**。②**跨語言問題尚未解決**：使用者用中文提問，但多數規則書與 FAQ 是英文，中文關鍵字比不到英文內文；候選做法：使用者輸入英文術語、為每款遊戲維護中英術語對照、之後評估語意搜尋（向量，需 embedding，有費用與依賴考量），請先與使用者討論再動工。③寫 `search_rulebook_chunks(p_bgg_name text, p_query text)`：驗證 `is_vip()` → 用 advisory lock 鎖該使用者 → 檢查今日台北時間次數（VIP 30、管理者不限）→ 只搜該遊戲 `ai_indexed = true` 且 `index_status = 'completed'` 的文件、且 `index_version = indexed_version` 的切塊 → 最多 5 段並限制長度 → **只有找到結果才寫入 `rulebook_search_log`**（無結果、錯誤、超額都不扣）→ 順便刪 7 天前紀錄；`revoke ... from public, anon`，只 grant authenticated。④建立中英文檢索測試集（20～50 題，人工標註正確段落，看是否出現在前 5 筆）。
- **階段 5**：詳細視窗第 5 分頁「規則助手」（只給 VIP／管理者、且該遊戲有索引完成的文件才顯示）、顯示片段與頁碼、一鍵複製提示詞（說明會送到使用者自選的外部 AI）、`privacy.html` 補搜尋紀錄說明（用途、7 天保留、只有必要流程寫入）。需先請使用者貼最新的 `GameModal.tsx` 等檔案。
- 之後再做：「更新版本」按鈕（`admin_replace_rulebook_chunks` 已支援新版成功才切換）、章節標題（`section_title` 目前為空）、OCR。
- 第三批待辦 2（驗證社群平均含管理者那一票）、第二批小項、手機報到流程實測仍有效。

---

## 2026-10-27 深夜（第五批）更新（最新；與下方任何舊內容衝突時，以本節為準；「第四批」的方向與分階段計畫仍有效，本節是補充與修正）

### 階段 1「盤點現況」已完成（只讀不改；**仍未動任何程式碼、SQL、Supabase 設定**）
- **`game_documents` 實際欄位**：`id`(uuid, gen_random_uuid)、`bgg_name`、`doc_type`、`language`、`title`(預設空字串)、`source_type`、`external_url`(預設空字串)、`storage_path`(預設空字串)、`ai_indexed`(預設 false)、`created_at`，全部 NOT NULL。**沒有**啟用／停用、索引狀態、頁數、版本、授權、雜湊欄位。
- **`game_documents` 約束**：`language` 只能是 `zh`／`en`／`other`；`source_type` 只能是 `external`／`upload`；`doc_type` 為 `rulebook／faq／errata／intro／video／other`；**`game_documents_video_not_indexed`**（影片不可 `ai_indexed = true`，已存在）；external 須有 `external_url`、upload 須有 `storage_path`；**外鍵 `bgg_name → board_games(bgg_name)`，`ON UPDATE CASCADE ON DELETE CASCADE`**（所以這張表在 `bgg_name` 改名時會跟著變；刪遊戲會連帶刪列但**不刪 Storage 檔案**）。
- **`game_documents` RLS**：`documents public read`（SELECT，anon＋authenticated，`true`）、admin insert／update／delete（`is_admin()`）。**結論：這張表任何人都讀得到，規則書文字絕對不能放在這裡**，要另建私有表。
- **Storage**：`storage.objects` 只有 `covers` 的四條政策（公開讀、管理者寫）；**沒有規則書 bucket**。`storage.buckets` 清單使用者**尚未貼回**（接手先問或再查）。
- **`is_vip()`**：`select public.is_admin() or exists (select 1 from public.vip_members where user_id = auth.uid())`，security definer、`search_path=''`；管理者也算 VIP，可直接用在後端檢索驗證。
- **資料庫擴充**（`pg_available_extensions`）：`pg_trgm`、`pgroonga`、`unaccent`、`vector`、`pg_cron` 都**可用但都還沒啟用**（`installed_version` 為 NULL）；`zhparser` 不在清單。中文檢索候選：`pgroonga`（據 AI 所知對中日韓文支援較好，**未實測**）、`pg_trgm`（備案）。**現在不啟用任何擴充**，階段 3 用真實規則書比較後再決定。
- **前端**：`GameModal.tsx` 用 `TABS` 陣列＋`tab === 'xxx'` 切換四個分頁（概覽／評分／我的桌遊／規則），加第 5 個分頁「規則助手」很單純；`useGameDocuments.ts` 型別已含 `source_type: 'external' | 'upload'`、`storage_path`，但新增文件時固定寫 `external`、`storage_path: ''`；`GameDocuments.tsx` 只處理 `external`。

### 使用者在本批補充／決定
- **規則書語言**：使用者要附上的規則書**中文、英文都有**，**FAQ 大多是英文**。→ 檢索測試集要涵蓋中英混合與英文術語；`language` 欄位用 `zh`／`en`（約束已支援）。`doc_type` 可索引的建議為 `rulebook`、`faq`、`errata`；`intro`（中文介紹，著作權疑慮較高）與 `video` 不進索引。
- **使用者同意第四批後我提出的 5 項決定，並同意下列補充要求（全部納入第一版規格）**：①管理者瀏覽器用 `pdfjs-dist` 擷取文字；②原始 PDF 存**私有 bucket `rulebooks`**；③VIP 每日 30 次檢索、管理者不限額；④搜尋紀錄**不保存問題內容**；⑤只有存在「有效、已啟用、索引完成」的文件時才顯示分頁；⑥RLS、函式 EXECUTE 權限、後端驗證 VIP（不靠前端隱藏）；⑦索引失敗可復原、**新版本成功後才切換**（失敗時舊索引仍可用）；⑧中文檢索測試集（20～50 題，人工標註正確段落，看是否出現在前 5 筆）；⑨答案附頁碼與依據，證據不足就拒答；⑩額度用資料庫**原子操作**，**只有成功檢索才扣次數**（無結果、系統錯誤、超額都不扣）；⑪記錄版本、語言、來源、授權；⑫搜尋紀錄的用途、保留期限、存取權限寫進 `privacy.html`。
- **規則書授權（使用者的想法與 AI 的提醒）**：使用者認為規則書是自己從 BGG 下載、活動自辦、VIP 不外流，應該沒有著作權問題。**AI 已說明：這些情境有助於理解用途，但不能直接推論沒有著作權風險**（能在 BGG 下載不等於取得再上傳、擷取文字建檔、提供給他人片段的權利；私有 bucket 也不等於授權）；這**不是法律意見**。**使用者尚未對風險控管做出最後決定。** 建議的風險控管（尚待使用者回「照建議」）：①`game_documents` 加「來源」與「授權依據」欄位；②**新上傳的文件預設 `is_active = false`，管理者確認來源與授權後才啟用索引**；③**先用 1～3 份授權明確或自己能確認的規則書做技術驗證**，再擴到 20 款；④只回傳最多 5 段短片段，不提供整本下載；⑤管理者隨時能停用／移除文件。

### 建議的資料結構（只是方案，**尚未給 SQL、尚未動工**）
1. **`game_documents` 補欄位**：`is_active`（預設 false）、`index_status`（`pending／processing／completed／failed`）、`index_error_code`（簡短代碼如 `NO_TEXT`、`PDF_READ_ERROR`；詳細錯誤只放管理者看得到的地方，因為此表公開）、`page_count`、`edition`（版本／版次說明）、`file_hash`（判斷是否真的換檔）、`source_note`、`license_note`、`indexed_version`（目前啟用的索引版本）。此表公開，**不放文字內容**。
2. **新表 `rulebook_chunks`**：`document_id`（外鍵，cascade）、`bgg_name`、`index_version`、`chunk_index`、`page_number`、`section_title`、`content`。RLS 讓訪客與一般會員完全讀不到，VIP 只能透過後端函式。
3. **新表 `rulebook_search_log`**：只存 `user_id`、`bgg_name`、時間；**不存問題內容**；要設保留期限與自動清理；只有必要後端流程寫入、管理者讀取。
4. **私有 bucket `rulebooks`**：讀寫都只有管理者；VIP 不碰 PDF 原檔。
5. **後端函式**：`search_rulebook_chunks(bgg_name, 問題)`（驗證 `is_vip()`→檢查額度（原子）→只搜該遊戲「已啟用且索引完成」的文件→最多 5 段、限制每段與總長度）；`admin_replace_rulebook_chunks(...)`（管理者專用；新版本寫完才切換 `indexed_version`）。**security definer 一律 `set search_path = ''`，並 `revoke ... from public, anon`，只 grant 給需要的角色**。
6. **遊戲識別**：另一個 AI 建議用「穩定 ID」而不是 `bgg_name`。**AI 的看法**：`game_documents` 的外鍵本來就是 `ON UPDATE CASCADE`，但專案其他玩家資料表（評分、已玩、聚會等）刻意以 `bgg_name` 文字對應且無外鍵，為了與現有一致，**建議新表也用 `bgg_name`（可加外鍵 cascade），並用文件 `id`（uuid）做文件層級關聯**；在 Notion 改 `bggName` 的地雷照舊。**此點尚待使用者確認。**
7. **前端**：詳細視窗加第 5 個分頁「規則助手」，只對 VIP／管理者顯示，且只在該遊戲有有效索引文件時出現；預計改 `GameModal.tsx`、`GameDocuments.tsx`、`useGameDocuments.ts`，新增 `RulebookAssistant.tsx`、`useRulebookSearch.ts`、樣式檔、`privacy.html`，並安裝 `pdfjs-dist`。**開工前請使用者貼這三個現有檔案的目前版本**，不要憑舊版覆蓋。
- 第一版**不做** OCR（掃描型 PDF 標為擷取失敗／不支援）、不串付費生成式 AI API、不讓 VIP 下載 PDF、不自動下載 BGG 規則書。
- **提示詞注意**：規則書文字與使用者問題都視為資料，不是指令；複製提示詞時要說明片段會送到使用者自己選的外部 AI 服務。

### 還沒決定／待使用者回覆（接手先問）
1. **每日額度的重置時區**：另一個 AI 建議 UTC，但專案的聚會日用**台北時間**，AI 傾向也用台北時間（凌晨 0 點重置），**待確認**。
2. **搜尋紀錄保留多久**：建議 30 或 90 天自動清理，**待確認**。
3. 上面「規則書授權風險控管」是否照建議（新文件預設停用、先用 1～3 份驗證）。
4. 新表用 `bgg_name` 還是另設穩定 ID（見上第 6 點）。
5. **20 款清單**與**規則書統計表**（遊戲、幾份 PDF、語言、MB／頁數、能否選取文字）仍未提供；另請挑 **1～3 份**當技術驗證樣本。
6. `storage.buckets` 查詢結果尚未貼回。
- 第三批待辦 2（驗證社群平均含管理者那一票）、第二批小項、手機報到流程實測仍有效。

### 下一步（階段 2：設計資料結構與安全機制）
使用者回覆上面待決定項目後：AI 先給 SQL **提案與說明**（新欄位、兩張新表、私有 bucket 與政策、搜尋與額度函式、刪除與清理流程、驗證查詢），使用者確認後才在 Supabase SQL Editor 執行；之後再做上傳與 `pdfjs-dist` 擷取（階段 3）、中文檢索比較與權限測試（階段 4）、前端與 `privacy.html`（階段 5）。每階段驗收完才進下一階段。

---

## 2026-10-27 深夜（第四批）更新（比上方「第五批」舊；與下方舊內容衝突時，以本節為準）

### AI 規則助手：方向定案（只完成規劃，**尚未動任何程式碼、SQL、Supabase 設定**）
- **使用者三個回答（2026-10-27）**：①先挑 **20 款常玩的**；②規則書 PDF 份數、大小、中英文各幾份**還不確定（使用者還沒找資料）**；③**只給 VIP 和管理者用，不開放訪客**。
- **使用者不想付費**，因此**取消**先前 AI 提過的「Edge Function 呼叫 Anthropic API＋每人每日提問上限」方案，**不申請 API 金鑰**。
- **第一版方案（使用者已決定）＝零生成式 AI API 費用**：
  1. 規則書處理方式：**後端私有檢索，只傳送必要片段**（PDF 放私有 bucket，不提供下載、不傳整本給外部 AI）。
  2. 第一版＝**RAG 的「R」（檢索）＋「複製給自己的 AI」**：VIP 輸入問題 → 後端檢索指定桌遊的規則段落 → 顯示原文、頁碼、書名 → 一鍵複製提示詞（問題＋片段＋來源＋回答要求），使用者自行貼到 ChatGPT／Gemini／Claude。網站**不呼叫任何生成式 AI API**。
  3. 生成式 AI（網站內直接回答）：**先完成檢索與引用，之後再評估**。候選是 Gemini 免費 API（有速率限制、免費層級資料可能被用於改善產品，額度與條款會變動，**以上來自另一個 AI 的說明，沒有查證，要做時須重新查官方文件**）；不做「連結使用者自己的 AI 帳號」（使用者的免費訂閱不等於有 API 額度，OAuth 與各家相容性太複雜）；本機 Ollama 只留給進階使用者。
- **提示詞模板要點**：依據提供的官方規則片段回答；先用繁體中文直接回答；說明依據並引用；區分「規則明寫」與「推論」；片段不足就明說需要哪段補充、不要編造；不要把其他桌遊的規則套進來。複製前要提醒使用者：內容會被送到他自己選的外部 AI 服務，**不可宣稱資料仍留在本站**。
- **檢索技術**：第一階段用 **PostgreSQL 全文／關鍵字檢索**，先不做向量與 embedding（避免費用與依賴）；**中文斷詞不同於英文，要用實際規則書測試**，必要時加斷詞、同義詞、標題索引；第二階段看效果再評估語意搜尋。每段要保留：桌遊 ID（bgg_name）、文件名稱與語言、頁碼、章節標題、文字片段、索引狀態、`ai_indexed`。文字型 PDF 優先（滑鼠能框選文字）；掃描圖片 PDF 要 OCR，第二批再處理並抽樣檢查。
- **權限與版權**：訪客與一般登入會員**不可**使用檢索；VIP、管理者可以。**後端每次檢索都驗證 VIP／管理者**（不能只靠前端隱藏）；只回傳必要片段、不提供整本介面；檢索要有頻率限制（防大量擷取）；記錄文件來源與版本；**私有 bucket 不等於取得版權授權**，優先用有授權的規則書，不做公開下載或轉載平台。影片連結永遠不進索引（`ai_indexed` 不可為 true）。
- **「零 API 費用」的意思**：只是不付生成式 AI API 費用；Supabase 儲存、資料庫、流量仍受免費方案限制。

### 分階段計畫（每階段驗收完才進下一階段）
1. **盤點現況（下一步，只讀不改）**：檢查 `game_documents` 實際欄位、相關資料表與函式、RLS、`is_vip()` 與管理者判定、詳細視窗與導覽列如何整合；產出「現有／缺少／需調整」清單、建議的資料結構與後端介面（只提方案）、風險與測試計畫、預計修改檔案清單。
2. **規則書上傳與文字擷取**：管理者上傳、查看、停用；私有 Storage；擷取文字、切段、保留頁碼；顯示處理失敗的文件。
3. **檢索與引用**：全文／關鍵字檢索；限定指定桌遊與啟用中的文件；顯示片段、頁碼、來源；找不到就明說沒找到。
4. **VIP 前端介面**：詳細視窗新增「AI 規則助手」分頁（問題輸入、檢索結果、複製提示詞），明確標示這是規則檢索、不是網站生成的 AI 答案。
5. **安全與品質驗收**：測四種身分（訪客、一般會員、VIP、管理者）；測中英文、找不到答案、錯誤頁碼、不同版本；確認瀏覽器讀不到 PDF 原檔；確認不會意外呼叫付費 AI API。
- **驗收標準**：20 款文件可分別管理；文字型 PDF 能擷取並保留頁碼；結果不混入其他桌遊；可看原文與出處；可複製提示詞；訪客與一般會員無法繞過前端呼叫受保護的檢索；PDF 原檔不公開；網站沒有生成式 AI API 呼叫；找不到時不假裝有答案。

### 使用者還沒做的事（接手先問）
- **20 款清單**（建議從「常玩遊戲排名」前面挑）與**規則書統計表**（遊戲、幾份 PDF、語言、MB／頁數、能否選取文字）。PowerShell 量大小：`Get-ChildItem D:\rulebooks -Filter *.pdf | Select-Object Name, @{n='MB';e={[math]::Round($_.Length/1MB,1)}}`。
- 使用者說今天先休息；本批文件由他 commit、push（是否已 push 接手先用 `git log` 確認）。
- 第三批待辦 2（驗證社群平均含管理者那一票）與第二批小項、手機報到流程實測仍有效。

---

## 2026-10-27 深夜（第三批）更新（比上方「第四批」舊；與下方舊內容衝突時，以本節為準）

### 綜合分數與管理者評分（已 build、commit、push；資料庫 `get_rating_summaries()` 新版 SQL 使用者已確認執行）
- **遊戲卡片改顯示「綜合分數」＝700 減 `score_rank`**（例：Rising Sun 680、Kemet 602、蒼天之死 597）。排序選項同名，方向標示反過來（分數高在上，按鈕顯示「↓ 降冪」）。資料庫欄位 `score_rank` 與 CSV 欄位 `分數_排名` 沒有改；仍**不要揭露 Notion 內的計算方式**，700 只是顯示換算。
- **管理者評分頁**：管理者自己的七項評分由 CSV 換算（`computeAdminScores`，在 `libraryTypes.ts`，另有 `getDisplayScore`、型別 `AdminScores`），評分頁顯示五個圓點，加上「整體 N / 10」「適合留下來 N / 5」。VIP 玩家的評分頁維持原樣。
- **換算規則（前端與資料庫兩邊要一致）**：
  - 整體：依 `ranking_engine`，≤25→10、≤50→9、≤65→8、≤80→7、其餘→6。
  - 適合留下來：依 `score_rank`，**只在「玩過」的遊戲之間排名**（`rank()`，同分並列；不含垃圾桶），名次 ≤30→5、≤60→4、≤90→3、其餘→2。
  - **`ranking_engine` 以 .5 結尾＝沒玩過**，七項都不計，評分頁顯示「未玩過」（資料庫端 `ranking_engine = floor(ranking_engine)` 才算玩過）。
  - 喜歡度、影響度、溝通度、變化度、獨特性：取 CSV 對應 `*_emoji` 欄的字元數（去掉 U+FE0F 與空白，上限 5；0 個視為沒有）。
- **決定（使用者 2026-10-27 確認）：管理者的 CSV 分數當成一位評分者，算進社群評分。** `get_rating_summaries()` 新版已執行：`players`（`game_ratings` 排除 `admin_users` 的人，避免管理者重複計算）＋`adm`（由 `board_games` 換算）合併計算；每項仍須 ≥5 人才顯示；`where is_vip()` 的限制保留；回傳欄位與舊版相同，前端不用改。
  - 影響：玩家評分數的「5 人門檻」現在含管理者那一票（4 位玩家＋管理者＝5 人即顯示）；**排行榜的評分榜、適合留下來榜用的是同一個函式的彙總，也會跟著含管理者**。
  - 連動風險：Notion／CSV 的 `ranking_engine`、`score_rank`、`*_emoji` 一改，社群平均會跟著變；在 Notion 改 `bggName` 仍會讓玩家評分與管理者換算失聯（見匯入地雷）。
- 涉及檔案：`App.tsx`（`adminScores` 的 useMemo，傳給 `GameModal`）、`libraryTypes.ts`、`GameCard.tsx`、`SortControl.tsx`、`GameModal.tsx`。
- 教訓：使用者曾把 `adminScores={...}` 貼進 `TrashSection` 而不是 `GameModal`，兩處都有 `isAdmin={isAdmin}`，給步驟時要寫清楚是哪個元件、貼在哪個標籤底下。

### 待辦（接續順序）
1. 開場：`git pull`、`git status`、`git log --oneline -8`，確認第三批與這兩份文件是否已 push。
2. 驗證社群平均：打開一款有 5 位以上玩家評分的遊戲，確認評分數含管理者那一票；再看沒人評分的遊戲（玩過的）是否顯示 1 人、未滿 5 人仍是「評分累積中」。
3. 第二批待辦仍有效（小項、手機報到流程實測）。
4. 規則書 PDF 上傳 → AI 規則助手：**三個問題使用者已回答，方向已改為零 API 費用方案，見上方「第四批」**。

---

## 2026-10-27 深夜（第二批）更新（比上方「第三批」舊；與下方舊內容衝突時，以本節為準）

### git 狀態（接手先用 `git status`、`git log --oneline -8` 確認，不要假設）
- 「深夜更新（第一批）」裡那 6 個未 commit 的檔案**已 commit 並 push**（`git log`：`b244887` 管理中心、`1a74c99` 排序列、`9aea1a7` 我的桌遊統計、`b5daaf5` 更新交接文件）。該節待辦 1 作廢。
- 之後又做了兩批（見下）。**第一批**（人數區間等）使用者回報已 push、已實測。**第二批**使用者回報「有更動成功」（build 與手機測試通過），並已拿到 commit／push 指令；**是否已 push 未確認**。第二批共 5 個檔案：`index.html`、`public/privacy.html`、`src/components/PlayCounter.tsx`、`src/lib/useGameRatings.ts`、`src/styles/vip.css`（`privacy.html` 的改動只有評分名稱，是正確的、要保留）。
- 使用者要求把這兩份交接文件（`PROJECT_CONTEXT.md`、`QUICKSTART.md`）一起 commit、push（本次例外，平常只在使用者要求時才 commit）。

### 第一批（已 push、已實測）
- **進階篩選「我們有幾個人」改成人數區間**（最少～最多兩個下拉）：規則是**整個區間都玩得起來才列出**（`lo ≥ minPlayers` 且 `hi ≤ maxPlayers`，人數缺值不排除）；只選一邊＝剛好該人數；前後顛倒自動對調。`libraryTypes.ts` 新增 `getGroupRange`、`fitsGroupRange`；`App.tsx` 新增 `groupSizeMax` 與 `groupRange`（useMemo），`filteredGames`／`missingDataCount`／`activeFilterCount`／`clearFilters` 已同步。
- **進階篩選標題列固定**（`.drawer-header` sticky，✕ 不會被捲走）、**BGG 難度五顆同一排**（`.filter-pills-5`，格線五等分）。
- **遊戲卡片等高**（`cards.css` 底部：卡片 flex 直排、「詳細資料」按鈕 `margin-top: auto` 貼底；清單檢視維持橫排；`@media (hover: none)` 取消 hover 上抬，避免 iPhone 點過的卡片卡在被抬高的狀態）。
- **「我的俱樂部」✕ 固定在抽屜右上角**（`mylist.css` 底部 `.club-close` absolute）。

### 第二批（build、手機測試通過；是否已 push 見上）
- **標題變淡的原因與修法**：使用者的 iPhone 開**深色模式**，沒有指定顏色的文字（各視窗的 `h2` 標題）會繼承瀏覽器預設的淡白色。已在 `vip.css` 最底下加 `:root { color-scheme: light; }` 與 `body { color: var(--c-ink, #34463c); }`（強制淺色）。同批還有 `:where(button:not(:disabled)) { color: inherit; }`（修 iPhone 按鈕文字變藍；使用者說已套用）。**之後新增任何視窗標題，都不要依賴繼承色。**
- **`index.html` 的 `<html lang>` 改成 `zh-Hant`**：原本是 `en`，手機 Chrome 會跳出「英文／繁體中文」翻譯列、蓋住畫面上方（也是「我的俱樂部」標題看起來被切掉的原因）。
- **評分名稱統一成「度」**：評分分頁（`useGameRatings.ts` 的 `label`）改成**影響度、溝通度、變化度**，與概覽一致（概覽的「變化度／溝通度／影響度／複雜度」本來就是度）；`privacy.html` 同步。**只改畫面文字，`key` 不動。`parseCsv.ts` 裡的 CSV 欄位名稱（`溝通性`、`玩家影響性`、`複雜性`、`變化性`、`玩家影響性排名`）是使用者 Notion 的欄名，絕對不能改**，改了匯入會報「缺欄位」。「獨特性」「快速性」使用者沒列入，**維持原樣**（已問，尚未回覆是否也要改成「度」）。
- **記錄遊玩次數時自動標「已玩」**（使用者回「照建議」）：`PlayCounter.tsx` 的「＋」在尚未標已玩時一併設 `played: true`（用 `skipPlayedRule: true`，避免次數被多算）；「記錄一次遊玩」（`PlaySessions.tsx`）本來就會標已玩。起因：我的統計顯示「玩過 0 款、總遊玩次數 2 次」，自相矛盾。**舊資料補標 SQL 已給使用者（先 `select count(*)`，大於 0 再 `update public.user_game_status set played = true where played = false and play_count > 0;`），是否已執行未確認**；補標的幾筆會算成「今天新增已玩」（觸發器寫 `played_first_at`），影響很小。

### 手機檢查結果（2026-10-27 晚，使用者傳 15 張 iPhone 截圖，AI 已看過）
- 正常：詳細視窗四個分頁（概覽／評分／我的桌遊／規則）、遊戲卡片（按鈕已對齊）、排行榜四個榜與空狀態、集點卡（錢包卡、規則收合）、我的統計、我的俱樂部抽屜、暱稱與聯絡方式視窗、暱稱選單。
- **未解決（低優先）**：截圖 2、3、13～15（沒有網址列的那幾張）底部，詳細視窗與底部導覽列的**下方都露出一條約 76px 的遊戲卡片內容**（沒有被遮罩蓋住）。`tabs.css` 手機版寫 `.game-modal.has-tabs { height: 100dvh }`、`.modal-backdrop { padding: 0 }`，`modal.css`、`account.css` 的 `.modal-backdrop` 也沒問題，**CSS 看不出原因**，疑似該瀏覽器環境（LINE 內建？Safari？加到主畫面？）本身的特性。**已問使用者那幾張是用什麼開的，尚未回覆。** 若是 LINE 內建瀏覽器，朋友多半從 LINE 點連結進來，值得處理。
- 還沒在手機走過完整**報到流程**（登入→暱稱→自動報到→評分→集點卡）；要等下次聚會，或用另一個 Google 帳號測。
- 「資料庫小驗證」：`gathering_checkins.capacity` 已確認 **NOT NULL**（`is_nullable` = `NO`）。**`to_regclass('public.gathering_plays')` 是否為 null、`cover_slug !~ '^[a-z0-9_-]+$'` 是否 0 列，仍未收到結果。**

### 使用者確認的事實
- **目前網站是 106 款，不是 107 款**（舊文件裡的 107 已全部改成 106）。

### 待辦（接續順序）
1. 開場：`git pull`、`git status`、`git log --oneline -8`，確認第二批與這兩份文件是否已 push；問補標「已玩」的 SQL 是否已執行。
2. 小項（使用者有空再回）：截圖底部露出內容是用什麼開的；「獨特性／快速性」要不要也改成「度」；`gathering_plays` 與 `cover_slug` 兩個驗證；管理中心「近期聚會依月份分組」是否符合使用者說的「新增月份」；`MemberAdmin.tsx` 在手機是否仍擠壓（沒看過檔案）。
3. 手機報到流程完整實測。
4. **規則書 PDF 上傳（私有 bucket）→ AI 規則助手（RAG，最重要的長期目標）**。**開工前要使用者回答三件事（已問，尚未回覆）**：①先做全部 106 款，還是先挑 10～20 款常玩的？②規則書 PDF 大概幾份、多大、中英文各幾份？③只自己用、只給 VIP 朋友問，還是也開放訪客（著作權與費用）？建議分階段：範圍與著作權決定 → 私有 bucket 與上傳介面 → PDF 切段保留頁碼＋向量檢索（pgvector，中文可能要混合關鍵字）→ Edge Function 呼叫 AI＋每人每日提問上限（金鑰只放後端）→ 詳細視窗加「AI 查詢」分頁、底部導覽加第 5 顆。
5. 其餘：管理者視窗其他部分的統一風格、PWA（缺圖示）、VIP 朋友名單、推薦牆、拖曳調整排名、VIP 鎖定 SQL（資格要含來過聚會的人）。

### 給接手 AI 的提醒（本批學到）
- **iPhone 深色模式**會讓沒指定顏色的文字變淡白色；使用者手機是深色模式。新增畫面要確認文字顏色是明確指定的，或繼承自 `body`（已設為深墨綠）。
- 使用者在 PowerShell 看到的中文亂碼（例如 `tabs.css` 的註解）只是終端機顯示問題，檔案沒壞；`git diff` 出現 `(END)` 時按 `q` 離開。
- 這次使用者一次傳了 15 張手機截圖，AI 看完後**一次整理成一批**修改，效率很好；之後手機檢查維持這個做法。
- 使用者說「好了」、「沒問題了」代表該批已 build、測試完成；他不一定貼測試結果，重要項目仍要再確認。

---

## 2026-10-27 深夜更新（第一批；比上方「第二批」舊，與下方舊內容衝突時，以本節為準；其中「尚未 commit 的 6 個檔案」已 push）

### 已 push（`git log` 已確認）
- `c56e3fc` 我的桌遊改版、`b2c4d6a` privacy.html 補免費券說明、`4803d8d` 排行榜空狀態、`3bf83a5` 集點卡改版（近期紀錄只顯示最近 5 筆）。
- **自動用券第二批 SQL 已確認執行**（使用者截圖：`settle_vouchers_on_rating`、`settle_vouchers_on_attendee` 兩個觸發器都在）。
- **尚未 commit 的 6 個檔案（使用者貼的 `git status`；是否已 build、commit、push 接手先問）**：`src/MyList.tsx`、`src/styles/mylist.css`、`src/styles/library.css`、`src/components/AdminCenter.tsx`、`src/LoyaltyAdmin.tsx`、`src/styles/vip.css`。建議 commit 訊息分三組：我的桌遊／排序列／管理中心。

### 本日完成的內容
- **「我的桌遊」抽屜（`MyList.tsx`）**：想玩／已玩數字方塊改成分頁按鈕（`activeTab`，預設想玩），清單直接顯示在下方，**已沒有「返回」流程**；空清單才顯示「去逛收藏」；**「我的統計」**是抽屜內第二個畫面（`view: 'home' | 'stats'`，有「‹ 返回」）：玩過幾款、總遊玩次數、約略總時數（次數×BGG 時間，`Math.round(分鐘/6)/10` 小時，沒時間資料的遊戲不計）、最常玩 TOP 3；使用者要求**「我的統計」入口放在已玩清單上面**（`club-more` 區塊移到第一個 `club-list` 上方）。`MyList` 新 props：`todayPending`（來自 `App.tsx` 的 `todayTask.pending`）、`onOpenLoyalty`（`openMyLoyalty`）；`todayPending` 為真時顯示「今天有聚會，還沒評分／去評分」卡（`club-today`），按鈕打開集點卡抽屜。`ClubPoints` 提示文字已改新規則，並在有券時顯示金色免費券卡（`usableVouchers`，另有 `availableVouchers − usableVouchers` 張「明天起才能用」）。`.club-menu-item`、`.mylist-name` 加深墨綠文字色（iPhone 預設會變藍）。
- **排行榜空狀態（`Leaderboard.tsx` 的 `renderEmpty()`）**：依情況說明為什麼是空的（期間內沒新增、沒人標記、評分未滿 5 人、評分讀取中）並附按鈕（看全部期間／去逛收藏／先看想玩榜）。樣式 `.lb-empty*` 在 `leaderboard.css`。評分榜空時刻意不顯示「目前有幾款在累積」（不確定未滿 5 人時資料庫是否回傳人數）。
- **集點卡改版（`LoyaltyCard.tsx`、`loyalty-card.css`）**：配色改用 `tokens.css` 變數；點數、免費券、兩個印章格包進 `lc-wallet`；「如何取得點數／規則」改成 `<details className="lc-fold">` 預設收起；**近期紀錄預設只顯示最近 5 筆（`RECENT_DAYS`，`loyalty.days` 由新到舊）**，其餘按 `lc-more`「顯示全部 N 筆」；若邀請連結的日期（`focusDate`）在被收起的部分，會自動全部展開（`focusHidden`）。補上原本缺少的 CSS（`lc-stat-sub`、`lc-session-title`、`lc-day.focus`、`lc-today-ticket`）。
- **排序列（`library.css`）**：刪掉手機版 `.sort-reset.is-hidden { display: none }`，改成 `.sort-dir`、`.sort-reset` 寬度固定（`flex: none`、重設 `min-width: 56px`），「重設」沒用到時只是看不見（`visibility: hidden`），**升冪／降冪位置不會跑**。
- **管理中心（`AdminCenter.tsx`、`LoyaltyAdmin.tsx`、`vip.css`）**：大分頁改成三等分膠囊、圖示在上字在下，標籤縮短為「成員」「聚會集點」「資料匯入」（`ac-tab-ico`、`ac-tab-label`）；小分頁（聚會設定／集點狀況／免費券紀錄）三等分；手機（≤520px）視窗加寬（`.ma-backdrop` padding 8px、`.ac-modal`／`.ma-modal`／`.st-modal` padding 14px 12px）；成員列在手機改成換行（`.ma-row` 換行、`.ma-who` 佔滿一行），解決暱稱被擠成直排（**這是只看 CSS 推測的修法，`MemberAdmin.tsx` 沒看過，若仍有問題要請使用者貼該檔**）；搜尋框與下拉在 iPhone 改成墨綠 16px 字。**「近期聚會」改成依月份分組**（`monthKeys`、`openMonths` 狀態；預設展開最新一個月與本月，其餘收起；按月份標題 `lga-month-head` 展開／收合），**點開某一天，聚會詳情直接出現在那一列下面**（原本在整個列表最下方；`LoyaltyAdmin.tsx` 的 `{g.id === selectedId && selected && (...)}` 已搬進該列 `<li>` 內），再按一次收起。**使用者說的「新增月份」被理解為「依月份分組」，尚未確認是否符合原意。**
- 這批新增的覆蓋樣式**全部貼在 `vip.css` 最底下**（`vip.css` 最後載入，同權重時後面的贏）。`loyalty-admin.css` 與 `loyalty-admin_1.css` 使用者貼過兩份，內容完全相同（沒有差異）。

### 本日作廢／已完成的舊說明
- 傍晚待辦 1（「我的桌遊」抽屜改版 ①～⑥ 項）→ 已完成，其中「去評分」卡是用 `todayPending` 重用 `useTodayTask`，沒有另外算一次。
- 傍晚待辦 3（`privacy.html` 補免費券說明）→ 已完成並 push。
- 「兩份 SQL 是否都已執行：第二批未確認」→ 已確認執行。
- 「『我的桌遊』抽屜首頁有想玩清單／已玩清單入口列」→ 已拿掉。
- 傍晚說明中「`loyalty-card.css` 底下可能殘留 `.modal-backdrop.voucher-backdrop`」→ 已請使用者刪除（接手可用搜尋確認）。

### 待辦（接續順序）
1. 先確認上面 6 個檔案是否已 build、commit、push；手機實測：排序列、我的統計位置、管理中心三個分頁、近期聚會就地展開與月份分組。
2. 若管理中心「成員與 VIP」在手機上仍擠壓，請使用者貼 `src/components/MemberAdmin.tsx` 直接改程式。
3. 視覺改版剩下：管理者視窗其他部分的統一風格（按鈕兩種：主要森林綠實心、次要外框；表格與列表間距）、**手機全面檢查**（遊戲卡片 4／9 欄在手機的實際欄數、詳細視窗、報到流程、各彈窗；使用者用手機截圖回報問題，AI 一次整理成一批）。
4. 規則書 PDF 上傳（私有 bucket）→ AI 規則助手（RAG，最重要的長期目標）。
5. PWA、VIP 朋友名單、推薦牆、拖曳調整排名、VIP 鎖定 SQL（資格要含來過聚會的人）。
6. 仍未驗證：`gathering_plays` 是否已 drop、`capacity` 是否 NOT NULL、`makeCoverSlug` 新版是否已套用並重新匯入（`cover_slug !~ '^[a-z0-9_-]+$'` 應為 0 列）。

### 給接手 AI 的提醒（本日學到）
- 使用者貼的檔案是當下最新版沒錯（本日多次用 `git log`／`Select-String` 驗證過），但**聊天室只在他貼過的檔案範圍內可信**；這次管理中心的樣式分散在 `vip.css`（`ma-`、`ac-`）、`loyalty.css`（`loy-`）、`admin.css`（`admin-`）、`loyalty-admin.css`（`lga-`）四個檔案，改外觀前先用 `Select-String -Path src\styles\*.css -Pattern "\.類別名"` 找出 class 在哪裡。
- 修改量大又要「搬一大塊 JSX」時（例如本日的聚會詳情），給明確的搜尋關鍵字與起訖行，並請他 build 通過再 commit。

---

## 2026-10-27 傍晚更新（與下方舊內容衝突時，以本節為準；但比「深夜更新」舊）

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

## 1. 專案簡介

- **名稱**：桌遊規則助手（BOARD GAME COMPANION）；網站已上線 https://board-game-result-ai.vercel.app/
- **目標**：桌遊收藏與規則查詢網站，最終能詢問 AI 解決規則爭議（AI 規則助手是最重要的長期目標，見第 9 節）。
- **使用模式（重要）**：網站**公開瀏覽，也開放訪客問 AI，但只有使用者本人（管理者）能編輯**（匯入 CSV、上傳封面、管理聚會）。訪客不能更動內部設定。
- **資料量**：106 款桌遊（使用者 2026-10-27 確認）（使用者在 Notion 整理後匯出 CSV）。使用者的朋友圈是主要玩家，保留讓其他人加入的可能。
- **本機路徑**：`D:\BoardGameResultAI`（Windows、PowerShell、用 `npm.cmd`）；使用者會在多台電腦作業，見第 11 節。

## 2. 技術架構與部署

- 前端：React + TypeScript + Vite。後端：**Supabase（免費方案，首爾）**，提供資料庫、登入（Google）、Storage。專案 ID `hgeuockbjrzayfdylavq`，Project URL `https://hgeuockbjrzayfdylavq.supabase.co`（給前端的是**根網址**，不加 `/rest/v1/`）。前端只用 **Publishable key**；**Secret／service_role key 絕對不能放進網站或貼給任何人，目前完全沒用到。**
- 部署：GitHub → Vercel，**正式分支 `master`**，push 後自動建置；其他分支只產生預覽。
- 環境變數：本機 `.env.local`（不在 Git 裡）與 Vercel 後台都有 `VITE_SUPABASE_URL`、`VITE_SUPABASE_PUBLISHABLE_KEY`。**地雷**：Vercel 對 `VITE_` 變數必須選 **Config**（不是 Secret）；變數名稱錯一個字母，網站會悄悄退回本機備用資料；改環境變數要重新部署才生效。
- 指令（PowerShell）：`npm.cmd run dev`（`http://localhost:5173/`）、`npm.cmd run build`（成功顯示 `✓ built in ...`；「chunks larger than 500 kB」可忽略）。
- 資料更新流程：Notion → 匯出 CSV → 網站頁尾「管理者登入」→「匯入 CSV」→ 預覽 →「確認匯入」。不需要 push（資料在雲端）。
- **push 注意**：不要用 `git add .`，逐檔 add；**請使用者用命令列 commit，不要在 TortoiseGit 用 Amend**（2026-10-22 因此造成 master 與 origin/master 分岔，修法是備份後 `git reset --mixed origin/master` 再逐檔 add）。不要上傳：`boardgame_source.zip`、`supabase_import.sql`、`make_supabase_import.py`、`boardgames.csv`、`categories_check.txt`、`covers_needed.txt`、`list_categories.py`、`generate_boardgames.backup.py`、`.env.local`、`App.css.bak`、`client_secret_*.json`。`PROJECT_CONTEXT.md`、`QUICKSTART.md` 只在使用者要求時才 commit。
- Windows 的 `LF will be replaced by CRLF` 警告可忽略；PowerShell 顯示 UTF-8 中文亂碼只是終端機問題。
- `src/data/boardGames.generated.ts`：本機備用資料與 `BoardGame` 型別（**不要手動改、不要刪**）。`public/covers/` 是舊封面（備援）。
- **前端結構**：`src/App.css` 是入口檔，只有 `@import`（**順序有影響，不要調換**）：`tokens`（設計變數）、`base`、`topbar`、`hero`、`library`、`filter`、`cards`、`modal`、`admin`、`mylist`、`footer`、`trash`、`docs`、`backtotop`、`tabs`、`ratings`、`leaderboard`、`loyalty`、`loyalty-card`、`loyalty-admin`、`account`（最後載入，可覆蓋前面）、`sitebar`。`src/App.tsx` 只留 `Library` 的狀態、篩選與排序；畫面在 `src/components/`；型別與工具在 `src/lib/`（完整清單見 QUICKSTART）。另有 `AdminPanel.tsx`、`PlayerPanel.tsx`、`MyList.tsx`（畫面叫「我的桌遊」）、`LoyaltyAdmin.tsx`、`GameDocuments.tsx`。

## 3. 資料庫、儲存與權限（Supabase）

**通則**：RLS 全開；「Allow new users to sign up」**已開啟**（玩家用 Google 登入），所以**所有寫入政策只能是 `auth.uid()` 等於本人，或 `is_admin()`，不可寫成「所有 authenticated」**。管理者身分以 `admin_users` ＋ `is_admin()` 判斷，**登入不等於管理者**；管理者帳號是 Authentication → Users 手動建立的 1 個 Email＋密碼帳號。**新建任何資料表都要加**：`revoke all on 表 from anon; revoke truncate, references, trigger on 表 from authenticated;`，並用 `information_schema.role_table_grants` 確認 `anon` 無權限。**刻意不對 `board_games` 加外鍵**（玩家資料以 `bgg_name` 文字對應）。免費方案：閒置一週會暫停；檔案儲存約 1 GB。

| 資料表 | 重點 |
|---|---|
| `board_games`（主鍵 `bgg_name`，`cover_slug` 唯一） | 欄位為前端 `BoardGame` 的 snake_case：`name, cover_slug, link_bgg, link_rulebook_zh/en, link_faq`（三個 link 欄保留但不用）、`category(text[])`、`bgg_score/difficulty/time`、`min/max_players`、`best_players/recommend_players(int[])`、`ranking_engine, classic_game_ranking, score_rank` 與四個其他排名、七個 `*_degree`、七個 `*_emoji`、`created_at`、`removed_at`（垃圾桶）、`removed_reason`（≤200）、`description`（≤300，預設空字串）。SELECT 所有人，寫入只有管理者。缺值為 NULL 或空字串。**前端 `id` 只是流水號，不可用來對應圖片或使用者資料。** |
| `game_documents` | 規則書／FAQ 等連結，一款可多份。`bgg_name` 外鍵（cascade）、`doc_type`（`rulebook/faq/errata/intro/video/other`）、`language`、`title`、`source_type`（`external/upload`）、`external_url`、`storage_path`、`ai_indexed`（預設 false；**影片永遠不可為 true**）。目前只用 external。刪遊戲會連帶刪資料列但**不刪 Storage 檔案**。 |
| `user_game_status` | 主鍵 `(user_id, bgg_name)`：`want_to_play`、`played`、`note`（≤500）、`play_count`（沒有日期的次數，0～999）、`updated_at`、`want_first_at`／`played_first_at`（**觸發器只在第一次勾選時寫入，取消再勾不變**）。取消勾選不刪列，前端略過全空的列。RLS 只有本人。 |
| `game_play_sessions` | 有日期的遊玩紀錄：`user_id`、`bgg_name`、`played_on`、`player_count`(1～99)、`note`(≤200)。**畫面總次數＝`play_count`＋該遊戲紀錄筆數**；新增紀錄不動 `play_count`，刪紀錄不取消已玩。單次查詢最多 1000 筆。 |
| `game_ratings` | 主鍵 `(user_id, bgg_name)`：`overall`(1～10)、`like/player_impact/communication/change/unique/keep_score`(1～5)。整體與 `keep_score` 必填（not null），其餘選填。個別評分只有本人看得到；公開只有函式 `get_rating_summaries()`（security definer，anon 可呼叫）的彙總，**門檻 5 人在函式內判斷**（六項各自計算）。 |
| `player_profiles` | 暱稱（公開、不含 Email）。 |
| `player_contacts` | **LINE／FB 名字（敏感）**：`user_id` pk → `auth.users` cascade、`contact_name`(1～40)。SELECT 本人或管理者、INSERT／UPDATE 本人、DELETE 只管理者；anon 無權限（已驗證）。**不可放進公開的 `player_profiles`，也不可顯示在任何公開畫面。** |
  | `gatherings` | 聚會日：`id`、`gathered_on`、`title`（場次名稱）、`note`（≤200）；唯一條件是 `(gathered_on, title)`，重複回 23505。 |
| `gathering_attendees` | `(gathering_id, user_id)`、`exempt`（免評分）、`source`（`admin`/`self`）。**INSERT／UPDATE／DELETE 只有管理者**（玩家只能透過 `join_gathering`）；玩家可讀自己的列。 |
  | `gathering_games` | 當天指定的遊戲（`gathering_id`、`bgg_name`）。`gathering_plays`（「我玩了」）已於 2026-10-26 移除。 |
| `gathering_checkins` | 報到設定：`gathering_id` pk、`token`（隨機、唯一）、`is_open`、`capacity`（1～500，**NOT NULL**）。**只有管理者可讀寫**（玩家讀不到 token）。 |
| `loyalty_redemptions` | 免費券使用紀錄：`id`、`user_id`、`redeemed_at`、`redeemed_by`（管理者補登時有值，自動用券為 null）、`used_on`（用在哪一天的聚會日，管理者補登為 null；`(user_id, used_on)` 唯一）。永久保留、沒有刪除功能，要刪用 SQL。 |

**資料庫函式**：`is_admin()`、`get_rating_summaries()`、社群統計彙總函式（security definer，只回人數）、`loyalty_day_status(p_user)（新規則：出席＋任一款指定遊戲評分完整，或免評分；舊聚會日沿用遊玩紀錄規則）`（點數核心，見第 7 節）、`loyalty_totals(uid)`（本月點數、總點數、累積券；定義尚未確認，應以前者為基礎）、玩家用 `get_my_loyalty_summary`／`get_my_loyalty_days`、管理者用 `admin_get_loyalty_overview`／`admin_get_loyalty_days(p_user)`／`admin_redeem_voucher(p_user)`、`join_gathering(p_token)`（玩家報到的唯一入口；只在聚會當天有效；報到後由觸發器 `attendee_makes_vip` 自動成為 VIP）、觸發器函式 `set_user_game_status_times()`、`mark_played_from_activity()只掛在 game_ratings`、`game_ratings_set_updated_at`。**security definer 函式一律 `set search_path = ''`，並 `revoke ... from public, anon`（需要的才 grant）。改函式前請使用者在 SQL Editor 匯出實際定義。**

**Storage**：公開 bucket `covers`（任何人可讀，寫入只認管理者），檔名 `{coverSlug}.webp`，**必須是 ASCII**。規則書 PDF 將來要用**私有** bucket（著作權）。

## 4. 前端資料欄位（`BoardGame` 型別）

- `id`、`name`（中文名，CSV「屬性」）、`bggName`、`slug`、`coverSlug`、`links{bgg,rulebookZh,rulebookEn,faq}`、`category[]`、`bggScore/bggDifficulty/bggTime`、`minPlayers/maxPlayers`、`bestPlayers/recommendPlayers`（獨立，不要合併）、`rankingEngine`、`classicGameRanking`（網站稱「常玩遊戲排名」，CSV「老遊戲想玩綜合評分」）、`scoreRank`（「綜合分數排名」，CSV「分數_排名」）、四個其他排名（保留但不排序、不顯示）、七個 `*Degree`、七個 `*Emoji`。
- **CSV 必要欄位**（缺任何一個，預覽報錯、不寫入）：`屬性`、`bggName`、`類型`、`bgg網站`、`BGG分數`、`BGG時間`、`BGG難度`、`Ranking engine`、`分數_排名`、`人數上限`、`人數下限`、`推薦人數`、`最佳人數`、`喜歡度`、`快速性`、`溝通性`、`獨特性`、`玩家影響性`、`複雜性`、`變化性`；選填 `簡介`。欄位順序與檔名不重要，多的欄位忽略。「類型」逗號分隔轉陣列（共 49 種，大項 3 個：策略、派對、陣營；類型清單自動整理）；人數欄逗號分隔轉數字陣列；「最佳人數 」欄名尾端可能有空白（`cleanText` 處理）。「墨敵賽」無網路資料，BGG 分數與難度保留 `null`、顯示「未提供」，**不要編造**。
- **不要揭露「綜合分數排名」的計算方式**（Notion 中由數個排名相加），也不要在前端重算。排序只保留：Ranking engine、常玩遊戲排名、綜合分數排名（皆由小到大）、名稱、BGG 分數／難度／時間、最佳／推薦人數；缺值固定排最後。
- **封面**：`coverSlug` 由 `bggName` 轉換（純英數維持原代號；含中日文者保留英數字部分加 8 位 FNV-1a 雜湊；完全無英數則 `game-<hash>`，`makeCoverSlug` 在 `parseCsv.ts`）。顯示順序：Storage `{coverSlug}.webp`（上傳後網址加 `?v=` 以立即換圖）→ `public/covers/` → 🎲。Console 的封面 404 是正常的。匯入時 `matchCovers` 依檔名對應封面（完全相同 → 去括號／中文名相同 → 名稱開頭相同；多款符合則略過）。**教訓：任何要當檔名或 Storage key 的字串都必須是 ASCII**（曾因 `兵臨城下.webp` 上傳失敗）。套用新版 `makeCoverSlug` 後應重新匯入，並確認 `select bgg_name, cover_slug from public.board_games where cover_slug !~ '^[a-z0-9_-]+$';` 為 0 列（**使用者是否已做尚未確認**）。

## 5. CSV 匯入的行為（`AdminPanel.tsx`）

- 順序：upsert → 上傳封面 → 把「資料庫正常、CSV 沒有」的遊戲**移到垃圾桶**（設 `removed_at`）。不刪資料列、不刪封面。
- 預覽分三類：①會移到垃圾桶（紅字名單）；②CSV 有、但目前在垃圾桶（資料更新、**仍留在垃圾桶**，不自動還原；要自動還原就在 `toRow` 加 `removed_at: null`）；③垃圾桶裡本來就有、CSV 也沒有（維持原狀）。一次移到垃圾桶超過 5 款要輸入「移除」。
- 「簡介」欄選填：沒有該欄或空白，都不覆蓋資料庫原有簡介（CSV 無法清空簡介）。
- **永久刪除只在垃圾桶區由管理者手動做**（刪 `board_games` 列與 `{coverSlug}.webp`；不清玩家資料；封面刪除後無法復原）。
- **地雷（最重要）：在 Notion 改 `bggName`** → 舊的進垃圾桶、新的當新遊戲（封面要重傳）；新舊 `cover_slug` 相同會撞唯一限制；**玩家的想玩／已玩／評分／聚會紀錄以 `bgg_name` 對應，改名會讓紀錄失聯**（資料還在、畫面不顯示）。補救：①改回原名再匯入，並在垃圾桶按「還原」舊的；②真的要改名，需要用 SQL 把所有含 `bgg_name` 欄位的資料表一起改（先用 `select table_name from information_schema.columns where table_schema='public' and column_name='bgg_name';` 找出全部，再由 AI 依結果寫腳本）。
- 匯入後請使用者執行 `select bgg_name, created_at from public.board_games order by created_at desc limit 5;`，確認舊遊戲的 `created_at` 沒被重設（新遊戲標示靠它：30 天內顯示橘框＋NEW；現有遊戲要先補成 `2026-09-01T00:00:00+00`）。

## 6. 主要功能的決定與規則（已完成）

- **搜尋／篩選／檢視**：首頁類型膠囊（類型多選為 AND，前三個固定策略／派對／陣營）＋「進階篩選」抽屜（難度、最佳／推薦人數、時間、我的紀錄）、缺資料提示、標題列排序（`SortControl`）、檢視模式（`list`／`grid-4`／`grid-9`，存 `localStorage` 鍵 `boardgame-view-mode`）。「我的紀錄」篩選：三顆眼睛（想玩／未標記／已玩）＋「依我的紀錄分區顯示」，`getMineGroup()`：有想玩→want，否則有已玩→played，否則 untouched。
- **詳細視窗（`GameModal.tsx`）**刻意精簡（使用者不要再放排名、人數、類型、時間、難度）：頂部固定，四個分頁：**概覽**（簡介、遊戲屬性、大家的評分摘要、管理者的封面上傳與「移到垃圾桶」）、**評分**、**我的桌遊**（想玩／已玩、次數、遊玩紀錄、備註）、**規則**（規則書／FAQ／中文介紹／影片連結，只接受 http(s)；管理者可新增）。AI 查詢分頁等 AI 規則助手做出來再加。卡片按鈕叫「詳細資料」。
- **垃圾桶**：所有人看得到，只有管理者能移入（填原因）、還原、永久刪除、編輯原因；0 款時整區隱藏是設計如此。資料庫政策不改（Anyone can read；Admin insert／update／delete）。
- **想玩／已玩（`usePersonalCollection.ts`）**：訪客存 `localStorage`（鍵 `boardgame-personal-collection`），登入後以雲端為準；登入後更新「先改畫面再寫雲端，失敗還原」；首次登入有合併視窗（兩邊聯集、備註保留雲端、次數取大值、雲端寫入成功才清本機）。訪客紀錄不會跨瀏覽器。遊玩次數計數器：－／＋（0～999），按「已玩」不加次數（次數為 0 時才設為 1）。
- **公開評分（`useGameRatings.ts`、`RatingSection.tsx`）**：整體 1～10＋適合留下來 1～5 必填，其餘五項選填；未滿 5 人顯示「評分累積中」；社群平均與使用者自己的 Emoji 評價並排，**不要與「綜合分數排名」混用**。評分項目沿用使用者的用語，**不要把「玩家影響性」改名成「玩家互動」**；複雜度、快速性是遊戲屬性、不列入評分。**完整評分＝七項皆非空。**
- **社群統計**：每款顯示想玩／已玩人數與月／季／年「期間新增」（以 `*_first_at` 計算）；只回傳彙總；訪客不計入。**不加「讚」按鈕**；不做公開留言板。
- **排行榜**：想玩、已玩（全部／本月／本季／本年）、整體評分、適合留下來（滿 5 人才上榜，平均到小數 1 位）；同分並列、前 10 名；只用彙總。
- **簡介**：管理者在「概覽」編輯；使用者說太耗時間，**先跳過**。若請 AI 擬稿：只寫「這款在玩什麼」一到兩句自己的話，不翻譯或改寫 BGG 簡介。
- **自動標「已玩」**：評分過就視為已玩（資料庫觸發器 `mark_played_from_activity()` 只掛在 `game_ratings`，取消不會取消已玩）；前端剛評完分時也即時更新畫面（App.tsx 的 effect）。
- **`privacy.html`**：日後新增功能要同步更新。已涵蓋：遊玩紀錄、評分、社群統計、排行榜、集點卡、聯絡方式；「VIP 名單、管理者可見內容、報到、帳號刪除已於 2026-10-26 補上」。

## 7. 帳號、聚會與集點卡

- **登入**：Google OAuth（Google Cloud 專案 `board-game-site`，已發布為正式版、只用基本範圍；**不要新增敏感或受限範圍**，否則會觸發驗證與 100 人上限；接近 80 人時回 Google Auth Platform「目標對象」確認）。Client Secret 只存在 Supabase，不進 Git／前端／Vercel／對話。**不採用匿名帳號**。管理者的 Gmail 若同時 Google 登入會對到管理者帳號，測玩家身分要用另一個 Google 帳號。一人多帳號無法完全阻止，靠「每人每款一筆＋唯一限制＋RLS」，規模變大再加 CAPTCHA。
- **LINE／FB 等 App 內建瀏覽器不能 Google 登入**（Google 政策，使用者實測被擋）。對策：登入前偵測（`src/lib/googleLogin.ts` 的 `signInWithGoogle()`，所有登入入口都走它），改顯示 `InAppBrowserNotice`「請改用瀏覽器開啟」並提供複製網址；管理者複製的聚會連結結尾加 `&openExternalBrowser=1`（LINE 會用手機瀏覽器開啟，**尚待實測**）。
- **玩家登出選單**：暱稱 ▾ →「修改暱稱與聯絡方式／登出」；管理者的登出在頂端列。暱稱視窗第一次登入或尚未填聯絡方式時自動跳出（暱稱與 LINE／FB 名字必填，可「稍後再說」）。
- **視窗必須 `createPortal(..., document.body)`**；`.modal-backdrop` z-index 1100，報到視窗 1050，「請改用瀏覽器開啟」1200，頂端列 900，「我的桌遊」抽屜 1200，VIP 密碼視窗 1300（.vip-join-backdrop）。**頂端列（`.topbar`／`.sitebar`）不可加 `backdrop-filter`、`transform`、`filter`**，否則 `position: fixed` 的遮罩會被關在頂端列裡（暱稱視窗只露出一條，2026-10-26 發生過）。
- **集點規則**並指定當天遊戲；玩家報到（或被管理者加入）＝當天有來；**當天指定遊戲任一款七項評分完整，就得 1 點**（評分可在家補、可以是以前評的）；`exempt` 免評分直接得點。一天只算 1 點（同日多場合併）；同月 2 點換 1 張免費券（無期限）；當月只有 1 點到下月 1 日不再計入；兌換紀錄永久保留；已兌換超過累積顯示 ⚠。沒有指定遊戲的舊聚會日沿用舊規則（用 `game_play_sessions` 的日期、每款都評完整）。**沒有「我玩了」勾選**，`gathering_plays` 已移除。函式不讀 `board_games`，改名風險同前（只有在 Notion 改 `bggName`）。所以遊戲被移到垃圾桶或刪除不影響點數（畫面上該遊戲會顯示成英文名稱、沒有「去評分」按鈕）；**只有在 Notion 改 `bggName` 才有風險**。使用者想過用藍牙／區網偵測，**建議不要**。
- **聚會連結（單一連結，2026-10-26 決定）**：管理者在聚會詳情「建立聚會連結」（預設開放）→ 複製 `https://網址/?join=隨機碼&openExternalBrowser=1` 傳給當天要來的人。玩家登入（沒有帳號會自動建立）→ `CheckInDialog` 開啟即自動呼叫（失敗才出現「我來了」按鈕）→ `join_gathering(p_token)` 檢查：已登入、token 有效、**非聚會當天（台北時間）一律回 `not_started`／`ended`，包含已報到者（2026-10-27 改）；已報到者當天回 `already`**、開放中、**台北時間聚會當天**、有暱稱與聯絡方式、未額滿（`for update` 鎖住該場聚會防超額）→ 成功後依序：（已無通關密碼，報到即成 VIP）評分（至少一款評完才能往下，免評分／已評過／無指定遊戲則略過）→ 集點卡。管理者必須先指定至少一款遊戲並填人數上限（不可留空，隨時可改）才能建立／複製連結；可開關、重設連結。重設連結（舊連結立刻失效）；出席名單標示「自己報到」並可移除。**不需要把人數上限填滿**（有些人沒有帳號、要到場才建立）。舊的 `?card=日期`（只打開集點卡、不會讓人變成出席者）仍支援，但管理者介面已不再提供。現場 4 位數報到碼**先不做**，遇到陌生人再加。
- **管理者「聚會與集點」視窗**（`LoyaltyAdmin.tsx`，樣式 `lga-` 開頭）：分頁「聚會設定」（新增聚會、近期聚會列、聚會詳情：聚會連結、頭像標籤出席者（可搜尋暱稱或 LINE／FB 名字、顯示聯絡方式、免評分、來源標籤）、指定遊戲）與「集點狀況」（總表、明細、兌換）。
- 確認過（2026-10-26）：`get_my_loyalty_summary`、`get_my_loyalty_days`、`admin_get_loyalty_overview`、`admin_get_loyalty_days`、`admin_redeem_voucher` 都只呼叫 `loyalty_day_status`／`loyalty_totals`，**不讀 `board_games`**；管理員函式內有 `is_admin()` 檢查，兌換用 advisory lock 防重複。含 `bgg_name` 欄位的資料表共 6 個：`board_games`、`game_documents`、`game_play_sessions`、`game_ratings`、`gathering_games`、`user_game_status`（改名補救腳本用）。
- 評分或「我玩了」後，集點卡的評分狀態來自 `ratings`（只在 `Library` 呼叫一次，不要在 `LoyaltyCard` 再呼叫）。`addSession` 沒有防重複（同款同日可重複新增）。

## 8. 視覺改版（進行中）

- 風格：**溫暖桌遊俱樂部**。色票（已放進 `tokens.css`）：奶油 `#F5F0E5`、紙白 `#FBF7EC`、森林綠 `#456B50`（深一點 `#365B40`）、焦糖 `#B78A5A`、深墨綠 `#34463C`。印章與會員卡只用在集點卡與少量裝飾，不要每個元件都復古。
- **決定**：不做路由與資料夾大搬家（不建 `pages/`、`routes.tsx`），維持現有結構；先建設計變數，再逐頁換外觀。
- 順序：①設計變數 `tokens.css` ＋新頂端導覽列 `sitebar`（桌面頂端；手機底部導覽）✅已提供，待測 → ②首頁（插畫或大圖主視覺＋「今天，想玩哪一款？」＋搜尋＋類型快速篩選＋最新加入／最受歡迎）與遊戲卡片（**需要使用者貼 `base.css`、`hero.css`、`library.css`、`cards.css`、`App.tsx`**）→ ③集點卡獨立頁面（會員卡主視覺＋兩個圓形印章＋票券＋聚會足跡；規則收進可展開區塊）→ ④管理者視窗與排行榜統一風格、手機版全面檢查。
- 使用者喜歡獨立的集點卡頁面與「聚會與集點」的卡片式管理介面；首頁參考圖是探索首頁（插畫主視覺、搜尋、類型快篩、4 欄遊戲卡片）。
- **2026-10-26 深夜更新**：首頁已改成「收藏清單為主角」（不做最新加入、最受歡迎）；類型膠囊（策略、派對、陣營固定在前＋更多類型視窗）、排序搬到標題列、篩選抽屜瘦身成「進階篩選」、下一批新增 5 個篩選（人數、時間上限、難度三段、新遊戲、評分狀態）、我的桌遊抽屜改版方案——**完整內容與細節請看 `QUICKSTART.md` 的「視覺改版進度」**。

## 9. 長期願景、想做清單與待確認

- **AI 規則助手（最重要，必須用 RAG）**：使用者上傳中英文規則書／FAQ PDF，回答**只能根據檢索到的片段**，必須列出出處（哪本、第幾頁，最好附引用片段），找不到可靠依據要明說，不可憑空回答。**不可從影片查規則**；RAG 只讀 `ai_indexed = true` 的文件；中文介紹（`intro`）有著作權疑慮，較安全的是當「延伸閱讀」。訪客也能問但不能改設定，**要設計每人每日提問上限**，AI 金鑰只放後端（Supabase Edge Function），PDF 存私有 bucket。技術方向待定：PDF 文字擷取、切段並保留頁碼、pgvector（中文可能需向量＋關鍵字混合）。待確認：支援全部桌遊或先 10～20 款、模型、次數限制方式、規則書是否上傳與著作權。
- **上傳規則書 PDF**（私有 bucket；`game_documents` 已預留 `source_type='upload'`、`storage_path`、`ai_indexed`；先統計實際 PDF 數量與大小）→ 再做 AI 規則助手。
- **拖曳調整排名＋匯出 Notion CSV**（使用者說「晚點再嘗試」，尚未動工、尚未回「照建議」）：6 個排名欄位都已在資料庫（`ranking_engine`、`classic_game_ranking`〔Notion 欄名「老遊戲想玩綜合評分」〕、`communication_ranking`〔溝通排名〕、`unique_ranking`〔獨特排名〕、`player_impact_ranking`〔玩家影響性排名〕、`change_ranking`〔變化排名〕），不需改資料庫，現有 Admin update 政策夠用。建議設計：管理者專用「排名編輯」，下拉選排名、`@dnd-kit` 拖曳（拖一格＝交換、拖多格＝中間順移）、null 放「未排名」、先顯示「將更新 N 款」再儲存、匯出 UTF-8 含 BOM 的 CSV（「屬性」「bggName」＋6 欄）；要提醒「網站改過排名後若先匯入舊 Notion CSV 會被覆蓋」。「綜合分數排名」由 Notion 算，網站不重算。`parseCsv.ts` 必要欄位只含兩個排名欄，其他 4 個若 CSV 沒有會被當 `null` 覆蓋資料庫，日後可全部加入必填。開工前要看 `AdminPanel.tsx`、`fetchBoardGames.ts`。
- **「我的桌遊」升級**（使用者原話，未排序）：想玩可標「近期想玩」「下次聚會想玩」、一鍵移到已玩、可依加入時間／排名／時間排序；遊玩紀錄加對手／朋友、勝負、心得；統計（累積次數與總時數、最常玩、最喜歡的類型、最常玩的人數、每月趨勢）。
- **揪團與聚會規劃**：從想玩清單挑候選遊戲、設定日期／人數／地點、報名與候補、顯示參加者共同想玩的遊戲、依人數推薦（「想玩」與「報名」不要混為一談）。**「今天想玩什麼？」推薦**：問人數、時間、難度，用現有資料即可，不需要 AI。討論與 FAQ（官方 vs 玩家留言要能區分）、行事曆與布告欄、帳號刪除流程（管理者可在「管理 → 成員」刪除帳號（admin_delete_member））。
- **其他待確認**：清單／9 個一排的外觀是否滿意；常玩遊戲排名是否改為自動計算；`陣營` 與 `策略` 可同時出現（目前允許）；排序功能要排什麼（使用者說之後再想）；`makeCoverSlug` 新版是否已套用並重新匯入。
- **已知限制**：窄螢幕下頂端按鈕是否擠在一起（新導覽列已改為手機底部導覽，待實測）；`BackToTop` 已避開底部導覽（待手機實測）；詳細視窗規則書區是單行樣式。

## 10. 與使用者合作的規則（重要）

- 使用者是**程式初學者**，用**繁體中文**。預設會照步驟執行，可一次給多個步驟（實務上 8 步左右也照做）；他回「好」就代表完成，但不一定貼測試結果，重要項目要再問一次；遇到問題他會自己停下來問。他在 claude.ai 免費額度下工作，**聊天室容易中斷**，所以交接文件要隨時是最新，接手時**先問實際狀態，不要假設上一則回覆已完成**。
- 提供：明確檔案路徑；完整程式碼或精準修改位置（`Ctrl + F` 搜尋）；指令解釋；測試方式。**他多次貼錯位置，修改量大時直接給整份檔案，或請他「整段刪掉換成」。**
- **每個指令都標清楚貼在哪裡**（VS Code 終端機＝PowerShell，或 Supabase SQL Editor；他曾把 PowerShell 指令貼進 SQL Editor）。
- 你**碰不到使用者的本機檔案**，也收不到 CSV；需要資訊就給 PowerShell／SQL 指令請他貼結果或截圖。**他貼來的檔案可能是舊版**（2026-10-24 貼過舊的整份 `App.css`；2026-10-26 貼的 `App.tsx` 也比本機舊），判斷現況先用 `git status`／`git log`／`Get-Content ... -First 15` 確認。
- **大改 `App.tsx`、`AdminPanel.tsx`、`PlayerPanel.tsx`、`GameDocuments.tsx`、`src/components/*` 前，請使用者貼出目前版本**。樣式分散在 `src/styles/`，改哪塊先確認在哪個檔案。
- 每階段改完 `npm.cmd run build` 再實測畫面（build 成功不等於畫面正確）。不要破壞現有功能與 106 款資料。**不要要求使用者貼出密碼、Secret／service_role key、資料庫密碼、Google Client Secret。**
- **影響資料、隱私的設計決策，先提方案並列「建議預設值」，等他回「照建議」再動工。** 一次一階段，前一階段測試完才進下一階段。給 SQL 時先說明會做什麼，並附驗證查詢。

## 11. 多台電腦作業

**自動同步**：Supabase 資料與 Storage、GitHub 上的程式碼。**不會同步**：`.env.local`（要重建）、`boardgames.csv`、**沒有 commit／push 的修改**。

新電腦第一次設定：①安裝 Git、Node.js（LTS）、VS Code，設定 `git config --global user.name`／`user.email`；②在舊電腦 `git remote get-url origin` 取得倉庫網址；③`git clone <網址>`，`cd` 進去，確認在 `master`；④`npm.cmd install`；⑤專案根目錄建立 `.env.local`（兩行純文字、不加引號）：`VITE_SUPABASE_URL=https://hgeuockbjrzayfdylavq.supabase.co`、`VITE_SUPABASE_PUBLISHABLE_KEY=（Supabase 後台 Project Settings → API Keys 的 Publishable key）`，**只能用 Publishable key**；⑥`npm.cmd run dev`，確認顯示 106 款、能登入管理者。

日常：開始前 `git pull`；結束前逐檔 `git add` → `git commit` → `git push`；不要兩台電腦同時改同一批檔案；未完成的工作用分支存。

## 12. VIP 會員制度、管理中心與名單（2026-10-26）

- **層級**：訪客（瀏覽、本機想玩／已玩）→ 一般登入（雲端同步、遊玩紀錄）→ VIP（評分、評分摘要、集點卡、聚會報到、名單、統計表、之後的推薦牆與 AI）→ 管理者。AI 只給 VIP，每日上限之後設計。
- **資料表**：`vip_members`（`granted_by`＝password／checkin／admin；只有管理者可讀寫）、`vip_settings`（單列密碼雜湊，前端讀不到）、`vip_attempts`（嘗試紀錄，前端讀不到）；`player_profiles.hide_in_lists`；`gatherings.title`（場次名稱，唯一條件改為 `(gathered_on, title)`）。
- **函式**（security definer、`set search_path=''`、anon 無權限）：`is_vip()`（管理者也算）、`redeem_vip_code`、`admin_set_vip_code`（至少 4 字）、`admin_set_vip`、`admin_list_members`、`get_vip_friends`（只有暱稱，UI 未做）、`admin_vip_lock_info`、`admin_clear_vip_lock`、`join_gathering`（只在聚會當天有效；報到後由觸發器 `attendee_makes_vip` 自動成為 VIP）、`admin_create_gathering`（原子建立聚會＋遊戲＋人數上限＋報到連結）（註：前端 LoyaltyAdmin 目前用直接 insert＋UI 驗證，並未呼叫此函式；2026-10-26 查過該函式**不存在**，可忽略）、`get_hide_in_lists`／`set_hide_in_lists`、`get_game_people`（VIP 只回暱稱且排除隱藏者，管理者含 LINE／FB）、`admin_get_all_ratings`（僅管理者）、`loyalty_day_status`（同日多場合併為 1 點）。
- **前端**：`lib/useVip.ts`（事件 `vip-changed`）、`lib/useGamePeople.ts`、`lib/adminEvents.ts`；`components/VipJoinDialog`、`VipLock`、`MemberAdmin`、`AdminCenter`、`StatsTables`；`LoyaltyAdmin` 改為嵌在管理中心的內容元件；`LoyaltyCard` 有 1～4 步驟與收合的規則；`Leaderboard` 可展開名單；樣式 `styles/vip.css`（最後載入）。
- **未做／待執行**：換成 鎖定 SQL、PWA（缺圖示）、VIP 朋友名單、推薦牆、導覽改名與 AI 頁。
- **疑點**：測試帳號集點卡曾顯示「已兌換 1、累積 0」的警告（若不是測試資料要查）；同一天兩場的集點卡尚未實測。

2026-10-26（深夜）：另新增 admin_delete_member（刪帳號，不能刪管理者）；統計表矩陣篩選；CheckInDialog 流程化（自動報到→VIP 密碼→評分→集點卡）。2026-10-27 起觸發器會寫入 granted_by='checkin'（連結報到）或 'admin'（手動加入）。