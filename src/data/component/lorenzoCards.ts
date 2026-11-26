// 偉大的羅倫佐（Lorenzo il Magnifico）卡表：領袖卡 46 張、家族板塊 12 塊、議會特權、逐出教會板塊。bggName：'Lorenzo il Magnifico: Big Box'。
// 暫時沒有被任何元件引用；「持有」類畫面（誰打出了哪些領袖、拍賣到哪個家族）還沒做，這個檔先放資料。
//
// 為什麼要有：領袖卡打出後是公開的，而且很多是永久能力（無視佔據、點數 +2、被佔據高塔不用付 3 元……），
// 不知道對手打出了誰，就看不懂他為什麼能放到那裡、為什麼突然衝很快；家族板塊與逐出教會板塊也是每局公開、會改變整局玩法的資訊。
//
// 來源（頁碼是各檔自己的頁數）：
//   ①Lorenzo_All_46_Leader_and_12_Family_List_v3.pdf（領袖 46 張總表＋家族 12 塊，英文；第 1、2 頁）：主要來源。
//   ②Lorenzo_Leaders.pdf、Lorenzo_Big_Box_Leaders.pdf（舊版英文領袖速查，各 2 頁，只有 44 張，沒有 Beato Angelico、Vitellozzo Vitelli）：交叉核對。
//   ③Lorenzo_-_Leaders_et_Familles_-_v1_0.pdf（法文表格，2 頁）：交叉核對（有疑似筆誤，見下）。
//   ④Reference_sheet_Lorenzo_il_Magnifico_NL_Versie01.pdf（荷蘭文參考手冊，BGG 使用者 happygamer031276 自製，2025 年第 1 版）：第 15～19 頁領袖卡（含所屬盒別圖示與行動區最低點數）、第 20～23 頁逐出教會、特殊標記與家族板塊。
//   ⑤既有快速複習 lorenzo.ts（中文用詞以它為準）。
// 中文：用詞沿用快速複習 lorenzo.ts（領地＝綠、建築＝黃、角色＝藍、投資＝紫、僕人、元、軍事點數、信仰點數、議會特權、逐出教會、特殊標記）；
//   效果文字都是自譯摘要，一律【待核對】，不收英文原文。領袖卡名保留英文（沒有官方中文名）。
// 欄位：set＝所屬盒別（base 基本盒、houses 擴充 Houses of Renaissance、pazzi 擴充 The Pazzi Conspiracy、unknown 來源不明）。
//   kind＝permanent 永久、oncePerRound 每輪一次、action 行動區（只有打出它的玩家能放家族成員）、immediate 打出當下一次。
//   actionMin＝行動區最低點數（只有 action 有）。
// 沒收：發展卡 168 張（效果在荷蘭文參考手冊第 3～14 頁，費用與高塔獎勵要看圖，下一批再議）；特殊標記背面 20 種與 Visconti 標記 5 種（有欄位但本批沒收）；
//   各領袖的原文敘述、單人模式。
// 來源之間不一致與待確認：
//   ①Beato Angelico、Vitellozzo Vitelli：只出現在 46 張總表（來源①），舊版速查（②）與荷蘭文手冊（④）都沒有，盒內是否附這兩張不明，set 標 unknown【待核對】。
//   ②Francesco Sforza：總表寫「可用僕人或卡片效果增加」，舊版速查與荷蘭文手冊寫「只能用僕人，農民／農夫類發展卡也不行」，這裡照舊版（與英文規則書一致）【待核對】；法文版寫「照常增加」。
//   ③Erasmo da Rotterdam：法文表格寫成「3 投資＋4 領地」，總表、舊版速查與荷蘭文手冊都是「4 投資＋3 角色」，採後者；法文表格疑似筆誤。
//   ④Ferdinando d’Aragona：法文寫「1 石最多、木 0（或相反）」，英文寫「木與石合計最多 1」，採英文。
//   ⑤總表的卡名有拼字錯誤（Ariostso、Salivate、Michelangelo 與 Machiavelli 的拼法），這裡用舊版速查與荷蘭文手冊的拼法。
//   ⑥Houses 擴充開局僕人、第 6 輪信仰等不一致見快速複習 lorenzo.ts 最後一區，本檔不重複。

export type LorenzoLeaderSet = 'base' | 'houses' | 'pazzi' | 'unknown'
export type LorenzoLeaderKind = 'permanent' | 'oncePerRound' | 'action' | 'immediate'

export type LorenzoLeader = {
  id: string
  set: LorenzoLeaderSet
  nameEn: string
  req: string // 打出需求（只要在打出當下擁有，不用支付）
  kind: LorenzoLeaderKind
  actionMin?: number
  effectZh: string // 自譯摘要，【待核對】
  note?: string
  src: string
}

export const LORENZO_LEADER_SET_LABEL: Record<LorenzoLeaderSet, string> = {
  base: '基本盒',
  houses: '擴充 Houses of Renaissance',
  pazzi: '擴充 The Pazzi Conspiracy',
  unknown: '來源不明',
}

export const LORENZO_LEADER_KIND_LABEL: Record<LorenzoLeaderKind, string> = {
  permanent: '永久',
  oncePerRound: '每輪一次',
  action: '行動區',
  immediate: '立即',
}

const S = '46 張總表 v3 第 1 頁；荷蘭文手冊 第 15～19 頁'
// const S2 = '46 張總表 v3 第 1 頁；舊版速查'

export const LORENZO_LEADERS: LorenzoLeader[] = [
  // ── 基本盒 20 張 ──
  { id: 'leader-francesco-sforza', set: 'base', nameEn: 'Francesco Sforza', req: '5 投資', kind: 'oncePerRound', effectZh: '收穫行動，點數 1。', note: '能否用卡片效果增加有不一致，見檔頭②。', src: S },
  { id: 'leader-lucrezia-borgia', set: 'base', nameEn: 'Lucrezia Borgia', req: '6 張同種發展卡', kind: 'permanent', effectZh: '有色家族成員點數 +2（仍可再增加）。', src: S },
  { id: 'leader-ludovico-ariosto', set: 'base', nameEn: 'Ludovico Ariosto', req: '5 角色', kind: 'permanent', effectZh: '可以把家族成員放到已有人的行動區。', src: S },
  { id: 'leader-federico-da-montefeltro', set: 'base', nameEn: 'Federico da Montefeltro', req: '5 領地', kind: 'oncePerRound', effectZh: '一個有色家族成員的點數視為 6，不管骰子。', src: S },
  { id: 'leader-filippo-brunelleschi', set: 'base', nameEn: 'Filippo Brunelleschi', req: '5 建築', kind: 'permanent', effectZh: '放進已被佔據的高塔，不用付 3 元。', src: S },
  { id: 'leader-lorenzo-de-medici', set: 'base', nameEn: 'Lorenzo de’ Medici', req: '35 分', kind: 'permanent', effectZh: '複製另一位玩家已打出的一張領袖卡的能力；選定後不能更改。', src: S },
  { id: 'leader-sigismondo-malatesta', set: 'base', nameEn: 'Sigismondo Malatesta', req: '7 軍事點數、3 信仰點數', kind: 'permanent', effectZh: '無色家族成員點數 +3（仍可再增加）。', src: S },
  { id: 'leader-sisto-iv', set: 'base', nameEn: 'Sisto IV', req: '6 木、6 石、6 元、6 僕人', kind: 'permanent', effectZh: '梵諦岡發言時支持教會，多得 5 分。', note: '荷蘭文手冊補充：要是選擇支持教會、不是被逐出教會才得。', src: S },
  { id: 'leader-girolamo-savonarola', set: 'base', nameEn: 'Girolamo Savonarola', req: '18 元', kind: 'oncePerRound', effectZh: '+1 信仰點數。', src: S },
  { id: 'leader-cesare-borgia', set: 'base', nameEn: 'Cesare Borgia', req: '3 建築、12 元、2 信仰點數', kind: 'permanent', effectZh: '拿領地時不用滿足軍事點數需求。', src: S },
  { id: 'leader-michelangelo-buonarroti', set: 'base', nameEn: 'Michelangelo Buonarroti', req: '10 石', kind: 'oncePerRound', effectZh: '+3 元。', src: S },
  { id: 'leader-santa-rita', set: 'base', nameEn: 'Santa Rita', req: '8 信仰點數', kind: 'permanent', effectZh: '從打出的發展卡「立即效果」（不是行動區）獲得木、石、元或僕人時，拿雙倍。', src: S },
  { id: 'leader-giovanni-dalle-bande-nere', set: 'base', nameEn: 'Giovanni dalle Bande Nere', req: '12 軍事點數', kind: 'oncePerRound', effectZh: '+1 木、+1 石、+1 元。', src: S },
  { id: 'leader-cosimo-de-medici', set: 'base', nameEn: 'Cosimo de’ Medici', req: '2 角色、4 建築', kind: 'oncePerRound', effectZh: '+3 僕人、+1 分。', src: S },
  { id: 'leader-leonardo-da-vinci', set: 'base', nameEn: 'Leonardo da Vinci', req: '4 角色、2 領地', kind: 'oncePerRound', effectZh: '生產行動，點數 0（只能靠僕人增加，不能靠卡片效果）。', src: S },
  { id: 'leader-bartolomeo-colleoni', set: 'base', nameEn: 'Bartolomeo Colleoni', req: '2 投資、4 領地', kind: 'oncePerRound', effectZh: '+4 分。', src: S },
  { id: 'leader-sandro-botticelli', set: 'base', nameEn: 'Sandro Botticelli', req: '10 木', kind: 'oncePerRound', effectZh: '+2 軍事點數、+1 分。', src: S },
  { id: 'leader-ludovico-iii-gonzaga', set: 'base', nameEn: 'Ludovico III Gonzaga', req: '15 僕人', kind: 'oncePerRound', effectZh: '+1 議會特權。', src: S },
  { id: 'leader-ludovico-il-moro', set: 'base', nameEn: 'Ludovico il Moro', req: '領地、角色、建築、投資各 2 張', kind: 'permanent', effectZh: '有色家族成員點數視為 5，不管骰子（仍可再增加）。', src: S },
  { id: 'leader-pico-della-mirandola', set: 'base', nameEn: 'Pico della Mirandola', req: '4 投資、2 建築', kind: 'permanent', effectZh: '拿發展卡時，卡片費用中的錢折抵 3 元（不折抵被佔據高塔的 3 元）。', src: S },
  // ── Houses of Renaissance 20 張 ──
  { id: 'leader-alfonso-v-daragona', set: 'houses', nameEn: 'Alfonso V d’Aragona', req: '6 軍事點數、信仰點數最多 0', kind: 'permanent', effectZh: '拿領地時 +1 信仰點數。', src: S },
  { id: 'leader-palla-strozzi', set: 'houses', nameEn: 'Palla Strozzi', req: '4 領地、5 信仰點數', kind: 'oncePerRound', effectZh: '收穫行動，點數 3，只啟動 1 張領地。', src: S },
  { id: 'leader-alfonso-i-deste', set: 'houses', nameEn: 'Alfonso I d’Este', req: '10 元、僕人最多 1', kind: 'permanent', effectZh: '拿角色時 +2 僕人。', src: S },
  { id: 'leader-ladislao-vii-jagellone', set: 'houses', nameEn: 'Ladislao VII Jagellone', req: '10 分、建築最多 1 張', kind: 'immediate', effectZh: '可無視需求打出一張領袖卡。', src: S },
  { id: 'leader-ercole-i-deste', set: 'houses', nameEn: 'Ercole I d’Este', req: '4 信仰點數、軍事點數最多 1、元最多 1', kind: 'permanent', effectZh: '拿建築時 +2 軍事點數。', src: S },
  { id: 'leader-massimiliano-i-dasburgo', set: 'houses', nameEn: 'Massimiliano I d’Asburgo', req: '4 領地、4 建築', kind: 'action', actionMin: 6, effectZh: '行動區（最低 6）：+3 特殊標記、+5 分。', src: S },
  { id: 'leader-ferdinando-daragona', set: 'houses', nameEn: 'Ferdinando d’Aragona', req: '8 元、8 僕人、木與石合計最多 1', kind: 'permanent', effectZh: '拿投資時 +1 木、+1 石。', note: '法文寫法不同，見檔頭④。', src: S },
  { id: 'leader-guglielmo-de-pazzi', set: 'houses', nameEn: 'Guglielmo de’ Pazzi', req: '4 角色、8 元', kind: 'action', actionMin: 4, effectZh: '行動區（最低 4）：+3 信仰點數、+2 軍事點數。', src: S },
  { id: 'leader-martin-lutero', set: 'houses', nameEn: 'Martin Lutero', req: '7 軍事點數，領地、角色、建築、投資各 1 張', kind: 'permanent', effectZh: '不會被逐出教會。', src: S },
  { id: 'leader-piero-della-francesca', set: 'houses', nameEn: 'Piero della Francesca', req: '4 特殊標記（放在發展卡上的不算）、10 分', kind: 'action', actionMin: 3, effectZh: '行動區（最低 3）：+3 特殊標記。', src: S },
  { id: 'leader-tomas-de-torquemada', set: 'houses', nameEn: 'Tomas de Torquemada', req: '3 建築、5 木', kind: 'oncePerRound', effectZh: '棄 1 張角色，換 3 信仰點數。', src: S },
  { id: 'leader-erasmo-da-rotterdam', set: 'houses', nameEn: 'Erasmo da Rotterdam', req: '4 投資、3 角色', kind: 'action', actionMin: 5, effectZh: '行動區（最低 5）：+3 木、+3 石、+3 分。', note: '法文表格寫法不同，見檔頭③。', src: S },
  { id: 'leader-pietro-bembo', set: 'houses', nameEn: 'Pietro Bembo', req: '3 角色、3 信仰點數', kind: 'action', actionMin: 3, effectZh: '行動區（最低 3）：+3 元、+3 僕人。', src: S },
  { id: 'leader-marsilio-ficino', set: 'houses', nameEn: 'Marsilio Ficino', req: '4 信仰點數、5 石、投資最多 1', kind: 'oncePerRound', effectZh: '抽 2 個特殊標記，留 1 個、棄 1 個。', src: S },
  { id: 'leader-paracelso', set: 'houses', nameEn: 'Paracelso', req: '3 領地、3 石', kind: 'permanent', effectZh: '可以用僕人代替木、石或元來支付。', src: S },
  { id: 'leader-beatrice-deste', set: 'houses', nameEn: 'Beatrice d’Este', req: '5 張發展卡（其中角色最多 1、元最多 1）', kind: 'oncePerRound', effectZh: '棄 1 個特殊標記，換 5 分或 5 元。', src: S },
  { id: 'leader-leon-battista-alberti', set: 'houses', nameEn: 'Leon Battista Alberti', req: '3 投資、10 僕人', kind: 'oncePerRound', effectZh: '生產行動，點數 3，只啟動 1 張建築（可用僕人或卡片效果增加）。', src: S },
  { id: 'leader-giulio-ii', set: 'houses', nameEn: 'Giulio II', req: '9 張發展卡（最多 3 種類型）', kind: 'oncePerRound', effectZh: '棄 1 木、1 石、1 元，換 3 信仰點數。', src: S },
  { id: 'leader-lucia-da-narni', set: 'houses', nameEn: 'Lucia da Narni', req: '6 張發展卡（領地最多 1、特殊標記最多 2；放在發展卡上的不算）', kind: 'oncePerRound', effectZh: '+1 信仰點數、+2 分。', src: S },
  { id: 'leader-bramante', set: 'houses', nameEn: 'Bramante', req: '4 投資、4 僕人、4 木、4 元', kind: 'action', actionMin: 1, effectZh: '行動區（最低 1）：執行收穫或生產，點數＝放上去的家族成員點數（可加點）。', src: S },
  // ── The Pazzi Conspiracy 4 張 ──
  { id: 'leader-raffaello-sanzio', set: 'pazzi', nameEn: 'Raffaello Sanzio', req: '3 角色、6 木、4 僕人', kind: 'oncePerRound', effectZh: '1 分換 3 元，或 1 元換 3 分。', src: S },
  { id: 'leader-carlo-viii', set: 'pazzi', nameEn: 'Carlo VIII', req: '6 僕人、5 軍事點數、5 信仰點數', kind: 'permanent', effectZh: '每個僕人增加 2 點（不是 1 點）。', src: S },
  { id: 'leader-niccolo-machiavelli', set: 'pazzi', nameEn: 'Niccolò Machiavelli', req: '3 領地、20 分、已打出 1 張領袖卡', kind: 'permanent', effectZh: '獲得分數（任何來源）時多得 1 分。', src: S },
  { id: 'leader-jacopo-salviati', set: 'pazzi', nameEn: 'Jacopo Salviati', req: '3 建築、8 軍事點數', kind: 'permanent', effectZh: '獲得議會特權時，多拿 1 個不同的議會特權。', src: S },
  // ── 來源不明 2 張（只在 46 張總表）──
  { id: 'leader-beato-angelico', set: 'unknown', nameEn: 'Beato Angelico', req: '10 信仰點數', kind: 'oncePerRound', effectZh: '收穫行動，點數 6，只啟動 1 張領地。', note: '只在 46 張總表；盒別不明，見檔頭①【待核對】。', src: '46 張總表 v3 第 1 頁' },
  { id: 'leader-vitellozzo-vitelli', set: 'unknown', nameEn: 'Vitellozzo Vitelli', req: '15 軍事點數', kind: 'oncePerRound', effectZh: '生產行動，點數 6，只啟動 1 張建築。', note: '只在 46 張總表；盒別不明，見檔頭①【待核對】。', src: '46 張總表 v3 第 1 頁' },
]

export type LorenzoFamily = {
  id: string
  set: 'houses' | 'pazzi'
  nameEn: string
  effectZh: string
  src: string
}

const F = '46 張總表 v3 第 2 頁；荷蘭文手冊 第 22～23 頁；英文規則（擴充）'

export const LORENZO_FAMILIES: LorenzoFamily[] = [
  { id: 'family-aragonesi', set: 'houses', nameEn: 'Aragonesi', effectZh: '每次拿領地，立刻執行一次收穫，點數＝該卡啟動點數 −1；不能用僕人或角色卡效果增加。Ancient Ruins 與 Assisi 沒有印啟動點數，不適用。', src: F },
  { id: 'family-gonzaga', set: 'houses', nameEn: 'Gonzaga', effectZh: '每輪行動階段結束時，可花 7 僕人從圖板拿 1 張發展卡（不含第五欄）；不用付卡費、領地不用滿足軍事需求、被佔據的塔不用付 3 元、沒有第 3、4 層獎勵。', src: F },
  { id: 'family-colonna', set: 'houses', nameEn: 'Colonna', effectZh: '開局拿棕色家族成員（點數 3），算第 5 個成員；放置時既不算你的顏色也不算無色，所以同一座塔可有你的有色、無色、棕色各一個；被佔據高塔的 3 元照付。', src: F },
  { id: 'family-malatesta', set: 'houses', nameEn: 'Malatesta', effectZh: '拿需要軍事點數的投資卡時，必須「有」所需軍事點數，但不用扣。', src: F },
  { id: 'family-da-montefeltro', set: 'houses', nameEn: 'Da Montefeltro', effectZh: '每次花木和／或石拿建築時，把花掉的資源放在這塊板塊上；之後獲得議會特權時，可改成拿走板塊上全部的資源。', src: F },
  { id: 'family-medici', set: 'houses', nameEn: 'Medici', effectZh: '每次拿角色，另外獲得 1 個特殊標記；角色最多可到 8 張；終局有 7／8 張角色，得 28／36 分。', src: F },
  { id: 'family-della-rovere', set: 'houses', nameEn: 'Della Rovere', effectZh: '把信仰板塊放到信仰軌對應格；圓盤到達時把板塊拿走並得到該獎勵；但每次被逐出教會會失去 5 分。', src: F },
  { id: 'family-sforza', set: 'houses', nameEn: 'Sforza', effectZh: '拍賣前先抽 2 張領袖卡面朝上放在板塊旁；拿到這個家族板塊就拿 2 張，立刻無視需求打出 1 張，留下另 1 張。', src: F },
  { id: 'family-este', set: 'houses', nameEn: 'Este', effectZh: '你的回合中，可以花 1 軍事點數換 2 元，次數不限。', src: F },
  { id: 'family-orsini', set: 'houses', nameEn: 'Orsini', effectZh: '每當湊齊 1 組 4 種不同發展卡（每種 1 張），依序獲得不同獎勵：第 1 組抽 2 張剩餘領袖卡；第 2 組無視需求打出 1 張領袖；第 3 組 +10 分；第 4 組 +15 分。', src: F },
  { id: 'family-della-scala', set: 'pazzi', nameEn: 'Della Scala', effectZh: '獲得議會特權時，可拿信仰點數以外的任何獎勵，但多得 1 信仰；另外可隨時 1 信仰換 1 元＋1 僕人＋1 軍事點數，次數不限。', src: F },
  { id: 'family-visconti', set: 'pazzi', nameEn: 'Visconti', effectZh: '拍賣前先抽 2 張領袖卡面朝上放旁邊；拿到就拿 2 張領袖與 5 個 Visconti 標記（放面前、未啟動面）。每次打出領袖卡，選一個標記啟動並拿它的獎勵，同時拿所有已啟動標記的獎勵；打出超過 5 張領袖時，啟動全部標記。', src: F },
]

// 議會特權（擇一）；擴充另可選特殊標記
export const LORENZO_COUNCIL_PRIVILEGES: { id: string; nameZh: string; note?: string }[] = [
  { id: 'priv-wood-stone', nameZh: '1 木＋1 石' },
  { id: 'priv-servants', nameZh: '2 僕人' },
  { id: 'priv-coins', nameZh: '2 元' },
  { id: 'priv-military', nameZh: '2 軍事點數' },
  { id: 'priv-faith', nameZh: '1 信仰點數' },
  { id: 'priv-token', nameZh: '1 特殊標記', note: '只有擴充 Houses of Renaissance 才有（英文規則書基本版只有前五種；來源：快速複習 lorenzo.ts）' },
]

export type LorenzoExcomm = {
  id: string
  period: 1 | 2 | 3
  set: 'base' | 'houses' | 'unverified' // base 基本盒、houses 擴充、unverified＝只在英文速查表、荷蘭文手冊沒有
  effectZh: string // 自譯，【待核對】
  src: string
}

const E = '荷蘭文手冊 第 20、21 頁；英文速查表 Excommunication Tiles；快速複習 lorenzo.ts'

export const LORENZO_EXCOMMUNICATIONS: LorenzoExcomm[] = [
  // 第 1 時期
  { id: 'ex1-military', period: 1, set: 'base', effectZh: '獲得軍事點數時少 1 點（每張卡各算一個來源）。', src: E },
  { id: 'ex1-coin', period: 1, set: 'base', effectZh: '獲得錢時少 1 元（每張卡各算一個來源）。', src: E },
  { id: 'ex1-servant', period: 1, set: 'base', effectZh: '獲得僕人時少 1 個（每張卡各算一個來源）。', src: E },
  { id: 'ex1-wood-stone', period: 1, set: 'base', effectZh: '獲得木或石時少 1 個（每張卡各算一個來源）。', src: E },
  { id: 'ex1-harvest', period: 1, set: 'base', effectZh: '執行收穫行動點數 −3（用大區 −6）；仍可用僕人，並套用卡片效果。', src: E },
  { id: 'ex1-production', period: 1, set: 'base', effectZh: '執行生產行動點數 −3（用大區 −6）；仍可用僕人，並套用卡片效果。', src: E },
  { id: 'ex1-colored', period: 1, set: 'base', effectZh: '所有有色家族成員每次放置點數 −1（例：骰 5 變 4）。', src: E },
  { id: 'ex1-token', period: 1, set: 'houses', effectZh: '獲得特殊標記時少 1 個。', src: E },
  { id: 'ex1-leader-cost', period: 1, set: 'unverified', effectZh: '今後每打出一張領袖卡，額外付 1 元、1 僕人、1 軍事點數。', src: '英文速查表 Excommunication Tiles；快速複習 lorenzo.ts（荷蘭文手冊沒有）【待核對】' },
  // 第 2 時期
  { id: 'ex2-territory', period: 2, set: 'base', effectZh: '拿領地時，該行動點數 −4（仍可用僕人，且套用卡片效果）。', src: E },
  { id: 'ex2-building', period: 2, set: 'base', effectZh: '拿建築時，該行動點數 −4。', src: E },
  { id: 'ex2-character', period: 2, set: 'base', effectZh: '拿角色時，該行動點數 −4。', src: E },
  { id: 'ex2-venture', period: 2, set: 'base', effectZh: '拿投資時，該行動點數 −4。', src: E },
  { id: 'ex2-market', period: 2, set: 'base', effectZh: '不能把家族成員放到市場。', src: E },
  { id: 'ex2-servants', period: 2, set: 'base', effectZh: '用僕人增加行動點數時，要 2 僕人才加 1、4 僕人才加 2。', src: E },
  { id: 'ex2-skip-turn', period: 2, set: 'base', effectZh: '每輪跳過你的第一個回合（第一次輪到要 pass，從第二回合開始；最後一個成員仍可放）。', src: E },
  { id: 'ex2-no-special-tower', period: 2, set: 'houses', effectZh: '不能從特殊高塔（第五座塔）拿特殊發展卡。', src: E },
  { id: 'ex2-remove-leader', period: 2, set: 'unverified', effectZh: '立刻從遊戲中移除 1 張你已打出的領袖卡。', src: '英文速查表 Excommunication Tiles；快速複習 lorenzo.ts（荷蘭文手冊沒有）【待核對】' },
  // 第 3 時期
  { id: 'ex3-no-character', period: 3, set: 'base', effectZh: '終局不計角色的分。', src: E },
  { id: 'ex3-no-venture', period: 3, set: 'base', effectZh: '終局不計投資的分。', src: E },
  { id: 'ex3-no-territory', period: 3, set: 'base', effectZh: '終局不計領地的分。', src: E },
  { id: 'ex3-vp-fifth', period: 3, set: 'base', effectZh: '終局計分前，你每有 5 分就扣 1 分（例：26 分扣 5 分）。', src: E },
  { id: 'ex3-military', period: 3, set: 'base', effectZh: '終局每 1 點軍事點數扣 1 分。', src: E },
  { id: 'ex3-building-cost', period: 3, set: 'base', effectZh: '終局，你的建築卡費用中每 1 個木與每 1 個石各扣 1 分。', src: E },
  { id: 'ex3-resources', period: 3, set: 'base', effectZh: '終局個人供應區每 1 個資源（木、石、元、僕人）扣 1 分。', src: E },
  { id: 'ex3-over-four', period: 3, set: 'houses', effectZh: '終局每種發展卡超過第 4 張的每張扣 5 分。', src: E },
  { id: 'ex3-leader', period: 3, set: 'unverified', effectZh: '終局每張你打出的領袖卡扣 5 分。', src: '英文速查表 Excommunication Tiles；快速複習 lorenzo.ts（荷蘭文手冊沒有）【待核對】' },
]
