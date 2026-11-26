// 星河交匯（Sidereal Confluence）資源預設值：給資源計數器「一鍵加入」用。
// 暫時沒有被任何元件引用。快速複習檔把這款寫作「恆星匯流」，兩個中文名哪個為準〔未決定〕，bggName 是 Sidereal Confluence。
// 格式：每列照 scoreSheet.ts 的 SheetRow（kind 'count'、sign 1、mult 1），另加資料檔專用欄位 nameEn、note、src；轉成範本時拿掉這三個欄位。
// 資源名稱用快速複習檔「通用資源」一節的用詞（綠＝食物與維生、白＝文化、棕＝工業、黑＝資訊、藍＝生物科技、黃＝電力、八角＝超科技），中文為 AI 自譯【待核對】。
// 圖示限 Emoji 11（2018）以前；方塊顏色用同色圓點代替（綠🍀、棕🌰、黃🌕），因為桌上看的是顏色；🛑 是八角塊。
// 起始資源：ods 的「Starting Race Card」列，是各物種起始卡上的起始庫存（9 個基本物種）；ods 作者與版本未標〔未驗證〕，使用前請對照手上的物種起始卡。
// 交易相對價值：Faction Cheat Sheets v1.1（玩家整理）與 Teaching Guide 一致（1 分≈3 小方塊≈3 飛船≈2 大方塊≈1 八角塊），見 SIDEREAL_CONFLUENCE_TRADE_VALUE。
// 沒收什麼：擴充 Bifurcation 的起始資源（含 ½ 標記、軌道，見 Cards 檔的 startRaw）、各物種專屬標記（只收 Faderan 認可標記、Zeth 使節標記、Im’dril 艦隊支援三個，見 EXTRA_ROWS）、勝利點（藏在屏風後、不可交易，不收）。
// 還沒做：綁定 bgg_name 的官方範本與上傳畫面（計分表／資源計數器目前沒有「官方範本」功能）。

import type { SheetRow } from '../../lib/scoreSheet'

export const SIDEREAL_CONFLUENCE_BGG_NAME = 'Sidereal Confluence'

export type SiderealResKey =
  | 'green' | 'white' | 'brown' | 'black' | 'blue' | 'yellow' | 'ultratech' | 'ship' | 'wildSmall' | 'wildLarge'

export type SiderealSpeciesKey =
  | 'kt' | 'caylion' | 'kjas' | 'faderan' | 'imdril' | 'eniet' | 'unity' | 'yengii' | 'zeth'

export type SiderealResourceRow = SheetRow & { nameEn: string; note?: string; src: string }

const SRC = '快速複習檔 siderealConfluence.ts（資源名稱）；Sidereal_Confluence_Card_List.ods Syntax 工作表（符號）；官方規則書計分（經快速複習檔轉述）'

// 十種可交易的基本資源（init 都是 0；各物種的起始數量看 SIDEREAL_CONFLUENCE_START）
export const SIDEREAL_CONFLUENCE_RESOURCES: SiderealResourceRow[] = [
  { id: 'green', name: '綠・食物與維生', nameEn: 'Green: Food & Life Support', icon: '🍀', kind: 'count', sign: 1, mult: 1, init: 0, note: '小方塊；符號 g。結算：每 3 個小方塊（或飛船）＝½ 分。', src: SRC },
  { id: 'white', name: '白・文化', nameEn: 'White: Culture', icon: '⚪', kind: 'count', sign: 1, mult: 1, init: 0, note: '小方塊；符號 w。結算同上。', src: SRC },
  { id: 'brown', name: '棕・工業', nameEn: 'Brown: Industry', icon: '🌰', kind: 'count', sign: 1, mult: 1, init: 0, note: '小方塊；符號 b。結算同上。', src: SRC },
  { id: 'black', name: '黑・資訊', nameEn: 'Black: Information', icon: '⚫', kind: 'count', sign: 1, mult: 1, init: 0, note: '大方塊；符號 B。結算：每 2 個大方塊＝½ 分。', src: SRC },
  { id: 'blue', name: '藍・生物科技', nameEn: 'Blue: Biotechnology', icon: '🔵', kind: 'count', sign: 1, mult: 1, init: 0, note: '大方塊；符號 T（ods 寫 teal）。結算同上。', src: SRC },
  { id: 'yellow', name: '黃・電力', nameEn: 'Yellow: Power／Electrical', icon: '🌕', kind: 'count', sign: 1, mult: 1, init: 0, note: '大方塊；符號 Y。結算同上。', src: SRC },
  { id: 'ultratech', name: '八角・超科技', nameEn: 'Octagon: Ultratech', icon: '🛑', kind: 'count', sign: 1, mult: 1, init: 0, note: '八角塊；符號 U。結算：每個＝½ 分。', src: SRC },
  { id: 'ship', name: '飛船', nameEn: 'Ships', icon: '🚀', kind: 'count', sign: 1, mult: 1, init: 0, note: '符號 *。出價用；每 3 艘（或小方塊）結算＝½ 分。', src: SRC },
  { id: 'wildSmall', name: '通用小方塊', nameEn: 'Wild small（gray）', icon: '🔘', kind: 'count', sign: 1, mult: 1, init: 0, note: '灰色，只能當小方塊（綠、白、棕）；符號 a。主要是 Unity 與少數物種產出；Zeth 偷不到。', src: SRC },
  { id: 'wildLarge', name: '通用大方塊', nameEn: 'Wild large（gray）', icon: '🔳', kind: 'count', sign: 1, mult: 1, init: 0, note: '灰色，只能當大方塊（黑、藍、黃）；符號 A。主要是 Unity 與少數物種產出；Zeth 偷不到。', src: SRC },
]

// 交易時的相對價值，單位＝小方塊 1 點（大方塊 1.5、八角塊與 1 分各 3）；只是談判參考，不是規則
export const SIDEREAL_CONFLUENCE_TRADE_VALUE: Record<SiderealResKey, number> = {
  green: 1, white: 1, brown: 1, black: 1.5, blue: 1.5, yellow: 1.5, ultratech: 3, ship: 1, wildSmall: 1, wildLarge: 1.5,
}
export const SIDEREAL_CONFLUENCE_VP_VALUE = 3

export type SiderealStart = {
  raw: string
  resources: Partial<Record<SiderealResKey, number>>
  colonies: number
  researchTeams: number
  note?: string
}

// 各物種起始庫存與起始殖民地／研究團隊數（來源：ods Starting Race Card 列，數量由字串逐字元統計）
export const SIDEREAL_CONFLUENCE_START: Record<SiderealSpeciesKey, SiderealStart> = {
  kt: { raw: 'UTYBgggwwbbb', resources: { green: 3, white: 2, brown: 3, black: 1, blue: 1, yellow: 1, ultratech: 1 }, colonies: 1, researchTeams: 1, note: '起始卡沒有飛船。' },
  caylion: { raw: 'BBgggggwwwwbb*', resources: { green: 5, white: 4, brown: 2, black: 2, ship: 1 }, colonies: 1, researchTeams: 0, note: '起始殖民地是「1 Colony with x2」（Race Guide：隨機殖民地並附種子標記）；詳細〔未驗證〕。' },
  kjas: { raw: 'TYYBBgwbb****', resources: { green: 1, white: 1, brown: 2, black: 2, blue: 1, yellow: 2, ship: 4 }, colonies: 2, researchTeams: 0 },
  faderan: { raw: 'UYTwwwb**, NR', resources: { white: 3, brown: 1, blue: 1, yellow: 1, ultratech: 1, ship: 2 }, colonies: 1, researchTeams: 1, note: '義大利文規則書的範例確認這組起始庫存（八角 1、藍 1、黃 1、白 3、棕 1、飛船 2，另有 1 殖民地、1 研究團隊、4 個在場轉換器）；起始卡另標 NR（Syntax：N＝任意世界、R＝遺跡世界），確切意義〔未驗證〕。' },
  imdril: { raw: 'UTBYggwwbbb****', resources: { green: 2, white: 2, brown: 3, black: 1, blue: 1, yellow: 1, ultratech: 1, ship: 4 }, colonies: 0, researchTeams: 1, note: '另有「Starting Fleet Support（給 2 點艦隊支援）」，見 SIDEREAL_CONFLUENCE_EXTRA_ROWS.imdril。' },
  eniet: { raw: 'Tbbwwg*', resources: { green: 1, white: 2, brown: 2, blue: 1, ship: 1 }, colonies: 1, researchTeams: 0 },
  unity: { raw: 'UAAAaaaa', resources: { ultratech: 1, wildSmall: 4, wildLarge: 3 }, colonies: 1, researchTeams: 1 },
  yengii: { raw: 'UTYYBgwb', resources: { green: 1, white: 1, brown: 1, black: 1, blue: 1, yellow: 2, ultratech: 1 }, colonies: 1, researchTeams: 1 },
  zeth: { raw: 'TTYBBgw*', resources: { green: 1, white: 1, black: 2, blue: 2, yellow: 1, ship: 1 }, colonies: 0, researchTeams: 1 },
}

// 物種專屬、可交易或需要追蹤的標記（資料來源是快速複習檔與 Race Guide；數量與規則細節看物種板）
export const SIDEREAL_CONFLUENCE_EXTRA_ROWS: Partial<Record<SiderealSpeciesKey, SiderealResourceRow[]>> = {
  faderan: [
    { id: 'ack', name: '認可標記', nameEn: 'Acknowledgement', icon: '🏅', kind: 'count', sign: 1, mult: 1, init: 0, note: '把標記當交易的一部分送人；非 Faderan 玩家不能再轉手，對方發明科技時歸還 1 個、你得 1 分（官方 Faderan 說明；各人手上數量看物種板）【待核對】', src: '快速複習檔 九個物種速查；Race Guide（Faderan 提示）' },
  ],
  zeth: [
    { id: 'envoy', name: '使節標記', nameEn: 'Envoy', icon: '🎫', kind: 'count', sign: 1, mult: 1, init: 0, note: '可給或交易給別人，讓對方更容易被偷（快速複習檔轉述 Player Aid）【待核對】', src: '快速複習檔 九個物種速查；ods Syntax（Z＝Zeth Envoy）' },
  ],
  imdril: [
    { id: 'fleet', name: '艦隊支援', nameEn: 'Fleet Support', icon: '⚓', kind: 'count', sign: 1, mult: 1, init: 2, note: '跑轉換器要有艦隊支援；起始卡給 2，Race Guide 建議前幾回合湊到 6', src: 'Race Guide（Starting Fleet Support grants 2、湊到 6）；快速複習檔' },
  ],
}

// 取某物種的資源列：基本十種（填入起始數量）＋該物種專屬標記
export function siderealRowsFor(species: SiderealSpeciesKey): SiderealResourceRow[] {
  const start = SIDEREAL_CONFLUENCE_START[species]
  const base = SIDEREAL_CONFLUENCE_RESOURCES.map((r) => ({
    ...r,
    init: start.resources[r.id as SiderealResKey] ?? 0,
  }))
  return [...base, ...(SIDEREAL_CONFLUENCE_EXTRA_ROWS[species] ?? [])]
}
