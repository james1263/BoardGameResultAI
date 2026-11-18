// 「BGG 討論・非官方 FAQ」的登記表（key＝資料庫裡的 bggName）。
// 這些內容不是官方 FAQ：是玩家整理的設計師回覆或討論串結論，用自己的話摘要並附來源。
// 網頁（GameFaq.tsx）與規則助手（faqSearch.ts）都從這裡讀，新增一款只要在這裡登記一次。
// 資料與官方規則衝突時，以規則書與官方 FAQ 為準。

import type { GameFaqData } from './types'
import { SHACKLETON_BASE_UNOFFICIAL_FAQ } from './unofficial/shackletonBase'

export const UNOFFICIAL_FAQ_BY_GAME: Record<string, GameFaqData> = {
  'Shackleton Base: A Journey to the Moon': SHACKLETON_BASE_UNOFFICIAL_FAQ,
  // 待搬進來：卓爾金曆（Tzolk'in）、帕米爾和平（Pax Pamir）等已有的非官方整理
}

export function getUnofficialFaq(bggName: string): GameFaqData | null {
  return UNOFFICIAL_FAQ_BY_GAME[bggName] ?? null
}
