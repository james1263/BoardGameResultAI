// 蓋亞計畫（Gaia Project）公開資源預設值：做成資源計數器範本的原料。bggName：'Gaia Project'。
// 暫時沒有被任何元件引用；「綁定遊戲、管理者標官方」與「一鍵加入資源」的畫面還沒做，這個檔先放資料。
//
// 為什麼要有：知道對手手上有幾個礦石、知識、QIC，以及能量循環各區域有幾顆，才看得出對方這回合做得起哪些行動
// （例如能不能開蓋亞計劃、能不能補充能量）；蓋亞計畫的資源都擺在桌面上，這份資料就是把它們一鍵列出來。
//
// 來源：
//   ①既有的 gaiaProjectCards.ts：各種族的起始能量、礦石、信用點、知識、QIC（原始來源是 Gaia Project Faction Summary V3.0，玩家整理）。
//   ②基本盒英文規則書 第 9、10 頁（能量循環、資源上限；內容沿用快速複習 gaiaProject.ts）。
// 用詞：沿用快速複習 gaiaProject.ts（礦石、信用點、知識、QIC、能量、區域 I／II／III、蓋亞區）。
// 格式：照卡表蒐集清單 3 與 5.5，欄位對齊 scoreSheet.ts 的 SheetRow（kind 'count'、sign 1、mult 1、init＝起始數量）。
//   nameEn、note、src 是資料檔專用欄位，轉成範本時要拿掉。
// 限制（計分表資料庫與前端會擋）：每份最多 30 列、name 1～20 字、icon ≤12 字元且限 Emoji 11（2018）以前、init 0～9999、同份內名稱不可重複。
// 沒收：
//   分數（VP）：計分表處理，見 gaiaProjectScoring.ts。
//   蓋亞改造機數量、衛星、建築：要看版圖與種族面板，資源計數器記數量意義不大。
//   4 個遺失艦隊新種族的起始資源：上傳的檔案沒有（要看實物種族面板），所以 gaiaResourceRows 傳它們的 id 時只回標準值，畫面接上時要提醒「新種族起始值請對照實物面板」。
//   Tinkeroids／Moweyds／Space Giants／Darkanians 的特殊資源（能量環、改造板塊）：不是可計數的資源。
// 不一致：沒有發現。起始資源與收入的來源是玩家整理的摘要表，沒對照實物種族面板〔未驗證〕。
// 圖示：全部 Emoji 11 以前；礦石、知識、QIC 的顏色符號對應規則書的白色、藍色、綠色方塊。

import { GAIA_FACTIONS, GAIA_STANDARD } from './gaiaProjectCards'

export type GaiaResourceRow = {
  id: string
  name: string
  nameEn: string
  icon: string
  kind: 'count'
  sign: 1
  mult: 1
  // 標準起始數量（標準種族面板）；各種族不同的用 gaiaResourceRows(factionId) 取
  init: number
  note: string
  src: string
}

export const GAIA_RESOURCE_ROWS: GaiaResourceRow[] = [
  {
    id: 'credit',
    name: '信用點',
    nameEn: 'Credits',
    icon: '💰',
    kind: 'count',
    sign: 1,
    mult: 1,
    init: GAIA_STANDARD.start.credit,
    note: '信用點最多 30 個。',
    src: '規則書 第 10 頁；摘要表 V3.0 第 1 頁',
  },
  {
    id: 'ore',
    name: '礦石',
    nameEn: 'Ore',
    icon: '⛏️',
    kind: 'count',
    sign: 1,
    mult: 1,
    init: GAIA_STANDARD.start.ore,
    note: '礦石最多 15 個（白色方塊）。',
    src: '規則書 第 10 頁；摘要表 V3.0 第 1 頁',
  },
  {
    id: 'knowledge',
    name: '知識',
    nameEn: 'Knowledge',
    icon: '💡',
    kind: 'count',
    sign: 1,
    mult: 1,
    init: GAIA_STANDARD.start.knowledge,
    note: '知識最多 15 個（藍色方塊）。',
    src: '規則書 第 10 頁；摘要表 V3.0 第 1 頁',
  },
  {
    id: 'qic',
    name: 'QIC',
    nameEn: 'Q.I.C.',
    icon: '💚',
    kind: 'count',
    sign: 1,
    mult: 1,
    init: GAIA_STANDARD.start.qic,
    note: '量子智能方塊（綠色方塊）；用來增加航行距離、讓蓋亞星球宜居。',
    src: '規則書 第 10、11 頁；摘要表 V3.0 第 1 頁',
  },
  {
    id: 'power1',
    name: '能量 區域 I',
    nameEn: 'Power area I',
    icon: '⚡',
    kind: 'count',
    sign: 1,
    mult: 1,
    init: GAIA_STANDARD.start.power1,
    note: '補充能量時先從區域 I 移到區域 II。',
    src: '規則書 第 9 頁；摘要表 V3.0 第 1 頁',
  },
  {
    id: 'power2',
    name: '能量 區域 II',
    nameEn: 'Power area II',
    icon: '⚡',
    kind: 'count',
    sign: 1,
    mult: 1,
    init: GAIA_STANDARD.start.power2,
    note: '區域 I 空了，才從區域 II 移到區域 III。',
    src: '規則書 第 9 頁；摘要表 V3.0 第 1 頁',
  },
  {
    id: 'power3',
    name: '能量 區域 III',
    nameEn: 'Power area III',
    icon: '🔋',
    kind: 'count',
    sign: 1,
    mult: 1,
    init: 0,
    note: '只有區域 III 的標記可以支付；支付後移到區域 I。起始都是 0 顆。',
    src: '規則書 第 9 頁',
  },
  {
    id: 'power-gaia',
    name: '能量 蓋亞區',
    nameEn: 'Gaia area',
    icon: '🌍',
    kind: 'count',
    sign: 1,
    mult: 1,
    init: 0,
    note: '開始蓋亞計劃時把能量「移動」到蓋亞區，下個蓋亞階段回到區域 I（人類回到區域 II）。起始 0 顆。',
    src: '規則書 第 9、10、12 頁',
  },
]

// 利爪族（Taklons）的智能石：算 1 個能量標記，支付時可當 3 能量，起始放在區域 I。
// 資源計數器只能記數量、記不了「現在在哪個區域」，位置請看實物。
export const GAIA_BRAINSTONE_ROW: GaiaResourceRow = {
  id: 'brainstone',
  name: '智能石（利爪族）',
  nameEn: 'Brainstone',
  icon: '💎',
  kind: 'count',
  sign: 1,
  mult: 1,
  init: 1,
  note: '智能石算 1 個能量標記，支付時可當 3 能量。數量永遠是 1；它現在在哪個能量區域要看實物，所以這一列主要是提醒對手有這顆石頭。',
  src: '規則書 第 20 頁',
}

// 依種族取起始數量：傳種族 id（gaiaProjectCards.ts 的 GAIA_FACTIONS）。
// 沒傳或找不到、或是沒有起始資料的新種族（遺失艦隊 4 個），回標準值。利爪族會多一列智能石。
export function gaiaResourceRows(factionId?: string): GaiaResourceRow[] {
  const f = GAIA_FACTIONS.find((x) => x.id === factionId)
  const s = f?.start
  const rows = GAIA_RESOURCE_ROWS.map((r): GaiaResourceRow => {
    if (!s) return { ...r }
    switch (r.id) {
      case 'credit':
        return { ...r, init: s.credit }
      case 'ore':
        return { ...r, init: s.ore }
      case 'knowledge':
        return { ...r, init: s.knowledge }
      case 'qic':
        return { ...r, init: s.qic }
      case 'power1':
        return { ...r, init: s.power1 }
      case 'power2':
        return { ...r, init: s.power2 }
      default:
        return { ...r }
    }
  })
  if (s?.brainstone) rows.push({ ...GAIA_BRAINSTONE_ROW })
  return rows
}
