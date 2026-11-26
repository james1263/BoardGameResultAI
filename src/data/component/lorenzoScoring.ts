// 偉大的羅倫佐（Lorenzo il Magnifico）終局計分項目：做成計分表範本的原料。bggName：'Lorenzo il Magnifico: Big Box'。
// 暫時沒有被任何元件引用；「綁定遊戲、管理者標官方」的畫面還沒做，這個檔先放資料。
//
// 為什麼要有：這款最後要加領地、角色、投資、軍事、資源，還要先扣掉第三時期逐出教會的懲罰；
// 領地與角色是「張數對照分數」（3 張 1 分、4 張 4 分……），現場容易看錯格。
//
// 來源：快速複習 lorenzo.ts「最終計分」（英文規則書第 11 頁）；Lorenzo_Il_Magnifico_-_Scoresheets_x6.png（官方計分表圖片）；
//   荷蘭文參考手冊 第 20～22 頁（逐出教會與 Medici 家族）。
// 官方計分表圖片的列（由上到下）：玩家、城堡（紅底）、十字架（白底）、金色勝利點徽章、
//   三列「箭頭入」＋綠／藍／紫發展卡（領地、角色、投資）、箭頭入＋盾劍（軍事）、「5 個資源→1 分」、Σ 總分。
//   城堡與十字架兩列的用途我無法從圖片判斷（可能是分數軌百位與信仰相關），所以沒收這兩列，只留金色徽章列＝分數軌〔未驗證〕。
//   官方表上沒有黃色（建築）那一列：建築沒有終局分數，與規則一致。
// 中文：沿用快速複習 lorenzo.ts 的用詞；自譯一律【待核對】。
// 格式：照卡表蒐集清單 5.5，欄位對齊 scoreSheet.ts 的 SheetRow（kind 'score'、sign、mult、init 0）。
//   nameEn、phase、note、src 是資料檔專用欄位，轉成範本時要拿掉。
// 限制（計分表目前只有「每個算幾分」，沒有條件式計分）：
//   領地、角色、軍事名次要玩家先用下面的對照換算再輸入（檔尾有三個換算函式與對照表）；
//   資源是「木石元僕人合計除以 5 無條件捨去」，計分表的「取自資源計數器」是逐種資源換算（各自捨去），和規則不同，所以這一項不設 from／per。
// 沒收：第三時期逐出教會的各種懲罰（除了列成一項讓玩家輸入扣分）；領袖卡與家族板塊的終局效果（Medici 28／36 分已含在角色項目）；
//   擴充投資卡「依數量計分」的換算（#071、#133～#135、#164、#166 等，卡上有寫，玩家自己算進投資那一列）。
// 不一致：沒有發現。
// 圖示：全部 Emoji 11 以前。

export type LorenzoScoringRow = {
  id: string
  name: string
  nameEn: string
  icon: string
  kind: 'score'
  sign: 1 | -1
  mult: number
  init: number
  // during＝過程中累積在分數軌上；final＝遊戲結束後才算
  phase: 'during' | 'final'
  note: string
  src: string
}

export const LORENZO_SCORING_ROWS: LorenzoScoringRow[] = [
  {
    id: 'vp-track',
    name: '分數軌上的分數',
    nameEn: 'Victory Points track',
    icon: '⭐',
    kind: 'score',
    sign: 1,
    mult: 1,
    init: 0,
    phase: 'during',
    note: '最終計分之前，分數標記停在分數軌的數字（發展卡、領袖、梵諦岡支持、行動區獲得的分都已經加在裡面）。',
    src: '官方計分表圖片（金色勝利點徽章列）；快速複習 lorenzo.ts',
  },
  {
    id: 'territory',
    name: '領地（3／4／5／6 張 → 1／4／10／20 分）',
    nameEn: 'Territory Cards',
    icon: '🌲',
    kind: 'score',
    sign: 1,
    mult: 1,
    init: 0,
    phase: 'final',
    note: '個人圖板上的領地（綠）：3 張 1 分、4 張 4 分、5 張 10 分、6 張 20 分，2 張以下 0 分。輸入換算後的分數（也可用 lorenzoTerritoryPoints(張數)）。',
    src: '英文規則書 第 11 頁；官方計分表圖片（綠色箭頭入列）',
  },
  {
    id: 'character',
    name: '角色（1～6 張 → 1／3／6／10／15／21 分）',
    nameEn: 'Character Cards',
    icon: '👤',
    kind: 'score',
    sign: 1,
    mult: 1,
    init: 0,
    phase: 'final',
    note: '個人圖板旁的角色（藍）：1 張 1 分、2 張 3 分、3 張 6 分、4 張 10 分、5 張 15 分、6 張 21 分。擴充 Medici 家族可到 8 張：7 張 28 分、8 張 36 分。輸入換算後的分數（也可用 lorenzoCharacterPoints(張數, 是否Medici)）。',
    src: '英文規則書 第 11 頁；荷蘭文手冊 第 22 頁（Medici）；官方計分表圖片（藍色箭頭入列）',
  },
  {
    id: 'venture',
    name: '投資（每張卡上的分數加總）',
    nameEn: 'Venture Cards',
    icon: '💎',
    kind: 'score',
    sign: 1,
    mult: 1,
    init: 0,
    phase: 'final',
    note: '個人圖板旁每張投資卡（紫）上標示的終局分數加總。擴充的「依特殊標記、僕人、木石組數、領袖張數計分」的卡，要先自己換算（卡上有寫上限，例如最多 12 分）再算進來。',
    src: '英文規則書 第 11 頁；荷蘭文手冊 第 8～9、12～13、15 頁；官方計分表圖片（紫色箭頭入列）',
  },
  {
    id: 'military',
    name: '軍事名次（第 1 名 5 分、第 2 名 2 分）',
    nameEn: 'Military track ranking',
    icon: '⚔️',
    kind: 'score',
    sign: 1,
    mult: 1,
    init: 0,
    phase: 'final',
    note: '看軍事軌的名次：第 1 名 5 分、第 2 名 2 分。第 1 名平手：平手者都得 5 分，沒人得 2 分；第 2 名平手：平手者都得 2 分。輸入你拿到的分數（也可用 lorenzoMilitaryPoints(名次, 第1名是否平手)）。',
    src: '英文規則書 第 11 頁；官方計分表圖片（盾劍箭頭入列）',
  },
  {
    id: 'resources',
    name: '剩餘資源（每 5 個 1 分）',
    nameEn: 'Resources',
    icon: '💰',
    kind: 'score',
    sign: 1,
    mult: 1,
    init: 0,
    phase: 'final',
    note: '把木、石、元、僕人（四種全部）加總，除以 5 無條件捨去，輸入結果（例：2 木＋3 石＋9 元＋4 僕人＝18 個 → 3 分）。軍事與信仰不算。擴充的特殊標記本身不值分，終局前要先捨棄換成獎勵。',
    src: '英文規則書 第 11 頁；官方計分表圖片（「5 個資源→1 分」列）',
  },
  {
    id: 'excomm-penalty',
    name: '逐出教會扣分（第三時期等）',
    nameEn: 'Excommunication penalties',
    icon: '✝️',
    kind: 'score',
    sign: -1,
    mult: 1,
    init: 0,
    phase: 'final',
    note: '輸入被扣的分數（一個正數，表格會自己扣）。第三時期被逐出教會才會有：①終局計分前每 5 分扣 1 分；②每 1 點軍事點數扣 1 分；③每 1 個建築卡費用中的木或石扣 1 分；④個人供應區每 1 個資源扣 1 分；⑤每種發展卡超過第 4 張每張扣 5 分（擴充）。（另有「不計角色／投資／領地分」的三塊，直接把那一項改成 0 即可。）Della Rovere 家族每被逐出教會一次扣 5 分，要另外加進來。',
    src: '荷蘭文手冊 第 20～22 頁；快速複習 lorenzo.ts「逐出教會板塊」',
  },
]

// ── 換算對照（供玩家輸入前換算用；表格本身只認每個算幾分）──
export const LORENZO_TERRITORY_POINTS: number[] = [0, 0, 0, 1, 4, 10, 20] // 索引＝領地張數 0～6
export const LORENZO_CHARACTER_POINTS: number[] = [0, 1, 3, 6, 10, 15, 21] // 索引＝角色張數 0～6
export const LORENZO_MEDICI_CHARACTER_POINTS: Record<number, number> = { 7: 28, 8: 36 } // Medici 家族（擴充）
export const LORENZO_MILITARY_POINTS = { first: 5, second: 2 }

export function lorenzoTerritoryPoints(count: number): number {
  const n = Math.max(0, Math.min(6, Math.floor(count)))
  return LORENZO_TERRITORY_POINTS[n]
}

export function lorenzoCharacterPoints(count: number, medici = false): number {
  const c = Math.max(0, Math.floor(count))
  if (medici && c >= 7) return LORENZO_MEDICI_CHARACTER_POINTS[Math.min(8, c)]
  return LORENZO_CHARACTER_POINTS[Math.min(6, c)]
}

// rank：1 或 2（其餘 0）；firstTied：第 1 名是否平手（平手時第 2 名沒有分）
export function lorenzoMilitaryPoints(rank: number, firstTied = false): number {
  if (rank === 1) return LORENZO_MILITARY_POINTS.first
  if (rank === 2 && !firstTied) return LORENZO_MILITARY_POINTS.second
  return 0
}

// 剩餘資源：木、石、元、僕人合計每 5 個 1 分，不足的捨去
export function lorenzoResourcePoints(wood: number, stone: number, coin: number, servant: number): number {
  return Math.floor((Math.max(0, wood) + Math.max(0, stone) + Math.max(0, coin) + Math.max(0, servant)) / 5)
}
