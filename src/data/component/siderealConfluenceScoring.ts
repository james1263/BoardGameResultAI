// 星河交匯（Sidereal Confluence）終局記分板：給計分表小工具「一鍵加入」用。暫時沒有被任何元件引用。
// 格式：照 scoreSheet.ts 的 SheetRow（kind 'score'），另加資料檔專用欄位 nameEn、phase、note、src；轉成範本時拿掉。
// 來源：2020 官方規則書 第 16 頁（終局計分、精確計分選用規則）、第 10 頁（違約扣分）；官方教學指南 第 1 頁（1 分的大約價值）；
//       Player Aid（玩家整理）、德文／西文玩家輔助（只核對換算與違約罰分，兩者與規則書一致）。經快速複習檔 siderealConfluence.ts 轉述，原文頁碼未逐頁重核〔未驗證〕。
// 這款的分數藏在屏風後面（不可交易），所以記分表主要用在「最後」把屏風後的分數與剩餘資源加起來，以及中途自己記違約扣分。
// 怎麼算：①勝利點（屏風後）②加上剩餘資源：每個八角塊 ½ 分、每 2 個大方塊 ½ 分、每 3 個小方塊和（或）飛船 ½ 分，分數記到 ½ 分 ③減掉違約扣分 ④最高分獲勝，沒有平手判定。
// 本檔的資源列採用規則書的「精確計分」選用規則（八角塊 6/12、大方塊 3/12、小方塊與飛船 2/12 分），因為計分表只有「每個算幾分」，沒有「每幾個才算」；
//   標準算法是小方塊與飛船合併計算、每 3 個才 ½ 分、不足不算，兩者最多差不到 1 分。要照標準算，請用 siderealFinalScore()。
// 「取自資源計數器」：from 的名稱與 siderealConfluenceResources.ts 的資源名稱完全相同（程式用 import 取名稱，不要手打）。
// 沒收什麼：Zeth 偷來的東西、Yengii Jii 的限制標記、Eni Et 利息轉換器產生的分數等「發明或轉換器」產出的分數，都是過程中直接進勝利點，不另列。
// 擴充 Bifurcation：只收 Society of Falling Light 的後悔標記（終局每個 −1 分），見 SIDEREAL_SCORING_EXTRA_ROWS；其他擴充派系的計分差異〔未驗證〕。
// 還沒做：綁定 bgg_name 的官方範本與上傳畫面（官方範本功能還沒做）。

import type { SheetRow } from '../../lib/scoreSheet'
import { SIDEREAL_CONFLUENCE_RESOURCES } from './siderealConfluenceResources'
import type { SiderealResKey } from './siderealConfluenceResources'

export const SIDEREAL_CONFLUENCE_BGG_NAME = 'Sidereal Confluence'

export type SiderealScoringRow = SheetRow & {
  nameEn?: string
  phase: 'game' | 'final'
  note?: string
  src: string
}

function resName(id: SiderealResKey): string {
  const r = SIDEREAL_CONFLUENCE_RESOURCES.find((x) => x.id === id)
  return r ? r.name : id
}

const SRC_END = '2020 官方規則書 第 16 頁（終局計分）'
const SRC_BREACH = '2020 官方規則書 第 10 頁（違約）；德文／西文玩家輔助'

export const SIDEREAL_CONFLUENCE_SCORING: SiderealScoringRow[] = [
  { id: 'vp', name: '勝利點（屏風後）', nameEn: 'Victory points', icon: '⭐', kind: 'score', sign: 1, mult: 1, init: 0, phase: 'final', note: '屏風後面所有分數標記加總；捐贈得到的分數不藏在屏風後，但最後一起算。', src: SRC_END },
  { id: 'octagon', name: '剩餘八角塊', nameEn: 'Octagon (Ultratech)', icon: '🛑', kind: 'score', sign: 1, mult: 0.5, init: 0, from: resName('ultratech'), per: 1, phase: 'final', note: '每個八角塊 ½ 分。', src: SRC_END },
  { id: 'black', name: '剩餘黑方塊（大）', nameEn: 'Black large cube', icon: '⚫', kind: 'score', sign: 1, mult: 0.25, init: 0, from: resName('black'), per: 1, phase: 'final', note: '大方塊每個 3/12 分（標準：每 2 個大方塊 ½ 分，三種顏色與通用大方塊合併計算）。', src: SRC_END },
  { id: 'blue', name: '剩餘藍方塊（大）', nameEn: 'Blue large cube', icon: '🔵', kind: 'score', sign: 1, mult: 0.25, init: 0, from: resName('blue'), per: 1, phase: 'final', src: SRC_END },
  { id: 'yellow', name: '剩餘黃方塊（大）', nameEn: 'Yellow large cube', icon: '🌕', kind: 'score', sign: 1, mult: 0.25, init: 0, from: resName('yellow'), per: 1, phase: 'final', src: SRC_END },
  { id: 'wildLarge', name: '剩餘通用大方塊', nameEn: 'Wild large cube', icon: '🔳', kind: 'score', sign: 1, mult: 0.25, init: 0, from: resName('wildLarge'), per: 1, phase: 'final', src: SRC_END },
  { id: 'green', name: '剩餘綠方塊（小）', nameEn: 'Green small cube', icon: '🍀', kind: 'score', sign: 1, mult: 1 / 6, init: 0, from: resName('green'), per: 1, phase: 'final', note: '小方塊與飛船每個 2/12 分（標準：小方塊與飛船合併計算，每 3 個 ½ 分）。', src: SRC_END },
  { id: 'white', name: '剩餘白方塊（小）', nameEn: 'White small cube', icon: '⚪', kind: 'score', sign: 1, mult: 1 / 6, init: 0, from: resName('white'), per: 1, phase: 'final', src: SRC_END },
  { id: 'brown', name: '剩餘棕方塊（小）', nameEn: 'Brown small cube', icon: '🌰', kind: 'score', sign: 1, mult: 1 / 6, init: 0, from: resName('brown'), per: 1, phase: 'final', src: SRC_END },
  { id: 'wildSmall', name: '剩餘通用小方塊', nameEn: 'Wild small cube', icon: '🔘', kind: 'score', sign: 1, mult: 1 / 6, init: 0, from: resName('wildSmall'), per: 1, phase: 'final', src: SRC_END },
  { id: 'ship', name: '剩餘飛船', nameEn: 'Ships', icon: '🚀', kind: 'score', sign: 1, mult: 1 / 6, init: 0, from: resName('ship'), per: 1, phase: 'final', src: SRC_END },
  { id: 'breachSmall', name: '違約扣分（方塊、飛船）', nameEn: 'Broken deal: cubes / ships', icon: '⚠️', kind: 'score', sign: -1, mult: 1, init: 0, phase: 'game', note: '做不到承諾又談不成補償時，每個沒給出的方塊或飛船扣 1 分；分數可以變負。輸入「沒給出的個數」。', src: SRC_BREACH },
  { id: 'breachBig', name: '違約扣分（卡、八角、分數）', nameEn: 'Broken deal: cards / octagons / VP', icon: '⚠️', kind: 'score', sign: -1, mult: 2, init: 0, phase: 'game', note: '每張沒給出的卡、八角塊或分數扣 2 分。輸入「沒給出的個數」。', src: SRC_BREACH },
]

// 擴充 Bifurcation：Faderan Society of Falling Light 的後悔標記（終局每個 −1 分、不能再轉手）
export const SIDEREAL_SCORING_EXTRA_ROWS: SiderealScoringRow[] = [
  { id: 'regret', name: '後悔標記（Falling Light）', nameEn: 'Regret tokens', icon: '⚠️', kind: 'score', sign: -1, mult: 1, init: 0, phase: 'final', note: '擴充派系 Society of Falling Light：終局每個後悔標記 −1 分。', src: 'Sidereal_Confluence_Factions.pdf（玩家整理，非官方；擴充）〔未驗證〕' },
]

export type SiderealFinalInput = {
  vp: number
  octagons: number
  largeCubes: number // 黑、藍、黃與通用大方塊合計
  smallCubesAndShips: number // 綠、白、棕、通用小方塊與飛船合計
  penalty?: number // 違約扣分合計（正數，會被減掉）
  regret?: number // 後悔標記個數（擴充）
}

// 標準終局算法：八角塊每個 ½、大方塊每 2 個 ½、小方塊與飛船每 3 個 ½（不足不算）；precise＝精確計分選用規則
export function siderealFinalScore(i: SiderealFinalInput): { standard: number; precise: number } {
  const minus = (i.penalty ?? 0) + (i.regret ?? 0)
  const standard =
    i.vp + 0.5 * i.octagons + 0.5 * Math.floor(i.largeCubes / 2) + 0.5 * Math.floor(i.smallCubesAndShips / 3) - minus
  const precise = i.vp + 0.5 * i.octagons + 0.25 * i.largeCubes + (1 / 6) * i.smallCubesAndShips - minus
  return { standard, precise: Math.round(precise * 100) / 100 }
}
