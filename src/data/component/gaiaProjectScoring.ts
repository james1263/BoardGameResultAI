// 蓋亞計畫（Gaia Project）終局計分項目：做成計分表範本的原料。bggName：'Gaia Project'。
// 暫時沒有被任何元件引用；「綁定遊戲、管理者標官方」的畫面還沒做，這個檔先放資料。
//
// 為什麼要有：蓋亞計畫最後有四塊分數要加（分數軌、兩個最終計分板塊、研究、剩餘資源），
// 研究與剩餘資源要自己換算，現場容易算錯或漏項。
//
// 來源（頁碼是各檔自己的印刷頁）：
//   ①基本盒英文規則書 EN_Gaia_rulebook_lo.pdf：終局計分（第 18 頁，內容沿用既有 gaiaProject.ts「終局計分」區塊與 Player Aid）。
//   ②Player Aid（英文＋德文）第 2 頁「FINAL SCORING／ENDWERTUNG」。
//   ③遺失艦隊（The Lost Fleet）英文規則 第 15 頁（3 個新最終計分板塊）、第 12 頁（Automa 的平手規則不收）。
//   ④Gaia_Project_The_Lost_Fleet_-_Scoresheet_x6.png（官方計分表圖片）：列為 Player、Faction、VP track、Final Scoring Tiles（兩列）、
//     Research、Resources、TOTAL，與本檔的 5 個項目一一對應。
// 中文：沿用快速複習 gaiaProject.ts 的用詞；自譯一律【待核對】。
// 格式：照卡表蒐集清單 5.5，欄位對齊 scoreSheet.ts 的 SheetRow（kind 'score'、sign、mult、init 0）。
//   nameEn、phase、note、src 是資料檔專用欄位，轉成範本時要拿掉。
// 限制（計分表目前只有「每個算幾分」，沒有條件式計分）：
//   「名次分」「研究」「剩餘資源」都要玩家先自己換算，再輸入；換算方法寫在 note。
//   剩餘資源要「信用點、知識、礦石合起來每 3 個 1 分」，計分表的「取自資源計數器」是逐種資源換算（各自捨去），
//   和規則不同，所以這一項不設 from／per，請玩家輸入換算後的分數。
// 沒收：Automa 單人計分；回合計分板塊（過程中已加進分數軌）、助推器放棄分、聯邦標記分（都已在分數軌上）；
//   遺失艦隊的 Automa 難度起始分。
// 不一致：沒有發現。官方計分表圖片只有 Final Scoring Tiles 兩列，沒有把研究拆成領域，所以研究只用一列。
// 圖示：全部在 scoreSheet.ts 的 ICONS（Emoji 11 以前）。

export type GaiaScoringRow = {
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

export const GAIA_SCORING_ROWS: GaiaScoringRow[] = [
  {
    id: 'vp-track',
    name: '分數軌上的分數',
    nameEn: 'VP track',
    icon: '⭐',
    kind: 'score',
    sign: 1,
    mult: 1,
    init: 0,
    phase: 'during',
    note: '最終計分之前，分數標記停在分數軌的數字（起始 10 分；回合計分板塊、助推器放棄分、聯邦標記、科技等都已經加在裡面）。超過 100 分要記得加 100。',
    src: '官方計分表圖片（VP track）',
  },
  {
    id: 'final-tile-a',
    name: '最終計分板塊 A 名次分',
    nameEn: 'Final Scoring Tile 1',
    icon: '🏆',
    kind: 'score',
    sign: 1,
    mult: 1,
    init: 0,
    phase: 'final',
    note: '看第一個最終計分板塊的進度條：第 1 名 18 分、第 2 名 12 分、第 3 名 6 分、第 4 名 0 分，直接輸入你拿到的分數。平手時，每個平手的人各加上剩餘最高名次的分數後平分（例：兩人並列第 1 → 18＋12＝30，各 15）。1～2 人遊戲要把中立玩家的衛星也算進排名。',
    src: '規則書 第 7、18 頁；Player Aid 第 2 頁',
  },
  {
    id: 'final-tile-b',
    name: '最終計分板塊 B 名次分',
    nameEn: 'Final Scoring Tile 2',
    icon: '🥇',
    kind: 'score',
    sign: 1,
    mult: 1,
    init: 0,
    phase: 'final',
    note: '同上，看第二個最終計分板塊。兩個板塊各算各的。',
    src: '規則書 第 7、18 頁；Player Aid 第 2 頁',
  },
  {
    id: 'research',
    name: '研究（3 級起每級 4 分）',
    nameEn: 'Research',
    icon: '🧪',
    kind: 'score',
    sign: 1,
    mult: 4,
    init: 0,
    phase: 'final',
    note: '輸入的數字＝六個研究領域各自「超過 2 級的級數」加總：3 級算 1、4 級算 2、5 級算 3，2 級以下算 0。例：一個領域到 5 級（4＋4＋4＝12 分）就是輸入 3。每級 4 分由表格自己乘。',
    src: '規則書 第 18 頁；Player Aid 第 2 頁',
  },
  {
    id: 'resources',
    name: '剩餘資源（每 3 個 1 分）',
    nameEn: 'Resources',
    icon: '💰',
    kind: 'score',
    sign: 1,
    mult: 1,
    init: 0,
    phase: 'final',
    note: '把手上的信用點、知識、礦石加起來（任意組合），除以 3 無條件捨去，輸入結果（例：12 信用點＋5 知識＋2 礦石＝19 個 → 6 分）。QIC 與能量不算分。',
    src: '規則書 第 18 頁；Player Aid 第 2 頁',
  },
]

// 最終計分板塊一覽：每局從裡面隨機放 2 個，用來確認「這局比什麼」。
export type GaiaFinalTile = {
  id: string
  set: 'base' | 'lostFleet'
  nameEn: string
  name: string
  rule: string
  src: string
}

export const GAIA_FINAL_TILES: GaiaFinalTile[] = [
  { id: 'ft-federation-buildings', set: 'base', nameEn: 'Buildings in a federation', name: '聯邦中的建築最多', rule: '比聯邦裡的建築數（失落星球的礦產基地算）。', src: '規則書 第 18 頁（快速複習）' },
  { id: 'ft-buildings', set: 'base', nameEn: 'Buildings', name: '建築總數最多', rule: '比場上建築總數（失落星球算）。', src: '規則書 第 18 頁（快速複習）' },
  { id: 'ft-planet-types', set: 'base', nameEn: 'Planet types', name: '登陸的星球類型最多', rule: '比已登陸的星球類型數（含蓋亞星球與失落星球）。', src: '規則書 第 18 頁（快速複習）' },
  { id: 'ft-gaia-planets', set: 'base', nameEn: 'Gaia planets', name: '登陸的蓋亞星球最多', rule: '比已登陸的蓋亞星球數。', src: '規則書 第 18 頁（快速複習）' },
  { id: 'ft-sectors', set: 'base', nameEn: 'Sectors', name: '登陸的星域最多', rule: '比有你登陸星球的星域數（含失落星球）。', src: '規則書 第 18 頁（快速複習）' },
  { id: 'ft-satellites', set: 'base', nameEn: 'Satellites', name: '蓋的衛星最多', rule: '比場上衛星數（蜂人的空間站算衛星）。', src: '規則書 第 18 頁（快速複習）' },
  { id: 'lf-ft-asteroids', set: 'lostFleet', nameEn: 'Most asteroids colonized', name: '登陸的小行星最多', rule: '比已登陸的小行星數；場上至少要有 6 個小行星，不夠要翻轉深空星域板塊 16（2 人設置）。', src: '遺失艦隊規則 第 4、15 頁' },
  { id: 'lf-ft-distance', set: 'lostFleet', nameEn: 'Longest distance PI to Academy', name: '星際要塞到大學院距離最長', rule: '比你的星際要塞到你其中一座大學院的航行距離；沒蓋這兩種建築就不得分。', src: '遺失艦隊規則 第 15 頁' },
  { id: 'lf-ft-deep-space', set: 'lostFleet', nameEn: 'Most Deep Space sectors', name: '登陸的深空星域最多', rule: '比有你登陸至少 1 顆星球的深空星域數；失落星球算已登陸。', src: '遺失艦隊規則 第 15 頁' },
]

// 名次分：第 1～4 名
export const GAIA_RANK_POINTS: number[] = [18, 12, 6, 0]
