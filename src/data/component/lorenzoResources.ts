// 偉大的羅倫佐（Lorenzo il Magnifico）公開資源預設值：做成資源計數器範本的原料。bggName：'Lorenzo il Magnifico: Big Box'。
// 暫時沒有被任何元件引用；「綁定遊戲、管理者標官方」與「一鍵加入資源」的畫面還沒做，這個檔先放資料。
//
// 為什麼要有：這款的資源都放在個人圖板上，對手看得到，但算起來很花力氣。知道對手手上有幾個僕人、幾元、軍事與信仰點數，
// 才看得出他這輪能不能把家族成員放到高點數的行動區、能不能打出領袖（領袖需求是「打出當下擁有」）、
// 能不能付得起 3 元去擠你的塔，也才能幫大家卡位、提高互動（使用者 2026-11-26 提出的情境）。
//
// 來源：快速複習 lorenzo.ts（開局資源、起始錢、擴充開局、資源軌）；英文規則書第 3、16 頁（沿用快速複習的整理）。
// 用詞：沿用快速複習 lorenzo.ts（木、石、元、僕人、軍事點數、信仰點數、分、特殊標記）。計分表的「取自資源計數器」是用名稱完全比對，名稱改了要一起改。
// 格式：照卡表蒐集清單 3，欄位對齊 scoreSheet.ts 的 SheetRow（kind 'count'、sign 1、mult 1、init＝起始數量）。
//   nameEn、note、src 是資料檔專用欄位，轉成範本時要拿掉。
// 限制（計分表資料庫與前端會擋）：每份最多 30 列、name 1～20 字、icon ≤12 字元且限 Emoji 11（2018）以前、init 0～9999、同份內名稱不可重複。
// 圖示：全部 Emoji 11 以前；是否都在 scoreSheet.ts 的 ICONS 內我沒核對〔未驗證〕，不在內也能用（「自己輸入」）。
// 沒收：發展卡、領袖卡、家族板塊（見 lorenzoCards.ts）；回合順位、高塔位置（版圖上看得到）。
// 起始資源：
//   基本版：每人 2 木、2 石、3 僕人；起始錢依回合順位 5／6／7／8 元（第一至第四位，不論人數）；軍事、信仰、分數軌都從 0 開始。
//   Houses of Renaissance（5 人局）：玩家不拿木與石，起始錢依回合順位 0／1／2／3／4；僕人是否照基本版發 3 個書上沒寫，先照 3 個【待核對】。
// 不一致：沒有發現；僕人的部分見上。
// 提醒：軍事與信仰是「軌道上的位置」，不是可花掉的資源——領地的軍事需求只要「有」、投資的軍事費用才會扣（要先有兩倍門檻）；
//   梵諦岡發言時選擇「支持教會」會把信仰歸零退回第 1 格。資源計數器只記數字，這些規則要看快速複習。

export type LorenzoResourceRow = {
  id: string
  name: string
  nameEn: string
  icon: string
  kind: 'count'
  sign: 1
  mult: 1
  init: number // 基本版標準起始數量（起始錢以回合順位第一位的 5 為準，見 lorenzoResourceRows）
  note: string
  src: string
}

const SRC = '快速複習 lorenzo.ts「設置」；英文規則書 第 3 頁'
const SRC_X = '快速複習 lorenzo.ts「擴充：Houses of Renaissance 設置與新規則」；擴充 第 16 頁'

export const LORENZO_RESOURCE_ROWS: LorenzoResourceRow[] = [
  { id: 'wood', name: '木', nameEn: 'Wood', icon: '🌲', kind: 'count', sign: 1, mult: 1, init: 2, note: '建築與部分投資的費用；擴充 Houses 5 人局開局沒有。', src: SRC },
  { id: 'stone', name: '石', nameEn: 'Stone', icon: '⛰️', kind: 'count', sign: 1, mult: 1, init: 2, note: '建築與部分投資的費用；擴充 Houses 5 人局開局沒有。', src: SRC },
  { id: 'coin', name: '元', nameEn: 'Coins', icon: '💰', kind: 'count', sign: 1, mult: 1, init: 5, note: '起始錢依回合順位：第 1 位 5、第 2 位 6、第 3 位 7、第 4 位 8；被佔據的高塔要先付 3 元；角色的費用只付元。', src: SRC },
  { id: 'servant', name: '僕人', nameEn: 'Servants', icon: '👤', kind: 'count', sign: 1, mult: 1, init: 3, note: '放置前可 1:1 增加家族成員點數，次數不限；有些卡片費用也要付僕人。', src: SRC },
  { id: 'military', name: '軍事點數', nameEn: 'Military Points', icon: '⚔️', kind: 'count', sign: 1, mult: 1, init: 0, note: '領地要「有」足夠的軍事點數才能放進個人圖板（不用扣）；投資的軍事費用要「付」（先要有兩倍門檻）；終局軍事軌第 1 名 5 分、第 2 名 2 分。', src: SRC },
  { id: 'faith', name: '信仰點數', nameEn: 'Faith Points', icon: '✝️', kind: 'count', sign: 1, mult: 1, init: 0, note: '梵諦岡發言（第 2、4、6 輪）第 1／2／3 時期要達到 3／4／5 點才能支持教會；支持後歸零。', src: SRC },
  { id: 'vp', name: '分數', nameEn: 'Victory Points', icon: '⭐', kind: 'count', sign: 1, mult: 1, init: 0, note: '分數軌上的位置；終局計分見 lorenzoScoring.ts。', src: SRC },
]

// 擴充 Houses of Renaissance：特殊標記（當作一種資源；可以看，但不用給別人看，所以是否要公開記錄由玩家決定）
export const LORENZO_TOKEN_ROW: LorenzoResourceRow = {
  id: 'token',
  name: '特殊標記',
  nameEn: 'Special Tokens',
  icon: '🎟️',
  kind: 'count',
  sign: 1,
  mult: 1,
  init: 0,
  note: '擴充 Houses of Renaissance 才有；你的回合中可捨棄換成標記上的獎勵，也可當議會特權的選項。標記面朝下、對手看不到背面，這一列只記「手上有幾個」，不記是哪種。放在發展卡上的不算在手上。',
  src: SRC_X,
}

export type LorenzoResourceOptions = {
  // 回合順位（1～5）；不傳則用第 1 位的起始錢
  order?: 1 | 2 | 3 | 4 | 5
  // 有玩擴充 Houses of Renaissance（5 人局規則：不拿木與石、起始錢 0／1／2／3／4；加特殊標記一列）
  houses?: boolean
  // 只有擴充特殊標記、沒有 5 人局時（4 人以下加玩擴充）：加特殊標記一列，但起始木石與錢照基本版
  tokens?: boolean
}

// 回傳這位玩家的起始資源列。基本版：錢 5／6／7／8（依順位）；houses＝true：木石 0、錢 0／1／2／3／4。
// houses 擴充的 4 人以下起始錢是否也這樣算，書上只寫 5 人局的表，這裡照書上的 16 頁寫法（houses＝true 時套用）；實際對照規則書第 16 頁【待核對】。
export function lorenzoResourceRows(opts: LorenzoResourceOptions = {}): LorenzoResourceRow[] {
  const order = opts.order ?? 1
  const houses = !!opts.houses
  const baseCoin = [5, 6, 7, 8]
  const housesCoin = [0, 1, 2, 3, 4]
  const rows = LORENZO_RESOURCE_ROWS.map((r): LorenzoResourceRow => {
    if (r.id === 'coin') {
      const init = houses ? housesCoin[order - 1] ?? 0 : baseCoin[order - 1] ?? 5
      return { ...r, init, src: houses ? SRC_X : r.src }
    }
    if ((r.id === 'wood' || r.id === 'stone') && houses) return { ...r, init: 0, src: SRC_X }
    return { ...r }
  })
  if (houses || opts.tokens) rows.push({ ...LORENZO_TOKEN_ROW })
  return rows
}
